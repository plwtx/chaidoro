import { Fragment, useEffect, useMemo, useState } from "react";
import { RotateCcw, Search, X } from "lucide-react";
import { useAppStore } from "@/store";
import HorizontalDivider from "@/components/ui/horizontal-divider-line";
import HeaderDescription from "@/components/ui/header-description";
import AutomationToggle from "../components/automation-toggle";
import { showSettingsToast } from "../components/settings-toast";
import {
  SHORTCUT_ACTIONS,
  comboFromEvent,
  comboParts,
  comboText,
  shortcutCapture,
  type ShortcutActionDef,
  type ShortcutCategory,
} from "@/lib/shortcuts";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: ShortcutCategory[] = ["Timer", "Navigation", "Sounds"];

function actionLabel(actionId: string): string {
  return SHORTCUT_ACTIONS.find((a) => a.id === actionId)?.label ?? actionId;
}

function KeyCaps({ combo }: { combo: string }) {
  return (
    <span className="flex items-center gap-1">
      {comboParts(combo).map((part, i) => (
        <Fragment key={`${part}-${i}`}>
          {i > 0 && <span className="text-xs opacity-45">+</span>}
          <kbd className="bg-brown-100 border-brown-300 shadow-brown-300 dark:bg-dark-900 font-fragment-mono rounded-md border px-2 py-0.5 text-xs shadow-[0_1.5px_0] dark:border-black dark:shadow-black">
            {part}
          </kbd>
        </Fragment>
      ))}
    </span>
  );
}

function ShortcutRow({
  def,
  capturing,
  onToggleCapture,
}: {
  def: ShortcutActionDef;
  capturing: boolean;
  onToggleCapture: () => void;
}) {
  const combo = useAppStore((s) => s.settings.shortcuts.bindings[def.id]);
  const masterEnabled = useAppStore((s) => s.settings.shortcuts.enabled);
  const setShortcutBinding = useAppStore((s) => s.setShortcutBinding);

  const isDefault = combo === def.defaultCombo;

  return (
    <div
      className={cn(
        "text-brown-900 dark:text-dark-100 flex w-full items-center justify-between gap-6",
        !masterEnabled && "pointer-events-none opacity-40"
      )}
    >
      <div className="text-base">
        <h3 className="font-semibold">{def.label}</h3>
        <p className="text-sm opacity-75">{def.description}</p>
      </div>
      <div className="flex items-center gap-2">
        {/* Reset this row to its default combo (hidden when already default) */}
        {!isDefault && (
          <button
            onClick={async () => {
              const stolenFrom = await setShortcutBinding(
                def.id,
                def.defaultCombo
              );
              showSettingsToast(
                stolenFrom
                  ? `Restored default. Key taken from "${actionLabel(stolenFrom)}".`
                  : `"${def.label}" restored to default.`
              );
            }}
            aria-label={`Reset ${def.label} to default`}
            title="Reset to default"
            className="hover:bg-brown-100 dark:hover:bg-dark-900 cursor-pointer rounded-md p-1.5 opacity-55 transition-opacity hover:opacity-100"
          >
            <RotateCcw className="size-3.5" />
          </button>
        )}
        {/* Clear the binding entirely */}
        {combo && (
          <button
            onClick={async () => {
              await setShortcutBinding(def.id, null);
              showSettingsToast(`"${def.label}" shortcut cleared.`);
            }}
            aria-label={`Clear ${def.label} shortcut`}
            title="Clear shortcut"
            className="hover:bg-brown-100 dark:hover:bg-dark-900 cursor-pointer rounded-md p-1.5 opacity-55 transition-opacity hover:opacity-100"
          >
            <X className="size-3.5" />
          </button>
        )}
        {/* Current binding; click to record a new combo */}
        <button
          data-capture-button={def.id}
          onClick={onToggleCapture}
          aria-label={`Rebind ${def.label}`}
          className={cn(
            "flex min-h-8 min-w-24 cursor-pointer items-center justify-center rounded-lg px-2 py-1 transition-colors",
            capturing
              ? "border-brown-500 dark:border-dark-100 border border-dashed"
              : "hover:bg-brown-100/75 dark:hover:bg-dark-900/75"
          )}
        >
          {capturing ? (
            <span className="font-fragment-mono animate-pulse text-xs opacity-75">
              Press keys...
            </span>
          ) : combo ? (
            <KeyCaps combo={combo} />
          ) : (
            <span className="font-fragment-mono text-xs opacity-45">
              Not set
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function ShortcutSettings() {
  const shortcutsEnabled = useAppStore((s) => s.settings.shortcuts.enabled);
  const bindings = useAppStore((s) => s.settings.shortcuts.bindings);
  const setShortcutsEnabled = useAppStore((s) => s.setShortcutsEnabled);
  const setShortcutBinding = useAppStore((s) => s.setShortcutBinding);
  const resetShortcutBindings = useAppStore((s) => s.resetShortcutBindings);

  const [query, setQuery] = useState("");
  const [capturingId, setCapturingId] = useState<string | null>(null);

  /*
    While a row is recording: swallow every keystroke (and flag the global
    dispatcher off via shortcutCapture). Esc cancels, Backspace/Delete
    clears, anything else (+ held modifiers) becomes the new combo. If the
    combo was bound to another action it is stolen from it.
  */
  useEffect(() => {
    if (!capturingId) return;
    shortcutCapture.active = true;

    const onKeyDown = async (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.code === "Escape") {
        setCapturingId(null);
        return;
      }
      if (e.code === "Backspace" || e.code === "Delete") {
        setCapturingId(null);
        await setShortcutBinding(capturingId, null);
        showSettingsToast("Shortcut cleared.");
        return;
      }

      const combo = comboFromEvent(e);
      if (!combo) return; // only modifiers held so far (keep waiting)

      setCapturingId(null);
      const stolenFrom = await setShortcutBinding(capturingId, combo);
      showSettingsToast(
        stolenFrom
          ? `Bound ${comboText(combo)}. Key taken from "${actionLabel(stolenFrom)}".`
          : `Shortcut set to ${comboText(combo)}.`
      );
    };

    // Clicking anywhere else cancels; clicking the active row's own key button is left to its onClick, which toggles capture off.
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.(`[data-capture-button="${capturingId}"]`)) return;
      setCapturingId(null);
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      shortcutCapture.active = false;
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, [capturingId, setShortcutBinding]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHORTCUT_ACTIONS;
    return SHORTCUT_ACTIONS.filter((def) => {
      const combo = bindings[def.id];
      const haystack = [
        def.label,
        def.description,
        def.category,
        combo ? comboText(combo) : "",
        combo ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [query, bindings]);

  return (
    <main>
      <HeaderDescription
        header={"Keyboard shortcuts"}
        description={
          "Control the app without touching the mouse. Click a key to rebind it - combinations like Ctrl + K work too. Key names follow the US QWERTY (ANSI) layout, and bindings are saved with your data and included in JSON backups."
        }
        kaomoji={null}
      />
      <HorizontalDivider />
      <section className="mt-6 flex flex-col gap-6">
        <AutomationToggle
          label="Enable shortcuts"
          description="Master switch for all keyboard shortcuts below."
          checked={shortcutsEnabled}
          onChange={() => {
            setShortcutsEnabled(!shortcutsEnabled);
            showSettingsToast(
              `Shortcuts ${shortcutsEnabled ? "disabled" : "enabled"}.`
            );
          }}
        />
        <HorizontalDivider />

        {/* Search across action names, descriptions and bound keys */}
        <div className="relative">
          <Search className="text-brown-900 dark:text-dark-100 absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-45" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shortcuts or keys..."
            aria-label="Search shortcuts"
            data-sound="none"
            className="border-brown-300 bg-brown-100/75 text-brown-900 placeholder:text-brown-400 dark:bg-dark-900 dark:text-dark-100 dark:placeholder:text-dark-100/45 w-full rounded-lg border py-2 pr-3 pl-9 text-sm focus:outline-none dark:border-black"
          />
        </div>

        {filtered.length === 0 && (
          <p className="text-brown-900 dark:text-dark-100 text-sm opacity-55">
            No shortcuts match your search.
          </p>
        )}

        {CATEGORY_ORDER.map((category) => {
          const actions = filtered.filter((def) => def.category === category);
          if (actions.length === 0) return null;
          return (
            <div key={category} className="flex flex-col gap-5">
              <h2 className="text-brown-900 dark:text-dark-100 font-fragment-mono text-xs tracking-widest uppercase opacity-55">
                {category}
              </h2>
              {actions.map((def) => (
                <ShortcutRow
                  key={def.id}
                  def={def}
                  capturing={capturingId === def.id}
                  onToggleCapture={() =>
                    setCapturingId(capturingId === def.id ? null : def.id)
                  }
                />
              ))}
            </div>
          );
        })}

        <HorizontalDivider />
        <div className="flex items-center justify-between gap-6">
          <p className="text-brown-900 dark:text-dark-100 text-xs opacity-55">
            While recording: Esc cancels, Backspace clears. Assigning a key
            combo that is already in use moves it to the new action.
          </p>
          <button
            onClick={async () => {
              await resetShortcutBindings();
              showSettingsToast("Shortcuts restored to defaults.");
            }}
            className="border-brown-300 text-brown-900 hover:bg-brown-100 dark:text-dark-100 dark:hover:bg-dark-900 flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 text-sm whitespace-nowrap dark:border-black"
          >
            <RotateCcw className="size-3.5" />
            Reset to defaults
          </button>
        </div>
      </section>
    </main>
  );
}
