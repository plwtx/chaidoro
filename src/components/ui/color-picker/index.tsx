import { useState } from "react";
import { hexToHsv, hsvToHex, type Hsv, type NamedColor } from "@/lib/color";
import SaturationArea from "./saturation-area";
import HueSlider from "./hue-slider";
import HexInput from "./hex-input";
import PresetSwatches from "./preset-swatches";

/*
  Themed color picker: saturation/brightness area, hue slider, hex field and optional presets. Controlled by a hex value; HSV is kept here so dragging stays smooth and the hue survives greys.
*/
export default function ColorPicker({
  value,
  onChange,
  presets = [],
}: {
  value: string;
  onChange: (hex: string) => void;
  presets?: NamedColor[];
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const [seenValue, setSeenValue] = useState(value);

  // A value from outside (preset, hex field, parent) re-seeds HSV. The ones this picker emitted already match it, so a drag is never pulled back.
  if (value !== seenValue) {
    setSeenValue(value);
    if (value !== hsvToHex(hsv)) {
      const next = hexToHsv(value);
      setHsv(next.s === 0 ? { ...next, h: hsv.h } : next);
    }
  }

  const update = (next: Hsv) => {
    setHsv(next);
    const hex = hsvToHex(next);
    if (hex !== value) onChange(hex);
  };

  return (
    <div className="flex flex-col gap-3">
      <SaturationArea hsv={hsv} onChange={update} />
      <HueSlider hue={hsv.h} onChange={(h) => update({ ...hsv, h })} />
      <HexInput value={value} onCommit={onChange} />
      {presets.length > 0 && (
        <PresetSwatches presets={presets} value={value} onSelect={onChange} />
      )}
    </div>
  );
}
