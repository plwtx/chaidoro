import ToggleSwitch from "@/components/ui/toggle-switch";

interface SetupToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

/* A compact on / off row for setup pages (Settings uses the roomier AutomationToggle). */
export default function SetupToggle({
  label,
  description,
  checked,
  onChange,
}: SetupToggleProps) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <h3 className="text-brown-900 dark:text-dark-100 text-sm font-medium">
          {label}
        </h3>
        <p className="font-fragment-mono text-brown-600 dark:text-dark-100/55 text-[11px] leading-4">
          {description}
        </p>
      </div>
      <div className="shrink-0">
        <ToggleSwitch checked={checked} onChange={onChange} ariaLabel={label} />
      </div>
    </div>
  );
}
