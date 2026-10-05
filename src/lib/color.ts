/*
  Small color toolkit for the accent picker and palette: hex parsing, HSV (what the picker edits), OKLCH (perceptual lightness tweaks) and WCAG contrast. Everything here is pure.
*/

export interface Rgb {
  /* Channels 0-255 */
  r: number;
  g: number;
  b: number;
}

export interface Hsv {
  /* Hue 0-360, saturation and value 0-1 */
  h: number;
  s: number;
  v: number;
}

export interface Oklch {
  /* Lightness 0-1, chroma from 0 (grey), hue 0-360 */
  l: number;
  c: number;
  h: number;
}

export interface NamedColor {
  name: string;
  hex: string;
}

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* "#ABC", "abc" or "#aabbcc" -> "#aabbcc". Anything else -> null. */
export function normalizeHex(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  const digits = match[1].toLowerCase();
  const full =
    digits.length === 3
      ? digits
          .split("")
          .map((d) => d + d)
          .join("")
      : digits;
  return `#${full}`;
}

export function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const channel = (x: number) =>
    Math.round(clamp(x, 0, 255))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/* HSV */

export function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * clamp(Math.min(k, 4 - k), 0, 1);
  };
  return rgbToHex({ r: f(5) * 255, g: f(3) * 255, b: f(1) * 255 });
}

export function hexToHsv(hex: string): Hsv {
  const { r, g, b } = hexToRgb(hex);
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const delta = max - Math.min(rn, gn, bn);

  let h = 0;
  if (delta > 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h = (h * 60 + 360) % 360;
  }

  return { h, s: max === 0 ? 0 : delta / max, v: max };
}

/* OKLCH  */

const toLinear = (c: number) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const fromLinear = (c: number) =>
  c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;

function linearRgb(hex: string): [number, number, number] {
  const { r, g, b } = hexToRgb(hex);
  return [toLinear(r / 255), toLinear(g / 255), toLinear(b / 255)];
}

export function hexToOklch(hex: string): Oklch {
  const [r, g, b] = linearRgb(hex);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  return {
    l: lightness,
    c: Math.hypot(a, bAxis),
    h: ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360,
  };
}

function oklchToLinearRgb({ l, c, h }: Oklch): [number, number, number] {
  const hue = (h * Math.PI) / 180;
  const a = c * Math.cos(hue);
  const bAxis = c * Math.sin(hue);

  const lCone = (l + 0.3963377774 * a + 0.2158037573 * bAxis) ** 3;
  const mCone = (l - 0.1055613458 * a - 0.0638541728 * bAxis) ** 3;
  const sCone = (l - 0.0894841775 * a - 1.291485548 * bAxis) ** 3;

  return [
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  ];
}

const GAMUT_EPSILON = 1e-4;
const inGamut = (rgb: number[]) =>
  rgb.every((x) => x >= -GAMUT_EPSILON && x <= 1 + GAMUT_EPSILON);

/*
  Back to hex. A color sRGB cannot show loses chroma (binary search) instead of being clipped per channel, so its hue stays put.
*/
export function oklchToHex(color: Oklch): string {
  const lch = { ...color, l: clamp(color.l, 0, 1) };
  let rgb = oklchToLinearRgb(lch);

  if (!inGamut(rgb)) {
    let fits = 0;
    let overflows = lch.c;
    for (let i = 0; i < 20; i++) {
      const mid = (fits + overflows) / 2;
      if (inGamut(oklchToLinearRgb({ ...lch, c: mid }))) fits = mid;
      else overflows = mid;
    }
    rgb = oklchToLinearRgb({ ...lch, c: fits });
  }

  const [r, g, b] = rgb.map((x) => fromLinear(clamp(x, 0, 1)) * 255);
  return rgbToHex({ r, g, b });
}

/* Scales chroma: 0 gives the grey of the same lightness, 1 the color itself. */
export function scaleChroma(hex: string, factor: number): string {
  const lch = hexToOklch(hex);
  return oklchToHex({ ...lch, c: lch.c * factor });
}

/* WCAG 2 contrast */

export function relativeLuminance(hex: string): number {
  const [r, g, b] = linearRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/* 1 (same luminance) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/* Background luminance where black and white text contrast equally. */
const CONTRAST_PIVOT = 0.179;

/*
  Moves a color's OKLCH lightness away from the background just far enough to reach minRatio. Hue and chroma are kept (chroma only shrinks where sRGB cannot show it), and a color that already passes comes back unchanged.
*/
export function ensureContrast(
  hex: string,
  background: string,
  minRatio: number
): string {
  if (contrastRatio(hex, background) >= minRatio) return hex;

  const lch = hexToOklch(hex);
  const passes = (l: number) =>
    contrastRatio(oklchToHex({ ...lch, l }), background) >= minRatio;

  // Light backgrounds push the color darker, dark ones lighter. The far end (black / white) always passes for the app's backgrounds.
  let pass = relativeLuminance(background) > CONTRAST_PIVOT ? 0 : 1;
  let fail = lch.l;
  for (let i = 0; i < 24; i++) {
    const mid = (pass + fail) / 2;
    if (passes(mid)) pass = mid;
    else fail = mid;
  }

  return oklchToHex({ ...lch, l: pass });
}
