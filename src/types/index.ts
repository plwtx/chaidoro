export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type TimerMode = "focus" | "break" | "long-break";
export type TaskStatus = "todo" | "in-progress" | "done";
export type Theme = "light" | "dark" | "system";
export type ClockVariant = "slide" | "blur" | "morph" | "matrix" | "default";

export interface Features {
  taskManager: boolean;
  statistics: boolean;
}

/* Per-event sound preference. Event ids come from src/assets/audio/sounds.json */
export interface SoundEventSetting {
  enabled: boolean;
  volume: number; // 0-100
}

export interface SoundSettings {
  enabled: boolean; // master switch for all sound effects
  events: Record<string, SoundEventSetting>;
}

export interface Session {
  id: string;
  mode: TimerMode;
  targetDuration: number;
  actualDuration: number;
  completedAt: number;
  pomodoroSetId: string | null;
  taskId: string | null;
  interrupted: boolean;
}

export interface SessionDraft {
  id: "current";
  startedAt: number;
  mode: TimerMode;
  targetDuration: number;
  taskId: string | null;
  pomodoroSetId: string | null;
  lastCheckpointAt: number;
  elapsedAtCheckpoint: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  project: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  key: string;
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  features: Features;
  theme: Theme;
  accentColor: string;
  backgroundImageKey: number | null;
  backgroundOpacity: number;
  backgroundSaturation: number;
  backgroundContrast: number;
  clockVariant: ClockVariant;
  sounds: SoundSettings;
  notificationsEnabled: boolean;
  reducedMotion: boolean;
  dynamicTitlebar: boolean;
  titlebarSeparator: string;
  timezone: string;
  lastActiveDate: string;
  dailyFocusCount: number;
}

export interface BackgroundImage {
  key?: number;
  blob: Blob;
  createdAt: number;
}
