import type {
  Settings,
  Features,
  Theme,
  ClockVariant,
  BackgroundPattern,
  SoundSettings,
  SoundEventSetting,
} from "@/types";
import { db } from "@/db";
import soundManifest from "@/assets/audio/sounds.json";
import { DEFAULT_SHORTCUT_BINDINGS } from "@/lib/shortcuts";
import { DEFAULT_ACCENT } from "@/lib/accent";
import { normalizeHex } from "@/lib/color";
import { isBackgroundPattern } from "@/lib/backgroundPatterns";

// Sound defaults are derived from the manifest so a new event added to sounds.json automatically gets a default entry for existing users too (via the deep-merge in loadSettings).
function buildDefaultSoundSettings(): SoundSettings {
  const events: Record<string, SoundEventSetting> = {};
  for (const [id, def] of Object.entries(soundManifest.events)) {
    events[id] = { enabled: true, volume: def.defaultVolume ?? 70 };
  }
  return {
    enabled: true,
    masterVolume: soundManifest.master.defaultVolume,
    events,
  };
}

export const DEFAULT_SETTINGS: Settings = {
  key: "app",
  focusDuration: 1500,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  overtimeEnabled: true,
  focusBorderEnabled: true,
  features: { taskManager: false, statistics: true },
  theme: "light",
  accentEnabled: false,
  accentColor: DEFAULT_ACCENT,
  backgroundPattern: "dots",
  backgroundImageKey: null,
  backgroundOpacity: 84,
  backgroundSaturation: 100,
  backgroundContrast: 50,
  clockVariant: "slide",
  sounds: buildDefaultSoundSettings(),
  shortcuts: { enabled: true, bindings: { ...DEFAULT_SHORTCUT_BINDINGS } },
  notificationsEnabled: false,
  reducedMotion: false,
  dynamicTitlebar: true,
  titlebarSeparator: "-",
  introCompleted: false,
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
  setAccentEnabled: (enabled: boolean) => Promise<void>;
  setAccentColor: (color: string) => Promise<void>;
  setBackgroundPattern: (pattern: BackgroundPattern) => Promise<void>;
  setBackgroundImageKey: (key: number | null) => Promise<void>;
  setClockVariant: (variant: ClockVariant) => Promise<void>;
  setDuration: (
    field: "focusDuration" | "shortBreakDuration" | "longBreakDuration",
    seconds: number
  ) => Promise<void>;
  toggleAutoStart: (
    field: "autoStartBreak" | "autoStartFocus"
  ) => Promise<void>;
  setOvertimeEnabled: (enabled: boolean) => Promise<void>;
  setFocusBorderEnabled: (enabled: boolean) => Promise<void>;
  setSoundsEnabled: (enabled: boolean) => Promise<void>;
  setSoundsMasterVolume: (volume: number) => Promise<void>;
  setSoundEvent: (
    id: string,
    patch: Partial<SoundEventSetting>
  ) => Promise<void>;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  setIntroCompleted: (completed: boolean) => Promise<void>;
  setShortcutsEnabled: (enabled: boolean) => Promise<void>;
  /*
    Assigns a combo (or null to unbind). If another action already uses the combo it is stolen from it; returns that action's id so the UI can say it.
  */
  setShortcutBinding: (
    actionId: string,
    combo: string | null
  ) => Promise<string | null>;
  resetShortcutBindings: () => Promise<void>;
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
          // Deep-merge so sound events added in newer versions keep their defaults for users with older stored settings / backups.
          sounds: {
            ...DEFAULT_SETTINGS.sounds,
            ...stored.sounds,
            events: {
              ...DEFAULT_SETTINGS.sounds.events,
              ...stored.sounds?.events,
            },
          },
          // Same deep-merge for shortcut bindings: actions added in newer versions keep their default combo for existing users.
          shortcuts: {
            ...DEFAULT_SETTINGS.shortcuts,
            ...stored.shortcuts,
            bindings: {
              ...DEFAULT_SETTINGS.shortcuts.bindings,
              ...stored.shortcuts?.bindings,
            },
          },
          // Settings saved before the accent toggle existed never let the user pick a color (they hold the old bright violet default), so they start from the muted default. Otherwise a hand-edited backup with a broken hex falls back too.
          accentColor:
            stored.accentEnabled === undefined
              ? DEFAULT_SETTINGS.accentColor
              : (normalizeHex(stored.accentColor) ??
                DEFAULT_SETTINGS.accentColor),
          // Unknown pattern ids (e.g. from a newer or hand-edited backup), and rows saved before patterns existed, fall back to the default pattern.
          backgroundPattern: isBackgroundPattern(stored.backgroundPattern)
            ? stored.backgroundPattern
            : DEFAULT_SETTINGS.backgroundPattern,
          // Rows saved before the intro existed (existing users, older backups) count as completed, so only brand-new users get the tour. A broken value counts as completed too.
          introCompleted:
            typeof stored.introCompleted === "boolean"
              ? stored.introCompleted
              : true,
        },
      });
    } else {
      // First visit, or right after "Clear all data": the defaults go into memory too, not only to disk, so the screen (and the intro flag) start fresh.
      await db.settings.put(DEFAULT_SETTINGS);
      set({ settings: DEFAULT_SETTINGS });
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

  setAccentEnabled: async (enabled) => {
    await get().updateSettings({ accentEnabled: enabled });
  },

  setAccentColor: async (color) => {
    await get().updateSettings({ accentColor: color });
  },

  setBackgroundPattern: async (pattern) => {
    await get().updateSettings({ backgroundPattern: pattern });
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

  setOvertimeEnabled: async (enabled) => {
    await get().updateSettings({ overtimeEnabled: enabled });
  },

  setFocusBorderEnabled: async (enabled) => {
    await get().updateSettings({ focusBorderEnabled: enabled });
  },

  setSoundsEnabled: async (enabled) => {
    const { sounds } = get().settings;
    await get().updateSettings({ sounds: { ...sounds, enabled } });
  },

  setSoundsMasterVolume: async (volume) => {
    const { sounds } = get().settings;
    await get().updateSettings({ sounds: { ...sounds, masterVolume: volume } });
  },

  setSoundEvent: async (id, patch) => {
    const { sounds } = get().settings;
    await get().updateSettings({
      sounds: {
        ...sounds,
        events: {
          ...sounds.events,
          [id]: { ...sounds.events[id], ...patch },
        },
      },
    });
  },

  setNotificationsEnabled: async (enabled) => {
    await get().updateSettings({ notificationsEnabled: enabled });
  },

  setIntroCompleted: async (completed) => {
    await get().updateSettings({ introCompleted: completed });
  },

  setShortcutsEnabled: async (enabled) => {
    const { shortcuts } = get().settings;
    await get().updateSettings({ shortcuts: { ...shortcuts, enabled } });
  },

  setShortcutBinding: async (actionId, combo) => {
    const { shortcuts } = get().settings;
    const bindings = { ...shortcuts.bindings };
    let stolenFrom: string | null = null;
    if (combo) {
      for (const [id, bound] of Object.entries(bindings)) {
        if (id !== actionId && bound === combo) {
          bindings[id] = null;
          stolenFrom = id;
        }
      }
    }
    bindings[actionId] = combo;
    await get().updateSettings({ shortcuts: { ...shortcuts, bindings } });
    return stolenFrom;
  },

  resetShortcutBindings: async () => {
    const { shortcuts } = get().settings;
    await get().updateSettings({
      shortcuts: { ...shortcuts, bindings: { ...DEFAULT_SHORTCUT_BINDINGS } },
    });
  },
});
