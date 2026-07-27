---
name: find
description: Locate the source for something visible on the YuLife site — a section, heading, button, card, spacing, animation, or piece of copy — without grepping the tree or dumping the accessibility tree. Use whenever the user points at the rendered page ("the Trusted carousel headline", "the gap under the hero", "the platform tabs", "that stat row") and you need the file and line before editing. Also use before any edit to an unfamiliar section of this codebase.
---

# Find source for a rendered thing

Resolve rendered UI → `file:line` in as few tokens as possible. Work the ladder in
order and **stop at the first rung that answers the question** — most requests are
answered by rungs 1–2 without opening the browser.

## Rung 1 — Is it copy?

If the user is changing words, numbers, or a link target, it is almost never in a
component. Go straight to the data file:

- Homepage → `src/data/home-content.ts`
- A `/products/*`, `/solutions/*`, `/who-we-help/*`, `/about/*` page → the data file
  named for that route in §2 of [docs/CODE_MAP.md](../../../docs/CODE_MAP.md)
- Nav / mega-menu → `src/components/nav/menuContent.ts`

Grep the data file for a distinctive phrase from the user's request. Done.

## Rung 2 — Read the map

Open [docs/CODE_MAP.md](../../../docs/CODE_MAP.md) and use:

- **§2 Routes** — which template and data file a route uses
- **§3 DOM index** — `data-src` name → `file:line`
- **§4 File index** — internal landmarks for files over 120 lines, so you can
  `Read` with `offset`/`limit` instead of pulling in 800 lines

If the user named something recognisable ("the hero headline", "the platform tabs",
"the join-mission card"), §3 resolves it directly. Read only the range you need.

If the map looks stale — a name in it does not exist, or a component the user
mentions is absent — run `npm run gen:map` and re-read it.

## Rung 3 — Ask the page

Only when the user's description does not map to a name you can find. Stamps are
dev-only, so this rung needs the dev server — start the preview (`preview_start`
with `yulife-website`), then get the outline in source terms:

```js
[...document.querySelectorAll("[data-src]")].map(e=>e.dataset.src+(e.dataset.blockLabel?" — "+e.dataset.blockLabel:""))
```

That is the whole page structure for a few hundred tokens. Match the user's
description to a stamp name, then go back to rung 2 to resolve it.

To narrow within a block, query inside it rather than reading the tree:

```js
document.querySelector('[data-src="TrustedSection"]').outerHTML.slice(0, 1200)
```

**Do not call `read_page` on this site.** It is a Tailwind + GSAP + R3F page and the
accessibility tree is mostly structural `div`s with no identity — it costs a great
deal and tells you less than the outline dump.

## Rung 4 — Then grep

If none of the above worked, grep, but grep narrowly. Prefer a distinctive Tailwind
class or a token name (`type-heading-h2`, `gap-flow`, `line-emphasis`) over a common
word, and scope to the directory §2 pointed at.

## After you edit

If you added or moved a section root, stamp it by spreading the dev-only helper —
component name only, never a line number, so it survives edits:

```tsx
import { domSrc } from "@/lib/domSrc";
<section {...domSrc("MyNewSection")} className="...">
```

Then run:

```bash
npm run gen:map
```

## Report back

Give the user the `file:line` as a clickable link and say which rung answered it, so
they learn where the index is thin. If a stamp was missing for something they
pointed at, say so — that is a gap worth filling.
