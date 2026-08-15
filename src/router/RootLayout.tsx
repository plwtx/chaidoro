import { Toaster } from "sonner";
import Navbar from "@/features/navbar";
import AnimatedRoutes from "@/features/router/AnimatedRoutes";
import TimerIsland from "@/features/focus-timer/components/timer-island";
import { useTimerBridge } from "@/features/focus-timer/hooks/useTimer";
import { useThemeSync } from "@/features/settings/hooks/useThemeSync";
import { useDynamicTitlebarSync } from "@/features/settings/hooks/useDynamicTitlebarSync";
import { useReducedMotionSync } from "@/features/settings/hooks/useReducedMotionSync";
import { useAppSounds } from "@/hooks/useAppSounds";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function RootLayout() {
  useTimerBridge();
  useThemeSync();
  useDynamicTitlebarSync();
  useReducedMotionSync();
  useAppSounds();
  useKeyboardShortcuts();

  return (
    <div className="bg-brown-50 relative h-screen w-full selection:bg-black/75 selection:text-white">
      <div className="absolute top-3 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-2">
        <TimerIsland />
        <Navbar />
      </div>
      <AnimatedRoutes />
      {/* Notification toaster */}
      <Toaster position="bottom-center" />
    </div>
  );
}
