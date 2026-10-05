import type { ComponentType } from "react";

/* Props every intro page gets from the dialog. */
export interface IntroPageProps {
  /* 1-based position in the intro, shown as "step N." */
  step: number;
}

export interface IntroPage {
  id: string;
  /* Short name for the pagination dots (tooltip and screen readers) */
  label: string;
  Component: ComponentType<IntroPageProps>;
}
