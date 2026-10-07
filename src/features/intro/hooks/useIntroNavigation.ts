import { useState } from "react";

export interface IntroNavState {
  index: number;
  /* 1 when moving forward, -1 when moving back; picks the side the next page slides in from */
  direction: 1 | -1;
}

/* Moves to `target`, clamped to the page range. Returns the same state when nothing changes. */
export function moveTo(
  state: IntroNavState,
  target: number,
  count: number
): IntroNavState {
  const index = Math.min(Math.max(target, 0), count - 1);
  if (index === state.index) return state;
  return { index, direction: index > state.index ? 1 : -1 };
}

/* Which intro page is showing, and how to move between them. Always starts on the first page. */
export function useIntroNavigation(count: number) {
  const [state, setState] = useState<IntroNavState>({ index: 0, direction: 1 });

  return {
    ...state,
    isFirst: state.index === 0,
    isLast: state.index === count - 1,
    next: () => setState((s) => moveTo(s, s.index + 1, count)),
    back: () => setState((s) => moveTo(s, s.index - 1, count)),
    goTo: (index: number) => setState((s) => moveTo(s, index, count)),
  };
}
