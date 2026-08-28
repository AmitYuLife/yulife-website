"use client";

import { useMemo, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import ChallengeSuccess from "./ChallengeSuccess";
import YuCoinCounter, { type YuCoinCounterHandle } from "./YuCoinCounter";
import { YuCoinNavIcon } from "./icons";
import { buildActivities } from "./activities";
import { COLLECT_BOUNCE_DURATION } from "./CollectButton";

gsap.registerPlugin(MotionPathPlugin);

const TRAIL_BATCH_SIZE = 5;
// Two alternating batches of coin elements — a press that interrupts an
// in-flight run gets its own batch faded out independently (see below)
// rather than the new run hijacking the same elements the old run was still
// using, which used to look like the old coins blinking out of existence.
const TRAIL_BATCH_COUNT = 2;
const TRAIL_POOL_SIZE = TRAIL_BATCH_SIZE * TRAIL_BATCH_COUNT;
const TRAIL_STAGGER = 0.06;
const TRAIL_DURATION = 0.6;
// The phone's CSS transform gives it its own stacking context, so nothing
// inside it can ever be z-index'd above the stage-level trail overlay (which
// has to sit above the phone for the part of the flight that's outside it) —
// true "behind the coin" layering isn't achievable with z-index here. Instead
// each trail coin stays invisible until it's travelled roughly clear of the
// coin's own radius, faking the same "emerges from behind it" read.
const EMERGE_DELAY_FRACTION = 0.4;
const EMERGE_FADE_FRACTION = 0.12;
/** Fade-out for a batch whose run got interrupted by a newer press. */
const INTERRUPT_FADE_DURATION = 0.2;
/** How long the counter stays up after a collect finishes before fading. */
const FADE_OUT_DELAY_MS = 1000;

function reduceMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export interface ChallengeSuccessStageProps {
  totalSteps?: number;
  coinAmount?: number;
  /** Fires on the collect button click. */
  onCollect?: () => void;
  /** Sizes the phone slot — pass e.g. `{ width }` from a width toggle. */
  phoneStyle?: CSSProperties;
  className?: string;
}

/**
 * Ancestor of the phone (`ChallengeSuccess`) and the new `YuCoinCounter`,
 * laid out so the counter sits just outside the phone's own bounds, with an
 * unclipped trail overlay above both. This exists as its own component —
 * rather than folding the counter into `ChallengeSuccess` — because the
 * trail has to travel from inside the phone's clipped, CSS-scaled screen to
 * a point outside it: only a shared ancestor of both can host an overlay
 * that isn't subject to the phone's own `overflow-hidden` chain
 * (`AppScreenFrame` → `PhoneMockup`). Keeping `ChallengeSuccess` itself
 * counter-agnostic also means it stays a self-contained "phone screen"
 * droppable anywhere — e.g. the homepage hero later — without this
 * orchestration following it in.
 */
export default function ChallengeSuccessStage({
  totalSteps,
  coinAmount = 200,
  onCollect,
  phoneStyle,
  className,
}: ChallengeSuccessStageProps) {
  const activities = useMemo(() => buildActivities(totalSteps ?? 5264), [totalSteps]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<YuCoinCounterHandle>(null);
  const [coinTotal, setCoinTotal] = useState(0);
  const [counterVisible, setCounterVisible] = useState(false);
  const [activityIndex, setActivityIndex] = useState(0);
  const activityIndexRef = useRef(activityIndex);
  activityIndexRef.current = activityIndex;
  const runIdRef = useRef(0);
  const batchIndexRef = useRef(0);
  const batchTimelinesRef = useRef<gsap.core.Timeline[][]>(
    Array.from({ length: TRAIL_BATCH_COUNT }, () => []),
  );
  const fadeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCollectEnd = (coinRect: DOMRect) => {
    // Captured now, before anything advances — both the coin math below and
    // the activity advance need to know which activity was actually
    // collected, not whichever one is current by the time their (differently
    // timed) callbacks fire.
    const collectedIndex = activityIndexRef.current;
    setCounterVisible(true);
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    // A press that lands before the previous run finishes interrupts it: its
    // coins fade out (below) instead of arriving, and the run-id guards on
    // the callbacks below mean it can no longer add its 200 or advance the
    // card even if it was already mid-flight when this fired.
    const runId = ++runIdRef.current;
    const scheduleFadeOut = () => {
      fadeTimeoutRef.current = setTimeout(() => {
        if (runIdRef.current === runId) setCounterVisible(false);
      }, FADE_OUT_DELAY_MS);
    };
    // Collecting Steps (index 0) starts a fresh lap: it resets the total to
    // just its own coinAmount instead of adding on top of the previous lap's
    // 800, which is what keeps the counter from growing forever. Every other
    // activity simply adds on top of the running total.
    const applyCoinTotal = () => {
      setCoinTotal((n) => (collectedIndex === 0 ? 0 : n) + coinAmount);
    };
    const advanceActivity = () => {
      setActivityIndex((i) => (i + 1) % activities.length);
    };

    const overlay = overlayRef.current;
    const landingRect = counterRef.current?.getCoinIconRect();
    if (!overlay || !landingRect || reduceMotion()) {
      applyCoinTotal();
      advanceActivity();
      scheduleFadeOut();
      return;
    }

    // The card advances right on the button's own bounce-back finishing —
    // deliberately not tied to the coin trail below, which keeps flying to
    // the counter on its own (usually slower) schedule regardless.
    gsap.delayedCall(COLLECT_BOUNCE_DURATION, () => {
      if (runIdRef.current === runId) advanceActivity();
    });

    const overlayRect = overlay.getBoundingClientRect();
    const toLocalCenter = (rect: DOMRect) => ({
      x: rect.left - overlayRect.left + rect.width / 2,
      y: rect.top - overlayRect.top + rect.height / 2,
    });
    const start = toLocalCenter(coinRect);
    const end = toLocalCenter(landingRect);

    // Bow the arc up and toward the counter — tuned by eye against the
    // Figma illustration, which is a static reference with no extractable
    // bezier data (there's no real path to match exactly).
    const control = {
      x: (start.x + end.x) / 2,
      y: Math.min(start.y, end.y) - Math.abs(end.x - start.x) * 0.25,
    };

    const allTrailEls = gsap.utils.toArray<HTMLElement>("[data-trail-coin]", overlay);
    const batch = batchIndexRef.current;
    const nextBatch = (batch + 1) % TRAIL_BATCH_COUNT;
    batchIndexRef.current = nextBatch;
    const staleEls = allTrailEls.slice(batch * TRAIL_BATCH_SIZE, (batch + 1) * TRAIL_BATCH_SIZE);
    const freshEls = allTrailEls.slice(nextBatch * TRAIL_BATCH_SIZE, (nextBatch + 1) * TRAIL_BATCH_SIZE);

    // Fully stop whatever the interrupted run's coins were doing — both their
    // motion *and* their own still-pending emerge/fade-out steps — before
    // fading them out. Overriding just opacity while their old timeline kept
    // running left two tweens fighting over the same property, which could
    // settle on a coin stuck fully visible instead of faded away.
    batchTimelinesRef.current[batch].forEach((tl) => tl.kill());
    batchTimelinesRef.current[batch] = [];
    gsap.to(staleEls, { opacity: 0, duration: INTERRUPT_FADE_DURATION, ease: "none", overwrite: true });

    const fadeOutStart = TRAIL_DURATION - 0.15;
    batchTimelinesRef.current[nextBatch] = freshEls.map((el, i) => {
      const isLast = i === freshEls.length - 1;
      return gsap
        .timeline({ delay: i * TRAIL_STAGGER })
        .set(el, { x: start.x, y: start.y, opacity: 0 })
        .to(
          el,
          {
            motionPath: { path: [start, control, end], curviness: 1.25 },
            duration: TRAIL_DURATION,
            ease: "power1.in",
          },
          0,
        )
        .to(
          el,
          { opacity: 1, duration: TRAIL_DURATION * EMERGE_FADE_FRACTION, ease: "none" },
          TRAIL_DURATION * EMERGE_DELAY_FRACTION,
        )
        // Absolute position (not ">-0.15", which resolves against the *last
        // added* tween — the emerge fade-in above, ending well before the
        // motionPath does — not against the motionPath's own, later end).
        .to(el, { opacity: 0, duration: 0.15, ease: "none" }, fadeOutStart)
        .call(() => {
          if (!isLast || runIdRef.current !== runId) return;
          applyCoinTotal();
          scheduleFadeOut();
        });
    });
  };

  return (
    <div className={`relative flex items-start ${className ?? ""}`}>
      <div className="relative" style={phoneStyle}>
        <ChallengeSuccess
          activity={activities[activityIndex]}
          activityIndex={activityIndex}
          coinAmount={coinAmount}
          onCollect={onCollect}
          onCollectEnd={handleCollectEnd}
        />
        <YuCoinCounter
          ref={counterRef}
          value={coinTotal}
          visible={counterVisible}
          className="absolute left-full top-[40px] ml-[40px]"
        />
      </div>
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-10"
        aria-hidden="true"
      >
        {Array.from({ length: TRAIL_POOL_SIZE }, (_, i) => (
          <div
            key={i}
            data-trail-coin=""
            className="absolute left-0 top-0 -ml-[8px] -mt-[8px] size-[16px] opacity-0"
          >
            <YuCoinNavIcon className="size-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
