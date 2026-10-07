import type { ReactNode } from "react";
import { renderHook, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useKeyboardShortcuts } from "../useKeyboardShortcuts";
import { useAppStore } from "@/store/index";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import { startTimer } from "@/features/focus-timer/services/timerControls";

vi.mock("@/features/focus-timer/services/timerControls", () => ({
  startTimer: vi.fn(),
  pauseTimer: vi.fn(),
  endCycleTimer: vi.fn(),
  addOvertime: vi.fn(),
}));

vi.mock("@/db", () => ({ db: { settings: { put: vi.fn() } } }));

function renderDispatcher(introCompleted: boolean) {
  useAppStore.setState({
    status: "idle",
    settings: { ...DEFAULT_SETTINGS, introCompleted },
  });
  renderHook(() => useKeyboardShortcuts(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter>{children}</MemoryRouter>
    ),
  });
}

const pressSpace = () => fireEvent.keyDown(window, { code: "Space", key: " " });

describe("useKeyboardShortcuts - intro", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("stands down while the intro is open", () => {
    renderDispatcher(false);
    pressSpace();
    expect(startTimer).not.toHaveBeenCalled();
  });

  it("runs shortcuts once the intro is completed", () => {
    renderDispatcher(true);
    pressSpace();
    expect(startTimer).toHaveBeenCalledOnce();
  });
});
