import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useAppStore } from "@/store";
import type { Theme } from "@/types";
import OptionCard from "../../components/option-card";

const THEME_OPTIONS: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/* Compact color mode picker; the theme applies (and is saved) on click. */
export default function ThemePicker() {
  const theme = useAppStore((s) => s.settings.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  return (
    <div
      role="group"
      aria-label="Color mode"
      className="grid grid-cols-3 gap-2"
    >
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <OptionCard
          key={value}
          selected={theme === value}
          onSelect={() => setTheme(value)}
        >
          <Icon aria-hidden="true" className="size-5 stroke-[1.5px]" />
          {label}
        </OptionCard>
      ))}
    </div>
  );
}
