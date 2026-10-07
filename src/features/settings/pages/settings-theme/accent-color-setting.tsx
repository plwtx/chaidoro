import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store";
import SubHeaderDescription from "@/components/ui/sub-header-description";
import ToggleSwitch from "@/components/ui/toggle-switch";
import { showSettingsToast } from "../../components/settings-toast";
import AccentSwatchPicker from "./accent-swatch-picker";

export default function AccentColorSetting() {
  const accentEnabled = useAppStore((s) => s.settings.accentEnabled);
  const setAccentEnabled = useAppStore((s) => s.setAccentEnabled);
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);

  return (
    <section className="my-3">
      <div className="flex w-full items-center justify-between gap-6">
        <SubHeaderDescription
          header={"Accent color"}
          description={
            "Tints the clock and a few subtle details (session dots, buttons, toggles, sliders, the focus edge and stats) with a color of your choice. Each theme gets its own readable shade."
          }
        />
        <ToggleSwitch
          checked={accentEnabled}
          onChange={(next) => {
            setAccentEnabled(next);
            showSettingsToast(`Accent color ${next ? "enabled" : "disabled"}.`);
          }}
        />
      </div>

      {/* Swatch + picker, only while the accent is on */}
      <AnimatePresence initial={false}>
        {accentEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reducedMotion ? 0 : 0.2, ease: "easeOut" }}
            className="pt-4"
          >
            <AccentSwatchPicker />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
