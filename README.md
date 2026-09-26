# Monarch Site v5.1 — «Дневной свет»

Public site for Monarch, a local AI for Windows. Live: https://monarch-site-sigma.vercel.app/
The earlier GitHub Pages deployment remains at https://mrpastio.github.io/monarch-site/.

Separate repository on purpose: the marketing site never mixes with runtime
code. The previous site (`E:\Monarch\marketing-site`, OpenAI Sites) stays
untouched — the desktop updater uses it as a fallback mirror.

## Running

Node 22.13+ (`E:\Monarch\.tools\node-v22.23.1-win-x64`).

```bash
npm install
npm run dev          # http://localhost:4477 via E:\Monarch\.claude\launch.json (monarch-site-v4)
npm test             # truth contract (4 locales), contrast (paper + night), release data
npm run og           # Open Graph images from the live hero (needs the dev server)
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

The Vercel project is `antonkalesnik21-8246s-projects/monarch-site` and was
published from `site-v5-daylight` on 2026-09-26. GitHub login connection is
not configured in Vercel yet, so source changes require a manual deployment:
`vercel deploy --prod` from this directory. Keep `STATIC_EXPORT` unset for it.

## What is where

- `app/styles/tokens.css` — the palette is the desktop app's own light theme
  (`src/ui/public/themes.css`); `.night` redefines the same tokens for the
  protection chapter and the download stage.
- `app/components/scenes/*` — one folder per chapter of the home page.
- `app/components/scenes/hero/oscar-window.tsx` — the hero: a Monarch window in
  which Oscar takes a real request through plan, permission, execution and a
  receipt (three scenarios; one timeline owns the motion, reduced motion shows
  the result).
- `app/components/scenes/path-map/*` — the request path as a line with the
  policy fork (allow / ask you / deny); a travelling request lights the
  stations it passes.
- `app/components/scenes/abilities/*` — what 0.2.5 does, as small product
  scenes that play once when seen (maturity labels match the app).
- `app/components/scenes/access/*` — autonomy modes and what the permission
  gate does with each action (mirrors 0.2.5 `permissionRuleFor`).
- `app/components/page/*` — inner-page parts: architecture map, module grid
  with filters, principle demos, 404 view (also used by
  `app/global-not-found.tsx` for unmatched addresses).
- `app/components/scenes/hero/crest-*` — the live 3D crest (shown on the
  download stage, `download/crest-stage.tsx`). Geometry comes from
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

- Design: Claude Design on warm paper, the app's dark glass for the product
  window and night chapters; orange/white/black/yellow. Headline accents are a
  highlighter drawn once (`*word*` in copy). Motion has weight and direction;
  no idle glow; `prefers-reduced-motion` shows final states. Oscar changes
  only his pose.
- Font: Onest only (as on the previous site). Logo: only the owner's artwork.
- The site never shows the four-segment build version except in the exact
  installer file name, never calls the installer signed, never promises 100%.
