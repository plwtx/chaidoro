import { describe, it, expect } from "vitest";
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  THEME_BACKGROUNDS,
  accentCssVariables,
  accentLabel,
  buildAccentPalette,
  type ThemeMode,
} from "../accent";
import { contrastRatio, hsvToHex } from "../color";

const MODES: ThemeMode[] = ["light", "dark"];

describe("accentLabel - the name next to the swatch", () => {
  it("names presets, whatever the hex casing", () => {
    expect(accentLabel("#B07A52")).toBe("Chai");
    expect(accentLabel("#7d9459")).toBe("Matcha");
  });

  it("shows a custom color as its hex code", () => {
    expect(accentLabel("#123abc")).toBe("#123ABC");
  });
});

describe("buildAccentPalette - one color, a readable shade per theme", () => {
  it("shows every preset unchanged on both themes", () => {
    for (const { hex } of ACCENT_PRESETS) {
      const palette = buildAccentPalette(hex);
      expect(palette.light.base).toBe(hex);
      expect(palette.dark.base).toBe(hex);
    }
  });

  it("keeps every shade readable, including the extremes", () => {
    // A spread of hues, saturations and brightness levels, black and white included
    const colors: string[] = [];
    for (let h = 0; h < 360; h += 30) {
      for (const s of [0, 0.5, 1]) {
        for (const v of [0, 0.35, 0.7, 1]) colors.push(hsvToHex({ h, s, v }));
      }
    }

    for (const hex of colors) {
      const palette = buildAccentPalette(hex);
      for (const mode of MODES) {
        const background = THEME_BACKGROUNDS[mode];
        expect(
          contrastRatio(palette[mode].base, background)
        ).toBeGreaterThanOrEqual(3);
        expect(
          contrastRatio(palette[mode].muted, background)
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe("accentCssVariables", () => {
  it("writes the base and muted shade for both themes", () => {
    const palette = buildAccentPalette(DEFAULT_ACCENT);
    expect(accentCssVariables(palette)).toEqual({
      "--accent-light": palette.light.base,
      "--accent-light-muted": palette.light.muted,
      "--accent-dark": palette.dark.base,
      "--accent-dark-muted": palette.dark.muted,
    });
  });
});
