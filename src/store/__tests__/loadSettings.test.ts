import { vi, describe, it, expect } from "vitest";
import { useAppStore } from "@/store/index";
import { DEFAULT_SETTINGS } from "@/store/slices/settingsSlice";
import { DEFAULT_ACCENT } from "@/lib/accent";
import { db } from "@/db";
import type { Settings } from "@/types";

vi.mock("@/db", () => ({
  db: {
    settings: { get: vi.fn(), put: vi.fn() },
    sessions: { add: vi.fn(), update: vi.fn() },
    sessionDraft: { put: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));

async function loadStored(stored: Partial<Settings>): Promise<Settings> {
  vi.mocked(db.settings.get).mockResolvedValue(stored as Settings);
  await useAppStore.getState().loadSettings();
  return useAppStore.getState().settings;
}

describe("loadSettings - accent color", () => {
  it("moves settings saved before the accent toggle to the muted default", async () => {
    const legacy: Partial<Settings> = {
      ...DEFAULT_SETTINGS,
      accentColor: "#a78bfa",
    };
    delete legacy.accentEnabled;

    const settings = await loadStored(legacy);

    expect(settings.accentEnabled).toBe(false);
    expect(settings.accentColor).toBe(DEFAULT_ACCENT);
  });

  it("keeps a picked accent, normalized", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      accentEnabled: true,
      accentColor: "#ABC",
    });

    expect(settings.accentEnabled).toBe(true);
    expect(settings.accentColor).toBe("#aabbcc");
  });

  it("falls back to the default for a broken hex (hand-edited backup)", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      accentEnabled: true,
      accentColor: "not-a-color",
    });

    expect(settings.accentColor).toBe(DEFAULT_ACCENT);
  });
});

describe("loadSettings - background pattern", () => {
  it("keeps a known pattern", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      backgroundPattern: "waves",
    });
    expect(settings.backgroundPattern).toBe("waves");
  });

  it("drops an unknown pattern to none", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      backgroundPattern: "plaid" as Settings["backgroundPattern"],
    });
    expect(settings.backgroundPattern).toBe("none");
  });

  it("gives settings without the field no pattern", async () => {
    const legacy: Partial<Settings> = { ...DEFAULT_SETTINGS };
    delete legacy.backgroundPattern;

    expect((await loadStored(legacy)).backgroundPattern).toBe("none");
  });
});
