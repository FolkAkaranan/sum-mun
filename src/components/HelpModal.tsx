"use client";

import Modal from "@/components/Modal";

export default function HelpModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="📖 วิธีใช้งาน" onClose={onClose}>
      <div className="flex flex-col gap-5 text-sm leading-relaxed">
        <section>
          <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-100">
            👥 วิธีเพิ่มผู้เล่น
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-600 dark:text-neutral-300">
            <li>กดปุ่ม 👥 มุมขวาบนหน้าแรก</li>
            <li>พิมพ์ชื่อผู้เล่นแล้วกดเพิ่ม (คั่นด้วย , เพื่อเพิ่มหลายคนพร้อมกัน)</li>
            <li>กด 🔀 เพื่อสลับลำดับผู้เล่นแบบสุ่ม</li>
            <li>ลบผู้เล่นได้ด้วยการกด ✕ ข้างชื่อ</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-100">
            🃏 วิธีเพิ่มของที่จะใช้สุ่ม
          </h3>
          <ol className="list-decimal space-y-1 pl-5 text-neutral-600 dark:text-neutral-300">
            <li>เข้าโหมดที่ต้องการ (เช่น จับฉลาก, Truth or Dare, มินิเกมหาผู้แพ้)</li>
            <li>กดปุ่ม ⚙️ Setting ในโหมดนั้น</li>
            <li>พิมพ์ข้อความในช่อง แล้วกดเพิ่ม (คั่นด้วย , เพื่อเพิ่มหลายอันพร้อมกัน)</li>
            <li>ลบรายการที่ไม่ต้องการด้วยปุ่ม ✕ หรือกด &quot;กู้คืน preset&quot; เพื่อเอาชุดเริ่มต้นกลับมา</li>
          </ol>
        </section>

        <section>
          <h3 className="mb-1 font-semibold text-neutral-800 dark:text-neutral-100">💾 อื่นๆ</h3>
          <ul className="list-disc space-y-1 pl-5 text-neutral-600 dark:text-neutral-300">
            <li>ข้อมูลทั้งหมดเซฟอัตโนมัติในเครื่อง ไม่หายแม้ปิดแอป</li>
            <li>Export/Import preset ได้จากหน้าผู้เล่น (👥) เพื่อสำรองหรือย้ายเครื่อง</li>
          </ul>
        </section>
      </div>
    </Modal>
  );
}
