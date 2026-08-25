"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { TRUST_MARKS } from "@/components/hero/TrustRatings";
import HeroCoinOrbit from "@/components/businesses/HeroCoinOrbit";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import type { Cta, Rating } from "@/data/pages/types";

gsap.registerPlugin(useGSAP);
// Businesses hero: copy + orbiting YuCoins around the figure.

/**
 * The person cutout — the design's Adobe Stock figure with its purple studio
 * backdrop keyed out to transparent, so it composites cleanly on the hero
 * canvas and the coins can float around it. Exported at ~2x the display box.
 */
const PERSON_SRC = assetPath("/who-we-help/businesses-hero-person.webp");
const PERSON_WIDTH = 962;
const PERSON_HEIGHT = 1300;

export type BusinessesHeroContent = {
  eyebrow: string;
  /** Headline split so the trailing clause renders in italic serif. */
  headline: { lead: string; accent: string };
  body: string;
  cta: Cta;
  ratings: Rating[];
};

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

export default function BusinessesHero({
  eyebrow,
  headline,
  body,
  cta,
  ratings,
}: BusinessesHeroContent) {
  const scope = useRef<HTMLDivElement>(null);
  const personRef = useRef<HTMLImageElement>(null);

  // The copy block glides in on arrival — heading, body and the rows below it
  // lift + fade in DOM order (y: 24 → 0, power3.out, 0.08 stagger), reusing the
  // site's reveal vocabulary. The person cutout rises in alongside it (same
  // vocabulary as ProductHero's HeroImage). Mirrors ProductHero so audience →
  // product reads as one continuous enter.
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
      // reduce: no branch — the copy and image render in their final state.
    },
    { scope },
  );

  return (
    <div
      {...domSrc("BusinessesHero")}
      ref={scope}
      className="hero-dark relative overflow-hidden border-b border-line-emphasis"
      style={{
        backgroundColor: "var(--hero-canvas)",
        marginTop: "calc(-1 * var(--header-h))",
        paddingTop: "var(--header-h)",
      }}
    >
      {/*
        Same frame maths as ProductHero: the hero is pulled up under the sticky
        nav and padded back down by --header-h, then the container adds the
        design's --layout-section-y on top so the copy lands section-y below the
        nav in an equal top/bottom band. The person + coins hang off the content
        box, out of flow, so they never drive the section height; the root's
        overflow-hidden crops the figure at the bottom border.
      */}
      <div className="page-container-wide relative flex flex-col items-center gap-section-gap [padding-top:var(--layout-section-y)] desktop:block desktop:[padding-bottom:var(--layout-section-y)]">
        {/* z-30 keeps the copy above the person/orbit stack (img z-10, canvas z-20)
            so any overlap at narrow desktop widths reads text-over-image. */}
        <div className="relative z-30 flex w-full flex-col items-start gap-flow pt-40 text-left desktop:max-w-[620px]">
          <p className="hero-enter type-eyebrow uppercase text-accent-purple">{eyebrow}</p>
          <h1 className="hero-enter type-heading-h2" style={{ color: "var(--hero-ink)" }}>
            {headline.lead}
            <em className="italic">{headline.accent}</em>
          </h1>
          <p className="hero-enter type-body-lg" style={{ color: "var(--hero-ink)" }}>
            {body}
          </p>
          <div className="hero-enter flex flex-wrap items-center gap-flow">
            <Button
              href={cta.href}
              size="lg"
              variant="solid"
              theme="onDark"
              className="shrink-0 whitespace-nowrap"
            >
              {cta.label}
            </Button>
          </div>
          <TrustRow ratings={ratings} />
        </div>

        {/*
          The figure is pinned to the bottom-right of the content grid so it sits
          flush on the hero's bottom border — no gap below her, cropped at the top
          by the root's overflow-hidden if the copy column is shorter than she is.
          Coins orbit her in 3D in a single canvas layered over the <img>; an
          invisible in-canvas depth mask of the same cutout hides the far-arc
          coins behind her. Below `desktop:` she drops under the copy.
        */}
        <div className="relative mx-auto mt-12 w-full max-w-[420px] shrink-0 desktop:absolute desktop:bottom-0 desktop:right-[var(--container-gutter)] desktop:mt-0 desktop:w-[560px] desktop:max-w-[560px]">
          <img
            ref={personRef}
            src={PERSON_SRC}
            alt=""
            width={PERSON_WIDTH}
            height={PERSON_HEIGHT}
            decoding="async"
            className="relative z-10 block h-auto w-full"
          />
          <HeroCoinOrbit />
        </div>
      </div>
    </div>
  );
}
