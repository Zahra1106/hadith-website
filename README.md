# As-Sahifah (الصحيفة) — Hadith Website

A full-stack Hadith reading site: Node.js/Express backend + a static
frontend, with your uploaded video as the hero background.

## What's inside

```
hadith-site/
├── server.js              # Express entry point
├── routes/api.js          # All /api/* endpoints
├── services/hadithApi.js  # Fetches + disk-caches the verified Hadith dataset
├── data/curated.js        # 15 hand-checked sample Hadith + topics + collections meta
├── cache/                 # Downloaded collections are cached here as JSON (auto-created)
└── public/                # Frontend (served as static files)
    ├── index.html
    ├── hero-video.mp4     # your uploaded video
    ├── css/style.css
    └── js/app.js
```

## How to run it in VS Code

1. **Install Node.js** (v18 or newer) if you don't have it: https://nodejs.org
2. Open the `hadith-site` folder in VS Code (`File → Open Folder…`).
3. Open a terminal in VS Code (`` Ctrl+` `` / `` Cmd+` ``) and run:
   ```bash
   npm install
   npm start
   ```
4. Open **http://localhost:3000** in your browser.

That's it — no database setup, no environment variables needed.

## How the Hadith data works

- **Homepage / Topics / Daily Hadith** — served instantly from `data/curated.js`,
  a small set of 15 well-known, hand-checked narrations across all four
  collections and all fifteen topics. This never touches the network.

- **"Full Library" section** — when you click **Load** on a collection there,
  the backend (`services/hadithApi.js`) downloads the complete Arabic,
  English and Urdu text of that collection from the open-source
  [`hadith-api`](https://github.com/fawazahmed0/hadith-api) dataset, which
  mirrors Sunnah.com's published collections (Sahih al-Bukhari ≈7,589
  narrations, Sahih Muslim, Sunan Abu Dawood, Jami` at-Tirmidhi). It's
  saved to `cache/*.json` so it only downloads once — after that, restarts
  are instant and fully offline.
- **This requires your server (not just the browser) to have internet
  access** the first time each collection is loaded. If `npm start` is
  running on a machine with no internet, the "Full Library" section will
  show an error but the rest of the site keeps working normally.

**No Hadith text is generated, edited, or paraphrased by any AI anywhere
in this codebase.** Everything shown is either the hand-checked curated
set or the verbatim published translation fetched from the dataset above.

## Customizing

- **Swap the hero video**: replace `public/hero-video.mp4` with your own
  file (keep the same filename, or update the `<source>` tag in
  `public/index.html`).
- **Add more curated Hadith**: edit the `hadiths` array in `data/curated.js`
  — follow the existing shape (`id`, `collection`, `book`, `chapter`,
  `number`, `narrator`, `topic`, `arabic`, `english`, `urdu`, `explanation`,
  `authenticity`). Only add narrations you've personally verified against
  a primary source.
- **Colors / fonts**: CSS variables are at the top of `public/css/style.css`.
- **Deploying online**: this is a standard Express app — it runs as-is on
  Render, Railway, Fly.io, a VPS, etc. Just run `npm install && npm start`
  and make sure the `cache/` folder is writable.

## Important note on authenticity

For research, legal rulings (fatwa), or academic citation, always verify
Hadith wording, numbering, and grading against a printed critical edition
or a primary reference such as [Sunnah.com](https://sunnah.com),
[Dorar.net](https://dorar.net), or [Islamweb.net](https://islamweb.net).
