import { useEffect } from "react";
import { useNavigate, type NavigateFunction } from "react-router";
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
import { usePaletteStore } from "@/features/command-palette/paletteStore";

export function runShortcutAction(
  actionId: ShortcutActionId,
  navigate: NavigateFunction
) {
  const state = useAppStore.getState();
  switch (actionId) {
    case "openPalette":
      usePaletteStore.getState().toggle();
      break;
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
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (shortcutCapture.active) return;
      if (usePaletteStore.getState().open) return;
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

      e.preventDefault();
      runShortcutAction(match[0] as ShortcutActionId, navigate);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);
}
