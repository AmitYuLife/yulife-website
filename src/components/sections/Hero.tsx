"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroHeadline from "@/components/ui/HeroHeadline";
import { Button } from "@/components/ui/Button";
import TrustRatings from "@/components/ui/TrustRatings";
import ChallengeSuccessStage from "@/components/app-screens/ChallengeSuccessStage";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import { domSrc } from "@/lib/domSrc";

gsap.registerPlugin(useGSAP);

/** The phone fades + rises into its raised "first" position, in seconds. */
const FADE_DURATION = 0.45;
/** How long the phone holds high before the copy arrives, in seconds. */
const HOLD = 2.5;
/** The push-down: phone travels from the raised position to its final rest. */
const PUSH_DURATION = 0.5;
/**
 * Handed to the phone (`ChallengeSuccess`) so its own Welcome→activity slide
 * fires on the push-down beat rather than on its own default clock. Both this
 * timeline and the phone's visibility-gated intro start together at mount
 * (the hero sits at the top of the page), so matching the durations lines the
 * two up: the card swaps just as the copy shoves the phone down.
 */
const INTRO_DURATION = FADE_DURATION + HOLD;

/**
 * Where the phone sits at the START of the intro, as the gap between the
 * phone's bottom and the top of the logo band, expressed as a fraction of the
 * phone's own height (Figma "Home 1", node 2584:12463: 374px gap over a 901px
 * phone). Anchoring the raised position to the logo — rather than to the copy
 * block's height — keeps it put as the copy wraps to more or fewer lines.
 */
const PHONE_START_GAP_RATIO = 0.415;
/** If the coin never reports ready (WebGL off, etc.), reveal anyway after this. */
const COIN_READY_FALLBACK_MS = 2500;

export type HeroVariant = "product" | "character" | "atmosphere";

interface HeroProps {
  variant?: HeroVariant;
}

export default function Hero({ variant = "atmosphere" }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLElement>(null);
  const introStartedRef = useRef(false);

  // The intro starts only once the phone is BOTH in view AND the 3D coin has
  // painted — so the phone never fades in a beat before the coin pops in. The
  // builder is set inside useGSAP (it needs the motion vs reduced-motion
  // context); these refs let the two async signals trigger it from outside.
  const inViewRef = useRef(false);
  const coinReadyRef = useRef(false);
  const startIntroRef = useRef<() => void>(() => {});
  const tryStartIntro = useCallback(() => {
    if (inViewRef.current && coinReadyRef.current) startIntroRef.current();
  }, []);
  const handleCoinReady = useCallback(() => {
    coinReadyRef.current = true;
    tryStartIntro();
  }, [tryStartIntro]);

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
      // The copy block and the phone are choreographed in two beats: the phone
      // fades up into a raised position and holds there, then the copy slides
      // in and pushes the phone down into its final spot behind the logo bar.
      //
      // Crucially the copy's layout height is reserved from the start — only
      // its lines are hidden — so the hero's total height never changes and
      // the logo bar never moves. The phone's whole travel is a transform, not
      // a reflow: it starts raised (see `rise`, anchored to the logo band) and
      // animates back to 0 as the copy appears.
      const copyLines = [
        ".hero-headline h1",
        ".hero-headline p",
        ".hero-cta-row",
        ".hero-ratings",
      ];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(copyLines, { opacity: 0, y: 24 });
        gsap.set(".hero-phone", { opacity: 0 });

        const startIntro = () => {
          if (introStartedRef.current) return;
          introStartedRef.current = true;

          // How far the phone sits above its rest position while the copy is
          // hidden. Anchored to the logo band, not the copy height: at the
          // start the phone's bottom holds PHONE_START_GAP_RATIO of its own
          // height above the logo (matching Figma), so it doesn't creep up
          // when the copy wraps to more lines. rise = (final phone bottom) −
          // (raised phone bottom); scroll cancels since all rects share it.
          const phoneEl = sectionRef.current?.querySelector<HTMLElement>(".hero-phone");
          const logoEl = logoRef.current;
          let rise = 0;
          if (phoneEl && logoEl) {
            const phoneRect = phoneEl.getBoundingClientRect();
            // The device (PhoneMockup, 434×901) fills the band's width and
            // overflows it downward, so its real height comes from the aspect.
            const phoneH = (phoneRect.width * 901) / 434;
            const finalBottom = phoneRect.top + phoneH;
            const raisedBottom = logoEl.getBoundingClientRect().top - PHONE_START_GAP_RATIO * phoneH;
            rise = Math.max(0, finalBottom - raisedBottom);
          }

          const pushAt = FADE_DURATION + HOLD;
          const tl = gsap.timeline();

          // Beat 1 — fade up into the raised first position.
          tl.fromTo(
            ".hero-phone",
            { y: -rise + 24, opacity: 0 },
            { y: -rise, opacity: 1, duration: FADE_DURATION, ease: "power3.out" },
            0,
          );

          // Beat 2 — the copy slides in and pushes the phone down to rest. The
          // push and the line reveals run together so they read as one motion;
          // the phone's own card swaps Welcome→activity here too (INTRO_DURATION).
          tl.to(
            ".hero-phone",
            {
              y: 0,
              duration: PUSH_DURATION,
              ease: "power3.out",
              onComplete: () => gsap.set(".hero-phone", { clearProps: "transform" }),
            },
            pushAt,
          );
          tl.to(".hero-headline h1", { opacity: 1, y: 0, duration: 0.5 }, pushAt + 0.08)
            .to(".hero-headline p", { opacity: 1, y: 0, duration: 0.45 }, "<0.12")
            .to(".hero-cta-row", { opacity: 1, y: 0, duration: 0.4 }, "<0.12")
            .to(".hero-ratings", { opacity: 1, y: 0, duration: 0.35 }, "<0.1");
        };

        // Registered for the async coin-ready / in-view signals to fire.
        startIntroRef.current = startIntro;

        // Safety net: if the coin never reports ready, don't leave the phone
        // hidden — mark it ready after a beat and let the intro run.
        const coinFallback = window.setTimeout(() => {
          coinReadyRef.current = true;
          tryStartIntro();
        }, COIN_READY_FALLBACK_MS);

        // Viewport-gated: the intro spends a one-shot entrance and a synced
        // internal transition, so it shouldn't burn before the hero is on
        // screen. On the homepage it's at the top, so this fires at mount —
        // then it still waits on the coin (tryStartIntro checks both).
        const scene = sceneRef.current;
        if (!scene) {
          inViewRef.current = true;
          tryStartIntro();
          return () => window.clearTimeout(coinFallback);
        }

        const observer = new IntersectionObserver((entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          observer.disconnect();
          inViewRef.current = true;
          tryStartIntro();
        });
        observer.observe(scene);

        return () => {
          observer.disconnect();
          window.clearTimeout(coinFallback);
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No motion: land straight in the final layout, everything visible.
        gsap.set([...copyLines, ".hero-phone"], { opacity: 1, y: 0 });
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
          {/* The copy's layout height is always reserved (only its lines are
              hidden during the intro), so the hero height stays constant and
              the logo bar never moves — the phone alone translates down. */}
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

        {/* The phone (ChallengeSuccess) sits below the copy in the final
            layout; its lower half is overlapped by the logo bar (z-10 vs the
            phone's z-0). Centred with flex — never translate-x — so GSAP's y
            tween on .hero-phone can't collide with a CSS translate. */}
        <div className="relative z-0 mt-section-gap flex w-full justify-center">
          <div
            className="hero-phone relative h-[300px] w-[181px] overflow-visible tablet:h-[460px] tablet:w-[277px] desktop:h-[620px] desktop:w-[374px]"
            aria-hidden="true"
          >
            <ChallengeSuccessStage
              introDuration={INTRO_DURATION}
              onCoinReady={handleCoinReady}
              phoneStyle={{ width: "100%" }}
            />
          </div>
        </div>
      </section>

      {/* Logo band sits on the raised purple, one step lighter than the
          inverse hero above and the inverse section below — its own step in
          the section alternation. The marquee's edge fade is a transparency
          mask, so it fades into this band colour automatically. */}
      <section ref={logoRef} className="relative z-10 -mt-20 border-t border-b border-line-emphasis bg-surface-inverse-raised tablet:-mt-28 desktop:-mt-40">
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
