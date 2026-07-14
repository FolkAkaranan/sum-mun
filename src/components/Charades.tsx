"use client";

import { useEffect, useState } from "react";
import type { PlayerState, CharadeState } from "@/lib/types";
import { previewTurn } from "@/lib/gameLogic";
import Modal from "@/components/Modal";

const DURATIONS = [30, 60, 90];

type Phase = "setup" | "countdown" | "playing" | "result";

export default function Charades({
  state,
  players,
  onSetCategory,
  onDraw,
  onAssignHolder,
  onAdd,
  onRemove,
  onClearAll,
  onRestorePreset,
  onAddCategory,
  onRemoveCategory,
}: {
  state: CharadeState;
  players: PlayerState;
  onSetCategory: (category: string) => void;
  onDraw: () => void;
  onAssignHolder: () => void;
  onAdd: (category: string, text: string) => void;
  onRemove: (category: string, id: string) => void;
  onClearAll: (category: string) => void;
  onRestorePreset: (category: string) => void;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
}) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [duration, setDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [countdown, setCountdown] = useState(3);
  const [results, setResults] = useState<{ text: string; correct: boolean }[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [text, setText] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const categories = Object.keys(state.categories);
  const activeList = state.categories[state.activeCategory] ?? [];
  const turn = previewTurn(players);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(state.activeCategory, text.trim());
    setText("");
  }

  function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    onAddCategory(newCategory.trim());
    setNewCategory("");
  }

  function startRound() {
    setResults([]);
    setCountdown(3);
    onAssignHolder();
    setPhase("countdown");
  }

  function playAgain() {
    setResults([]);
    setCountdown(3);
    onAssignHolder();
    setPhase("countdown");
  }

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      onDraw();
      setTimeLeft(duration);
      setPhase("playing");
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      setPhase("result");
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  function mark(correct: boolean) {
    if (!state.lastDrawn) return;
    setResults((r) => [...r, { text: state.lastDrawn!.text, correct }]);
    onDraw();
  }

  const score = results.filter((r) => r.correct).length;

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 py-4">
      {phase === "setup" && (
        <>
          <div className="flex w-full flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSetCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  cat === state.activeCategory
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <span className="text-6xl">🤳</span>
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-neutral-400">ตั้งเวลาต่อรอบ</p>
              <div className="flex gap-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                      duration === d
                        ? "bg-emerald-600 text-white"
                        : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                    }`}
                  >
                    {d} วิ
                  </button>
                ))}
              </div>
            </div>
            {turn.current && (
              <p className="text-sm font-medium text-emerald-500">
                🎯 คนถือมือถือ: <span className="font-semibold">{turn.current}</span>
                {turn.next && turn.next !== turn.current && (
                  <span className="ml-2 text-neutral-400">ต่อไป: {turn.next}</span>
                )}
              </p>
            )}
            <button
              onClick={startRound}
              disabled={activeList.length === 0}
              className="rounded-2xl bg-emerald-600 px-8 py-4 text-lg font-bold text-white transition active:scale-95 disabled:opacity-30"
            >
              เริ่มรอบ
            </button>
            {activeList.length === 0 && (
              <p className="text-sm text-neutral-400">หมวดนี้ยังไม่มีคำ กดตั้งค่าเพื่อเพิ่ม</p>
            )}
          </div>

          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full rounded-xl bg-neutral-100 py-3 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            ⚙️ Setting
          </button>
        </>
      )}

      {phase === "countdown" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-sm text-neutral-400">เตรียมตัว...</p>
          <span className="text-8xl font-bold text-emerald-600">
            {countdown > 0 ? countdown : "ไป!"}
          </span>
        </div>
      )}

      {phase === "playing" && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-6">
          <div className="flex w-full items-center justify-between px-2">
            <span className="text-sm font-medium text-neutral-500">⏱ {timeLeft} วิ</span>
            <span className="text-sm font-medium text-emerald-500">✅ {score}</span>
          </div>
          <div className="flex min-h-40 w-full items-center justify-center rounded-2xl bg-emerald-50 px-4 py-8 text-center dark:bg-emerald-950/30">
            <p className="text-3xl font-bold">{state.lastDrawn?.text}</p>
          </div>
          <div className="flex w-full gap-3">
            <button
              onClick={() => mark(false)}
              className="flex-1 rounded-xl bg-neutral-200 py-4 text-lg font-bold hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              ⏭️ ข้าม
            </button>
            <button
              onClick={() => mark(true)}
              className="flex-1 rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white hover:bg-emerald-700"
            >
              ✅ ถูก
            </button>
          </div>
        </div>
      )}

      {phase === "result" && (
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-4 py-4">
          <p className="text-sm uppercase tracking-wide text-emerald-500">หมดเวลา!</p>
          <p className="text-3xl font-bold">
            ได้ {score} / {results.length} คำ
          </p>
          {state.lastPlayer && (
            <p className="text-sm text-neutral-500">
              👤 คนถือมือถือ: <span className="font-semibold">{state.lastPlayer}</span>
            </p>
          )}
          <ul className="flex max-h-52 w-full flex-col gap-1.5 overflow-y-auto rounded-xl border border-neutral-200 p-3 dark:border-neutral-800">
            {results.map((r, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span>{r.text}</span>
                <span>{r.correct ? "✅" : "⏭️"}</span>
              </li>
            ))}
          </ul>
          <div className="flex w-full gap-3">
            <button
              onClick={() => setPhase("setup")}
              className="flex-1 rounded-xl bg-neutral-200 py-2.5 font-medium hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
            >
              เปลี่ยนหมวด
            </button>
            <button
              onClick={playAgain}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700"
            >
              เล่นรอบใหม่
            </button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal title={`จัดการคำ · ${state.activeCategory}`} onClose={() => setSettingsOpen(false)}>
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-neutral-500">หมวดหมู่</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                    cat === state.activeCategory
                      ? "bg-emerald-600 text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  <button onClick={() => onSetCategory(cat)}>{cat}</button>
                  {categories.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`ลบหมวด "${cat}" ทั้งหมวด? (คำในหมวดนี้จะหายไปด้วย)`)) onRemoveCategory(cat);
                      }}
                      aria-label={`ลบหมวด ${cat}`}
                      className="opacity-70 hover:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>
            <form onSubmit={addCategory} className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="เพิ่มหมวดหมู่ใหม่..."
                className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="submit"
                className="rounded-xl bg-neutral-900 px-3 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
              >
                เพิ่ม
              </button>
            </form>
          </div>
          <hr className="mb-4 border-neutral-200 dark:border-neutral-800" />
          <form onSubmit={addItem} className="mb-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เพิ่มคำ... (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)"
              className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              เพิ่ม
            </button>
          </form>

          <div className="mb-4 flex justify-end gap-4">
            <button
              onClick={() => {
                if (
                  confirm(
                    `กู้คืนคำ preset เดิม 50 อันของ "${state.activeCategory}"? (รายการที่เพิ่ม/ลบเองในหมวดนี้จะหายไป)`
                  )
                )
                  onRestorePreset(state.activeCategory);
              }}
              className="text-sm text-emerald-500 hover:underline"
            >
              กู้คืน preset
            </button>
            {activeList.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`ลบคำทั้งหมดในหมวด "${state.activeCategory}"?`))
                    onClearAll(state.activeCategory);
                }}
                className="text-sm text-red-500 hover:underline"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {activeList.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <span>{item.text}</span>
                <button
                  onClick={() => onRemove(state.activeCategory, item.id)}
                  className="text-neutral-400 hover:text-red-500"
                  aria-label="ลบ"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}
    </div>
  );
}
