"use client";

import { useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const PIXELS_PER_SECOND = 48;

function copiesForViewport(containerWidth: number, setWidth: number) {
  if (setWidth <= 0) return 2;
  return Math.max(2, Math.ceil(containerWidth / setWidth) + 1);
}

function MarqueePhrase({ text, measureRef }: { text: string; measureRef?: RefObject<HTMLSpanElement | null> }) {
  return (
    <span ref={measureRef} className="platform-heading-marquee-text shrink-0">
      {text}
    </span>
  );
}

export default function PlatformHeadingMarquee({ heading }: { heading: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLSpanElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [copyCount, setCopyCount] = useState(2);

  const phrase = `${heading.trim()}. `;

  useGSAP(
    () => {
      const container = containerRef.current;
      const track = trackRef.current;
      const set = setRef.current;
      if (!container || !track || !set) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const startLoop = () => {
          const needed = copiesForViewport(container.offsetWidth, set.offsetWidth);
          setCopyCount((prev) => (prev === needed ? prev : needed));

          tweenRef.current?.kill();
          const distance = set.offsetWidth;
          if (distance <= 0) return;

          gsap.set(track, { x: 0 });
          tweenRef.current = gsap.to(track, {
            x: -distance,
            duration: distance / PIXELS_PER_SECOND,
            ease: "none",
            repeat: -1,
          });
        };

        startLoop();

        const ro = new ResizeObserver(startLoop);
        ro.observe(container);
        ro.observe(set);

        return () => {
          ro.disconnect();
          tweenRef.current?.kill();
          tweenRef.current = null;
          gsap.set(track, { x: 0 });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        tweenRef.current?.kill();
        tweenRef.current = null;
        gsap.set(track, { x: 0 });
      });

      return () => mm.revert();
    },
    { dependencies: [heading, copyCount] },
  );

  return (
    <div ref={containerRef} className="platform-heading-marquee pointer-events-none absolute inset-0 flex items-center overflow-hidden" aria-hidden>
      <div
        ref={trackRef}
        className="platform-heading-marquee-track flex w-max will-change-transform"
      >
        {Array.from({ length: copyCount }, (_, index) => (
          <MarqueePhrase key={index} text={phrase} measureRef={index === 0 ? setRef : undefined} />
        ))}
      </div>
    </div>
  );
}
