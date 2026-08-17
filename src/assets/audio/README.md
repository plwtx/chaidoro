# App sounds

All app sound effects live in this folder. Which file plays for which event
is configured in `sounds.json` - the app reads that manifest at build time.

## Using your own sounds

1. Drop your audio file into this folder (`.opus`, `.wav`, `.mp3`, and `.ogg`
   work). The shipped sounds are Ogg Opus - it is the smallest of the four.
2. Open `sounds.json` and change the `file` value of the event you want,
   e.g. point `click` at `my-click.opus`.
3. Restart the dev server (`npm run dev`) or rebuild.

Notes:

- `label` and `description` are what users see in Settings > Sounds.
- `defaultVolume` (0-100) only seeds the initial value for new users.
  Enabled state and volume are stored per user in settings (IndexedDB) and
  are included in JSON backup export/import.
- `master.defaultVolume` (0-100) is the same thing for the master volume,
  which scales every event on top of its own volume.
- Files in this folder that no event references (currently `clock.opus`) are
  never fetched or preloaded by the app - they are just available for you
  to map. (They do get copied into the build output.)
- Event ids (`click`, `navigation`, `focusStart`, ...) are wired in code
  (`src/lib/soundManager.ts` and its call sites), so you can remap their
  files freely, but adding a brand new event also needs a code call site.
