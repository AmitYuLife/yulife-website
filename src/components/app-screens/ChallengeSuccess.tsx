"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { domSrc } from "@/lib/domSrc";
import { APP_PALETTE } from "./palette";
import { SCREEN_W, SCREEN_H } from "./AppScreenFrame";
import PhoneMockup from "./PhoneMockup";
import useLoopPause from "./useLoopPause";
import StatusBar from "./StatusBar";
import UnderwaterScene from "./UnderwaterScene";
import ActivityCard from "./ActivityCard";
import { YuCoinNavIcon, YuLogoSquare } from "./icons";
import type { ChallengeActivity } from "./activities";

function reduceMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Either the one-time welcome intro or a real activity — the two card
 * slots don't care which they're holding, only how to render it. */
type SlotContent = { kind: "intro" } | { kind: "activity"; activity: ChallengeActivity };

/** The first-load slide (Figma node 2582:12125) shown in the activity card's
 * slot before the loop starts — same position and width as the card it
 * precedes, so the slide-out/slide-in transition between them is seamless. */
function WelcomeHeadline() {
  return (
    <p
      className="w-[327px] text-center text-[48px] leading-[48px]"
      style={{ fontFamily: "var(--font-serif)", color: "var(--app-text-on-dark)" }}
    >
      <span style={{ fontWeight: 700, fontStyle: "normal" }}>Welcome to</span>
      <br />
      <span style={{ fontWeight: 700, fontStyle: "italic" }}>the Yuniverse</span>
    </p>
  );
}

// Pulls in three.js + @react-three/fiber (~190KB gzipped) — deferred behind a
// dynamic import, same as the existing hero's HeroCoinField, so that weight
// never lands on the initial page bundle. The placeholder reserves the
// coin's exact footprint so its arrival doesn't shift the layout below it.
const SpinningCoin3D = dynamic(() => import("./SpinningCoin3D"), {
  ssr: false,
  loading: () => <div className="size-full" />,
});

gsap.registerPlugin(useGSAP);

/** Idle coin-spray pool — recycled while the button is held, like the bubble pool. */
const SPRAY_POOL_SIZE = 10;
/** Card-to-card slide: fast, so it reads as a snappy follow-on to the collect. */
const CARD_SLIDE_DURATION = 0.32;
/** Matches ActivityCard's own `w-[327px]`. */
const CARD_WIDTH = 327;
/** Breathing room between the outgoing and incoming card mid-slide. */
const CARD_GAP = 32;
const CARD_SLIDE_DISTANCE = CARD_WIDTH + CARD_GAP;
/** Default hold for the welcome intro before handing off to the first
 * activity. Overridable per mount via the `introDuration` prop — the homepage
 * hero passes a shorter hold tuned to its copy-first entrance. */
const INTRO_DURATION = 3;

export interface ChallengeSuccessProps {
  /** The activity currently on display — advances only once its caller
   * confirms the collect animation has fully played out (see
   * `ChallengeSuccessStage`), never on click alone. */
  activity: ChallengeActivity;
  /** Identifies `activity` so the crossfade only fires on a real change. */
  activityIndex: number;
  coinAmount?: number;
  /** Seconds the welcome intro holds before handing off to the first
   * activity. Defaults to `INTRO_DURATION`; a caller can retime it to line the
   * handoff up with its own choreography (e.g. the hero's push-down). */
  introDuration?: number;
  /** Fired once the 3D coin has painted its first frame — lets a host defer
   * revealing the phone until the coin is actually on screen (no pop-in). Also
   * gates this screen's own welcome→activity handoff, so the two stay in step. */
  onCoinReady?: () => void;
  /** Fires on the collect button click — the YuCoin fountain binds here later. */
  onCollect?: () => void;
  /** Fires the instant the button is pressed down — starts the coin spray. */
  onCollectStart?: () => void;
  /**
   * Fires on release — stops the spray and hands back the coin's current
   * viewport rect, the trail-to-counter sequence's start point.
   */
  onCollectEnd?: (coinRect: DOMRect) => void;
}

/**
 * Fake live app screen: the step-challenge success view inside the design
 * system's iPhone mock-up (size the mock-up by its container width). The
 * static DOM is authored at the exact Figma positions, so reduced motion
 * shows the design frame untouched; the motion branch layers ambient life on
 * top — swimming clownfish with flapping fins, translucent jellyfish drifting
 * from bottom-right to top-left, a randomized bubble spawner, swaying coral
 * and seaweed, and the slowly spinning illustrated 3D YuCoin. All loops pause
 * offscreen.
 */
export default function ChallengeSuccess({
  activity,
  activityIndex,
  coinAmount = 200,
  introDuration = INTRO_DURATION,
  onCoinReady,
  onCollect,
  onCollectStart,
  onCollectEnd,
}: ChallengeSuccessProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  // Flips true on the coin's first painted frame (or a fallback, so a WebGL
  // failure can't leave the phone hidden forever). Both the welcome→activity
  // handoff below and the host's phone reveal wait on this, off the same
  // moment, so they stay in sync.
  const [coinReady, setCoinReady] = useState(false);
  const coinReadyFiredRef = useRef(false);
  const markCoinReady = useCallback(() => {
    if (coinReadyFiredRef.current) return;
    coinReadyFiredRef.current = true;
    setCoinReady(true);
    onCoinReady?.();
  }, [onCoinReady]);
  useEffect(() => {
    const fallback = window.setTimeout(markCoinReady, 1500);
    return () => window.clearTimeout(fallback);
  }, [markCoinReady]);
  const { loops, pausedRef } = useLoopPause(rootRef);
  const coinSpinBoostRef = useRef(1);
  const coinScaleBoostRef = useRef(1);
  const coinWrapRef = useRef<HTMLDivElement>(null);
  const sprayingRef = useRef(false);
  const startSprayRef = useRef<() => void>(() => {});
  // Two persistent card slots rather than one reused node: the visible
  // (current) slot's content and position never change out from under it —
  // only the *other*, off-screen slot gets new content and gets pushed to
  // its starting position before it slides in. That's what keeps the swap
  // glitch-free (no same-frame content-swap-plus-transform-reset on the
  // element the viewer is actually looking at).
  const slotARef = useRef<HTMLDivElement>(null);
  const slotBRef = useRef<HTMLDivElement>(null);
  // Slot A starts on the welcome intro on every render, server included, so
  // hydration never mismatches — a reduced-motion visitor jumps straight to
  // the first activity a moment later in the mount effect below, the same
  // "swap after mount" trick StatusBar uses for its own SSR placeholder.
  const [slotAContent, setSlotAContent] = useState<SlotContent>({ kind: "intro" });
  const [slotBContent, setSlotBContent] = useState<SlotContent | null>(null);
  const [currentSlot, setCurrentSlot] = useState<"a" | "b">("a");
  const [enteringSlot, setEnteringSlot] = useState<"a" | "b" | null>(null);
  const prevActivityIndexRef = useRef(activityIndex);
  // Locked the instant a press starts, unlocked only once the next card has
  // fully slid into place — closes the window where a second press could
  // fire mid-sequence and stack another collect on top of an animation
  // that's still playing out.
  const [locked, setLocked] = useState(false);

  const handleCollectStart = () => {
    setLocked(true);
    onCollectStart?.();
    startSprayRef.current();
  };
  const handleCollectEnd = () => {
    sprayingRef.current = false;
    if (coinWrapRef.current) onCollectEnd?.(coinWrapRef.current.getBoundingClientRect());
  };

  // A slot only ever wires up the collect handlers while it's the one
  // actually at rest — the other slot (mid-slide, or just parked) renders
  // read-only, whether it's holding the intro or a stale activity.
  const renderSlot = (content: SlotContent, isCurrent: boolean) =>
    content.kind === "intro" ? (
      <WelcomeHeadline />
    ) : (
      <ActivityCard
        icon={<content.activity.icon className="size-[24px] shrink-0" />}
        label={content.activity.label}
        value={content.activity.value}
        coinAmount={coinAmount}
        onCollect={isCurrent ? onCollect : undefined}
        onCollectStart={isCurrent ? handleCollectStart : undefined}
        onCollectEnd={isCurrent ? handleCollectEnd : undefined}
        collectDisabled={isCurrent && locked}
        coinSpinBoostRef={coinSpinBoostRef}
        coinScaleBoostRef={coinScaleBoostRef}
      />
    );

  useGSAP(
    () => {
      // Reduced motion skips the intro outright — it's a decorative beat,
      // not information, so there's nothing to preserve by staging it.
      if (reduceMotion()) {
        setSlotAContent({ kind: "activity", activity });
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rand = gsap.utils.random;
        const track = <T extends gsap.core.Animation>(loop: T): T => {
          loops.push(loop);
          return loop;
        };
        const replace = (prev: gsap.core.Animation, next: gsap.core.Animation) => {
          const i = loops.indexOf(prev);
          if (i >= 0) loops.splice(i, 1, next);
          else loops.push(next);
        };

        // ── Welcome intro: the hold + handoff to the first activity lives in
        // its own coinReady-gated effect below (so it starts when the coin is
        // actually on screen, in step with the host's phone reveal), not here.

        // ── Clownfish traverse the screen right → left (they face left) ──
        gsap.utils.toArray<HTMLElement>("[data-cs-clownfish]").forEach((el, i) => {
          const homeX = el.offsetLeft;
          const swim = gsap.timeline({ repeat: -1, repeatDelay: rand(2, 6) });
          swim.fromTo(
            el,
            { x: SCREEN_W - homeX + 80 },
            { x: -(homeX + 44 + 80), duration: 17 + i * 5, ease: "none" },
          );
          swim.progress((0.32 + i * 0.45) % 1);
          track(swim);
          track(
            gsap.to(el, {
              y: 6,
              duration: 1.6 + i * 0.45,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
          track(
            gsap.to(el, {
              rotation: 2.5,
              duration: 2.2 + i * 0.5,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
        });

        // Fin flutter — quick oscillations sell the swimming motion.
        gsap.utils.toArray<Element>("[data-cs-fin-top]").forEach((el, i) => {
          track(
            gsap
              .fromTo(
                el,
                { rotation: -7 },
                {
                  rotation: 7,
                  transformOrigin: "50% 100%",
                  duration: 0.55 + i * 0.11,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                },
              )
              .progress(rand(0, 1)),
          );
        });
        gsap.utils.toArray<Element>("[data-cs-fin-bottom]").forEach((el, i) => {
          track(
            gsap
              .fromTo(
                el,
                { rotation: 7 },
                {
                  rotation: -7,
                  transformOrigin: "50% 0%",
                  duration: 0.62 + i * 0.09,
                  ease: "sine.inOut",
                  yoyo: true,
                  repeat: -1,
                },
              )
              .progress(rand(0, 1)),
          );
        });

        // ── Jellyfish: deep-background drift, bottom-right → top-left ──
        gsap.utils.toArray<HTMLElement>("[data-cs-jellyfish]").forEach((el, i) => {
          const homeX = el.offsetLeft;
          const homeY = el.offsetTop;
          const drift = gsap.timeline({ repeat: -1, repeatDelay: rand(2, 6) });
          drift.fromTo(
            el,
            { x: SCREEN_W - homeX + 40, y: SCREEN_H - homeY + 40 },
            {
              x: -(homeX + el.offsetWidth + 40),
              y: -(homeY + el.offsetHeight + 40),
              duration: 26 + i * 6,
              ease: "none",
            },
          );
          drift.progress((0.18 + i * 0.34) % 1);
          track(drift);
          track(
            gsap.to(el.firstElementChild, {
              scale: 1.06,
              transformOrigin: "50% 0%",
              duration: 1.4 + i * 0.25,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            }),
          );
          // Subtle tentacle sway, hinged where they meet the bell.
          const tentacles = el.querySelector("[data-cs-tentacles]");
          if (tentacles) {
            track(
              gsap
                .fromTo(
                  tentacles,
                  { rotation: -3.5 },
                  {
                    rotation: 3.5,
                    transformOrigin: "30% 0%",
                    duration: 2.6 + i * 0.5,
                    ease: "sine.inOut",
                    yoyo: true,
                    repeat: -1,
                  },
                )
                .progress(rand(0, 1)),
            );
          }
        });

        // ── Bubbles: hide the static design ones, run a pooled spawner ──
        gsap.to("[data-cs-bubble-static]", { opacity: 0, duration: 1.2 });
        const spawn = (el: HTMLElement, prev?: gsap.core.Animation, initial = false) => {
          const duration = rand(4.5, 9);
          const tl = gsap.timeline({
            delay: initial ? rand(0, 6) : rand(0.2, 2.5),
            onComplete: () => {
              if (!pausedRef.current) spawn(el, tl);
            },
          });
          tl.set(el, { x: rand(16, 340), y: 0, scale: rand(0.5, 1.1), opacity: 0 });
          tl.to(el, { y: -rand(420, 740), x: `+=${rand(-18, 18)}`, duration, ease: "none" }, 0);
          tl.to(el, { opacity: 0.75, duration: duration * 0.2, ease: "none" }, 0);
          tl.to(el, { opacity: 0, duration: duration * 0.25, ease: "none" }, duration * 0.75);
          if (prev) replace(prev, tl);
          else track(tl);
        };
        gsap.utils
          .toArray<HTMLElement>("[data-cs-bubble-pool]")
          .forEach((el) => spawn(el, undefined, true));

        // Foreground pool: same idiom, but starts below the visible frame so
        // each bubble emerges from under the sand as it rises, and travels a
        // touch faster/bigger to read as the nearer layer.
        const spawnForeground = (el: HTMLElement, prev?: gsap.core.Animation, initial = false) => {
          const duration = rand(3.5, 7);
          const tl = gsap.timeline({
            delay: initial ? rand(0, 6) : rand(0.2, 2.5),
            onComplete: () => {
              if (!pausedRef.current) spawnForeground(el, tl);
            },
          });
          tl.set(el, { x: rand(16, 340), y: 0, scale: rand(0.7, 1.3), opacity: 0 });
          tl.to(el, { y: -rand(480, 820), x: `+=${rand(-24, 24)}`, duration, ease: "none" }, 0);
          tl.to(el, { opacity: 0.9, duration: duration * 0.15, ease: "none" }, 0);
          tl.to(el, { opacity: 0, duration: duration * 0.25, ease: "none" }, duration * 0.75);
          if (prev) replace(prev, tl);
          else track(tl);
        };
        gsap.utils
          .toArray<HTMLElement>("[data-cs-bubble-pool-fg]")
          .forEach((el) => spawnForeground(el, undefined, true));

        // ── Coin spray: same self-perpetuating pool idiom as the bubbles,
        // gated on sprayingRef instead of running forever — each pooled coin
        // shoots outward from the button-arm origin (the coin's centre),
        // fades out, and either respawns (still pressed) or stops.
        const spawnSprayCoin = (el: HTMLElement, prev?: gsap.core.Animation) => {
          if (!sprayingRef.current || pausedRef.current) return;
          const angle = rand(0, Math.PI * 2);
          // Far enough that coins genuinely exit the 375×812 screen in most
          // directions and get clipped by its edge, rather than fading out
          // while still well inside it.
          const distance = rand(180, 380);
          const tl = gsap.timeline({ onComplete: () => spawnSprayCoin(el, tl) });
          tl.set(el, { x: 0, y: 0, rotation: rand(-30, 30), scale: rand(0.5, 0.9), opacity: 0 });
          tl.to(el, { opacity: 1, duration: 0.08, ease: "none" }, 0);
          tl.to(
            el,
            {
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              rotation: `+=${rand(-180, 180)}`,
              duration: rand(0.5, 0.9),
              ease: "power2.out",
            },
            0,
          );
          tl.to(el, { opacity: 0, duration: 0.2, ease: "none" }, ">-0.2");
          if (prev) replace(prev, tl);
          else track(tl);
        };
        startSprayRef.current = () => {
          sprayingRef.current = true;
          gsap.utils.toArray<HTMLElement>("[data-cs-coin-spray]").forEach((el, i) => {
            track(gsap.delayedCall(i * 0.03, () => spawnSprayCoin(el, undefined)));
          });
        };

        // ── Coral and seaweed sway independently around their base — the
        // archway structure stays rigid, it's stone, not a soft-bodied plant ──
        (
          [
            ["[data-cs-coral-back]", 4.8, 4],
            ["[data-cs-seaweed]", 3.9, 5],
          ] as const
        ).forEach(([selector, duration, degrees]) => {
          const sway = gsap.fromTo(
            selector,
            { rotation: -degrees / 2 },
            {
              rotation: degrees / 2,
              transformOrigin: "50% 100%",
              duration,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            },
          );
          sway.progress(rand(0, 1));
          track(sway);
        });
        track(
          gsap.fromTo(
            "[data-cs-wave]",
            { x: -8 },
            { x: 8, duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 },
          ).progress(rand(0, 1)),
        );

        // Respawned bubble timelines are created outside this callback, so the
        // matchMedia context can't revert them — kill everything explicitly.
        return () => {
          for (const loop of loops) loop.kill();
          loops.length = 0;
        };
      });
    },
    { scope: rootRef },
  );

  // Welcome intro handoff — held out of the main timeline so it only starts
  // once the coin has painted (coinReady), matching the host's phone reveal.
  // After `introDuration` it hands the welcome slide off to the first activity
  // through the same slot slide used between activities. Reduced motion never
  // shows the intro (the mount effect above swaps straight to the activity),
  // so this is a no-op there.
  const introHandedOffRef = useRef(false);
  useGSAP(
    () => {
      if (!coinReady || introHandedOffRef.current || reduceMotion()) return;
      introHandedOffRef.current = true;
      const call = gsap.delayedCall(introDuration, () => {
        setSlotBContent({ kind: "activity", activity });
        setEnteringSlot("b");
      });
      return () => call.kill();
    },
    { dependencies: [coinReady], scope: rootRef },
  );

  // Advances the ActivityCard when `activityIndex` changes. That prop only
  // changes once the caller confirms the collect animation has actually
  // finished (see ChallengeSuccessStage's `handleCollectEnd`, gated on the
  // button's own bounce-back rather than the slower coin trail), so this is
  // the visual half of "next step doesn't load in until the YuCoin has been
  // collected" — never triggered by the click itself. Reduced motion swaps
  // the content of the current slot outright rather than staging the slide
  // below.
  useGSAP(
    () => {
      if (activityIndex === prevActivityIndexRef.current) return;
      prevActivityIndexRef.current = activityIndex;

      const nextContent: SlotContent = { kind: "activity", activity };

      if (reduceMotion()) {
        if (currentSlot === "a") setSlotAContent(nextContent);
        else setSlotBContent(nextContent);
        setLocked(false);
        return;
      }

      const next = currentSlot === "a" ? "b" : "a";
      if (next === "a") setSlotAContent(nextContent);
      else setSlotBContent(nextContent);
      setEnteringSlot(next);
    },
    { dependencies: [activityIndex], scope: rootRef },
  );

  // Runs the actual transition once the entering slot above has its new
  // content (and so has a ref worth animating): the current slot drifts left
  // while fading out, the entering one — starting a gap's width to the right
  // — fades in while drifting left into place. No transform ever needs
  // resetting on the slot the viewer is looking at — the *other* slot gets
  // pushed back to its off-screen starting mark before its own next
  // entrance, whenever that turns out to be.
  useGSAP(
    () => {
      if (!enteringSlot) return;
      const outEl = currentSlot === "a" ? slotARef.current : slotBRef.current;
      const inEl = enteringSlot === "a" ? slotARef.current : slotBRef.current;
      if (!outEl || !inEl) return;
      gsap.set(inEl, { x: CARD_SLIDE_DISTANCE, opacity: 0 });
      gsap
        .timeline({
          onComplete: () => {
            setCurrentSlot(enteringSlot);
            setEnteringSlot(null);
            setLocked(false);
          },
        })
        .to(outEl, { x: -CARD_SLIDE_DISTANCE, opacity: 0, duration: CARD_SLIDE_DURATION, ease: "power2.inOut" }, 0)
        .to(inEl, { x: 0, opacity: 1, duration: CARD_SLIDE_DURATION, ease: "power2.inOut" }, 0);
    },
    { dependencies: [enteringSlot], scope: rootRef },
  );

  return (
    <PhoneMockup>
      <div
        {...domSrc("ChallengeSuccess")}
        ref={rootRef}
        className="relative overflow-hidden"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          backgroundColor: APP_PALETTE.screenBase,
          ["--app-ocean-top" as string]: APP_PALETTE.oceanTop,
          ["--app-ocean-bottom" as string]: APP_PALETTE.oceanBottom,
          ["--app-glass" as string]: APP_PALETTE.glass,
          ["--app-glass-border" as string]: APP_PALETTE.glassBorder,
          ["--app-cta" as string]: APP_PALETTE.cta,
          ["--app-cta-edge" as string]: APP_PALETTE.ctaEdge,
          ["--app-cta-pressed" as string]: APP_PALETTE.ctaPressed,
          ["--app-text-on-dark" as string]: APP_PALETTE.textOnDark,
          ["--app-status-ink" as string]: APP_PALETTE.statusInk,
        }}
      >
        <UnderwaterScene />

        <div className="relative flex h-full w-full flex-col items-center gap-[40px]">
          <div className="relative h-[76px] w-full shrink-0">
            <StatusBar />
            <YuLogoSquare className="absolute left-1/2 top-[52px] size-[24px] -translate-x-1/2" />
          </div>
          <div ref={coinWrapRef} className="relative h-[160px] w-[152px] shrink-0">
            {/* Painted first (behind the coin) so the coin's own opaque face
                occludes coins spawning under it — its transparent canvas
                background lets them show through everywhere else. */}
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              {Array.from({ length: SPRAY_POOL_SIZE }, (_, i) => (
                <div
                  key={i}
                  data-cs-coin-spray=""
                  className="absolute left-1/2 top-1/2 -ml-[12px] -mt-[12px] size-[24px] opacity-0"
                >
                  <YuCoinNavIcon className="size-full" />
                </div>
              ))}
            </div>
            <SpinningCoin3D
              className="size-full"
              spinBoostRef={coinSpinBoostRef}
              scaleBoostRef={coinScaleBoostRef}
              onReady={markCoinReady}
            />
          </div>
          {/* No overflow-hidden here — the slide is meant to clip against the
              phone's own screen edge (the root div above), not disappear
              early against this narrower slot. Whichever slot isn't current
              is absolutely positioned over the top of it (out of flow, so it
              never affects this container's height); the current slot stays
              in normal flow so the container's height always tracks real
              card content instead of a guessed pixel value. */}
          <div className="relative w-[327px]">
            <div
              ref={slotARef}
              className={currentSlot === "a" ? undefined : "absolute left-0 top-0 pointer-events-none"}
            >
              {renderSlot(slotAContent, currentSlot === "a")}
            </div>
            {slotBContent && (
              <div
                ref={slotBRef}
                className={currentSlot === "b" ? undefined : "absolute left-0 top-0 pointer-events-none"}
              >
                {renderSlot(slotBContent, currentSlot === "b")}
              </div>
            )}
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
}
