# Monarch Site v3

Public site for Monarch — a local AI for Windows.

This is a **separate repository** from `E:\Monarch` on purpose: the marketing
site must never be mixed with runtime code, and the parent repo is a shared,
frequently-dirty working tree.

The previous site lives at `E:\Monarch\marketing-site` and is still the one
deployed at `monarch-local-ai.mrpastio.chatgpt.site`. Nothing here replaces it
until the owner says so.

## Running it

Node 22.13+ is required. The pinned toolchain is `E:\Monarch\.tools\node-v22.23.1-win-x64`.

```bash
npm install
npm run dev        # http://localhost:4477 via .claude/launch.json, or 3000 by default
npm run build
npm test           # truth contract + colour contrast
npm run typecheck
```

## What makes this site different

**The truth contract.** `app/content/claims.ts` registers every factual
statement with the evidence that backs it, plus the wording the site may never
use. `tests/truth.test.mjs` fails the build when copy drifts — when a claim
loses its evidence, when a capability stops stating its limit, when the
four-segment build version leaks out, or when forbidden wording appears
(for example calling the installer "signed": its manifest is Ed25519-signed,
the `.exe` has no Authenticode).

**One accent, no glow.** `app/styles/tokens.css` is the only place a colour,
radius, shadow or duration is defined. `tests/contrast.test.mjs` checks every
text/background pair in both themes against WCAG AA. There are no ambient
gradient orbs and no permanent glow.

**Motion with an owner.** `app/components/motion/springs.ts` defines three
weight classes and nothing animates outside them. Scroll progress — not a
timer — drives the one pinned section, so scrolling back is always safe.
`prefers-reduced-motion` drops movement entirely, and below 900px the pinned
story renders as a plain list instead of being CSS-patched into place.

## Layout

```
app/
  [lang]/            route + root layout (locale is the top segment)
  components/
    motion/          springs, Reveal, useMediaQuery — the motion contract
    sections/        one file per home-page section
  content/
    claims.ts        truth contract: claim → evidence → limit
    ru.ts            Russian copy (uk/en/bg fall back until reviewed)
    types.ts         copy shape, typed for all four locales
  lib/
    release*.ts      Ed25519 manifest verification, ported unchanged
  styles/
    tokens.css       single source of truth for design values
  api/releases/stable/[file]/   byte-for-byte manifest mirror
```

## Release integrity

`app/lib/release.ts` and the mirror route were copied unchanged from the
previous site. They verify the stable manifest's Ed25519 signature and expose
the installer's SHA-256. If verification fails, the direct download button is
replaced by a link to the GitHub release page — do not weaken this.

## Not done yet

- Real 0.2.5 screenshots. Until they exist the hero and the story show a
  labelled **diagram**, never a drawn imitation of the application window.
- Inner pages (capabilities, how-it-works, control, architecture,
  documentation, download, updates).
- uk / en / bg copy — the dictionaries fall back to Russian and the footer
  marks them as pending rather than linking to an untranslated page.
- Hosting target.
