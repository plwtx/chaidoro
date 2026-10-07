import { cn } from "@/lib/utils";
import StageBadge from "@/features/settings/pages/settings-information/stage-badge";
import { stageNumeral } from "@/features/settings/pages/settings-information/roadmap";
import ChangelogFigure from "./changelog-figure";
import {
  formatEntryDate,
  type ChangelogEntry as Entry,
  type ChangelogSection,
} from "./changelog";

interface ChangelogEntryProps {
  entry: Entry;
  isLast: boolean;
}

export default function ChangelogEntry({ entry, isLast }: ChangelogEntryProps) {
  return (
    <li className="flex gap-5">
      {/* Timeline rail */}
      <div className="flex shrink-0 flex-col items-center">
        <StageBadge number={entry.stage} active={entry.current} />
        {!isLast && (
          <div className="bg-brown-300 dark:bg-dark-100/20 mt-2 w-px flex-1" />
        )}
      </div>

      {/* Entry body */}
      <div className={cn("min-w-0 flex-1", isLast ? "pb-3" : "pb-12")}>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h2 className="font-poppins text-brown-900 dark:text-dark-100 text-base font-medium">
            Stage {stageNumeral(entry.stage)} - {entry.label}
          </h2>
          <span className="border-brown-300 text-brown-600 dark:border-dark-100/20 dark:text-dark-100/60 rounded-md border px-2 py-0.5 text-xs">
            {entry.version}
          </span>
          {entry.current && (
            <span className="text-brown-500 dark:text-dark-100/50 text-xs font-light italic">
              current
            </span>
          )}
        </div>
        <time
          dateTime={entry.date}
          className="text-brown-500 dark:text-dark-100/50 mt-1 block text-xs"
        >
          {formatEntryDate(entry.date)}
        </time>

        <div className="mt-3 flex flex-col gap-3 leading-6">
          {entry.description.map((paragraph) => (
            <p key={paragraph}>{withEmailLinks(paragraph)}</p>
          ))}
        </div>

        {entry.sections && (
          <div className="mt-5 flex flex-col gap-5">
            {entry.sections.map((section) => (
              <EntrySection key={section.title} section={section} />
            ))}
          </div>
        )}

        {entry.images && (
          <div className="mt-5 flex flex-col gap-5">
            {entry.images.map((image) => (
              <ChangelogFigure key={image.src} image={image} />
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

function EntrySection({ section }: { section: ChangelogSection }) {
  return (
    <div>
      <h3 className="font-poppins text-brown-800 dark:text-dark-100/90 text-sm font-medium">
        {section.title}
      </h3>
      <ul className="mt-2 flex flex-col gap-1.5 leading-6">
        {section.items.map((item) => (
          <li key={item} className="flex gap-3">
            <span
              aria-hidden="true"
              className="text-brown-500 dark:text-dark-100/50 select-none"
            >
              -
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const EMAIL_PATTERN = /([\w.+-]+@[\w-]+\.[\w.-]*\w)/g;

function withEmailLinks(text: string): React.ReactNode[] {
  return text.split(EMAIL_PATTERN).map((part, i) =>
    i % 2 === 1 ? (
      <a
        key={`${part}-${i}`}
        href={`mailto:${part}`}
        className="text-brown-900 dark:text-dark-100 underline-offset-2 hover:underline"
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}
