# Nav Mega Menu — Component Build Spec

> **Purpose:** A single, self-contained spec for a coding LLM to build the YuLife primary navigation + mega-menu accurately.
> **Source:** Figma — YuLife Website Design System, node `2005:3463` (`NavMegaMenu` section).
> **Stack assumption:** React + design-token CSS variables. A `Button` component already exists at `@/components/ui/Button` (Code Connect–mapped in Figma) and MUST be reused — do not hand-write button markup.

Legend used throughout: **[FACT]** = read directly from Figma · **[ASSUMPTION]** = inferred, confirm before relying · **[GAP]** = missing from Figma, needs a decision.

---

## 1. What this component is

A desktop top navigation bar (dark pill) with a mega-menu dropdown that expands beneath it. The whole thing lives inside one rounded, bordered container: the dark bar sits on top, and the light dropdown panel expands below it within the same container.

Two states:

- **Collapsed** — just the top bar (height 72px).
- **Expanded** — top bar + dropdown panel (`expanded` prop drives this).

Only **one** dropdown's content is designed in Figma (a Products-style menu with an "INSURANCE" links column and a "PLATFORM" CTA column). The other triggers (Who we help, Resources, About) reuse the same structure with different content — see §7.

---

## 2. Component tree

```
NavMegaMenu (root)                     [prop: expanded]
├── NavMenuTop (dark bar, always shown)
│   ├── Logo
│   └── NavigationMenu
│       ├── MainItems           → Button ×4  (Products, Who we help, Resources, About)
│       │                          size=sm variant=solid theme=onLight trailingIcon
│       └── RightItems
│           ├── Button  (Log in) size=sm variant=outline theme=onDark trailingIcon
│           └── Button  (Speak to our team) size=sm variant=solid theme=onDark
│
└── NavMenuDrop (dropdown panel, shown when expanded)   [flex row, justify-between]
    ├── MenuDropCol  property1="Default"    ← links column(s)
    │   ├── Label ("INSURANCE")
    │   └── InnerGrid
    │       └── InnerCol × N
    │           └── ColSlot
    │               └── MenuItemLink × N   (title + description)
    │
    └── MenuDropCol  property1="Variant2"   ← highlight / CTA column
        ├── Label ("PLATFORM")
        └── InnerGrid
            └── InnerCol
                └── ColSlot
                    ├── MenuItemLink × N
                    └── Button ("Speak to our team")
```

---

## 3. Design tokens

Use these tokens (Figma variables). Never hard-code the raw hex — reference the token names in your styling system.

### Colour

| Token | Value | Used for |
|---|---|---|
| `surface/default` | `#ffffff` | Root + dropdown + Default column background |
| `surface/inverse` | `#290163` | Dark top bar; in-menu CTA button bg |
| `surface/accent-purple` | `#c7b4fd` | Column label text (e.g. "INSURANCE") |
| `colours/neutral/50` | `#fafafe` | Variant2 (highlight) column background |
| `text/default` | `#290163` | Menu item description text |
| `text/on-inverse` | `#ffffff` | Text on dark surfaces |
| `text/on-inverse-muted` | `#6953f3` | Menu item **title** text |
| `action/primary/bg` | `#ffffff` | Button primary bg (token ref) |
| `action/primary/text` | `#290163` | Button primary text (token ref) |
| `action/secondary/border` | `#ffffff` | Button outline border (token ref) |
| Border colour | `rgba(105, 83, 243, 0.4)` | All container borders (purple @ 40%) — **[GAP]** no named token; see §8 |

### Spacing / gap

| Token | px | | Token | px |
|---|---|---|---|---|
| `space/0` | 0 | | `gap/inline` | 8 |
| `space/8` | 8 | | `gap/related` | 16 |
| `space/16` | 16 | | `gap/stack` | 24 |
| `space/32` | 32 | | `gap/flow` | 40 |
| `space/64` | 64 | | | |

### Radius

| Token | px |
|---|---|
| `radius/none` | 0 |
| `radius/sm` | 8 |
| `radius/md` | 16 |

### Border width

| Token | px |
|---|---|
| `border-width/thin` | 1 |

### Typography

| Style | Family | Weight | Size | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| `Nav/Link` | Lota Grotesque | Bold (700) | 16px | 24px | 0 |
| `Caption` | Lota Grotesque | Regular (400) | 14px | 20px | 0 |

---

## 4. Component specs

### 4.1 `NavMegaMenu` (root — `2005:2566`)

| Property | Value |
|---|---|
| Props | `expanded?: boolean` (default `false`) |
| Width | `1216px` **[FACT]** (fixed in Figma — treat as max-width container, see §6) |
| Background | `surface/default` |
| Border | `1px solid rgba(105,83,243,0.4)` |
| Radius | `radius/md` (16) |
| Layout | `flex column`, `items-center`, padding `space/0` |
| Children | `NavMenuTop` (always); `NavMenuDrop` (only when `expanded`) |

**Note [FACT]:** `NavMenuTop` is absolutely positioned at `top:-1px, left:-1px` and `NavMenuDrop` uses `padding-top: space/64 (64px)`. The dropdown panel therefore renders *inside* the same rounded container, tucked behind the 72px top bar so the bar's rounded corners and the panel's line up. Preserve this layering.

### 4.2 `NavMenuTop` (dark bar — `2005:1893`, symbol `2005:2564`)

| Property | Value |
|---|---|
| Width | `1216px` |
| Background | `surface/inverse` (#290163) |
| Border | `1px solid rgba(105,83,243,0.4)` |
| Radius | `radius/md` (16) |
| Padding | `space/16` (16px all round) |
| Layout | `flex row`, `items-center`, `justify-between` |
| Height | 72px (with padding) |
| Children | `Logo`, `NavigationMenu` |

- **Logo** (`2005:1894`): 76×40px, contains the yulife logo image. Left-aligned.
- **NavigationMenu** (`2005:1895`): `flex row`, `items-center`, `gap/flow` (40) between MainItems and RightItems.
  - **MainItems** (`2005:1896`): `flex row`, `gap/inline` (8). Four nav Buttons.
  - **RightItems** (`2005:1901`): `flex row`, `gap/related` (16). Two Buttons.

**Buttons in the top bar** (reuse `@/components/ui/Button`):

| Label | size | variant | theme | trailingIcon | Notes |
|---|---|---|---|---|---|
| Products | sm | solid | onLight | yes (chevron ▾) | opens mega menu |
| Who we help | sm | solid | onLight | yes (chevron ▾) | opens mega menu |
| Resources | sm | solid | onLight | yes (chevron ▾) | opens mega menu |
| About | sm | solid | onLight | yes (chevron ▾) | opens mega menu |
| Log in | sm | outline | onDark | yes | external link/action |
| Speak to our team | sm | solid | onDark | no | primary CTA |

> Button rule (from Code Connect): pass `href` for navigation CTAs (renders `next/link`), or `onClick` for actions (renders `<button>`). `trailingIcon` renders the chevron. Keep design-token classes — no raw hex or Tailwind colour literals.
> **[ASSUMPTION]** The four MainItems buttons appear visually light-on-dark despite `theme=onLight`; verify the Button component's `onLight`/`onDark` semantics against the top bar's dark background during build.

### 4.3 `NavMenuDrop` (dropdown panel — `2005:2565`, instance `2005:2742`)

| Property | Value |
|---|---|
| Width | `1216px` |
| Background | `surface/default` (white) |
| Border | `1px solid rgba(105,83,243,0.4)` |
| Radius | `radius/md` (16) |
| Padding | top `space/64` (64), sides/bottom `space/0` |
| Layout | `flex row`, `items-start`, `justify-between`, `overflow: clip` |
| Children | 1..N `MenuDropCol` |

### 4.4 `MenuDropCol` (menu column — Default `2005:2369` / Variant2 `2005:3331`)

| Property | Value |
|---|---|
| Props | `property1: "Default" \| "Variant2"` (default `"Default"`) |
| Width | `409px` **[FACT]** (per column; distribute across panel — see §6) |
| Border | left + right `1px solid rgba(105,83,243,0.4)` (no top/bottom) |
| Padding | `space/32` (32px) |
| Layout | `flex column`, `gap/stack` (24), `items-start`, `overflow: clip` |
| Children | Label (Caption text) + `InnerGrid` |

| Variant | Background | Intended use |
|---|---|---|
| `Default` | `surface/default` (#ffffff) | Standard column of navigable links |
| `Variant2` | `colours/neutral/50` (#fafafe) | Highlight / CTA panel (holds a Button) |

- **Label**: Caption style, colour `surface/accent-purple` (#c7b4fd), typically uppercase (e.g. "INSURANCE", "PLATFORM"). **[ASSUMPTION]** uppercasing is via content, not a text-transform — confirm.
- **InnerGrid** (`2005:2337`): `flex row`, `gap/related` (16), holds 1..N `InnerCol`.

### 4.5 `InnerCol` (`2005:2777`) + `ColSlot` (`2005:2778`)

| Property | Value |
|---|---|
| InnerCol layout | `flex column`, `flex:1 0 0`, `min-width:0` (grows to fill grid) |
| InnerCol natural size | 272×223px **[FACT]** (design reference; real width is flex) |
| ColSlot layout | `flex column`, `gap` 24, `items-start`, full width |
| ColSlot children | 1..N `MenuItemLink` (and optionally a `Button` in Variant2) |

`ColSlot` is a pure content slot — it holds the repeated menu items. Treat it as `children`.

### 4.6 `MenuItemLink` (`2005:2607` etc.)

The atomic link. Two stacked text lines.

| Property | Value |
|---|---|
| Layout | `flex column`, `gap/inline` (8), `items-start`, padding `space/0`, full width |
| Line 1 — **title** | `Nav/Link` style, colour `text/on-inverse-muted` (#6953f3) |
| Line 2 — **description** | `Caption` style, colour `text/default` (#290163) |

Example content (from Figma):

| Title | Description |
|---|---|
| Health Insurance | Complete health cover that goes beyond the basics |
| Income Protection | Income security when it matters most |
| Dental Insurance | High-visibility benefit employees use |
| Wellbeing Platform | Gamified wellbeing that drives daily engagement |
| Not sure which product? | Our team can help match the right cover for your business. |

**[GAP]** `MenuItemLink` is not wrapped in an anchor in the Figma frame. Each item must become a link (`href`) at build time; add the `<a>` / `next/link` wrapper and hover/focus affordances.

### 4.7 In-menu CTA Button (Variant2 column)

Reuse `@/components/ui/Button`. Rendered value in Figma: bg `surface/inverse` (#290163), text `text/on-inverse` (white), radius `radius/sm` (8), padding `space/16` × `space/8`, `Nav/Link` label ("Speak to our team"). Map to: `variant=solid theme=onLight` **[ASSUMPTION — confirm variant/theme resolves to this dark fill]**.

---

## 5. States & interactions

| State | Defined in Figma? | Spec |
|---|---|---|
| Collapsed | ✅ | `expanded=false` — top bar only |
| Expanded | ✅ | `expanded=true` — panel visible |
| Trigger → which panel opens | ❌ **[GAP]** | Only one panel content exists. Decide open/close behaviour: hover vs click, one-open-at-a-time, close on outside click / Esc. |
| Link hover / focus / active | ❌ **[GAP]** | No hover styling in the frame. Define hover (e.g. title colour shift / underline) + visible focus ring for keyboard. |
| Button hover / focus / disabled | Owned by `Button` component | Inherit from the existing Button component's states. |
| Open/close animation | ❌ **[GAP]** | Define transition (fade/height) for the panel. |

**Accessibility [GAP / RECOMMENDATION]** — not modelled in Figma, but required for build:
- Trigger buttons need `aria-expanded`, `aria-controls`, and `aria-haspopup`.
- Panel should be a labelled region; column labels ("INSURANCE") can label their group.
- Full keyboard support: open on Enter/Space, arrow-key traversal, Esc to close, focus trap/return.
- Ensure `text/on-inverse-muted` (#6953f3) title on white meets AA contrast (≈4.5:1) — verify.

---

## 6. Responsive notes

- Figma widths are fixed at **1216px** (root, bar, panel) with 409px columns. **[FACT]** Treat 1216 as the desktop **max-width**; the container should center with side gutters below that.
- `InnerCol` is already `flex:1` with `min-width:0`, so columns distribute evenly — the 272/409px numbers are design references, not hard widths.
- **[GAP] Mobile / tablet:** no mobile design provided. The mega menu almost certainly collapses to a hamburger + stacked accordion below a breakpoint. Flag for a separate mobile spec before implementation — do not guess the mobile pattern.

---

## 7. Content / data model (for multiple menus)

Figma shows one populated dropdown. To drive all four triggers, model the menu as data and render the same components. Suggested shape:

```ts
type MenuItem   = { title: string; description?: string; href: string };
type MenuColumn = {
  label: string;                       // e.g. "INSURANCE"
  variant: "Default" | "Variant2";
  items: MenuItem[];
  cta?: { label: string; href: string }; // Variant2 columns only
};
type NavEntry = {
  label: string;                       // "Products" | "Who we help" | ...
  columns: MenuColumn[];               // dropdown content; empty = plain link
};
```

**[ASSUMPTION]** Who we help / Resources / About each open a panel of the same construction. Content for those three is **not** in this Figma node — source it separately.

---

## 8. Open questions / risks to resolve before/at build

1. **Border colour token [GAP].** Container borders use literal `rgba(105,83,243,0.4)` with no named variable. Add a token (e.g. `border/subtle-purple`) so it isn't hard-coded. This matches the previously flagged purple-stroke token gap in the Button set.
2. **Button theme semantics [ASSUMPTION].** Confirm how `theme=onLight` vs `onDark` renders against the dark top bar and the in-menu dark CTA before wiring.
3. **Interaction model [GAP].** Hover vs click to open; single vs multi-open; dismissal rules.
4. **Hover/focus states [GAP].** For links and the panel — required for usability + a11y.
5. **Mobile [GAP].** No design exists.
6. **Other three menus' content [GAP].** Only the Products-style panel is designed.
7. **Link semantics [GAP].** `MenuItemLink` needs real anchors/`href`s.

---

## 9. Build checklist (for the coding LLM)

- [ ] Reuse `@/components/ui/Button` for every button; pass `size`/`variant`/`theme`/`trailingIcon`/`href` per §4.2 and §4.7.
- [ ] Map all colours/spacing/radii/type to the tokens in §3 — no raw hex, no literal px where a token exists.
- [ ] Build components bottom-up: `MenuItemLink` → `ColSlot`/`InnerCol` → `MenuDropCol` (2 variants) → `NavMenuDrop` → `NavMenuTop` → `NavMegaMenu`.
- [ ] Drive dropdown content from the §7 data model, not hard-coded JSX.
- [ ] Implement `expanded` state + interaction model (resolve §8.3).
- [ ] Add link anchors, hover/focus states, and ARIA (resolve §8.3–8.4, §5 a11y).
- [ ] Container is centered, max-width 1216px; defer mobile to a separate spec.
- [ ] Verify contrast on #6953f3-on-white titles.
