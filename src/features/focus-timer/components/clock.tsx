import SlideClock from "./clock/slide-clock";
import BlurClock from "./clock/blur-clock";
import MorphClock from "./clock/morph-clock";
import MatrixClock from "./clock/matrix-clock";
import { useAppStore } from "@/store";

interface ClockProps {
  seconds: number;
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function Clock({ seconds }: ClockProps) {
  const clockVariant = useAppStore((s) => s.settings.clockVariant);

  switch (clockVariant) {
    case "slide":
      return <SlideClock seconds={seconds} />;
    case "blur":
      return <BlurClock seconds={seconds} />;
    case "morph":
      return <MorphClock seconds={seconds} />;
    case "matrix":
      return <MatrixClock seconds={seconds} />;
    default:
      return (
        <h1 className="font-poppins text-brown-800 dark:text-dark-100 accent:text-accent z-40 text-9xl font-extrabold antialiased">
          {formatTime(seconds)}
        </h1>
      );
  }
}
