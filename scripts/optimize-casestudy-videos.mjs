/**
 * Batch-encode case study hero videos for the Trusted section's testimonial
 * carousel on the home page.
 *
 * Drop source files into input/platform/casestudies/ named after testimonial
 * ids (see `testimonials` in src/data/home-content.ts), e.g.:
 *   xma.mp4, ozone.mp4, bruntwood.mp4
 * A trailing "-case" suffix is also accepted (e.g. xma-case.mp4), as are the
 * short aliases in ID_ALIASES below (e.g. w3w-case.mp4 for what3words).
 *
 * Outputs to public/home/casestudies/:
 *   {id}.mp4          — 5 s, 1600×900, H.264 ~1 MB, faststart, no audio
 *   {id}-poster.jpg   — first-frame poster for instant paint
 *
 * NOTE: posters are JPG, not WEBP, because the local ffmpeg build (homebrew's
 * default `ffmpeg` formula) has no WEBP encoder. To switch: `brew install
 * webp` for the `cwebp` CLI, then have this script pipe ffmpeg's PNG frame
 * through cwebp and change the poster extension below.
 *
 * Run: npm run optimize:casestudy-videos
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INPUT_DIR = join(ROOT, "input", "platform", "casestudies");
const OUTPUT_DIR = join(ROOT, "public", "home", "casestudies");

const TESTIMONIAL_IDS = ["what3words", "xma", "ozone", "bruntwood", "nicepak"];
// Short source-file names accepted in place of the full testimonial id.
const ID_ALIASES = { what3words: ["w3w"] };
const VIDEO_EXT = new Set([".mov", ".mp4", ".m4v", ".mkv", ".webm"]);
const DURATION_SEC = 5;
// Matches the ~1.73:1 desktop panel (900px sidebar-adjusted width × 520px
// min-height in TrustedTabbedPanel) — same landscape crop as the platform
// tab videos, which the mobile portrait card already cover-crops fine.
const SCALE = "1600:900:force_original_aspect_ratio=increase,crop=1600:900";

function findFfmpeg() {
  for (const bin of ["ffmpeg", "/opt/homebrew/bin/ffmpeg"]) {
    try {
      execFileSync(bin, ["-version"], { stdio: "ignore" });
      return bin;
    } catch {
      /* try next */
    }
  }
  throw new Error("ffmpeg not found — install with: brew install ffmpeg");
}

function encode(ffmpeg, input, mp4Out, posterOut) {
  console.log(`\n→ ${basename(input)}`);
  execFileSync(
    ffmpeg,
    [
      "-y",
      "-i",
      input,
      "-t",
      String(DURATION_SEC),
      "-an",
      "-vf",
      `scale=${SCALE}`,
      "-c:v",
      "libx264",
      "-crf",
      "26",
      "-preset",
      "slow",
      "-movflags",
      "+faststart",
      "-maxrate",
      "950k",
      "-bufsize",
      "1900k",
      "-pix_fmt",
      "yuv420p",
      mp4Out,
    ],
    { stdio: "inherit" },
  );

  execFileSync(
    ffmpeg,
    ["-y", "-i", mp4Out, "-vframes", "1", "-q:v", "2", "-update", "1", posterOut],
    { stdio: "inherit" },
  );

  console.log(`  ✓ ${basename(mp4Out)}`);
  console.log(`  ✓ ${basename(posterOut)}`);
}

function main() {
  const ffmpeg = findFfmpeg();

  if (!existsSync(INPUT_DIR)) {
    console.error(`Missing input dir: ${INPUT_DIR}`);
    process.exit(1);
  }

  const files = readdirSync(INPUT_DIR);
  let encoded = 0;

  for (const id of TESTIMONIAL_IDS) {
    const candidates = [id, ...(ID_ALIASES[id] ?? [])];
    const match = files.find((f) => {
      const name = basename(f, extname(f));
      return (
        candidates.some((c) => name === c || name === `${c}-case`) &&
        VIDEO_EXT.has(extname(f).toLowerCase())
      );
    });
    if (!match) continue;

    encode(
      ffmpeg,
      join(INPUT_DIR, match),
      join(OUTPUT_DIR, `${id}.mp4`),
      join(OUTPUT_DIR, `${id}-poster.jpg`),
    );
    encoded++;
  }

  if (encoded === 0) {
    console.log(`No source files found in ${INPUT_DIR}`);
    console.log(`Expected names: ${TESTIMONIAL_IDS.map((id) => `${id}.mov`).join(", ")}`);
    process.exit(1);
  }

  console.log(`\nDone — encoded ${encoded} video(s).`);
}

main();
