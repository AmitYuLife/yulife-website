"use client";

import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { YuCoinNavIcon } from "./icons";
import { playCue } from "./uiSfx";

gsap.registerPlugin(useGSAP);

// Both states carry an outer (drop) and inner (inset) shadow layer at once so
// GSAP can tween the pair as one string: pressing shrinks the outer offset to
// 0 while growing the inner one to 4, so the lip reads as sinking into the
// surface rather than the shadow merely fading.
const REST_SHADOW =
  "0px 4px 0px 0px var(--app-cta-edge), inset 0px 0px 0px 0px var(--app-cta-edge)";
const PRESSED_SHADOW =
  "0px 0px 0px 0px var(--app-cta-edge), inset 0px 4px 0px 0px var(--app-cta-edge)";

const COIN_SPIN_BOOST = 40;
const COIN_SCALE_PRESSED = 0.88;
const COIN_SCALE_BOUNCE = 1.1;

/** How long the release's elastic wobble takes — exported so callers (the
 * ActivityCard's slide-to-next-activity transition) can pick up right as the
 * button visually settles, instead of waiting on a separate animation. */
export const COLLECT_BOUNCE_DURATION = 0.6;

/**
 * The pink "Collect N YuCoin" button. Pressing sits the button down onto its
 * hard shadow (and darkens the fill); releasing springs it back with an
 * elastic wobble. Translate-only — no scale — so the label and coin icon
 * never re-rasterise to a different pixel grid. `onCollect` fires on click;
 * the YuCoin fountain binds there later without touching this file.
 *
 * `coinSpinBoostRef` speeds up the 3D YuCoin's spin and `coinScaleBoostRef`
 * shrinks it while pressed, bouncing past 100% on release before settling —
 * both tweened directly on their shared refs rather than via React state, so
 * they don't force a re-render of the R3F canvas.
 *
 * `onCollectStart`/`onCollectEnd` are discrete lifecycle events (press down /
 * press released) for effects that live outside this file — the coin spray
 * and release trail — fired from inside the same `pressedRef` guards as the
 * rest of press()/release(), so a mashed button can't double-fire them.
 */
export default function CollectButton({
  label,
  onCollect,
  onCollectStart,
  onCollectEnd,
  disabled,
  coinSpinBoostRef,
  coinScaleBoostRef,
}: {
  label: string;
  onCollect?: () => void;
  onCollectStart?: () => void;
  onCollectEnd?: () => void;
  /** Blocks presses — the caller sets this once a collect is mid-flight, so
   * a second press can't stack another collect on the running animation. */
  disabled?: boolean;
  coinSpinBoostRef?: RefObject<number>;
  coinScaleBoostRef?: RefObject<number>;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pressedRef = useRef(false);
  const reduceMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const press = () => {
    if (disabled || pressedRef.current) return;
    pressedRef.current = true;
    // Input / Long Press — the hold-to-collect press-down. This is also the
    // first user gesture, so it's where the audio context starts (and both
    // cues warm) for the later reward chime.
    playCue("long-press");
    onCollectStart?.();
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.backgroundColor = "var(--app-cta-pressed)";
    if (reduceMotion()) {
      if (coinSpinBoostRef) coinSpinBoostRef.current = COIN_SPIN_BOOST;
      if (coinScaleBoostRef) coinScaleBoostRef.current = COIN_SCALE_PRESSED;
      return;
    }
    gsap.to(btn, {
      y: 4,
      boxShadow: PRESSED_SHADOW,
      duration: 0.09,
      ease: "power2.out",
      overwrite: true,
    });
    if (coinSpinBoostRef) {
      gsap.to(coinSpinBoostRef, { current: COIN_SPIN_BOOST, duration: 0.2, ease: "power2.out" });
    }
    if (coinScaleBoostRef) {
      gsap.killTweensOf(coinScaleBoostRef);
      gsap.to(coinScaleBoostRef, { current: COIN_SCALE_PRESSED, duration: 0.2, ease: "power2.out" });
    }
  };

  const release = () => {
    if (!pressedRef.current) return;
    pressedRef.current = false;
    onCollectEnd?.();
    const btn = buttonRef.current;
    if (!btn) return;
    btn.style.backgroundColor = "var(--app-cta)";
    if (reduceMotion()) {
      if (coinSpinBoostRef) coinSpinBoostRef.current = 1;
      if (coinScaleBoostRef) coinScaleBoostRef.current = 1;
      return;
    }
    // Two independent tweens: the shadow settles smoothly and quickly, while
    // the cap itself gets an elastic wobble — a few small overshoots as it
    // springs back up, rather than a single flat ease-out.
    gsap.to(btn, {
      boxShadow: REST_SHADOW,
      duration: 0.25,
      ease: "power2.out",
    });
    gsap.to(btn, {
      y: 0,
      duration: COLLECT_BOUNCE_DURATION,
      ease: "elastic.out(1, 0.4)",
    });
    if (coinSpinBoostRef) {
      gsap.to(coinSpinBoostRef, { current: 1, duration: 0.35, ease: "power2.out" });
    }
    if (coinScaleBoostRef) {
      gsap.killTweensOf(coinScaleBoostRef);
      // Overshoot to 110% before settling — a bounce rather than a flat ease.
      gsap
        .timeline()
        .to(coinScaleBoostRef, { current: COIN_SCALE_BOUNCE, duration: 0.18, ease: "power2.out" })
        .to(coinScaleBoostRef, { current: 1, duration: 0.3, ease: "power2.out" });
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") press();
      }}
      onKeyUp={(e) => {
        if (e.key === " " || e.key === "Enter") release();
      }}
      onClick={() => {
        if (disabled) return;
        onCollect?.();
      }}
      aria-disabled={disabled}
      className="flex w-full cursor-pointer items-center justify-center gap-[8px] rounded-[8px] border-2 px-[32px] py-[16px] will-change-transform motion-reduce:active:translate-y-[4px] motion-reduce:active:shadow-[inset_0px_4px_0px_0px_var(--app-cta-edge)]"
      style={{
        backgroundColor: "var(--app-cta)",
        borderColor: "var(--app-cta-edge)",
        boxShadow: REST_SHADOW,
        color: "var(--app-text-on-dark)",
      }}
    >
      <span className="font-bold text-[16px] leading-[24px]">{label}</span>
      <YuCoinNavIcon className="size-[24px] shrink-0" />
    </button>
  );
}
