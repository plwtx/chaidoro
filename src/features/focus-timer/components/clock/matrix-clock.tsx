import { useEffect, useRef, useState } from "react";

const GLITCH_CHARS = "0123456789!@#$%&*";
const SCRAMBLE_DURATION = 280;
const SCRAMBLE_INTERVAL = 35;

interface MatrixDigitProps {
  digit: string;
}

function MatrixDigit({ digit }: MatrixDigitProps) {
  const [display, setDisplay] = useState(digit);
  const prevDigit = useRef(digit);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    if (digit === prevDigit.current) return;
    prevDigit.current = digit;

    const start = performance.now();
    let lastSwap = 0;

    const scramble = (now: number) => {
      const elapsed = now - start;

      if (elapsed >= SCRAMBLE_DURATION) {
        setDisplay(digit);
        rafId.current = null;
        return;
      }

      if (now - lastSwap >= SCRAMBLE_INTERVAL) {
        lastSwap = now;
        const randomChar =
          GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        setDisplay(randomChar);
      }

      rafId.current = requestAnimationFrame(scramble);
    };

    rafId.current = requestAnimationFrame(scramble);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [digit]);

  return (
    <span className="inline-block w-[0.62em] text-center select-none">
      {display}
    </span>
  );
}

interface MatrixClockProps {
  seconds: number;
}

function formatDigits(totalSeconds: number) {
  const mins = Math.floor(Math.abs(totalSeconds) / 60);
  const secs = Math.abs(totalSeconds) % 60;
  const str = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return str.split("");
}

export default function MatrixClock({ seconds }: MatrixClockProps) {
  const digits = formatDigits(seconds);

  return (
    <div className="font-fragment-mono text-brown-800 dark:text-dark-100 accent:text-accent flex items-center text-9xl font-extrabold antialiased">
      {digits.map((char, i) =>
        char === ":" ? (
          <span key="colon" className="mx-1 select-none">
            :
          </span>
        ) : (
          <MatrixDigit key={i} digit={char} />
        )
      )}
    </div>
  );
}
