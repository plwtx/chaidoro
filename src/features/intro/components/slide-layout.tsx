import type { ReactNode } from "react";

interface SlideLayoutProps {
  step: number;
  title: string;
  description: string;
  /* Left panel: the page's illustration */
  visual: ReactNode;
  /* Right panel, under the description: copy or setup controls */
  children?: ReactNode;
}

/*
  The default page layout from the sketch: the visual on the left; step, title, description and the page body on the right (stacked on small screens). Pages compose it and can drop it for a fully custom design. The bottom of the text column stays clear for the dialog's controls.
*/
export default function SlideLayout({
  step,
  title,
  description,
  visual,
  children,
}: SlideLayoutProps) {
  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      <div className="border-brown-200 dark:border-dark-900 relative h-40 shrink-0 overflow-hidden border-b md:h-full md:w-1/2 md:border-r md:border-b-0">
        {visual}
      </div>
      {/* The bottom strip stays free for the controls, so text that scrolls (small screens) never runs under them */}
      <div className="flex min-h-0 flex-1 flex-col pb-20">
        <div className="min-h-0 flex-1 overflow-y-auto px-9 pt-9 pb-4">
          <p className="font-fragment-mono text-brown-500 dark:text-dark-100/55 text-xs">
            step {step}.
          </p>
          <h2 className="font-poppins text-brown-900 dark:text-dark-100 mt-1 text-3xl leading-tight font-medium">
            {title}
          </h2>
          <p className="font-fragment-mono text-brown-600 dark:text-dark-100/65 mt-3 text-sm leading-6">
            {description}
          </p>
          {children && (
            <div className="mt-6 flex flex-col gap-5">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
