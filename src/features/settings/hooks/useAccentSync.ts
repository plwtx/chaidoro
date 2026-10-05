import { useLayoutEffect } from "react";
import { useAppStore } from "@/store";
import { accentCssVariables, buildAccentPalette } from "@/lib/accent";

/*
  Mirrors the accent setting onto <html>: data-accent switches on the accent: variant and the accent-aware tokens in index.css, and the custom properties carry the shades derived for each theme. Layout effects, so the first frame already paints with the accent.
*/
export function useAccentSync() {
  const accentEnabled = useAppStore((s) => s.settings.accentEnabled);
  const accentColor = useAppStore((s) => s.settings.accentColor);

  useLayoutEffect(() => {
    document.documentElement.dataset.accent = accentEnabled ? "on" : "off";
  }, [accentEnabled]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const variables = accentCssVariables(buildAccentPalette(accentColor));
    for (const [name, value] of Object.entries(variables)) {
      root.style.setProperty(name, value);
    }
  }, [accentColor]);
}
