// -----------------------------------------------------------------------------
// Sitemap diagram generator — writes docs/sitemap-diagram.svg from sitemap.js
// Run:  node scripts/generate-sitemap-svg.mjs   (or: npm run gen:svg)
// Greyscale palette; emerald = approved copy, grey = none, amber = flag.
// -----------------------------------------------------------------------------
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { home, navGroups } from "../src/data/sitemap.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "..", "docs", "sitemap-diagram.svg");

const W = 1240;
const M = 40;
const COL_GAP = 24;
const HEADER_H = 38;
const ROW_H = 28;
const PAD = 10;

const C = {
  ink: "#1f2937",
  muted: "#6b7280",
  line: "#cbd5e1",
  card: "#ffffff",
  band: "#f8fafc",
  groupHead: "#111827",
  approved: "#10b981",
  none: "#cbd5e1",
  flag: "#f59e0b",
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const dot = (cx, cy, color) => `<circle cx="${cx}" cy="${cy}" r="4" fill="${color}"/>`;

const primary = navGroups.filter((g) => g.tier === "primary");
const secondary = navGroups.filter((g) => g.tier === "secondary");

const usable = W - M * 2;
const colW = (usable - COL_GAP * (primary.length - 1)) / primary.length;

let svg = [];

// --- Home node ---
const homeW = 220, homeH = 46, homeX = (W - homeW) / 2, homeY = 70;
function rowPills(page) {
  return (page.copyStatus === "approved" ? C.approved : C.none);
}

// --- Primary group columns ---
const groupTop = 190;
const groupBoxes = primary.map((g, i) => {
  const x = M + i * (colW + COL_GAP);
  const rows = g.pages.length;
  const h = HEADER_H + rows * ROW_H + PAD;
  return { g, x, y: groupTop, w: colW, h };
});
const primaryBottom = Math.max(...groupBoxes.map((b) => b.y + b.h));

// --- Secondary (Solutions) band ---
const secTop = primaryBottom + 60;
const sec = secondary[0];
const secCols = 4;
const secRows = Math.ceil(sec.pages.length / secCols);
const secChipH = 40, secChipGap = 14;
const secBandH = 54 + secRows * (secChipH + secChipGap) + PAD;
const legendY = secTop + secBandH + 50;
const H = legendY + 60;

// ============================ build markup ============================
svg.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif">`);
svg.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`);

// Title
svg.push(`<text x="${M}" y="40" font-size="24" font-weight="700" fill="${C.ink}">YuLife 2026 — Sitemap</text>`);
svg.push(`<text x="${M}" y="60" font-size="13" fill="${C.muted}">Agreed information architecture (“Revised” frame). Dot = copy status · ⚠ = open decision.</text>`);

// Home
svg.push(`<rect x="${homeX}" y="${homeY}" width="${homeW}" height="${homeH}" rx="10" fill="${C.groupHead}"/>`);
svg.push(`<circle cx="${homeX + 18}" cy="${homeY + homeH / 2}" r="4" fill="${C.approved}"/>`);
svg.push(`<text x="${homeX + homeW / 2}" y="${homeY + homeH / 2 + 5}" text-anchor="middle" font-size="15" font-weight="700" fill="#fff">Home</text>`);

// Tier label
svg.push(`<text x="${M}" y="${groupTop - 18}" font-size="11" font-weight="700" letter-spacing="1" fill="${C.muted}">PRIMARY NAVIGATION</text>`);

// Connectors Home -> each group header
for (const b of groupBoxes) {
  const sx = homeX + homeW / 2, sy = homeY + homeH;
  const tx = b.x + b.w / 2, ty = b.y;
  const midY = (sy + ty) / 2;
  svg.push(`<path d="M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}" fill="none" stroke="${C.line}" stroke-width="1.5"/>`);
}

// Group boxes
for (const b of groupBoxes) {
  svg.push(`<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="10" fill="${C.card}" stroke="${C.line}"/>`);
  svg.push(`<path d="M ${b.x} ${b.y + HEADER_H} h ${b.w}" stroke="${C.line}" stroke-width="1"/>`);
  svg.push(`<text x="${b.x + PAD}" y="${b.y + 25}" font-size="14" font-weight="700" fill="${C.ink}">${esc(b.g.label)}</text>`);
  b.g.pages.forEach((p, idx) => {
    const ry = b.y + HEADER_H + idx * ROW_H;
    svg.push(dot(b.x + PAD + 4, ry + ROW_H / 2, rowPills(p)));
    svg.push(`<text x="${b.x + PAD + 16}" y="${ry + ROW_H / 2 + 4}" font-size="12.5" fill="${C.ink}">${esc(p.label)}</text>`);
    if (p.flag) svg.push(`<text x="${b.x + b.w - PAD}" y="${ry + ROW_H / 2 + 4}" text-anchor="end" font-size="12" fill="${C.flag}">⚠</text>`);
  });
}

// Secondary band
svg.push(`<text x="${M}" y="${secTop - 14}" font-size="11" font-weight="700" letter-spacing="1" fill="${C.muted}">SECONDARY NAVIGATION</text>`);
svg.push(`<rect x="${M}" y="${secTop}" width="${usable}" height="${secBandH}" rx="12" fill="${C.band}" stroke="${C.line}"/>`);
svg.push(`<text x="${M + PAD + 4}" y="${secTop + 28}" font-size="14" font-weight="700" fill="${C.ink}">${esc(sec.label)}</text>`);
svg.push(`<text x="${M + PAD + 4}" y="${secTop + 45}" font-size="11.5" fill="${C.muted}">Feature &amp; solution-led content · rehouses existing primary links</text>`);
const chipAreaX = M + PAD;
const chipW = (usable - PAD * 2 - secChipGap * (secCols - 1)) / secCols;
sec.pages.forEach((p, idx) => {
  const col = idx % secCols, row = Math.floor(idx / secCols);
  const cx = chipAreaX + col * (chipW + secChipGap);
  const cy = secTop + 54 + row * (secChipH + secChipGap);
  svg.push(`<rect x="${cx}" y="${cy}" width="${chipW}" height="${secChipH}" rx="8" fill="#fff" stroke="${C.line}"/>`);
  svg.push(dot(cx + 14, cy + secChipH / 2, rowPills(p)));
  svg.push(`<text x="${cx + 26}" y="${cy + secChipH / 2 + 4}" font-size="12" fill="${C.ink}">${esc(p.label)}</text>`);
  if (p.flag) svg.push(`<text x="${cx + chipW - 12}" y="${cy + secChipH / 2 + 4}" text-anchor="end" font-size="12" fill="${C.flag}">⚠</text>`);
});

// Legend
const ly = legendY;
svg.push(`<text x="${M}" y="${ly - 6}" font-size="11" font-weight="700" letter-spacing="1" fill="${C.muted}">LEGEND</text>`);
svg.push(dot(M + 6, ly + 12, C.approved));
svg.push(`<text x="${M + 18}" y="${ly + 16}" font-size="12" fill="${C.ink}">Approved copy in 2026 content doc</text>`);
svg.push(dot(M + 290, ly + 12, C.none));
svg.push(`<text x="${M + 302}" y="${ly + 16}" font-size="12" fill="${C.ink}">No copy yet (stub only)</text>`);
svg.push(`<text x="${M + 520}" y="${ly + 16}" font-size="12" fill="${C.flag}">⚠</text>`);
svg.push(`<text x="${M + 536}" y="${ly + 16}" font-size="12" fill="${C.ink}">Open decision (under consideration / orphan)</text>`);

svg.push(`</svg>`);

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, svg.join("\n"), "utf8");
console.log(`Wrote ${OUT}`);
