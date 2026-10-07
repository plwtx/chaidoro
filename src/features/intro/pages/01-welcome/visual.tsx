import teapot from "@/assets/png/shusheChaynikHD.png";
import PlaceholderArt from "../../components/placeholder-art";

/* Placeholder until the final illustration: the glass teapot over the leaves pattern. */
export default function WelcomeVisual() {
  return (
    <PlaceholderArt
      pattern="leaves"
      image={{ src: teapot, alt: "Glass teapot, the Chaidoro logo" }}
    />
  );
}
