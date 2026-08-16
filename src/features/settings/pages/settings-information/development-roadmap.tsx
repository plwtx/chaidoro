import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ROADMAP } from "./roadmap";
import StageBadge from "./stage-badge";

export default function DevelopmentRoadmap() {
  const currentIndex = ROADMAP.findIndex((stage) => stage.current);

  return (
    <section className="py-8">
      <div className="flex w-full items-start">
        {ROADMAP.map((stage, i) => {
          const nodeActive = currentIndex >= 0 && i <= currentIndex;
          const roadActive = currentIndex >= 0 && i < currentIndex;
          const isLast = i === ROADMAP.length - 1;

          return (
            <Fragment key={stage.number}>
              <div className="flex shrink-0 flex-col items-center">
                <StageBadge number={stage.number} active={nodeActive} />
                <div
                  className={cn(
                    "mt-2 h-3 w-px",
                    nodeActive
                      ? "bg-brown-900 dark:bg-dark-100"
                      : "bg-brown-300 dark:bg-brown-600"
                  )}
                />
                <div
                  className={cn(
                    "h-0 w-0 border-x-4 border-t-[5px] border-x-transparent",
                    nodeActive
                      ? "border-t-brown-900 dark:border-t-dark-100"
                      : "border-t-brown-300 dark:border-t-brown-600"
                  )}
                />
                <p
                  className={cn(
                    "mt-2 text-center text-sm whitespace-nowrap",
                    nodeActive
                      ? "text-brown-900 dark:text-dark-100"
                      : "text-brown-400 dark:text-brown-500"
                  )}
                >
                  {stage.label}
                </p>
              </div>

              {!isLast && (
                <div className="relative flex h-10 flex-1 items-center px-2">
                  <div
                    className={cn(
                      "h-px w-full",
                      roadActive
                        ? "bg-brown-900 dark:bg-dark-100"
                        : "bg-brown-300 dark:bg-brown-600"
                    )}
                  />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
