import HeaderDescription from "@/components/ui/header-description";
import HorizontalDivider from "@/components/ui/horizontal-divider-line";
import ChangelogEntry from "./changelog-entry";
import { CHANGELOG } from "./changelog";

export default function Changelog() {
  return (
    <div className="font-fragment-mono dark:text-dark-100/80 text-brown-800/80 text-sm">
      <article className="max-w-3xl min-w-0">
        <HeaderDescription
          header={"Changelog"}
          description={"Every update to Chaidoro, newest release first."}
        />
        <HorizontalDivider />
        {/* Release timeline */}
        <ol className="mt-6 flex flex-col">
          {CHANGELOG.map((entry, i) => (
            <ChangelogEntry
              key={entry.version}
              entry={entry}
              isLast={i === CHANGELOG.length - 1}
            />
          ))}
        </ol>
        {/* Empty bottom spacing */}
        <div className="h-96" />
      </article>
    </div>
  );
}
