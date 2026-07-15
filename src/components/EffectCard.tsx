"use client";

import { useState } from "react";
import type { EffectCardState, PlayerState } from "@/lib/types";
import { previewTurn } from "@/lib/gameLogic";
import { playRevealSound } from "@/lib/sound";
import Modal from "@/components/Modal";

export default function EffectCard({
  state,
  players,
  onDraw,
  onClear,
  onAdd,
  onRemove,
  onClearAll,
  onRestorePreset,
  onDrawPunishment,
  onClearPunishment,
}: {
  state: EffectCardState;
  players: PlayerState;
  onDraw: () => void;
  onClear: () => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  onRestorePreset: () => void;
  onDrawPunishment: () => void;
  onClearPunishment: () => void;
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
          className="flex h-56 w-56 items-center justify-center rounded-full bg-cyan-50 text-[8rem] leading-none transition active:scale-95 disabled:opacity-30 dark:bg-cyan-950/30"
          aria-label="สุ่มมินิเกมหาผู้แพ้"
        >
          🃏
        </button>
        <p className="text-sm text-neutral-400">
          {state.items.length === 0
            ? "ยังไม่มีการ์ด กดตั้งค่าเพื่อเพิ่ม"
            : "แตะเพื่อสุ่มมินิเกม ใครช้าสุดโดนลงโทษ"}
        </p>
        {turn.current && (
          <p className="text-sm font-medium text-cyan-500">
            🎯 ถึงคิวเปิดการ์ด: <span className="font-semibold">{turn.current}</span>
            {turn.next && turn.next !== turn.current && (
              <span className="ml-2 text-neutral-400">ต่อไป: {turn.next}</span>
            )}
          </p>
        )}
      </div>

      <div className="flex w-full gap-3">
        <button
          onClick={() => {
            playRevealSound();
            onDrawPunishment();
          }}
          className="flex-1 rounded-xl bg-orange-100 py-3 font-medium text-orange-700 hover:bg-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-900/50"
        >
          🎲 สุ่มบทลงโทษ
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex-1 rounded-xl bg-neutral-100 py-3 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
        >
          ⚙️ Setting
        </button>
      </div>

      {state.lastDrawn && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900">
            <p className="text-xs uppercase tracking-wide text-cyan-500">มินิเกมหาผู้แพ้</p>
            <p className="text-xl font-bold">{state.lastDrawn.text}</p>
            {state.lastPlayer && (
              <p className="text-sm text-neutral-500">
                👤 คนเปิดการ์ด: <span className="font-semibold">{state.lastPlayer}</span>
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
                className="flex-1 rounded-xl bg-cyan-600 py-2.5 font-medium text-white hover:bg-cyan-700"
              >
                สุ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {state.lastPunishment && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900">
            <p className="text-xs uppercase tracking-wide text-orange-500">บทลงโทษ</p>
            <p className="text-xl font-bold">{state.lastPunishment}</p>
            <div className="flex w-full gap-3">
              <button
                onClick={onClearPunishment}
                className="flex-1 rounded-xl bg-neutral-200 py-2.5 font-medium hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  playRevealSound();
                  onDrawPunishment();
                }}
                className="flex-1 rounded-xl bg-orange-600 py-2.5 font-medium text-white hover:bg-orange-700"
              >
                สุ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal title="จัดการมินิเกมหาผู้แพ้" onClose={() => setSettingsOpen(false)}>
          <form onSubmit={addItem} className="mb-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="เพิ่มการ์ด... (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)"
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
                if (confirm("กู้คืนการ์ด preset เดิมทั้งหมด? (รายการที่เพิ่ม/ลบเองจะหายไป)"))
                  onRestorePreset();
              }}
              className="text-sm text-cyan-500 hover:underline"
            >
              กู้คืน preset
            </button>
            {state.items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("ลบการ์ดทั้งหมด?")) onClearAll();
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
