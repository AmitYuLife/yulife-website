"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import HeroHeadline from "@/components/ui/HeroHeadline";
import { Button } from "@/components/ui/Button";
import TrustRatings from "@/components/ui/TrustRatings";
import ChallengeSuccessStage from "@/components/app-screens/ChallengeSuccessStage";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import { domSrc } from "@/lib/domSrc";

gsap.registerPlugin(useGSAP, SplitText);

/** When the second copy wave (sub-heading, CTAs, ratings) starts — the same
 * beat the phone's push-down rides on, so the copy reads as displacing it. */
const PUSH_AT = 1.35;
/** The push-down: phone travels from the raised position to its final rest. */
const PUSH_DURATION = 0.55;
/** Gap kept between the headline's bottom and the raised phone's top, px. */
const RAISED_GAP = 32;
/** How far below its raised slot the phone starts, px. A long slide so the
 * entrance reads as movement rather than a fade — it comes in already mostly
 * opaque and travels up into place. */
const RAISED_ENTER_TRAVEL = 130;
/**
 * Handed to the phone (`ChallengeSuccess`) as how long its Welcome slide
 * breathes before sliding to the first activity card. Tuned so the swap lands
 * inside the push-down window: the phone's clock starts at coin-ready, the
 * hero's go-signal follows within ~a few hundred ms (fonts race), so a value
 * a beat past PUSH_AT keeps the swap on the push across that drift.
 */
const INTRO_DURATION = 1.6;
/** If the coin never reports ready (WebGL off, etc.), reveal anyway after this. */
const COIN_READY_FALLBACK_MS = 2500;
/**
 * The intro also waits (briefly) for the local woff2s so the serif headline
 * doesn't animate in as a fallback face and swap mid-tween. Same-origin
 * fonts near-always beat this race; it only caps the wait when they can't.
 */
const FONTS_READY_TIMEOUT_MS = 350;

export type HeroVariant = "product" | "character" | "atmosphere";

interface HeroProps {
  variant?: HeroVariant;
}

export default function Hero({ variant = "atmosphere" }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const introStartedRef = useRef(false);

  // The intro starts only once the phone is in view AND the 3D coin has
  // painted (so it never fades in a beat before the coin pops in) AND the
  // fonts race has settled (so the headline doesn't swap faces mid-tween).
  // The builder is set inside useGSAP (it needs the motion vs reduced-motion
  // context); these refs let the async signals trigger it from outside.
  const inViewRef = useRef(false);
  const coinReadyRef = useRef(false);
  const fontsReadyRef = useRef(false);
  const startIntroRef = useRef<() => void>(() => {});
  const tryStartIntro = useCallback(() => {
    if (inViewRef.current && coinReadyRef.current && fontsReadyRef.current)
      startIntroRef.current();
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
      // Three-beat choreography, all transform + opacity:
      //   1. The headline's lines wipe up out of SplitText masks.
      //   2. The phone rises into a raised position tucked under the headline.
      //   3. The sub-heading (masked lines too), CTAs and ratings arrive and
      //      "push" the phone down to its final rest behind the logo band.
      //
      // The copy's layout height is reserved from the start — only its lines
      // are hidden — so the hero's total height never changes and the logo
      // bar never moves. The phone's whole travel is a transform, not a
      // reflow.
      const copyLines = [
        ".hero-headline h1",
        ".hero-headline p",
        ".hero-cta-row",
        ".hero-ratings",
      ];
      // Track live splits so cleanup (StrictMode/HMR) can restore the DOM.
      const splits: SplitText[] = [];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([".hero-headline h1", ".hero-headline p"], { opacity: 0 });
        gsap.set([".hero-cta-row", ".hero-ratings"], { opacity: 0, y: 24 });
        gsap.set(".hero-phone", { opacity: 0 });
        // GSAP's pre-states are inline now — the pre-hydration guard class
        // (see IntroFlashGuard) has done its job and must go, or its CSS
        // failsafe would fight the timeline at 3.5s.
        document.documentElement.classList.remove("js-intro");

        const startIntro = () => {
          if (introStartedRef.current) return;
          introStartedRef.current = true;

          const section = sectionRef.current;
          const h1 = section?.querySelector<HTMLElement>(".hero-headline h1");
          const p = section?.querySelector<HTMLElement>(".hero-headline p");
          const phoneEl = section?.querySelector<HTMLElement>(".hero-phone");
          if (!h1 || !p || !phoneEl) return;

          // Split at intro start, not mount: the go-signal already waited for
          // the fonts, so line measurement is final. Masked lines clip each
          // line's own wipe.
          const h1Split = SplitText.create(h1, { type: "lines", mask: "lines" });
          const pSplit = SplitText.create(p, { type: "lines", mask: "lines" });
          splits.push(h1Split, pSplit);

          // Lines hidden inside their masks first, then the blocks themselves
          // become visible — the wipe alone reveals them.
          gsap.set([...h1Split.lines, ...pSplit.lines], { yPercent: 110 });
          gsap.set([h1, p], { opacity: 1 });

          // The raised position tucks the phone's top just under the visible
          // headline; the not-yet-revealed sub-heading/CTA/ratings space is
          // what it occupies until they arrive and displace it. Measured from
          // live rects so it adapts to every breakpoint and copy length.
          const rise = Math.max(
            0,
            phoneEl.getBoundingClientRect().top - (h1.getBoundingClientRect().bottom + RAISED_GAP),
          );

          const tl = gsap.timeline();

          // Beat 1 — headline lines wipe up out of their masks.
          tl.to(h1Split.lines, { yPercent: 0, duration: 0.85, ease: "power4.out", stagger: 0.12 }, 0);

          // Beat 2 — the phone slides up into the raised slot under the
          // headline. Movement leads: it starts a long way below and the fade
          // is fast (a short opacity ramp against a longer slide), so once
          // it's visible the eye reads the travel, not the fade.
          tl.fromTo(
            ".hero-phone",
            { y: -rise + RAISED_ENTER_TRAVEL, opacity: 0 },
            { y: -rise, duration: 0.7, ease: "power3.out" },
            0.4,
          );
          tl.to(".hero-phone", { opacity: 1, duration: 0.3, ease: "power1.out" }, 0.4);

          // Beat 3 — the rest of the copy arrives and pushes the phone down
          // to rest; the phone's own Welcome→activity swap lands on this beat
          // too (INTRO_DURATION).
          tl.to(
            ".hero-phone",
            {
              y: 0,
              duration: PUSH_DURATION,
              ease: "power3.out",
              onComplete: () => gsap.set(".hero-phone", { clearProps: "transform" }),
            },
            PUSH_AT,
          );
          tl.to(pSplit.lines, { yPercent: 0, duration: 0.7, ease: "power4.out", stagger: 0.1 }, PUSH_AT);
          tl.to(".hero-cta-row", { opacity: 1, y: 0, duration: 0.6, ease: "power4.out" }, PUSH_AT + 0.2);
          tl.to(".hero-ratings", { opacity: 1, y: 0, duration: 0.6, ease: "power4.out" }, PUSH_AT + 0.32);

          // Restore the sub-heading's original DOM once its wipe is done —
          // its natural wrapping must keep responding to resizes. The h1 is
          // deliberately NOT reverted: revert() rewrites innerHTML, which
          // would recreate the gradient <em> and orphan HeroHeadline's React
          // ref + pointer handler. Its two lines are explicit (<br>), so the
          // split wrappers render identically at every width — but its mask
          // wrappers must stop clipping, or the italic accent's overhanging
          // glyph edges stay shaved off at rest.
          tl.add(() => {
            pSplit.revert();
            splits.splice(splits.indexOf(pSplit), 1);
            const masks = h1Split.lines
              .map((line) => (line as HTMLElement).parentElement)
              .filter((el): el is HTMLElement => !!el && el !== h1);
            gsap.set(masks, { overflow: "visible" });
          });
        };

        // Registered for the async coin-ready / in-view / fonts signals.
        startIntroRef.current = startIntro;

        // Safety net: if the coin never reports ready, don't leave the phone
        // hidden — mark it ready after a beat and let the intro run.
        const coinFallback = window.setTimeout(() => {
          coinReadyRef.current = true;
          tryStartIntro();
        }, COIN_READY_FALLBACK_MS);

        // Don't animate the serif headline in a fallback face: wait for the
        // local fonts, capped by a short timeout they near-always beat.
        let cancelled = false;
        const markFontsReady = () => {
          if (cancelled || fontsReadyRef.current) return;
          fontsReadyRef.current = true;
          tryStartIntro();
        };
        const fontsFallback = window.setTimeout(markFontsReady, FONTS_READY_TIMEOUT_MS);
        document.fonts.ready.then(markFontsReady).catch(markFontsReady);

        // Viewport-gated: the intro spends a one-shot entrance and a synced
        // internal transition, so it shouldn't burn before the hero is on
        // screen. On the homepage it's at the top, so this fires at mount —
        // then it still waits on the coin and fonts (tryStartIntro checks all).
        const scene = sceneRef.current;
        const observer = scene
          ? new IntersectionObserver((entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              observer?.disconnect();
              inViewRef.current = true;
              tryStartIntro();
            })
          : null;
        if (observer && scene) {
          observer.observe(scene);
        } else {
          inViewRef.current = true;
          tryStartIntro();
        }

        return () => {
          cancelled = true;
          observer?.disconnect();
          window.clearTimeout(coinFallback);
          window.clearTimeout(fontsFallback);
          // StrictMode/HMR re-runs: hand the DOM back un-split so the next
          // pass (or React itself) starts from the authored markup.
          splits.forEach((split) => split.revert());
          splits.length = 0;
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No motion: land straight in the final layout, everything visible.
        // The guard class is never added under reduce, but clear it anyway.
        gsap.set([...copyLines, ".hero-phone"], { opacity: 1, y: 0 });
        document.documentElement.classList.remove("js-intro");
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
              the logo bar never moves. */}
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
