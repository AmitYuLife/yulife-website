/**
 * Download partner logos exported from Figma and save cleaned SVGs for the hero marquee.
 * Run: node scripts/import-figma-marquee-logos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "logos", "marquee");

/** Figma node exports — file PZs2ZaR8I3fShBqvAZxC7U, section 2029:1545 */
const FIGMA_LOGOS = [
  { slug: "novartis", url: "https://www.figma.com/api/mcp/asset/68c7f396-7e44-4ba6-a268-a6cb7eb514f9" },
  { slug: "fujitsu", url: "https://www.figma.com/api/mcp/asset/0f7bb7c5-e8d4-4b9d-a01d-fd68ef51c106" },
  { slug: "sodexo", url: "https://www.figma.com/api/mcp/asset/fd66dafc-b49a-46dd-8d49-c046b27ac47a" },
  { slug: "paramount", url: "https://www.figma.com/api/mcp/asset/df6e722b-ee03-41a3-87a4-bef7d63b6ba8" },
  { slug: "havas", url: "https://www.figma.com/api/mcp/asset/0bb41b62-d7f4-497c-9905-6801846f6842" },
  { slug: "qinetiq", url: "https://www.figma.com/api/mcp/asset/3d90f4c8-7411-4016-a053-3099f0fd1954" },
  { slug: "mintel", url: "https://www.figma.com/api/mcp/asset/fbe38203-f515-4a96-9378-440acc3dc352" },
  { slug: "bruntwood", url: "https://www.figma.com/api/mcp/asset/4d5f3585-ccef-43a8-b455-5bf2326f6fdb" },
  { slug: "kiko-milano", url: "https://www.figma.com/api/mcp/asset/d1a49aee-cee7-4fec-9196-2f2d1bb043e4" },
  { slug: "old-mutual", url: "https://www.figma.com/api/mcp/asset/301f1130-5cdd-420d-aa98-a71f6c03a5f4" },
  { slug: "aviva", url: "https://www.figma.com/api/mcp/asset/ce469d77-d234-4575-ac1e-660878b48bf2" },
  { slug: "dishoom", url: "https://www.figma.com/api/mcp/asset/1c5e87b4-dc72-4608-a168-f6dce1c36b1a" },
  { slug: "xma", url: "https://www.figma.com/api/mcp/asset/9383ea51-49aa-4f7a-91d6-fa8095867303" },
  { slug: "what3words", url: "https://www.figma.com/api/mcp/asset/ad1b4a4c-2f94-4924-b3b3-50e0ac849e39" },
  { slug: "manypets", url: "https://www.figma.com/api/mcp/asset/2406e67d-f56a-41c8-b8af-7b8aa109c9c6" },
  { slug: "curve", url: "https://www.figma.com/api/mcp/asset/08ed29f1-0ef8-4615-a68f-577562fc7dd6" },
  { slug: "paymentology", url: "https://www.figma.com/api/mcp/asset/37f81093-87c3-4fc3-a8e7-9438758a2d8c" },
  { slug: "moneyhub", url: "https://www.figma.com/api/mcp/asset/184461d1-9bd7-4a0f-a908-dd327ceb0bba" },
  { slug: "oddbox", url: "https://www.figma.com/api/mcp/asset/716fe935-92bb-46a3-8675-6d1138600465" },
  { slug: "create-future", url: "https://www.figma.com/api/mcp/asset/211aab5a-9ad0-450a-b471-3ccabdf9906a" },
];

/** Strip Figma artboard chrome from exported SVGs. */
function cleanFigmaSvg(svg) {
  let out = svg
    .replace(/<\?xml[^?]*\?>\s*/i, "")
    .replace(/<!DOCTYPE[^>]*>\s*/i, "");

  // Preview / artboard backgrounds bundled in exports.
  out = out.replace(/<rect[^>]*fill="#2[Cc]2[Cc]2[Cc]"[^>]*\/?>\s*/gi, "");
  out = out.replace(/<path[^>]*fill="#444444"[^>]*\/?>\s*/gi, "");
  out = out.replace(
    /<path[^>]*fill="white"[^>]*fill-opacity="0\.1"[^>]*\/?>\s*/gi,
    "",
  );

  // Drop the outer Logos section wrapper — keep brand content + defs.
  out = out.replace(/<g id="Logos">\s*/i, "");
  out = out.replace(/\s*<\/g>\s*(<defs>)/i, "\n$1");
  out = out.replace(/\s*<\/g>\s*<\/svg>/i, "\n</svg>");

  return out.trim() + "\n";
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const { slug, url } of FIGMA_LOGOS) {
    const outPath = join(OUT_DIR, `${slug}.svg`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const svg = cleanFigmaSvg(await res.text());
      await writeFile(outPath, svg);
      console.log(`✓ ${slug}`);
    } catch (err) {
      console.error(`✗ ${slug}: ${err.message}`);
    }
  }
}

main();
