"use client";

export default function ModeCard({
  emoji,
  label,
  onClick,
}: {
  emoji: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-2xl border border-neutral-200 p-4 transition hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-neutral-100 text-4xl dark:bg-neutral-800">
        {emoji}
      </div>
      <span className="font-medium">{label}</span>
    </button>
  );
}
