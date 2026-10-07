import type { KeyboardEvent } from "react";
import { clamp, hsvToHex } from "@/lib/color";
import { pointerDragHandlers } from "./pointer-drag";

const HUE_GRADIENT =
  "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)";
const KEY_DIRECTIONS: Record<string, number> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
};
const STEP = 1;
const LARGE_STEP = 10;

export default function HueSlider({
  hue,
  onChange,
}: {
  hue: number;
  onChange: (hue: number) => void;
}) {
  const drag = pointerDragHandlers((x) => onChange(x * 360));

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const direction = KEY_DIRECTIONS[e.key];
    if (direction === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    const step = e.shiftKey ? LARGE_STEP : STEP;
    onChange(clamp(hue + direction * step, 0, 360));
  };

  return (
    <div
      {...drag}
      role="slider"
      tabIndex={0}
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(hue)}
      onKeyDown={handleKeyDown}
      // Dragging should not trigger the global click sound
      data-sound="none"
      className="focus-visible:ring-brown-500 dark:focus-visible:ring-dark-100 relative h-3 w-full cursor-pointer touch-none rounded-full outline-none focus-visible:ring-2"
      style={{ background: HUE_GRADIENT }}
    >
      <div
        className="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md shadow-black/40"
        style={{
          left: `${(hue / 360) * 100}%`,
          backgroundColor: hsvToHex({ h: hue, s: 1, v: 1 }),
        }}
      />
    </div>
  );
}
