import { describe, it, expect } from "vitest";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import {
  DURATION_PRESETS,
  matchPreset,
  presetDurations,
} from "../pages/05-timer/durationPresets";

const byId = (id: string) => DURATION_PRESETS.find((p) => p.id === id)!;

describe("duration presets", () => {
  it("converts a preset's minutes to the settings' seconds", () => {
    expect(presetDurations(byId("deep-work"))).toEqual({
      focusDuration: 3000,
      shortBreakDuration: 600,
      longBreakDuration: 1800,
    });
  });

  it("recognizes the default durations as Classic", () => {
    expect(matchPreset(DEFAULT_SETTINGS)?.id).toBe("classic");
  });

  it("finds the preset that was just applied", () => {
    for (const preset of DURATION_PRESETS) {
      expect(matchPreset(presetDurations(preset))).toBe(preset);
    }
  });

  it("returns null for a custom mix", () => {
    expect(
      matchPreset({
        focusDuration: 1800,
        shortBreakDuration: 300,
        longBreakDuration: 900,
      })
    ).toBeNull();
  });
});
