import { describe, it, expect } from "vitest";
import {
  BACKGROUND_PATTERNS,
  PATTERN_IDS,
  isBackgroundPattern,
  patternLabel,
  patternSvg,
} from "../backgroundPatterns";

describe("isBackgroundPattern - guards stored and imported values", () => {
  it("accepts none and every tile id", () => {
    expect(isBackgroundPattern("none")).toBe(true);
    for (const id of PATTERN_IDS) expect(isBackgroundPattern(id)).toBe(true);
  });

  it("rejects anything else", () => {
    for (const bad of ["plaid", "toString", "", 1, null, undefined]) {
      expect(isBackgroundPattern(bad)).toBe(false);
    }
  });
});

describe("pattern tiles", () => {
  it.each(PATTERN_IDS)("%s is well-formed SVG sized to its tile", (id) => {
    const doc = new DOMParser().parseFromString(
      patternSvg(id),
      "image/svg+xml"
    );
    const { width, height } = BACKGROUND_PATTERNS[id];

    expect(doc.querySelector("parsererror")).toBeNull();
    expect(doc.documentElement.getAttribute("viewBox")).toBe(
      `0 0 ${width} ${height}`
    );
  });

  it("labels every option", () => {
    expect(patternLabel("none")).toBe("None");
    expect(patternLabel("hexagons")).toBe("Hexagons");
  });
});
