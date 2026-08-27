# YuLife Website 2026 — working notes

Next.js 15 (App Router, static export) + Tailwind v4 + GSAP + React Three Fiber.
Marketing site redesign. No CMS: content is edited directly in code via a human →
Claude → code workflow. Structured as swappable sections/data so that workflow stays fast
and copy changes are isolated to data files, not components.

## Finding code fast — do this before grepping

There is a generated index at [docs/CODE_MAP.md](docs/CODE_MAP.md): routes → template →
data file, a `data-src` → `file:line` table, and internal line landmarks for every
file over 120 lines. **Read the map before searching the tree.** Regenerate after
moving or renaming components:

```bash
npm run gen:map
```

In development, every block root carries a `data-src` attribute naming its
component. With the dev server up, this returns the whole page outline in source
terms — use it instead of dumping the accessibility tree, which on this site is
enormous:

```js
[...document.querySelectorAll("[data-src]")].map(e=>e.dataset.src+(e.dataset.blockLabel?" — "+e.dataset.blockLabel:""))
```

Stamps are component names only, never line numbers, so they survive edits. The
`/find` skill chains outline → map → targeted read.

**Stamps are dev-only.** They come from `domSrc()` (`src/lib/domSrc.ts`), which folds
to `{}` in a production build, so nothing reaches the static export. To inspect a
deployed staging URL, build with `NEXT_PUBLIC_DOM_SRC=true`.

When you add a new section, spread the helper onto its root and rerun `gen:map`:

```tsx
<section {...domSrc("MyNewSection")} className="...">
```

## Where things live

| What | Where |
|---|---|
| Homepage copy & content | `src/data/home-content.ts` |
| Wireframe page copy | `src/data/pages/{products,features,audience,editorial}.ts` |
| IA / nav / route inventory | `src/data/sitemap.ts`, `docs/SITEMAP.md` |
| Nav mega-menu content | `src/components/nav/menuContent.ts` |
| Homepage sections | `src/components/home/*`, `src/components/hero/*` |
| Design tokens (generated from Figma) | `design-tokens/theme.css`, `design-tokens/tokens.json` |
| Semantic utilities (`.page-container`, keyframes) | `src/app/globals.css` |
| Specs | `docs/specs/*.md` · audits in `docs/audits/` |

Homepage and wireframe pages are two different worlds. The homepage is bespoke,
token-driven, animated. The wireframe templates (`ProductPage`, `FeaturePage`,
`AudiencePage`, `EditorialPage`) are deliberately plain grey-box scaffolds that
render from data through `SectionBlock` — don't "improve" their styling unless asked.

## Conventions that matter

**Never hardcode a colour, size, or spacing value.** Use the semantic utilities:
`text-on-inverse`, `surface-inverse-raised`, `line-emphasis`, `type-heading-h2`,
`type-body-lg`, `gap-flow` / `gap-group` / `gap-stack` / `gap-controls`,
`var(--layout-section-gap)`. Primitives (`--purple-700` etc.) live only in
`design-tokens/theme.css` layer 1 and are aliased, never used directly in components.

**Layout width** comes from `.page-container` (centred 1216px + fluid gutters).

**Scroll reveals** go through `useReveal()` (`src/components/home/useReveal.ts`):
add `data-reveal` to any descendant. For a second trigger inside one section use
`data-reveal-anchor="name"` + `data-reveal-on="name"`. It honours reduced motion.

**GSAP overwrites inline transforms.** Never centre a GSAP-animated element with
`translate: -50% -50%` — GSAP writes `translate: none` inline and it will jump.
Compose the offset into the tween or use a static wrapper.

**Static export.** `output: "export"`, `trailingSlash: true`. No server runtime, no
route handlers, no `next/image` optimisation. Reference `/public` assets through
`assetPath()` (`src/lib/assetPath.ts`) so GitHub Pages subpath deploys resolve.

**Don't run `next build` while the dev server is up** — dev uses `NEXT_DIST_DIR=.next-dev`
for exactly this reason; sharing `.next` leaves the dev server serving HTML pointing
at 404'd CSS chunks.

## Working from Figma

**Read the design through the connector — never screenshot your way through it.**
A screenshot is not how you read a Figma file; it is a thumbnail for orientation
only and must never be the basis for writing code. For any Figma design or URL:

1. **Invoke the `figma:figma-design-to-code` skill first.** It is a mandatory
   prerequisite to `get_design_context` — do not skip it.
2. Pull the *structured* design: `get_design_context` (layout, styles, generated
   code), `get_metadata` (node tree), `get_variable_defs` (token values). These
   return real measurements, colours, and token names — not pixels to eyeball.
   `get_screenshot` is a supplement to those, never a substitute.
3. Only then write code. Never describe a design from memory or via `WebFetch`.

Writing *back* into Figma (`use_figma`, `create_new_file`) — invoke the
`figma:figma-use` skill first; also mandatory.

## Commands

```bash
npm run dev          # localhost:3000, turbopack, .next-dev
npm run gen:map      # regenerate docs/CODE_MAP.md
npm run lint
npm run build        # static export to out/
```

Use the Browser pane (`preview_start` with the `yulife-website` config from
`.claude/launch.json`) rather than running the dev server through a shell.

### Screenshotting this site

Sections animate in on scroll and the pane throttles `requestAnimationFrame` when
backgrounded, which freezes GSAP and R3F mid-animation. To capture a section
reliably: force its reveal state with `!important` CSS (GSAP writes inline styles,
so specificity matters), hide the sections above it rather than scrolling deep —
a large `scrollTo` often won't repaint.
