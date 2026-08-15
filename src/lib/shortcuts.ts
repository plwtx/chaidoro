export type ShortcutActionId =
  | "timerToggle"
  | "timerEndCycle"
  | "navTimer"
  | "navStatistics"
  | "navSettings"
  | "toggleMute";

export type ShortcutCategory = "Timer" | "Navigation" | "Sounds";

export interface ShortcutActionDef {
  id: ShortcutActionId;
  label: string;
  description: string;
  category: ShortcutCategory;
  /* Default combo string, or null for actions that ship unbound. */
  defaultCombo: string | null;
}

export const SHORTCUT_ACTIONS: ShortcutActionDef[] = [
  {
    id: "timerToggle",
    label: "Start / pause timer",
    description: "Starts, pauses or resumes the current session.",
    category: "Timer",
    defaultCombo: "Space",
  },
  {
    id: "timerEndCycle",
    label: "End cycle / skip break",
    description: "Ends the running focus cycle or skips the current break.",
    category: "Timer",
    defaultCombo: "KeyE",
  },
  {
    id: "navTimer",
    label: "Go to timer",
    description: "Opens the focus timer page.",
    category: "Navigation",
    defaultCombo: "Digit1",
  },
  {
    id: "navStatistics",
    label: "Go to statistics",
    description: "Opens the statistics page.",
    category: "Navigation",
    defaultCombo: "Digit2",
  },
  {
    id: "navSettings",
    label: "Go to settings",
    description: "Opens the settings page.",
    category: "Navigation",
    defaultCombo: "Digit3",
  },
  {
    id: "toggleMute",
    label: "Mute / unmute sounds",
    description: "Toggles the master sound switch.",
    category: "Sounds",
    defaultCombo: "KeyM",
  },
];

/* actionId -> default combo, used to build DEFAULT_SETTINGS.shortcuts. */
export const DEFAULT_SHORTCUT_BINDINGS: Record<string, string | null> =
  Object.fromEntries(SHORTCUT_ACTIONS.map((a) => [a.id, a.defaultCombo]));

/*
  Shared flag set by the settings page while it is recording a new combo, so
  the global dispatcher (useKeyboardShortcuts) ignores those keystrokes.
*/
export const shortcutCapture = { active: false };

/* Modifier keys never form a combo on their own. */
const MODIFIER_CODES = new Set([
  "ControlLeft",
  "ControlRight",
  "ShiftLeft",
  "ShiftRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight",
  "OSLeft",
  "OSRight",
]);

/*
 Serialize a keydown event into a combo string. Returns null while only
 modifiers are held (no main key yet) or when the code is unknown.
 */
export function comboFromEvent(e: KeyboardEvent): string | null {
  if (!e.code || MODIFIER_CODES.has(e.code)) return null;
  const parts: string[] = [];
  if (e.ctrlKey) parts.push("Ctrl");
  if (e.altKey) parts.push("Alt");
  if (e.shiftKey) parts.push("Shift");
  if (e.metaKey) parts.push("Meta");
  parts.push(e.code);
  return parts.join("+");
}

/* Display labels (US QWERTY / ANSI) for codes that don't self-describe. */
const KEY_LABELS: Record<string, string> = {
  Space: "Space",
  Enter: "Enter",
  Escape: "Esc",
  Backspace: "Backspace",
  Tab: "Tab",
  Delete: "Del",
  Insert: "Ins",
  Home: "Home",
  End: "End",
  PageUp: "PgUp",
  PageDown: "PgDn",
  CapsLock: "Caps",
  ContextMenu: "Menu",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Backquote: "`",
  Comma: ",",
  Period: ".",
  Slash: "/",
  NumpadAdd: "Num +",
  NumpadSubtract: "Num -",
  NumpadMultiply: "Num *",
  NumpadDivide: "Num /",
  NumpadDecimal: "Num .",
  NumpadEnter: "Num Enter",
};

/* Human label for a single physical key code. */
export function keyLabel(code: string): string {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3);
  if (/^Digit\d$/.test(code)) return code.slice(5);
  if (/^Numpad\d$/.test(code)) return `Num ${code.slice(6)}`;
  if (/^F\d{1,2}$/.test(code)) return code;
  return KEY_LABELS[code] ?? code;
}

/*
  Split a stored combo string into display labels for keycap rendering,
  e.g. "Ctrl+Shift+KeyK" -> ["Ctrl", "Shift", "K"].
 */
export function comboParts(combo: string): string[] {
  return combo.split("+").map((part) => {
    if (
      part === "Ctrl" ||
      part === "Alt" ||
      part === "Shift" ||
      part === "Meta"
    ) {
      return part;
    }
    return keyLabel(part);
  });
}

/* "Ctrl+Shift+KeyK" -> "Ctrl + Shift + K", for toasts and search matching. */
export function comboText(combo: string): string {
  return comboParts(combo).join(" + ");
}

/**
  True when the keydown happened in a text-entry context (inputs, textareas,
  contenteditable) where shortcuts must not fire.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
