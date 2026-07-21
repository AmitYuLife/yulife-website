# YuLife Website — Design Token Specification

**File:** YuLife Website Refresh 2026 (`PZs2ZaR8I3fShBqvAZxC7U`)
**Source of truth:** Home page (node `1681-385`, 1920×9271)
**Status:** Draft for approval — v1, 19 Jul 2026 · naming revised 20 Jul 2026 (see §12)
**Basis:** Programmatic audit of all 761 nodes on the Home page + Brand / Foundations library contents.

---

## 1. Architecture

```
Brand / Foundations (library — already exists, colour only)
└── Primitives ............ 80 colour vars (Colours/Purple/100–900, Neutral, Green, Blue, Yellow, …)

YuLife Website Refresh 2026 (this file — everything below is NEW)
├── Web Primitives ........ mode-less: space, radius, border-width, font-weight, font-family
├── Colour ................ semantic, 1 mode (Light) — aliases Brand/Foundations primitives
├── Typography ............ 4 modes: Desktop XL / Desktop / Tablet / Mobile
├── Layout ................ 4 modes: Desktop XL / Desktop / Tablet / Mobile
└── Text styles ........... 1 style per role, bound to Typography vars → responsive via frame mode
```

Rules:

- Semantic tokens **always alias** a primitive — never a raw hex/number.
- Component-level values (card padding, chip gap) use mode-less Web Primitives directly; only **layout-level** spacing is responsive.
- Figma allows one mode axis per collection, hence Typography and Layout are separate collections sharing identical mode names. 4 modes requires Org plan — you're on it. ✓

### Audit findings this spec must resolve

| Finding | Action |
|---|---|
| 0 local variable collections exist (June sets deleted) | Clean slate — build below |
| Canvas bindings to dead vars (`heading/h1/size`, `text/on-primary`, `surface/light`, `font-weight/*`, `body/lg/*`) | Recreate under same-or-new names, rebind |
| Legacy product-DS values still bound/painted: `#5C5757` (Ink/Base, 11 fills), `#464647`, `#5A5A5C`, `#D9D9D7` (10 uses), `#F5F5F5` (7), `#E30D76` | Remap to Neutral primitives via semantic tokens |
| Bariol text (18 nodes) | All inside app-mockup visuals — **exclude from tokenisation** (they're product screenshots, not web copy) |
| ~35 gradients, 11 images, dozens of illustration one-off hexes | Excluded — see §8 |

---

## 2. Breakpoints & modes

| Mode | Range | Design canvas | Container behaviour |
|---|---|---|---|
| **Desktop XL** | ≥ 1920px | 1920 | 1216px container, centred (352px margins at 1920) |
| **Desktop** | 1280–1919px | 1440 | 1216px container, centred (112px margins at 1440) |
| **Tablet** | 768–1279px | 768 | Fluid, 40px page margin |
| **Mobile** | < 768px | 375 | Fluid, 20px page margin |

The audited container is **1216px** everywhere on the page (nav inner, hero content, all section content). It fits inside 1440 untouched, so XL→Desktop only changes type scale and section rhythm, not the grid.

**CSS translation** — one custom-property set per mode, swapped at media queries:

```css
:root            { --display-hero-size: 44px;  --layout-section-y: 64px;  } /* Mobile */
@media (min-width: 768px)  { --display-hero-size: 64px;  --layout-section-y: 96px;  } /* Tablet */
@media (min-width: 1280px) { --display-hero-size: 96px;  --layout-section-y: 128px; } /* Desktop */
@media (min-width: 1920px) { --display-hero-size: 120px; --layout-section-y: 160px; } /* Desktop XL */
```

Optionally wrap sizes in `clamp()` between anchors in the build; the tokens stay the anchor values either way.

---

## 3. Web Primitives (mode-less)

### 3.1 Space
Audited values on the page: 0, 4, 8, 16, 24, 32, 40, 48, 64, 72, 80, 120, 160, 200, 304, 352. Proposed scale (t-shirt-free, numeric = px):

`space/0, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120, 160, 200, 240, 320`

- `12` and `96` added for completeness (common gaps you'll hit in components).
- 72 appears once (SliderControls gap) → snap to 80. 304 and 352 are derived layout values, not primitives (see §6).
- Scopes: `GAP`, `WIDTH_HEIGHT`, plus padding.

### 3.2 Radius
Audited: 8, 16, 24, 32, 64 + pill shapes.

`radius/sm: 8` · `radius/md: 16` · `radius/lg: 24` · `radius/xl: 32` · `radius/2xl: 64` · `radius/full: 999`

(Fractional radii found — 47.7, 45.9, 35.7, 117, 21.8 — are all inside mockup/illustration assets; excluded.)

### 3.3 Border width
`border-width/thin: 1` · `border-width/thick: 2`

### 3.4 Font weight & family
`font-weight/regular: 400` · `font-weight/bold: 700`
`font-family/serif: "Berlingske Serif"` · `font-family/sans: "Lota Grotesque"`

> Shipping fonts (licences confirmed by Amit, 19 Jul): **Berlingske Serif Bold + Bold Italic** (Bold Italic used in mixed-style hero/heading spans — e.g. "inspires *life*"); **Lota Grotesque Regular + Bold** (no Medium/Semi Bold). All four must be in the `loadFontAsync` list for every text operation, and Bold Italic must ship in the webfont kit.

---

## 4. Colour (semantic, aliases Brand / Foundations)

One mode for now (`Light`). If a dark theme ever ships, it's a second mode on this collection — the structure is ready.

### 4.1 Text
> **Resolved 19 Jul:** all dark greys (`#5C5757`, `#464647`, `#5A5A5C`, `#37393B`, `#AAAABF`) verified as app-mockup content (`Mood monitor` asset) — excluded. Website text is purple/white only.

| Token | Alias | Resolved | Usage |
|---|---|---|---|
| `text/default` | Purple/900 | `#290163` | headings/body on light surfaces (exact 900-vs-800 split confirmed at rebind) |
| `text/emphasis` | Purple/800 | `#340080` | purple headings/emphasis on light |
| `text/on-inverse` | Neutral/White | `#FFFFFF` | all text on inverse (dark purple) surfaces |
| `text/on-inverse-muted` | Purple/700 (`#6953F3`, snapped from `#5136C2` — §9 Q2) | | inactive tab labels on inverse surface |
| `text/on-accent` | Purple/900 | `#290163` | text on green/yellow chips |

### 4.2 Surface
| Token | Alias | Resolved | Usage |
|---|---|---|---|
| `surface/default` | Neutral/White | `#FFFFFF` | light sections, cards |
| `surface/subtle` | Neutral/50 or 100 | ~`#F5F5F5` | tinted panels, stat tiles |
| `surface/inverse` | Purple/900 | `#290163` | dark purple sections (hero, intro, CTA) |
| `surface/inverse-raised` | Purple/800 | `#340080` | cards on inverse surface |
| `surface/accent-purple` | Purple/500 | `#C7B4FD` | decorative panels (6 uses, already bound) |
| `surface/accent-green` | Green/600 | `#00ED9D` | accent chips |
| `surface/accent-yellow` | Yellow/600 | `#FFD600` | accent chips |
| `surface/accent-blue` | Blue/600 | `#00C0F3` | accent chips |

### 4.3 Border
| Token | Alias | Usage |
|---|---|---|
| `border/default` | Neutral/300 (`#E3E3E1`) | card/divider strokes; replaces `#D9D9D7` (10 uses) |
| `border/inverse` | Neutral/White @ 40% | dividers on inverse surface (4 uses of `#FFFFFF @40%`) |
| `border/emphasis` | Purple/700 (`#6953F3`, snapped from `#5136C2` — §9 Q2) | section grid lines, slider-card borders, tab underlines (39 strokes — the signature line work) |

### 4.4 Action
| Token | Alias | Usage |
|---|---|---|
| `action/primary/bg` | Neutral/White | pill buttons on inverse surface |
| `action/primary/text` | Purple/900 | button label |
| `action/primary/bg-hover` | **not designed** — proposal: Purple/100 | §9 |
| `action/secondary/border` | Neutral/White | outline button on inverse |
| `action/focus-ring` | Blue/600 | keyboard focus — **not designed**, required for WCAG |

### 4.5 Unmatched hexes — resolved 19 Jul
- `#733AFF`, `#8B63FF`, `#B297FF` — inside assets, **excluded** (confirmed by Amit).
- `#AAAABF` — app-mockup content, **excluded** (verified programmatically).
- `#5136C2` — **genuine UI** (verified: 39 strokes on section grid lines/slider borders + inactive tab label fills). No close Brand primitive exists — nearest is `Purple/700 #6953F3`, visibly brighter. Decision pending (§9 Q2).

---

## 5. Typography — 4 modes

16 roles below × 5 properties each (`family`, `weight`, `size`, `line-height`, `letter-spacing`) = 80 variables. Values audited at 1920 (XL column is ground truth from the design); Desktop/Tablet/Mobile are **proposed ramps** for your sign-off.

| Role | Font | XL (1920) | Desktop (1440) | Tablet (768) | Mobile (375) |
|---|---|---|---|---|---|
| `display/hero` | Serif Bold | **120 / 104** | 96 / 88 | 64 / 60 | 44 / 44 |
| `display/number` | Serif Bold | **120 / 120** | 96 / 96 | 72 / 72 | 56 / 56 |
| `heading/h2` | Serif Bold | **80 / 72** | 64 / 60 | 48 / 48 | 36 / 38 |
| `heading/h3` † | Serif Bold | 48 / 52 | 40 / 44 | 32 / 36 | 28 / 32 |
| `heading/h4` † | Sans Bold | 32 / 40 | 28 / 36 | 24 / 32 | 22 / 28 |
| `heading/h5` | Sans Bold | **24 / 32** | 24 / 32 | 20 / 28 | 18 / 26 |
| `body/lg` | Sans Regular | **24 / 32** | 24 / 32 | 20 / 28 | 18 / 26 |
| `body/md` † | Sans Regular | 18 / 28 | 18 / 28 | 16 / 24 | 16 / 24 |
| `body/sm` † | Sans Regular | 16 / 24 | 16 / 24 | 14 / 20 | 14 / 20 |
| `eyebrow` | Sans Regular | **20 / 24** | 18 / 24 | 16 / 20 | 14 / 18 |
| `label` | Sans Bold | **20 / 24** | 18 / 24 | 16 / 20 | 16 / 20 |
| `nav/link` | Sans Bold | **16 / 24** | 16 / 24 | 16 / 24 | 16 / 24 |
| `button/lg` | Sans Bold | **24 / 32** | 20 / 28 | 18 / 24 | 18 / 24 |
| `button/md` | Sans Bold | 16 / 24 | 16 / 24 | 16 / 24 | 16 / 24 |
| `caption` † | Sans Regular | 14 / 20 | 14 / 20 | 13 / 18 | 12 / 16 |
| `quote` † | Serif Bold | 40 / 48 | 32 / 40 | 28 / 36 | 24 / 32 |

**Bold** = value measured on the Home page. † = role not present on Home but the site will need it (product pages, blog, legal) — proposed now so the ramp is complete before build.

Letter-spacing is 0 across the design; tokens created anyway (set to 0) so code has the hook. Recommend +2% on `eyebrow` (it's all-caps at 20px Regular) — flagged, not applied.

**Text styles:** one Figma text style per role, every property bound to the Typography variables. A frame pinned to a mode renders the whole subtree responsively — same behaviour as the June system.

Notes from audit:
- `display/hero` 120/104 and `heading/h2` 80/72 have sub-100% leading — intentional tight serif display; preserved.
- The two `24/32` sans styles (Bold ×19, Regular ×11) split into `heading/h5`/`button/lg` (Bold) and `body/lg` (Regular) by usage.
- 11 text nodes have mixed styling (inline colour spans like "inspires *life*") — these keep the role style with character-level colour overrides bound to Colour tokens.

---

## 6. Layout — 4 modes

| Token | XL | Desktop | Tablet | Mobile | Audited evidence |
|---|---|---|---|---|---|
| `layout/container-max` | 1216 | 1216 | — (fluid) | — (fluid) | every content block = 1216 |
| `layout/page-margin` | 80 | 80 | 40 | 20 | min inline padding when container can't centre |
| `layout/section-y` | 160 | 128 | 96 | 64 | 160 dominant (12 uses) |
| `layout/section-y-lg` | 200 | 160 | 120 | 80 | hero top pad 200 |
| `layout/section-gap-xl` | 120 | 96 | 72 | 56 | intro/yunity internal gap 120 |
| `layout/section-gap` | 80 | 64 | 48 | 40 | most sections' internal gap |
| `layout/block-gap` | 48 | 40 | 32 | 24 | hero content gap 48, block gap 40 |
| `layout/grid-gutter` | 32 | 32 | 24 | 16 | card grids |
| `layout/breakout-max` | 1568 | 1440 | — | — | Slider bleed width 1568 |

- The 352px section side-padding on the canvas is **derived** (= (1920 − 1216) / 2), not a token. In code: container `max-width` + auto margins + `page-margin` padding. In Figma: keep the padding but bind nothing, or bind to a convenience `layout/section-x` var per mode (352 / 112 / 40 / 20) — I recommend the convenience var so Figma frames stay honest per mode. Included in build as `layout/section-x`.
- One section has 304 top padding (`1731:2441`) — reads as `section-y-lg` + overlap offset; treat as one-off, don't tokenise.
- Nav padding 196 → replace with the container pattern (nav inner is already 1216).
- Component-level gaps (0–40) bind to mode-less `space/*` primitives — they don't change per breakpoint.

**Grid (documentation, not variables):** 12 columns / 32 gutter (Desktop+), 8 / 24 (Tablet), 4 / 16 (Mobile).

---

## 7. Effects

One recurring shadow, created as an **effect style** (variables can't hold full shadows):

- `shadow/card` — drop shadow, x8 y8 blur 0 spread 0, `#000000 @ 8%` (10 uses — the offset "hard" card shadow).

Yellow `y1 #EDB720` shadows (8 uses) are part of the coin/award illustrations — excluded.

---

## 8. Exclusions (do not tokenise)

1. **App mockups** — phone screens incl. all 18 Bariol text nodes and their fractional radii/paddings. Treat each mockup as a placed asset.
2. **Illustrations** — rocket, giraffe, coins, decorative blobs: ~40 one-off hexes (`#FFEB80`, `#F46767`, `#52EFA3`, `#EA9E2F`, gold ramp `#C6880D` ×30, blues `#96CDFF`…). Vector art, not UI.
3. **Partner/client logos** — MetLife/Aviva/Bupa brand colours (`#0090DA`, `#0061A0`, `#A4CE4E`…). Never token candidates.
4. **Gradients (35)** — decorative; revisit only if a gradient becomes a repeated UI pattern (e.g. the hero glow).

This cuts the "89 colours" problem to ~20 semantic tokens over ~14 primitives.

---

## 9. Decisions log (resolved 19 Jul unless noted)

1. **Dark greys** — ✅ all verified as app-mockup content; excluded. Website text tokens are purple/white (§4.1).
2. **`#5136C2`** — ✅ **snap to `Purple/700 #6953F3`** (Amit, 19 Jul). `border/emphasis` and `text/on-inverse-muted` alias Purple/700; all 39 strokes + inactive tab labels rebind to it. ⚠ Visual check required after rebind — the line work will read brighter than the original. `#733AFF` excluded (asset); `#AAAABF` excluded (mockup).
3. **Interaction states** — deferred to component-build phase (Amit).
4. **Fonts** — licences held for all, including **Berlingske Serif Bold Italic** (§3.4).
5. **Proposed ramps** — approved as derived (Amit).
6. **Eyebrow letter-spacing** — keep 0, as designed (Amit).

---

## 10. Build order (once approved)

1. Create **Web Primitives** collection (space, radius, border-width, font-weight, font-family) — with explicit scopes.
2. Create **Colour** collection; import + alias Brand / Foundations primitives; resolve §9 Q1–Q2 mappings.
3. Create **Typography** collection, 4 modes, 80 vars; then 16 text styles bound to them. (All fonts in the file must be loaded before setting family/weight vars — known gotcha from June.)
4. Create **Layout** collection, 4 modes.
5. **Rebind the Home page**: dead June refs → new vars; legacy hex fills/strokes → semantic tokens; text nodes → text styles; section paddings/gaps → Layout vars; component gaps/radii → primitives. Pin Home frame to Desktop XL mode.
6. Create `shadow/card` effect style + apply.
7. Verify: screenshot diff before/after (must be pixel-identical), then flip a duplicate frame to Mobile mode as a smoke test.
8. Document on a `🎨 Design Tokens` page + publish the library.

Then you move to code: export via Figma Variables REST API → `tokens.json` (DTCG) → CSS custom properties / Tailwind theme. Naming maps 1:1: `display/hero/size` → `--display-hero-size`, `layout/section-y` → `--layout-section-y`.

---

## 11. Build log — executed 19 Jul 2026

| Step | Result |
|---|---|
| Web Primitives | ✅ 30 vars (17 space, 6 radius, 2 border-width, 2 family, 3 style — incl. `font-style/bold-italic`) |
| Colour | ✅ 19 semantic tokens aliasing 13 imported Brand primitives. `surface/subtle` → `Neutral/200` (exact `#F5F5F5` match) |
| Typography | ✅ 4 modes × 16 roles × 5 props = 80 vars; 16 text styles bound |
| Layout | ✅ 4 modes × 10 tokens |
| Rebind — colour | ✅ 135 paints bound. `#5136C2` → Purple/700 live. 6 one-off skips (asset contexts) |
| Rebind — text | ✅ 55 nodes styled (counts match audit exactly); dead June var refs cleared on styled nodes |
| Rebind — spacing/radii | ✅ 22 section + 121 component paddings, 61 gaps, 26 radii |
| Shadow/Card effect style | ✅ created + applied to all 10 matching nodes |
| Modes pinned | ✅ Home → Desktop XL (Typography + Layout) |
| Verification | ✅ Screenshot diff: layout identical, height unchanged (9271px); only expected change is Purple/700 line work. Mobile-mode smoke test on a temp clone: H2 80→36, section-y 160→64, section-x 352→20 ✓ (clone deleted) |

### Full-coverage pass — 19 Jul (per "everything mapped, even 0 values")
Additions: `radius/none: 0`; `text/accent-purple/green/blue/yellow` (coloured headline words); `surface/muted` → `Neutral/400` (exact `#D9D9D7`, carousel dots); **`heading/card` role + `Heading/Card` style** (Serif 64/56 → 56/48 → 44/40 → 36/32) — discovered on slider card titles, wasn't in the original ramp.

Bound in this pass: all zero paddings/gaps/radii; ~126 further spacing binds; 62 further radius binds; stroke weights → `border-width/thin`; all 11 mixed-span headlines styled per-range with italic (`Berlingske Bold Italic`) restored and span fills bound to accent tokens.

Off-scale values snapped to scale (visual shifts, eyeball these): 196→`space/200` (nav + CTA side pad, +4px), 72→`space/80` (slider controls gap, +8px), 304→`space/320` (Yunity section top pad, +16px), 186→`space/200` (intro stats gap, +14px).

**Known residue (documented, not bindable or pending classification):**
1. `#340080` tint on node `1735:5550` — lives in the same fills array as a VIDEO paint; Figma's plugin API cannot rewrite fills arrays containing video. Bind manually in the UI if wanted.
2. Nodes `1727:2239` (`#5A5A5C` text) and `1727:2210` (`#018547` chip, fractional 21.8 radius) — video-overlay app-UI content in the Pillars section; classified with the mockup exclusions.
3. ✅ 27 stroke-weight binds verified via per-side fields (`strokeTopWeight` etc. — Figma silently ignores `strokeWeight` binds on frames).
4. Gradients (35), images, video fills — not variable-bindable / decorative by design.
5. Excluded by earlier decisions: Mood monitor mockups, LogoMarquee, HeroAsset, AwardsRow, Rocket, partner logos, all VECTOR nodes.

### Remaining manual items
1. **Publish the library** (Figma UI — can't be done via API).
2. **Eyeball**: Purple/700 line work + the four snap shifts above.
3. **Tablet + Mobile page designs** — tokens switch correctly; reflow is design work still to do.

---

## 12. Naming revision — 20 Jul 2026

**Why:** "brand" was misleading — none of these tokens reference the YuLife brand colour; they all alias dark **Purple/700–900** primitives. Worse, "brand" was doing two unrelated jobs: (a) the dark-purple *surface* context and everything on it, and (b) *purple emphasis* text/line work on light surfaces. Split into two honest, appearance-neutral roles.

**Principle:** semantic tokens describe *role*, not hue. Two surface contexts — a default (light) context and an **inverse** (dark purple) context — with the base tier of every namespace named **`default`** for consistency. Text sitting *on* a non-default surface carries an explicit `on-…` prefix so the pairing is self-documenting.

**Rename map (apply in Figma + tokens.json + CSS):**

| Old | New | Notes |
|---|---|---|
| `text/primary` | `text/default` | base tier now `default` across all namespaces |
| `text/brand` | `text/emphasis` | purple heading emphasis on light |
| `text/inverse` | `text/on-inverse` | white text *on* inverse surface |
| `text/muted-on-brand` | `text/on-inverse-muted` | muted text on inverse |
| `text/on-accent` | `text/on-accent` | unchanged (already role-correct) |
| `surface/base` | `surface/default` | — |
| `surface/brand` | `surface/inverse` | Purple/900 dark context |
| `surface/brand-raised` | `surface/inverse-raised` | Purple/800 cards on inverse |
| `border/brand-line` | `border/emphasis` | the signature purple line work |
| `border/inverse` | `border/inverse` | unchanged (white divider on inverse) |
| `border/default` | `border/default` | unchanged |

Result — the base tier is `default` everywhere (`text/default`, `surface/default`, `border/default`); tone tiers are `subtle`/`muted`; prominence is `emphasis`; the dark context is `inverse` with `-raised` for elevation and `on-inverse` / `on-inverse-muted` for its foregrounds. `accent-*` (multi-colour chips/headline words) is unchanged.

**Deliberately kept:** the **`action/primary/*`** namespace — here "primary" denotes interactive *intent* (the primary button), not a colour tier, so it doesn't collide with the retired `text/primary`. The external **"Brand / Foundations"** primitive library keeps its name — it's the shared, cross-product source of truth; renaming it is out of scope and would ripple across other files.

**CSS/DTCG impact:** names still map 1:1 → `--surface-inverse`, `--text-on-inverse`, `--text-on-inverse-muted`, `--text-default`, `--border-emphasis`, etc. No build has consumed the old names yet, so this is a pure Figma-variable rename with no code migration debt.

**Execution status:** spec updated. Figma variable rename pending — the Figma connector isn't authorized in this session. Renaming variables (not their bindings) is non-destructive: bound nodes keep their values, so this can be done safely in a single pass once connected. *(Update: rename executed in Figma + code — see §12 build state and §13.)*

---

## 13. Gap system — semantic & responsive (20 Jul 2026)

**Problem found (audit of Home, 357 nodes / 83 auto-layout frames / 55 real gaps):** only 5 gaps were semantic (`layout/section-gap*`). The other 50 were raw mode-less `space/*` primitives or unbound — so every element/content gap stayed desktop-sized on mobile. Also two inconsistencies: the 80px section gap was bound to `layout/section-gap` in some sections but to raw `space/80` in `ProtectSection`/`TabContent`; the 32px card gutter used `space/32` instead of `layout/grid-gutter`.

**Fix:** a responsive, **role-based** gap set (scope `GAP`) living in the **Layout collection** (4 modes) alongside the structural layout tokens. XL values equal the old primitives, so the Desktop-XL design is pixel-identical; ramps only bite at smaller breakpoints. *(Prototyped in a separate `Gap` collection first, then consolidated into `Layout` — 20 Jul.)*

| Token | XL | Desktop | Tablet | Mobile | Role |
|---|---|---|---|---|---|
| `gap/none` | 0 | 0 | 0 | 0 | flush stacks (tabs, self-padded sections) |
| `gap/inline` | 8 | 8 | 8 | 8 | icon ↔ label inside a control/badge |
| `gap/related` | 16 | 16 | 12 | 12 | eyebrow → heading, stat number → label |
| `gap/stack` | 24 | 24 | 20 | 16 | default content / nav grouping |
| `gap/controls` | 32 | 28 | 24 | 20 | button / action rows |
| `gap/flow` | 40 | 32 | 28 | 24 | heading → body, stacked content blocks |
| `gap/group` | 64 | 48 | 40 | 32 | columns / logos / trust badges in a row |
| `gap/split` | 200 | 128 | 80 | 48 | two-column editorial gutter (ProtectSection intro) |

Names are **role-based, not a t-shirt scale** (a size scale like `gap/sm` just renames a primitive — it says how big, not what for). Ramps are derived proposals (same status as the type/layout ramps) — eyeball and adjust. **Context cleanup (done 20 Jul):** re-audited every gap by its neighbouring text styles. Two eyebrow-led frames had landed on `gap/controls` purely by size (an eyebrow→heading and an eyebrow→logo-bar, both 32px) — rebound to `gap/related` (→16, matching all other eyebrow spacing). `gap/controls` is now used only by the true CTA button row. Remaining borderline calls left as-is (defensible, flagged for optional future work): horizontal control clusters (nav `MainItems`/`RightItems`, `SliderControls`) sit on `gap/stack` (24) rather than `gap/controls` (32); three tight stat number→label pairs sit on `gap/none` (0).

**Rebind executed:** 48 Home gaps rebound — `space/0→gap/none` (7), `space/8→gap/inline` (9), `space/16→gap/related` (5), `space/24→gap/stack` (12), `space/32→gap/controls` (3) with the card carousel → `layout/grid-gutter` (1), `space/40→gap/flow` (6), `space/64→gap/group` (3), and the two stray `space/80→layout/section-gap` (2). The `ProtectSection` 200px column gutter → `gap/split`. Card gutter and section-gap strays are now consistent. **Outliers resolved (20 Jul):** `HeaderInner` was already `space-between` (the 160 was an ignored leftover — zeroed). `ProtectSection > Tabs` turned out to be a genuine two-column editorial block (594 heading + gutter + fill body = 1216), not a push-apart — so its 200px gutter is now the semantic `gap/2xl`. No primitive gaps remain on the page.

**Code:** gap tokens export to `--gap-*` responsive custom properties (mobile-first `:root` + the 3 breakpoint media queries) and register in Tailwind's spacing namespace as t-shirt keys, giving responsive role-based utilities **`gap-inline`, `gap-related`, `gap-stack`, `gap-controls`, `gap-flow`, `gap-group`, `gap-split`** (also `p-*`/`m-*` if wanted). The fixed numeric primitives (`p-16`, `gap-16`) remain for one-off component padding. Reflected in `design-tokens/theme.css` + `design-tokens/tokens.json` (a `gap` group with per-mode `$extensions`).
