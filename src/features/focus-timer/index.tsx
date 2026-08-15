import { lazy } from "react";
import { useAppStore } from "@/store/index";
import Clock from "@/features/focus-timer/components/clock.tsx";
import { useTimer } from "./hooks/useTimer";
import { useDailyTotal } from "./hooks/useDailyTotal";
import DailyFocus from "./components/daily-focus";
import { AnimatePresence, motion } from "motion/react";

const DevSpeedToggle = import.meta.env.DEV
  ? lazy(() => import("./components/dev-speed-toggle"))
  : () => null;

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function FinishedBanner() {
  const status = useAppStore((s) => s.status);
  const mode = useAppStore((s) => s.mode);

  if (status !== "finished" && status !== "overtime") return null;

  const isBreak = mode === "break" || mode === "long-break";

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center bg-black/90 px-4 py-3 backdrop-blur-sm">
      <p className="font-mono text-sm text-zinc-300">
        {status === "overtime"
          ? "Your time is up. The extra time is being counted, add it to this session or dismiss it."
          : isBreak
            ? "Break is over, you can start your next session."
            : "You have finished your session. However, you can continue being productive !"}
      </p>
    </div>
  );
}

export default function FocusTimer() {
  const {
    seconds,
    status,
    mode,
    focusCount,
    overtimeElapsed,
    start,
    pause,
    endCycle,
    addOvertime,
    dismissOvertime,
  } = useTimer();
  const { hours, minutes } = useDailyTotal();
  const backgroundImageKey = useAppStore((s) => s.settings.backgroundImageKey);
  const backgroundOpacity = useAppStore((s) => s.settings.backgroundOpacity);
  const backgroundSaturation = useAppStore(
    (s) => s.settings.backgroundSaturation
  );
  const backgroundContrast = useAppStore((s) => s.settings.backgroundContrast);

  return (
    <>
      <FinishedBanner />
      <DevSpeedToggle />
      {/* CLOCK SCREEN */}
      <main className="isolate z-0 h-full w-full overflow-hidden">
        {/* BACKGROUND (Image + BG color) */}
        <section className="z-0">
          {/* Background image layer sits below the color overlay */}
          {backgroundImageKey && (
            <div
              className="absolute inset-0 isolate z-0"
              style={{
                backgroundImage: "var(--bg-image)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                filter: `saturate(${backgroundSaturation}%) contrast(${backgroundContrast * 2}%)`,
              }}
            />
          )}
          {/* Background color overlay (opacity controlled by user when image is active) */}
          <div
            className="bg-brown-50 dark:bg-dark-600 absolute inset-0 isolate z-10 touch-none mix-blend-screen select-none dark:mix-blend-darken"
            style={
              backgroundImageKey
                ? { opacity: backgroundOpacity / 100 }
                : undefined
            }
          />
        </section>
        <div className="relative z-40 flex h-full w-full flex-col items-center justify-center gap-4">
          <DailyFocus hours={hours} minutes={minutes} />

          {/* Phase dots */}
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={
                  i < focusCount
                    ? "bg-brown-600 dark:bg-dark-100 h-4 w-4 rounded-full"
                    : "bg-brown-300 h-3 w-3 rounded-full dark:bg-black"
                }
              />
            ))}
          </div>

          {/* Overtime counts up,  "+" in front of overtime */}
          <div className="flex items-center">
            <AnimatePresence>
              {status === "overtime" && (
                <motion.span
                  key="overtime-sign"
                  className="font-poppins text-brown-800 text-9xl font-extrabold antialiased select-none dark:text-black"
                  initial={{ opacity: 0, x: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: 16, filter: "blur(6px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  +
                </motion.span>
              )}
            </AnimatePresence>
            <Clock seconds={seconds} />
          </div>

          {/* Controls */}
          <div className="relative z-40 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === "overtime" ? (
                <motion.div
                  key="overtime"
                  className="flex items-center gap-3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.06 } },
                    exit: {
                      transition: {
                        staggerChildren: 0.04,
                        staggerDirection: -1,
                      },
                    },
                  }}
                >
                  <motion.button
                    onClick={addOvertime}
                    className="bg-brown-500 dark:bg-dark-100 font-poppins cursor-pointer rounded-full px-8 py-3 font-semibold tracking-wide text-white dark:hover:text-white"
                    variants={{
                      hidden: {
                        x: 40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                      visible: {
                        x: 0,
                        scale: 1,
                        opacity: 1,
                        filter: "blur(0px)",
                      },
                      exit: {
                        x: 40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    add +{formatClock(overtimeElapsed)}
                  </motion.button>

                  <motion.button
                    onClick={dismissOvertime}
                    className="border-brown-400 dark:border-dark-100 text-brown-600 dark:text-dark-100 hover:border-brown-600 hover:text-brown-800 font-poppins cursor-pointer rounded-full border px-5 py-2.5 text-sm dark:hover:border-white dark:hover:text-white"
                    variants={{
                      hidden: {
                        x: -40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                      visible: {
                        x: 0,
                        scale: 1,
                        opacity: 1,
                        filter: "blur(0px)",
                      },
                      exit: {
                        x: -40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    dismiss
                  </motion.button>
                </motion.div>
              ) : status === "idle" || status === "finished" ? (
                <motion.button
                  key="start"
                  onClick={start}
                  className="bg-brown-500 dark:bg-dark-900 font-poppins dark:text-dark-100 cursor-pointer rounded-full px-10 py-3 font-semibold tracking-wide text-white"
                  initial={{ scale: 0.5, opacity: 0, filter: "blur(8px)" }}
                  animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                  exit={{
                    scale: 1.15,
                    opacity: 0,
                    filter: "blur(6px)",
                    transition: { duration: 0.25, ease: "easeIn" },
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {status === "finished" ? "next" : "start"}
                </motion.button>
              ) : (
                <motion.div
                  key="split"
                  className="flex items-center gap-3"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.06,
                      },
                    },
                    exit: {
                      transition: {
                        staggerChildren: 0.04,
                        staggerDirection: -1,
                      },
                    },
                  }}
                >
                  <motion.button
                    onClick={status === "running" ? pause : start}
                    className="bg-brown-500 dark:bg-dark-100 font-poppins cursor-pointer rounded-full px-8 py-3 font-semibold tracking-wide text-white dark:hover:text-white"
                    variants={{
                      hidden: {
                        x: 40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                      visible: {
                        x: 0,
                        scale: 1,
                        opacity: 1,
                        filter: "blur(0px)",
                      },
                      exit: {
                        x: 40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {status === "running" ? "pause" : "resume"}
                  </motion.button>

                  <motion.button
                    onClick={endCycle}
                    className="border-brown-400 dark:border-dark-100 text-brown-600 dark:text-dark-100 hover:border-brown-600 hover:text-brown-800 font-poppins cursor-pointer rounded-full border px-5 py-2.5 text-sm dark:hover:border-white dark:hover:text-white"
                    variants={{
                      hidden: {
                        x: -40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                      visible: {
                        x: 0,
                        scale: 1,
                        opacity: 1,
                        filter: "blur(0px)",
                      },
                      exit: {
                        x: -40,
                        scale: 0.3,
                        opacity: 0,
                        filter: "blur(10px)",
                      },
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                    }}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mode === "break" || mode === "long-break"
                      ? "skip break"
                      : "end cycle"}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}
