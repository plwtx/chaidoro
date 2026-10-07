import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { moveTo, useIntroNavigation } from "../hooks/useIntroNavigation";

describe("moveTo", () => {
  const start = { index: 2, direction: 1 as const };

  it("moves forward and back, remembering the direction", () => {
    expect(moveTo(start, 3, 6)).toEqual({ index: 3, direction: 1 });
    expect(moveTo(start, 0, 6)).toEqual({ index: 0, direction: -1 });
  });

  it("clamps to the first and the last page", () => {
    expect(moveTo(start, -4, 6).index).toBe(0);
    expect(moveTo(start, 99, 6).index).toBe(5);
  });

  it("returns the same state when the page does not change", () => {
    expect(moveTo(start, 2, 6)).toBe(start);
    const last = { index: 5, direction: 1 as const };
    expect(moveTo(last, 6, 6)).toBe(last);
  });
});

describe("useIntroNavigation", () => {
  it("starts on the first page and knows both ends", () => {
    const { result } = renderHook(() => useIntroNavigation(3));
    expect(result.current.index).toBe(0);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);

    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.index).toBe(2);
    expect(result.current.isLast).toBe(true);

    act(() => result.current.back());
    expect(result.current.index).toBe(1);
    expect(result.current.direction).toBe(-1);

    act(() => result.current.goTo(0));
    expect(result.current.isFirst).toBe(true);
  });
});
