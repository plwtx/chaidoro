import { useEffect } from "react";
import { useAppStore } from "@/store/index";
import { timerBridge } from "../services/timerBridge";
import { soundManager } from "@/lib/soundManager";
import { notifyTimerComplete } from "@/lib/notifications";
import type { TimerMode } from "@/types";

function getNextMode(
  currentMode: TimerMode,
  focusCount: number,
  longBreakInterval: number
): TimerMode {
  if (currentMode === "focus") {
    return focusCount >= longBreakInterval ? "long-break" : "break";
  }
  return "focus";
}

function getDuration(
  mode: TimerMode,
  settings: {
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
  }
): number {
  switch (mode) {
    case "focus":
      return settings.focusDuration;
    case "break":
      return settings.shortBreakDuration;
    case "long-break":
      return settings.longBreakDuration;
  }
}

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

  function start() {
    if (store.status === "running") return;

    if (store.status === "paused") {
      timerBridge.resume();
      useAppStore.getState().resume();
      return;
    }

    // idle or finished - determine mode and start
    const state = useAppStore.getState();
    let mode: TimerMode;
    if (state.status === "finished") {
      mode = getNextMode(
        state.mode,
        state.focusCount,
        state.settings.longBreakInterval
      );
    } else {
      mode = state.mode;
    }

    const duration = getDuration(mode, state.settings);
    if (mode === "focus") soundManager.play("focusStart");
    timerBridge.start("countdown", duration);
    state.start(mode, duration, state.activeTaskId);
  }

  function pause() {
    if (store.status !== "running") return;
    timerBridge.pause();
    useAppStore.getState().pause();
  }

  function endCycle() {
    const state = useAppStore.getState();
    if (state.status === "idle") return;

    const currentMode = state.mode;

    if (state.status !== "finished" && state.elapsed > 0) {
      state.finish();
    }

    timerBridge.reset();
    useAppStore.getState().reset();

    // After ending focus, transition to break ;-;
    if (currentMode === "focus") {
      const s = useAppStore.getState();
      const nextMode = getNextMode(
        "focus",
        s.focusCount,
        s.settings.longBreakInterval
      );
      useAppStore.setState({ mode: nextMode });
    }
  }

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
    start,
    pause,
    endCycle,
  };
}
