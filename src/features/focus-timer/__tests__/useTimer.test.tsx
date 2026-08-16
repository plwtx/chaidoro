import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useTimer, useTimerBridge } from "../hooks/useTimer";
import { useAppStore } from "@/store/index";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import type { SessionDraft } from "@/types";

const { mockBridge, fireTick, fireComplete } = vi.hoisted(() => {
  let _tickCb: (s: number) => void = () => {};
  let _completeCb: () => void = () => {};

  const bridge = {
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    reset: vi.fn(),
    onTick: vi.fn((cb: (s: number) => void) => {
      _tickCb = cb;
      return () => {};
    }),
    onComplete: vi.fn((cb: () => void) => {
      _completeCb = cb;
      return () => {};
    }),
    hasWorker: vi.fn(() => true),
    destroy: vi.fn(),
  };

  return {
    mockBridge: bridge,
    fireTick: (s: number) => _tickCb(s),
    fireComplete: () => _completeCb(),
  };
});

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    sessions: {
      add: vi.fn((session: { id: string }) => Promise.resolve(session.id)),
      update:
        vi.fn<
          (id: string, patch: Record<string, unknown>) => Promise<number>
        >(),
    },
    sessionDraft: {
      put: vi.fn<(draft: SessionDraft) => Promise<string>>(),
      update:
        vi.fn<
          (id: string, patch: Record<string, unknown>) => Promise<number>
        >(),
      delete: vi.fn(() => Promise.resolve()),
      get: vi.fn<() => Promise<SessionDraft | undefined>>(),
    },
    tasks: {
      orderBy: vi.fn(() => ({
        toArray: vi.fn(() => Promise.resolve([])),
      })),
    },
    settings: {
      get: vi.fn(() => Promise.resolve(undefined)),
      put: vi.fn(() => Promise.resolve()),
    },
  },
}));

vi.mock("@/features/focus-timer/services/timerBridge", () => ({
  timerBridge: mockBridge,
}));

vi.mock("@/db", () => ({ db: mockDb }));

const FOCUS_SEC = DEFAULT_SETTINGS.focusDuration; // 1500

const INITIAL_STATE = {
  status: "idle" as const,
  mode: "focus" as const,
  elapsed: 0,
  targetDuration: 0,
  pomodoroSetId: null,
  taskId: null,
  focusCount: 0,
  hasDraftToRecover: false,
  overtimeElapsed: 0,
  lastSessionId: null,
  tasks: [],
  activeTaskId: null,
  settings: DEFAULT_SETTINGS,
};

function simulateTicks(count: number) {
  vi.advanceTimersByTime(count * 1000);
  for (let i = 0; i < count; i++) {
    fireTick(0);
  }
}

function renderTimer() {
  return renderHook(() => {
    useTimerBridge();
    return useTimer();
  });
}

// Tests

describe("useTimer - start → pause (9:31 left) → resume → finish × 3", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T10:00:00.000Z"));
    mockBridge.hasWorker.mockReturnValue(true);
    useAppStore.setState({
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, overtimeEnabled: false },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * One full Pomodoro cycle:
   *
   *   start
   *   → tick 929 s (elapsed 0 → 929, display 1500 → 571)
   *   → pause
   *   → wait 30 s (wall-clock, no ticks)
   *   → resume
   *   → tick 570 s (elapsed 929 → 1499, display 571 → 1)
   *   → final tick + complete (elapsed 1500, display 0)
   *   → finish() writes session to Dexie
   *   → endCycle resets to idle
   *
   * Running time: 929 + 571 = 1500 s (pause excluded) → actualDuration == targetDuration.
   */
  function runOneCycle(
    result: ReturnType<
      typeof renderHook<ReturnType<typeof useTimer>, unknown>
    >["result"],
    expectedFocusCount: number
  ) {
    vi.clearAllMocks();

    act(() => {
      useAppStore.setState({ mode: "focus" });
    });

    //  Start
    act(() => {
      result.current.start();
    });
    expect(result.current.status).toBe("running");
    expect(mockBridge.start).toHaveBeenCalledWith("countdown", FOCUS_SEC);
    expect(mockDb.sessionDraft.put).toHaveBeenCalledOnce();

    //  Tick 929 times (elapsed 0 → 929, seconds display 1500 → 571)
    act(() => {
      simulateTicks(929);
    });
    expect(result.current.seconds).toBe(571);

    // Pause
    act(() => {
      result.current.pause();
    });
    expect(result.current.status).toBe("paused");
    expect(mockBridge.pause).toHaveBeenCalledOnce();
    expect(mockDb.sessionDraft.update).toHaveBeenCalled();

    // 30 s elapse while paused (wall clock advances, no ticks)
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(result.current.seconds).toBe(571); // unchanged during pause

    // Resume
    act(() => {
      result.current.start();
    });
    expect(result.current.status).toBe("running");
    expect(mockBridge.resume).toHaveBeenCalledOnce();

    // Tick 570 more (elapsed 929 → 1499, seconds 571 → 1)
    act(() => {
      simulateTicks(570);
    });

    //  Final tick + complete
    act(() => {
      vi.advanceTimersByTime(1000);
      fireTick(0);
      fireComplete();
    });

    // Session finished and saved to Dexie
    expect(result.current.status).toBe("finished");
    expect(mockDb.sessions.add).toHaveBeenCalledOnce();
    expect(mockDb.sessions.add).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "focus",
        targetDuration: FOCUS_SEC,
        actualDuration: FOCUS_SEC,
        interrupted: false,
      })
    );
    expect(mockDb.sessionDraft.delete).toHaveBeenCalledWith("current");
    expect(useAppStore.getState().focusCount).toBe(expectedFocusCount);

    // End cycle (already finished = no double save)
    act(() => {
      result.current.endCycle();
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("break");
    expect(mockBridge.reset).toHaveBeenCalledOnce();
  }

  it("records one focus session per cycle across 3 repetitions", () => {
    const { result } = renderTimer();

    for (let i = 0; i < 3; i++) {
      runOneCycle(result, i + 1);
    }

    expect(useAppStore.getState().focusCount).toBe(3);
  });
});

/**
 * Overtime: a 25:00 focus cycle that the user keeps running until 28:32.
 *
 *   start → 1500 ticks → complete
 *   → session saved at 1500 s, timer flips to counting up
 *   → 212 more ticks (+03:32)
 *   → add    : session patched to 1712 s
 *     dismiss: session left at 1500 s
 */
describe("useTimer - focus overtime", () => {
  const OVERTIME_SEC = 212; // 03:32

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T10:00:00.000Z"));
    useAppStore.setState({
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, overtimeEnabled: true },
    });
    vi.clearAllMocks();
    mockBridge.hasWorker.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function runToOvertime(
    result: ReturnType<
      typeof renderHook<ReturnType<typeof useTimer>, unknown>
    >["result"]
  ) {
    act(() => {
      result.current.start();
    });

    act(() => {
      simulateTicks(FOCUS_SEC);
      fireComplete();
    });

    // The session is banked at its target duration before overtime begins, so a crash mid-overtime can never lose the completed cycle.
    expect(result.current.status).toBe("overtime");
    expect(mockDb.sessions.add).toHaveBeenCalledOnce();
    expect(mockDb.sessions.add).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "focus", actualDuration: FOCUS_SEC })
    );
    expect(mockBridge.start).toHaveBeenLastCalledWith("countup", 0);

    act(() => {
      simulateTicks(OVERTIME_SEC);
    });
    expect(result.current.overtimeElapsed).toBe(OVERTIME_SEC);
    // The clock reads the whole session (28:32), not the extra time on its own.
    expect(result.current.seconds).toBe(FOCUS_SEC + OVERTIME_SEC);
  }

  it("adds the extra time to the saved session", async () => {
    const { result } = renderTimer();
    runToOvertime(result);

    const sessionId = mockDb.sessions.add.mock.calls[0][0].id;

    await act(async () => {
      await result.current.addOvertime();
    });

    expect(mockDb.sessions.update).toHaveBeenCalledWith(sessionId, {
      actualDuration: FOCUS_SEC + OVERTIME_SEC,
    });
    // Resolving leaves you on the break, ready to start.
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("break");
    expect(result.current.seconds).toBe(DEFAULT_SETTINGS.shortBreakDuration);
    expect(result.current.overtimeElapsed).toBe(0);
    expect(mockBridge.reset).toHaveBeenCalledOnce();
  });

  it("leaves the session untouched when the extra time is dismissed", async () => {
    const { result } = renderTimer();
    runToOvertime(result);

    await act(async () => {
      await result.current.dismissOvertime();
    });

    expect(mockDb.sessions.update).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("break");
    expect(result.current.overtimeElapsed).toBe(0);
  });

  it("parks the extra time in the draft and clears it once resolved", async () => {
    const { result } = renderTimer();
    runToOvertime(result);

    const draft = mockDb.sessionDraft.put.mock.lastCall[0];
    expect(draft).toMatchObject({
      id: "current",
      phase: "overtime",
      mode: "focus",
      elapsedAtCheckpoint: FOCUS_SEC,
      sessionId: mockDb.sessions.add.mock.calls[0][0].id,
    });

    // Checkpointed every 5 s, so 212 s of overtime is banked at 210.
    expect(mockDb.sessionDraft.update).toHaveBeenLastCalledWith(
      "current",
      expect.objectContaining({ overtimeElapsed: 210 })
    );

    await act(async () => {
      await result.current.dismissOvertime();
    });
    expect(mockDb.sessionDraft.delete).toHaveBeenCalledWith("current");
  });

  it("comes back frozen after a reload, then still credits the extra time", async () => {
    const { result } = renderTimer();
    runToOvertime(result);

    const parked: SessionDraft = {
      ...mockDb.sessionDraft.put.mock.lastCall[0],
      overtimeElapsed: 210,
    };
    const sessionId = mockDb.sessions.add.mock.calls[0][0].id;

    //  Reload: fresh store, hydration finds the parked draft
    useAppStore.setState({
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, overtimeEnabled: true },
    });
    vi.clearAllMocks();
    mockDb.sessionDraft.get.mockResolvedValue(parked);

    await act(async () => {
      await useAppStore.getState().recoverDraft();
    });

    const restored = useAppStore.getState();
    expect(restored.status).toBe("overtime");
    expect(restored.overtimeElapsed).toBe(210);
    expect(restored.elapsed).toBe(FOCUS_SEC);
    expect(restored.lastSessionId).toBe(sessionId);
    // Frozen: no worker was started, so the extra time does not keep growing.
    expect(mockBridge.start).not.toHaveBeenCalled();

    await act(async () => {
      await useAppStore.getState().resolveOvertime(true);
    });

    expect(mockDb.sessions.update).toHaveBeenCalledWith(sessionId, {
      actualDuration: FOCUS_SEC + 210,
    });
    expect(useAppStore.getState().status).toBe("finished");
  });

  it("holds the auto started break back until overtime is resolved", async () => {
    useAppStore.setState({
      settings: {
        ...DEFAULT_SETTINGS,
        overtimeEnabled: true,
        autoStartBreak: true,
      },
    });

    const { result } = renderTimer();
    runToOvertime(result);

    // Still overtime: the break has not been started behind the user's back.
    expect(result.current.status).toBe("overtime");
    expect(mockBridge.start).toHaveBeenLastCalledWith("countup", 0);

    await act(async () => {
      await result.current.addOvertime();
    });

    expect(mockBridge.start).toHaveBeenLastCalledWith(
      "countdown",
      DEFAULT_SETTINGS.shortBreakDuration
    );
    expect(result.current.status).toBe("running");
    expect(result.current.mode).toBe("break");
  });
});

/**
 * Reload mid-focus: the cycle comes back paused at its last checkpoint with
 * resume / end cycle, and resuming picks up from the time that was left.
 */
describe("useTimer - resuming a focus cycle after a reload", () => {
  const RAN_FOR = 612; // 10:12 in, checkpointed at 610

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T10:00:00.000Z"));
    useAppStore.setState({
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, overtimeEnabled: true },
    });
    vi.clearAllMocks();
    mockBridge.hasWorker.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("restores the remaining time paused, then counts down from it", async () => {
    const { result } = renderTimer();

    act(() => {
      result.current.start();
    });
    const draft = mockDb.sessionDraft.put.mock.lastCall[0];

    act(() => {
      simulateTicks(RAN_FOR);
    });
    // Checkpointed every 5 s while running.
    expect(mockDb.sessionDraft.update).toHaveBeenLastCalledWith(
      "current",
      expect.objectContaining({ elapsedAtCheckpoint: 610 })
    );

    // ── Reload: fresh store and no worker behind the timer ────────────────
    useAppStore.setState({
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, overtimeEnabled: true },
    });
    vi.clearAllMocks();
    mockBridge.hasWorker.mockReturnValue(false);
    mockDb.sessionDraft.get.mockResolvedValue({
      ...draft,
      elapsedAtCheckpoint: 610,
    });

    await act(async () => {
      await useAppStore.getState().recoverDraft();
    });

    expect(result.current.status).toBe("paused");
    expect(result.current.mode).toBe("focus");
    expect(result.current.seconds).toBe(FOCUS_SEC - 610);
    expect(mockBridge.start).not.toHaveBeenCalled();

    // ── Resume: no worker to resume, so a fresh countdown from what is left ─
    act(() => {
      result.current.start();
    });
    expect(mockBridge.start).toHaveBeenCalledWith("countdown", FOCUS_SEC - 610);
    expect(mockBridge.resume).not.toHaveBeenCalled();
    expect(result.current.status).toBe("running");
  });

  it("drops a half-run break instead of restoring it", async () => {
    mockDb.sessionDraft.get.mockResolvedValue({
      id: "current",
      startedAt: Date.now(),
      mode: "break",
      targetDuration: DEFAULT_SETTINGS.shortBreakDuration,
      taskId: null,
      pomodoroSetId: null,
      lastCheckpointAt: Date.now(),
      elapsedAtCheckpoint: 100,
    });

    await act(async () => {
      await useAppStore.getState().recoverDraft();
    });

    expect(useAppStore.getState().status).toBe("idle");
    expect(mockDb.sessionDraft.delete).toHaveBeenCalledWith("current");
  });
});

/**
 * "End cycle" only logs a focus session once it is worth logging: under
 * 10 minutes the cycle is thrown away rather than landing in the stats.
 */
describe("useTimer - ending a cycle early", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-14T10:00:00.000Z"));
    useAppStore.setState({
      ...INITIAL_STATE,
      settings: { ...DEFAULT_SETTINGS, overtimeEnabled: true },
    });
    vi.clearAllMocks();
    mockBridge.hasWorker.mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("throws away a focus cycle ended before 10 minutes", () => {
    const { result } = renderTimer();

    act(() => {
      result.current.start();
    });
    act(() => {
      simulateTicks(599);
    });
    act(() => {
      result.current.endCycle();
    });

    expect(mockDb.sessions.add).not.toHaveBeenCalled();
    expect(mockDb.sessionDraft.delete).toHaveBeenCalledWith("current");
    // No stub session, no phase dot, but still moved on to the break.
    expect(useAppStore.getState().focusCount).toBe(0);
    expect(result.current.status).toBe("idle");
    expect(result.current.mode).toBe("break");
  });

  it("records a focus cycle ended at 10 minutes", () => {
    const { result } = renderTimer();

    act(() => {
      result.current.start();
    });
    act(() => {
      simulateTicks(600);
    });
    act(() => {
      result.current.endCycle();
    });

    expect(mockDb.sessions.add).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "focus",
        actualDuration: 600,
        interrupted: true,
      })
    );
    expect(useAppStore.getState().focusCount).toBe(1);
  });

  it("still records a break ended early", () => {
    const { result } = renderTimer();

    act(() => {
      useAppStore.setState({ mode: "break" });
    });
    act(() => {
      result.current.start();
    });
    act(() => {
      simulateTicks(100);
    });
    act(() => {
      result.current.endCycle();
    });

    expect(mockDb.sessions.add).toHaveBeenCalledWith(
      expect.objectContaining({ mode: "break", actualDuration: 100 })
    );
  });
});
