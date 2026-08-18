export interface ChangelogImage {
  /* Imported asset URL, e.g. import shot from "@/assets/png/palette.png" */
  src: string;
  alt: string;
  caption?: string;
}

export interface ChangelogSection {
  title: string;
  items: string[];
}

export interface ChangelogEntry {
  /* Roadmap stage this release closed - drives the timeline badge numeral */
  stage: number;
  label: string;
  version: string;
  /* ISO date (YYYY-MM-DD), formatted for display by formatEntryDate */
  date: string;
  /* Paragraphs of prose; e-mail addresses are auto-linked when rendered */
  description: string[];
  sections?: ChangelogSection[];
  images?: ChangelogImage[];
  /* The release the user is currently running */
  current: boolean;
}

/* Newest first - the page renders this array top to bottom */
export const CHANGELOG: ChangelogEntry[] = [
  {
    stage: 2,
    label: "Stable release",
    version: "v2.0.0",
    date: "2026-08-18",
    description: [
      "I have collected feedback and made some changes to existing features, fixed bugs (mostly UI related) and added new features as noted below. With this update Chaidoro has reached stage 2.",
      "For upcoming stage I will be focusing on mobile and tablet usage, background sounds (calming, focus, relaxing music and etc.), more customization such as custom UI color palette and micro interaction animations. As always feel free to reach out at dev@chaidoro.study.",
    ],
    sections: [
      {
        title: "New features",
        items: [
          "Keyboard shortucts.",
          "UI Sounds and notifications.",
          "Command palette.",
          "Overtime mode.",
          "Focus mode edge borders.",
        ],
      },
      {
        title: "Fixes",
        items: [
          "Routes cleanup.",
          "ToC location fix.",
          "Overtime / clock memory on reload / quit.",
          "Downloaded file name with date.",
          "Minor UI usability and accessibility fixes.",
        ],
      },
      {
        title: "Updates",
        items: ["chai.study is now chaidoro.study. (Domain change.)"],
      },
    ],
    current: true,
  },
  {
    stage: 1,
    label: "Initial release",
    version: "v1.0.0",
    date: "2026-05-16",
    description: [
      "Collecting feedbacks, catching bugs. Fix and test untill most of the discoverable bugs are caught.",
    ],
    current: false,
  },
];

const ENTRY_DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export function formatEntryDate(iso: string): string {
  return ENTRY_DATE_FORMAT.format(new Date(`${iso}T00:00:00Z`));
}
