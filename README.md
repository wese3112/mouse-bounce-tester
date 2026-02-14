# Mouse Bounce Tester

Mouse Bounce Tester is a static web app for checking mouse switch bounce behavior.

It tracks:
- left button press count
- left button release count
- right button press count
- right button release count

It also draws:
- optional mouse path trail
- left markers in blue (filled on press, outlined on release)
- right markers in red (filled on press, outlined on release)

## Features

- compact, full-page SVG drawing area
- light/dark theme toggle
- "Clear (Space)" shortcut for quick reset
- path drawing toggle (disabled by default)
- local persistence for theme and path-toggle preference

## Run locally

No build step is required.

1. Open `index.html` directly in a browser.
2. Or serve the folder with any static server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy

Because this is a static app, you can publish it to:
- GitHub Pages
- Netlify
- Vercel (static)
- Cloudflare Pages

Deploy the repository root as-is. The entry file is `index.html`.

## Usage tips

- Use repeated clicks in one spot and compare press/release counts.
- A mismatch between press and release counts can indicate bounce or switch issues.
- Use the dot markers and trail to verify where events were captured.
