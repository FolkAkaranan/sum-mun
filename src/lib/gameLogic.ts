import presets from "@/lib/presets.json";
import type {
  ListItem,
  NeverState,
  PairItem,
  PlayerState,
  RoomState,
  TdCategory,
  TdState,
  ThisOrThatState,
  TdType,
  TopicState,
} from "@/lib/types";

const TD_CATEGORIES: TdCategory[] = ["friend", "lover", "party", "family", "coworker"];

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function withIds(list: string[]): ListItem[] {
  return list.map((text) => ({ id: newId(), text }));
}

function withPairIds(pairs: { a: string; b: string }[]): PairItem[] {
  return pairs.map((p) => ({ id: newId(), ...p }));
}

/** แยกข้อความที่คั่นด้วย , เป็นหลายรายการ ตัดช่องว่างและช่องว่างล้วนทิ้ง */
function parseBulk(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

/** แยกคู่ตัวเลือกที่คั่นด้วย , แต่ละคู่ใช้ / คั่นระหว่าง A กับ B เช่น "กาแฟ/ชา, หมา/แมว" */
function parsePairs(text: string): { a: string; b: string }[] {
  return parseBulk(text)
    .map((pair) => {
      const [a, b] = pair.split("/").map((s) => s.trim());
      return { a: a ?? "", b: b ?? "" };
    })
    .filter((p) => p.a.length > 0 && p.b.length > 0);
}

/** สุ่มแบบไม่ซ้ำจนกว่าจะครบทุกอันในกอง แล้วจึงเริ่มกองใหม่ */
function drawNoRepeat<T extends { id: string }>(
  list: T[],
  usedIds: string[]
): { drawn: T | null; usedIds: string[] } {
  if (list.length === 0) return { drawn: null, usedIds: [] };
  let pool = list.filter((i) => !usedIds.includes(i.id));
  let nextUsed = usedIds;
  if (pool.length === 0) {
    pool = list;
    nextUsed = [];
  }
  const drawn = pickRandom(pool);
  if (!drawn) return { drawn: null, usedIds: nextUsed };
  return { drawn, usedIds: [...nextUsed, drawn.id] };
}

function pickPlayer(players: string[]): string | null {
  if (players.length === 0) return null;
  return players[Math.floor(Math.random() * players.length)];
}

const topicPresets = presets.topics as Record<string, string[]>;
const tdPresets = presets.truthOrDare as Record<TdCategory, Record<TdType, string[]>>;
const neverPresets = presets.neverHaveIEver as string[];
const thisOrThatPresets = presets.thisOrThat as [string, string][];

export function pickRandom<T>(list: T[]): T | null {
  if (list.length === 0) return null;
  return list[Math.floor(Math.random() * list.length)];
}

export function createInitialState(): RoomState {
  const topicCategories: Record<string, ListItem[]> = {};
  const topicUsedIds: Record<string, string[]> = {};
  for (const [name, items] of Object.entries(presets.topics)) {
    topicCategories[name] = withIds(items);
    topicUsedIds[name] = [];
  }

  const tdCategories = {} as RoomState["td"]["categories"];
  const tdUsedIds = {} as RoomState["td"]["usedIds"];
  for (const cat of TD_CATEGORIES) {
    tdCategories[cat] = {
      truth: withIds(presets.truthOrDare[cat].truth),
      dare: withIds(presets.truthOrDare[cat].dare),
    };
    tdUsedIds[cat] = { truth: [], dare: [] };
  }

  return {
    lottery: { items: [], pending: null },
    topic: {
      activeCategory: Object.keys(topicCategories)[0],
      categories: topicCategories,
      usedIds: topicUsedIds,
      lastDrawn: null,
      lastPlayer: null,
    },
    td: {
      activeCategory: "friend",
      categories: tdCategories,
      usedIds: tdUsedIds,
      lastDrawn: null,
      lastPlayer: null,
    },
    never: {
      items: withIds(neverPresets),
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
    },
    thisOrThat: {
      items: withPairIds(thisOrThatPresets.map(([a, b]) => ({ a, b }))),
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
    },
    players: { names: [] },
  };
}

/** เติมฟิลด์ที่ขาดหายไปจาก state เก่าใน localStorage ให้ครบตามโครงสร้างปัจจุบัน */
export function ensureRoomState(state: unknown): RoomState {
  const fresh = createInitialState();
  if (!state || typeof state !== "object") return fresh;
  const s = state as Partial<RoomState>;

  const topic: TopicState = s.topic
    ? {
        activeCategory: s.topic.activeCategory ?? fresh.topic.activeCategory,
        categories: { ...fresh.topic.categories, ...s.topic.categories },
        usedIds: { ...fresh.topic.usedIds, ...(s.topic.usedIds ?? {}) },
        lastDrawn: s.topic.lastDrawn ?? null,
        lastPlayer: s.topic.lastPlayer ?? null,
      }
    : fresh.topic;

  const td: TdState = s.td
    ? {
        activeCategory: s.td.activeCategory ?? fresh.td.activeCategory,
        categories: { ...fresh.td.categories, ...s.td.categories },
        usedIds: { ...fresh.td.usedIds, ...(s.td.usedIds ?? {}) },
        lastDrawn: s.td.lastDrawn ?? null,
        lastPlayer: s.td.lastPlayer ?? null,
      }
    : fresh.td;

  const never: NeverState = s.never
    ? {
        items: s.never.items ?? fresh.never.items,
        usedIds: s.never.usedIds ?? [],
        lastDrawn: s.never.lastDrawn ?? null,
        lastPlayer: s.never.lastPlayer ?? null,
      }
    : fresh.never;

  const thisOrThat: ThisOrThatState = s.thisOrThat
    ? {
        items: s.thisOrThat.items ?? fresh.thisOrThat.items,
        usedIds: s.thisOrThat.usedIds ?? [],
        lastDrawn: s.thisOrThat.lastDrawn ?? null,
        lastPlayer: s.thisOrThat.lastPlayer ?? null,
      }
    : fresh.thisOrThat;

  const players: PlayerState = s.players ?? fresh.players;

  return {
    lottery: s.lottery ?? fresh.lottery,
    topic,
    td,
    never,
    thisOrThat,
    players,
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
    topic: { ...room.topic, activeCategory: category, lastDrawn: null, lastPlayer: null },
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
      usedIds: { ...room.topic.usedIds, [category]: [] },
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
      usedIds: { ...room.topic.usedIds, [category]: [] },
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
  const list = room.topic.categories[room.topic.activeCategory] ?? [];
  const used = room.topic.usedIds[room.topic.activeCategory] ?? [];
  const { drawn, usedIds } = drawNoRepeat(list, used);
  if (!drawn) return room;
  return {
    ...room,
    topic: {
      ...room.topic,
      usedIds: { ...room.topic.usedIds, [room.topic.activeCategory]: usedIds },
      lastDrawn: drawn,
      lastPlayer: pickPlayer(room.players.names),
    },
  };
}

export function topicClear(room: RoomState): RoomState {
  return { ...room, topic: { ...room.topic, lastDrawn: null, lastPlayer: null } };
}

// ----- truth or dare -----
export function tdSetCategory(room: RoomState, category: TdCategory): RoomState {
  if (!TD_CATEGORIES.includes(category)) return room;
  return {
    ...room,
    td: { ...room.td, activeCategory: category, lastDrawn: null, lastPlayer: null },
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
      usedIds: {
        ...room.td.usedIds,
        [category]: { ...room.td.usedIds[category], [type]: [] },
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
      usedIds: {
        ...room.td.usedIds,
        [category]: { ...room.td.usedIds[category], [type]: [] },
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
  const list = room.td.categories[room.td.activeCategory]?.[type] ?? [];
  const used = room.td.usedIds[room.td.activeCategory]?.[type] ?? [];
  const { drawn, usedIds } = drawNoRepeat(list, used);
  if (!drawn) return room;
  return {
    ...room,
    td: {
      ...room.td,
      usedIds: {
        ...room.td.usedIds,
        [room.td.activeCategory]: { ...room.td.usedIds[room.td.activeCategory], [type]: usedIds },
      },
      lastDrawn: { type, item: drawn },
      lastPlayer: pickPlayer(room.players.names),
    },
  };
}

export function tdClear(room: RoomState): RoomState {
  return { ...room, td: { ...room.td, lastDrawn: null, lastPlayer: null } };
}

// ----- never have i ever -----
export function neverAdd(room: RoomState, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0) return room;
  return { ...room, never: { ...room.never, items: [...room.never.items, ...withIds(texts)] } };
}

export function neverRemove(room: RoomState, id: string): RoomState {
  return { ...room, never: { ...room.never, items: room.never.items.filter((i) => i.id !== id) } };
}

export function neverClearAll(room: RoomState): RoomState {
  return { ...room, never: { ...room.never, items: [], usedIds: [] } };
}

export function neverRestorePreset(room: RoomState): RoomState {
  return { ...room, never: { ...room.never, items: withIds(neverPresets), usedIds: [] } };
}

export function neverDraw(room: RoomState): RoomState {
  const { drawn, usedIds } = drawNoRepeat(room.never.items, room.never.usedIds);
  if (!drawn) return room;
  return {
    ...room,
    never: {
      ...room.never,
      usedIds,
      lastDrawn: drawn,
      lastPlayer: pickPlayer(room.players.names),
    },
  };
}

export function neverClear(room: RoomState): RoomState {
  return { ...room, never: { ...room.never, lastDrawn: null, lastPlayer: null } };
}

// ----- this or that -----
export function thisOrThatAdd(room: RoomState, text: string): RoomState {
  const pairs = parsePairs(text);
  if (pairs.length === 0) return room;
  return {
    ...room,
    thisOrThat: { ...room.thisOrThat, items: [...room.thisOrThat.items, ...withPairIds(pairs)] },
  };
}

export function thisOrThatRemove(room: RoomState, id: string): RoomState {
  return {
    ...room,
    thisOrThat: { ...room.thisOrThat, items: room.thisOrThat.items.filter((i) => i.id !== id) },
  };
}

export function thisOrThatClearAll(room: RoomState): RoomState {
  return { ...room, thisOrThat: { ...room.thisOrThat, items: [], usedIds: [] } };
}

export function thisOrThatRestorePreset(room: RoomState): RoomState {
  return {
    ...room,
    thisOrThat: {
      ...room.thisOrThat,
      items: withPairIds(thisOrThatPresets.map(([a, b]) => ({ a, b }))),
      usedIds: [],
    },
  };
}

export function thisOrThatDraw(room: RoomState): RoomState {
  const { drawn, usedIds } = drawNoRepeat(room.thisOrThat.items, room.thisOrThat.usedIds);
  if (!drawn) return room;
  return {
    ...room,
    thisOrThat: {
      ...room.thisOrThat,
      usedIds,
      lastDrawn: drawn,
      lastPlayer: pickPlayer(room.players.names),
    },
  };
}

export function thisOrThatClear(room: RoomState): RoomState {
  return { ...room, thisOrThat: { ...room.thisOrThat, lastDrawn: null, lastPlayer: null } };
}

// ----- players -----
export function playersAdd(room: RoomState, text: string): RoomState {
  const names = parseBulk(text);
  if (names.length === 0) return room;
  return { ...room, players: { names: [...room.players.names, ...names] } };
}

export function playersRemove(room: RoomState, index: number): RoomState {
  return { ...room, players: { names: room.players.names.filter((_, i) => i !== index) } };
}

export function playersClearAll(room: RoomState): RoomState {
  return { ...room, players: { names: [] } };
}

// ----- export / import presets -----
export interface ExportedPresets {
  version: 1;
  lottery: ListItem[];
  topic: Record<string, ListItem[]>;
  td: Record<TdCategory, Record<TdType, ListItem[]>>;
  never: ListItem[];
  thisOrThat: PairItem[];
}

export function exportPresets(room: RoomState): ExportedPresets {
  return {
    version: 1,
    lottery: room.lottery.items,
    topic: room.topic.categories,
    td: room.td.categories,
    never: room.never.items,
    thisOrThat: room.thisOrThat.items,
  };
}

export function importPresets(room: RoomState, data: unknown): RoomState {
  if (!data || typeof data !== "object") return room;
  const d = data as Partial<ExportedPresets>;
  const fresh = createInitialState();

  const topicCategories = d.topic ?? room.topic.categories;
  const topicUsedIds: Record<string, string[]> = {};
  for (const key of Object.keys(topicCategories)) topicUsedIds[key] = [];

  const tdCategories = (d.td ?? room.td.categories) as RoomState["td"]["categories"];
  const tdUsedIds = {} as RoomState["td"]["usedIds"];
  for (const cat of TD_CATEGORIES) {
    tdUsedIds[cat] = { truth: [], dare: [] };
  }

  return {
    lottery: { items: d.lottery ?? room.lottery.items, pending: null },
    topic: {
      activeCategory: Object.keys(topicCategories)[0] ?? fresh.topic.activeCategory,
      categories: topicCategories,
      usedIds: topicUsedIds,
      lastDrawn: null,
      lastPlayer: null,
    },
    td: {
      activeCategory: room.td.activeCategory,
      categories: tdCategories,
      usedIds: tdUsedIds,
      lastDrawn: null,
      lastPlayer: null,
    },
    never: { items: d.never ?? room.never.items, usedIds: [], lastDrawn: null, lastPlayer: null },
    thisOrThat: {
      items: d.thisOrThat ?? room.thisOrThat.items,
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
    },
    players: room.players,
  };
}
