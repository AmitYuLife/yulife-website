/**
 * Batch-encode platform tab hero videos for the home page.
 *
 * Drop source files into input/platform/ named after pillar ids:
 *   engage.mov, prevent.mov, protect.mov, empower.mov
 *
 * Outputs to public/home/platform/:
 *   {id}.mp4          — 10 s, 1600×900, H.264 ~1 MB, faststart, no audio
 *   {id}-poster.jpg   — first-frame poster for instant paint
 *
 * Run: npm run optimize:platform-videos
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join, dirname, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INPUT_DIR = join(ROOT, "input", "platform");
const OUTPUT_DIR = join(ROOT, "public", "home", "platform");

const PILLAR_IDS = ["engage", "prevent", "protect", "empower"];
const VIDEO_EXT = new Set([".mov", ".mp4", ".m4v", ".mkv", ".webm"]);
const DURATION_SEC = 10;
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

  for (const id of PILLAR_IDS) {
    const match = files.find((f) => basename(f, extname(f)) === id && VIDEO_EXT.has(extname(f).toLowerCase()));
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
    console.log(`Expected names: ${PILLAR_IDS.map((id) => `${id}.mov`).join(", ")}`);
    process.exit(1);
  }

  console.log(`\nDone — encoded ${encoded} video(s).`);
}

main();
