import type { ReactNode } from "react";

interface SetupFieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

/* A labeled group of controls on a setup page. */
export default function SetupField({ label, hint, children }: SetupFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-brown-900 dark:text-dark-100 text-sm font-medium">
        {label}
      </h3>
      {children}
      {hint && (
        <p className="font-fragment-mono text-brown-600 dark:text-dark-100/55 text-[11px] leading-4">
          {hint}
        </p>
      )}
    </div>
  );
}
