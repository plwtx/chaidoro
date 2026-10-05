import { useAppStore } from "@/store";
import {
  notificationsSupported,
  requestNotificationPermission,
} from "@/lib/notifications";
import { showSettingsToast } from "@/features/settings/components/settings-toast";

/*
  Browser notifications on / off. Turning them on asks the browser for permission first, so call toggle() from a click; a toast explains when the browser does not support or blocks them. Shared by Settings > Sounds and the intro.
*/
export function useNotificationsToggle() {
  const enabled = useAppStore((s) => s.settings.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);

  const toggle = async () => {
    if (!enabled) {
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
    await setNotificationsEnabled(!enabled);
    showSettingsToast(`Notifications ${enabled ? "disabled" : "enabled"}.`);
  };

  return { enabled, toggle };
}
