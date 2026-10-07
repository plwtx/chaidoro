import { describe, it, expect } from "vitest";
import {
  contrastRatio,
  ensureContrast,
  hexToHsv,
  hexToOklch,
  hexToRgb,
  hsvToHex,
  normalizeHex,
  oklchToHex,
  scaleChroma,
} from "../color";

const LIGHT_BG = "#fbf8f7";
const DARK_BG = "#262524";

describe("normalizeHex - what counts as a hex code", () => {
  it("expands short codes and lower-cases", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex("a1B2c3")).toBe("#a1b2c3");
    expect(normalizeHex("  #A1B2C3 ")).toBe("#a1b2c3");
  });

  it("rejects anything else", () => {
    for (const bad of [
      "",
      "#abcd",
      "#ggg",
      "red",
      "#a1b2c3d4",
      42,
      null,
      undefined,
    ]) {
      expect(normalizeHex(bad)).toBeNull();
    }
  });
});

describe("conversions - round trips back to the same hex", () => {
  const samples = [
    "#000000",
    "#ffffff",
    "#808080",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#b07a52",
    "#6a7fb5",
    "#1b1a19",
    "#fbf8f7",
  ];

  it.each(samples)("HSV keeps %s", (hex) => {
    expect(hsvToHex(hexToHsv(hex))).toBe(hex);
  });

  it.each(samples)("OKLCH keeps %s", (hex) => {
    expect(oklchToHex(hexToOklch(hex))).toBe(hex);
  });
});

describe("contrastRatio", () => {
  it("runs from 1 (same color) to 21 (black on white)", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#b07a52", "#b07a52")).toBe(1);
  });
});

describe("ensureContrast - moves lightness only as far as needed", () => {
  it("returns a color that already passes unchanged", () => {
    expect(ensureContrast("#262423", LIGHT_BG, 4.5)).toBe("#262423");
  });

  it("lightens a dark color on a dark background, keeping its hue", () => {
    const indigo = "#2a1f5c";
    const out = ensureContrast(indigo, DARK_BG, 3);

    expect(contrastRatio(out, DARK_BG)).toBeGreaterThanOrEqual(3);
    // Just enough, not all the way to white
    expect(contrastRatio(out, DARK_BG)).toBeLessThan(3.2);
    expect(hexToOklch(out).h).toBeCloseTo(hexToOklch(indigo).h, -1);
  });

  it("darkens a pale color on a light background, keeping its hue", () => {
    const butter = "#f2dc8b";
    const out = ensureContrast(butter, LIGHT_BG, 3);

    expect(contrastRatio(out, LIGHT_BG)).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(out, LIGHT_BG)).toBeLessThan(3.2);
    expect(hexToOklch(out).h).toBeCloseTo(hexToOklch(butter).h, -1);
  });
});

describe("scaleChroma", () => {
  it("0 gives the grey of the same lightness", () => {
    const grey = scaleChroma("#b07a52", 0);
    const { r, g, b } = hexToRgb(grey);

    expect(Math.max(r, g, b) - Math.min(r, g, b)).toBeLessThanOrEqual(1);
    expect(hexToOklch(grey).l).toBeCloseTo(hexToOklch("#b07a52").l, 2);
  });
});
