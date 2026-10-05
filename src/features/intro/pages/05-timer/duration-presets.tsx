import { useAppStore } from "@/store";
import OptionCard from "../../components/option-card";
import {
  DURATION_PRESETS,
  matchPreset,
  presetDurations,
} from "./durationPresets";

const toMinutes = (seconds: number) => Math.round(seconds / 60);

/*
  One-click focus / break / long break durations. Locked while a cycle is running, like Settings > Clock.
*/
export default function DurationPresets() {
  const focusDuration = useAppStore((s) => s.settings.focusDuration);
  const shortBreakDuration = useAppStore((s) => s.settings.shortBreakDuration);
  const longBreakDuration = useAppStore((s) => s.settings.longBreakDuration);
  const timerActive = useAppStore((s) => s.status !== "idle");
  const updateSettings = useAppStore((s) => s.updateSettings);

  const current = matchPreset({
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
  });

  const note = timerActive
    ? "Pause or finish the current cycle to change durations."
    : current
      ? "Minutes of focus / break / long break. Exact values are in Settings > Clock."
      : `Now: ${toMinutes(focusDuration)} / ${toMinutes(shortBreakDuration)} / ${toMinutes(longBreakDuration)} min (custom, from Settings > Clock).`;

  return (
    <>
      <div
        role="group"
        aria-label="Duration presets"
        className="grid grid-cols-3 gap-2"
      >
        {DURATION_PRESETS.map((preset) => (
          <OptionCard
            key={preset.id}
            selected={current?.id === preset.id}
            disabled={timerActive}
            onSelect={() => updateSettings(presetDurations(preset))}
          >
            {preset.label}
            <span className="font-fragment-mono text-[10px] font-normal tracking-tight whitespace-nowrap opacity-70">
              {preset.focus} / {preset.shortBreak} / {preset.longBreak}
            </span>
          </OptionCard>
        ))}
      </div>
      <p className="font-fragment-mono text-brown-600 dark:text-dark-100/55 text-[11px] leading-4">
        {note}
      </p>
    </>
  );
}
