import { useAppStore } from "@/store";

/*
  Whether the intro (first-run tour) is on screen, and the two ways to change that. The source of truth is settings.introCompleted, so it is saved in IndexedDB and rides along in JSON backups.
  Keep this module free of component imports: RootLayout, the shortcut dispatcher, the command palette and Settings import it eagerly, and a component import would pull the lazy intro chunk into the main bundle.
*/

export function useIntroOpen(): boolean {
  return useAppStore((s) => !s.settings.introCompleted);
}

/* Non-React read, for event handlers such as the global shortcut dispatcher. */
export function isIntroOpen(): boolean {
  return !useAppStore.getState().settings.introCompleted;
}

/* Finish or skip: the intro closes and stays closed until it is replayed. */
export function completeIntro(): Promise<void> {
  return useAppStore.getState().setIntroCompleted(true);
}

/* Opens the intro again from its first page (Settings > General, command palette). */
export function replayIntro(): Promise<void> {
  return useAppStore.getState().setIntroCompleted(false);
}
