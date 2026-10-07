import { useAppStore } from "@/store";
import { useNotificationsToggle } from "@/hooks/useNotificationsToggle";
import type { IntroPageProps } from "../../types";
import SlideLayout from "../../components/slide-layout";
import SetupToggle from "../../components/setup-toggle";
import SlideText from "../../components/slide-text";
import NotificationsVisual from "./visual";

export default function NotificationsPage({ step }: IntroPageProps) {
  const notifications = useNotificationsToggle();
  const soundsEnabled = useAppStore((s) => s.settings.sounds.enabled);
  const setSoundsEnabled = useAppStore((s) => s.setSoundsEnabled);

  return (
    <SlideLayout
      step={step}
      title="Stay in the loop"
      description="Know when a cycle ends, even from another tab."
      visual={<NotificationsVisual />}
    >
      <div className="flex flex-col gap-3">
        <SetupToggle
          label="Browser notifications"
          description="A system notification when a focus session or break ends."
          checked={notifications.enabled}
          // Asks the browser for permission the first time
          onChange={notifications.toggle}
        />
        <SetupToggle
          label="Sounds"
          description="Start and finish sounds. Volumes are in Settings > Sounds."
          checked={soundsEnabled}
          onChange={setSoundsEnabled}
        />
      </div>
      <SlideText>
        That's all. Press "Let's go" to start, and replay this tour anytime from
        Settings &gt; General.
      </SlideText>
    </SlideLayout>
  );
}
