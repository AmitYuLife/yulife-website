import Image from "next/image";

/**
 * Decorative rainbow-line motif that sits at the foot of the hero. The source
 * artwork is authored at 1920px wide; on narrower viewports it stays centred
 * and lets the outer container crop the ends, matching the Figma frame.
 */
export default function HeroCurves() {
  return (
    <div
      className="hero-curves relative h-[280px] w-full overflow-hidden md:h-[400px]"
      aria-hidden="true"
    >
      <Image
        src="/hero/curves.svg"
        alt=""
        width={1920}
        height={400}
        priority={false}
        draggable={false}
        className="absolute left-1/2 top-0 h-full w-[1920px] max-w-none -translate-x-1/2"
      />
    </div>
  );
}
