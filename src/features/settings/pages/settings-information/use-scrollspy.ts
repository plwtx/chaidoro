import { useEffect, useState } from "react";

interface UseScrollspyOptions {
  sectionIds: string[];

  activationRatio?: number;
}

export function useScrollspy({
  sectionIds,
  activationRatio = 0.3,
}: UseScrollspyOptions): string {
  const [activeId, setActiveId] = useState<string>(sectionIds[0] ?? "");

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const container = findScrollableAncestor(elements[0]);
    const scrollTarget: HTMLElement | Window = container ?? window;

    let frame = 0;

    const computeActive = () => {
      frame = 0;

      const viewportTop = container ? container.getBoundingClientRect().top : 0;
      const viewportHeight = container
        ? container.clientHeight
        : window.innerHeight;
      const line = viewportTop + viewportHeight * activationRatio;

      const scrollTop = container ? container.scrollTop : window.scrollY;
      const maxScroll = container
        ? container.scrollHeight - container.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && maxScroll - scrollTop <= 4) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      setActiveId(current);
    };

    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(computeActive);
    };

    computeActive();
    scrollTarget.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      scrollTarget.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [sectionIds, activationRatio]);

  return activeId;
}

function findScrollableAncestor(element: HTMLElement): HTMLElement | null {
  let current: HTMLElement | null = element.parentElement;
  while (current && current !== document.body) {
    const overflowY = getComputedStyle(current).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") return current;
    current = current.parentElement;
  }
  return null;
}
