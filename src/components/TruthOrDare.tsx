"use client";

import { useState } from "react";
import { TD_CATEGORY_LABEL } from "@/lib/types";
import type { TdCategory, TdState, TdType } from "@/lib/types";
import Modal from "@/components/Modal";

const TYPE_LABEL: Record<TdType, string> = { truth: "Truth", dare: "Dare" };

export default function TruthOrDare({
  state,
  onSetCategory,
  onDraw,
  onClear,
  onAdd,
  onRemove,
  onClearAll,
  onRestorePreset,
}: {
  state: TdState;
  onSetCategory: (cat: TdCategory) => void;
  onDraw: (t: TdType) => void;
  onClear: () => void;
  onAdd: (category: TdCategory, type: TdType, text: string) => void;
  onRemove: (category: TdCategory, type: TdType, id: string) => void;
  onClearAll: (category: TdCategory, type: TdType) => void;
  onRestorePreset: (category: TdCategory, type: TdType) => void;
}) {
  const [text, setText] = useState("");
  const [settingsType, setSettingsType] = useState<TdType>("truth");
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeCategory = state.activeCategory;
  const bucket = state.categories[activeCategory];

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(activeCategory, settingsType, text.trim());
    setText("");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-between gap-6 py-4">
      <div className="flex w-full flex-wrap justify-center gap-2">
        {(Object.keys(TD_CATEGORY_LABEL) as TdCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => onSetCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              cat === activeCategory
                ? "bg-rose-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
            }`}
          >
            {TD_CATEGORY_LABEL[cat]}
          </button>
        ))}
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex gap-6">
          <button
            onClick={() => onDraw("truth")}
            disabled={bucket.truth.length === 0}
            className="flex flex-col items-center gap-2 disabled:opacity-30"
          >
            <span className="flex h-40 w-40 items-center justify-center rounded-full bg-sky-50 text-[5.5rem] leading-none transition active:scale-95 dark:bg-sky-950/30">
              🧠
            </span>
            <span className="text-lg font-bold text-sky-600">Truth</span>
          </button>
          <button
            onClick={() => onDraw("dare")}
            disabled={bucket.dare.length === 0}
            className="flex flex-col items-center gap-2 disabled:opacity-30"
          >
            <span className="flex h-40 w-40 items-center justify-center rounded-full bg-rose-50 text-[5.5rem] leading-none transition active:scale-95 dark:bg-rose-950/30">
              🔥
            </span>
            <span className="text-lg font-bold text-rose-600">Dare</span>
          </button>
        </div>
        <p className="text-sm text-neutral-400">แตะเพื่อสุ่ม Truth หรือ Dare</p>
      </div>

      <button
        onClick={() => setSettingsOpen(true)}
        className="w-full rounded-xl bg-neutral-100 py-3 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
      >
        ⚙️ Setting
      </button>

      {state.lastDrawn && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-white p-6 text-center dark:bg-neutral-900">
            <p className="text-xs uppercase tracking-wide text-rose-500">
              {TYPE_LABEL[state.lastDrawn.type]}
            </p>
            <p className="text-xl font-bold">{state.lastDrawn.item.text}</p>
            {state.lastPlayer && (
              <p className="text-sm text-neutral-500">
                👤 ผู้เล่นที่ตอบ: <span className="font-semibold">{state.lastPlayer}</span>
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
                onClick={() => onDraw(state.lastDrawn!.type)}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 font-medium text-white hover:bg-rose-700"
              >
                สุ่มใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {settingsOpen && (
        <Modal
          title={`จัดการคำถาม/คำท้า · ${TD_CATEGORY_LABEL[activeCategory]}`}
          onClose={() => setSettingsOpen(false)}
        >
          <div className="mb-4 flex gap-2">
            {(["truth", "dare"] as TdType[]).map((t) => (
              <button
                key={t}
                onClick={() => setSettingsType(t)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  settingsType === t
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
                }`}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>

          <form onSubmit={addItem} className="mb-2 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`เพิ่ม ${TYPE_LABEL[settingsType]}... (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)`}
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
                    `กู้คืน ${TYPE_LABEL[settingsType]} preset เดิม 50 อันของ "${TD_CATEGORY_LABEL[activeCategory]}"? (รายการที่เพิ่ม/ลบเองจะหายไป)`
                  )
                )
                  onRestorePreset(activeCategory, settingsType);
              }}
              className="text-sm text-rose-500 hover:underline"
            >
              กู้คืน preset
            </button>
            {bucket[settingsType].length > 0 && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `ลบ ${TYPE_LABEL[settingsType]} ทั้งหมดของ "${TD_CATEGORY_LABEL[activeCategory]}"?`
                    )
                  )
                    onClearAll(activeCategory, settingsType);
                }}
                className="text-sm text-red-500 hover:underline"
              >
                ลบทั้งหมด
              </button>
            )}
          </div>

          <ul className="flex flex-col gap-2">
            {bucket[settingsType].map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
              >
                <span>{item.text}</span>
                <button
                  onClick={() => onRemove(activeCategory, settingsType, item.id)}
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
