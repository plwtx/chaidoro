import { render } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import FocusFrame from "../components/focus-frame";
import { useAppStore } from "@/store/index";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import type { TimerMode, TimerStatus } from "@/types";

vi.mock("@/db", () => ({
  db: {
    settings: { get: vi.fn(), put: vi.fn() },
    sessions: { add: vi.fn(), update: vi.fn() },
    sessionDraft: { put: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

function setTimer(
  status: TimerStatus,
  mode: TimerMode = "focus",
  focusBorderEnabled = true
) {
  useAppStore.setState({
    status,
    mode,
    settings: { ...DEFAULT_SETTINGS, focusBorderEnabled },
  });
}

function frameState(container: HTMLElement) {
  return container
    .querySelector("[data-focus-frame]")
    ?.getAttribute("data-focus-frame");
}

describe("FocusFrame - when the app is pulled back off the desk", () => {
  beforeEach(() => {
    setTimer("idle");
  });

  it("frames the app while a focus cycle runs", () => {
    setTimer("running", "focus");
    const { container } = render(
      <FocusFrame>
        <p>app</p>
      </FocusFrame>
    );
    expect(frameState(container)).toBe("active");
  });

  it("stays framed while paused and through overtime", () => {
    setTimer("paused", "focus");
    expect(frameState(render(<FocusFrame>x</FocusFrame>).container)).toBe(
      "active"
    );

    setTimer("overtime", "focus");
    expect(frameState(render(<FocusFrame>x</FocusFrame>).container)).toBe(
      "active"
    );
  });

  it("is flat when idle, finished or on a break", () => {
    for (const [status, mode] of [
      ["idle", "focus"],
      ["finished", "focus"],
      ["running", "break"],
      ["running", "long-break"],
    ] as [TimerStatus, TimerMode][]) {
      setTimer(status, mode);
      expect(frameState(render(<FocusFrame>x</FocusFrame>).container)).toBe(
        "idle"
      );
    }
  });

  it("is flat when the user turns the border off", () => {
    setTimer("running", "focus", false);
    expect(frameState(render(<FocusFrame>x</FocusFrame>).container)).toBe(
      "idle"
    );
  });

  it("always renders its children", () => {
    setTimer("running", "focus");
    const { getByText } = render(
      <FocusFrame>
        <p>app content</p>
      </FocusFrame>
    );
    expect(getByText("app content")).toBeInTheDocument();
  });
});
