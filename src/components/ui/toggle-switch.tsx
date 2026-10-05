import { cn } from "@/lib/utils";

export default function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "bg-brown-200 dark:bg-dark-900 group border-brown-500 shadow-brown-600 dark:border-dark-900 h-6 w-12 cursor-pointer overflow-clip rounded-full border p-1 shadow-inner dark:shadow-black",
        checked && "bg-brown-700 dark:bg-dark-100 accent:bg-accent",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      <div
        className={cn(
          "bg-brown-700 shadow-brown-800 dark:bg-dark-100 h-4 w-4 rounded-full shadow-sm transition-transform dark:shadow-black",
          checked
            ? "bg-brown-200 dark:bg-dark-900 accent:bg-accent-foreground translate-x-6"
            : "translate-x-0"
        )}
      />
    </button>
  );
}
