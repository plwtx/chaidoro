import type { IntroPageProps } from "../../types";
import SlideLayout from "../../components/slide-layout";
import SetupField from "../../components/setup-field";
import AppearanceVisual from "./visual";
import ThemePicker from "./theme-picker";
import AccentPicker from "./accent-picker";

export default function AppearancePage({ step }: IntroPageProps) {
  return (
    <SlideLayout
      step={step}
      title="Make it yours"
      description="Pick a color mode and an accent color. Changes apply right away."
      visual={<AppearanceVisual />}
    >
      <SetupField label="Color mode">
        <ThemePicker />
      </SetupField>
      <SetupField
        label="Accent color"
        hint="Custom colors, patterns and wallpapers are in Settings > Theme."
      >
        <AccentPicker />
      </SetupField>
    </SlideLayout>
  );
}
