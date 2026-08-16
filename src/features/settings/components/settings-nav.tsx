import { ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SettingsCategory {
  id: string;
  name: string;
}

interface SettingsNavProps {
  categories: SettingsCategory[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function SettingsNav({
  categories,
  activeId,
  onSelect,
}: SettingsNavProps) {
  return (
    <aside
      className="h-full w-78"
      aria-label="Settings category selection sidebar."
    >
      <h1 className="font-poppins text-brown-800 dark:text-dark-100 px-3 text-xl font-semibold">
        Settings
      </h1>
      <ul className="my-3 flex w-full flex-col gap-2 pr-3 text-sm font-normal">
        {categories.map((category) => {
          const isActive = category.id === activeId;
          return (
            <li
              key={category.id}
              onClick={() => onSelect(category.id)}
              data-sound="navigation"
              className={cn(
                "text-brown-800 dark:text-dark-100 flex items-center justify-between rounded-lg p-2 pl-5 transition-transform active:scale-90",
                isActive
                  ? "bg-brown-200/75 dark:bg-dark-900 dark:shadow-dark-900 shadow-brown-500/45 font-medium shadow-md"
                  : "hover:bg-brown-100/75 dark:hover:bg-dark-900/75 group cursor-pointer"
              )}
            >
              <span className="select-none">{category.name}</span>
              <span
                className={cn(
                  "text-brown-500 dark:text-dark-100 translate-x-0 opacity-100 transition-all duration-300",
                  !isActive &&
                    "z-0 -translate-x-3 opacity-0 group-hover:opacity-45"
                )}
              >
                <ChevronsRight />
              </span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
