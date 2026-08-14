import { useEffect, useRef } from "react";
import { useAppStore } from "@/store";

const DEFAULT_TITLE = "Chaidoro | chaidoro.study";

const MODE_LABELS: Record<string, string> = {
  focus: "Focus",
  break: "Break",
  "long-break": "Long Break",
};

const FINISHED_MESSAGES = ["Beep! Beeep!", "TIME IS UP !!!"];

export function useDynamicTitlebarSync() {
  const enabled = useAppStore((s) => s.settings.dynamicTitlebar);
  const separator = useAppStore((s) => s.settings.titlebarSeparator);
  const status = useAppStore((s) => s.status);
  const mode = useAppStore((s) => s.mode);
  const elapsed = useAppStore((s) => s.elapsed);
  const targetDuration = useAppStore((s) => s.targetDuration);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!enabled) {
      document.title = DEFAULT_TITLE;
      return;
    }

    if (status === "running" || status === "paused") {
      const remaining = Math.max(0, targetDuration - elapsed);
      const mins = Math.floor(remaining / 60);
      const secs = remaining % 60;
      const time = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
      const label = MODE_LABELS[mode] ?? "Focus";
      document.title = `${time} ${separator} ${label}`;
      return;
    }

    if (status === "finished") {
      let index = 0;
      document.title = FINISHED_MESSAGES[0];
      intervalRef.current = setInterval(() => {
        index = 1 - index;
        document.title = FINISHED_MESSAGES[index];
      }, 1500);
      return;
    }

    // idle title
    document.title = DEFAULT_TITLE;
  }, [enabled, separator, status, mode, elapsed, targetDuration]);

  useEffect(() => {
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, []);
}
