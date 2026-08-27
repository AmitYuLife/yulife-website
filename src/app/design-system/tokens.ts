// Foundations data for the design-system workbench, derived from the single
// source of truth: design-tokens/tokens.json (W3C DTCG format). This is the
// first consumer of that file — a tiny, pure resolver, no React. If the token
// file changes, these galleries update automatically on next build.
//
// design-tokens sits outside src/, so it can't use the "@/" alias.
import tokensJson from "../../../design-tokens/tokens.json";

type DTCGNode = {
  $type?: string;
  $value?: unknown;
  $extensions?: Record<string, unknown>;
  [key: string]: unknown;
};

// The JSON is a nested bag of groups and DTCG leaf nodes; walk it dynamically.
const root = tokensJson as unknown as Record<string, DTCGNode>;

/**
 * Follow a DTCG alias like "{primitive.color.purple.900}" to its resolved
 * primitive value. Non-alias strings (raw hex, rgb(...)) pass through
 * unchanged. Chained aliases resolve recursively.
 */
function resolve(value: unknown): string {
  if (typeof value !== "string") return String(value ?? "");
  const match = /^\{(.+)\}$/.exec(value.trim());
  if (!match) return value;
  const segments = match[1].split(".");
  let node: unknown = root;
  for (const key of segments) {
    node = (node as Record<string, unknown> | undefined)?.[key];
    if (node == null) return value; // unresolved reference — surface the raw ref
  }
  return resolve((node as DTCGNode)?.$value ?? value);
}

export type Swatch = { name: string; token: string; value: string };
export type SwatchGroup = { title: string; token: string; swatches: Swatch[] };

// ── Colour primitives ──────────────────────────────────────────────────────
// primitive.color.{hue}.{shade} — grouped by hue, preserving JSON order.
export const primitiveColorGroups: SwatchGroup[] = Object.entries(
  (root.primitive as DTCGNode).color as Record<string, Record<string, DTCGNode>>,
).map(([hue, shades]) => ({
  title: hue,
  token: `primitive.color.${hue}`,
  swatches: Object.entries(shades).map(([shade, node]) => ({
    name: shade,
    token: `${hue}.${shade}`,
    value: resolve(node.$value),
  })),
}));

// ── Semantic colour aliases ─────────────────────────────────────────────────
// color.{text|surface|border|action}.{tier} — each resolved to its primitive.
export const semanticColorGroups: SwatchGroup[] = Object.entries(
  root.color as Record<string, Record<string, DTCGNode>>,
).map(([group, tiers]) => ({
  title: group,
  token: `color.${group}`,
  swatches: Object.entries(tiers).map(([tier, node]) => ({
    name: tier,
    token: `${group}.${tier}`,
    value: resolve(node.$value),
  })),
}));

// ── Spacing scale ────────────────────────────────────────────────────────────
export type ScaleItem = { name: string; value: string };

export const spacingScale: ScaleItem[] = Object.entries(
  (root.primitive as DTCGNode).space as Record<string, DTCGNode>,
).map(([name, node]) => ({ name, value: resolve(node.$value) }));

// ── Radii ─────────────────────────────────────────────────────────────────────
export const radiusScale: ScaleItem[] = Object.entries(
  (root.primitive as DTCGNode).radius as Record<string, DTCGNode>,
).map(([name, node]) => ({ name, value: resolve(node.$value) }));

// ── Semantic gap scale (RESPONSIVE) ────────────────────────────────────────────
// These map to Tailwind gap-* utilities and reference the responsive --gap-*
// custom properties, so their pixel value shrinks per breakpoint. There is no
// single number to print — the specimen renders the live gap via the utility.
export const gapTokens: { name: string; utility: string; cssVar: string }[] = [
  { name: "none", utility: "gap-none", cssVar: "--gap-none" },
  { name: "inline", utility: "gap-inline", cssVar: "--gap-inline" },
  { name: "related", utility: "gap-related", cssVar: "--gap-related" },
  { name: "stack", utility: "gap-stack", cssVar: "--gap-stack" },
  { name: "controls", utility: "gap-controls", cssVar: "--gap-controls" },
  { name: "flow", utility: "gap-flow", cssVar: "--gap-flow" },
  { name: "group", utility: "gap-group", cssVar: "--gap-group" },
  { name: "split", utility: "gap-split", cssVar: "--gap-split" },
];

// ── Typography roles ────────────────────────────────────────────────────────
// typography.{role} → the live `.type-{role}` class. Metadata (family/weight/
// base size) comes from the token's default $value; the class itself supplies
// the responsive sizing, so specimens are always truthful to the live CSS.
export type TypeRole = {
  role: string;
  className: string;
  family: string;
  weight: number;
  size: string;
  lineHeight: string;
};

export const typographyRoles: TypeRole[] = Object.entries(
  root.typography as Record<string, DTCGNode>,
).map(([role, node]) => {
  const v = (node.$value ?? {}) as Record<string, unknown>;
  return {
    role,
    className: `type-${role}`,
    family: resolve(v.fontFamily),
    weight: Number(v.fontWeight ?? 400),
    size: String(v.fontSize ?? ""),
    lineHeight: String(v.lineHeight ?? ""),
  };
});

// ── Font families ────────────────────────────────────────────────────────────
export const fontFamilies: { name: string; value: string }[] = Object.entries(
  (root.primitive as DTCGNode).fontFamily as Record<string, DTCGNode>,
).map(([name, node]) => ({ name, value: resolve(node.$value) }));
