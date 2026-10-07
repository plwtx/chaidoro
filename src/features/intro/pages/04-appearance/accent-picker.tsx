import { Ban } from "lucide-react";
import { useAppStore } from "@/store";
import { ACCENT_PRESETS, accentLabel } from "@/lib/accent";
import PresetSwatches from "@/components/ui/color-picker/preset-swatches";
import { cn } from "@/lib/utils";

/*
  One click picks a preset and turns the accent on; "No accent" turns it off. The custom color picker stays in Settings > Theme.
*/
export default function AccentPicker() {
  const accentEnabled = useAppStore((s) => s.settings.accentEnabled);
  const accentColor = useAppStore((s) => s.settings.accentColor);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        title="No accent"
        aria-label="No accent"
        aria-pressed={!accentEnabled}
        onClick={() => updateSettings({ accentEnabled: false })}
        className={cn(
          "border-brown-300 text-brown-500 dark:border-dark-100/30 dark:text-dark-100/60 flex size-6 cursor-pointer items-center justify-center rounded-full border transition-transform hover:scale-110 active:scale-95",
          !accentEnabled &&
            "ring-brown-700 dark:ring-dark-100 ring-offset-brown-50 dark:ring-offset-dark-900 ring-2 ring-offset-2"
        )}
      >
        <Ban className="size-3.5" />
      </button>
      <PresetSwatches
        presets={ACCENT_PRESETS}
        value={accentEnabled ? accentColor : ""}
        onSelect={(hex) =>
          updateSettings({ accentEnabled: true, accentColor: hex })
        }
      />
      <span className="font-fragment-mono text-brown-600 dark:text-dark-100/55 ml-1 text-[11px]">
        {accentEnabled ? accentLabel(accentColor) : "none"}
      </span>
    </div>
  );
}
