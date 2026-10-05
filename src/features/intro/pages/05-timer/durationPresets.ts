import type { Settings } from "@/types";

type Durations = Pick<
  Settings,
  "focusDuration" | "shortBreakDuration" | "longBreakDuration"
>;

export interface DurationPreset {
  id: string;
  label: string;
  /* Minutes */
  focus: number;
  shortBreak: number;
  longBreak: number;
}

/* "Classic" matches the default durations in DEFAULT_SETTINGS. */
export const DURATION_PRESETS: DurationPreset[] = [
  { id: "classic", label: "Classic", focus: 25, shortBreak: 5, longBreak: 15 },
  {
    id: "deep-work",
    label: "Deep work",
    focus: 50,
    shortBreak: 10,
    longBreak: 30,
  },
  { id: "short", label: "Short", focus: 15, shortBreak: 5, longBreak: 15 },
];

/* The settings a preset writes (settings store seconds). */
export function presetDurations(preset: DurationPreset): Durations {
  return {
    focusDuration: preset.focus * 60,
    shortBreakDuration: preset.shortBreak * 60,
    longBreakDuration: preset.longBreak * 60,
  };
}

/* The preset the current durations match, or null for a custom mix. */
export function matchPreset(durations: Durations): DurationPreset | null {
  return (
    DURATION_PRESETS.find((preset) => {
      const seconds = presetDurations(preset);
      return (
        seconds.focusDuration === durations.focusDuration &&
        seconds.shortBreakDuration === durations.shortBreakDuration &&
        seconds.longBreakDuration === durations.longBreakDuration
      );
    }) ?? null
  );
}
