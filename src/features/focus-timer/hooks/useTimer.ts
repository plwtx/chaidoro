import { useEffect } from "react";
import { useAppStore } from "@/store/index";
import { timerBridge } from "../services/timerBridge";
import {
  getDuration,
  startTimer,
  pauseTimer,
  endCycleTimer,
  autoStartNext,
  shouldAutoStart,
  addOvertime,
  dismissOvertime,
} from "../services/timerControls";
import { soundManager } from "@/lib/soundManager";
import { notifyTimerComplete } from "@/lib/notifications";

export function useTimerBridge() {
  useEffect(() => {
    const unsubTick = timerBridge.onTick(() => {
      const state = useAppStore.getState();
      // The same worker ticks both phases; overtime counts up on its own field.
      if (state.status === "overtime") {
        state.overtimeTick();
      } else {
        state.tick();
      }
    });

    const unsubComplete = timerBridge.onComplete(() => {
      const pre = useAppStore.getState();
      const finishedMode = pre.mode;
      pre.finish();

      soundManager.play(
        finishedMode === "focus" ? "focusComplete" : "breakComplete"
      );

      const state = useAppStore.getState();
      const { settings } = state;

      /*
        Focus overtime: the session is saved at its target duration, then the worker flips to counting up. The next cycle is held back until the user adds or dismisses the extra time.
      */
      if (finishedMode === "focus" && settings.overtimeEnabled) {
        notifyTimerComplete(finishedMode, true);
        state.beginOvertime();
        timerBridge.start("countup", 0);
        return;
      }

      notifyTimerComplete(finishedMode);

      if (shouldAutoStart(finishedMode)) autoStartNext(finishedMode);
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
        : store.status === "overtime"
          ? store.overtimeElapsed
          : Math.max(0, store.targetDuration - store.elapsed),
    status: store.status,
    mode: store.mode,
    elapsed: store.elapsed,
    targetDuration: store.targetDuration,
    focusCount: store.focusCount,
    overtimeElapsed: store.overtimeElapsed,
    start: startTimer,
    pause: pauseTimer,
    endCycle: endCycleTimer,
    addOvertime,
    dismissOvertime,
  };
}
