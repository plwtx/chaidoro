import { create } from "zustand";
import { createTimerSlice, type TimerSlice } from "./slices/timerSlice";
import { createTaskSlice, type TaskSlice } from "./slices/taskSlice";
import { createSessionSlice, type SessionSlice } from "./slices/sessionSlice";
import {
  createSettingsSlice,
  type SettingsSlice,
} from "./slices/settingsSlice";

export type AppStore = TimerSlice & TaskSlice & SessionSlice & SettingsSlice;

export const useAppStore = create<AppStore>()((set, get) => ({
  ...createTimerSlice(set, get),
  ...createTaskSlice(set, get),
  ...createSessionSlice(set, get),
  ...createSettingsSlice(set, get),
}));
