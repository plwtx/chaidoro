import type { IntroPage } from "./types";
import WelcomePage from "./pages/01-welcome";
import HowItWorksPage from "./pages/02-how-it-works";
import YourDataPage from "./pages/03-your-data";
import AppearancePage from "./pages/04-appearance";
import TimerPage from "./pages/05-timer";
import NotificationsPage from "./pages/06-notifications";

/*
  The intro pages, in order. Add, remove or reorder pages here; step numbers, pagination dots and navigation follow this list. Keep the folder numbers in pages/ matching it.
*/
export const INTRO_PAGES: IntroPage[] = [
  { id: "welcome", label: "Welcome", Component: WelcomePage },
  { id: "how-it-works", label: "How it works", Component: HowItWorksPage },
  { id: "your-data", label: "Your data", Component: YourDataPage },
  { id: "appearance", label: "Appearance", Component: AppearancePage },
  { id: "timer", label: "Timer", Component: TimerPage },
  {
    id: "notifications",
    label: "Notifications",
    Component: NotificationsPage,
  },
];
