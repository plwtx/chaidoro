import { useEffect } from "react";
import { useAppStore } from "@/store";
import { db } from "@/db";

export function useThemeSync() {
  const theme = useAppStore((s) => s.settings.theme);
  const bgKey = useAppStore((s) => s.settings.backgroundImageKey);

  // Theme class
  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = (isDark: boolean) => {
      root.classList.toggle("dark", isDark);
      root.classList.toggle("light", !isDark);
    };

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      applyTheme(mq.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    } else {
      applyTheme(theme === "dark");
    }
  }, [theme]);

  // Accent color lives in useAccentSync

  // Background image
  useEffect(() => {
    if (!bgKey) {
      document.documentElement.style.setProperty("--bg-image", "none");
      return;
    }

    let objectUrl: string | undefined;
    let cancelled = false;

    db.backgroundImages.get(bgKey).then((record) => {
      if (!record || cancelled) return;
      objectUrl = URL.createObjectURL(record.blob);
      document.documentElement.style.setProperty(
        "--bg-image",
        `url("${objectUrl}")`
      );
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bgKey]);
}
