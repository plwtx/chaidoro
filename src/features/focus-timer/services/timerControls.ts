import { useAppStore } from "@/store/index";
import { timerBridge } from "./timerBridge";
import { soundManager } from "@/lib/soundManager";
import type { TimerMode } from "@/types";

const MIN_RECORDED_FOCUS_SECONDS = 300;

export function getNextMode(
  currentMode: TimerMode,
  focusCount: number,
  longBreakInterval: number
): TimerMode {
  if (currentMode === "focus") {
    return focusCount >= longBreakInterval ? "long-break" : "break";
  }
  return "focus";
}

export function getDuration(
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

export function shouldAutoStart(finishedMode: TimerMode): boolean {
  const { settings } = useAppStore.getState();
  return finishedMode === "focus"
    ? settings.autoStartBreak
    : settings.autoStartFocus;
}

export function autoStartNext(finishedMode: TimerMode) {
  const state = useAppStore.getState();
  const { settings } = state;
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

export async function resolveOvertime(add: boolean) {
  const state = useAppStore.getState();
  if (state.status !== "overtime") return;

  timerBridge.reset();
  await state.resolveOvertime(add);

  if (shouldAutoStart("focus")) {
    autoStartNext("focus");
    return;
  }

  // Land on the break itself, ready to start, rather than sitting on a finished focus cycle.
  queueNextCycle("focus");
}

/*
  Leaves the timer idle on the cycle that follows `finishedMode`, so the clock already shows the next duration and the button just starts it.
*/
function queueNextCycle(finishedMode: TimerMode) {
  const state = useAppStore.getState();
  const nextMode = getNextMode(
    finishedMode,
    state.focusCount,
    state.settings.longBreakInterval
  );
  state.reset();
  useAppStore.setState({ mode: nextMode });
}

export function addOvertime() {
  return resolveOvertime(true);
}

export function dismissOvertime() {
  return resolveOvertime(false);
}

export function startTimer() {
  const state = useAppStore.getState();
  if (state.status === "running") return;

  if (state.status === "overtime") return;

  if (state.status === "paused") {
    // A cycle restored from a draft has no worker behind it yet, so it starts a fresh countdown from whatever time is left.
    if (timerBridge.hasWorker()) {
      timerBridge.resume();
    } else {
      timerBridge.start(
        "countdown",
        Math.max(0, state.targetDuration - state.elapsed)
      );
    }
    useAppStore.getState().resume();
    return;
  }

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

export function pauseTimer() {
  const state = useAppStore.getState();
  if (state.status !== "running") return;
  timerBridge.pause();
  useAppStore.getState().pause();
}

export function endCycleTimer() {
  const state = useAppStore.getState();
  if (state.status === "idle") return;

  if (state.status === "overtime") {
    dismissOvertime();
    return;
  }

  const currentMode = state.mode;

  if (state.status !== "finished" && state.elapsed > 0) {
    /*
      A focus cycle cut this short is not worth logging: it is thrown away instead of landing in the stats as a stub session. Breaks are recorded however short they were, since a 5 minute break could never clear this bar.
    */
    const tooShortToLog =
      currentMode === "focus" && state.elapsed < MIN_RECORDED_FOCUS_SECONDS;

    if (tooShortToLog) {
      state.discard();
    } else {
      state.finish();
    }
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
