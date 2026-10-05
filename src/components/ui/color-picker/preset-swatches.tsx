import { cn } from "@/lib/utils";
import type { NamedColor } from "@/lib/color";

export default function PresetSwatches({
  presets,
  value,
  onSelect,
}: {
  presets: NamedColor[];
  value: string;
  onSelect: (hex: string) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Preset colors"
      className="flex flex-wrap gap-2"
    >
      {presets.map(({ name, hex }) => {
        const selected = hex === value;
        return (
          <button
            key={hex}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={selected}
            onClick={() => onSelect(hex)}
            className={cn(
              "size-6 cursor-pointer rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95",
              selected &&
                "ring-brown-700 dark:ring-dark-100 ring-offset-brown-50 dark:ring-offset-dark-900 ring-2 ring-offset-2"
            )}
            style={{ backgroundColor: hex }}
          />
        );
      })}
    </div>
  );
}
