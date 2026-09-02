/**
 * Bundle-size budget guard.
 *
 * Runs the production build, parses Next's route table, and fails if any
 * DEPLOYED route's First Load JS exceeds the budget. This is the check that
 * catches a regression like three.js / R3F silently landing back on a page's
 * initial bundle (which is exactly how the businesses hero crept up to 468 kB
 * before it was lazy-loaded).
 *
 * Tune BUDGET_KB, OVERRIDES, or EXCLUDE as the site grows — but treat raising a
 * limit as a deliberate decision, not a reflex: prefer lazy-loading heavy deps
 * with next/dynamic (see ImageRightHero / Hero) over widening the budget.
 */
import { execSync } from "node:child_process";

/** Default ceiling on First Load JS per deployed route, in kB. */
const BUDGET_KB = 300;
/** Per-route exceptions, e.g. { "/some/route": 380 }. Add a comment saying why. */
const OVERRIDES = {};
/** Routes exempt from the budget — dev-only surfaces stripped from the deploy. */
const EXCLUDE = [/^\/workbench/];

console.log("› Running production build for the bundle check…\n");
let out;
try {
  out = execSync("npm run build", { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
} catch (err) {
  process.stdout.write(err.stdout ?? "");
  process.stderr.write(err.stderr ?? "");
  console.error("\n✗ Build failed — see output above.");
  process.exit(1);
}
process.stdout.write(out);

// Parse the route table. Each route row is `<tree> <status glyph> <route> … <N> kB`
// where the LAST "N kB" on the line is the First Load JS column. Requiring the
// status glyph after the tree character cleanly skips chunk sub-rows and the
// "First Load JS shared by all" summary line.
const clean = out.replace(/\x1b\[[0-9;]*m/g, "");
const rows = [];
for (const line of clean.split("\n")) {
  const m = line.match(/^[┌├└]\s+[○●ƒλ]\s+(\S+)\s+.*?([\d.]+)\s*kB\s*$/);
  if (m) rows.push({ route: m[1], kb: parseFloat(m[2]) });
}

if (rows.length === 0) {
  console.error(
    "\n✗ Bundle check: couldn't parse any routes from the build output.\n" +
      "  Next's table format may have changed — update scripts/check-bundle-size.mjs.",
  );
  process.exit(1);
}

const checked = rows.filter((r) => !EXCLUDE.some((re) => re.test(r.route)));
const failures = checked.filter((r) => r.kb > (OVERRIDES[r.route] ?? BUDGET_KB));
const worst = [...checked].sort((a, b) => b.kb - a.kb)[0];

console.log(`\n› Bundle budget: ${BUDGET_KB} kB First Load JS per deployed route.`);
console.log(`  ${checked.length} routes checked; heaviest is ${worst.route} at ${worst.kb} kB.`);

if (failures.length > 0) {
  console.error("\n✗ Bundle budget exceeded:");
  for (const f of failures) {
    console.error(`  ${f.route} — ${f.kb} kB (limit ${OVERRIDES[f.route] ?? BUDGET_KB} kB)`);
  }
  console.error(
    "\n  Fix by trimming the route or lazy-loading heavy deps with next/dynamic,\n" +
      "  or raise the limit in scripts/check-bundle-size.mjs with a reason.",
  );
  process.exit(1);
}

console.log("\n✓ All deployed routes within budget.");
