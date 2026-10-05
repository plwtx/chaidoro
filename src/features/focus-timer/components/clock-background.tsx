import { useAppStore } from "@/store/index";
import PatternFill from "@/components/ui/pattern-fill";

/*
  Clock screen backdrop: the uploaded image under the theme color overlay, or the background pattern on the plain color. An uploaded image hides the pattern.
*/
export default function ClockBackground() {
  const backgroundImageKey = useAppStore((s) => s.settings.backgroundImageKey);
  const backgroundOpacity = useAppStore((s) => s.settings.backgroundOpacity);
  const backgroundSaturation = useAppStore(
    (s) => s.settings.backgroundSaturation
  );
  const backgroundContrast = useAppStore((s) => s.settings.backgroundContrast);
  const backgroundPattern = useAppStore((s) => s.settings.backgroundPattern);

  return (
    <section className="z-0">
      {/* Background image layer sits below the color overlay */}
      {backgroundImageKey && (
        <div
          className="absolute inset-0 isolate z-0"
          style={{
            backgroundImage: "var(--bg-image)",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: `saturate(${backgroundSaturation}%) contrast(${backgroundContrast * 2}%)`,
          }}
        />
      )}
      {/* Background color overlay (opacity controlled by user when image is active) */}
      <div
        className="bg-brown-50 dark:bg-dark-600 absolute inset-0 isolate z-10 touch-none mix-blend-screen select-none dark:mix-blend-darken"
        style={
          backgroundImageKey ? { opacity: backgroundOpacity / 100 } : undefined
        }
      />
      {/* Pattern on top of the plain color; only without an image */}
      {!backgroundImageKey && backgroundPattern !== "none" && (
        <PatternFill
          pattern={backgroundPattern}
          className="absolute inset-0 isolate z-20 touch-none select-none"
        />
      )}
    </section>
  );
}
