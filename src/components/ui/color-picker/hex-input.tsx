import { useState } from "react";
import { cn } from "@/lib/utils";
import { normalizeHex } from "@/lib/color";

/*
  Hex code field: Anything invalid reverts to the current color.
*/
export default function HexInput({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (hex: string) => void;
}) {
  // null while not editing, so the field follows the picked color
  const [draft, setDraft] = useState<string | null>(null);
  const text = draft ?? value.slice(1).toUpperCase();
  const invalid = draft !== null && normalizeHex(draft) === null;

  const commit = () => {
    const hex = normalizeHex(text);
    if (hex && hex !== value) onCommit(hex);
    setDraft(null);
  };

  return (
    <label
      className={cn(
        "bg-brown-100 dark:bg-dark-600 text-brown-900 dark:text-dark-100 shadow-brown-300 flex h-9 items-center gap-1 rounded-lg border px-3 font-mono text-xs shadow-inner dark:shadow-black",
        invalid
          ? "border-red-400 dark:border-red-900"
          : "border-brown-300 dark:border-black"
      )}
    >
      <span className="opacity-60">#</span>
      <input
        value={text}
        onChange={(e) => {
          const next = e.target.value
            .replace(/[^0-9a-f]/gi, "")
            .slice(0, 6)
            .toUpperCase();
          setDraft(next);
          if (next.length === 6) onCommit(`#${next.toLowerCase()}`);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
        }}
        aria-label="Hex color code"
        aria-invalid={invalid}
        spellCheck={false}
        autoComplete="off"
        className="w-full bg-transparent outline-none"
      />
    </label>
  );
}
