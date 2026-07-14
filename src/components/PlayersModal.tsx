"use client";

import { useRef, useState } from "react";
import type { PlayerState } from "@/lib/types";
import Modal from "@/components/Modal";

export default function PlayersModal({
  players,
  onAdd,
  onRemove,
  onClearAll,
  onShuffle,
  onExport,
  onImport,
  onClose,
}: {
  players: PlayerState;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  onClearAll: () => void;
  onShuffle: () => void;
  onExport: () => void;
  onImport: (data: unknown) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addPlayers(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd(text.trim());
    setText("");
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        onImport(data);
        alert("นำเข้าข้อมูลสำเร็จ");
      } catch {
        alert("ไฟล์ไม่ถูกต้อง กรุณาเลือกไฟล์ JSON ที่ export จากแอปนี้");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <Modal title="👥 ผู้เล่น & ตั้งค่าข้อมูล" onClose={onClose}>
      <p className="mb-2 text-sm font-medium text-neutral-500">
        รายชื่อผู้เล่น (ใช้สุ่มว่าใครต้องตอบ)
      </p>
      <form onSubmit={addPlayers} className="mb-2 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="เพิ่มชื่อ... (คั่นด้วย , เพื่อเพิ่มหลายคนพร้อมกัน)"
          className="flex-1 rounded-xl border border-neutral-300 px-3 py-2 outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-xl bg-neutral-900 px-4 py-2 font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          เพิ่ม
        </button>
      </form>

      {players.names.length > 0 && (
        <div className="mb-4 flex justify-end gap-4">
          <button onClick={onShuffle} className="text-sm text-indigo-500 hover:underline">
            🔀 สลับลำดับ
          </button>
          <button
            onClick={() => {
              if (confirm("ลบผู้เล่นทั้งหมด?")) onClearAll();
            }}
            className="text-sm text-red-500 hover:underline"
          >
            ลบทั้งหมด
          </button>
        </div>
      )}

      {players.names.length === 0 ? (
        <p className="mb-6 rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400 dark:border-neutral-700">
          ยังไม่มีผู้เล่น เพิ่มชื่อเพื่อให้ระบบสุ่มว่าใครต้องตอบ
        </p>
      ) : (
        <ul className="mb-6 flex flex-col gap-2">
          {players.names.map((name, index) => (
            <li
              key={`${name}-${index}`}
              className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2 dark:border-neutral-800"
            >
              <span>{name}</span>
              <button
                onClick={() => onRemove(index)}
                className="text-neutral-400 hover:text-red-500"
                aria-label="ลบ"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="mb-2 text-sm font-medium text-neutral-500">แชร์/สำรองรายการที่แก้เอง</p>
        <div className="flex gap-2">
          <button
            onClick={onExport}
            className="flex-1 rounded-xl bg-neutral-100 py-2.5 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            📤 Export
          </button>
          <button
            onClick={handleImportClick}
            className="flex-1 rounded-xl bg-neutral-100 py-2.5 font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            📥 Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        <p className="mt-2 text-xs text-neutral-400">
          Export จะดาวน์โหลดไฟล์ JSON ของกล่องจับฉลาก, หัวข้อคุย, Truth or Dare, Never Have I Ever
          และ This or That ที่แก้เองทั้งหมด ส่งไฟล์นี้ให้เพื่อนแล้วกด Import เพื่อใช้ชุดเดียวกันได้
        </p>
      </div>
    </Modal>
  );
}
