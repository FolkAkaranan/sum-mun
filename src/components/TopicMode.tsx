"use client";

import { useState } from "react";
import type { PlayerState, TopicState } from "@/lib/types";
import { previewTurn } from "@/lib/gameLogic";
import Modal from "@/components/Modal";

export default function TopicMode({
  state,
  players,
  onSetCategory,
  onDraw,
  onClear,
  onAdd,
  onRemove,
  onClearAll,
  onRestorePreset,
  onAddCategory,
  onRemoveCategory,
}: {
  state: TopicState;
  players: PlayerState;
  onSetCategory: (category: string) => void;
  onDraw: () => void;
  onClear: () => void;
  onAdd: (category: string, text: string) => void;
  onRemove: (category: string, id: string) => void;
  onClearAll: (category: string) => void;
  onRestorePreset: (category: string) => void;
  onAddCategory: (category: string) => void;
  onRemoveCategory: (category: string) => void;
}) {
  const [text, setText] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 py-4">
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSetCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              cat === state.activeCategory
                ? "bg-indigo-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <button
          onClick={onDraw}
          disabled={activeList.length === 0}
          className="flex h-56 w-56 items-center justify-center rounded-full bg-indigo-50 text-[8rem] leading-none transition active:scale-95 disabled:opacity-30 dark:bg-indigo-950/30"
          aria-label="สุ่มหัวข้อคุย"
        >
          💬
        </button>
        <p className="text-sm text-neutral-400">
          {activeList.length === 0
            ? "หมวดนี้ยังไม่มีหัวข้อ กดตั้งค่าเพื่อเพิ่ม"
            : "แตะเพื่อสุ่มหัวข้อคุย"}
        </p>
        {turn.current && (
          <p className="text-sm font-medium text-indigo-500">
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
            <p className="text-xs uppercase tracking-wide text-indigo-500">หัวข้อคุย</p>
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
                onClick={onClear}
                className="flex-1 rounded-xl bg-neutral-200 py-2.5 font-medium hover:bg-neutral-300 dark:bg-neutral-700 dark:hover:bg-neutral-600"
              >
                ปิด
              </button>
              <button
                onClick={onDraw}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 font-medium text-white hover:bg-indigo-700"
              >
                สุ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal title={`จัดการหัวข้อ · ${state.activeCategory}`} onClose={() => setSettingsOpen(false)}>
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-neutral-500">หมวดหมู่</p>
            <div className="mb-2 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat}
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
                    cat === state.activeCategory
                      ? "bg-indigo-600 text-white"
                      : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                  }`}
                >
                  <button onClick={() => onSetCategory(cat)}>{cat}</button>
                  {categories.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`ลบหมวด "${cat}" ทั้งหมวด? (คำถามในหมวดนี้จะหายไปด้วย)`)) onRemoveCategory(cat);
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
              placeholder="เพิ่มหัวข้อ... (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)"
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
                if (confirm(`กู้คืนหัวข้อ preset เดิม 50 อันของ "${state.activeCategory}"? (รายการที่เพิ่ม/ลบเองในหมวดนี้จะหายไป)`))
                  onRestorePreset(state.activeCategory);
              }}
              className="text-sm text-indigo-500 hover:underline"
            >
              กู้คืน preset
            </button>
            {activeList.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`ลบหัวข้อทั้งหมดในหมวด "${state.activeCategory}"?`))
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
