import { assetPath } from "@/lib/assetPath";

/**
 * The "yunity" wordmark with the brand-gradient sparkle on the i (Figma
 * 1731:2441). Rendered from the official raster export
 * (`/home/yunity-logo.webp`, white glyphs + gradient sparkle with glow on a
 * transparent ground) rather than hand-reconstructed SVG paths, so the mark is
 * the real brand asset. Size it with a height class (e.g. `h-[52px]`).
 */
export default function YunityWordmark({ className = "" }: { className?: string }) {
  return (
    <img
      src={assetPath("/home/yunity-logo.webp")}
      alt="Yunity"
      className={className}
      // Intrinsic size of the export; the height class drives the rendered size.
      width={342}
      height={160}
    />
  );
}
