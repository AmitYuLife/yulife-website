"use client";

import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { APP_PALETTE } from "./palette";
import { YuCoinNavIcon } from "./icons";

gsap.registerPlugin(useGSAP);

// Generous headroom — each digit column can roll forward through this many
// single-digit ticks before running out of rendered rows. A v1-accepted
// limit (see the ChallengeSuccessStage plan notes): far more than a demo
// session needs, and simpler than an unboundedly-extending strip. Sized for
// the *forced* full lap below (an unchanging column still advances a full
// 10 rows every collect, not just the occasional real 9-row jump), which is
// the actual worst case now rather than an edge case.
const STRIP_CYCLES = 40;
const STRIP_ROWS = STRIP_CYCLES * 10 + 10;
// Pixel row height — the roll distance is computed in px, not em, so it
// can't drift out of sync with the rows' actual `h-[24px]` regardless of
// their font-size (an earlier em-based version rolled by 1em == 16px per
// row while each row rendered at 24px tall, misaligning after every tick).
const ROW_HEIGHT = 24;
// Overshoot before settling back to 1 — same bounce shape as CollectButton's
// COIN_SCALE_BOUNCE, triggered per-coin as each trail coin lands instead of
// once on release.
const COIN_PULSE_SCALE = 1.3;

function digitsOf(n: number): number[] {
  return String(Math.max(0, Math.trunc(n)))
    .split("")
    .map(Number);
}

export interface YuCoinCounterHandle {
  /** Viewport rect of the small coin icon — the trail's landing point. */
  getCoinIconRect(): DOMRect | null;
  /** Bounces the coin icon — call as each trail coin lands. */
  pulseCoin(): void;
}

/**
 * The YuCoin balance chip beside the phone (Figma node 2574:11339): a small
 * dark card with a rolling odometer number + coin icon. Forked from
 * `RollingStatNumber`'s digit-strip technique rather than importing it —
 * that component is hard-wired to a one-time ScrollTrigger reveal with no
 * imperative "animate to a new value" API, which is exactly what this needs
 * (triggered by `value` changing, not by scrolling into view). Digit columns
 * roll forward only (never backward) by the shortest forward distance, so
 * repeated +200 collects always feel like the odometer spinning onward.
 *
 * `visible` toggles a fade in *and* out (not just a one-time reveal) — the
 * caller shows this while collecting and fades it back out after a pause.
 */
const YuCoinCounter = forwardRef<
  YuCoinCounterHandle,
  { value: number; visible: boolean; className?: string }
>(function YuCoinCounter({ value, visible, className }, ref) {
  const pillRef = useRef<HTMLDivElement>(null);
  const coinIconRef = useRef<HTMLDivElement>(null);
  const prevDigitsRef = useRef<number[]>(digitsOf(value));
  const rowsRef = useRef<number[]>(digitsOf(value).map((d) => d));
  /** Last measured natural width of the pill — null only before the first
   * measurement (mount), so the very first digit-count change still has
   * something to animate from. */
  const pillWidthRef = useRef<number | null>(null);
  /** Skips the force-a-lap behaviour below on the mount-time run, where
   * `prev` is seeded from `digits` itself — every column already reads as
   * unchanged, so forcing a lap there would spin the whole counter (hidden,
   * harmlessly, but pointlessly) before it's ever been shown. */
  const hasAnimatedRef = useRef(false);

  const digits = useMemo(() => digitsOf(value), [value]);

  useGSAP(
    () => {
      const tracks = gsap.utils.toArray<HTMLElement>("[data-counter-track]", pillRef.current);
      const prev = prevDigitsRef.current;
      const rows = rowsRef.current;
      const isFirstRun = !hasAnimatedRef.current;
      hasAnimatedRef.current = true;

      // Align from the right — a newly-appeared leading digit (crossing a
      // power of ten, or the very first collect growing from "0") has no
      // previous digit, so it's treated as having come from "0" and rolls
      // up into place same as any other column, rather than snapping in
      // instantly (which, for the very first collect — where *every* column
      // but the last is "new" — meant the whole number just jumped with no
      // visible roll at all).
      //
      // A column whose digit doesn't change (tens/units sitting on "0" while
      // only the hundreds column moves, e.g. every collect being a multiple
      // of 100) would otherwise get a zero delta and never visibly move —
      // reading as a broken odometer where only the leading digit counts.
      // Forcing a full lap (a delta of 10 rather than 0) makes every column
      // roll through its digits and land back where it started, so the whole
      // number visibly counts up together.
      const nextRows = digits.map((digit, i) => {
        const fromRight = digits.length - i;
        const prevIndex = prev.length - fromRight;
        const prevDigit = prevIndex >= 0 ? prev[prevIndex] : 0;
        const prevRow = prevIndex >= 0 ? (rows[prevIndex] ?? prevDigit) : 0;
        const rawDelta = (digit - prevDigit + 10) % 10;
        const delta = !isFirstRun && rawDelta === 0 ? 10 : rawDelta;
        return prevRow + delta;
      });

      // The pill's width is otherwise pure CSS (auto, driven by however many
      // digit columns are rendered) — crossing a power of ten adds or drops
      // a column instantly on commit, which would otherwise snap the pill to
      // its new width the same frame. Manually FLIP it: pin the pill at its
      // last-known width, then animate to whatever width it naturally wants
      // now that the new column count is in the DOM.
      const pill = pillRef.current;
      let naturalWidth: number | null = null;
      if (pill) {
        const hadExplicitWidth = pill.style.width !== "";
        if (hadExplicitWidth) pill.style.width = "";
        naturalWidth = pill.getBoundingClientRect().width;
      }
      const prevWidth = pillWidthRef.current;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        tracks.forEach((track, i) => {
          gsap.to(track, {
            y: -(nextRows[i] * ROW_HEIGHT),
            duration: 0.5 + i * 0.05,
            ease: "power3.out",
            overwrite: true,
          });
        });
        if (pill && naturalWidth != null && prevWidth != null && prevWidth !== naturalWidth) {
          gsap.fromTo(
            pill,
            { width: prevWidth },
            {
              width: naturalWidth,
              duration: 0.5,
              ease: "power3.out",
              overwrite: "auto",
              onComplete: () => {
                pill.style.width = "";
              },
            },
          );
        }
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        tracks.forEach((track, i) => gsap.set(track, { y: -(nextRows[i] * ROW_HEIGHT) }));
        if (pill) pill.style.width = "";
      });

      prevDigitsRef.current = digits;
      rowsRef.current = nextRows;
      if (naturalWidth != null) pillWidthRef.current = naturalWidth;

      return () => mm.revert();
    },
    { dependencies: [value], scope: pillRef },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(pillRef.current, {
          opacity: visible ? 1 : 0,
          y: visible ? 0 : 8,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
        });
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(pillRef.current, { opacity: visible ? 1 : 0, y: visible ? 0 : 8 });
      });
      return () => mm.revert();
    },
    { dependencies: [visible], scope: pillRef },
  );

  useImperativeHandle(ref, () => ({
    getCoinIconRect: () => coinIconRef.current?.getBoundingClientRect() ?? null,
    pulseCoin: () => {
      const el = coinIconRef.current;
      if (!el) return;
      if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }
      gsap.killTweensOf(el);
      gsap
        .timeline()
        .to(el, { scale: COIN_PULSE_SCALE, duration: 0.15, ease: "power2.out" })
        .to(el, { scale: 1, duration: 0.25, ease: "power2.out" });
    },
  }));

  return (
    <div
      ref={pillRef}
      className={`flex flex-col items-center justify-center gap-[8px] rounded-[8px] px-[16px] py-[24px] opacity-0 ${className ?? ""}`}
      style={{
        backgroundColor: APP_PALETTE.screenBase,
        color: APP_PALETTE.textOnDark,
      }}
    >
      <span className="yucoin-counter-ring" aria-hidden="true" />
      <div className="flex items-center gap-[8px]">
        <div className="flex items-baseline">
          {digits.map((digit, i) => {
            const fromRight = digits.length - i;
            const needsComma = i > 0 && fromRight % 3 === 0;
            return (
              <span key={i} className="inline-flex items-baseline">
                {needsComma && (
                  <span aria-hidden="true" className="font-bold text-[16px] leading-[24px]">
                    ,
                  </span>
                )}
                <span className="relative inline-block h-[24px] w-[1ch] overflow-hidden leading-[24px]">
                  <span
                    data-counter-track
                    className="inline-flex flex-col will-change-transform"
                    style={{ transform: `translateY(${-(rowsRef.current[i] * ROW_HEIGHT)}px)` }}
                  >
                    {Array.from({ length: STRIP_ROWS }, (_, row) => (
                      <span
                        key={row}
                        className="block h-[24px] font-bold text-[16px] leading-[24px] tabular-nums"
                      >
                        {row % 10}
                      </span>
                    ))}
                  </span>
                </span>
              </span>
            );
          })}
        </div>
        <div ref={coinIconRef}>
          <YuCoinNavIcon className="size-[24px] shrink-0" />
        </div>
      </div>
    </div>
  );
});

export default YuCoinCounter;
