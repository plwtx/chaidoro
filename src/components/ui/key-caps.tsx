import { Fragment } from "react";
import { comboParts } from "@/lib/shortcuts";

/*
  Renders a stored shortcut combo as keycaps, e.g. [Ctrl] + [K].
  Shared by Settings > Shortcuts and the command palette.
*/
export default function KeyCaps({ combo }: { combo: string }) {
  return (
    <span className="flex items-center gap-1">
      {comboParts(combo).map((part, i) => (
        <Fragment key={`${part}-${i}`}>
          {i > 0 && <span className="text-xs opacity-45">+</span>}
          <kbd className="bg-brown-100 border-brown-300 shadow-brown-300 dark:bg-dark-900 dark:text-brown-300 font-fragment-mono rounded-md border px-2 py-0.5 text-xs shadow-[0_1.5px_0] dark:border-black dark:shadow-black">
            {part}
          </kbd>
        </Fragment>
      ))}
    </span>
  );
}
