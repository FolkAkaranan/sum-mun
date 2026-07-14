"use client";

import { useState } from "react";
import type { PlayerState, ThisOrThatState } from "@/lib/types";
import { previewTurn } from "@/lib/gameLogic";
import { playRevealSound } from "@/lib/sound";
import Modal from "@/components/Modal";

export default function ThisOrThat({
  state,
  players,
  onDraw,
  onClear,
  onAdd,
  onRemove,
  onClearAll,
  onRestorePreset,
}: {
  state: ThisOrThatState;
  players: PlayerState;
  onDraw: () => void;
  onClear: () => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onRestorePreset: () => void;
}) {
  const [text, setText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const turn = previewTurn(players);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 py-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <button
          onClick={() => {
            playRevealSound();
            onDraw();
          }}
          disabled={state.items.length === 0}
          className="flex h-56 w-56 items-center justify-center rounded-full bg-fuchsia-50 text-[8rem] leading-none transition active:scale-95 disabled:opacity-30 dark:bg-fuchsia-950/30"
          aria-label="สุ่ม This or That"
        >
          🤔
        </button>
        <p className="text-sm text-neutral-400">
          {state.items.length === 0
            ? "ยังไม่มีตัวเลือก กดตั้งค่าเพื่อเพิ่ม"
            : "แตะเพื่อสุ่มตัวเลือก"}
        </p>
        {turn.current && (
          <p className="text-sm font-medium text-fuchsia-500">
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

      {state.lastDrawn && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900">
            <p className="text-xs uppercase tracking-wide text-fuchsia-500">This or That</p>
            <div className="flex w-full items-center justify-center gap-3">
              <span className="flex-1 rounded-xl bg-fuchsia-100 px-3 py-4 text-lg font-bold text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-200">
                {state.lastDrawn.a}
              </span>
              <span className="text-sm font-medium text-neutral-400">หรือ</span>
              <span className="flex-1 rounded-xl bg-fuchsia-100 px-3 py-4 text-lg font-bold text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-200">
                {state.lastDrawn.b}
              </span>
            </div>
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
                onClick={onClear}
                className="flex-1 rounded-xl bg-neutral-200 py-2.5 font-medium hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  playRevealSound();
                  onDraw();
                }}
                className="flex-1 rounded-xl bg-fuchsia-600 py-2.5 font-medium text-white hover:bg-fuchsia-700"
              >
                สุ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal title="จัดการตัวเลือก This or That" onClose={() => setSettingsOpen(false)}>
          <form onSubmit={addItem} className="mb-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เพิ่มคู่ตัวเลือก เช่น กาแฟ/ชา, หมา/แมว"
              className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              เพิ่ม
            </button>
          </form>
          <p className="mb-3 text-xs text-neutral-400">
            พิมพ์แบบ &quot;A/B&quot; แล้วคั่นแต่ละคู่ด้วย , เพื่อเพิ่มหลายคู่พร้อมกัน
          </p>

          <div className="mb-4 flex justify-end gap-4">
            <button
              onClick={() => {
                if (confirm("กู้คืนตัวเลือก preset เดิมทั้งหมด? (รายการที่เพิ่ม/ลบเองจะหายไป)"))
                  onRestorePreset();
              }}
              className="text-sm text-fuchsia-500 hover:underline"
            >
              กู้คืน preset
            </button>
            {state.items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("ลบตัวเลือกทั้งหมด?")) onClearAll();
                }}
                className="text-sm text-red-500 hover:underline"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {state.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <span>
                  {item.a} <span className="text-neutral-400">/</span> {item.b}
                </span>
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
