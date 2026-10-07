import { useAppStore } from "@/store";
import type { IntroPageProps } from "../../types";
import SlideLayout from "../../components/slide-layout";
import SetupField from "../../components/setup-field";
import SetupToggle from "../../components/setup-toggle";
import TimerVisual from "./visual";
import DurationPresets from "./duration-presets";

export default function TimerPage({ step }: IntroPageProps) {
  const autoStartBreak = useAppStore((s) => s.settings.autoStartBreak);
  const autoStartFocus = useAppStore((s) => s.settings.autoStartFocus);
  const overtimeEnabled = useAppStore((s) => s.settings.overtimeEnabled);
  const updateSettings = useAppStore((s) => s.updateSettings);

  return (
    <SlideLayout
      step={step}
      title="Your rhythm"
      description="How long you focus and rest, and what happens when time is up."
      visual={<TimerVisual />}
    >
      <SetupField label="Durations">
        <DurationPresets />
      </SetupField>
      <div className="flex flex-col gap-3">
        <SetupToggle
          label="Auto-start breaks"
          description="Start the break when a focus cycle ends."
          checked={autoStartBreak}
          onChange={(next) => updateSettings({ autoStartBreak: next })}
        />
        <SetupToggle
          label="Auto-start focus"
          description="Start the next focus when a break ends."
          checked={autoStartFocus}
          onChange={(next) => updateSettings({ autoStartFocus: next })}
        />
        <SetupToggle
          label="Overtime"
          description="Keep counting when focus time is up."
          checked={overtimeEnabled}
          onChange={(next) => updateSettings({ overtimeEnabled: next })}
        />
      </div>
    </SlideLayout>
  );
}
