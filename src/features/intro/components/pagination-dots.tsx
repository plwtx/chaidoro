import { cn } from "@/lib/utils";

interface PaginationDotsProps {
  labels: string[];
  current: number;
  onSelect: (index: number) => void;
}

/* One dot per page; the current one is stretched. Any dot jumps to its page. */
export default function PaginationDots({
  labels,
  current,
  onSelect,
}: PaginationDotsProps) {
  return (
    <nav
      aria-label="Intro pages"
      className="border-brown-300 bg-brown-50 dark:border-dark-900 dark:bg-dark-600 flex items-center gap-2 rounded-full border px-5 py-3 shadow-sm dark:shadow-black"
    >
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(i)}
          title={label}
          aria-label={`${i + 1}. ${label}`}
          aria-current={i === current ? "step" : undefined}
          data-sound="navigation"
          className={cn(
            "h-2.5 cursor-pointer rounded-full transition-all duration-300",
            i === current
              ? "bg-brown-700 dark:bg-dark-100 accent:bg-accent w-6"
              : "bg-brown-300 hover:bg-brown-400 dark:bg-dark-100/25 dark:hover:bg-dark-100/50 w-2.5"
          )}
        />
      ))}
    </nav>
  );
}
