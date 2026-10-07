import type { IntroPageProps } from "../../types";
import SlideLayout from "../../components/slide-layout";
import SlideText from "../../components/slide-text";
import WelcomeVisual from "./visual";

export default function WelcomePage({ step }: IntroPageProps) {
  return (
    <SlideLayout
      step={step}
      title="Intro & setup"
      description="Introduction to Chaidoro and setup of the defaults."
      visual={<WelcomeVisual />}
    >
      <SlideText>
        Chaidoro is a focus timer. It splits long work into short focus
        intervals with breaks in between, and keeps track of your progress.
      </SlideText>
      <SlideText>
        This tour takes about a minute: how it works, then a quick setup. You
        can skip it anytime and change everything later in Settings.
      </SlideText>
    </SlideLayout>
  );
}
