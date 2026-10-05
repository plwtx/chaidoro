import { useEffect, useEffectEvent, type RefObject } from "react";

export type DismissReason = "outside" | "escape";

/*
  While active, calls onDismiss for a pointerdown outside the element or an Escape key press. For popovers and menus; the reason lets Escape hand focus back while an outside click keeps it where it landed.
*/
export function useDismiss(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
  onDismiss: (reason: DismissReason) => void
) {
  const dismiss = useEffectEvent(onDismiss);

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) dismiss("outside");
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss("escape");
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ref, active]);
}
