import type { IntroPageProps } from "../../types";
import SlideLayout from "../../components/slide-layout";
import PointList from "../../components/point-list";
import HowItWorksVisual from "./visual";

const POINTS = [
  "Focus for a set time, then take a short break. Every fourth break is a long one.",
  "When focus time is up, overtime keeps counting. Add the extra time to your session or dismiss it.",
  "Your focus sessions are saved, and Statistics turns them into charts, a heatmap and a day streak.",
];

export default function HowItWorksPage({ step }: IntroPageProps) {
  return (
    <SlideLayout
      step={step}
      title="How it works"
      description="Focus in cycles, rest in between."
      visual={<HowItWorksVisual />}
    >
      <PointList points={POINTS} />
    </SlideLayout>
  );
}
