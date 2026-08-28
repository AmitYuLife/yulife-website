"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroHeadline from "@/components/ui/HeroHeadline";
import { Button } from "@/components/ui/Button";
import TrustRatings from "@/components/ui/TrustRatings";
import HeroAsset from "@/components/three/HeroAsset";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import { domSrc } from "@/lib/domSrc";

gsap.registerPlugin(useGSAP);

/** The phone's own arrival, before anything else happens. */
const FADE_DURATION = 0.45;
/** Beat the phone holds still after arriving, before the jolt, in seconds. */
const JOLT_BEAT = 0.2;
/** How far the phone kicks up, px. Enough to read as a knock, not a bounce. */
const JOLT_DISTANCE = 14;
const JOLT_UP_DURATION = 0.1;
const JOLT_SETTLE_DURATION = 0.45;

export type HeroVariant = "product" | "character" | "atmosphere";

interface HeroProps {
  variant?: HeroVariant;
}

export default function Hero({ variant = "atmosphere" }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  // Set inside useGSAP so the coin-complete callback can trigger the copy
  // reveal built with the correct (motion vs reduced-motion) choreography.
  const revealCopyRef = useRef<() => void>(() => {});
  const revealFiredRef = useRef(false);
  const introStartedRef = useRef(false);

  const revealCopy = useCallback(() => {
    if (revealFiredRef.current) return;
    revealFiredRef.current = true;
    revealCopyRef.current();
  }, []);

  // Handed to the coin field so the fountain is triggered BY the phone's jolt
  // rather than guessing at the intro's progress. Re-rendering here is safe:
  // useGSAP has no deps, so the timeline is built once and isn't disturbed.
  const [coinsArmed, setCoinsArmed] = useState(false);
  const launchCoins = useCallback(() => setCoinsArmed(true), []);

  // The secondary CTA matches the primary's rendered width — Button doesn't
  // forward a ref, so the primary is measured via its wrapper instead.
  const primaryCtaRef = useRef<HTMLSpanElement>(null);
  const [ctaWidth, setCtaWidth] = useState<number>();

  useEffect(() => {
    const el = primaryCtaRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setCtaWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

        // Phase 2 — fired by the coin field as the penultimate coin lands, so the
        // drop begins just as the fountain finishes settling. The height tween and
        // the line reveals run together, so the push down and the copy appearing
        // read as one connected motion.
        revealCopyRef.current = () => {
          // How far the copy's growth will push the asset (phone + coins) down.
          const copyEl =
            sectionRef.current?.querySelector<HTMLElement>(".hero-copy");
          const pushDistance = copyEl?.scrollHeight ?? 0;
          // Pin the coins in place only on tablet+. On mobile they drop away
          // after landing (HeroAsset), so there's nothing to hold.
          const pinCoins = window.matchMedia("(min-width: 768px)").matches;

          // A brisk shove rather than a glide: the whole travel in 300ms. Still
          // quicker than the coins themselves (~2700px/s peak against their
          // 450–650), but by the time this fires they've all but settled, so
          // there's nothing left to pace against.
          //
          // Ease-OUT so it starts immediately and lands softly instead of
          // stopping dead. Both this and the counter-shift below must keep
          // matching durations and easings so they cancel exactly throughout,
          // not just at the end — that's what holds the coins' screen positions
          // steady while the phone drops out from under them.
          const PUSH = { duration: 0.3, ease: "power2.out" } as const;

          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          tl.to(
            ".hero-copy",
            {
              height: "auto",
              ...PUSH,
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
            tl.to(".hero-coin-spill", { y: -pushDistance, ...PUSH }, 0);
          }

          tl.to(".hero-headline h1", { opacity: 1, y: 0, duration: 0.5 }, 0.08)
            .to(".hero-headline p", { opacity: 1, y: 0, duration: 0.45 }, "<0.12")
            .to(".hero-cta-row", { opacity: 1, y: 0, duration: 0.4 }, "<0.12")
            .to(".hero-ratings", { opacity: 1, y: 0, duration: 0.35 }, "<0.1");
        };

        // Phase 1 — the phone arrives on its own, holds for a beat, then takes a
        // jolt: something knocks it, and the coins are knocked loose with it.
        //
        // The jolt goes on the phone IMAGE, not .hero-asset (which contains the
        // coin canvas — jolting that would carry the coins along and kill the
        // effect) and not .hero-asset-scene (centred with -translate-x-1/2, which
        // GSAP overwrites with translate:none, throwing the phone off-centre).
        // The img is positioned with left/top percentages, so y is free.
        let fallback = 0;
        const startIntro = () => {
          if (introStartedRef.current) return;
          introStartedRef.current = true;

          // Absolute positions: the jolt's own timing is stated once, rather than
          // chaining off whichever tween happened to be added last.
          const joltAt = FADE_DURATION + JOLT_BEAT;
          const intro = gsap.timeline();
          intro.to(
            ".hero-asset",
            { opacity: 1, y: 0, duration: FADE_DURATION, ease: "power3.out" },
            0,
          );
          intro.to(
            ".hero-asset-phone",
            {
              y: -JOLT_DISTANCE,
              duration: JOLT_UP_DURATION,
              ease: "power2.out",
              // Fired on the upstroke, so the burst and the kick are the same
              // event. The furthest-reaching coins launch first and clear the
              // phone almost instantly (heroAssetLayout), so they break cover
              // while it's still moving rather than a beat later.
              onStart: launchCoins,
            },
            joltAt,
          );
          // Recoil: back past rest, then settle.
          intro.to(
            ".hero-asset-phone",
            { y: 0, duration: JOLT_SETTLE_DURATION, ease: "back.out(2.2)" },
            joltAt + JOLT_UP_DURATION,
          );
          // Phase 2 isn't on this timeline: the coin field calls revealCopy as the
          // penultimate coin lands, which the intro can't know the timing of.
          // Safety net: if the WebGL fountain never reports completion (failed
          // to mount, no coins), reveal the copy anyway so the hero can't get
          // stuck with the headline permanently collapsed. Armed with the
          // intro, never before — see the gate below.
          fallback = window.setTimeout(revealCopy, 6000);
        };

        // The intro is viewport-gated. It changes page layout (the copy's
        // 0 → auto growth pushes the phone and everything under it down) and it
        // spends the one-shot coin fountain, so running it off screen both
        // shoves the reader's scroll position and burns the burst — and the
        // coins would then be flying relative to a phone that has already moved.
        const scene = sceneRef.current;
        if (!scene) {
          startIntro();
          return;
        }

        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          startIntro();
        });
        observer.observe(scene);

        return () => {
          observer.disconnect();
          window.clearTimeout(fallback);
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No motion: land straight in the final layout, everything visible. The
        // coins still need arming or they'd never mount — the field skips the
        // flight itself under reduced motion and just sits in its slots.
        gsap.set(".hero-copy", { height: "auto", overflow: "visible" });
        gsap.set([...copyLines, ".hero-asset"], { opacity: 1, y: 0 });
        revealCopyRef.current = () => {};
        launchCoins();
      });
    },
    { scope: sectionRef },
  );

  return (
    <div {...domSrc("Hero")}
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
        ref={sceneRef}
        className="relative isolate flex flex-col items-center overflow-visible"
      >
        {variant === "product" && <ProductBackground />}
        {variant === "character" && <CharacterBackground />}

        <div className="page-container relative z-10 flex w-full flex-col items-center pt-[var(--layout-section-y)]">
          {/* The top padding stays outside the collapse so the phone keeps a
              comfortable gap under the nav while the copy is folded away.
              .hero-copy animates height 0 → auto to push the phone + page down. */}
          <div className="hero-copy w-full">
            <div className="hero-copy-inner mx-auto flex w-full max-w-[904px] flex-col items-center gap-flow">
              <HeroHeadline />
              <div className="hero-cta-row flex flex-col items-center justify-center gap-controls tablet:flex-row">
                <Button
                  href="/who-we-help/businesses"
                  size="lg"
                  variant="outline"
                  theme="onDark"
                  trailingIcon
                  style={ctaWidth ? { width: ctaWidth } : undefined}
                >
                  Who we help
                </Button>
                <span ref={primaryCtaRef} className="inline-flex">
                  <Button href="/contact" size="lg" variant="solid" theme="onDark">
                    Speak to our team
                  </Button>
                </span>
              </div>
              <TrustRatings />
            </div>
          </div>
        </div>

        <div className="relative z-0 mt-section-gap w-full">
          <HeroAsset coinsArmed={coinsArmed} onEntranceComplete={revealCopy} />
        </div>
      </section>

      {/* Logo band sits on the raised purple, one step lighter than the
          inverse hero above and the inverse section below — its own step in
          the section alternation. The marquee's edge fade is a transparency
          mask, so it fades into this band colour automatically. */}
      <section className="relative z-10 -mt-20 border-t border-b border-line-emphasis bg-surface-inverse-raised tablet:-mt-28 desktop:-mt-40">
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
