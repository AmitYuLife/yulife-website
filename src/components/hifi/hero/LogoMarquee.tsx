"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { hero } from "@/data/home-content";
import {
  MARQUEE_LOGO_SLUGS,
  marqueeLogoSrc,
  type MarqueeBrandName,
} from "@/data/marquee-logos";

gsap.registerPlugin(useGSAP);

const LOGO_HEIGHT_PX = 34;
const LOGO_GAP_PX = 56;
const LOGO_SLOT_MAX_PX = 132;
/** Scroll speed — keeps loop duration proportional to track width. */
const PIXELS_PER_SECOND = 80;

const approvedBrands = hero.marquee
  .filter((b) => b.approved)
  .map((brand) => ({
    ...brand,
    logoSlug: MARQUEE_LOGO_SLUGS[brand.name as MarqueeBrandName],
  }))
  .filter((brand): brand is typeof brand & { logoSlug: string } =>
    Boolean(brand.logoSlug),
  );

const mid = Math.ceil(approvedBrands.length / 2);
const ROWS = [approvedBrands.slice(0, mid), approvedBrands.slice(mid)] as const;

type Brand = (typeof approvedBrands)[number];

function LogoSet({
  brands,
  setKey,
  aria,
}: {
  brands: readonly Brand[];
  setKey: string;
  aria?: boolean;
}) {
  return (
    <ul
      className="marquee-set flex list-none items-center p-0"
      style={{ gap: LOGO_GAP_PX }}
      aria-hidden={aria ? true : undefined}
    >
      {brands.map((brand) => (
        <li
          key={`${setKey}-${brand.logoSlug}`}
          className="flex shrink-0 items-center justify-center"
          style={{ width: LOGO_SLOT_MAX_PX, height: LOGO_HEIGHT_PX }}
        >
          <Image
            src={marqueeLogoSrc(brand.logoSlug)}
            alt=""
            width={LOGO_SLOT_MAX_PX}
            height={LOGO_HEIGHT_PX}
            className="max-h-full max-w-full object-contain object-center"
            style={{
              height: LOGO_HEIGHT_PX,
              width: "auto",
              maxWidth: LOGO_SLOT_MAX_PX,
              // Render the (dark) brand SVGs as solid white on the indigo canvas
              filter: "brightness(0) invert(1)",
              opacity: 0.8,
            }}
            draggable={false}
          />
        </li>
      ))}
    </ul>
  );
}

function MarqueeRow({
  brands,
  direction,
  rowKey,
}: {
  brands: readonly Brand[];
  /** 1 → scrolls left, -1 → scrolls right */
  direction: 1 | -1;
  rowKey: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const set = track?.querySelector<HTMLUListElement>(".marquee-set");
      if (!track || !set) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const startLoop = () => {
          tweenRef.current?.kill();
          const distance = set.offsetWidth + LOGO_GAP_PX;
          if (distance <= 0) return;

          const from = direction === 1 ? 0 : -distance;
          const to = direction === 1 ? -distance : 0;
          gsap.set(track, { x: from });

          tweenRef.current = gsap.to(track, {
            x: to,
            duration: distance / PIXELS_PER_SECOND,
            ease: "none",
            repeat: -1,
          });
        };

        startLoop();

        const ro = new ResizeObserver(startLoop);
        ro.observe(set);

        const onEnter = () => tweenRef.current?.pause();
        const onLeave = () => tweenRef.current?.resume();
        track.addEventListener("mouseenter", onEnter);
        track.addEventListener("mouseleave", onLeave);

        return () => {
          ro.disconnect();
          track.removeEventListener("mouseenter", onEnter);
          track.removeEventListener("mouseleave", onLeave);
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
    { dependencies: [direction] },
  );

  return (
    <div className="overflow-hidden py-2.5">
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ gap: LOGO_GAP_PX }}
      >
        <LogoSet brands={brands} setKey={`${rowKey}-a`} />
        <LogoSet brands={brands} setKey={`${rowKey}-b`} aria />
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <div className="hero-marquee w-full py-14 md:py-20">
      <div
        className="relative flex flex-col gap-4"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <MarqueeRow brands={ROWS[0]} direction={1} rowKey="row1" />
        <MarqueeRow brands={ROWS[1]} direction={-1} rowKey="row2" />
      </div>
    </div>
  );
}
