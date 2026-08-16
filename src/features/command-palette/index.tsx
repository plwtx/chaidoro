import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { useAppStore } from "@/store";
import { usePaletteStore } from "./paletteStore";
import { SHORTCUT_ACTIONS, comboFromEvent, comboText } from "@/lib/shortcuts";
import { runShortcutAction } from "@/hooks/useKeyboardShortcuts";
import { exportJSON } from "@/lib/storageActions";
import { showSettingsToast } from "@/features/settings/components/settings-toast";
import {
  SETTINGS_TABS,
  useSettingsTabStore,
} from "@/features/settings/settingsTabStore";
import { soundManager } from "@/lib/soundManager";
import KeyCaps from "@/components/ui/key-caps";
import { cn } from "@/lib/utils";
import type { Theme } from "@/types";

interface PaletteCommand {
  id: string;
  label: string;
  description: string;
  keywords: string;
  combo: string | null;
  run: () => void;
}

const THEME_COMMANDS: { id: Theme; label: string }[] = [
  { id: "light", label: "Theme: Light" },
  { id: "dark", label: "Theme: Dark" },
  { id: "system", label: "Theme: System" },
];

function usePaletteCommands(): PaletteCommand[] {
  const navigate = useNavigate();
  const bindings = useAppStore((s) => s.settings.shortcuts.bindings);
  const setTheme = useAppStore((s) => s.setTheme);
  const setSettingsTab = useSettingsTabStore((s) => s.setActiveId);

  return useMemo(() => {
    const commands: PaletteCommand[] = [];

    for (const def of SHORTCUT_ACTIONS) {
      if (def.id === "openPalette") continue;
      commands.push({
        id: def.id,
        label: def.label,
        description: def.description,
        keywords: def.category.toLowerCase(),
        combo: bindings[def.id] ?? null,
        run: () => runShortcutAction(def.id, navigate),
      });
    }

    // Palette-only commands (no key binding)
    for (const t of THEME_COMMANDS) {
      commands.push({
        id: `theme-${t.id}`,
        label: t.label,
        description: `Switches the color mode to ${t.id}.`,
        keywords: "theme appearance color mode light dark system switch",
        combo: null,
        run: () => {
          setTheme(t.id);
          showSettingsToast(`Theme set to ${t.id}.`);
        },
      });
    }

    for (const tab of SETTINGS_TABS) {
      commands.push({
        id: `settings-${tab.id}`,
        label: `Settings: ${tab.name}`,
        description: `Opens the ${tab.name.toLowerCase()} settings tab.`,
        keywords: "settings preferences open go tab",
        combo: null,
        run: () => {
          setSettingsTab(tab.id);
          soundManager.play("navigation");
          navigate("/settings");
        },
      });
    }

    commands.push({
      id: "export-backup",
      label: "Export backup (JSON)",
      description: "Downloads all app data as a JSON backup file.",
      keywords: "export backup save download data json storage",
      combo: null,
      run: () => {
        exportJSON();
        showSettingsToast("Backup exported.");
      },
    });

    return commands;
  }, [bindings, navigate, setTheme, setSettingsTab]);
}

function scoreCommand(cmd: PaletteCommand, tokens: string[]): number {
  const label = cmd.label.toLowerCase();
  const secondary = `${cmd.keywords} ${cmd.description.toLowerCase()}`;
  const combo = cmd.combo ? comboText(cmd.combo).toLowerCase() : "";

  let total = 0;
  for (const token of tokens) {
    if (label.startsWith(token)) total += 4;
    else if (label.includes(token)) total += 3;
    else if (secondary.includes(token)) total += 2;
    else if (combo.includes(token)) total += 1;
    else return 0;
  }
  return total;
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="bg-brown-100 border-brown-300 dark:bg-dark-900 font-fragment-mono rounded border px-1 py-px text-[10px] dark:border-black">
      {children}
    </kbd>
  );
}

function PalettePanel() {
  const commands = usePaletteCommands();
  const paletteCombo = useAppStore(
    (s) => s.settings.shortcuts.bindings["openPalette"]
  );

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    const tokens = q.split(/\s+/);
    return commands
      .map((cmd) => ({ cmd, score: scoreCommand(cmd, tokens) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((r) => r.cmd);
  }, [commands, query]);

  const selectedIndex = Math.min(selected, Math.max(0, results.length - 1));

  const close = () => usePaletteStore.getState().setOpen(false);

  const execute = (cmd: PaletteCommand) => {
    close();
    cmd.run();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected(Math.min(selectedIndex + 1, results.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected(Math.max(selectedIndex - 1, 0));
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const cmd = results[selectedIndex];
        if (cmd) execute(cmd);
        return;
      }
      if (e.key === "Tab") {
        // Keep focus in the search field
        e.preventDefault();
        return;
      }
      const combo = comboFromEvent(e);
      if (combo && combo === paletteCombo) {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      onPointerDown={(e) => {
        // Only clicks on the backdrop itself dismiss
        if (e.target === e.currentTarget) close();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[6px]"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onPointerDown={() => {
          // Clicking panel chrome must not drop keyboard control
          requestAnimationFrame(() => inputRef.current?.focus());
        }}
        className="bg-brown-50 dark:bg-dark-600 border-brown-300 font-poppins w-full max-w-2xl overflow-clip rounded-xl border shadow-2xl dark:border-black"
      >
        {/* Search */}
        <div className="border-brown-200 dark:border-dark-900 relative border-b">
          <Search className="text-brown-900 dark:text-dark-100 absolute top-1/2 left-4 size-4 -translate-y-1/2 opacity-45" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            placeholder="Type a command..."
            aria-label="Search commands"
            data-sound="none"
            className="text-brown-900 placeholder:text-brown-400 dark:text-dark-100 dark:placeholder:text-dark-100/45 w-full bg-transparent py-3.5 pr-4 pl-11 text-sm focus:outline-none"
          />
        </div>

        {/* Results */}
        <ul
          role="listbox"
          aria-label="Commands"
          className="max-h-96 overflow-y-auto overscroll-contain p-2"
        >
          {results.length === 0 && (
            <li className="text-brown-900 dark:text-dark-100 px-3 py-6 text-center text-sm opacity-55">
              No commands found.
            </li>
          )}
          {results.map((cmd, i) => {
            const isSelected = i === selectedIndex;
            return (
              <li
                key={cmd.id}
                role="option"
                aria-selected={isSelected}
                ref={
                  isSelected
                    ? (el) => el?.scrollIntoView({ block: "nearest" })
                    : undefined
                }
                onMouseMove={() => setSelected(i)}
                onClick={() => execute(cmd)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2",
                  isSelected &&
                    "bg-brown-200/75 dark:bg-dark-900 shadow-brown-500/45 dark:shadow-dark-900 shadow-md"
                )}
              >
                <div className="min-w-0">
                  <h3 className="text-brown-900 dark:text-dark-100 truncate text-sm font-medium">
                    {cmd.label}
                  </h3>
                  <p className="text-brown-600 dark:text-dark-100/55 truncate text-xs">
                    {cmd.description}
                  </p>
                </div>
                {cmd.combo && <KeyCaps combo={cmd.combo} />}
              </li>
            );
          })}
        </ul>

        {/* Footer hints */}
        <div className="border-brown-200 text-brown-900 dark:border-dark-900 dark:text-dark-100 flex items-center gap-4 border-t px-4 py-2 text-[11px] opacity-55">
          <span className="flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> run
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd> close
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function CommandPalette() {
  const open = usePaletteStore((s) => s.open);

  // Panel state (query, selection) resets naturally: it unmounts on close.
  return <AnimatePresence>{open && <PalettePanel />}</AnimatePresence>;
}
