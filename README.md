# YuLife 2026 Website

Website redesign built with **Next.js 15 + Tailwind CSS 4**. There is no CMS: content
is edited directly in code, via a human → Claude → code workflow. The home page and a
growing set of content pages are hand-authored; remaining routes render placeholder
stubs until their copy and layout are ready.

**Live preview:** [amityulife.github.io/yulife-website](https://amityulife.github.io/yulife-website) (GitHub Pages, static export)

## Run it

```bash
npm install
npm run dev        # local dev server with Turbopack (http://localhost:3000)
npm run build      # static export to out/
npm run start      # serve production build locally
npm run lint       # ESLint (Next.js config)
```

Other scripts:

```bash
npm run gen:pages              # regenerate stub page.tsx files from sitemap
npm run gen:svg                # regenerate docs/sitemap-diagram.svg
npm run optimize:platform-videos   # compress homepage platform loop videos
```

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, static export) |
| UI | React 19, Tailwind CSS 4 |
| Animation | GSAP (`@gsap/react`) |
| 3D | Three.js via React Three Fiber (`YuCoin`, `YunityStar3D`) |
| Fonts | Berlingske Serif, Lota Grotesque (local WOFF2) |
| Design ↔ code | Figma Code Connect (`*.figma.ts`, see `figma.config.json`) |

## How it's wired

**Single source of truth for IA: `src/data/sitemap.ts`.** It defines every nav group,
page, route, purpose and copy status. From it we drive:

- header & footer navigation (`src/components/Header.tsx`, `Footer.tsx`)
- the in-site IA overview at **`/sitemap`**
- auto-generated stub routes (see below)
- the diagram at `docs/sitemap-diagram.svg`

To add, rename or remove a page, **edit `sitemap.ts` and re-run the generators:**

```bash
npm run gen:pages   # writes stub page.tsx files into src/app
npm run gen:svg     # regenerates docs/sitemap-diagram.svg
```

Hand-authored routes are listed in `src/data/pages/index.ts` (`authoredRoutes`).
The generator skips those files — edit them directly.

### Page content & templates

Approved copy lives in typed data files under `src/data/pages/`:

| File | Template component | Page type |
|---|---|---|
| `products.ts` | `ProductPage` | Insurance products (MetLife, Bupa, …) |
| `features.ts` | `FeaturePage` | Solutions / platform features |
| `audience.ts` | `AudiencePage` | Who-we-help audience pages |
| `editorial.ts` | `EditorialPage` | About, careers, etc. |

Each template renders the page as a vertical stack of labelled section blocks
(`SectionBlock`) — Hero, stats, explainer, FAQ, CTA, and so on. Shared section
primitives live in `src/components/section/shared.tsx`. This is deliberate:

- it matches how real pages will be **composed from swappable sections**, and
- it keeps content and presentation separate, so copy can be updated by editing a data
  file directly — no component changes needed — which suits the human-writes-the-brief,
  Claude-edits-the-code workflow this project uses instead of a CMS.

Replace blocks with polished section components as wireframing progresses. Because
pages are already section-based, approved copy can land **section by section**
without rebuilding the page.

**Build status (27 routes in `sitemap.ts` + `/sitemap` overview):**

- **Home** — full bespoke layout (`HomePage`, hero, ecosystem stats, product showcase, pillars, trusted-by)
- **14 content pages** — data-driven templates with real copy
- **12 stubs** — auto-generated `PageStub` placeholders (copy not yet built)
- **`/sitemap`** — hand-authored IA overview

Five section-hub landings (`/products`, `/who-we-help`, etc.) are in the agreed IA but not
routed yet — see `docs/SITEMAP.md`.

### Design tokens

Semantic design tokens are defined in `design-tokens/tokens.json` and compiled to
CSS custom properties in `design-tokens/theme.css` (imported via `globals.css`).
See `docs/specs/design-tokens-spec.md` for the full token architecture and naming.

## Dev labs

Internal sandbox routes for experimenting with 3D and motion — not part of the IA:

| Route | Purpose |
|---|---|
| `/coin-lab` | YuCoin material/lighting tuning |
| `/star-lab` | Yunity star 3D scene |
| `/coin-demo` | Standalone coin demo |

See `src/components/yucoin/README.md` for YuCoin usage patterns.

## Layout

```
src/
  app/                         ← Next.js App Router (one page.tsx per route)
  components/
    hero/                      ← homepage hero, coin field, logo marquee
    home/                      ← homepage sections (pillars, trusted-by, rocket CTA, …)
    nav/                       ← mega-menu, mobile nav
    section/                   ← SectionBlock + shared section primitives
    stats/  ecosystem/  ui/
    yucoin/  star/             ← 3D assets (R3F)
    HomePage.tsx               ← home page composition
    ProductPage.tsx            ← product template
    FeaturePage.tsx            ← solutions / feature template
    AudiencePage.tsx           ← audience template
    EditorialPage.tsx          ← editorial template
    PageStub.tsx               ← placeholder for un-built pages
  data/
    sitemap.ts                 ← IA single source of truth
    home-content.ts            ← homepage copy & config
    pages/                     ← typed page content (products, features, …)
  fonts/                       ← Berlingske Serif, Lota Grotesque
design-tokens/
  tokens.json                  ← Figma-aligned design tokens
  theme.css                    ← CSS custom properties
scripts/
  generate-pages.mjs           ← npm run gen:pages
  generate-sitemap-svg.mjs     ← npm run gen:svg
  optimize-platform-videos.mjs
docs/
  SITEMAP.md                   ← page inventory + IA reconciliation notes
  sitemap-diagram.svg          ← visual sitemap
  specs/                       ← content, nav, design-token specs
  audits/                      ← conversion & UX audits
public/
  home/                        ← homepage imagery & platform videos
  logos/marquee/               ← client logo SVGs
```

## Deployment

Pushes to `main` trigger a GitHub Actions workflow (`.github/workflows/deploy.yml`)
that runs `npm run build` with `GITHUB_PAGES=true` and publishes the static `out/`
directory to GitHub Pages at `/yulife-website`.

Local dev serves from `/`; production on GitHub Pages uses the `/yulife-website`
base path (configured in `next.config.ts`).

## Docs

- **`docs/SITEMAP.md`** — full page inventory, copy status, and open IA decisions
- **`docs/specs/content-spec.md`** — section-by-section content & layout brief
- **`docs/specs/nav-mega-menu-spec.md`** — navigation mega-menu behaviour
- **`docs/specs/design-tokens-spec.md`** — token architecture and naming
