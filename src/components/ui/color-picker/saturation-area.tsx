import type { KeyboardEvent } from "react";
import { clamp, hsvToHex, type Hsv } from "@/lib/color";
import { pointerDragHandlers } from "./pointer-drag";

/* Arrow key moves as [saturation, brightness] directions */
const KEY_MOVES: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowDown: [0, -1],
  ArrowUp: [0, 1],
};
const STEP = 0.01;
const LARGE_STEP = 0.1;

/* Saturation (left to right) by brightness (bottom to top) for the current hue. */
export default function SaturationArea({
  hsv,
  onChange,
}: {
  hsv: Hsv;
  onChange: (next: Hsv) => void;
}) {
  const drag = pointerDragHandlers((x, y) =>
    onChange({ ...hsv, s: x, v: 1 - y })
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const move = KEY_MOVES[e.key];
    if (!move) return;
    e.preventDefault();
    e.stopPropagation();
    const step = e.shiftKey ? LARGE_STEP : STEP;
    onChange({
      ...hsv,
      s: clamp(hsv.s + move[0] * step, 0, 1),
      v: clamp(hsv.v + move[1] * step, 0, 1),
    });
  };

  const saturation = Math.round(hsv.s * 100);
  const brightness = Math.round(hsv.v * 100);

  return (
    <div
      {...drag}
      role="slider"
      tabIndex={0}
      aria-label="Saturation and brightness"
      aria-valuenow={saturation}
      aria-valuetext={`Saturation ${saturation}%, brightness ${brightness}%`}
      onKeyDown={handleKeyDown}
      // Dragging should not trigger the global click sound
      data-sound="none"
      className="focus-visible:ring-brown-500 dark:focus-visible:ring-dark-100 relative h-36 w-full cursor-crosshair touch-none rounded-lg outline-none focus-visible:ring-2"
      style={{ backgroundColor: hsvToHex({ h: hsv.h, s: 1, v: 1 }) }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-linear-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-0 rounded-lg bg-linear-to-t from-black to-transparent" />
      <div
        className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md shadow-black/40"
        style={{
          left: `${hsv.s * 100}%`,
          top: `${(1 - hsv.v) * 100}%`,
          backgroundColor: hsvToHex(hsv),
        }}
      />
    </div>
  );
}
