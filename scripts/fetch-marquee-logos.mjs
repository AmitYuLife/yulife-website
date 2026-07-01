/**
 * One-time utility: download partner logos and save white SVGs for the hero marquee.
 * Run: node scripts/fetch-marquee-logos.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, "..", "public", "logos", "marquee");

/** @type {{ slug: string; url: string; alreadyWhite?: boolean; type?: "svg" | "png" }[]} */
const SOURCES = [
  { slug: "novartis", url: "https://cdn.worldvectorlogo.com/logos/novartis.svg" },
  { slug: "fujitsu", url: "https://cdn.simpleicons.org/fujitsu/white", alreadyWhite: true },
  { slug: "sodexo", url: "https://cdn.worldvectorlogo.com/logos/sodexo-logo.svg" },
  { slug: "severn-trent", url: "https://cdn.worldvectorlogo.com/logos/severn-trent.svg" },
  { slug: "paramount", url: "https://cdn.worldvectorlogo.com/logos/paramount-1.svg" },
  { slug: "havas", url: "https://cdn.worldvectorlogo.com/logos/havas.svg" },
  { slug: "qinetiq", url: "https://cdn.worldvectorlogo.com/logos/qinetiq.svg" },
  { slug: "wolseley", url: "https://cdn.worldvectorlogo.com/logos/wolseley.svg" },
  { slug: "del-monte", url: "https://cdn.worldvectorlogo.com/logos/del-monte.svg" },
  { slug: "bruntwood", url: "https://cdn.worldvectorlogo.com/logos/bruntwood.svg" },
  { slug: "what3words", url: "https://cdn.simpleicons.org/what3words/white", alreadyWhite: true },
  {
    slug: "curve",
    url: "https://www.curve.com/images/curve-logo.svg",
  },
  {
    slug: "paymentology",
    url: "https://www.paymentology.com/hubfs/pmty25/logo/White%20PMGTY%20Full%20Logo_cropped.svg",
    alreadyWhite: true,
  },
  {
    slug: "moneyhub",
    url: "https://moneyhub.com/wp-content/uploads/2025/11/Moneyhub-Logo-White.svg",
    alreadyWhite: true,
  },
  {
    slug: "abel-and-cole",
    url: "https://www.abelandcole.co.uk/src/images/large_logo.svg",
  },
  {
    slug: "oddbox",
    url: "https://oddbox.cdn.prismic.io/oddbox/aQH7k7pReVYa3ylc_oddbox.svg",
  },
  {
    slug: "xma",
    url: "https://www.xma.co.uk/wp-content/uploads/2024/12/cropped-logo-2-1.png",
    type: "png",
  },
  {
    slug: "nice-pak",
    url: "https://www.nicepak.com/wp-content/uploads/2025/11/logo-nice-pak.png",
    type: "png",
  },
  {
    slug: "mintel",
    url: "https://www.mintel.com/app/uploads/2022/12/Mintel_Favicon-300x300.png",
    type: "png",
  },
  {
    slug: "chillis",
    url: "https://www.chillys.com/cdn/shop/files/logo-ensign.svg",
    skip: true,
  },
];

/** Hand-crafted wordmarks where vector sources are unavailable. */
const WORDMARKS = {
  manypets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 32" fill="#FFFFFF" aria-hidden="true"><text x="0" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" letter-spacing="-0.02em">ManyPets</text></svg>`,
  "itrs-group": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" fill="#FFFFFF" aria-hidden="true"><text x="0" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" letter-spacing="0.08em">ITRS</text></svg>`,
  "wolf-and-badger": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 32" fill="#FFFFFF" aria-hidden="true"><text x="0" y="24" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="400" letter-spacing="0.04em">Wolf &amp; Badger</text></svg>`,
  "abel-and-cole": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 32" fill="#FFFFFF" aria-hidden="true"><text x="0" y="24" font-family="Georgia, 'Times New Roman', serif" font-size="20" font-weight="400" letter-spacing="0.02em">Abel &amp; Cole</text></svg>`,
  chillis: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" fill="#FFFFFF" aria-hidden="true"><text x="0" y="24" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" letter-spacing="-0.01em">Chilly&apos;s</text></svg>`,
};

function whitenSvg(svg, alreadyWhite = false) {
  if (alreadyWhite) return svg;

  let out = svg
    .replace(/<\?xml[^?]*\?>\s*/i, "")
    .replace(/<!DOCTYPE[^>]*>\s*/i, "");

  // Drop full-canvas background rectangles common in WVL exports.
  out = out.replace(
    /<path[^>]*fill="#fff(?:fff)?"[^>]*d="M0 0h[^"]*"[^>]*\/?>\s*/gi,
    "",
  );
  out = out.replace(
    /<rect[^>]*fill="#fff(?:fff)?"[^>]*width="100%"[^>]*\/?>\s*/gi,
    "",
  );

  out = out.replace(/fill="(?!none|transparent)[^"]*"/gi, 'fill="#FFFFFF"');
  out = out.replace(/stroke="(?!none|transparent)[^"]*"/gi, 'stroke="#FFFFFF"');
  out = out.replace(/fill:\s*(?!none|transparent)[^;"']+/gi, "fill:#FFFFFF");
  out = out.replace(/stroke:\s*(?!none|transparent)[^;"']+/gi, "stroke:#FFFFFF");

  return out;
}

function pngToWhiteSvg(pngBuffer, slug) {
  const base64 = pngBuffer.toString("base64");
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" role="img" aria-label="${slug}">
  <defs>
    <filter id="white" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>
    </filter>
  </defs>
  <image width="512" height="512" filter="url(#white)" xlink:href="data:image/png;base64,${base64}" preserveAspectRatio="xMidYMid meet"/>
</svg>`;
}

async function fetchBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; YuLifeWebsite/1.0)",
      Accept: "image/svg+xml,image/png,*/*",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  for (const source of SOURCES) {
    if (source.skip) continue;
    const outPath = join(OUT_DIR, `${source.slug}.svg`);
    try {
      const buf = await fetchBuffer(source.url);
      const isPng =
        source.type === "png" || source.url.endsWith(".png") || buf[0] === 0x89;

      const svg = isPng
        ? pngToWhiteSvg(buf, source.slug)
        : whitenSvg(buf.toString("utf8"), source.alreadyWhite);

      await writeFile(outPath, svg.trim() + "\n");
      console.log(`✓ ${source.slug}`);
    } catch (err) {
      console.error(`✗ ${source.slug}: ${err.message}`);
    }
  }

  for (const [slug, svg] of Object.entries(WORDMARKS)) {
    await writeFile(join(OUT_DIR, `${slug}.svg`), svg.trim() + "\n");
    console.log(`✓ ${slug} (wordmark)`);
  }
}

main();
