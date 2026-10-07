import { motion } from "motion/react";

//  Research: cubic beziers
//  viewBox 0 0 60 100.

const DIGIT_PATHS: Record<string, string> = {
  "0": "M30 8 C12 8 6 28 6 50 C6 72 12 92 30 92 C48 92 54 72 54 50 C54 28 48 8 30 8 Z",
  "1": "M22 20 C26 14 30 8 30 8 C30 8 30 8 30 8 L30 92 C30 92 30 92 30 92 C30 92 30 92 30 92 Z",
  "2": "M10 30 C10 12 50 12 50 30 C50 48 10 60 10 92 L50 92 C50 92 50 92 50 92 C50 92 10 92 10 92 Z",
  "3": "M10 20 C10 8 50 8 50 24 C50 40 30 46 30 50 C30 54 50 60 50 76 C50 92 10 92 10 80 Z",
  "4": "M40 8 C40 8 8 60 8 60 C8 60 52 60 52 60 L40 60 C40 60 40 8 40 8 L40 92 C40 92 40 92 40 92 Z",
  "5": "M46 8 C46 8 14 8 14 8 C14 8 14 46 14 46 C14 46 46 46 46 64 C46 82 14 92 14 92 C14 92 14 92 14 92 Z",
  "6": "M44 8 C44 8 14 8 14 50 C14 72 14 92 30 92 C46 92 50 72 50 60 C50 48 46 40 30 40 C14 40 14 50 14 50 Z",
  "7": "M10 8 C10 8 50 8 50 8 C50 8 30 50 26 92 C26 92 26 92 26 92 C26 92 26 92 26 92 C26 92 26 92 26 92 Z",
  "8": "M30 8 C12 8 8 22 14 36 C20 50 40 50 46 36 C52 22 48 8 30 8 M30 50 C12 50 6 68 12 80 C18 92 42 92 48 80 C54 68 48 50 30 50 Z",
  "9": "M16 92 C16 92 46 92 46 50 C46 28 46 8 30 8 C14 8 10 28 10 40 C10 52 14 60 30 60 C46 60 46 50 46 50 Z",
};

interface MorphDigitProps {
  digit: string;
}

function MorphDigit({ digit }: MorphDigitProps) {
  const path = DIGIT_PATHS[digit] || DIGIT_PATHS["0"];

  return (
    <div className="relative inline-flex h-[1em] w-[0.58em] items-center justify-center">
      <svg
        viewBox="0 0 60 100"
        className="h-full w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.path
          d={path}
          fill="currentColor"
          animate={{ d: path }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 25,
            mass: 0.8,
          }}
        />
      </svg>
    </div>
  );
}

interface MorphClockProps {
  seconds: number;
}

function formatDigits(totalSeconds: number) {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  const str = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return str.split("");
}

export default function MorphClock({ seconds }: MorphClockProps) {
  const digits = formatDigits(seconds);

  return (
    <div className="text-brown-800 dark:text-dark-100 accent:text-accent flex items-center gap-1 text-9xl font-extrabold">
      {digits.map((char, i) =>
        char === ":" ? (
          <span key="colon" className="mx-1 select-none">
            :
          </span>
        ) : (
          <MorphDigit key={i} digit={char} />
        )
      )}
    </div>
  );
}
