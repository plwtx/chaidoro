import { AnimatePresence, motion } from "motion/react";
import SettingsNav, { type SettingsCategory } from "./components/settings-nav";
import {
  SETTINGS_TABS,
  useSettingsTabStore,
  type SettingsTabId,
} from "./settingsTabStore";
import GeneralSettings from "./pages/settings-general";
import ClockSettings from "./pages/settings-clock";
import SoundSettings from "./pages/settings-sounds";
import ShortcutSettings from "./pages/settings-shortcuts";
import ThemeSettings from "./pages/settings-theme";
import StorageSettings from "./pages/settings-storage";
import InformationSettings from "./pages/settings-information";
import ChangelogSettings from "./pages/settings-changelog";

const CATEGORIES: SettingsCategory[] = [...SETTINGS_TABS];

const CATEGORY_COMPONENTS: Record<string, React.ComponentType> = {
  general: GeneralSettings,
  clock: ClockSettings,
  sounds: SoundSettings,
  shortcuts: ShortcutSettings,
  theme: ThemeSettings,
  storage: StorageSettings,
  information: InformationSettings,
  changelog: ChangelogSettings,
};

export default function Settings() {
  const activeId = useSettingsTabStore((s) => s.activeId);
  const setActiveId = useSettingsTabStore((s) => s.setActiveId);
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
              onSelect={(id) => setActiveId(id as SettingsTabId)}
            />
            {/* Settings pages */}
            <div className="relative h-full w-full min-w-0">
              <main className="h-full w-full overflow-y-auto rounded-2xl">
                <div className="min-h-full p-6 pt-9 pb-24">
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
              {/* Bottom edge fade: blurs and fades scrolled content into the page background so it doesn't cut off hard */}
              <div
                aria-hidden="true"
                className="from-brown-50 dark:from-dark-600 pointer-events-none absolute inset-x-0 bottom-0 h-20 rounded-b-2xl bg-linear-to-t to-transparent mask-[linear-gradient(to_bottom,transparent,black_80%)] backdrop-blur-[3px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
