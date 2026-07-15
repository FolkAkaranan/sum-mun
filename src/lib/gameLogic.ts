import presets from "@/lib/presets.json";
import type {
  CharadeState,
  EffectCardState,
  ListItem,
  MostLikelyState,
  NeverState,
  PairItem,
  PlayerState,
  RoomState,
  TdCategory,
  TdState,
  ThisOrThatState,
  TdType,
  TopicState,
  WheelState,
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

/** ดูว่าถึงคิวใครตอบ และใครต่อไป โดยไม่ขยับคิว (ไว้ใช้แสดงผลก่อนกดสุ่ม) */
export function previewTurn(players: PlayerState): { current: string | null; next: string | null } {
  const { names, turnIndex } = players;
  if (names.length === 0) return { current: null, next: null };
  const idx = turnIndex % names.length;
  const nextIdx = (idx + 1) % names.length;
  return { current: names[idx], next: names.length > 1 ? names[nextIdx] : names[idx] };
}

/** เลื่อนคิวไปคนถัดไป คืนชื่อคนที่ถึงคิว(ตอบรอบนี้), คนถัดไป, และ players ที่อัปเดตคิวแล้ว */
function advanceTurn(players: PlayerState): {
  current: string | null;
  next: string | null;
  players: PlayerState;
} {
  const { current, next } = previewTurn(players);
  if (current === null) return { current: null, next: null, players };
  const nextIndex = (players.turnIndex + 1) % players.names.length;
  return { current, next, players: { ...players, turnIndex: nextIndex } };
}

const topicPresets = presets.topics as Record<string, string[]>;
const tdPresets = presets.truthOrDare as Record<TdCategory, Record<TdType, string[]>>;
const neverPresets = presets.neverHaveIEver as string[];
const thisOrThatPresets = presets.thisOrThat as [string, string][];
const mostLikelyPresets = presets.mostLikely as string[];
const effectCardPresets = presets.effectCard as string[];
const charadePresets = presets.charade as Record<string, string[]>;

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

  const charadeCategories: Record<string, ListItem[]> = {};
  const charadeUsedIds: Record<string, string[]> = {};
  for (const [name, items] of Object.entries(presets.charade)) {
    charadeCategories[name] = withIds(items);
    charadeUsedIds[name] = [];
  }

  return {
    lottery: { items: [], pending: null },
    topic: {
      activeCategory: Object.keys(topicCategories)[0],
      categories: topicCategories,
      usedIds: topicUsedIds,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    td: {
      activeCategory: "friend",
      categories: tdCategories,
      usedIds: tdUsedIds,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    never: {
      items: withIds(neverPresets),
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    thisOrThat: {
      items: withPairIds(thisOrThatPresets.map(([a, b]) => ({ a, b }))),
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    mostLikely: {
      items: withIds(mostLikelyPresets),
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    effectCard: {
      items: withIds(effectCardPresets),
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
      lastPunishment: null,
    },
    charade: {
      activeCategory: Object.keys(charadeCategories)[0],
      categories: charadeCategories,
      usedIds: charadeUsedIds,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    wheel: { items: [], lastDrawn: null, lastPlayer: null, nextPlayer: null },
    players: { names: [], turnIndex: 0 },
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
        nextPlayer: s.topic.nextPlayer ?? null,
      }
    : fresh.topic;

  const td: TdState = s.td
    ? {
        activeCategory: s.td.activeCategory ?? fresh.td.activeCategory,
        categories: { ...fresh.td.categories, ...s.td.categories },
        usedIds: { ...fresh.td.usedIds, ...(s.td.usedIds ?? {}) },
        lastDrawn: s.td.lastDrawn ?? null,
        lastPlayer: s.td.lastPlayer ?? null,
        nextPlayer: s.td.nextPlayer ?? null,
      }
    : fresh.td;

  const never: NeverState = s.never
    ? {
        items: s.never.items ?? fresh.never.items,
        usedIds: s.never.usedIds ?? [],
        lastDrawn: s.never.lastDrawn ?? null,
        lastPlayer: s.never.lastPlayer ?? null,
        nextPlayer: s.never.nextPlayer ?? null,
      }
    : fresh.never;

  const thisOrThat: ThisOrThatState = s.thisOrThat
    ? {
        items: s.thisOrThat.items ?? fresh.thisOrThat.items,
        usedIds: s.thisOrThat.usedIds ?? [],
        lastDrawn: s.thisOrThat.lastDrawn ?? null,
        lastPlayer: s.thisOrThat.lastPlayer ?? null,
        nextPlayer: s.thisOrThat.nextPlayer ?? null,
      }
    : fresh.thisOrThat;

  const mostLikely: MostLikelyState = s.mostLikely
    ? {
        items: s.mostLikely.items ?? fresh.mostLikely.items,
        usedIds: s.mostLikely.usedIds ?? [],
        lastDrawn: s.mostLikely.lastDrawn ?? null,
        lastPlayer: s.mostLikely.lastPlayer ?? null,
        nextPlayer: s.mostLikely.nextPlayer ?? null,
      }
    : fresh.mostLikely;

  const effectCard: EffectCardState = s.effectCard
    ? {
        items: s.effectCard.items ?? fresh.effectCard.items,
        usedIds: s.effectCard.usedIds ?? [],
        lastDrawn: s.effectCard.lastDrawn ?? null,
        lastPlayer: s.effectCard.lastPlayer ?? null,
        nextPlayer: s.effectCard.nextPlayer ?? null,
        lastPunishment: s.effectCard.lastPunishment ?? null,
      }
    : fresh.effectCard;

  const charade: CharadeState = s.charade
    ? {
        activeCategory: s.charade.activeCategory ?? fresh.charade.activeCategory,
        categories: { ...fresh.charade.categories, ...s.charade.categories },
        usedIds: { ...fresh.charade.usedIds, ...(s.charade.usedIds ?? {}) },
        lastDrawn: s.charade.lastDrawn ?? null,
        lastPlayer: s.charade.lastPlayer ?? null,
        nextPlayer: s.charade.nextPlayer ?? null,
      }
    : fresh.charade;

  const wheel: WheelState = s.wheel
    ? {
        items: s.wheel.items ?? fresh.wheel.items,
        lastDrawn: s.wheel.lastDrawn ?? null,
        lastPlayer: s.wheel.lastPlayer ?? null,
        nextPlayer: s.wheel.nextPlayer ?? null,
      }
    : fresh.wheel;

  const players: PlayerState = s.players
    ? { names: s.players.names ?? [], turnIndex: s.players.turnIndex ?? 0 }
    : fresh.players;

  return {
    lottery: s.lottery ?? fresh.lottery,
    topic,
    td,
    never,
    thisOrThat,
    mostLikely,
    effectCard,
    charade,
    wheel,
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
    topic: {
      ...room.topic,
      activeCategory: category,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
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
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    topic: {
      ...room.topic,
      usedIds: { ...room.topic.usedIds, [room.topic.activeCategory]: usedIds },
      lastDrawn: drawn,
      lastPlayer: current,
      nextPlayer: next,
    },
  };
}

export function topicClear(room: RoomState): RoomState {
  return { ...room, topic: { ...room.topic, lastDrawn: null, lastPlayer: null, nextPlayer: null } };
}

// ----- truth or dare -----
export function tdSetCategory(room: RoomState, category: TdCategory): RoomState {
  if (!TD_CATEGORIES.includes(category)) return room;
  return {
    ...room,
    td: {
      ...room.td,
      activeCategory: category,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
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
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    td: {
      ...room.td,
      usedIds: {
        ...room.td.usedIds,
        [room.td.activeCategory]: { ...room.td.usedIds[room.td.activeCategory], [type]: usedIds },
      },
      lastDrawn: { type, item: drawn },
      lastPlayer: current,
      nextPlayer: next,
    },
  };
}

export function tdClear(room: RoomState): RoomState {
  return { ...room, td: { ...room.td, lastDrawn: null, lastPlayer: null, nextPlayer: null } };
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
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    never: {
      ...room.never,
      usedIds,
      lastDrawn: drawn,
      lastPlayer: current,
      nextPlayer: next,
    },
  };
}

export function neverClear(room: RoomState): RoomState {
  return { ...room, never: { ...room.never, lastDrawn: null, lastPlayer: null, nextPlayer: null } };
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
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    thisOrThat: {
      ...room.thisOrThat,
      usedIds,
      lastDrawn: drawn,
      lastPlayer: current,
      nextPlayer: next,
    },
  };
}

export function thisOrThatClear(room: RoomState): RoomState {
  return {
    ...room,
    thisOrThat: { ...room.thisOrThat, lastDrawn: null, lastPlayer: null, nextPlayer: null },
  };
}

// ----- most likely to -----
export function mostLikelyAdd(room: RoomState, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0) return room;
  return {
    ...room,
    mostLikely: { ...room.mostLikely, items: [...room.mostLikely.items, ...withIds(texts)] },
  };
}

export function mostLikelyRemove(room: RoomState, id: string): RoomState {
  return {
    ...room,
    mostLikely: { ...room.mostLikely, items: room.mostLikely.items.filter((i) => i.id !== id) },
  };
}

export function mostLikelyClearAll(room: RoomState): RoomState {
  return { ...room, mostLikely: { ...room.mostLikely, items: [], usedIds: [] } };
}

export function mostLikelyRestorePreset(room: RoomState): RoomState {
  return { ...room, mostLikely: { ...room.mostLikely, items: withIds(mostLikelyPresets), usedIds: [] } };
}

export function mostLikelyDraw(room: RoomState): RoomState {
  const { drawn, usedIds } = drawNoRepeat(room.mostLikely.items, room.mostLikely.usedIds);
  if (!drawn) return room;
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    mostLikely: {
      ...room.mostLikely,
      usedIds,
      lastDrawn: drawn,
      lastPlayer: current,
      nextPlayer: next,
    },
  };
}

export function mostLikelyClear(room: RoomState): RoomState {
  return {
    ...room,
    mostLikely: { ...room.mostLikely, lastDrawn: null, lastPlayer: null, nextPlayer: null },
  };
}

// ----- effect card (มินิเกมหาผู้แพ้ ใครช้าสุดโดนลงโทษ) -----
export function effectCardAdd(room: RoomState, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0) return room;
  return {
    ...room,
    effectCard: { ...room.effectCard, items: [...room.effectCard.items, ...withIds(texts)] },
  };
}

export function effectCardRemove(room: RoomState, id: string): RoomState {
  return {
    ...room,
    effectCard: { ...room.effectCard, items: room.effectCard.items.filter((i) => i.id !== id) },
  };
}

export function effectCardClearAll(room: RoomState): RoomState {
  return { ...room, effectCard: { ...room.effectCard, items: [], usedIds: [] } };
}

export function effectCardRestorePreset(room: RoomState): RoomState {
  return {
    ...room,
    effectCard: { ...room.effectCard, items: withIds(effectCardPresets), usedIds: [] },
  };
}

export function effectCardDraw(room: RoomState): RoomState {
  const { drawn, usedIds } = drawNoRepeat(room.effectCard.items, room.effectCard.usedIds);
  if (!drawn) return room;
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    effectCard: {
      ...room.effectCard,
      usedIds,
      lastDrawn: drawn,
      lastPlayer: current,
      nextPlayer: next,
    },
  };
}

export function effectCardClear(room: RoomState): RoomState {
  return {
    ...room,
    effectCard: { ...room.effectCard, lastDrawn: null, lastPlayer: null, nextPlayer: null },
  };
}

const PUNISHMENT_TD_CATEGORIES: TdCategory[] = ["friend", "coworker", "party"];

export function effectCardDrawPunishment(room: RoomState): RoomState {
  const pool = PUNISHMENT_TD_CATEGORIES.flatMap(
    (category) => room.td.categories[category]?.dare ?? []
  );
  const drawn = pickRandom(pool);
  if (!drawn) return room;
  return {
    ...room,
    effectCard: { ...room.effectCard, lastPunishment: drawn.text },
  };
}

export function effectCardClearPunishment(room: RoomState): RoomState {
  return { ...room, effectCard: { ...room.effectCard, lastPunishment: null } };
}

// ----- charade (ทายคำ ชาเย็นสไตล์) -----
export function charadeSetCategory(room: RoomState, category: string): RoomState {
  if (!room.charade.categories[category]) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      activeCategory: category,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
  };
}

export function charadeAdd(room: RoomState, category: string, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0 || !room.charade.categories[category]) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      categories: {
        ...room.charade.categories,
        [category]: [...room.charade.categories[category], ...withIds(texts)],
      },
    },
  };
}

export function charadeClearAll(room: RoomState, category: string): RoomState {
  if (!room.charade.categories[category]) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      categories: { ...room.charade.categories, [category]: [] },
      usedIds: { ...room.charade.usedIds, [category]: [] },
    },
  };
}

export function charadeRestorePreset(room: RoomState, category: string): RoomState {
  const preset = charadePresets[category];
  if (!preset) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      categories: { ...room.charade.categories, [category]: withIds(preset) },
      usedIds: { ...room.charade.usedIds, [category]: [] },
    },
  };
}

export function charadeRemove(room: RoomState, category: string, id: string): RoomState {
  if (!room.charade.categories[category]) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      categories: {
        ...room.charade.categories,
        [category]: room.charade.categories[category].filter((i) => i.id !== id),
      },
    },
  };
}

/** สุ่มคำถัดไปในหมวดที่เลือก ใช้ตอนเล่นจริง (ไม่ขยับคิวผู้เล่น เพราะสุ่มรัวๆ ระหว่างรอบ) */
export function charadeDraw(room: RoomState): RoomState {
  const list = room.charade.categories[room.charade.activeCategory] ?? [];
  const used = room.charade.usedIds[room.charade.activeCategory] ?? [];
  const { drawn, usedIds } = drawNoRepeat(list, used);
  if (!drawn) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      usedIds: { ...room.charade.usedIds, [room.charade.activeCategory]: usedIds },
      lastDrawn: drawn,
    },
  };
}

/** เลื่อนคิวผู้ถือมือถือรอบใหม่ เรียกตอนกด "เริ่มรอบ" เท่านั้น */
export function charadeAssignHolder(room: RoomState): RoomState {
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    charade: { ...room.charade, lastPlayer: current, nextPlayer: next },
  };
}

/** เพิ่มหมวดใหม่ (ว่างเปล่า) ถ้ามีอยู่แล้วจะไม่ทำอะไร */
export function topicAddCategory(room: RoomState, category: string): RoomState {
  const name = category.trim();
  if (!name || room.topic.categories[name]) return room;
  return {
    ...room,
    topic: {
      ...room.topic,
      categories: { ...room.topic.categories, [name]: [] },
      usedIds: { ...room.topic.usedIds, [name]: [] },
    },
  };
}

/** ลบหมวด ห้ามลบถ้าเหลือหมวดเดียว จะสลับ activeCategory ไปหมวดแรกที่เหลือถ้าลบหมวดที่กำลังเลือกอยู่ */
export function topicRemoveCategory(room: RoomState, category: string): RoomState {
  const keys = Object.keys(room.topic.categories);
  if (keys.length <= 1 || !room.topic.categories[category]) return room;
  const categories = { ...room.topic.categories };
  const usedIds = { ...room.topic.usedIds };
  delete categories[category];
  delete usedIds[category];
  const activeCategory =
    room.topic.activeCategory === category ? Object.keys(categories)[0] : room.topic.activeCategory;
  return {
    ...room,
    topic: { ...room.topic, categories, usedIds, activeCategory },
  };
}

/** เพิ่มหมวดใหม่ (ว่างเปล่า) ถ้ามีอยู่แล้วจะไม่ทำอะไร */
export function charadeAddCategory(room: RoomState, category: string): RoomState {
  const name = category.trim();
  if (!name || room.charade.categories[name]) return room;
  return {
    ...room,
    charade: {
      ...room.charade,
      categories: { ...room.charade.categories, [name]: [] },
      usedIds: { ...room.charade.usedIds, [name]: [] },
    },
  };
}

/** ลบหมวด ห้ามลบถ้าเหลือหมวดเดียว จะสลับ activeCategory ไปหมวดแรกที่เหลือถ้าลบหมวดที่กำลังเลือกอยู่ */
export function charadeRemoveCategory(room: RoomState, category: string): RoomState {
  const keys = Object.keys(room.charade.categories);
  if (keys.length <= 1 || !room.charade.categories[category]) return room;
  const categories = { ...room.charade.categories };
  const usedIds = { ...room.charade.usedIds };
  delete categories[category];
  delete usedIds[category];
  const activeCategory =
    room.charade.activeCategory === category
      ? Object.keys(categories)[0]
      : room.charade.activeCategory;
  return {
    ...room,
    charade: { ...room.charade, categories, usedIds, activeCategory },
  };
}

// ----- wheel (วงล้อสุ่ม) -----
export function wheelAdd(room: RoomState, text: string): RoomState {
  const texts = parseBulk(text);
  if (texts.length === 0) return room;
  return { ...room, wheel: { ...room.wheel, items: [...room.wheel.items, ...withIds(texts)] } };
}

export function wheelRemove(room: RoomState, id: string): RoomState {
  return { ...room, wheel: { ...room.wheel, items: room.wheel.items.filter((i) => i.id !== id) } };
}

export function wheelClearAll(room: RoomState): RoomState {
  return { ...room, wheel: { ...room.wheel, items: [] } };
}

/** สุ่มแบบไม่ตัดออก (วงล้อจริงหมุนซ้ำอันเดิมได้) และเลื่อนคิวผู้เล่นเหมือนโหมดอื่น */
export function wheelDraw(room: RoomState): RoomState {
  const drawn = pickRandom(room.wheel.items);
  if (!drawn) return room;
  const { current, next, players } = advanceTurn(room.players);
  return {
    ...room,
    players,
    wheel: { ...room.wheel, lastDrawn: drawn, lastPlayer: current, nextPlayer: next },
  };
}

export function wheelClear(room: RoomState): RoomState {
  return { ...room, wheel: { ...room.wheel, lastDrawn: null, lastPlayer: null, nextPlayer: null } };
}

/** เก็บ = คงตัวเลือกไว้ในวงล้อ, ทิ้ง = ลบตัวเลือกที่สุ่มได้ออกจากวงล้อถาวร */
export function wheelResolve(room: RoomState, action: "keep" | "discard"): RoomState {
  if (!room.wheel.lastDrawn) return room;
  const items =
    action === "discard"
      ? room.wheel.items.filter((i) => i.id !== room.wheel.lastDrawn!.id)
      : room.wheel.items;
  return {
    ...room,
    wheel: { ...room.wheel, items, lastDrawn: null, lastPlayer: null, nextPlayer: null },
  };
}

// ----- players -----
// เพิ่ม/ลบ/ล้างรายชื่อผู้เล่น จะรีเซ็ตคิวกลับไปเริ่มที่คนแรกเสมอ กันคิวเพี้ยนตอนรายชื่อเปลี่ยน
export function playersAdd(room: RoomState, text: string): RoomState {
  const names = parseBulk(text);
  if (names.length === 0) return room;
  return { ...room, players: { names: [...room.players.names, ...names], turnIndex: 0 } };
}

export function playersRemove(room: RoomState, index: number): RoomState {
  return {
    ...room,
    players: { names: room.players.names.filter((_, i) => i !== index), turnIndex: 0 },
  };
}

export function playersClearAll(room: RoomState): RoomState {
  return { ...room, players: { names: [], turnIndex: 0 } };
}

/** สลับลำดับผู้เล่นแบบสุ่ม (Fisher-Yates) แล้วรีเซ็ตคิวกลับไปเริ่มที่คนแรก */
export function playersShuffle(room: RoomState): RoomState {
  const names = [...room.players.names];
  for (let i = names.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [names[i], names[j]] = [names[j], names[i]];
  }
  return { ...room, players: { names, turnIndex: 0 } };
}

// ----- export / import presets -----
export interface ExportedPresets {
  version: 1;
  lottery: ListItem[];
  topic: Record<string, ListItem[]>;
  td: Record<TdCategory, Record<TdType, ListItem[]>>;
  never: ListItem[];
  thisOrThat: PairItem[];
  mostLikely: ListItem[];
  effectCard: ListItem[];
  charade: Record<string, ListItem[]>;
  wheel: ListItem[];
}

export function exportPresets(room: RoomState): ExportedPresets {
  return {
    version: 1,
    lottery: room.lottery.items,
    topic: room.topic.categories,
    td: room.td.categories,
    never: room.never.items,
    thisOrThat: room.thisOrThat.items,
    mostLikely: room.mostLikely.items,
    effectCard: room.effectCard.items,
    charade: room.charade.categories,
    wheel: room.wheel.items,
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

  const charadeCategories = d.charade ?? room.charade.categories;
  const charadeUsedIds: Record<string, string[]> = {};
  for (const key of Object.keys(charadeCategories)) charadeUsedIds[key] = [];

  return {
    lottery: { items: d.lottery ?? room.lottery.items, pending: null },
    topic: {
      activeCategory: Object.keys(topicCategories)[0] ?? fresh.topic.activeCategory,
      categories: topicCategories,
      usedIds: topicUsedIds,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    td: {
      activeCategory: room.td.activeCategory,
      categories: tdCategories,
      usedIds: tdUsedIds,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    never: {
      items: d.never ?? room.never.items,
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    thisOrThat: {
      items: d.thisOrThat ?? room.thisOrThat.items,
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    mostLikely: {
      items: d.mostLikely ?? room.mostLikely.items,
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    effectCard: {
      items: d.effectCard ?? room.effectCard.items,
      usedIds: [],
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
      lastPunishment: null,
    },
    charade: {
      activeCategory: Object.keys(charadeCategories)[0] ?? fresh.charade.activeCategory,
      categories: charadeCategories,
      usedIds: charadeUsedIds,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    wheel: {
      items: d.wheel ?? room.wheel.items,
      lastDrawn: null,
      lastPlayer: null,
      nextPlayer: null,
    },
    players: room.players,
  };
}
