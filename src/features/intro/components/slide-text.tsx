import type { ReactNode } from "react";

/* Body copy under a page's description. */
export default function SlideText({ children }: { children: ReactNode }) {
  return (
    <p className="text-brown-800 dark:text-dark-100/85 text-sm leading-6">
      {children}
    </p>
  );
}
