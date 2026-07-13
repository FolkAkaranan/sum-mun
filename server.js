const { createServer } = require("http");
const { randomUUID } = require("crypto");
const next = require("next");
const { Server } = require("socket.io");
const presets = require("./src/lib/presets.json");

const dev = process.env.NODE_ENV !== "production";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

/** @type {Map<string, RoomState>} */
const rooms = new Map();

const TD_CATEGORIES = ["friend", "lover", "party"];

function withIds(list) {
  return list.map((text) => ({ id: randomUUID(), text }));
}

function createRoomState() {
  const topicCategories = {};
  for (const [name, items] of Object.entries(presets.topics)) {
    topicCategories[name] = withIds(items);
  }

  const tdCategories = {};
  for (const cat of TD_CATEGORIES) {
    tdCategories[cat] = {
      truth: withIds(presets.truthOrDare[cat].truth),
      dare: withIds(presets.truthOrDare[cat].dare),
    };
  }

  return {
    lottery: { items: [], pending: null },
    topic: {
      activeCategory: Object.keys(topicCategories)[0],
      categories: topicCategories,
      lastDrawn: null,
    },
    td: {
      activeCategory: "friend",
      categories: tdCategories,
      lastDrawn: null,
    },
  };
}

function getRoom(roomId) {
  let room = rooms.get(roomId);
  if (!room) {
    room = createRoomState();
    rooms.set(roomId, room);
  }
  return room;
}

function pickRandom(list) {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => handle(req, res));
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    let currentRoomId = null;

    function broadcastState() {
      io.to(currentRoomId).emit("room:state", getRoom(currentRoomId));
    }

    socket.on("room:join", (roomId) => {
      if (typeof roomId !== "string" || !roomId.trim()) return;
      currentRoomId = roomId;
      socket.join(roomId);
      socket.emit("room:state", getRoom(roomId));
    });

    // ----- lottery -----
    socket.on("lottery:add", (text) => {
      if (!currentRoomId || typeof text !== "string" || !text.trim()) return;
      const room = getRoom(currentRoomId);
      room.lottery.items.push({ id: randomUUID(), text: text.trim() });
      broadcastState();
    });

    socket.on("lottery:remove", (id) => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      room.lottery.items = room.lottery.items.filter((i) => i.id !== id);
      broadcastState();
    });

    socket.on("lottery:draw", () => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      if (room.lottery.pending) return;
      const drawn = pickRandom(room.lottery.items);
      if (!drawn) return;
      room.lottery.items = room.lottery.items.filter((i) => i.id !== drawn.id);
      room.lottery.pending = drawn;
      broadcastState();
    });

    socket.on("lottery:resolve", (action) => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      if (!room.lottery.pending) return;
      if (action === "keep") {
        room.lottery.items.push(room.lottery.pending);
      }
      room.lottery.pending = null;
      broadcastState();
    });

    // ----- topic -----
    socket.on("topic:setCategory", (category) => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      if (!room.topic.categories[category]) return;
      room.topic.activeCategory = category;
      room.topic.lastDrawn = null;
      broadcastState();
    });

    socket.on("topic:add", ({ category, text }) => {
      if (!currentRoomId || !text?.trim()) return;
      const room = getRoom(currentRoomId);
      if (!room.topic.categories[category]) return;
      room.topic.categories[category].push({ id: randomUUID(), text: text.trim() });
      broadcastState();
    });

    socket.on("topic:remove", ({ category, id }) => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      if (!room.topic.categories[category]) return;
      room.topic.categories[category] = room.topic.categories[category].filter(
        (i) => i.id !== id
      );
      broadcastState();
    });

    socket.on("topic:draw", () => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      const list = room.topic.categories[room.topic.activeCategory];
      const drawn = pickRandom(list || []);
      if (!drawn) return;
      room.topic.lastDrawn = drawn;
      broadcastState();
    });

    socket.on("topic:clear", () => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      room.topic.lastDrawn = null;
      broadcastState();
    });

    // ----- truth or dare -----
    socket.on("td:setCategory", (category) => {
      if (!currentRoomId || !TD_CATEGORIES.includes(category)) return;
      const room = getRoom(currentRoomId);
      room.td.activeCategory = category;
      room.td.lastDrawn = null;
      broadcastState();
    });

    socket.on("td:add", ({ category, type, text }) => {
      if (!currentRoomId || !text?.trim()) return;
      const room = getRoom(currentRoomId);
      const bucket = room.td.categories[category]?.[type];
      if (!bucket) return;
      bucket.push({ id: randomUUID(), text: text.trim() });
      broadcastState();
    });

    socket.on("td:remove", ({ category, type, id }) => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      const bucket = room.td.categories[category]?.[type];
      if (!bucket) return;
      room.td.categories[category][type] = bucket.filter((i) => i.id !== id);
      broadcastState();
    });

    socket.on("td:draw", (type) => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      const list = room.td.categories[room.td.activeCategory]?.[type];
      const drawn = pickRandom(list || []);
      if (!drawn) return;
      room.td.lastDrawn = { type, item: drawn };
      broadcastState();
    });

    socket.on("td:clear", () => {
      if (!currentRoomId) return;
      const room = getRoom(currentRoomId);
      room.td.lastDrawn = null;
      broadcastState();
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
