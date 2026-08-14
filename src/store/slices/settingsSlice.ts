import type { Settings, Features, Theme, ClockVariant } from "@/types";
import { db } from "@/db";

export const DEFAULT_SETTINGS: Settings = {
  key: "app",
  focusDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  features: { taskManager: false, statistics: true },
  theme: "system",
  accentColor: "#a78bfa",
  backgroundImageKey: null,
  backgroundOpacity: 84,
  backgroundSaturation: 100,
  backgroundContrast: 50,
  clockVariant: "slide",
  reducedMotion: false,
  dynamicTitlebar: true,
  titlebarSeparator: "-",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  lastActiveDate: new Date().toLocaleDateString("en-CA"),
  dailyFocusCount: 0,
};

export interface SettingsSliceState {
  settings: Settings;
}

export interface SettingsSliceActions {
  loadSettings: () => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  toggleFeature: (feature: keyof Features) => void;
  setTheme: (theme: Theme) => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  setBackgroundImageKey: (key: number | null) => Promise<void>;
  setClockVariant: (variant: ClockVariant) => Promise<void>;
  setDuration: (
    field: "focusDuration" | "shortBreakDuration" | "longBreakDuration",
    seconds: number
  ) => Promise<void>;
  toggleAutoStart: (
    field: "autoStartBreak" | "autoStartFocus"
  ) => Promise<void>;
}

export type SettingsSlice = SettingsSliceState & SettingsSliceActions;

export const createSettingsSlice = (set, get): SettingsSlice => ({
  settings: DEFAULT_SETTINGS,

  loadSettings: async () => {
    const stored = await db.settings.get("app");
    if (stored) {
      set({
        settings: {
          ...DEFAULT_SETTINGS,
          ...stored,
          features: {
            ...DEFAULT_SETTINGS.features,
            ...stored.features,
            statistics: true,
          },
        },
      });
    } else {
      await db.settings.put(DEFAULT_SETTINGS);
    }
  },

  updateSettings: async (patch) => {
    const next = { ...get().settings, ...patch, key: "app" };
    await db.settings.put(next);
    set({ settings: next });
  },

  toggleFeature: (feature) => {
    const { settings } = get();
    const next: Settings = {
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature],
      },
    };
    db.settings.put(next);
    set({ settings: next });
  },

  setTheme: async (theme) => {
    await get().updateSettings({ theme });
  },

  setAccentColor: async (color) => {
    await get().updateSettings({ accentColor: color });
  },

  setBackgroundImageKey: async (key) => {
    await get().updateSettings({ backgroundImageKey: key });
  },

  setClockVariant: async (variant) => {
    await get().updateSettings({ clockVariant: variant });
  },

  setDuration: async (field, seconds) => {
    await get().updateSettings({ [field]: seconds });
  },

  toggleAutoStart: async (field) => {
    const current = get().settings[field];
    await get().updateSettings({ [field]: !current });
  },
});
