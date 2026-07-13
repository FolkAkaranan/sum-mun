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
  lastDrawn: ListItem | null;
}

export type TdCategory = "friend" | "lover" | "party";
export type TdType = "truth" | "dare";

export interface TdState {
  activeCategory: TdCategory;
  categories: Record<TdCategory, Record<TdType, ListItem[]>>;
  lastDrawn: { type: TdType; item: ListItem } | null;
}

export interface RoomState {
  lottery: LotteryState;
  topic: TopicState;
  td: TdState;
}

export const TD_CATEGORY_LABEL: Record<TdCategory, string> = {
  friend: "เพื่อนสนิท",
  lover: "คนรัก",
  party: "ปาร์ตี้",
};

export type AppMode = "lottery" | "topic" | "td";
