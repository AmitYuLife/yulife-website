// -----------------------------------------------------------------------------
// Yuniversal asset generator — bakes the Figma YuniversalCanvas exports into
// runtime-cheap, screen-oriented SVGs and writes their layout manifest.
// Run:  node scripts/generate-yuniversal.mjs   (or: npm run gen:yuniversal)
//
// Sources: scripts/assets/yuniversal/*.svg — unedited Figma exports from
// YuniversalCanvas (2923:67921). Re-export over them and rerun.
// Outputs:
//   public/hero/yuniversal/<layer id>.svg — one file per layer
//   src/components/blocks/yuniversal/yuniversalLayers.ts — ids + positions
//
// Everything that is static is baked here, so the page only moves and fades
// whole images (see YuniversalCanvas for the runtime side):
// - Orientation: the Figma artboard is a 1465×1920 canvas shown as the
//   1920×1465 hero through rotate(90°) + flip — a transpose, screen (x, y) =
//   canvas (y, x). Layers are composed in canvas coordinates (so the Figma
//   numbers below read straight from the file), then every output is
//   transposed, so the page needs no rotated wrappers.
// - Figma's per-layer rotations (planet halos, bright stars, the flipped
//   right nebula) are baked into their SVGs.
// - Blend modes: live blending of large moving layers made scrolling judder,
//   so none reach the page. Nebulae: overlay onto the flat hero purple B is,
//   per channel (B < 0.5), 2·B·S — linear in S, so it's exact to pre-apply it
//   to every gradient stop. (Only loss: they no longer overlay-tint the few
//   stars beneath them.) Figma's 65% wrapper opacity is folded in too.
//   Planets: the layers become one SVG with a disc of the hero purple under
//   the body, so the multiply shading blends against what it sees on the page.
//   Shading opacities are calibrated to Figma's render (see PLANETS).
// - Dwarf stars: the 34 dots in STAR_GROUPS scattered twinkle groups, one
//   image each — one layer per group, not per dot. Chrome doesn't allocate
//   their transparent tiles, so sparse group layers stay cheap.
// -----------------------------------------------------------------------------
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "scripts", "assets", "yuniversal");
const PUB = join(ROOT, "public", "hero", "yuniversal");
const OUT_TS = join(ROOT, "src", "components", "blocks", "yuniversal", "yuniversalLayers.ts");

const STAR_GROUPS = 6;
/** Figma canvas (pre-transpose) size, px. The hero frame is CH × CW. */
const CW = 1465;
const CH = 1920;
/** Anti-aliasing margin around every output, px. */
const PAD = 2;

const read = (name) => readFile(join(SRC, `${name}.svg`), "utf8");
const round = (n, p = 3) => Number(n.toFixed(p));

// ── Hero purple, resolved from the design tokens (never hardcoded) ────────────
const theme = await readFile(join(ROOT, "design-tokens", "theme.css"), "utf8");
const resolveVar = (name) => {
  const v = theme.match(new RegExp(`--${name}:\\s*([^;]+);`))[1].trim();
  const ref = v.match(/^var\(--([\w-]+)\)$/);
  return ref ? resolveVar(ref[1]) : v;
};
const HERO = resolveVar("surface-inverse");
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (rgb) => "#" + rgb.map((c) => Math.round(c).toString(16).padStart(2, "0")).join("").toUpperCase();
const B = hex(HERO);
if (B.some((c) => c >= 128)) throw new Error("overlay bake assumes a dark backdrop (every channel < 50%)");

// ── Canvas-space helpers ──────────────────────────────────────────────────────
/** Figma inset [t, r, b, l] (% of canvas) → canvas px rect. */
const rect = ([t, r, b, l]) => ({ x: (l * CW) / 100, y: (t * CH) / 100, w: ((100 - l - r) * CW) / 100, h: ((100 - t - b) * CH) / 100 });
const centre = (r) => ({ cx: r.x + r.w / 2, cy: r.y + r.h / 2 });
const union = (rs) => {
  const x = Math.min(...rs.map((r) => r.x));
  const y = Math.min(...rs.map((r) => r.y));
  return { x, y, w: Math.max(...rs.map((r) => r.x + r.w)) - x, h: Math.max(...rs.map((r) => r.y + r.h)) - y };
};
/** Bounding box of a w×h rect centred on (cx, cy), rotated by deg. */
const rotatedBounds = (cx, cy, w, h, deg) => {
  const a = (deg * Math.PI) / 180;
  const ex = (Math.abs(Math.cos(a)) * w + Math.abs(Math.sin(a)) * h) / 2;
  const ey = (Math.abs(Math.sin(a)) * w + Math.abs(Math.cos(a)) * h) / 2;
  return { x: cx - ex, y: cy - ey, w: 2 * ex, h: 2 * ey };
};
/** Figma sizes rotated children as hypot(a·cqw, b·cqh) of their box. */
const cqHypot = ([a, b], box) => Math.hypot((a * box.w) / 100, (b * box.h) / 100);

/** A source SVG's content as a nested <svg> filling `r`, ids namespaced. */
const nested = (name, src, r) => {
  const viewBox = src.match(/viewBox="([^"]+)"/)[1];
  const inner = src
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/id="([^"]+)"/g, `id="${name}-$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${name}-$1)`);
  return `<svg x="${round(r.x)}" y="${round(r.y)}" width="${round(r.w)}" height="${round(r.h)}" viewBox="${viewBox}" preserveAspectRatio="none" overflow="visible">${inner}</svg>`;
};

/** A source SVG sized w×h, centred in `box` and rotated (Figma's rotated children). */
const rotatedIn = (name, src, box, deg, w, h) => {
  const { cx, cy } = centre(box);
  return {
    svg: `<g transform="rotate(${deg} ${round(cx)} ${round(cy)})">${nested(name, src, { x: cx - w / 2, y: cy - h / 2, w, h })}</g>`,
    bounds: rotatedBounds(cx, cy, w, h, deg),
  };
};

// ── Output: transpose into screen orientation ─────────────────────────────────
const layers = [];
/** Write one layer: canvas-space content + bounds → screen-space SVG + manifest entry. */
async function emit(id, content, bounds) {
  const b = { x: bounds.x - PAD, y: bounds.y - PAD, w: bounds.w + 2 * PAD, h: bounds.h + 2 * PAD };
  // Screen rect = transposed canvas rect; matrix(0 1 1 0 0 0) maps (x, y) → (y, x).
  const s = { x: b.y, y: b.x, w: b.h, h: b.w };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${round(s.w)}" height="${round(s.h)}" viewBox="${round(s.x)} ${round(s.y)} ${round(s.w)} ${round(s.h)}" fill="none">\n<g transform="matrix(0 1 1 0 0 0)">\n${content}\n</g>\n</svg>\n`;
  await writeFile(join(PUB, `${id}.svg`), svg);
  // Inset as % of the hero frame (CH wide × CW tall): [top, right, bottom, left].
  const inset = [(s.y / CW) * 100, 100 - ((s.x + s.w) / CH) * 100, 100 - ((s.y + s.h) / CW) * 100, (s.x / CH) * 100];
  layers.push({ id, inset: inset.map((n) => round(n, 4)) });
}

// ── Dwarf stars (drawn first: the far field) ──────────────────────────────────
{
  const src = await read("dwarf-stars");
  const [, vbW, vbH] = src.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
  const box = rect([-28.77, 0.4, -26.59, -9.39]);
  const sx = box.w / vbW;
  const sy = box.h / vbH;
  const defs = Object.fromEntries(
    [...src.matchAll(/<radialGradient id="([^"]+)"[\s\S]*?<\/radialGradient>/g)].map(([el, id]) => [id, el]),
  );
  const stars = [...src.matchAll(/<path id="[^"]+" d="([^"]+)" fill="([^"]+)"\/>/g)].map(([el, d, fill], i) => {
    // Every path is an absolute M/C/Z circle; its control points bracket it.
    const nums = d.match(/-?[\d.]+/g).map(Number);
    const xs = nums.filter((_, j) => j % 2 === 0);
    const ys = nums.filter((_, j) => j % 2 === 1);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    return {
      el,
      gradient: defs[fill.match(/^url\(#(.+)\)$/)?.[1]] ?? "",
      bounds: { x: box.x + x0 * sx, y: box.y + y0 * sy, w: (Math.max(...xs) - x0) * sx, h: (Math.max(...ys) - y0) * sy },
      // Deterministic scatter so neighbouring dots land in different groups.
      hash: ((Math.sin((i + 1) * 91.345) * 47453.5453) % 1 + 1) % 1,
    };
  });
  const order = [...stars].sort((a, b) => a.hash - b.hash);
  for (let g = 0; g < STAR_GROUPS; g++) {
    const members = order.filter((_, i) => i % STAR_GROUPS === g);
    const body = `<defs>${members.map((m) => m.gradient).join("")}</defs>${members.map((m) => m.el).join("")}`;
    const content = `<svg x="${round(box.x)}" y="${round(box.y)}" width="${round(box.w)}" height="${round(box.h)}" viewBox="0 0 ${vbW} ${vbH}" preserveAspectRatio="none" overflow="visible">${body}</svg>`;
    await emit(`dwarf-stars-${g + 1}`, content, union(members.map((m) => m.bounds)));
  }
}

// ── Planets ───────────────────────────────────────────────────────────────────
const PLANETS = {
  "gas-giant": {
    group: [79.75, 29.46, 7.95, 54.42],
    // Figma: rotate -6.36°, w = hypot(89.9783cqw, -10.0217cqh), h = hypot(10.0217cqw, 89.9783cqh)
    halo: { deg: -6.36, w: [89.9783, -10.0217], h: [10.0217, 89.9783], opacity: 0.18 },
    body: { inset: [80.84, 30.89, 9.03, 55.84], opacity: 0.18 },
    shading: [
      // Shading opacities are calibrated against Figma's own render, not the
      // exported code's 18%: Figma composites these groups differently from a
      // CSS multiply, and at 18% the bands all but vanish. Scored per pixel
      // inside the disc vs the HeroSection render (2921:58710).
      { layer: "shade", inset: [81, 34.23, 9.02, 55.83], opacity: 0.75 },
      { layer: "bands", inset: [80.96, 30.89, 9.84, 55.79], opacity: 1 },
    ],
  },
  "dwarf-planet": {
    group: [15.56, 27.18, 80.29, 67.38],
    halo: { deg: -88.09, w: [3.23179, -96.7682], h: [96.7682, 3.23179], opacity: 0.51 },
    body: { inset: [15.8, 27.49, 80.53, 67.7], opacity: 0.51 },
    shading: [
      // Calibrated as for the gas giant (craters already match at Figma's 51%).
      { layer: "shade", inset: [15.79, 29.61, 80.54, 67.7], opacity: 0.75 },
      { layer: "craters", inset: [15.86, 27.48, 80.7, 67.7], opacity: 0.51 },
    ],
  },
};

async function planet(id) {
  const p = PLANETS[id];
  const group = rect(p.group);
  const body = rect(p.body.inset);
  const halo = rotatedIn(`${id}-halo`, await read(`${id}-halo`), group, p.halo.deg, cqHypot(p.halo.w, group), cqHypot(p.halo.h, group));
  const shading = await Promise.all(p.shading.map(async (s) => ({ ...s, r: rect(s.inset), src: await read(`${id}-${s.layer}`) })));
  const disc = `cx="${round(body.x + body.w / 2)}" cy="${round(body.y + body.h / 2)}" rx="${round(body.w / 2)}" ry="${round(body.h / 2)}"`;
  const content = [
    `<defs><clipPath id="body-clip"><ellipse ${disc}/></clipPath></defs>`,
    // The page purple under the body, so the multiply shading blends against
    // what it sees in the page (see header).
    `<ellipse ${disc} fill="${HERO}"/>`,
    `<g opacity="${p.halo.opacity}">${halo.svg}</g>`,
    `<g opacity="${p.body.opacity}">${nested(`${id}-body`, await read(`${id}-body`), body)}</g>`,
    // Clipped to the body: outside it the multiply would fall back to a plain
    // blend against the image's transparency and leave a light fringe.
    ...shading.map(
      (s) =>
        `<g opacity="${s.opacity}" style="mix-blend-mode:multiply" clip-path="url(#body-clip)">${nested(`${id}-${s.layer}`, s.src, s.r)}</g>`,
    ),
  ].join("\n");
  await emit(id, content, union([halo.bounds, group, body, ...shading.map((s) => s.r)]));
}

// ── Bright stars ──────────────────────────────────────────────────────────────
const BRIGHT_STARS = {
  "bright-star-a": { box: [-6.05, -0.27, 93.84, 84.27], deg: 122.77, w: [-39.1616, 60.8384], h: [-60.8384, -39.1616] },
  "bright-star-b": { box: [20.96, 85.86, 68.15, -0.12], deg: 74.43, w: [21.7923, 78.2077], h: [-78.2077, 21.7923] },
  "bright-star-c": { box: [73.61, 7.05, 14.07, 76.81], deg: 125.3, w: [-41.4522, 58.5478], h: [-58.5478, -41.4522] },
};

async function brightStar(id) {
  const s = BRIGHT_STARS[id];
  const box = rect(s.box);
  const star = rotatedIn(id, await read(id), box, s.deg, cqHypot(s.w, box), cqHypot(s.h, box));
  // Centred on the box, so the runtime spin/pulse pivot (the image centre)
  // stays on the star.
  await emit(id, star.svg, star.bounds);
}

// ── Nebulae ───────────────────────────────────────────────────────────────────
const NEBULA_WRAPPER_OPACITY = 0.65;
async function nebula(side) {
  let src = await read(`nebula-${side}`);
  src = src.replace(/stop-color="(#[0-9A-Fa-f]{6})"/g, (_, c) => `stop-color="${toHex(hex(c).map((s, i) => (2 * B[i] * s) / 255))}"`);
  if (/stop-color="(?!#)/.test(src)) throw new Error(`nebula-${side}: non-hex stop colour`);
  src = src.replace(/ style="mix-blend-mode:overlay"/g, "");
  // Fold the Figma wrapper's opacity into the root group's.
  src = src.replace(/<g id="(\w+)"( opacity="([\d.]+)")?/, (_, gid, __, op) => `<g id="${gid}" opacity="${round((op ? +op : 1) * NEBULA_WRAPPER_OPACITY, 4)}"`);
  const id = `nebula-${side}`;
  if (side === "left") {
    const r = rect([-33.82, -29.24, 68.08, -14.81]);
    return emit(id, nested(id, src, r), r);
  }
  // Right: Figma sizes it w = box height, h = box width, then rotate(-90) scaleX(-1).
  const r = rect([42.91, -109.39, -25.2, -26.94]);
  const { cx, cy } = centre(r);
  const inner = nested(id, src, { x: cx - r.h / 2, y: cy - r.w / 2, w: r.h, h: r.w });
  await emit(id, `<g transform="translate(${round(cx)} ${round(cy)}) rotate(-90) scale(-1 1) translate(${round(-cx)} ${round(-cy)})">${inner}</g>`, r);
}

// Paint order, back to front (Figma layer order).
await planet("gas-giant");
for (const id of Object.keys(BRIGHT_STARS)) await brightStar(id);
await nebula("right");
await nebula("left");
await planet("dwarf-planet");

const ts = `// GENERATED by scripts/generate-yuniversal.mjs — do not edit by hand.
// Sources: scripts/assets/yuniversal/*.svg (Figma YuniversalCanvas, 2923:67921).

/** Paint order, back to front. \`inset\` is [top, right, bottom, left] as % of
 * the 1920×1465 hero frame; the image is public/hero/yuniversal/<id>.svg. */
export const yuniversalLayers = ${JSON.stringify(layers, null, 2)} as const;

export type YuniversalLayerId = (typeof yuniversalLayers)[number]["id"];
`;
await writeFile(OUT_TS, ts);
console.log(`Wrote ${layers.length} layers (hero ${HERO}): ${layers.map((l) => l.id).join(", ")}`);
