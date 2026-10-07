import type { PointerEvent } from "react";
import { clamp } from "@/lib/color";

/*
  Reports where a pointer pressed inside the element is, as fractions (0-1) of its box. Pointer capture keeps the drag going outside the element, and the box is measured on screen, so the focus frame's scaling is already accounted for.
*/
export function pointerDragHandlers(onMove: (x: number, y: number) => void) {
  const report = (e: PointerEvent<HTMLElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    onMove(
      clamp((e.clientX - box.left) / box.width, 0, 1),
      clamp((e.clientY - box.top) / box.height, 0, 1)
    );
  };

  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      report(e);
    },
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) report(e);
    },
  };
}
