import { useNavigate, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store/index";
import { cn } from "@/lib/utils";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function TimerIsland() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const status = useAppStore((s) => s.status);
  const elapsed = useAppStore((s) => s.elapsed);
  const targetDuration = useAppStore((s) => s.targetDuration);
  const mode = useAppStore((s) => s.mode);
  const overtimeElapsed = useAppStore((s) => s.overtimeElapsed);

  const isOvertime = status === "overtime";
  const isActive = status === "running" || status === "paused" || isOvertime;
  const show = isActive && pathname !== "/";
  const remaining = Math.max(0, targetDuration - elapsed);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => navigate("/")}
          className="bg-brown-700 dark:bg-dark-900 z-40 flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 shadow-lg"
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "running"
                ? "animate-pulse bg-green-400"
                : isOvertime
                  ? "animate-pulse bg-amber-400"
                  : "bg-yellow-400"
            )}
          />
          <span className="font-mono text-xs text-zinc-400">
            {isOvertime ? "overtime" : mode}
          </span>
          <span className="font-mono text-xs font-medium text-white">
            {isOvertime
              ? `+${formatTime(overtimeElapsed)}`
              : formatTime(remaining)}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
