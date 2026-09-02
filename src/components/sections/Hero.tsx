"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CustomEase } from "gsap/CustomEase";
import HeroHeadline from "@/components/ui/HeroHeadline";
import { Button } from "@/components/ui/Button";
import TrustRatings from "@/components/ui/TrustRatings";
import ChallengeSuccessStage from "@/components/app-screens/ChallengeSuccessStage";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import { domSrc } from "@/lib/domSrc";

// Same 3D coin the phone screen uses — deferred so its three.js weight never
// lands on the initial bundle (identical treatment to the phone's own coin).
const SpinningCoin3D = dynamic(() => import("@/components/app-screens/SpinningCoin3D"), {
  ssr: false,
  loading: () => <div className="size-full" />,
});

gsap.registerPlugin(useGSAP, CustomEase);

/** The coin's flight into the phone, as two segments so the landing eases:
 *   1. a hard shove off the rest (steep start) that overshoots the slot (~11%),
 *   2. a settle that eases back and *flattens* into the slot (the last control
 *      point sits at y=1, so it arrives with ~zero velocity — a soft stop, not
 *      the abrupt one a single overshoot cubic gives).
 * One hump only, so it's a bounce, not a spring. Drives position only; scale
 * eases separately (a scale bounce would read as an odd size-pulse). */
const FLIGHT_EASE = CustomEase.create(
  "heroCoinFlight",
  "M0,0 C0.06,0.55 0.33,1.13 0.5,1.11 C0.68,1.08 0.85,1 1,1",
);
/** Spin-speed multiplier held for most of the flight (1 = idle); eased back to
 * 1 as the coin settles, so it's at idle speed the moment it lands. */
const FLIGHT_SPIN_PEAK = 12;

/** How far below its resting spot the intro coin starts, px — the "fade up". */
const COIN_ENTER_RISE = 32;
/** The phone-screen coin slot is authored 152px wide (ChallengeSuccess); the
 * flight scales the intro coin to the phone's live CSS scale, read as
 * slotRect.width / this, so the hand-off matches size exactly. */
const PHONE_COIN_SLOT_W = 152;
/** Intro coin's resting diameter is a fraction of the smaller viewport axis,
 * clamped — big enough to be the centrepiece, never overflowing small screens. */
const COIN_BIG_MIN = 200;
const COIN_BIG_MAX = 380;
const COIN_BIG_VIEWPORT_FRACTION = 0.34;
/** The intro coin canvas renders the coin at a fixed pixel size (orthographic
 * zoom), so "big" comes from scale. This is that fixed on-screen diameter at
 * scale 1 — measured from SpinningCoin3D's camera (zoom 72, radius ~1). */
const COIN_NATIVE_DIAMETER = 144;
/** The intro coin renders at COIN_NATIVE_DIAMETER and is CSS-scaled *up* to its
 * resting size, so its canvas would be upsampled — soft, visibly low-res on
 * large/retina screens — until it shrinks into the phone. Oversample the
 * backing store by the largest resting upscale so it stays crisp for the whole
 * flight; capped so the (small, short-lived) canvas never gets extravagant. */
const COIN_MAX_UPSCALE = COIN_BIG_MAX / COIN_NATIVE_DIAMETER;
const COIN_INTRO_DPR_CAP = 5;

// Beat timing (seconds on the intro timeline).
const BEAT_COIN_IN = 0;
/** Coin fade-up-in duration. */
const COIN_FADE_DURATION = 0.85;
/** The coin spins in place this long before the hero content enters and pushes
 * it down — a ~2.5s hold on the centrepiece. */
const BEAT_CONTENT_IN = 2.5;
/** Copy block entrance. */
const CONTENT_DURATION = 0.5;
/** The phone slides up (y → 0) staggered behind the copy block. */
const PHONE_STAGGER = 0.2;
const PHONE_DURATION = 0.5;
/** How far below its rest the phone starts, px (slide-up entrance). */
const PHONE_ENTER_RISE = 24;
/** The coin reacts to the content the instant it starts entering. */
const FLIGHT_DELAY = 0.05;
/** One continuous flight from the rest spot into the phone (see FLIGHT_EASE). */
const FLIGHT_DURATION = 0.75;

/** If the coin never reports ready (WebGL off, etc.), run anyway after this. */
const COIN_READY_FALLBACK_MS = 2500;
/** Wait briefly for local fonts so the headline's measured position (the coin's
 * resting spot) is final, not a fallback-face guess. */
const FONTS_READY_TIMEOUT_MS = 350;

export type HeroVariant = "product" | "character" | "atmosphere";

interface HeroProps {
  variant?: HeroVariant;
}

export default function Hero({ variant = "atmosphere" }: HeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLElement>(null);
  const introCoinRef = useRef<HTMLDivElement>(null);
  // Live spin-speed multiplier for the intro coin — ramped up during the flight
  // and back to idle on landing (see the timeline).
  const introSpinBoostRef = useRef(1);
  // The intro coin reports its live spin angle here; at hand-off we drop that
  // angle into the phone coin's sync ref so it continues from the same spin
  // position instead of snapping back to zero.
  const introAngleRef = useRef(0);
  const phoneCoinSyncRef = useRef<number | null>(null);
  // The intro coin exists only for the entrance; it's unmounted once it hands
  // off to the phone's own coin, so it isn't left rendering a hidden canvas.
  const [introCoinMounted, setIntroCoinMounted] = useState(true);
  // Oversample the intro coin's canvas by its resting upscale × the device
  // ratio, so the enlarged coin stays crisp (see COIN_MAX_UPSCALE). A fixed
  // number bypasses R3F's tuple-clamp to the window ratio, which is what leaves
  // the upscaled canvas soft.
  const introCoinDpr = useMemo(
    () =>
      Math.min(
        COIN_INTRO_DPR_CAP,
        (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1) * COIN_MAX_UPSCALE,
      ),
    [],
  );

  // The intro runs only once the coin has painted (so it never fades in a beat
  // before the coin exists), the hero is in view, and the fonts race has
  // settled (so the headline — the coin's resting mark — is measured final).
  const inViewRef = useRef(false);
  const coinReadyRef = useRef(false);
  const fontsReadyRef = useRef(false);
  const startRef = useRef<() => void>(() => {});
  const tryStart = useCallback(() => {
    if (inViewRef.current && coinReadyRef.current && fontsReadyRef.current) startRef.current();
  }, []);
  const handleCoinReady = useCallback(() => {
    coinReadyRef.current = true;
    tryStart();
  }, [tryStart]);

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
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // No motion: settled hero, phone coin present, intro coin never shown.
        gsap.set([".hero-headline", ".hero-cta-row", ".hero-ratings", ".hero-phone"], {
          opacity: 1,
          y: 0,
        });
        gsap.set("[data-cs-coin-slot]", { opacity: 1 });
        setIntroCoinMounted(false);
        document.documentElement.classList.remove("js-intro");
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const section = sectionRef.current;
        const coinEl = introCoinRef.current;
        if (!section || !coinEl) return;

        // Pre-states: content + phone hidden, the phone's own coin slot hidden
        // (the intro coin stands in for it until the hand-off), intro coin
        // hidden until it has painted.
        gsap.set([".hero-headline", ".hero-cta-row", ".hero-ratings"], { opacity: 0, y: 16 });
        // The phone slides up to enter. Its coin slot is the coin's landing
        // mark, so the flight is measured against the slot's *settled* position
        // (phoneY subtracted below) and the hand-off is timed after the phone
        // has finished sliding, so the coin never lands on a still-moving slot.
        gsap.set(".hero-phone", { opacity: 0, y: PHONE_ENTER_RISE });
        gsap.set("[data-cs-coin-slot]", { opacity: 0 });
        gsap.set(coinEl, { opacity: 0 });
        // GSAP's pre-states are inline now — drop the pre-hydration guard class
        // or its 3.5s CSS failsafe would fight this timeline.
        document.documentElement.classList.remove("js-intro");

        let started = false;
        const startIntro = () => {
          if (started) return;
          started = true;

          const ctaRow = section.querySelector<HTMLElement>(".hero-cta-row");
          const slot = section.querySelector<HTMLElement>("[data-cs-coin-slot]");
          if (!ctaRow || !slot) return;

          // Measure everything at natural scale before applying any transform.
          const coinRect = coinEl.getBoundingClientRect();
          const ctaRect = ctaRow.getBoundingClientRect();
          const slotRect = slot.getBoundingClientRect();
          const coinCenter = { x: coinRect.left + coinRect.width / 2, y: coinRect.top + coinRect.height / 2 };
          const ctaCenter = { x: ctaRect.left + ctaRect.width / 2, y: ctaRect.top + ctaRect.height / 2 };
          const slotCenter = { x: slotRect.left + slotRect.width / 2, y: slotRect.top + slotRect.height / 2 };

          // Resting (big, centred on the CTA group) vs landed (on the phone).
          const bigDiameter = gsap.utils.clamp(
            COIN_BIG_MIN,
            COIN_BIG_MAX,
            Math.min(window.innerWidth, window.innerHeight) * COIN_BIG_VIEWPORT_FRACTION,
          );
          const bigScale = bigDiameter / COIN_NATIVE_DIAMETER;
          // The phone is CSS-scaled; matching that scale makes the coin's landed
          // size equal the phone coin's exactly (both render at the same native
          // px, so equal scale = equal on-screen size).
          const landedScale = slotRect.width / PHONE_COIN_SLOT_W;

          // Scale is around the element centre, so translating the centre and
          // scaling compose cleanly (never centre a GSAP element with a CSS
          // translate — GSAP would clobber it).
          // The CTA group and phone start their entrance offset (y below), so
          // the marks we just measured sit that far below where they settle —
          // subtract each element's current y so the coin rests on / lands on
          // the settled position, not the mid-entrance one.
          const ctaY = (gsap.getProperty(".hero-cta-row", "y") as number) || 0;
          const phoneY = (gsap.getProperty(".hero-phone", "y") as number) || 0;
          const restX = ctaCenter.x - coinCenter.x;
          const restY = ctaCenter.y - ctaY - coinCenter.y;
          const landX = slotCenter.x - coinCenter.x;
          const landY = slotCenter.y - phoneY - coinCenter.y;

          gsap.set(coinEl, { x: restX, y: restY + COIN_ENTER_RISE, scale: bigScale, opacity: 0 });

          const flightStart = BEAT_CONTENT_IN + FLIGHT_DELAY;
          const flightEnd = flightStart + FLIGHT_DURATION;
          const tl = gsap.timeline();

          // Beat 1 — the coin fades up + in (already spinning), then holds and
          // keeps spinning until BEAT_CONTENT_IN.
          tl.to(coinEl, { y: restY, opacity: 1, duration: COIN_FADE_DURATION, ease: "power2.out" }, BEAT_COIN_IN);

          // Beat 2 — the hero content arrives and displaces the coin. The copy
          // block lands first (top-down stagger) and the phone slides up behind
          // it.
          tl.to(
            [".hero-headline", ".hero-cta-row", ".hero-ratings"],
            { opacity: 1, y: 0, duration: CONTENT_DURATION, ease: "power3.out", stagger: 0.1 },
            BEAT_CONTENT_IN,
          );
          tl.to(".hero-phone", { opacity: 1, y: 0, duration: PHONE_DURATION, ease: "power3.out" }, BEAT_CONTENT_IN + PHONE_STAGGER);

          // Beat 3 — one continuous flight into the phone. Position carries the
          // shove + landing bounce (FLIGHT_EASE); scale shrinks on its own
          // monotonic ease over the same window, so it's dropping in size from
          // the first frame of movement and settles to phone size as it lands.
          tl.to(coinEl, { x: landX, y: landY, duration: FLIGHT_DURATION, ease: FLIGHT_EASE }, flightStart);
          tl.to(coinEl, { scale: landedScale, duration: FLIGHT_DURATION, ease: "power2.out" }, flightStart);
          // Whirl up fast as it takes off, hold ~10× for the bulk of the flight
          // (spinning hard while it scales + moves down), then ease back to idle
          // exactly as it lands, so it's at normal speed at its final position.
          introSpinBoostRef.current = 1;
          tl.to(introSpinBoostRef, { current: FLIGHT_SPIN_PEAK, duration: FLIGHT_DURATION * 0.12, ease: "power1.out" }, flightStart);
          tl.to(introSpinBoostRef, { current: 1, duration: FLIGHT_DURATION * 0.28, ease: "power1.in" }, flightStart + FLIGHT_DURATION * 0.72);

          // Hand off to the phone's own coin the instant it settles — an
          // immediate swap (position + size match exactly, verified 0/0), so the
          // coin never fades on its way down. Pass the live spin angle across so
          // the phone coin continues from it (no blink to a reset position),
          // then drop the intro coin entirely.
          tl.set("[data-cs-coin-slot]", { opacity: 1 }, flightEnd);
          tl.call(() => { phoneCoinSyncRef.current = introAngleRef.current; }, undefined, flightEnd);
          tl.set(coinEl, { opacity: 0 }, flightEnd);
          tl.call(() => setIntroCoinMounted(false), undefined, flightEnd);
        };

        startRef.current = startIntro;

        // Coin-ready safety net.
        const coinFallback = window.setTimeout(() => {
          coinReadyRef.current = true;
          tryStart();
        }, COIN_READY_FALLBACK_MS);

        // Fonts, capped by a short timeout they near-always beat.
        let cancelled = false;
        const markFontsReady = () => {
          if (cancelled || fontsReadyRef.current) return;
          fontsReadyRef.current = true;
          tryStart();
        };
        const fontsFallback = window.setTimeout(markFontsReady, FONTS_READY_TIMEOUT_MS);
        document.fonts.ready.then(markFontsReady).catch(markFontsReady);

        // Viewport gate — the hero is at the top of the homepage, so this fires
        // at mount, then still waits on the coin + fonts (tryStart checks all).
        const scene = sceneRef.current;
        const observer = scene
          ? new IntersectionObserver((entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              observer?.disconnect();
              inViewRef.current = true;
              tryStart();
            })
          : null;
        if (observer && scene) observer.observe(scene);
        else {
          inViewRef.current = true;
          tryStart();
        }

        return () => {
          cancelled = true;
          observer?.disconnect();
          window.clearTimeout(coinFallback);
          window.clearTimeout(fontsFallback);
        };
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
      <section ref={sceneRef} className="relative isolate flex flex-col items-center overflow-visible">
        {variant === "product" && <ProductBackground />}
        {variant === "character" && <CharacterBackground />}

        {/* Intro coin — the centrepiece of the entrance. Absolutely centred by
            a static anchor (never a GSAP translate), so the timeline's x/y/scale
            drive it freely from there down onto the phone. */}
        {introCoinMounted && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center" aria-hidden="true">
            {/* alwaysRender: the coin keeps spinning as the flight carries it
                down past the viewport edge (the loop would otherwise pause and
                freeze mid-descent). */}
            <div ref={introCoinRef} className="hero-intro-coin size-[300px]" style={{ opacity: 0 }}>
              <SpinningCoin3D
                className="size-full"
                spinBoostRef={introSpinBoostRef}
                reportAngleRef={introAngleRef}
                alwaysRender
                dpr={introCoinDpr}
                onReady={handleCoinReady}
              />
            </div>
          </div>
        )}

        <div className="page-container relative z-10 flex w-full flex-col items-center pt-[var(--layout-section-y)]">
          <div className="hero-copy w-full">
            <div className="hero-copy-inner mx-auto flex w-full max-w-[656px] flex-col items-center gap-flow">
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

        {/* The phone (ChallengeSuccess) sits below the copy; its lower half is
            overlapped by the logo bar (z-10 vs the phone's z-0). */}
        <div className="relative z-0 mt-section-gap flex w-full justify-center">
          <div
            className="hero-phone relative h-[300px] w-[181px] overflow-visible tablet:h-[460px] tablet:w-[277px] desktop:h-[620px] desktop:w-[374px]"
            aria-hidden="true"
          >
            <ChallengeSuccessStage phoneStyle={{ width: "100%" }} coinSyncAngleRef={phoneCoinSyncRef} />
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
