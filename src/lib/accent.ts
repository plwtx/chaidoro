import {
  ensureContrast,
  normalizeHex,
  scaleChroma,
  type NamedColor,
} from "./color";

/*
  Accent color domain: the tea-named presets, the label shown next to the swatch, and the shades derived for each theme. useAccentSync writes those shades to <html> through accentCssVariables.
*/

/* Muted mid-tones, so every preset reads on both themes without being adjusted. */
export const ACCENT_PRESETS: NamedColor[] = [
  { name: "Chai", hex: "#b07a52" },
  { name: "Rooibos", hex: "#a85d45" },
  { name: "Hibiscus", hex: "#a95c74" },
  { name: "Lavender", hex: "#8f7fb0" },
  { name: "Butterfly pea", hex: "#6a7fb5" },
  { name: "Earl Grey", hex: "#6f8096" },
  { name: "Mint", hex: "#5f9585" },
  { name: "Matcha", hex: "#7d9459" },
  { name: "Chamomile", hex: "#a3873c" },
];

export const DEFAULT_ACCENT = ACCENT_PRESETS[0].hex;

/* Preset name when the color is a preset, otherwise its hex code. */
export function accentLabel(hex: string): string {
  const normalized = normalizeHex(hex) ?? hex;
  const preset = ACCENT_PRESETS.find((p) => p.hex === normalized);
  return preset ? preset.name : normalized.toUpperCase();
}

/* Page backgrounds the accent is read against. Mirrors brown-50 / dark-600 in index.css. */
export const THEME_BACKGROUNDS = { light: "#fbf8f7", dark: "#262524" };

export type ThemeMode = keyof typeof THEME_BACKGROUNDS;

/* WCAG minimums: 3:1 for large text and UI shapes, 4.5:1 for small text. */
const UI_CONTRAST = 3;
const TEXT_CONTRAST = 4.5;
/* Share of the chroma the muted shade keeps. */
const MUTED_CHROMA = 0.55;

export interface AccentShades {
  /* Clock digits, fills and other large shapes */
  base: string;
  /* Desaturated and text-safe: button fills, the "today" total and background pattern lines */
  muted: string;
}

export type AccentPalette = Record<ThemeMode, AccentShades>;

/*
  The picked color as each theme shows it. A shade only moves (in lightness, keeping its hue) when it would be too faint on that theme's background, so mid-tones come back unchanged.
*/
export function buildAccentPalette(hex: string): AccentPalette {
  return {
    light: shadesOn(hex, THEME_BACKGROUNDS.light),
    dark: shadesOn(hex, THEME_BACKGROUNDS.dark),
  };
}

function shadesOn(hex: string, background: string): AccentShades {
  return {
    base: ensureContrast(hex, background, UI_CONTRAST),
    muted: ensureContrast(
      scaleChroma(hex, MUTED_CHROMA),
      background,
      TEXT_CONTRAST
    ),
  };
}

/*
  Custom properties for <html>. index.css maps them to --accent / --accent-muted for the active theme.
*/
export function accentCssVariables(
  palette: AccentPalette
): Record<string, string> {
  const variables: Record<string, string> = {};
  for (const mode of Object.keys(palette) as ThemeMode[]) {
    variables[`--accent-${mode}`] = palette[mode].base;
    variables[`--accent-${mode}-muted`] = palette[mode].muted;
  }
  return variables;
}
