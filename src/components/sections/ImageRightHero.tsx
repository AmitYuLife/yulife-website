"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { TRUST_MARKS } from "@/components/ui/TrustRatings";
import { cn } from "@/lib/utils";
import { domSrc } from "@/lib/domSrc";
import type { Cta, Rating } from "@/data/pages/types";

// Deferred so its three.js / R3F weight never lands on the initial bundle —
// the orbit already fades in after load, so lazy-loading it is invisible.
// Same treatment as the home hero's SpinningCoin3D.
const HeroCoinOrbit = dynamic(() => import("@/components/three/HeroCoinOrbit"), {
  ssr: false,
});

gsap.registerPlugin(useGSAP);

/** Optional "Underwritten by …" lockup. Pass a logo to show the mark, else the name. */
export type HeroCarrier = {
  name: string;
  logo?: { src: string; width: number; height: number };
};

/**
 * The hero's right-hand visual. Two shapes, both with a swappable image:
 * - `device`: a static phone mockup, pinned top-right, cropped at the bottom.
 * - `person`: a figure cutout pinned bottom-right, optionally with orbiting
 *   YuCoins (the depth-masked 3D canvas). `coins` defaults to true.
 */
export type HeroVisual =
  | { kind: "device"; src: string; alt?: string; width: number; height: number }
  | {
      kind: "person";
      src: string;
      alt?: string;
      width: number;
      height: number;
      coins?: boolean;
    };

export type ImageRightHeroContent = {
  eyebrow?: string;
  /** Split so the trailing clause (`accent`) renders in italic serif. */
  headline: { lead: string; accent?: string };
  body: string;
  /** First CTA renders solid, the rest outline. */
  ctas: Cta[];
  ratings?: Rating[];
  carrier?: HeroCarrier;
  visual?: HeroVisual;
};

function CarrierLockup({ carrier }: { carrier: HeroCarrier }) {
  return (
    <div className="hero-enter flex shrink-0 items-center gap-related">
      <span
        className="type-body-lg whitespace-nowrap"
        style={{ color: "var(--hero-ink)" }}
      >
        Underwritten by
      </span>
      {carrier.logo ? (
        <img
          src={carrier.logo.src}
          alt={carrier.name}
          width={carrier.logo.width}
          height={carrier.logo.height}
        />
      ) : (
        <span className="type-heading-h5" style={{ color: "var(--hero-ink)" }}>
          {carrier.name}
        </span>
      )}
    </div>
  );
}

function TrustRow({ ratings }: { ratings: Rating[] }) {
  return (
    <div className="hero-enter flex flex-wrap items-center gap-x-flow gap-y-stack">
      {ratings.map((r) => {
        const mark = TRUST_MARKS[r.platform];
        return (
          <div key={r.platform} className="flex items-center gap-inline">
            {mark && (
              <span
                className="relative shrink-0 overflow-hidden"
                style={{ width: mark.width, height: mark.height }}
              >
                <img
                  src={mark.src}
                  alt=""
                  width={mark.width}
                  height={mark.height}
                  className="size-full object-contain"
                  aria-hidden
                />
              </span>
            )}
            <span className="type-heading-h5" style={{ color: "var(--hero-ink)" }}>
              {r.score}
            </span>
            <span className="sr-only">
              {r.platform} rated {r.score} out of 5
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * The single site hero for content pages (products, audiences, solutions):
 * content on the LEFT, a swappable image on the RIGHT. Every piece is a prop so
 * a page's hero is composed per-page in its data file: eyebrow, an italic-accent
 * headline, body, one or more CTAs, an optional carrier lockup, optional
 * ratings, and a visual — either a phone `device` or a `person` cutout with
 * (optionally) orbiting coins.
 *
 * Replaces the former ProductHero (device + carrier) and BusinessesHero
 * (person + coins); both were the same frame with a different visual.
 *
 * Layout (Figma "HeroSection", node 2520:10233):
 * - The copy and the visual live in ONE flex row inside the 1216px content band.
 *   The row's `gap-80` is the design's fixed 80px gutter between them; the copy
 *   column takes the rest (`flex-1`), so for a 436px device it lands at exactly
 *   700px (1216 − 80 − 436), matching the design without hardcoding its width.
 * - The copy sits in an equal 160px top/bottom band (`py-160`). On desktop the
 *   hero is at least 900px tall; taller copy grows it, revealing more of the
 *   device, which overflows the bottom border and is cropped by the root's
 *   `overflow-hidden`. The visual is out of flow (absolute) so it never drives
 *   the section height.
 */
export default function ImageRightHero({
  eyebrow,
  headline,
  body,
  ctas,
  ratings,
  carrier,
  visual,
}: ImageRightHeroContent) {
  const scope = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLImageElement>(null);

  // The copy block glides in on arrival — heading, body and the rows below it
  // lift + fade in DOM order (y: 24 → 0, power3.out, 0.08 stagger). The visual
  // (device or person) rises in alongside it.
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(
        scope.current?.querySelectorAll(".hero-enter") ?? [],
      );
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (items.length) {
          gsap.from(items, {
            y: 24,
            opacity: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
          });
        }
        if (visualRef.current) {
          gsap.from(visualRef.current, {
            y: 24,
            opacity: 0,
            duration: 0.45,
            ease: "power3.out",
            clearProps: "transform,opacity",
          });
        }
      });
      // reduce: no branch — everything renders in its final, visible state.
    },
    { scope },
  );

  const singleCta = ctas.length === 1;

  return (
    <div
      {...domSrc("ImageRightHero")}
      ref={scope}
      className="hero-dark relative overflow-hidden border-b border-line-emphasis"
      style={{
        backgroundColor: "var(--hero-canvas)",
        marginTop: "calc(-1 * var(--header-h))",
        paddingTop: "var(--header-h)",
      }}
    >
      {/*
        The hero is pulled up under the sticky nav and padded back down by
        --header-h. Inside that, the row adds the design's 160px top/bottom
        band so the copy lands in an equal band below the nav. The visual hangs
        off the row (absolute, out of flow) so it never drives the section
        height; the root's overflow-hidden crops it at the bottom border.
        Horizontal inset is the 1216 content grid.
      */}
      <div className="page-container-wide relative flex flex-col gap-section-gap py-[var(--layout-section-y)] desktop:min-h-[900px] desktop:flex-row desktop:items-start desktop:gap-80 desktop:py-160">
        {/*
          z-30 keeps copy above the person/orbit stack (img z-10, canvas z-20).
          On desktop the copy column is flex-1: with a fixed-width visual and the
          80px row gap, it fills the remainder of the 1216 band (700px for a
          436px device). min-w-0 lets it shrink rather than overflow.
        */}
        <div className="relative z-30 flex w-full flex-col items-start gap-flow text-left desktop:min-w-0 desktop:flex-1">
          {/* Figma HeadingDescription: eyebrow+heading, then body 24px below. */}
          <div className="flex flex-col gap-stack">
            {/* Figma EyebrowHeading: only 8px between the eyebrow and the h1. */}
            <div className="flex flex-col gap-inline">
              {eyebrow && (
                <p className="hero-enter type-eyebrow uppercase text-accent-purple">
                  {eyebrow}
                </p>
              )}
              <h1
                // whitespace-pre-line lets a headline honour an explicit "\n"
                // in `lead` (the design controls the wrap point, e.g. Businesses
                // breaks after "Benefits that"); headlines without one wrap
                // normally.
                className="hero-enter type-heading-h2 whitespace-pre-line"
                style={{ color: "var(--hero-ink)" }}
              >
                {headline.lead}
                {headline.accent && <em className="italic">{headline.accent}</em>}
              </h1>
            </div>
            <p
              className="hero-enter type-body-lg"
              style={{ color: "var(--hero-ink)" }}
            >
              {body}
            </p>
          </div>
          {/*
            A single CTA sits on one line with the carrier lockup (nowrap at
            desktop). Two-plus CTAs are wider than the row, so let them wrap and
            drop the lockup onto its own line. Buttons keep their width so labels
            never wrap mid-word.
          */}
          <div
            className={`hero-enter flex flex-wrap items-center gap-flow${
              singleCta ? " desktop:flex-nowrap" : ""
            }`}
          >
            {ctas.map((cta, i) => (
              <Button
                key={cta.label}
                href={cta.href}
                size="lg"
                variant={i === 0 ? "solid" : "outline"}
                theme="onDark"
                className="shrink-0 whitespace-nowrap"
              >
                {cta.label}
              </Button>
            ))}
            {carrier && <CarrierLockup carrier={carrier} />}
          </div>
          {ratings && <TrustRow ratings={ratings} />}
        </div>

        {visual && (
          /*
            The visual column is the SAME 436px-wide anchor for BOTH variants —
            it's a shrink-0 flex item, so the 80px row gap and the 700px copy
            column (flex-1) are identical whatever the visual. self-stretch gives
            the column the row's content height, so a person can be pinned to the
            bottom band. What differs is only the image layer inside it:

            - device: pinned to the column's TOP, filling its 436px width, so it
              overflows the bottom border and is cropped by the root.
            - person: a LARGER (612px) figure, centred on the 436px anchor and
              pinned to the hero's bottom border, free to clip past the frame on
              every side (Figma node 2495:7455). The frame only anchors it; the
              image keeps its own proportions instead of being squeezed to 436px.

            Both image layers are out of flow on desktop, so the visual never
            drives the section height. On mobile the image is in flow below the
            copy, centred within the 436px column.
          */
          <div className="relative mx-auto w-full max-w-[436px] shrink-0 desktop:mx-0 desktop:w-[436px] desktop:self-stretch">
            <div
              className={cn(
                "relative mx-auto",
                visual.kind === "device"
                  ? "desktop:absolute desktop:inset-x-0 desktop:top-0"
                  : // Centred on the 436px anchor and pinned to the bottom band.
                    // bottom offset = the container's bottom pad (--spacing-160,
                    // matching desktop:py-160), so the figure stands on the border.
                    "w-full desktop:absolute desktop:left-1/2 desktop:bottom-[calc(-1*var(--spacing-160))] desktop:w-[612px] desktop:-translate-x-1/2",
              )}
            >
              <img
                ref={visualRef}
                src={visual.src}
                alt={visual.alt ?? ""}
                width={visual.width}
                height={visual.height}
                decoding="async"
                draggable={false}
                className="relative z-10 block h-auto w-full"
              />
              {visual.kind === "person" && visual.coins !== false && (
                <HeroCoinOrbit personSrc={visual.src} variant="toon" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
