export interface RoadmapStage {
  number: number;
  label: string;
  roadLabel?: string | null;
  description?: string | null;
  current: boolean;
}

export const ROADMAP: RoadmapStage[] = [
  {
    number: 1,
    label: "Initial release",
    roadLabel: "Test period / Bug fixing.",
    description:
      "Collecting feedbacks, catching bugs. Fix and test untill most of the discoverable bugs are caught.",
    current: false,
  },
  {
    number: 2,
    label: "Stable release",
    roadLabel: "Fixes and Optimization",
    description:
      "Optimization, fixes, more accessibility and customization related settings.",
    current: true,
  },
  {
    number: 3,
    label: "Mobile version release",
    roadLabel: "Additional features",
    description:
      "Task manager and integrated notes. Fixes and features related to mobile version.",
    current: false,
  },
  {
    number: 4,
    label: "More TBA",
    roadLabel: null,
    description: "More features and fixes are to be announced.",
    current: false,
  },
];

const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

export function stageNumeral(number: number): string {
  return ROMAN_NUMERALS[number - 1] ?? String(number);
}
