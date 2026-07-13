"use client";

import { useEffect, useRef, useState } from "react";
import type { RoomState, TdCategory, TdType } from "@/lib/types";
import * as game from "@/lib/gameLogic";

const STORAGE_KEY = "sum-mun-state-v1";

export function useGameState() {
  const [state, setState] = useState<RoomState | null>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw) as RoomState);
        return;
      }
    } catch {
      // ignore corrupted storage
    }
    setState(game.createInitialState());
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage full/unavailable, ignore
    }
  }, [state]);

  return {
    state,
    lotteryAdd: (text: string) => setState((s) => (s ? game.lotteryAdd(s, text) : s)),
    lotteryRemove: (id: string) => setState((s) => (s ? game.lotteryRemove(s, id) : s)),
    lotteryDraw: () => setState((s) => (s ? game.lotteryDraw(s) : s)),
    lotteryResolve: (action: "keep" | "discard") =>
      setState((s) => (s ? game.lotteryResolve(s, action) : s)),
    topicSetCategory: (category: string) =>
      setState((s) => (s ? game.topicSetCategory(s, category) : s)),
    topicAdd: (category: string, text: string) =>
      setState((s) => (s ? game.topicAdd(s, category, text) : s)),
    topicRemove: (category: string, id: string) =>
      setState((s) => (s ? game.topicRemove(s, category, id) : s)),
    topicDraw: () => setState((s) => (s ? game.topicDraw(s) : s)),
    topicClear: () => setState((s) => (s ? game.topicClear(s) : s)),
    tdSetCategory: (category: TdCategory) =>
      setState((s) => (s ? game.tdSetCategory(s, category) : s)),
    tdAdd: (category: TdCategory, type: TdType, text: string) =>
      setState((s) => (s ? game.tdAdd(s, category, type, text) : s)),
    tdRemove: (category: TdCategory, type: TdType, id: string) =>
      setState((s) => (s ? game.tdRemove(s, category, type, id) : s)),
    tdDraw: (type: TdType) => setState((s) => (s ? game.tdDraw(s, type) : s)),
    tdClear: () => setState((s) => (s ? game.tdClear(s) : s)),
  };
}

export type GameState = ReturnType<typeof useGameState>;
