import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { useDismiss } from "@/hooks/useDismiss";
import ColorPicker from "@/components/ui/color-picker";
import {
  ACCENT_PRESETS,
  THEME_BACKGROUNDS,
  accentLabel,
  buildAccentPalette,
  type AccentPalette,
} from "@/lib/accent";

/*
  The accent swatch (circle + color name). Clicking it opens the color picker in a popover.
*/
export default function AccentSwatchPicker() {
  const accentColor = useAppStore((s) => s.settings.accentColor);
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useDismiss(rootRef, open, (reason) => {
    setOpen(false);
    if (reason === "escape") triggerRef.current?.focus();
  });

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="border-brown-200/75 shadow-brown-300 dark:bg-dark-900/45 bg-brown-100 dark:border-dark-900 flex cursor-pointer items-center gap-3 rounded-full border p-1.5 pr-4 shadow-sm transition-transform active:scale-95 dark:shadow-black"
      >
        <span
          className="size-6 rounded-full border border-black/10"
          style={{ backgroundColor: accentColor }}
        />
        <span className="text-sm font-medium">{accentLabel(accentColor)}</span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-150",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Accent color picker"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: reducedMotion ? 0 : 0.15, ease: "easeOut" }}
            style={{ transformOrigin: "top left" }}
            className="bg-brown-50 dark:bg-dark-900 border-brown-200 dark:border-dark-600 shadow-brown-300 dark:shadow-dark-900 absolute top-full left-0 z-30 mt-2 w-80 rounded-xl border p-4 shadow-md"
          >
            <AccentPickerPanel />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccentPickerPanel() {
  const accentColor = useAppStore((s) => s.settings.accentColor);
  const setAccentColor = useAppStore((s) => s.setAccentColor);
  // Local draft: the picker follows the pointer right away while the store (which writes to IndexedDB first) catches up behind it
  const [draft, setDraft] = useState(accentColor);
  const palette = useMemo(() => buildAccentPalette(draft), [draft]);

  const handleChange = (hex: string) => {
    setDraft(hex);
    setAccentColor(hex);
  };

  return (
    <div className="flex flex-col gap-4">
      <ColorPicker
        value={draft}
        onChange={handleChange}
        presets={ACCENT_PRESETS}
      />
      <ThemePreview hex={draft} palette={palette} />
    </div>
  );
}

/* How the clock reads on each theme once the shade is adjusted for readability. */
function ThemePreview({
  hex,
  palette,
}: {
  hex: string;
  palette: AccentPalette;
}) {
  const adjusted = palette.light.base !== hex || palette.dark.base !== hex;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <PreviewCard
          label="light"
          background={THEME_BACKGROUNDS.light}
          color={palette.light.base}
          labelClass="text-brown-600"
        />
        <PreviewCard
          label="dark"
          background={THEME_BACKGROUNDS.dark}
          color={palette.dark.base}
          labelClass="text-dark-100"
        />
      </div>
      {adjusted && (
        <p className="font-fragment-mono text-brown-900/75 dark:text-dark-100/65 text-[10px] leading-4">
          Lightness is adjusted per theme so the clock stays readable.
        </p>
      )}
    </div>
  );
}

function PreviewCard({
  label,
  background,
  color,
  labelClass,
}: {
  label: string;
  background: string;
  color: string;
  labelClass: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-lg border border-black/10 py-2"
      style={{ backgroundColor: background }}
    >
      <span className={cn("text-[9px] font-light", labelClass)}>{label}</span>
      <span className="text-xl font-semibold" style={{ color }}>
        25:00
      </span>
    </div>
  );
}
