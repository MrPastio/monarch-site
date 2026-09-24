# Monarch Site v4 — «Ночь внутри машины»

Public site for Monarch, a local AI for Windows. Live: https://mrpastio.github.io/monarch-site/

Separate repository on purpose: the marketing site never mixes with runtime
code. The previous site (`E:\Monarch\marketing-site`, OpenAI Sites) stays
untouched — the desktop updater uses it as a fallback mirror.

## Running

Node 22.13+ (`E:\Monarch\.tools\node-v22.23.1-win-x64`).

```bash
npm install
npm run dev          # http://localhost:4477 via E:\Monarch\.claude\launch.json (monarch-site-v4)
npm test             # truth contract (4 locales), contrast, release data
npm run typecheck
npx eslint .
npx next build       # server target (Vercel-ready: proxy locale redirect, ISR, headers)
```

## Two targets

- **Server** (default): `proxy.ts` sends `/` to the visitor's language,
  release data revalidates every 15 min, `/api/releases/stable/*` mirrors the
  signed manifest byte for byte.
- **Static** (GitHub Pages): `STATIC_EXPORT=1 NEXT_PUBLIC_BASE_PATH=/monarch-site`.
  `.github/workflows/pages.yml` removes the server-only parts, exports, runs
  `scripts/export-extras.mjs` and deploys. It rebuilds daily to pick up new
  releases.

## What is where

- `app/components/scenes/*` — one folder per chapter of the home page.
- `app/components/scenes/hero/crest-*` — the live 3D crest. Geometry comes from
  the owner-approved 1:1 trace (`scripts/source/crest-paths.grok.json`),
  refined by `scripts/build-crest-assets.mjs` → `app/assets/crest-paths.json`
  and the 2D mark in `app/components/brand/crest-paths.ts`.
- `app/components/illustration/*` — code-drawn illustrations (isometric board,
  process stack).
- `app/content/{ru,uk,en,bg}.ts` — copy; Russian is the reference, the other
  three must fill the same typed shape. `claims.ts` backs every product claim.
- `app/content/release-notes.ts` — product history; `releases.snapshot.json` —
  offline fallback of the GitHub release list.
- `app/lib/release*.ts` — Ed25519 verification of the stable manifest; never
  weaken it.

## Rules

- Design: Claude Design, night glass, orange/white/black/yellow. Motion has
  weight and direction; no idle glow; `prefers-reduced-motion` shows final
  states. Oscar changes only his pose.
- Font: Onest only (as on the previous site). Logo: only the owner's artwork.
- The site never shows the four-segment build version except in the exact
  installer file name, never calls the installer signed, never promises 100%.
