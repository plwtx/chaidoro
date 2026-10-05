import type { IntroPageProps } from "../../types";
import SlideLayout from "../../components/slide-layout";
import PointList from "../../components/point-list";
import YourDataVisual from "./visual";

const POINTS = [
  "Everything is saved in this browser (IndexedDB) and never leaves your device.",
  "To move to another device or browser, download a JSON backup in Settings > Storage and upload it there.",
  "Clearing this site's data in your browser deletes your progress, so keep a backup.",
];

export default function YourDataPage({ step }: IntroPageProps) {
  return (
    <SlideLayout
      step={step}
      title="Your data stays here"
      description="No account, no server, no tracking."
      visual={<YourDataVisual />}
    >
      <PointList points={POINTS} />
    </SlideLayout>
  );
}
