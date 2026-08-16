import type { Session } from "@/types";
import { db } from "@/db";

export interface SessionSliceActions {
  getSessionsInRange: (start: number, end: number) => Promise<Session[]>;
  recoverDraft: () => Promise<boolean>;
}

export type SessionSlice = SessionSliceActions;

export const createSessionSlice = (set, get): SessionSlice => ({
  getSessionsInRange: async (start, end) => {
    return db.sessions
      .where("[mode+completedAt]")
      .between(["focus", start], ["focus", end], true, true)
      .toArray();
  },

  /* Returns whether a draft was actually put back on screen. The restored buttons (add / dismiss, or resume / end cycle) are the recovery UI, so there is nothing left to prompt about. */
  recoverDraft: async () => {
    const draft = await db.sessionDraft.get("current");
    if (!draft) return false;

    if (draft.phase === "overtime") {
      get().restoreOvertime(draft);
      return true;
    }

    // Only unfinished focus cycles are worth resuming; a half-run break, or a cycle whose time already ran out, is dropped.
    if (
      draft.mode !== "focus" ||
      draft.elapsedAtCheckpoint >= draft.targetDuration
    ) {
      await db.sessionDraft.delete("current");
      return false;
    }

    get().restoreCycle(draft);
    return true;
  },
});
