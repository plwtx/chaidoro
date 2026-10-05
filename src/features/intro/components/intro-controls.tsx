import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntroControlsProps {
  isFirst: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
}

/*
  Skip, back and next. They stay on top while the pages change underneath. On the last page next turns into "Let's go" (which finishes the intro) and skip goes away.
*/
export default function IntroControls({
  isFirst,
  isLast,
  onBack,
  onNext,
  onSkip,
}: IntroControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {!isLast && (
        <button
          type="button"
          onClick={onSkip}
          className="font-fragment-mono text-brown-600 hover:text-brown-900 dark:text-dark-100/60 dark:hover:text-dark-100 cursor-pointer px-2 text-xs underline-offset-4 hover:underline"
        >
          skip
        </button>
      )}
      {!isFirst && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Previous page"
          data-sound="navigation"
          className="border-brown-300 text-brown-700 hover:bg-brown-100 dark:border-dark-900 dark:text-dark-100 dark:hover:bg-dark-900 flex size-11 cursor-pointer items-center justify-center rounded-xl border transition-all active:scale-95"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <button
        type="button"
        onClick={onNext}
        // Focused on open, so Enter / Space move forward right away
        autoFocus
        aria-label={isLast ? undefined : "Next page"}
        data-sound="navigation"
        className={cn(
          "bg-brown-700 text-brown-50 border-brown-800 dark:bg-dark-100 dark:text-dark-900 dark:border-dark-100 accent:bg-accent accent:border-accent accent:text-accent-foreground flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border font-medium shadow-sm transition-all hover:opacity-90 active:scale-95",
          isLast ? "px-5 text-sm" : "w-11"
        )}
      >
        {isLast ? (
          <>
            Let's go
            <Check className="size-4" />
          </>
        ) : (
          <ChevronRight className="size-5" />
        )}
      </button>
    </div>
  );
}
