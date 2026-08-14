import { useEffect } from "react";
import { soundManager, type SoundEventId } from "@/lib/soundManager";

export function useAppSounds() {
  useEffect(() => {
    soundManager.preload();

    const handlePointerDown = (e: PointerEvent) => {
      // Primary button / touch only.
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      const override = target
        ?.closest?.("[data-sound]")
        ?.getAttribute("data-sound");
      if (override === "none") return;
      soundManager.play((override as SoundEventId) ?? "click");
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, []);
}
