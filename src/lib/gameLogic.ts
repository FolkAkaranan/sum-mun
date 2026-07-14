import presets from "@/lib/presets.json";
import type { ListItem, RoomState, TdCategory, TdType } from "@/lib/types";

const TD_CATEGORIES: TdCategory[] = ["friend", "lover", "party"];

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function withIds(list: string[]): ListItem[] {
  return list.map((text) => ({ id: newId(), text }));
}

/** แยกข้อความที่คั่นด้วย , เป็นหลายรายการ ตัดช่องว่างและช่องว่างล้วนทิ้ง */
function parseBulk(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

const topicPresets = presets.topics as Record<string, string[]>;
const tdPresets = presets.truthOrDare as Record<TdCategory, Record<TdType, string[]>>;

export function pickRandom<T>(list: T[]): T | null {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export function createInitialState(): RoomState {
  const topicCategories: Record<string, ListItem[]> = {};
  for (const [name, items] of Object.entries(presets.topics)) {
    topicCategories[name] = withIds(items);
  }

  const tdCategories = {} as RoomState["td"]["categories"];
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

// ----- lottery -----
export function lotteryAdd(room: RoomState, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0) return room;
  return {
    ...room,
    lottery: {
      ...room.lottery,
      items: [...room.lottery.items, ...withIds(texts)],
    },
  };
}

export function lotteryClearAll(room: RoomState): RoomState {
  return { ...room, lottery: { ...room.lottery, items: [] } };
}

export function lotteryRemove(room: RoomState, id: string): RoomState {
  return {
    ...room,
    lottery: {
      ...room.lottery,
      items: room.lottery.items.filter((i) => i.id !== id),
    },
  };
}

export function lotteryDraw(room: RoomState): RoomState {
  if (room.lottery.pending) return room;
  const drawn = pickRandom(room.lottery.items);
  if (!drawn) return room;
  return {
    ...room,
    lottery: {
      items: room.lottery.items.filter((i) => i.id !== drawn.id),
      pending: drawn,
    },
  };
}

export function lotteryResolve(room: RoomState, action: "keep" | "discard"): RoomState {
  if (!room.lottery.pending) return room;
  const items =
    action === "keep" ? [...room.lottery.items, room.lottery.pending] : room.lottery.items;
  return {
    ...room,
    lottery: { items, pending: null },
  };
}

// ----- topic -----
export function topicSetCategory(room: RoomState, category: string): RoomState {
  if (!room.topic.categories[category]) return room;
  return {
    ...room,
    topic: { ...room.topic, activeCategory: category, lastDrawn: null },
  };
}

export function topicAdd(room: RoomState, category: string, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0 || !room.topic.categories[category]) return room;
  return {
    ...room,
    topic: {
      ...room.topic,
      categories: {
        ...room.topic.categories,
        [category]: [...room.topic.categories[category], ...withIds(texts)],
      },
    },
  };
}

export function topicClearAll(room: RoomState, category: string): RoomState {
  if (!room.topic.categories[category]) return room;
  return {
    ...room,
    topic: {
      ...room.topic,
      categories: { ...room.topic.categories, [category]: [] },
    },
  };
}

export function topicRestorePreset(room: RoomState, category: string): RoomState {
  const preset = topicPresets[category];
  if (!preset) return room;
  return {
    ...room,
    topic: {
      ...room.topic,
      categories: { ...room.topic.categories, [category]: withIds(preset) },
    },
  };
}

export function topicRemove(room: RoomState, category: string, id: string): RoomState {
  if (!room.topic.categories[category]) return room;
  return {
    ...room,
    topic: {
      ...room.topic,
      categories: {
        ...room.topic.categories,
        [category]: room.topic.categories[category].filter((i) => i.id !== id),
      },
    },
  };
}

export function topicDraw(room: RoomState): RoomState {
  const drawn = pickRandom(room.topic.categories[room.topic.activeCategory] ?? []);
  if (!drawn) return room;
  return { ...room, topic: { ...room.topic, lastDrawn: drawn } };
}

export function topicClear(room: RoomState): RoomState {
  return { ...room, topic: { ...room.topic, lastDrawn: null } };
}

// ----- truth or dare -----
export function tdSetCategory(room: RoomState, category: TdCategory): RoomState {
  if (!TD_CATEGORIES.includes(category)) return room;
  return {
    ...room,
    td: { ...room.td, activeCategory: category, lastDrawn: null },
  };
}

export function tdAdd(
  room: RoomState,
  category: TdCategory,
  type: TdType,
  text: string
): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0 || !room.td.categories[category]) return room;
  const bucket = room.td.categories[category][type];
  return {
    ...room,
    td: {
      ...room.td,
      categories: {
        ...room.td.categories,
        [category]: {
          ...room.td.categories[category],
          [type]: [...bucket, ...withIds(texts)],
        },
      },
    },
  };
}

export function tdClearAll(room: RoomState, category: TdCategory, type: TdType): RoomState {
  if (!room.td.categories[category]) return room;
  return {
    ...room,
    td: {
      ...room.td,
      categories: {
        ...room.td.categories,
        [category]: { ...room.td.categories[category], [type]: [] },
      },
    },
  };
}

export function tdRestorePreset(room: RoomState, category: TdCategory, type: TdType): RoomState {
  const preset = tdPresets[category]?.[type];
  if (!preset) return room;
  return {
    ...room,
    td: {
      ...room.td,
      categories: {
        ...room.td.categories,
        [category]: { ...room.td.categories[category], [type]: withIds(preset) },
      },
    },
  };
}

export function tdRemove(
  room: RoomState,
  category: TdCategory,
  type: TdType,
  id: string
): RoomState {
  if (!room.td.categories[category]) return room;
  const bucket = room.td.categories[category][type];
  return {
    ...room,
    td: {
      ...room.td,
      categories: {
        ...room.td.categories,
        [category]: {
          ...room.td.categories[category],
          [type]: bucket.filter((i) => i.id !== id),
        },
      },
    },
  };
}

export function tdDraw(room: RoomState, type: TdType): RoomState {
  const list = room.td.categories[room.td.activeCategory]?.[type];
  const drawn = pickRandom(list ?? []);
  if (!drawn) return room;
  return { ...room, td: { ...room.td, lastDrawn: { type, item: drawn } } };
}

export function tdClear(room: RoomState): RoomState {
  return { ...room, td: { ...room.td, lastDrawn: null } };
}
