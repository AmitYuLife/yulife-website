"use client";

import { useRef, useState } from "react";
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
const PIXELS_PER_SECOND = 24;

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
              opacity: 0.8,
            }}
            draggable={false}
          />
        </li>
      ))}
    </ul>
  );
}

function copiesForViewport(containerWidth: number, setWidth: number): number {
  const distance = setWidth + LOGO_GAP_PX;
  if (distance <= 0) return 2;
  // Enough duplicated sets so every scroll offset fills the full row width.
  return Math.max(2, Math.ceil((containerWidth + distance) / distance));
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
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const [copyCount, setCopyCount] = useState(2);

  useGSAP(
    () => {
      const container = containerRef.current;
      const track = trackRef.current;
      const set = track?.querySelector<HTMLUListElement>(".marquee-set");
      if (!container || !track || !set) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const syncLayout = () => {
          const needed = copiesForViewport(
            container.offsetWidth,
            set.offsetWidth,
          );
          setCopyCount((prev) => (prev === needed ? prev : needed));
        };

        const startLoop = () => {
          syncLayout();

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
    { dependencies: [direction, copyCount] },
  );

  return (
    <div ref={containerRef} className="overflow-hidden py-2.5">
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ gap: LOGO_GAP_PX }}
      >
        {Array.from({ length: copyCount }, (_, index) => (
          <LogoSet
            key={`${rowKey}-${index}`}
            brands={brands}
            setKey={`${rowKey}-${index}`}
            aria={index > 0}
          />
        ))}
      </div>
    </div>
  );
}

export default function LogoMarquee() {
  return (
    <div className="hero-marquee w-full py-14 md:py-20">
      <div
        className="relative flex flex-col gap-flow"
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
