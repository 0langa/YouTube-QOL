# YouTube QOL Userscript

A modular userscript that adds quality-of-life enhancements to YouTube (tabs, player tools, hotkeys, download helpers, comments/timecode utilities, and related UI improvements).

## Project Layout

- `userscript.js`: userscript metadata header source
- `src/*.js`: runtime feature modules
- `locales/*.json`: translation files bundled into the build output
- `build.order.json`: module concatenation order
- `build.js`: local build script
- `youtube.user.js`: generated userscript output (created by build)

## Build

1. Install Node.js 20+.
2. Run:

```bash
npm install
npm run build
```

This generates `youtube.user.js` in the repo root.

## Manual Installation (Violentmonkey / Tampermonkey)

1. Build the script (`npm run build`).
2. Open your userscript manager dashboard.
3. Create a new script or import from file.
4. Paste/load the generated `youtube.user.js`.
5. Save and enable it.

## Development Flow

1. Edit files in `src/`, `userscript.js`, or `locales/`.
2. Run `npm run build`.
3. Reinstall/update `youtube.user.js` in your userscript manager.
