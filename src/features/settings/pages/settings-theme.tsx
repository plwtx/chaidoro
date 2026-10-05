import HeaderDescription from "@/components/ui/header-description";
import HorizontalDivider from "@/components/ui/horizontal-divider-line";
import ColorModeSelector from "./settings-theme/color-mode-selector";
import AccentColorSetting from "./settings-theme/accent-color-setting";
import BackgroundPatternSelector from "./settings-theme/background-pattern-selector";
import BackgroundImageUpload from "./settings-theme/background-image-upload";

export default function ThemeSettings() {
  return (
    <div className="font-poppins h-full w-full text-sm">
      <HeaderDescription
        header={"Appearance"}
        description={
          "Chaidoro is already themed by me (Len) however feel free to customize it to reflect your personality ! ... or perhaps you love my picks and do not want to ruin it"
        }
        kaomoji={"o( ❛ᴗ❛ )o"}
      />
      {/* Divider line */}
      <HorizontalDivider />
      {/* Categories */}
      <div className="text-brown-800 dark:text-dark-100 flex flex-col gap-6">
        <ColorModeSelector />
        <HorizontalDivider />
        <AccentColorSetting />
        <HorizontalDivider />
        <BackgroundPatternSelector />
        <HorizontalDivider />
        <BackgroundImageUpload />
        {/* Empty bottom spacing */}
        <div className="h-9" />
      </div>
    </div>
  );
}
