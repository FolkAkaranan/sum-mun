"use client";

import { useState } from "react";
import type { AppMode } from "@/lib/types";
import ModeCard from "@/components/ModeCard";
import LotteryBox from "@/components/LotteryBox";
import TopicMode from "@/components/TopicMode";
import TruthOrDare from "@/components/TruthOrDare";
import { useGameState } from "@/lib/useGameState";

const MODES: { key: AppMode; label: string; emoji: string }[] = [
  { key: "lottery", label: "จับฉลาก", emoji: "🎁" },
  { key: "topic", label: "คุยอะไรดี", emoji: "💬" },
  { key: "td", label: "Truth or Dare", emoji: "🔥" },
];

export default function Home() {
  const [mode, setMode] = useState<AppMode | null>(null);
  const game = useGameState();

  const activeMode = MODES.find((m) => m.key === mode);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6 md:max-w-2xl md:py-10">
      <header className="flex items-center gap-3">
        {mode ? (
          <button
            onClick={() => setMode(null)}
            className="rounded-full p-2 text-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900"
            aria-label="กลับ"
          >
            ←
          </button>
        ) : null}
        {activeMode ? (
          <h1 className="text-xl font-bold">{activeMode.label}</h1>
        ) : (
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">🎉 สุ่มมันส์</h1>
            <p className="mt-1 text-sm text-neutral-500">
              จับฉลาก · คุยอะไรดี · Truth or Dare
            </p>
          </div>
        )}
      </header>

      {!game.state ? (
        <p className="text-center text-neutral-400">กำลังโหลด...</p>
      ) : !mode ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {MODES.map((m) => (
            <ModeCard
              key={m.key}
              emoji={m.emoji}
              label={m.label}
              onClick={() => setMode(m.key)}
            />
          ))}
        </div>
      ) : (
        <>
          {mode === "lottery" && (
            <LotteryBox
              state={game.state.lottery}
              onDraw={game.lotteryDraw}
              onResolve={game.lotteryResolve}
              onAdd={game.lotteryAdd}
              onRemove={game.lotteryRemove}
            />
          )}
          {mode === "topic" && (
            <TopicMode
              state={game.state.topic}
              onSetCategory={game.topicSetCategory}
              onDraw={game.topicDraw}
              onClear={game.topicClear}
              onAdd={game.topicAdd}
              onRemove={game.topicRemove}
            />
          )}
          {mode === "td" && (
            <TruthOrDare
              state={game.state.td}
              onSetCategory={game.tdSetCategory}
              onDraw={game.tdDraw}
              onClear={game.tdClear}
              onAdd={game.tdAdd}
              onRemove={game.tdRemove}
            />
          )}
        </>
      )}
    </main>
  );
}
