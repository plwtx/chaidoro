import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import {
  BACKGROUND_PATTERNS,
  PATTERN_IDS,
  patternSvg,
  type PatternId,
} from "@/lib/backgroundPatterns";

function maskStyle(id: PatternId): CSSProperties {
  const { width, height } = BACKGROUND_PATTERNS[id];
  const image = `url("data:image/svg+xml,${encodeURIComponent(patternSvg(id))}")`;
  const size = `${width}px ${height}px`;
  return {
    maskImage: image,
    WebkitMaskImage: image,
    maskSize: size,
    WebkitMaskSize: size,
    maskRepeat: "repeat",
    WebkitMaskRepeat: "repeat",
  };
}

/* Encoded once per pattern; at runtime only the color token changes. */
const MASK_STYLES = Object.fromEntries(
  PATTERN_IDS.map((id) => [id, maskStyle(id)])
) as Record<PatternId, CSSProperties>;

/*
  Fills its box with a background pattern in the --pattern-fg color (muted accent or the theme brown). Purely decorative.
*/
export default function PatternFill({
  pattern,
  className,
}: {
  pattern: PatternId;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      data-pattern={pattern}
      className={cn("pointer-events-none bg-[var(--pattern-fg)]", className)}
      style={MASK_STYLES[pattern]}
    />
  );
}
