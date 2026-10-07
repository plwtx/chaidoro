import { useEffect, useEffectEvent } from "react";
import { isEditableTarget } from "@/lib/shortcuts";

interface IntroKeyHandlers {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

/*
  Keys while the intro is open: the arrows move between pages and Escape skips. Enter and Space are left to the focused button. Keys with a modifier (Alt+Left is the browser's back) and keys typed into a field are ignored. The global shortcut dispatcher stands down meanwhile (see introState).
*/
export function useIntroKeyboard(handlers: IntroKeyHandlers) {
  const handleKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (isEditableTarget(e.target)) return;

    if (e.key === "ArrowRight") handlers.onNext();
    else if (e.key === "ArrowLeft") handlers.onBack();
    else if (e.key === "Escape") handlers.onSkip();
    else return;

    e.preventDefault();
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => handleKey(e);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
