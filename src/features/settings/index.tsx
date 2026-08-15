import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SettingsNav, { type SettingsCategory } from "./components/settings-nav";
import GeneralSettings from "./pages/settings-general";
import ClockSettings from "./pages/settings-clock";
import SoundSettings from "./pages/settings-sounds";
import ShortcutSettings from "./pages/settings-shortcuts";
import ThemeSettings from "./pages/settings-theme";
import StorageSettings from "./pages/settings-storage";
import InformationSettings from "./pages/settings-information";

const CATEGORIES: SettingsCategory[] = [
  { id: "general", name: "General" },
  { id: "clock", name: "Clock" },
  { id: "sounds", name: "Sounds" },
  { id: "shortcuts", name: "Shortcuts" },
  { id: "theme", name: "Theme" },
  { id: "storage", name: "Storage" },
  { id: "information", name: "Information" },
];

const CATEGORY_COMPONENTS: Record<string, React.ComponentType> = {
  general: GeneralSettings,
  clock: ClockSettings,
  sounds: SoundSettings,
  shortcuts: ShortcutSettings,
  theme: ThemeSettings,
  storage: StorageSettings,
  information: InformationSettings,
};

export default function Settings() {
  const [activeId, setActiveId] = useState("general");
  const ActivePanel = CATEGORY_COMPONENTS[activeId];

  return (
    <div className="bg-brown-50 dark:bg-dark-600 font-poppins h-full w-full p-9">
      <div className="flex h-full w-full flex-col items-center justify-center">
        <div className="flex h-full w-full max-w-7xl items-center justify-center pt-19">
          <div className="flex h-full w-full">
            {/* Navigation */}
            <SettingsNav
              categories={CATEGORIES}
              activeId={activeId}
              onSelect={setActiveId}
            />
            {/* Settings pages */}
            <main className="h-full w-full overflow-y-auto rounded-2xl">
              <div className="min-h-full p-6 pt-9 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeId}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                  >
                    <ActivePanel />
                  </motion.div>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
