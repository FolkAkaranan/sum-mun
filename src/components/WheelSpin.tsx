"use client";

import { useEffect, useState } from "react";
import type { PlayerState, WheelState } from "@/lib/types";
import { previewTurn } from "@/lib/gameLogic";
import { playDrawSound, playRevealSound } from "@/lib/sound";
import Modal from "@/components/Modal";

const COLORS = [
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

const SPIN_TURNS = 5;

function computeRotation(prevRotation: number, index: number, count: number): number {
  const segAngle = 360 / count;
  const targetCenter = index * segAngle + segAngle / 2;
  const targetMod = (360 - targetCenter) % 360;
  const prevMod = ((prevRotation % 360) + 360) % 360;
  let delta = targetMod - prevMod;
  if (delta < 0) delta += 360;
  return prevRotation + SPIN_TURNS * 360 + delta;
}

export default function WheelSpin({
  state,
  players,
  onDraw,
  onResolve,
  onAdd,
  onRemove,
  onClearAll,
}: {
  state: WheelState;
  players: PlayerState;
  onDraw: () => void;
  onResolve: (action: "keep" | "discard") => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  const [text, setText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const items = state.items;
  const turn = previewTurn(players);
  const canSpin = items.length >= 2 && !spinning;

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  function handleSpin() {
    if (!canSpin) return;
    playDrawSound();
    setRevealed(false);
    setSpinning(true);
    onDraw();
  }

  useEffect(() => {
    if (!spinning || !state.lastDrawn) return;
    const index = items.findIndex((i) => i.id === state.lastDrawn!.id);
    if (index < 0) return;
    setRotation((prev) => computeRotation(prev, index, items.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.lastDrawn]);

  function handleTransitionEnd() {
    if (!spinning) return;
    setSpinning(false);
    setRevealed(true);
    playRevealSound();
  }

  const seg = items.length > 0 ? 360 / items.length : 0;
  const gradient =
    items.length > 0
      ? `conic-gradient(${items
          .map((_, i) => `${COLORS[i % COLORS.length]} ${i * seg}deg ${(i + 1) * seg}deg`)
          .join(", ")})`
      : undefined;

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 py-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative h-64 w-64">
          <div className="pointer-events-none absolute left-1/2 -top-1 z-10 -translate-x-1/2 text-3xl">
            🔻
          </div>
          <div
            onClick={handleSpin}
            onTransitionEnd={handleTransitionEnd}
            className={`relative h-full w-full rounded-full border-4 border-white shadow-lg dark:border-neutral-700 ${
              canSpin ? "cursor-pointer active:brightness-95" : "cursor-not-allowed opacity-60"
            } ${items.length === 0 ? "bg-neutral-200 dark:bg-neutral-800" : ""}`}
            style={{
              background: gradient,
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4s cubic-bezier(0.15,0.65,0.15,1)" : "none",
            }}
          >
            {items.map((item, i) => {
              const mid = i * seg + seg / 2;
              const dirAngle = mid - 90;
              const flip = dirAngle > 90;
              return (
                <div
                  key={item.id}
                  className="absolute top-1/2 left-1/2 flex h-0 items-center justify-end"
                  style={{
                    width: "44%",
                    transformOrigin: "0% 50%",
                    transform: `rotate(${dirAngle}deg)`,
                  }}
                >
                  <span
                    className={`max-w-[86px] truncate px-1.5 text-center font-bold text-white drop-shadow ${
                      items.length > 10 ? "text-[10px]" : items.length > 6 ? "text-xs" : "text-sm"
                    }`}
                    style={flip ? { transform: "rotate(180deg)" } : undefined}
                  >
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <p className="text-sm text-neutral-400">
          {items.length === 0
            ? "ยังไม่มีตัวเลือก กดตั้งค่าเพื่อเพิ่ม"
            : items.length === 1
              ? "ต้องมีอย่างน้อย 2 ตัวเลือกถึงจะหมุนได้"
              : "แตะที่วงล้อเพื่อหมุน"}
        </p>
        {turn.current && (
          <p className="text-sm font-medium text-orange-500">
            🎯 ถึงคิว: <span className="font-semibold">{turn.current}</span>
            {turn.next && turn.next !== turn.current && (
              <span className="ml-2 text-neutral-400">ต่อไป: {turn.next}</span>
            )}
          </p>
        )}
      </div>

      <button
        onClick={() => setSettingsOpen(true)}
        className="w-full rounded-xl bg-neutral-100 py-3 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        ⚙️ Setting
      </button>

      {revealed && state.lastDrawn && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900">
            <p className="text-xs uppercase tracking-wide text-orange-500">ผลวงล้อ</p>
            <p className="text-xl font-bold">{state.lastDrawn.text}</p>
            {state.lastPlayer && (
              <p className="text-sm text-neutral-500">
                👤 ผู้เล่นที่ตอบ: <span className="font-semibold">{state.lastPlayer}</span>
                {state.nextPlayer && state.nextPlayer !== state.lastPlayer && (
                  <span className="ml-2 text-neutral-400">ต่อไป: {state.nextPlayer}</span>
                )}
              </p>
            )}
            <div className="flex w-full gap-3">
              <button
                onClick={() => {
                  setRevealed(false);
                  onResolve("keep");
                }}
                className="flex-1 rounded-xl bg-neutral-200 py-2.5 font-medium hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                เก็บ
              </button>
              <button
                onClick={() => {
                  setRevealed(false);
                  onResolve("discard");
                }}
                className="flex-1 rounded-xl bg-orange-600 py-2.5 font-medium text-white hover:bg-orange-700"
              >
                ทิ้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal title="จัดการตัวเลือกวงล้อ" onClose={() => setSettingsOpen(false)}>
          <form onSubmit={addItem} className="mb-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เพิ่มตัวเลือก... (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)"
              className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              เพิ่ม
            </button>
          </form>

          {items.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  if (confirm("ลบตัวเลือกวงล้อทั้งหมด?")) onClearAll();
                }}
                className="text-sm text-red-500 hover:underline"
              >
                ลบทั้งหมด
              </button>
            </div>
          )}

          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <span>{item.text}</span>
                <button
                  onClick={() => onRemove(item.id)}
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
