import { useAppStore } from "@/store";
import HorizontalDivider from "@/components/ui/horizontal-divider-line";
import HeaderDescription from "@/components/ui/header-description";
import ToggleSwitch from "@/components/ui/toggle-switch";
import AutomationToggle from "../components/automation-toggle";
import { showSettingsToast } from "../components/settings-toast";
import {
  soundManager,
  SOUND_EVENTS,
  DEFAULT_MASTER_VOLUME,
  type SoundEventId,
} from "@/lib/soundManager";
import {
  notificationsSupported,
  requestNotificationPermission,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

function VolumeSlider({
  value,
  disabled,
  onChange,
  onRelease,
  ariaLabel = "Sound volume",
}: {
  value: number;
  disabled: boolean;
  onChange: (v: number) => void;
  onRelease: () => void;
  ariaLabel?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-40 items-center",
        disabled && "pointer-events-none opacity-40"
      )}
    >
      <div className="bg-brown-200 dark:bg-dark-100 relative h-1 w-full rounded-full">
        <div
          className="bg-brown-500 dark:bg-dark-600 absolute left-0 h-full rounded-full"
          style={{ width: `${value}%` }}
        />
        <div
          className="bg-brown-700 dark:border-dark-900 border-brown-100 pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 dark:bg-white"
          style={{ left: `${value}%`, top: "50%" }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onRelease}
        aria-label={ariaLabel}
        // The slider itself should not trigger the global click sound
        data-sound="none"
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}

function MasterVolumeRow() {
  const masterEnabled = useAppStore((s) => s.settings.sounds.enabled);
  const masterVolume = useAppStore(
    (s) => s.settings.sounds.masterVolume ?? DEFAULT_MASTER_VOLUME
  );
  const setSoundsMasterVolume = useAppStore((s) => s.setSoundsMasterVolume);

  return (
    <div
      className={cn(
        "text-brown-900 dark:text-dark-100 flex w-full items-center justify-between gap-6",
        !masterEnabled && "pointer-events-none opacity-40"
      )}
    >
      <div className="text-base">
        <h3 className="font-semibold">Master volume</h3>
        <p className="text-sm opacity-75">
          Scales every sound effect on top of its individual volume below.
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-fragment-mono w-10 text-right text-xs opacity-75">
          {masterVolume}%
        </span>
        <VolumeSlider
          value={masterVolume}
          disabled={!masterEnabled}
          onChange={(v) => setSoundsMasterVolume(v)}
          onRelease={() => soundManager.play("click", { force: true })}
          ariaLabel="Master sound volume"
        />
      </div>
    </div>
  );
}

function SoundEventRow({ id }: { id: SoundEventId }) {
  const event = useAppStore((s) => s.settings.sounds.events[id]);
  const masterEnabled = useAppStore((s) => s.settings.sounds.enabled);
  const setSoundEvent = useAppStore((s) => s.setSoundEvent);

  const def = SOUND_EVENTS[id];
  const enabled = event?.enabled ?? true;
  const volume = event?.volume ?? def.defaultVolume;

  return (
    <div
      className={cn(
        "text-brown-900 dark:text-dark-100 flex w-full items-center justify-between gap-6",
        !masterEnabled && "pointer-events-none opacity-40"
      )}
    >
      <div className="text-base">
        <h3 className="font-semibold">
          {def.label}{" "}
          <span className="font-fragment-mono text-xs font-normal opacity-45">
            {def.file}
          </span>
        </h3>
        <p className="text-sm opacity-75">{def.description}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-fragment-mono w-10 text-right text-xs opacity-75">
          {volume}%
        </span>
        <VolumeSlider
          value={volume}
          disabled={!enabled}
          onChange={(v) => setSoundEvent(id, { volume: v })}
          // Preview the sound at the chosen volume when the slider is released
          onRelease={() => soundManager.play(id, { force: true, volume })}
        />
        <ToggleSwitch
          checked={enabled}
          onChange={(next) => setSoundEvent(id, { enabled: next })}
        />
      </div>
    </div>
  );
}

export default function SoundSettings() {
  const soundsEnabled = useAppStore((s) => s.settings.sounds.enabled);
  const notificationsEnabled = useAppStore(
    (s) => s.settings.notificationsEnabled
  );
  const setSoundsEnabled = useAppStore((s) => s.setSoundsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);

  const handleNotificationsToggle = async () => {
    if (!notificationsEnabled) {
      if (!notificationsSupported()) {
        showSettingsToast("This browser does not support notifications.");
        return;
      }
      const granted = await requestNotificationPermission();
      if (!granted) {
        showSettingsToast(
          "Notifications are blocked by the browser. Allow them in site settings first."
        );
        return;
      }
    }
    await setNotificationsEnabled(!notificationsEnabled);
    showSettingsToast(
      `Notifications ${notificationsEnabled ? "disabled" : "enabled"}.`
    );
  };

  return (
    <main>
      <HeaderDescription
        header={"Sounds & notifications"}
        description={
          "Control the app sound effects and browser notifications. Volumes and toggles are saved with your data and included in JSON backups."
        }
        kaomoji={null}
      />
      <HorizontalDivider />
      <section className="mt-6 flex flex-col gap-6">
        <AutomationToggle
          label="Browser notifications"
          description="Shows a system notification when a focus session or break completes. Useful when the tab is in the background."
          checked={notificationsEnabled}
          onChange={handleNotificationsToggle}
        />
        <AutomationToggle
          label="Enable sounds"
          description="Master switch for all sound effects below."
          checked={soundsEnabled}
          onChange={() => {
            setSoundsEnabled(!soundsEnabled);
            showSettingsToast(
              `Sounds ${soundsEnabled ? "disabled" : "enabled"}.`
            );
          }}
        />
        <MasterVolumeRow />
        <HorizontalDivider />
        {/* One row per event defined in src/assets/audio/sounds.json */}
        {(Object.keys(SOUND_EVENTS) as SoundEventId[]).map((id) => (
          <SoundEventRow key={id} id={id} />
        ))}
        <p className="text-brown-900 dark:text-dark-100 text-xs opacity-55">
          Want your own sounds? Drop audio files into{" "}
          <span className="font-fragment-mono">src/assets/audio/</span> and map
          them in <span className="font-fragment-mono">sounds.json</span>. See
          the README in that folder.
        </p>
      </section>
    </main>
  );
}
