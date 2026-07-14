"use client";

import { useState } from "react";
import type { AppMode } from "@/lib/types";
import ModeCard from "@/components/ModeCard";
import LotteryBox from "@/components/LotteryBox";
import TopicMode from "@/components/TopicMode";
import TruthOrDare from "@/components/TruthOrDare";
import NeverHaveIEver from "@/components/NeverHaveIEver";
import ThisOrThat from "@/components/ThisOrThat";
import MostLikely from "@/components/MostLikely";
import PlayersModal from "@/components/PlayersModal";
import { useGameState } from "@/lib/useGameState";
import { useTheme } from "@/lib/useTheme";

const MODES: { key: AppMode; label: string; emoji: string }[] = [
  { key: "lottery", label: "จับฉลาก", emoji: "🎁" },
  { key: "topic", label: "คุยอะไรดี", emoji: "💬" },
  { key: "td", label: "Truth or Dare", emoji: "🔥" },
  { key: "never", label: "Never Have I Ever", emoji: "🙊" },
  { key: "thisOrThat", label: "This or That", emoji: "🤔" },
  { key: "mostLikely", label: "ใครมีแนวโน้มจะ", emoji: "🫵" },
];

export default function Home() {
  const [mode, setMode] = useState<AppMode | null>(null);
  const [playersOpen, setPlayersOpen] = useState(false);
  const game = useGameState();
  const { theme, toggleTheme } = useTheme();

  const activeMode = MODES.find((m) => m.key === mode);

  function handleExport() {
    const data = game.exportPresets();
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sum-mun-presets.json";
    a.click();
    URL.revokeObjectURL(url);
  }

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
          <h1 className="flex-1 text-xl font-bold">{activeMode.label}</h1>
        ) : (
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">🎉 สุ่มมันส์</h1>
            <p className="mt-1 text-sm text-neutral-500">
              จับฉลาก · คุยอะไรดี · Truth or Dare · Never Have I Ever · This or That · ใครมีแนวโน้มจะ
            </p>
          </div>
        )}
        <button
          onClick={() => setPlayersOpen(true)}
          className="rounded-full p-2 text-xl hover:bg-neutral-100 dark:hover:bg-neutral-900"
          aria-label="ผู้เล่นและตั้งค่าข้อมูล"
        >
          👥
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-full p-2 text-xl hover:bg-neutral-100 dark:hover:bg-neutral-900"
          aria-label="สลับโหมดมืด/สว่าง"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
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
              onClearAll={game.lotteryClearAll}
            />
          )}
          {mode === "topic" && (
            <TopicMode
              state={game.state.topic}
              players={game.state.players}
              onSetCategory={game.topicSetCategory}
              onDraw={game.topicDraw}
              onClear={game.topicClear}
              onAdd={game.topicAdd}
              onRemove={game.topicRemove}
              onClearAll={game.topicClearAll}
              onRestorePreset={game.topicRestorePreset}
            />
          )}
          {mode === "td" && (
            <TruthOrDare
              state={game.state.td}
              players={game.state.players}
              onSetCategory={game.tdSetCategory}
              onDraw={game.tdDraw}
              onClear={game.tdClear}
              onAdd={game.tdAdd}
              onRemove={game.tdRemove}
              onClearAll={game.tdClearAll}
              onRestorePreset={game.tdRestorePreset}
            />
          )}
          {mode === "never" && (
            <NeverHaveIEver
              state={game.state.never}
              players={game.state.players}
              onDraw={game.neverDraw}
              onClear={game.neverClear}
              onAdd={game.neverAdd}
              onRemove={game.neverRemove}
              onClearAll={game.neverClearAll}
              onRestorePreset={game.neverRestorePreset}
            />
          )}
          {mode === "thisOrThat" && (
            <ThisOrThat
              state={game.state.thisOrThat}
              players={game.state.players}
              onDraw={game.thisOrThatDraw}
              onClear={game.thisOrThatClear}
              onAdd={game.thisOrThatAdd}
              onRemove={game.thisOrThatRemove}
              onClearAll={game.thisOrThatClearAll}
              onRestorePreset={game.thisOrThatRestorePreset}
            />
          )}
          {mode === "mostLikely" && (
            <MostLikely
              state={game.state.mostLikely}
              players={game.state.players}
              onDraw={game.mostLikelyDraw}
              onClear={game.mostLikelyClear}
              onAdd={game.mostLikelyAdd}
              onRemove={game.mostLikelyRemove}
              onClearAll={game.mostLikelyClearAll}
              onRestorePreset={game.mostLikelyRestorePreset}
            />
          )}
        </>
      )}

      {playersOpen && game.state && (
        <PlayersModal
          players={game.state.players}
          onAdd={game.playersAdd}
          onRemove={game.playersRemove}
          onClearAll={game.playersClearAll}
          onExport={handleExport}
          onImport={game.importPresets}
          onClose={() => setPlayersOpen(false)}
        />
      )}
    </main>
  );
}
