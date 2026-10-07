import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import ClockBackground from "../components/clock-background";
import { useAppStore } from "@/store/index";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import type { BackgroundPattern } from "@/types";

vi.mock("@/db", () => ({
  db: {
    settings: { get: vi.fn(), put: vi.fn() },
    sessions: { add: vi.fn(), update: vi.fn() },
    sessionDraft: { put: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

function drawnPattern(
  backgroundPattern: BackgroundPattern,
  backgroundImageKey: number | null
) {
  useAppStore.setState({
    settings: { ...DEFAULT_SETTINGS, backgroundPattern, backgroundImageKey },
  });
  const { container } = render(<ClockBackground />);
  return (
    container.querySelector("[data-pattern]")?.getAttribute("data-pattern") ??
    null
  );
}

describe("ClockBackground - pattern layer", () => {
  it("draws the selected pattern on the plain background", () => {
    expect(drawnPattern("waves", null)).toBe("waves");
  });

  it("draws nothing when the pattern is none", () => {
    expect(drawnPattern("none", null)).toBeNull();
  });

  it("hides the pattern while a background image is set", () => {
    expect(drawnPattern("waves", 3)).toBeNull();
  });
});
