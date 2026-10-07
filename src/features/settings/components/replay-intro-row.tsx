import { RotateCcw } from "lucide-react";
import { replayIntro } from "@/features/intro/introState";

/* Settings > General: opens the first-run intro again, from its first page. */
export default function ReplayIntroRow() {
  return (
    <div className="text-brown-900 dark:text-dark-100 flex w-full items-center justify-between gap-6">
      <div className="text-base">
        <h3 className="font-semibold">Introduction</h3>
        <p className="text-sm opacity-75">
          Replay the welcome tour and quick setup.
        </p>
      </div>
      <button
        type="button"
        onClick={() => replayIntro()}
        className="border-brown-200/75 shadow-brown-300 dark:bg-dark-900/45 bg-brown-100 dark:border-dark-900 hover:bg-brown-200/55 flex h-9 w-32 shrink-0 cursor-pointer items-center justify-between gap-6 rounded-lg border p-2 px-4 text-left text-sm font-medium shadow-sm transition-all duration-150 ease-in-out active:scale-95 dark:shadow-black hover:dark:bg-black/50"
      >
        Replay
        <RotateCcw className="size-4" />
      </button>
    </div>
  );
}
