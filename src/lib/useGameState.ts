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
        setState(game.ensureRoomState(JSON.parse(raw)));
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
    lotteryClearAll: () => setState((s) => (s ? game.lotteryClearAll(s) : s)),
    lotteryDraw: () => setState((s) => (s ? game.lotteryDraw(s) : s)),
    lotteryResolve: (action: "keep" | "discard") =>
      setState((s) => (s ? game.lotteryResolve(s, action) : s)),
    topicSetCategory: (category: string) =>
      setState((s) => (s ? game.topicSetCategory(s, category) : s)),
    topicAdd: (category: string, text: string) =>
      setState((s) => (s ? game.topicAdd(s, category, text) : s)),
    topicRemove: (category: string, id: string) =>
      setState((s) => (s ? game.topicRemove(s, category, id) : s)),
    topicClearAll: (category: string) =>
      setState((s) => (s ? game.topicClearAll(s, category) : s)),
    topicRestorePreset: (category: string) =>
      setState((s) => (s ? game.topicRestorePreset(s, category) : s)),
    topicDraw: () => setState((s) => (s ? game.topicDraw(s) : s)),
    topicClear: () => setState((s) => (s ? game.topicClear(s) : s)),
    tdSetCategory: (category: TdCategory) =>
      setState((s) => (s ? game.tdSetCategory(s, category) : s)),
    tdAdd: (category: TdCategory, type: TdType, text: string) =>
      setState((s) => (s ? game.tdAdd(s, category, type, text) : s)),
    tdRemove: (category: TdCategory, type: TdType, id: string) =>
      setState((s) => (s ? game.tdRemove(s, category, type, id) : s)),
    tdClearAll: (category: TdCategory, type: TdType) =>
      setState((s) => (s ? game.tdClearAll(s, category, type) : s)),
    tdRestorePreset: (category: TdCategory, type: TdType) =>
      setState((s) => (s ? game.tdRestorePreset(s, category, type) : s)),
    tdDraw: (type: TdType) => setState((s) => (s ? game.tdDraw(s, type) : s)),
    tdClear: () => setState((s) => (s ? game.tdClear(s) : s)),
    neverAdd: (text: string) => setState((s) => (s ? game.neverAdd(s, text) : s)),
    neverRemove: (id: string) => setState((s) => (s ? game.neverRemove(s, id) : s)),
    neverClearAll: () => setState((s) => (s ? game.neverClearAll(s) : s)),
    neverRestorePreset: () => setState((s) => (s ? game.neverRestorePreset(s) : s)),
    neverDraw: () => setState((s) => (s ? game.neverDraw(s) : s)),
    neverClear: () => setState((s) => (s ? game.neverClear(s) : s)),
    thisOrThatAdd: (text: string) => setState((s) => (s ? game.thisOrThatAdd(s, text) : s)),
    thisOrThatRemove: (id: string) => setState((s) => (s ? game.thisOrThatRemove(s, id) : s)),
    thisOrThatClearAll: () => setState((s) => (s ? game.thisOrThatClearAll(s) : s)),
    thisOrThatRestorePreset: () =>
      setState((s) => (s ? game.thisOrThatRestorePreset(s) : s)),
    thisOrThatDraw: () => setState((s) => (s ? game.thisOrThatDraw(s) : s)),
    thisOrThatClear: () => setState((s) => (s ? game.thisOrThatClear(s) : s)),
    playersAdd: (text: string) => setState((s) => (s ? game.playersAdd(s, text) : s)),
    playersRemove: (index: number) => setState((s) => (s ? game.playersRemove(s, index) : s)),
    playersClearAll: () => setState((s) => (s ? game.playersClearAll(s) : s)),
    exportPresets: () => (state ? game.exportPresets(state) : null),
    importPresets: (data: unknown) => setState((s) => (s ? game.importPresets(s, data) : s)),
  };
}

export type GameState = ReturnType<typeof useGameState>;
