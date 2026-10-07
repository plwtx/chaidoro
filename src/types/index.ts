export type TimerStatus =
  | "idle"
  | "running"
  | "paused"
  | "finished"
  | "overtime";
export type TimerMode = "focus" | "break" | "long-break";
export type TaskStatus = "todo" | "in-progress" | "done";
export type Theme = "light" | "dark" | "system";
export type ClockVariant = "slide" | "blur" | "morph" | "matrix" | "default";

export type BackgroundPattern =
  | "none"
  | "dots"
  | "grid"
  | "diagonal"
  | "cross"
  | "zigzag"
  | "waves"
  | "checkers"
  | "hexagons"
  | "leaves";

export interface Features {
  taskManager: boolean;
  statistics: boolean;
}

export interface SoundEventSetting {
  enabled: boolean;
  volume: number;
}

export interface SoundSettings {
  enabled: boolean;
  masterVolume: number;
  events: Record<string, SoundEventSetting>;
}

export interface ShortcutSettings {
  enabled: boolean;
  bindings: Record<string, string | null>;
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

  phase?: "overtime";
  overtimeElapsed?: number;
  sessionId?: string | null;
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
  overtimeEnabled: boolean;
  focusBorderEnabled: boolean;
  features: Features;
  theme: Theme;
  accentEnabled: boolean;
  accentColor: string;
  backgroundPattern: BackgroundPattern;
  backgroundImageKey: number | null;
  backgroundOpacity: number;
  backgroundSaturation: number;
  backgroundContrast: number;
  clockVariant: ClockVariant;
  sounds: SoundSettings;
  shortcuts: ShortcutSettings;
  notificationsEnabled: boolean;
  reducedMotion: boolean;
  dynamicTitlebar: boolean;
  titlebarSeparator: string;
  introCompleted: boolean;
  timezone: string;
  lastActiveDate: string;
  dailyFocusCount: number;
}

export interface BackgroundImage {
  key?: number;
  blob: Blob;
  createdAt: number;
}
