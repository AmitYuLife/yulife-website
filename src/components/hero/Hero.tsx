"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroHeadline from "./HeroHeadline";
import HeroButtons from "./HeroButtons";
import TrustRatings from "./TrustRatings";
import HeroAsset from "./HeroAsset";
import LogoMarquee from "./LogoMarquee";

gsap.registerPlugin(useGSAP);

export type HeroVariant = "product" | "character" | "atmosphere";

interface HeroProps {
  variant?: HeroVariant;
}

export default function Hero({ variant = "atmosphere" }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Set inside useGSAP so the coin-complete callback can trigger the copy
  // reveal built with the correct (motion vs reduced-motion) choreography.
  const revealCopyRef = useRef<() => void>(() => {});
  const revealFiredRef = useRef(false);

  const revealCopy = useCallback(() => {
    if (revealFiredRef.current) return;
    revealFiredRef.current = true;
    revealCopyRef.current();
  }, []);

  // Safety net: if the WebGL fountain never reports completion (failed to
  // mount, no coins), reveal the copy anyway so the hero can't get stuck with
  // the headline permanently collapsed.
  useEffect(() => {
    const fallback = window.setTimeout(revealCopy, 6000);
    return () => window.clearTimeout(fallback);
  }, [revealCopy]);

  useGSAP(
    () => {
      // The copy block (headline → trust ratings) and the phone/coins are
      // choreographed in two phases: the phone appears first and high, the
      // coins fountain from behind it, and only when they land does the copy
      // unfold — its 0 → auto height growth pushing the phone and the rest of
      // the page down into the final layout.
      const copyLines = [
        ".hero-headline h1",
        ".hero-headline p",
        ".hero-cta-row",
        ".hero-ratings",
      ];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Start collapsed + hidden. overflow:hidden clips the copy while the
        // container has zero height; it's released once the unfold lands.
        gsap.set(".hero-copy", { height: 0, overflow: "hidden" });
        gsap.set(copyLines, { opacity: 0, y: 24 });
        gsap.set(".hero-asset", { opacity: 0, y: 24 });

        // Phase 1 — the phone appears first. The coin field arms off this
        // fade (HeroCoinField watches .hero-asset's opacity) and fountains.
        gsap.to(".hero-asset", {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        });

        // Phase 2 — fired by the fountain landing (revealCopy). The height
        // tween and the line reveals run together, so the push down and the
        // copy appearing read as one connected motion.
        revealCopyRef.current = () => {
          // How far the copy's growth will push the asset (phone + coins) down.
          const copyEl =
            sectionRef.current?.querySelector<HTMLElement>(".hero-copy");
          const pushDistance = copyEl?.scrollHeight ?? 0;
          // Pin the coins in place only on tablet+. On mobile they drop away
          // after landing (HeroAsset), so there's nothing to hold.
          const pinCoins = window.matchMedia("(min-width: 768px)").matches;

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.to(
            ".hero-copy",
            {
              height: "auto",
              duration: 0.75,
              ease: "power3.inOut",
              onComplete: () =>
                // Drop the clip + fixed height so later reflow (resize, font
                // swaps) and button hover/focus rings aren't constrained.
                gsap.set(".hero-copy", { height: "auto", overflow: "visible" }),
            },
            0,
          );

          if (pinCoins) {
            // The landed coins hold their on-screen position: the push moves the
            // whole asset (phone + coins) down by pushDistance, so shift the coin
            // layer up by the same amount + ease to cancel it out — the phone
            // slides down out of a coin field that stays put. HeroAsset's
            // scroll-follow composes on the nested .hero-coin-scroll.
            tl.to(
              ".hero-coin-spill",
              { y: -pushDistance, duration: 0.75, ease: "power3.inOut" },
              0,
            );
          }

          tl.to(".hero-headline h1", { opacity: 1, y: 0, duration: 0.5 }, 0.08)
            .to(".hero-headline p", { opacity: 1, y: 0, duration: 0.45 }, "<0.12")
            .to(".hero-cta-row", { opacity: 1, y: 0, duration: 0.4 }, "<0.12")
            .to(".hero-ratings", { opacity: 1, y: 0, duration: 0.35 }, "<0.1");
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No motion: land straight in the final layout, everything visible.
        gsap.set(".hero-copy", { height: "auto", overflow: "visible" });
        gsap.set([...copyLines, ".hero-asset"], { opacity: 1, y: 0 });
        revealCopyRef.current = () => {};
      });
    },
    { scope: sectionRef },
  );

  return (
    <div
      ref={sectionRef}
      className="hero-dark relative overflow-visible"
      style={{
        backgroundColor: "var(--hero-canvas)",
        // Pull the dark canvas up beneath the sticky header so the purple sits
        // flush behind the nav; padding restores the inner spacing below it.
        marginTop: "calc(-1 * var(--header-h))",
        paddingTop: "var(--header-h)",
      }}
    >
      <section
        className="relative isolate flex flex-col items-center overflow-visible"
      >
        {variant === "product" && <ProductBackground />}
        {variant === "character" && <CharacterBackground />}

        <div className="page-container relative z-10 flex w-full flex-col items-center pt-24 md:pt-32 lg:pt-36">
          {/* The top padding stays outside the collapse so the phone keeps a
              comfortable gap under the nav while the copy is folded away.
              .hero-copy animates height 0 → auto to push the phone + page down. */}
          <div className="hero-copy w-full">
            <div className="hero-copy-inner flex w-full flex-col items-center gap-flow">
              <HeroHeadline />
              <HeroButtons />
              <TrustRatings />
            </div>
          </div>
        </div>

        <div className="relative z-0 mt-section-gap w-full">
          <HeroAsset onEntranceComplete={revealCopy} />
        </div>
      </section>

      <section
        className="relative z-10 -mt-20 border-t border-b tablet:-mt-28 desktop:-mt-40"
        style={{
          borderColor: "var(--hero-divider)",
          backgroundColor: "var(--hero-canvas)",
        }}
      >
        <LogoMarquee />
      </section>
    </div>
  );
}

/**
 * Placeholder backgrounds for the other two variant directions.
 * These are structural stubs — swap with real implementations when
 * product UI mockups or character illustrations are available.
 */
function ProductBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(135deg, var(--hero-mist) 0%, var(--hero-canvas) 100%)",
      }}
    />
  );
}

function CharacterBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(160deg, var(--hero-canvas) 0%, color-mix(in oklch, var(--hero-sage) 8%, white) 50%, var(--hero-canvas) 100%)",
      }}
    />
  );
}
