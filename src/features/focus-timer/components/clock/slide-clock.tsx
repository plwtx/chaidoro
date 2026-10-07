import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface SlideDigitProps {
  digit: string;
}

function SlideDigit({ digit }: SlideDigitProps) {
  const [direction, setDirection] = useState(1);
  const prev = useRef(digit);

  useEffect(() => {
    if (digit !== prev.current) {
      const curr = parseInt(digit);
      const old = parseInt(prev.current);
      if (old === 9 && curr === 0) setDirection(1);
      else if (old === 0 && curr === 9) setDirection(-1);
      else setDirection(curr > old ? 1 : -1);
      prev.current = digit;
    }
  }, [digit]);

  return (
    <div className="relative inline-flex h-[1.1em] w-[0.62em] items-center justify-center overflow-hidden">
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.span
          key={digit}
          custom={direction}
          className="absolute select-none"
          variants={{
            enter: (d: number) => ({
              y: `${d * 100}%`,
              opacity: 0,
              filter: "blur(4px)",
            }),
            center: {
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
            },
            exit: (d: number) => ({
              y: `${d * -100}%`,
              opacity: 0,
              filter: "blur(4px)",
            }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        >
          {digit}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface SlideClockProps {
  seconds: number;
}

function formatDigits(totalSeconds: number) {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  const str = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return str.split("");
}

export default function SlideClock({ seconds }: SlideClockProps) {
  const digits = formatDigits(seconds);

  return (
    <div className="font-poppins text-brown-800 dark:text-dark-100 accent:text-accent flex items-center text-9xl font-extrabold antialiased">
      {digits.map((char, i) =>
        char === ":" ? (
          <span key="colon" className="mx-1 select-none">
            :
          </span>
        ) : (
          <SlideDigit key={i} digit={char} />
        )
      )}
    </div>
  );
}
