import { useState } from "react";
import { useAppStore } from "@/store";
import HorizontalDivider from "@/components/ui/horizontal-divider-line";
import HeaderDescription from "@/components/ui/header-description";
import SubHeaderDescription from "@/components/ui/sub-header-description";
import TimerDurationCard, {
  type DurationField,
} from "../components/timer-duration-card";
import AutomationToggle from "../components/automation-toggle";
import { showSettingsToast } from "../components/settings-toast";
import ClockStyles from "../components/clock-styles.tsx";

export default function ClockSettings() {
  const focusDuration = useAppStore((s) => s.settings.focusDuration);
  const shortBreakDuration = useAppStore((s) => s.settings.shortBreakDuration);
  const longBreakDuration = useAppStore((s) => s.settings.longBreakDuration);
  const autoStartBreak = useAppStore((s) => s.settings.autoStartBreak);
  const autoStartFocus = useAppStore((s) => s.settings.autoStartFocus);
  const toggleAutoStart = useAppStore((s) => s.toggleAutoStart);
  const overtimeEnabled = useAppStore((s) => s.settings.overtimeEnabled);
  const setOvertimeEnabled = useAppStore((s) => s.setOvertimeEnabled);
  const focusBorderEnabled = useAppStore((s) => s.settings.focusBorderEnabled);
  const setFocusBorderEnabled = useAppStore((s) => s.setFocusBorderEnabled);
  const timerStatus = useAppStore((s) => s.status);

  const isTimerActive = timerStatus !== "idle";
  const [editingField, setEditingField] = useState<DurationField | null>(null);

  return (
    <div className="font-poppins text-brown-800 dark:text-dark-100 h-full w-full text-sm">
      <HeaderDescription
        header={"Mechanics of clock"}
        description={
          "Core mechanics of app. Clock settings such as setting up your focus cycle period, rest period, automation, clock style and other settings."
        }
        kaomoji={null}
      />

      <div className="bg-brown-300 dark:bg-dark-100/20 mx-auto my-6 h-px w-full rounded-full" />

      <SubHeaderDescription
        header={"Timer (minutes)"}
        description={"Focus / Break / Long break"}
      />

      {isTimerActive && (
        <p className="text-brown-600 dark:text-dark-100/60 mt-2 text-xs italic">
          Pause or finish your current cycle to edit durations.
        </p>
      )}

      <div className="text-brown-800 my-3 flex w-full justify-between gap-1">
        <TimerDurationCard
          label="Focus"
          seconds={focusDuration}
          field="focusDuration"
          isTimerActive={isTimerActive}
          bgClass="bg-brown-200 dark:bg-dark-900/75"
          isEditing={editingField === "focusDuration"}
          onStartEdit={setEditingField}
          onClose={() => setEditingField(null)}
        />
        <TimerDurationCard
          label="Break"
          seconds={shortBreakDuration}
          field="shortBreakDuration"
          isTimerActive={isTimerActive}
          bgClass="bg-brown-200/50 dark:bg-dark-900/45"
          isEditing={editingField === "shortBreakDuration"}
          onStartEdit={setEditingField}
          onClose={() => setEditingField(null)}
        />
        <TimerDurationCard
          label="Long break"
          seconds={longBreakDuration}
          field="longBreakDuration"
          isTimerActive={isTimerActive}
          bgClass="bg-brown-200/25 dark:bg-dark-900/15"
          isEditing={editingField === "longBreakDuration"}
          onStartEdit={setEditingField}
          onClose={() => setEditingField(null)}
        />
      </div>

      <HorizontalDivider className="my-9" />
      {/* Clock styles */}
      <section className="flex w-full items-center justify-between gap-3">
        <SubHeaderDescription
          header={"Clock animation style"}
          description={
            "When cycle starts the numbers transition according to the animation style selected."
          }
          className="mt-6"
        />
        <ClockStyles />
      </section>
      <HorizontalDivider className="my-9" />

      <SubHeaderDescription
        header={"Automation"}
        description={"Auto start settings and overtime actions."}
        className="mt-6"
      />
      <section className="my-9 space-y-6">
        <AutomationToggle
          label="Break cycle: Auto start"
          description="Automatically start a break cycle when you end a focus session."
          checked={autoStartBreak}
          onChange={() => {
            toggleAutoStart("autoStartBreak");
            showSettingsToast(
              `Break cycle: Auto start ${autoStartBreak ? "disabled" : "enabled"}.`
            );
          }}
        />
        <HorizontalDivider className="opacity-25" />
        <AutomationToggle
          label="Focus cycle: Auto start"
          description="Automatically start the next focus cycle when your break ends."
          checked={autoStartFocus}
          onChange={() => {
            toggleAutoStart("autoStartFocus");
            showSettingsToast(
              `Focus cycle: Auto start ${autoStartFocus ? "disabled" : "enabled"}.`
            );
          }}
        />
        <HorizontalDivider className="opacity-25" />
        <AutomationToggle
          label="Focus cycle: Overtime"
          description="Keep counting once your focus time is up, then choose to add the extra time to the session or dismiss it."
          checked={overtimeEnabled}
          onChange={(next) => {
            setOvertimeEnabled(next);
            showSettingsToast(
              `Focus cycle: Overtime ${next ? "enabled" : "disabled"}.`
            );
          }}
        />
        <HorizontalDivider className="opacity-25" />
        <AutomationToggle
          label="Focus cycle: Edge border"
          description="Pull the whole app back while a focus cycle is running, framing it with an edge around the screen."
          checked={focusBorderEnabled}
          onChange={(next) => {
            setFocusBorderEnabled(next);
            showSettingsToast(
              `Focus cycle: Edge border ${next ? "enabled" : "disabled"}.`
            );
          }}
        />
      </section>
    </div>
  );
}
