import { db } from "@/db";
import { useAppStore } from "@/store";
import { hydrateStore } from "@/store/hydrate";

export async function exportJSON() {
  const [sessions, sessionDraft, tasks, settings, backgroundImages] =
    await Promise.all([
      db.sessions.toArray(),
      db.sessionDraft.toArray(),
      db.tasks.toArray(),
      db.settings.toArray(),
      db.backgroundImages.toArray(),
    ]);

  const bgImagesSerialised = await Promise.all(
    backgroundImages.map(async (img) => {
      const buffer = await img.blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      return {
        key: img.key,
        createdAt: img.createdAt,
        blob: base64,
        mimeType: img.blob.type,
      };
    })
  );

  const payload = {
    version: 1,
    exportedAt: Date.now(),
    sessions,
    sessionDraft,
    tasks,
    settings,
    backgroundImages: bgImagesSerialised,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = backupFileName();
  a.click();
  URL.revokeObjectURL(url);
}

/*
  "Chaidoro 30.05.2026 14-35.json" - local date and time of the download.
*/
function backupFileName(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `Chaidoro ${day}.${month}.${year} ${hours}-${minutes}.json`;
}

export async function importJSON(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text);

  if (
    !data.version ||
    !Array.isArray(data.sessions) ||
    !Array.isArray(data.tasks) ||
    !Array.isArray(data.settings)
  ) {
    throw new Error("Invalid backup file format.");
  }

  const bgImages = (data.backgroundImages ?? []).map(
    (img: {
      key: number;
      createdAt: number;
      blob: string;
      mimeType: string;
    }) => {
      const binary = atob(img.blob);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return {
        key: img.key,
        createdAt: img.createdAt,
        blob: new Blob([bytes], { type: img.mimeType }),
      };
    }
  );

  await db.transaction(
    "rw",
    [db.sessions, db.sessionDraft, db.tasks, db.settings, db.backgroundImages],
    async () => {
      await db.sessions.clear();
      await db.sessionDraft.clear();
      await db.tasks.clear();
      await db.settings.clear();
      await db.backgroundImages.clear();

      await db.sessions.bulkAdd(data.sessions);
      if (data.sessionDraft?.length) {
        await db.sessionDraft.bulkAdd(data.sessionDraft);
      }
      await db.tasks.bulkAdd(data.tasks);
      await db.settings.bulkAdd(data.settings);
      if (bgImages.length) {
        await db.backgroundImages.bulkAdd(bgImages);
      }
    }
  );

  await hydrateStore();
}

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.sessions, db.sessionDraft, db.tasks, db.settings, db.backgroundImages],
    async () => {
      await db.sessions.clear();
      await db.sessionDraft.clear();
      await db.tasks.clear();
      await db.settings.clear();
      await db.backgroundImages.clear();
    }
  );

  await hydrateStore();
}

export async function deleteSession(id: string): Promise<void> {
  await db.sessions.delete(id);
}

export async function clearFocusSessions(): Promise<void> {
  await db.sessions.clear();
}
