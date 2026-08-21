"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button } from "@/components/ui/Button";
import { TRUST_MARKS } from "@/components/hero/TrustRatings";
import HeroImage from "@/components/product/HeroImage";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import type { Cta, Rating } from "@/data/pages/types";

gsap.registerPlugin(useGSAP);

const CARRIER_LOGOS: Record<string, { src: string; width: number; height: number; alt: string }> =
  {
    Bupa: { src: assetPath("/logos/carriers/bupa.svg"), width: 123, height: 32, alt: "Bupa" },
  };

/**
 * Same static phone mockup across every product page — exported from the hero
 * design at 2x (436 × 768 at 1x). The export is already cropped to the 768px
 * the design's 928px frame leaves below its 160px top padding, so at 1920 it
 * fills the phone slot exactly; narrower, the bottom border crops it further.
 */
const PHONE_MOCKUP = assetPath("/products/hero-phone-mockup-2x.png");
const PHONE_WIDTH = 436;
const PHONE_HEIGHT = 768;

/**
 * The clause after "… that" is set in italic serif. No hard break: at the
 * design's 620px measure the accent wraps onto its own line on its own.
 */
function Headline({ h1 }: { h1: string }) {
  const breakAt = h1.indexOf(" that ");
  if (breakAt === -1) {
    return <h1 className="hero-enter type-heading-h2" style={{ color: "var(--hero-ink)" }}>{h1}</h1>;
  }
  return (
    <h1 className="hero-enter type-heading-h2" style={{ color: "var(--hero-ink)" }}>
      {h1.slice(0, breakAt + 6)}
      <em className="italic">{h1.slice(breakAt + 6)}</em>
    </h1>
  );
}

function CarrierLockup({ carrier }: { carrier: string }) {
  const logo = CARRIER_LOGOS[carrier];
  return (
    <div className="flex shrink-0 items-center gap-related">
      <span className="type-body-lg whitespace-nowrap" style={{ color: "var(--hero-ink)" }}>
        Underwritten by
      </span>
      {logo ? (
        <img src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
      ) : (
        <span className="type-heading-h5" style={{ color: "var(--hero-ink)" }}>
          {carrier}
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

export default function ProductHero({
  eyebrow,
  h1,
  body,
  ctas,
  carrier,
  ratings,
}: {
  eyebrow?: string;
  h1: string;
  body: string;
  ctas: Cta[];
  carrier: string;
  ratings?: Rating[];
}) {
  const scope = useRef<HTMLDivElement>(null);

  // The copy block glides in on arrival — heading, body and the rows below it
  // lift + fade in DOM order, reusing the site's reveal vocabulary (y: 24 → 0,
  // power3.out, 0.08 stagger; see useReveal). Remounting on each product route
  // replays it, so product → product navigation reads as a continuous enter.
  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(
        scope.current?.querySelectorAll(".hero-enter") ?? [],
      );
      if (!items.length) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(items, {
          y: 24,
          opacity: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.08,
          clearProps: "transform,opacity",
        });
      });
      // reduce: no branch — the copy renders in its final, visible state.
    },
    { scope },
  );

  return (
    <div
      {...domSrc("ProductHero")}
      ref={scope}
      className="hero-dark relative overflow-hidden border-b border-line-emphasis"
      style={{
        backgroundColor: "var(--hero-canvas)",
        marginTop: "calc(-1 * var(--header-h))",
        paddingTop: "var(--header-h)",
      }}
    >
      {/*
        Design frame (1920 × 928) sits *below* the nav: its 160px top padding
        is measured from the nav's bottom edge, not the canvas top. The root
        pulls the hero up under the sticky nav (negative margin) and pads it
        back down by --header-h so the purple fills behind the floating pill;
        the container then adds the design's --layout-section-y (160 at XL) on
        top of that, so content lands header-h + section-y from the canvas =
        exactly section-y below the nav. Bottom padding is the same section-y,
        so the copy column sits in an equal 160/160 band (160 + 608 + 160 = the
        design's 928px frame, measured from the nav down). The phone is *not* a
        flow item: it hangs off the content-box top and the bottom border crops
        it — keeping the hero height driven by the copy column, not the phone's
        fixed 768px (which would leave dead space below the copy under 1920,
        where the type scale and section-y step down but the image doesn't).

        Horizontal inset is the 1216 content grid — 620 copy + 160 gap + 436
        phone — landing on the design's 352px section-x at 1920.
      */}
      <div className="page-container-wide relative flex flex-col items-center gap-section-gap [padding-top:var(--layout-section-y)] desktop:block desktop:[padding-bottom:var(--layout-section-y)]">
        {/*
          pt-40 (space/40) drops the heading below the top of the phone so the
          two columns don't start flush with each other. 620px is the measure
          for left-aligned hero copy — wider than the centred-hero measure.
        */}
        <div className="flex w-full flex-col items-start gap-flow pt-40 text-left desktop:max-w-[620px]">
          {eyebrow && (
            <p className="hero-enter type-eyebrow uppercase text-accent-purple">{eyebrow}</p>
          )}
          <Headline h1={h1} />
          <p className="hero-enter type-body-lg" style={{ color: "var(--hero-ink)" }}>
            {body}
          </p>
          {/*
            Figma's ButtonGroup is 620 wide and its single-CTA contents now fit
            it: 264 button + 40 gap + 313 lockup (174 "Underwritten by" + 16 +
            123 Bupa) = 617. flex-nowrap for the one-CTA row is belt-and-braces
            so the lockup never drops a line if a label runs slightly long. A
            two-CTA row (button + button + lockup) is far wider than the gap and
            would run under the phone, so let those wrap and drop the lockup
            onto its own line. Buttons keep their width (shrink-0) so their
            labels never wrap mid-word.
          */}
          <div
            className={`hero-enter flex flex-wrap items-center gap-flow${
              ctas.length === 1 ? " desktop:flex-nowrap" : ""
            }`}
          >
            {ctas.map((cta, i) =>
              i === 0 ? (
                <Button
                  key={cta.label}
                  href={cta.href}
                  size="lg"
                  variant="solid"
                  theme="onDark"
                  className="shrink-0 whitespace-nowrap"
                >
                  {cta.label}
                </Button>
              ) : (
                <Button
                  key={cta.label}
                  href={cta.href}
                  size="lg"
                  variant="outline"
                  theme="onDark"
                  className="shrink-0 whitespace-nowrap"
                >
                  {cta.label}
                </Button>
              ),
            )}
            <CarrierLockup carrier={carrier} />
          </div>
          {ratings && <TrustRow ratings={ratings} />}
        </div>
        {/*
          Figma pins this at the content box's top-right (x 1132 = the 1216
          content's right edge minus 436) at its natural 436 x 768 — never
          scaled. It is out of flow so it can't drive the section height, and
          the root's overflow-hidden is what trims it at the bottom border.
          --container-gutter comes from .page-container-wide, so `right` lands
          on the content edge rather than the padding-box edge. `top` matches
          the copy's inset — section-y below the nav — so the device top lines
          up with the content-box top (both at the design's 160px).
        */}
        <div className="w-full max-w-[436px] shrink-0 desktop:absolute desktop:right-[var(--container-gutter)] desktop:top-[var(--layout-section-y)] desktop:w-[436px]">
          <HeroImage
            src={PHONE_MOCKUP}
            alt=""
            width={PHONE_WIDTH}
            height={PHONE_HEIGHT}
            className="h-auto w-full"
          />
        </div>
      </div>
    </div>
  );
}
