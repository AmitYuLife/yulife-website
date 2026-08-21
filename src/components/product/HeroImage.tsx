"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/**
 * The product hero's phone mockup. It rises up on arrival — mirroring the
 * homepage hero phone (y: 24 → 0, power3.out, 0.45s) — so the device slides
 * into place as the page lands. Remounting on each product route replays it.
 *
 * Under `prefers-reduced-motion: reduce` the image lands in place, no rise.
 */
export default function HeroImage({
  src,
  width,
  height,
  alt,
  className,
}: {
  src: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const img = imgRef.current;
      if (!img) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(img, {
          y: 24,
          opacity: 0,
          duration: 0.45,
          ease: "power3.out",
          clearProps: "transform,opacity",
        });
      });
      // reduce: no branch — the image renders in its final position.
    },
    { scope },
  );

  return (
    <div ref={scope}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        decoding="async"
        className={className}
      />
    </div>
  );
}
