import type { LucideIcon } from "lucide-react";
import PatternFill from "@/components/ui/pattern-fill";
import type { PatternId } from "@/lib/backgroundPatterns";

interface PlaceholderArtProps {
  pattern: PatternId;
  icon?: LucideIcon;
  /* Shown instead of the icon */
  image?: { src: string; alt: string };
}

/*
  Stand-in illustration for an intro page: an icon (or an image) over a background pattern. Each page renders it from its own visual.tsx, so swapping in a final design or animation touches one file.
*/
export default function PlaceholderArt({
  pattern,
  icon: Icon,
  image,
}: PlaceholderArtProps) {
  return (
    <div className="bg-brown-100 dark:bg-dark-900 relative flex h-full w-full items-center justify-center overflow-hidden">
      <PatternFill pattern={pattern} className="absolute inset-0" />
      {image ? (
        <img
          src={image.src}
          alt={image.alt}
          draggable={false}
          className="relative h-3/4 max-h-80 object-contain select-none dark:brightness-75 dark:saturate-0"
        />
      ) : (
        Icon && (
          <Icon
            aria-hidden="true"
            className="text-brown-400 dark:text-dark-100/45 accent:text-accent-muted relative size-28 stroke-[0.75px]"
          />
        )
      )}
    </div>
  );
}
