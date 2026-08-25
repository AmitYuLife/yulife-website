"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { TRUST_MARKS } from "@/components/hero/TrustRatings";
import HeroImage from "@/components/product/HeroImage";
import HeroCoinOrbit from "@/components/businesses/HeroCoinOrbit";
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
 * Everything is toggleable so a CMS can compose it per page: eyebrow, an
 * italic-accent headline, body, one or more CTAs, an optional carrier lockup,
 * optional ratings, and a swappable visual — either a phone `device` or a
 * `person` cutout with (optionally) orbiting coins.
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
  const personRef = useRef<HTMLImageElement>(null);

  // The copy block glides in on arrival — heading, body and the rows below it
  // lift + fade in DOM order (y: 24 → 0, power3.out, 0.08 stagger). A person
  // visual rises alongside it; a device visual animates itself (HeroImage).
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
        if (personRef.current) {
          gsap.from(personRef.current, {
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
        {/* z-30 keeps copy above the person/orbit stack (img z-10, canvas z-20). */}
        <div className="relative z-30 flex w-full flex-col items-start gap-flow pt-40 text-left desktop:max-w-[620px]">
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
          <p
            className="hero-enter type-body-lg"
            style={{ color: "var(--hero-ink)" }}
          >
            {body}
          </p>
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

        {visual?.kind === "device" && (
          /*
            Device: a static phone mockup pinned to the content grid's top-right
            at its natural width, out of flow so it can't drive the section
            height; the root's overflow-hidden crops it at the bottom border.
          */
          <div className="mx-auto mt-12 w-full max-w-[436px] shrink-0 desktop:absolute desktop:right-[var(--container-gutter)] desktop:top-[var(--layout-section-y)] desktop:mt-0 desktop:w-[436px]">
            <HeroImage
              src={visual.src}
              alt={visual.alt ?? ""}
              width={visual.width}
              height={visual.height}
              className="h-auto w-full"
            />
          </div>
        )}

        {visual?.kind === "person" && (
          /*
            Person: the figure is pinned bottom-right so it sits flush on the
            hero's bottom border, cropped at the top by overflow-hidden if the
            copy column is shorter. When `coins`, YuCoins orbit her in a 3D
            canvas whose depth mask (same cutout) hides the far-arc coins.
          */
          <div className="relative mx-auto mt-12 w-full max-w-[420px] shrink-0 desktop:absolute desktop:bottom-0 desktop:right-[var(--container-gutter)] desktop:mt-0 desktop:w-[560px] desktop:max-w-[560px]">
            <img
              ref={personRef}
              src={visual.src}
              alt={visual.alt ?? ""}
              width={visual.width}
              height={visual.height}
              decoding="async"
              className="relative z-10 block h-auto w-full"
            />
            {visual.coins !== false && <HeroCoinOrbit personSrc={visual.src} />}
          </div>
        )}
      </div>
    </div>
  );
}
