#!/usr/bin/env node
/**
 * Generates docs/CODE_MAP.md — a compact index of the codebase for fast lookup.
 *
 * Three things it resolves, in the order an agent (or a new dev) needs them:
 *   1. route  -> template component + data source
 *   2. data-src attribute seen in the rendered DOM -> file:line
 *   3. file   -> internal landmarks (line numbers of its symbols)
 *
 * Regex-based on purpose: no parser dependency, and the conventions here are
 * uniform enough that an AST would not buy anything. Run after moving or
 * renaming components:  npm run gen:map
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "docs", "CODE_MAP.md");

/** Files ≥ this many lines get a full symbol table; smaller ones just a row. */
const DETAIL_THRESHOLD = 120;

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(tsx?|jsx?)$/.test(entry) && !entry.endsWith(".figma.ts")) acc.push(full);
  }
  return acc;
}

const files = walk(SRC)
  .map((f) => relative(ROOT, f).split(sep).join("/"))
  .sort();

const SYMBOL_PATTERNS = [
  [/^export default function (\w+)/, "default export"],
  [/^export function (\w+)/, "export"],
  [/^function (\w+)/, "local"],
  [/^export const (\w+)\s*[:=]/, "export const"],
  [/^const (\w+)\s*=\s*(?:\(|function|memo|forwardRef|dynamic)/, "const"],
  [/^export type (\w+)/, "type"],
  [/^export interface (\w+)/, "type"],
];

const info = new Map(); // path -> { lines, symbols[], stamps[] }

for (const path of files) {
  const text = readFileSync(join(ROOT, path), "utf8");
  const lines = text.split("\n");
  const symbols = [];
  const stamps = [];

  lines.forEach((line, i) => {
    for (const [re, kind] of SYMBOL_PATTERNS) {
      const m = line.match(re);
      if (m) {
        symbols.push({ name: m[1], kind, line: i + 1 });
        break;
      }
    }
    // domSrc("Name")  or  domSrc(`block-${block}`, label) — the latter is a
    // pattern rather than a fixed name, so show the interpolation as <n>.
    // Only JSX files can carry a stamp, which also skips the helper's own docs.
    const stamp = path.endsWith(".tsx") && line.match(/domSrc\((?:"([^"]+)"|`([^`]+)`)/);
    if (stamp) {
      const dynamic = stamp[2]?.replace(/\$\{[^}]+\}/g, "<n>");
      stamps.push({ name: stamp[1] ?? dynamic, line: i + 1, dynamic: !stamp[1] });
    }
  });

  info.set(path, { lines: lines.length, symbols, stamps });
}

/* ---------------------------------------------------------------- routes --- */

/** All `@/data/...` module specifiers imported by a source string, minus sitemap plumbing. */
function dataImportsOf(text) {
  return [...(text.match(/"(@\/data\/[^"]+)"/g) ?? [])]
    .map((d) => d.replace(/"/g, ""))
    .filter((d) => !d.includes("sitemap"))
    .filter((d, i, a) => a.indexOf(d) === i)
    .join(", ");
}

/** Resolve an `@/x/y` import specifier to a real path in `files`. */
function resolveAlias(spec) {
  const stem = spec.replace(/^@\//, "src/");
  return files.find((f) => f === stem || f.startsWith(`${stem}.`));
}

const routes = [];
for (const path of files) {
  if (!/^src\/app\/.*\/?page\.tsx$/.test(path)) continue;
  const text = readFileSync(join(ROOT, path), "utf8");

  const route =
    text.match(/const route = "([^"]+)"/)?.[1] ??
    "/" + path.replace(/^src\/app\/?/, "").replace(/\/?page\.tsx$/, "");

  // The component actually returned by the default export.
  const rendered = text.match(/return\s*<(\w+)/)?.[1] ?? "inline JSX";
  let data = dataImportsOf(text);

  // Thin route files (e.g. `/` -> HomePage) hold no copy themselves. Follow the
  // rendered component, and if that is only a composition shell, its children
  // too — two hops is enough to reach the real content module.
  if (!data && rendered !== "inline JSX") {
    const spec = text.match(new RegExp(`import ${rendered} from "([^"]+)"`))?.[1];
    const shell = spec && resolveAlias(spec);
    if (shell) {
      const shellText = readFileSync(join(ROOT, shell), "utf8");
      data = dataImportsOf(shellText);
      if (!data) {
        const found = new Set();
        for (const m of shellText.matchAll(/import \w+ from "(@\/[^"]+)"/g)) {
          const child = resolveAlias(m[1]);
          if (!child) continue;
          const d = dataImportsOf(readFileSync(join(ROOT, child), "utf8"));
          if (d) d.split(", ").forEach((x) => found.add(x));
        }
        data = [...found].join(", ");
      }
    }
  }

  routes.push({ route: route === "/" ? "/" : route.replace(/\/$/, ""), path, rendered, data });
}
routes.sort((a, b) => a.route.localeCompare(b.route));

/* ------------------------------------------------------------ dom index --- */

const domIndex = [];
for (const [path, meta] of info) {
  for (const s of meta.stamps) domIndex.push({ name: s.name, path, line: s.line });
}
domIndex.sort((a, b) => a.name.localeCompare(b.name));

/* ---------------------------------------------------------------- output --- */

const md = [];
md.push("# Code map");
md.push("");
md.push("> Generated by `scripts/generate-code-map.mjs` — **do not edit by hand.**");
md.push("> Regenerate with `npm run gen:map` after moving or renaming components.");
md.push("");
md.push(
  `${files.length} source files · ${[...info.values()].reduce((n, m) => n + m.lines, 0)} lines · ` +
    `${domIndex.length} DOM stamps · ${routes.length} routes`
);
md.push("");

md.push("## 1. How to find a thing");
md.push("");
md.push("Point at something on the page, then work down this list:");
md.push("");
md.push("1. **Run the outline dump** in the browser to get the `data-src` name of the block:");
md.push("   ```js");
md.push('   [...document.querySelectorAll("[data-src]")].map(e=>e.dataset.src+(e.dataset.blockLabel?" — "+e.dataset.blockLabel:""))');
md.push("   ```");
md.push("2. **Look the name up** in §3 below to get `file:line`.");
md.push("3. **Read only that range.** For files over " + DETAIL_THRESHOLD + " lines, §4 gives internal landmarks so you can offset straight to the right function.");
md.push("");
md.push("If it is *copy* rather than layout, skip all of the above and go to the data file for that route (§2).");
md.push("");

md.push("## 2. Routes");
md.push("");
md.push("| Route | Renders | Copy / data | Route file |");
md.push("|---|---|---|---|");
for (const r of routes) {
  md.push(`| \`${r.route}\` | ${r.rendered} | ${r.data ? "`" + r.data + "`" : "—"} | \`${r.path}\` |`);
}
md.push("");

md.push("## 3. DOM index (`data-src` → source)");
md.push("");
md.push(
  "Every stamped block root carries `data-src`. Wireframe-template blocks are stamped " +
    "generically as `block-<n>` by `SectionBlock`, and also carry `data-block-label` with the " +
    "human label — the template that owns them is whichever component §2 says the route renders."
);
md.push("");
md.push("| `data-src` | Source |");
md.push("|---|---|");
for (const d of domIndex) {
  md.push(`| \`${d.name}\` | \`${d.path}:${d.line}\` |`);
}
md.push("");

md.push("## 4. File index");
md.push("");
md.push(`Files of ${DETAIL_THRESHOLD}+ lines list their internal landmarks; the rest are small enough to read whole.`);
md.push("");

const groups = new Map();
for (const path of files) {
  const dir = path.split("/").slice(0, -1).join("/");
  if (!groups.has(dir)) groups.set(dir, []);
  groups.get(dir).push(path);
}

for (const [dir, paths] of [...groups].sort()) {
  md.push(`### \`${dir}/\``);
  md.push("");
  for (const path of paths) {
    const meta = info.get(path);
    const name = path.split("/").pop();
    if (meta.lines < DETAIL_THRESHOLD) {
      const exported = meta.symbols
        .filter((s) => s.kind !== "local" && s.kind !== "const")
        .map((s) => s.name);
      md.push(`- \`${name}\` (${meta.lines} lines)${exported.length ? " — " + exported.join(", ") : ""}`);
    } else {
      md.push(`- \`${name}\` (${meta.lines} lines)`);
      for (const s of meta.symbols) {
        md.push(`  - \`:${s.line}\` ${s.name} *(${s.kind})*`);
      }
    }
  }
  md.push("");
}

writeFileSync(OUT, md.join("\n"));
console.log(
  `docs/CODE_MAP.md written — ${files.length} files, ${domIndex.length} stamps, ${routes.length} routes`
);
