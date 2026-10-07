import type { ChangelogImage } from "./changelog";

/* Screenshot / illustration attached to a changelog entry */
export default function ChangelogFigure({ image }: { image: ChangelogImage }) {
  return (
    <figure className="w-full">
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className="border-brown-300 dark:border-dark-100/15 w-full rounded-xl border"
      />
      {image.caption && (
        <figcaption className="text-brown-500 dark:text-dark-100/50 mt-2 text-xs">
          {image.caption}
        </figcaption>
      )}
    </figure>
  );
}
