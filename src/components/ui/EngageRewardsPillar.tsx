"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { engageRewardTiles } from "@/data/home-content";

gsap.registerPlugin(useGSAP);

/** Upward scroll speed of the rewards pillar, in px/s. Gentle ambient drift. */
const PIXELS_PER_SECOND = 46;

function RewardSet({
  measureRef,
}: {
  measureRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={measureRef} className="engage-rewards-set flex flex-col">
      {engageRewardTiles.map((tile) => (
        <div
          key={tile.brand}
          className="engage-reward-coupon mb-[18px] flex aspect-square w-full items-center justify-center overflow-hidden desktop:mb-[24px]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static export; keep raw <img> */}
          <img src={tile.logo} alt="" className="h-auto" style={{ width: tile.logoWidth }} />
        </div>
      ))}
    </div>
  );
}

/** The Engage tab's right-hand rewards pillar: pine coupon cards (drawn in CSS) each
 *  carrying a brand logo, tilted 15° and scrolling up in a seamless loop, clipped by
 *  the parent video container's overflow. The rotation lives on a wrapper so GSAP can
 *  tween the track along the tilted axis; two identical sets loop by one set's height.
 *  Reduced motion freezes the stack (the tilt stays). */
export default function EngageRewardsPillar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const container = containerRef.current;
      const track = trackRef.current;
      const set = setRef.current;
      if (!container || !track || !set) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const startLoop = () => {
          tweenRef.current?.kill();
          const distance = set.offsetHeight;
          if (distance <= 0) return;

          gsap.set(track, { y: 0 });
          tweenRef.current = gsap.to(track, {
            y: -distance,
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
          gsap.set(track, { y: 0 });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        tweenRef.current?.kill();
        tweenRef.current = null;
        gsap.set(track, { y: 0 });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="engage-rewards-pillar pointer-events-none absolute inset-y-0 right-[24px] z-[3] hidden w-[92px] tablet:block desktop:right-[40px] desktop:w-[120px]"
      aria-hidden
    >
      <div className="engage-rewards-rotor absolute inset-0">
        <div ref={trackRef} className="engage-rewards-track flex flex-col will-change-transform">
          <RewardSet measureRef={setRef} />
          <RewardSet />
        </div>
      </div>
    </div>
  );
}
