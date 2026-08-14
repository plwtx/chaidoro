import { useAppStore } from "@/store";
import type { TimerMode } from "@/types";

export function notificationsSupported(): boolean {
  return "Notification" in window;
}

export function notificationsActive(): boolean {
  return (
    notificationsSupported() &&
    Notification.permission === "granted" &&
    useAppStore.getState().settings.notificationsEnabled
  );
}

/* Ask the browser for permission. Must be called from a user gesture. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!notificationsSupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

const COMPLETE_MESSAGES: Record<TimerMode, string> = {
  focus: "Focus session complete. Time for a break!",
  break: "Break is over. Ready for your next focus session?",
  "long-break": "Long break is over. Ready for your next focus session?",
};

/* Fired by the timer bridge when a session completes. */
export function notifyTimerComplete(mode: TimerMode): void {
  if (!notificationsActive()) return;
  try {
    new Notification("Chaidoro", {
      body: COMPLETE_MESSAGES[mode],
      icon: "/android-chrome-192x192.png",
      // Replaces a previous unread timer notification instead of stacking.
      tag: "chaidoro-timer",
    });
  } catch {
    // Some platforms (e.g. Android Chrome) only allow notifications via a
    // service worker registration; ignore failures silently.
  }
}
