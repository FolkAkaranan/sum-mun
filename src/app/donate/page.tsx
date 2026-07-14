import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "สนับสนุนผู้พัฒนา | สุ่มมันส์",
  description: "สแกน PromptPay เพื่อเลี้ยงกาแฟ สนับสนุนการพัฒนาเว็บสุ่มมันส์",
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function DonatePage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6 md:max-w-lg md:py-10">
      <header className="relative flex items-center justify-center">
        <Link
          href="/"
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-2xl hover:bg-neutral-100 dark:hover:bg-neutral-900"
          aria-label="กลับ"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold">☕ สนับสนุนผู้พัฒนา</h1>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-neutral-500">
          ถ้าเล่นแล้วสนุก แวะเลี้ยงกาแฟผู้พัฒนาได้ที่ PromptPay นี้เลย 🙏
        </p>
        <div className="w-full max-w-xs overflow-hidden rounded-2xl border border-neutral-200 shadow-lg dark:border-neutral-800">
          <Image
            src={`${basePath}/donate-qr.jpg`}
            alt="PromptPay QR สำหรับ Donate"
            width={885}
            height={1200}
            className="h-auto w-full"
            priority
          />
        </div>
        <p className="text-xs text-neutral-400">ขอบคุณที่ช่วยสนับสนุนนะครับ 💛</p>
      </div>
    </main>
  );
}
