import { useEffect } from "react";
import { useAppStore } from "@/store/index";
import { timerBridge } from "../services/timerBridge";
import {
  getNextMode,
  getDuration,
  startTimer,
  pauseTimer,
  endCycleTimer,
} from "../services/timerControls";
import { soundManager } from "@/lib/soundManager";
import { notifyTimerComplete } from "@/lib/notifications";

export function useTimerBridge() {
  useEffect(() => {
    const unsubTick = timerBridge.onTick(() => {
      useAppStore.getState().tick();
    });

    const unsubComplete = timerBridge.onComplete(() => {
      const pre = useAppStore.getState();
      const finishedMode = pre.mode;
      pre.finish();

      soundManager.play(
        finishedMode === "focus" ? "focusComplete" : "breakComplete"
      );
      notifyTimerComplete(finishedMode);

      const state = useAppStore.getState();
      const { settings } = state;

      const shouldAutoStart =
        finishedMode === "focus"
          ? settings.autoStartBreak
          : settings.autoStartFocus;

      if (shouldAutoStart) {
        const nextMode = getNextMode(
          finishedMode,
          state.focusCount,
          settings.longBreakInterval
        );
        const duration = getDuration(nextMode, settings);
        if (nextMode === "focus") soundManager.play("focusStart");
        timerBridge.start("countdown", duration);
        state.start(nextMode, duration, state.taskId);
      }
    });

    return () => {
      unsubTick();
      unsubComplete();
    };
  }, []);
}

export function useTimer() {
  const store = useAppStore();

  return {
    seconds:
      store.status === "idle"
        ? getDuration(store.mode, store.settings)
        : Math.max(0, store.targetDuration - store.elapsed),
    status: store.status,
    mode: store.mode,
    elapsed: store.elapsed,
    targetDuration: store.targetDuration,
    focusCount: store.focusCount,
    start: startTimer,
    pause: pauseTimer,
    endCycle: endCycleTimer,
  };
}
