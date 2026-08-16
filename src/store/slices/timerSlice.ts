import type { TimerStatus, TimerMode, SessionDraft } from "@/types";
import { db } from "@/db";

/* How often a running cycle is checkpointed to the draft, in seconds. A hard reload loses at most this much of it. */
const CHECKPOINT_SECONDS = 5;

export interface TimerSliceState {
  status: TimerStatus;
  mode: TimerMode;
  elapsed: number;
  targetDuration: number;
  pomodoroSetId: string | null;
  taskId: string | null;
  focusCount: number;
  hasDraftToRecover: boolean;
  overtimeElapsed: number;
  lastSessionId: string | null;
}

export interface TimerSliceActions {
  start: (
    mode: TimerMode,
    targetDuration: number,
    taskId?: string | null
  ) => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  finish: () => void;
  discard: () => void;
  reset: () => void;
  setHasDraftToRecover: (has: boolean) => void;
  restoreCycle: (draft: SessionDraft) => void;
  beginOvertime: () => void;
  overtimeTick: () => void;
  resolveOvertime: (add: boolean) => Promise<void>;
  restoreOvertime: (draft: SessionDraft) => void;
}

export type TimerSlice = TimerSliceState & TimerSliceActions;

export const createTimerSlice = (set, get): TimerSlice => ({
  status: "idle",
  mode: "focus",
  elapsed: 0,
  targetDuration: 0,
  pomodoroSetId: null,
  taskId: null,
  focusCount: 0,
  hasDraftToRecover: false,
  overtimeElapsed: 0,
  lastSessionId: null,

  start: (mode, targetDuration, taskId = null) => {
    const pomodoroSetId =
      get().pomodoroSetId ?? (mode === "focus" ? crypto.randomUUID() : null);
    const now = Date.now();

    set({
      status: "running",
      mode,
      elapsed: 0,
      targetDuration,
      pomodoroSetId,
      taskId,
      overtimeElapsed: 0,
    });

    db.sessionDraft.put({
      id: "current",
      startedAt: now,
      mode,
      targetDuration,
      taskId,
      pomodoroSetId,
      lastCheckpointAt: now,
      elapsedAtCheckpoint: 0,
    });
  },

  pause: () => {
    const { elapsed } = get();
    set({ status: "paused" });
    db.sessionDraft.update("current", {
      lastCheckpointAt: Date.now(),
      elapsedAtCheckpoint: elapsed,
    });
  },

  resume: () => {
    set({ status: "running" });
  },

  tick: () => {
    const next = get().elapsed + 1;
    set({ elapsed: next });
    if (next % CHECKPOINT_SECONDS === 0) {
      db.sessionDraft.update("current", {
        lastCheckpointAt: Date.now(),
        elapsedAtCheckpoint: next,
      });
    }
  },

  finish: () => {
    const { mode, elapsed, targetDuration, pomodoroSetId, taskId, focusCount } =
      get();
    const interrupted = elapsed < targetDuration;
    const isLongBreak = mode === "long-break";

    const sessionId = crypto.randomUUID();

    db.sessions.add({
      id: sessionId,
      mode,
      targetDuration,
      actualDuration: elapsed,
      completedAt: Date.now(),
      pomodoroSetId,
      taskId,
      interrupted,
    });
    db.sessionDraft.delete("current");

    set({
      status: "finished",
      lastSessionId: sessionId,
      focusCount:
        mode === "focus" ? focusCount + 1 : isLongBreak ? 0 : focusCount,
      pomodoroSetId: isLongBreak ? null : pomodoroSetId,
    });
  },

  /*
    Ends a cycle without recording it: the draft is cleared, but no session row is written and the phase dots do not advance. Used for focus cycles cut short of the minimum worth logging.
  */
  discard: () => {
    db.sessionDraft.delete("current");
    set({ status: "finished" });
  },

  reset: () => {
    set({
      status: "idle",
      mode: "focus",
      elapsed: 0,
      targetDuration: 0,
      taskId: null,
      overtimeElapsed: 0,
    });
  },

  setHasDraftToRecover: (has) => set({ hasDraftToRecover: has }),

  /*
    Puts a reloaded focus cycle back on screen paused at its last checkpoint, so the user picks up at the remaining time with resume / end cycle. Time spent away from the app is not counted, same as for overtime.
  */
  restoreCycle: (draft) => {
    set({
      status: "paused",
      mode: draft.mode,
      elapsed: draft.elapsedAtCheckpoint,
      targetDuration: draft.targetDuration,
      taskId: draft.taskId,
      pomodoroSetId: draft.pomodoroSetId,
      overtimeElapsed: 0,
    });
  },

  beginOvertime: () => {
    const { elapsed, targetDuration, taskId, pomodoroSetId, lastSessionId } =
      get();
    const now = Date.now();

    set({ status: "overtime", overtimeElapsed: 0 });

    db.sessionDraft.put({
      id: "current",
      startedAt: now,
      mode: "focus",
      targetDuration,
      taskId,
      pomodoroSetId,
      lastCheckpointAt: now,
      elapsedAtCheckpoint: elapsed,
      phase: "overtime",
      overtimeElapsed: 0,
      sessionId: lastSessionId,
    });
  },

  overtimeTick: () => {
    const next = get().overtimeElapsed + 1;
    set({ overtimeElapsed: next });
    if (next % CHECKPOINT_SECONDS === 0) {
      db.sessionDraft.update("current", {
        overtimeElapsed: next,
        lastCheckpointAt: Date.now(),
      });
    }
  },

  resolveOvertime: async (add) => {
    const { elapsed, overtimeElapsed, lastSessionId } = get();
    if (add && lastSessionId && overtimeElapsed > 0) {
      await db.sessions.update(lastSessionId, {
        actualDuration: elapsed + overtimeElapsed,
      });
    }
    await db.sessionDraft.delete("current");
    set({ status: "finished", overtimeElapsed: 0 });
  },

  restoreOvertime: (draft) => {
    set({
      status: "overtime",
      mode: "focus",
      elapsed: draft.elapsedAtCheckpoint,
      targetDuration: draft.targetDuration,
      taskId: draft.taskId,
      pomodoroSetId: draft.pomodoroSetId,
      overtimeElapsed: draft.overtimeElapsed ?? 0,
      lastSessionId: draft.sessionId ?? null,
    });
  },
});
