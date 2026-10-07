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

  it("keeps a stored none", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      backgroundPattern: "none",
    });
    expect(settings.backgroundPattern).toBe("none");
  });

  it("drops an unknown pattern to the default (dots)", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      backgroundPattern: "plaid" as Settings["backgroundPattern"],
    });
    expect(settings.backgroundPattern).toBe("dots");
  });

  it("gives settings saved before patterns existed the default (dots)", async () => {
    const legacy: Partial<Settings> = { ...DEFAULT_SETTINGS };
    delete legacy.backgroundPattern;

    expect((await loadStored(legacy)).backgroundPattern).toBe("dots");
  });
});

describe("loadSettings - intro", () => {
  it("keeps a stored intro flag", async () => {
    const open = await loadStored({
      ...DEFAULT_SETTINGS,
      introCompleted: false,
    });
    expect(open.introCompleted).toBe(false);

    const done = await loadStored({
      ...DEFAULT_SETTINGS,
      introCompleted: true,
    });
    expect(done.introCompleted).toBe(true);
  });

  it("counts settings saved before the intro existed as completed", async () => {
    const legacy: Partial<Settings> = { ...DEFAULT_SETTINGS };
    delete legacy.introCompleted;

    expect((await loadStored(legacy)).introCompleted).toBe(true);
  });

  it("counts a broken value (hand-edited backup) as completed", async () => {
    const settings = await loadStored({
      ...DEFAULT_SETTINGS,
      introCompleted: "yes" as unknown as boolean,
    });
    expect(settings.introCompleted).toBe(true);
  });
});

describe("loadSettings - no stored row (first visit, or after Clear all data)", () => {
  it("saves the defaults and puts them in memory, so the intro shows", async () => {
    useAppStore.setState({
      settings: { ...DEFAULT_SETTINGS, theme: "dark", introCompleted: true },
    });
    vi.mocked(db.settings.get).mockResolvedValue(undefined);

    await useAppStore.getState().loadSettings();

    expect(db.settings.put).toHaveBeenCalledWith(DEFAULT_SETTINGS);
    expect(useAppStore.getState().settings).toEqual(DEFAULT_SETTINGS);
    expect(useAppStore.getState().settings.introCompleted).toBe(false);
  });

  it("starts in the light theme with the dots pattern", async () => {
    vi.mocked(db.settings.get).mockResolvedValue(undefined);

    await useAppStore.getState().loadSettings();

    const { settings } = useAppStore.getState();
    expect(settings.theme).toBe("light");
    expect(settings.backgroundPattern).toBe("dots");
  });
});
