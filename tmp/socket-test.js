const { io } = require("socket.io-client");

const roomId = "TESTROOM";
const a = io("http://localhost:3000");
const b = io("http://localhost:3000");

let aState = null;
let bState = null;

a.on("connect", () => a.emit("room:join", roomId));
b.on("connect", () => b.emit("room:join", roomId));

a.on("room:state", (s) => {
  aState = s;
  checkAfterAdd();
});
b.on("room:state", (s) => {
  bState = s;
});

let added = false;
function checkAfterAdd() {
  if (!added) {
    added = true;
    a.emit("lottery:add", "test-item-from-a");
  }
}

setTimeout(() => {
  const bHasItem = bState?.lottery.items.some((i) => i.text === "test-item-from-a");
  console.log("B received A's added item via realtime sync:", !!bHasItem);
  console.log("A lottery items:", aState?.lottery.items.map((i) => i.text));
  console.log("B lottery items:", bState?.lottery.items.map((i) => i.text));
  console.log("Topic categories:", Object.keys(aState?.topic.categories || {}));
  console.log("TD categories:", Object.keys(aState?.td.categories || {}));
  process.exit(bHasItem ? 0 : 1);
}, 1500);
