"use client";

import { useState } from "react";
import type { LotteryState } from "@/lib/types";
import Modal from "@/components/Modal";
import { playDrawSound, playRevealSound } from "@/lib/sound";

export default function LotteryBox({
  state,
  onDraw,
  onResolve,
  onAdd,
  onRemove,
  onClearAll,
}: {
  state: LotteryState;
  onDraw: () => void;
  onResolve: (action: "keep" | "discard") => void;
  onAdd: (text: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}) {
  const [text, setText] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  function handleDraw() {
    if (state.items.length === 0 || isShaking) return;
    setIsShaking(true);
    playDrawSound();
    setTimeout(() => {
      onDraw();
      playRevealSound();
      setIsShaking(false);
    }, 400);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-8 py-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <button
          onClick={handleDraw}
          disabled={state.items.length === 0 || isShaking}
          className={`flex h-56 w-56 items-center justify-center rounded-full bg-amber-50 text-[8rem] leading-none transition active:scale-95 disabled:opacity-30 dark:bg-amber-950/30 ${
            isShaking ? "animate-shake" : ""
          }`}
          aria-label="จับฉลาก"
        >
          🎁
        </button>
        <p className="text-sm text-neutral-400">
          {state.items.length === 0
            ? "กล่องว่างเปล่า กดตั้งค่าเพื่อเพิ่มของ"
            : `แตะกล่องเพื่อจับฉลาก (${state.items.length} ชิ้นในกล่อง)`}
        </p>
      </div>

      <button
        onClick={() => setSettingsOpen(true)}
        className="w-full rounded-xl bg-neutral-100 py-3 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        ⚙️ Setting
      </button>

      {state.pending && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900 md:max-w-lg md:gap-8 md:rounded-3xl md:p-14">
            <p className="text-xs uppercase tracking-wide text-neutral-400 md:text-base">ผลลัพธ์</p>
            <p className="text-2xl font-bold md:text-5xl">{state.pending.text}</p>
            <div className="flex w-full gap-3 md:gap-5">
              <button
                onClick={() => onResolve("keep")}
                className="flex-1 rounded-xl bg-neutral-200 py-2.5 font-medium hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 md:rounded-2xl md:py-4 md:text-lg"
              >
                เก็บ
              </button>
              <button
                onClick={() => onResolve("discard")}
                className="flex-1 rounded-xl bg-neutral-900 py-2.5 font-medium text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 md:rounded-2xl md:py-4 md:text-lg"
              >
                ทิ้ง
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal title="จัดการของในกล่อง" onClose={() => setSettingsOpen(false)}>
          <form onSubmit={addItem} className="mb-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="พิมพ์ข้อความ... (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)"
              className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
            />
            <button
              type="submit"
              className="rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              เพิ่ม
            </button>
          </form>

          {state.items.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => {
                  if (confirm("ลบของในกล่องทั้งหมด?")) onClearAll();
                }}
                className="text-sm text-red-500 hover:underline"
              >
                ลบทั้งหมด
              </button>
            </div>
          )}

          {state.items.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400 dark:border-neutral-700">
              กล่องว่างเปล่า ลองเพิ่มข้อความดูสิ
            </p>
          ) : (
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
          )}
        </Modal>
      )}
    </div>
  );
}
