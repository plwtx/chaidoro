import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OptionCardProps {
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  children: ReactNode;
}

/*
  One choice in a group of options (color mode, duration preset). A pressed / unpressed button, so screen readers announce the current pick.
*/
export default function OptionCard({
  selected,
  onSelect,
  disabled = false,
  children,
}: OptionCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "text-brown-800 dark:text-dark-100 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-2 py-3 text-sm transition-all enabled:active:scale-95 disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-brown-700 bg-brown-200/75 dark:border-dark-100 dark:bg-dark-900 accent:border-accent font-medium"
          : "border-brown-200 hover:bg-brown-100/75 dark:border-dark-900 dark:hover:bg-dark-900/60"
      )}
    >
      {children}
    </button>
  );
}
