export interface ListItem {
  id: string;
  text: string;
}

export interface LotteryState {
  items: ListItem[];
  pending: ListItem | null;
}

export interface TopicState {
  activeCategory: string;
  categories: Record<string, ListItem[]>;
  usedIds: Record<string, string[]>;
  lastDrawn: ListItem | null;
  lastPlayer: string | null;
  nextPlayer: string | null;
}

export type TdCategory = "friend" | "lover" | "party" | "family" | "coworker";
export type TdType = "truth" | "dare";

export interface TdState {
  activeCategory: TdCategory;
  categories: Record<TdCategory, Record<TdType, ListItem[]>>;
  usedIds: Record<TdCategory, Record<TdType, string[]>>;
  lastDrawn: { type: TdType; item: ListItem } | null;
  lastPlayer: string | null;
  nextPlayer: string | null;
}

export interface NeverState {
  items: ListItem[];
  usedIds: string[];
  lastDrawn: ListItem | null;
  lastPlayer: string | null;
  nextPlayer: string | null;
}

export interface PairItem {
  id: string;
  a: string;
  b: string;
}

export interface ThisOrThatState {
  items: PairItem[];
  usedIds: string[];
  lastDrawn: PairItem | null;
  lastPlayer: string | null;
  nextPlayer: string | null;
}

export interface PlayerState {
  names: string[];
  turnIndex: number;
}

export interface RoomState {
  lottery: LotteryState;
  topic: TopicState;
  td: TdState;
  never: NeverState;
  thisOrThat: ThisOrThatState;
  players: PlayerState;
}

export const TD_CATEGORY_LABEL: Record<TdCategory, string> = {
  friend: "เพื่อนสนิท",
  lover: "คนรัก",
  party: "ปาร์ตี้",
  family: "ครอบครัว",
  coworker: "เพื่อนร่วมงาน",
};

export type AppMode = "lottery" | "topic" | "td" | "never" | "thisOrThat";
