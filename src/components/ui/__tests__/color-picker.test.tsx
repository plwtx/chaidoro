import { fireEvent, render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import ColorPicker from "../color-picker";
import { hsvToHex } from "@/lib/color";

const PRESETS = [
  { name: "Chai", hex: "#b07a52" },
  { name: "Matcha", hex: "#7d9459" },
];

function renderPicker(value = "#b07a52") {
  const onChange = vi.fn();
  const view = render(
    <ColorPicker value={value} onChange={onChange} presets={PRESETS} />
  );
  return { onChange, ...view };
}

describe("ColorPicker - hex field", () => {
  it("applies a full six-digit code while typing", () => {
    const { onChange } = renderPicker();
    fireEvent.change(screen.getByLabelText("Hex color code"), {
      target: { value: "#6A7FB5" },
    });
    expect(onChange).toHaveBeenCalledWith("#6a7fb5");
  });

  it("applies a three-digit code on Enter", () => {
    const { onChange } = renderPicker();
    const input = screen.getByLabelText("Hex color code");
    fireEvent.change(input, { target: { value: "abc" } });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("#aabbcc");
  });

  it("reverts an invalid code on blur", () => {
    const { onChange } = renderPicker();
    const input = screen.getByLabelText("Hex color code");
    fireEvent.change(input, { target: { value: "12" } });
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("B07A52");
  });
});

describe("ColorPicker - presets and sliders", () => {
  it("picks a preset", () => {
    const { onChange } = renderPicker();
    fireEvent.click(screen.getByRole("button", { name: "Matcha" }));
    expect(onChange).toHaveBeenCalledWith("#7d9459");
  });

  it("marks the preset matching the value", () => {
    renderPicker("#7d9459");
    expect(screen.getByRole("button", { name: "Matcha" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("steps the hue with the arrow keys", () => {
    const { onChange } = renderPicker("#ff0000");
    fireEvent.keyDown(screen.getByRole("slider", { name: "Hue" }), {
      key: "ArrowRight",
      shiftKey: true,
    });
    expect(onChange).toHaveBeenCalledWith(hsvToHex({ h: 10, s: 1, v: 1 }));
  });

  it("keeps the hue when a grey comes in from outside", () => {
    const { rerender, onChange } = renderPicker("#6a7fb5");
    const hue = () =>
      screen.getByRole("slider", { name: "Hue" }).getAttribute("aria-valuenow");
    const before = hue();

    rerender(
      <ColorPicker value="#808080" onChange={onChange} presets={PRESETS} />
    );
    expect(hue()).toBe(before);
  });
});
