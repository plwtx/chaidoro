import { create } from "zustand";

export const SETTINGS_TABS = [
  { id: "general", name: "General" },
  { id: "clock", name: "Clock" },
  { id: "sounds", name: "Sounds" },
  { id: "shortcuts", name: "Shortcuts" },
  { id: "theme", name: "Theme" },
  { id: "storage", name: "Storage" },
  { id: "information", name: "Information" },
] as const;

export type SettingsTabId = (typeof SETTINGS_TABS)[number]["id"];

interface SettingsTabState {
  activeId: SettingsTabId;
  setActiveId: (id: SettingsTabId) => void;
}

export const useSettingsTabStore = create<SettingsTabState>()((set) => ({
  activeId: "general",
  setActiveId: (id) => set({ activeId: id }),
}));
