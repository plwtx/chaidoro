import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAppStore } from "@/store/index";
import {
  comboFromEvent,
  isEditableTarget,
  shortcutCapture,
  type ShortcutActionId,
} from "@/lib/shortcuts";
import {
  startTimer,
  pauseTimer,
  endCycleTimer,
} from "@/features/focus-timer/services/timerControls";
import { soundManager } from "@/lib/soundManager";
import { showSettingsToast } from "@/features/settings/components/settings-toast";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const runAction = (actionId: ShortcutActionId) => {
      const state = useAppStore.getState();
      switch (actionId) {
        case "timerToggle":
          if (state.status === "running") {
            pauseTimer();
          } else {
            startTimer();
          }
          break;
        case "timerEndCycle":
          endCycleTimer();
          break;
        case "navTimer":
          soundManager.play("navigation");
          navigate("/");
          break;
        case "navStatistics":
          soundManager.play("navigation");
          navigate("/statistics");
          break;
        case "navSettings":
          soundManager.play("navigation");
          navigate("/settings");
          break;
        case "toggleMute": {
          const enabled = state.settings.sounds.enabled;
          state.setSoundsEnabled(!enabled);
          showSettingsToast(`Sounds ${enabled ? "disabled" : "enabled"}.`);
          break;
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (shortcutCapture.active) return;
      if (e.repeat) return;
      if (isEditableTarget(e.target)) return;

      const { shortcuts } = useAppStore.getState().settings;
      if (!shortcuts.enabled) return;

      const combo = comboFromEvent(e);
      if (!combo) return;

      const match = Object.entries(shortcuts.bindings).find(
        ([, bound]) => bound === combo
      );
      if (!match) return;

      // Also suppresses the browser default (e.g. Space scrolling the page or re-activating a still-focused button).
      e.preventDefault();
      runAction(match[0] as ShortcutActionId);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);
}
