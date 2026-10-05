import { AnimatePresence, motion } from "motion/react";

interface BlurDigitProps {
  digit: string;
}

function BlurDigit({ digit }: BlurDigitProps) {
  return (
    <div className="relative inline-flex h-[1.1em] w-[0.62em] items-center justify-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={digit}
          className="absolute select-none"
          initial={{
            opacity: 0,
            filter: "blur(12px)",
            scale: 0.8,
          }}
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
          }}
          exit={{
            opacity: 0,
            filter: "blur(12px)",
            scale: 1.2,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface BlurClockProps {
  seconds: number;
}

function formatDigits(totalSeconds: number) {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  const str = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return str.split("");
}

export default function BlurClock({ seconds }: BlurClockProps) {
  const digits = formatDigits(seconds);

  return (
    <div className="font-poppins text-brown-800 dark:text-dark-100 accent:text-accent flex items-center text-9xl font-extrabold antialiased">
      {digits.map((char, i) =>
        char === ":" ? (
          <span key="colon" className="mx-1 select-none">
            :
          </span>
        ) : (
          <BlurDigit key={i} digit={char} />
        )
      )}
    </div>
  );
}
