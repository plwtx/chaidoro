import { useState, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store";
import { useGraphStats, type GraphViewMode } from "../hooks/useGraphStats";
import { formatTime } from "../utils/formatTime";
import type { ViewMode } from "./stats-view-controls";

interface StatsGraphPanelProps {
  viewMode: ViewMode;
  offset: number;
  onOffsetChange: (newOffset: number) => void;
}

const BAR_VARIANTS = { hidden: { scaleY: 0 }, visible: { scaleY: 1 } };
const STAGGER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03 } },
};
const INSTANT_VARIANTS = { hidden: {}, visible: {} };

type BarTransition = { duration: number; ease: "easeOut" };

function barColorClass(ratio: number): string {
  if (ratio >= 0.85)
    return "bg-brown-700 dark:bg-brown-300/75 accent:bg-accent-peak";
  if (ratio >= 0.65) return "bg-brown-600 dark:bg-brown-300 accent:bg-accent";
  if (ratio >= 0.4)
    return "bg-brown-500 dark:bg-brown-400/75 accent:bg-accent/75";
  if (ratio >= 0.15)
    return "bg-brown-400 dark:bg-brown-400 accent:bg-accent/55";
  return "bg-brown-300 dark:bg-brown-500/75 accent:bg-accent/35";
}

interface EmptyGraphBarProps {
  stubHeight: string;
  transition: BarTransition;
}

function EmptyGraphBar({ stubHeight, transition }: EmptyGraphBarProps) {
  return (
    <motion.div
      className="flex h-full flex-1 items-end justify-center"
      style={{ transformOrigin: "bottom" }}
      variants={BAR_VARIANTS}
      transition={transition}
    >
      <div className="bg-brown-300/40 w-0.5" style={{ height: stubHeight }} />
    </motion.div>
  );
}

interface GraphBarProps {
  minutes: number;
  ratio: number;
  widthClass: string;
  transition: BarTransition;
}

function GraphBar({ minutes, ratio, widthClass, transition }: GraphBarProps) {
  const [showLabel, setShowLabel] = useState(false);
  const barHeight = `${Math.max(ratio * 100, 0.2)}%`;

  return (
    <motion.div
      className="relative flex h-full flex-1 cursor-pointer items-end justify-center"
      style={{ transformOrigin: "bottom" }}
      variants={BAR_VARIANTS}
      transition={transition}
      onMouseEnter={() => setShowLabel(true)}
      onMouseLeave={() => setShowLabel(false)}
      onClick={() => setShowLabel((v) => !v)}
    >
      {showLabel && (
        <span
          className="text-brown-600 dark:text-brown-400 pointer-events-none absolute text-[10px]"
          style={{ bottom: barHeight }}
        >
          {formatTime(minutes)}
        </span>
      )}
      <div
        className={cn("rounded-full", barColorClass(ratio), widthClass)}
        style={{ height: barHeight, minHeight: "2px" }}
      />
    </motion.div>
  );
}

export default function StatsGraphPanel({
  viewMode,
  offset,
  onOffsetChange,
}: StatsGraphPanelProps) {
  const reducedMotion = useAppStore((s) => s.settings.reducedMotion);

  const graphMode: GraphViewMode = viewMode === "daily" ? "weekly" : viewMode;
  const { bars, periodLabel, maxMinutes, isLoaded } = useGraphStats(
    graphMode,
    offset,
  );

  const stubHeights = useMemo(
    () => bars.map(() => `${Math.random() * 40 + 15}%`),
    [graphMode, offset],
  );

  const barTransition: BarTransition = {
    duration: reducedMotion ? 0 : 0.3,
    ease: "easeOut",
  };
  const containerVariants = reducedMotion ? INSTANT_VARIANTS : STAGGER_VARIANTS;
  const barWidthClass =
    viewMode === "yearly" ? "w-5" : viewMode === "monthly" ? "w-2" : "w-8";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center py-3">
      {/* Date range navigation */}
      <div className="flex w-full items-center justify-between px-12 py-2 font-light">
        <button onClick={() => onOffsetChange(offset - 1)}>
          <ChevronDown className="rotate-90 cursor-pointer stroke-[1px]" />
        </button>
        <p className="text-sm">{periodLabel}</p>
        <button
          onClick={() => onOffsetChange(offset + 1)}
          disabled={offset === 0}
          className={cn(offset === 0 && "cursor-not-allowed opacity-30")}
        >
          <ChevronDown className="rotate-270 cursor-pointer stroke-[1px]" />
        </button>
      </div>

      {/* Bar chart */}
      <div className="flex w-full flex-col px-4">
        {isLoaded ? (
          <motion.div
            key={`${periodLabel}-${viewMode}`}
            className="flex h-48 w-full items-end"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {bars.map((bar, i) =>
              bar.isEmpty ? (
                <EmptyGraphBar
                  key={i}
                  stubHeight={stubHeights[i] ?? "25%"}
                  transition={barTransition}
                />
              ) : (
                <GraphBar
                  key={i}
                  minutes={bar.minutes}
                  ratio={bar.minutes / maxMinutes}
                  widthClass={barWidthClass}
                  transition={barTransition}
                />
              ),
            )}
          </motion.div>
        ) : (
          <div className="h-48" />
        )}

        <div className="mt-1 flex w-full">
          {bars.map((bar, i) => (
            <div
              key={i}
              className="text-brown-400 dark:text-brown-500 flex-1 text-center text-[10px]"
            >
              {viewMode === "monthly" && i % 2 !== 0 ? "" : bar.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
