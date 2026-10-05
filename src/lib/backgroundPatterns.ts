import type { BackgroundPattern } from "@/types";

/*
  Background pattern tiles: original SVGs. Each tile is drawn in black and used as a CSS mask (components/ui/pattern-fill.tsx), so its color comes from the --pattern-fg token and follows the theme and accent without re-encoding anything.
*/

export type PatternId = Exclude<BackgroundPattern, "none">;

export interface PatternTile {
  label: string;
  /* Tile size in px; the tile repeats in both directions */
  width: number;
  height: number;
  /* SVG markup inside the tile's viewBox */
  shapes: string;
}

/* Lines that reach a tile edge continue past it, so neighbouring tiles join without notches. */
const LINE =
  'fill="none" stroke="#000" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"';

export const BACKGROUND_PATTERNS: Record<PatternId, PatternTile> = {
  dots: {
    label: "Dots",
    width: 24,
    height: 24,
    shapes: '<circle cx="6" cy="6" r="1.5"/><circle cx="18" cy="18" r="1.5"/>',
  },
  grid: {
    label: "Grid",
    width: 28,
    height: 28,
    shapes: '<path d="M0 0h28v1H0zM0 1h1v27H0z"/>',
  },
  diagonal: {
    label: "Diagonal",
    width: 16,
    height: 16,
    shapes: `<path ${LINE} d="M-4 4l8-8M0 16 16 0M12 20l8-8"/>`,
  },
  cross: {
    label: "Cross",
    width: 28,
    height: 28,
    shapes: '<path d="M13 10h2v3h3v2h-3v3h-2v-3h-3v-2h3z"/>',
  },
  zigzag: {
    label: "Zigzag",
    width: 24,
    height: 12,
    shapes: `<path ${LINE} d="M-6 3l6 6 6-6 6 6 6-6 6 6 6-6"/>`,
  },
  waves: {
    label: "Waves",
    width: 40,
    height: 16,
    shapes: `<path ${LINE} d="M-20 8q10 6 20 0t20 0 20 0 20 0"/>`,
  },
  checkers: {
    label: "Checkers",
    width: 20,
    height: 20,
    shapes: '<path d="M0 0h10v10H0zM10 10h10v10H10z"/>',
  },
  hexagons: {
    label: "Hexagons",
    width: 24,
    height: 40,
    shapes: `<path ${LINE} d="M12 0v6.67L0 13.33v13.34l12 6.66V40M12 6.67l12 6.66v13.34l-12 6.66"/>`,
  },
  leaves: {
    label: "Leaves",
    width: 40,
    height: 40,
    shapes: `<path ${LINE} d="M7 19C7 13 11 9 17 9c0 6-4 10-10 10zm0 0 7-7M25 25c6 0 10 4 10 10-6 0-10-4-10-10zm0 0 7 7"/>`,
  },
};

/* Settings order */
export const PATTERN_IDS = Object.keys(BACKGROUND_PATTERNS) as PatternId[];

export function isBackgroundPattern(
  value: unknown
): value is BackgroundPattern {
  return value === "none" || PATTERN_IDS.includes(value as PatternId);
}

export function patternLabel(pattern: BackgroundPattern): string {
  return pattern === "none" ? "None" : BACKGROUND_PATTERNS[pattern].label;
}

export function patternSvg(id: PatternId): string {
  const { width, height, shapes } = BACKGROUND_PATTERNS[id];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shapes}</svg>`;
}
