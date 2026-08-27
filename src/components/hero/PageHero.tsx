"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { TRUST_MARKS } from "@/components/hero/TrustRatings";
import HeroCoinOrbit from "@/components/businesses/HeroCoinOrbit";
import { cn } from "@/lib/utils";
import { domSrc } from "@/lib/domSrc";
import type { Cta, Rating } from "@/data/pages/types";

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

export type PageHeroContent = {
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
 * The single site hero for content pages (products, audiences, solutions).
 * Every piece is a prop so a page's hero is composed per-page in its data file:
 * eyebrow, an italic-accent headline, body, one or more CTAs, an optional
 * carrier lockup, optional ratings, and a swappable visual — either a phone
 * `device` or a `person` cutout with (optionally) orbiting coins.
 *
 * Replaces the former ProductHero (device + carrier) and BusinessesHero
 * (person + coins); both were the same frame with a different visual.
 */
export default function PageHero({
  eyebrow,
  headline,
  body,
  ctas,
  ratings,
  carrier,
  visual,
}: PageHeroContent) {
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
      {...domSrc("PageHero")}
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
        --header-h, then the container adds the design's --layout-section-y on
        top so the copy lands section-y below the nav in an equal top/bottom
        band. The visual hangs off the content box, out of flow, so it never
        drives the section height; the root's overflow-hidden crops it at the
        bottom border. Horizontal inset is the 1216 content grid.
      */}
      <div className="page-container-wide relative flex flex-col items-center gap-section-gap [padding-top:var(--layout-section-y)] desktop:block desktop:[padding-bottom:var(--layout-section-y)]">
        {/*
          z-30 keeps copy above the person/orbit stack (img z-10, canvas z-20).
          The copy defines the hero's height (Figma: 576px of content between
          equal section-y bands = an 896px hero at XL). The visual is taller than
          the band below its top, so it always runs past the bottom border, where
          the root's overflow-hidden crops it — no gap, and never resized.
        */}
        <div
          className={cn(
            "relative z-30 flex w-full flex-col items-start gap-flow text-left desktop:max-w-[747px]",
            // Figma: with an eyebrow the copy starts at the frame top; without
            // one (the product heroes) the heading sits 40px down.
            eyebrow ? "pt-0" : "pt-40",
          )}
        >
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
                className="hero-enter type-heading-h2"
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
            The visual is a FIXED size, identical on every page (device 436px
            wide, person 560px). It's pinned to the content grid's right edge,
            out of flow so it never drives the section height, and cropped at the
            hero's bottom border by the root's overflow-hidden. The copy column's
            min-height keeps the section at least as tall as the visual, so the
            visual always reaches the border (no gap) without being resized. A
            device sits top-aligned with the copy; a person stands on the bottom
            border.
          */
          <div
            className={cn(
              "relative mx-auto mt-12 w-full shrink-0 desktop:absolute desktop:right-[var(--container-gutter)] desktop:mt-0",
              // Figma: both visuals sit at the content frame's top (y=160 =
              // --layout-section-y), 436px wide for a device and 590px for a
              // person, and are clipped by the hero's bottom border.
              visual.kind === "device"
                ? "max-w-[436px] desktop:top-[var(--layout-section-y)] desktop:w-[436px]"
                : "max-w-[590px] desktop:top-[var(--layout-section-y)] desktop:w-[590px]",
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
              <HeroCoinOrbit personSrc={visual.src} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
