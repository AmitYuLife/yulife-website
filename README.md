# YuLife 2026 Website — Wireframe Skeleton

Low-fidelity wireframe skeleton for the website redesign. **Next.js + Tailwind**,
structured so **React Bricks** can be the headless CMS in the build proper.
Every page in the agreed IA exists as a real route with a placeholder wireframe
and a copy-status marker.

> Phase: IA / wireframing. Styling is deliberately **greyscale** — visual design
> comes later. Don't read look-and-feel into this yet.

## Run it

```bash
npm install
npm run dev        # local dev server (http://localhost:3000)
npm run build      # production build
npm run start      # serve production build
```

## How it's wired

**One source of truth: `src/data/sitemap.ts`.** It defines every nav group,
page, route, purpose and copy status. From it we drive:

- the header & footer nav (`src/components/Header.tsx`, `Footer.tsx`)
- the home page and the in-site IA overview at **`/sitemap`**
- every page stub (generated — see below)
- the diagram at `docs/sitemap-diagram.svg`

To add, rename or remove a page, **edit `sitemap.ts` and re-run the generators:**

```bash
npm run gen:pages   # writes one page.tsx per route into src/app
npm run gen:svg     # regenerates docs/sitemap-diagram.svg
```

## Pages are stacks of sections ("bricks")

Each stub (`src/components/PageStub.tsx`) renders the page as a vertical stack
of labelled section blocks — Hero, Content, Stats/Proof, CTA. This is on purpose:

- it matches how the real pages will be **composed from swappable sections**, and
- it maps **1:1 onto React Bricks** "bricks" when the CMS goes in.

Replace blocks with real section components as wireframing progresses. Because
pages are already section-based, approved copy can land **section by section**
without rebuilding the page.

## Layout

```
src/
  data/sitemap.ts              ← single source of truth
  app/
    layout.tsx                 ← root layout (header, footer, metadata)
    globals.css
    page.tsx                   ← home (hand-authored)
    sitemap/page.tsx           ← IA overview (hand-authored)
    products/  who-we-help/  resources/  about/  solutions/  contact/
  components/
    Header.tsx  Footer.tsx
    PageStub.tsx               ← the low-fi wireframe ("bricks")
scripts/
  generate-pages.mjs           ← npm run gen:pages
  generate-sitemap-svg.mjs     ← npm run gen:svg
docs/
  SITEMAP.md                   ← page inventory + IA reconciliation notes
  sitemap-diagram.svg          ← visual sitemap
```

See **`docs/SITEMAP.md`** for the full page inventory, copy-status, and the open
IA decisions (naming, the Reward & Recognition orphan, under-consideration pages).
