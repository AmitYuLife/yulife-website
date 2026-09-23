#!/usr/bin/env node
/**
 * Build-time guard on the dark surface system, over the static export in ./out.
 * For every page it asserts two things from the `data-surface` stamps (see
 * src/lib/surface.ts):
 *   1. no two DOM-adjacent top-level `<main>` sections share a surface, and
 *   2. no stamped card/panel sits inside a container of the same surface (so it
 *      always contrasts with its section).
 * Unstamped elements are boundaries, so wireframe/light pages that don't opt in
 * are simply skipped.
 *
 * Runs after `next build` (wired into the `build` script) and standalone via
 * `npm run check:surfaces`. Exits non-zero on any violation so CI fails. The
 * dev-time companion src/components/dev/SectionSurfaceAuditor.tsx runs the same
 * two checks live (reading computed styles) for instant feedback.
 */
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, relative } from "node:path";
import { parse } from "parse5";

const OUT = "out";

if (!existsSync(OUT)) {
  console.error("[check:surfaces] ./out not found — run `npm run build` first.");
  process.exit(2);
}

async function htmlFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await htmlFiles(p)));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

function findMain(node) {
  if (node.tagName === "main") return node;
  for (const child of node.childNodes ?? []) {
    const found = findMain(child);
    if (found) return found;
  }
  return null;
}

const attr = (el, name) => el.attrs?.find((a) => a.name === name)?.value ?? null;

/** A short, prod-safe identifier for a section (data-src is stripped in prod). */
function idOf(el, i) {
  return (
    attr(el, "aria-label") ||
    attr(el, "aria-labelledby") ||
    attr(el, "data-src") ||
    `${el.tagName}[${i}]`
  );
}

/** Depth-first walk carrying the nearest ancestor surface, to catch a card or
 *  panel stamped with the same surface as the section it sits in (no contrast). */
function checkNested(node, ancestorSurface, file, out) {
  const surface = node.tagName ? attr(node, "data-surface") : null;
  let next = ancestorSurface;
  if (surface) {
    if (ancestorSurface && surface === ancestorSurface) {
      out.push(
        `${relative(".", file)}: ${idOf(node, 0)} ("${surface}") sits in a ` +
          `"${ancestorSurface}" surface — no contrast`,
      );
    }
    next = surface;
  }
  for (const child of node.childNodes ?? []) checkNested(child, next, file, out);
}

const files = await htmlFiles(OUT);
const violations = [];

for (const file of files) {
  const main = findMain(parse(await readFile(file, "utf8")));
  if (!main) continue;

  // 1) Adjacent top-level sections must not share a background.
  const sections = (main.childNodes ?? []).filter((n) => n.tagName);
  for (let i = 0; i < sections.length - 1; i += 1) {
    const a = attr(sections[i], "data-surface");
    const b = attr(sections[i + 1], "data-surface");
    if (a && b && a === b) {
      violations.push(
        `${relative(".", file)}: adjacent sections both "${a}" ` +
          `(${idOf(sections[i], i)} → ${idOf(sections[i + 1], i + 1)})`,
      );
    }
  }

  // 2) A nested surface (card/panel) must contrast with its container.
  checkNested(main, null, file, violations);
}

if (violations.length) {
  console.error(
    `[check:surfaces] ${violations.length} background-alternation issue(s) across ${files.length} page(s):`,
  );
  for (const v of violations) console.error("  · " + v);
  process.exit(1);
}

console.log(
  `[check:surfaces] ${files.length} page(s) OK — sections alternate and cards contrast.`,
);
