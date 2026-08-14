import { useAppStore } from "@/store";
import soundManifest from "@/assets/audio/sounds.json";

// Sound events (which file plays for what) are defined in
// src/assets/audio/sounds.json - see the README.md next to it.
export type SoundEventId = keyof typeof soundManifest.events;

export const SOUND_EVENTS = soundManifest.events;

// Resolve every audio file in the assets folder to its bundled URL so the
// manifest can reference files by plain filename.
const audioUrls = import.meta.glob("@/assets/audio/*.{wav,mp3,ogg}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function urlForFile(file: string): string | null {
  for (const [path, url] of Object.entries(audioUrls)) {
    if (path.endsWith(`/${file}`)) return url;
  }
  console.warn(`[sounds] File "${file}" not found in src/assets/audio/`);
  return null;
}

// Web Audio (instead of <audio> elements) so rapid-fire clicks can overlap
// without cutting each other off and playback latency stays low.
class SoundManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<SoundEventId, AudioBuffer>();
  private preloadPromise: Promise<void> | null = null;

  // Web Audio is unavailable in some environments (e.g. jsdom tests)
  private get supported(): boolean {
    return typeof AudioContext !== "undefined";
  }

  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  /* Fetch + decode every manifest sound once. Safe to call repeatedly. */
  preload(): Promise<void> {
    if (!this.supported) return Promise.resolve();
    if (this.preloadPromise) return this.preloadPromise;

    this.preloadPromise = (async () => {
      const ctx = this.getContext();
      await Promise.all(
        (Object.keys(soundManifest.events) as SoundEventId[]).map(
          async (id) => {
            const url = urlForFile(soundManifest.events[id].file);
            if (!url) return;
            try {
              const res = await fetch(url);
              const data = await res.arrayBuffer();
              this.buffers.set(id, await ctx.decodeAudioData(data));
            } catch (err) {
              console.warn(`[sounds] Failed to load "${id}"`, err);
            }
          }
        )
      );
    })();

    return this.preloadPromise;
  }

  /**
    Play a sound event, respecting user settings.
   `force` bypasses the enabled checks and `volume` (0-100) overrides the
    stored volume - both used for previews in Settings.
   */
  play(
    id: SoundEventId,
    opts: { force?: boolean; volume?: number } = {}
  ): void {
    if (!this.supported) return;
    const { sounds } = useAppStore.getState().settings;
    const event = sounds.events[id];
    const volume = (opts.volume ?? event?.volume ?? 70) / 100;

    if (!opts.force) {
      if (!sounds.enabled) return;
      if (!event?.enabled || volume <= 0) return;
    }

    const buffer = this.buffers.get(id);
    if (!buffer) {
      // Not preloaded yet; kick it off so the next play works.
      this.preload();
      return;
    }

    const ctx = this.getContext();
    // Autoplay policy leaves the context suspended until a user gesture;
    // resume() succeeds inside gesture handlers (e.g. the click listener).
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const gain = ctx.createGain();
    gain.gain.value = volume;
    gain.connect(ctx.destination);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start();
  }
}

export const soundManager = new SoundManager();
