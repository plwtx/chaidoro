import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { useAppStore } from "@/store/index";
import { cn } from "@/lib/utils";

/* How much desk shows on every side while a focus cycle runs, in px. */
const INSET = 16;
/* Relaxed pull-back while the cycle is paused. */
const PAUSED_INSET = 10;
const RADIUS = 22;

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));

  useEffect(() => {
    const measure = () =>
      setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return size;
}

export default function FocusFrame({ children }: { children: ReactNode }) {
  const enabled = useAppStore((s) => s.settings.focusBorderEnabled);
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);
  const status = useAppStore((s) => s.status);
  const mode = useAppStore((s) => s.mode);
  const { w, h } = useViewportSize();

  // Focus cycles only; it stays up through overtime and eases back in while paused.
  const active =
    enabled &&
    mode === "focus" &&
    (status === "running" || status === "paused" || status === "overtime");

  const inset = !active ? 0 : status === "paused" ? PAUSED_INSET : INSET;

  const scaleX = w > 0 ? 1 - (inset * 2) / w : 1;
  const scaleY = h > 0 ? 1 - (inset * 2) / h : 1;

  return (
    <div className="fixed inset-0 overflow-hidden bg-[var(--desk)]">
      <motion.div
        data-focus-frame={active ? "active" : "idle"}
        className={cn(
          "relative h-full w-full origin-center overflow-hidden transition-shadow duration-700 ease-out",
          active ? "shadow-[var(--panel-shadow)]" : "shadow-none"
        )}
        animate={{
          scaleX,
          scaleY,
          borderRadius: inset > 0 ? RADIUS : 0,
        }}
        transition={{
          duration: reducedMotion ? 0 : 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
