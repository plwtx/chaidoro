import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import SubHeaderDescription from "@/components/ui/sub-header-description";
import PatternFill from "@/components/ui/pattern-fill";
import { PATTERN_IDS, patternLabel } from "@/lib/backgroundPatterns";
import type { BackgroundPattern } from "@/types";
import { showSettingsToast } from "../../components/settings-toast";

const OPTIONS: BackgroundPattern[] = ["none", ...PATTERN_IDS];

export default function BackgroundPatternSelector() {
  const backgroundPattern = useAppStore((s) => s.settings.backgroundPattern);
  const setBackgroundPattern = useAppStore((s) => s.setBackgroundPattern);
  const hasImage = useAppStore((s) => Boolean(s.settings.backgroundImageKey));

  const handleSelect = async (pattern: BackgroundPattern) => {
    if (pattern === backgroundPattern) return;
    await setBackgroundPattern(pattern);
    showSettingsToast(
      `Background pattern set to ${patternLabel(pattern).toLowerCase()}.`
    );
  };

  return (
    <section>
      <SubHeaderDescription
        header={"Background pattern"}
        description={
          "A subtle repeating pattern behind the clock, drawn in a muted accent color (or the theme's brown while the accent is off)."
        }
      />
      {hasImage && (
        <p className="text-brown-600 dark:text-dark-100/60 mt-2 text-xs italic">
          Hidden while a background image is set. Remove the image below to see
          the pattern.
        </p>
      )}

      <div
        className={cn("grid grid-cols-5 gap-3 pt-6", hasImage && "opacity-60")}
      >
        {OPTIONS.map((pattern) => (
          <PatternOption
            key={pattern}
            pattern={pattern}
            selected={pattern === backgroundPattern}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </section>
  );
}

function PatternOption({
  pattern,
  selected,
  onSelect,
}: {
  pattern: BackgroundPattern;
  selected: boolean;
  onSelect: (pattern: BackgroundPattern) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(pattern)}
      className="flex cursor-pointer flex-col items-center gap-2"
    >
      {/* Preview on the clock screen's plain color */}
      <div
        className={cn(
          "bg-brown-50 dark:bg-dark-600 shadow-brown-300 dark:shadow-dark-900 relative h-20 w-full overflow-hidden rounded-xl border shadow-md transition-transform active:scale-95",
          selected
            ? "border-brown-800 dark:border-dark-100 border-2"
            : "border-brown-300 dark:border-black"
        )}
      >
        {pattern !== "none" && (
          <PatternFill pattern={pattern} className="absolute inset-0" />
        )}
      </div>
      <p className="flex items-center gap-1 text-xs font-medium">
        {selected && <Check size={14} />} {patternLabel(pattern)}
      </p>
    </button>
  );
}
