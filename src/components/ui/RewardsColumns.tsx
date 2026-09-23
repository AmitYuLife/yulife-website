"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { rewardColumns } from "@/data/home-content";

gsap.registerPlugin(useGSAP);

/** Vertical scroll speed, px/s — deliberately matches the logo marquee
 *  (LogoMarquee.PIXELS_PER_SECOND) so the two motions read as one system. */
const PIXELS_PER_SECOND = 24;

/** Delay between each card's fade-up as a column populates — the same staggered
 *  entrance the floating chat-log cards use. */
const CARD_STAGGER_MS = 90;

type RewardCard = { brand: string; src: string };

/** One brand card: the exported photo+logo tile inside a white rounded frame with
 *  the platform hard offset card shadow (Figma 2836:9143). The tile fills the
 *  frame; the frame's rounded clip and border are what show as the card edge. It
 *  fades up on mount, staggered by its position in the column (`index`), so the
 *  column populates card-by-card rather than all at once. */
function RewardCardTile({ card, index }: { card: RewardCard; index: number }) {
  return (
    <div
      className="platform-float-in reward-card mb-[18px] overflow-hidden rounded-[16px] border border-line bg-surface desktop:mb-[24px]"
      style={{ "--float-delay": `${index * CARD_STAGGER_MS}ms` } as React.CSSProperties}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static export; keep raw <img> */}
      <img src={card.src} alt="" width={136} height={120} className="block h-auto w-full" />
    </div>
  );
}

function RewardSet({
  cards,
  measureRef,
}: {
  cards: readonly RewardCard[];
  measureRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={measureRef} className="flex flex-col">
      {cards.map((card, i) => (
        <RewardCardTile key={card.brand} card={card} index={i} />
      ))}
    </div>
  );
}

/** A single infinite vertical column: two identical sets stacked and looped by one
 *  set's height. `direction` 1 scrolls up, -1 scrolls down; `phase` (0–1) offsets
 *  the starting frame so neighbouring columns don't line up. Reduced motion freezes
 *  the stack. */
function RewardColumn({
  cards,
  direction,
  phase = 0,
}: {
  cards: readonly RewardCard[];
  direction: 1 | -1;
  phase?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const set = setRef.current;
      if (!track || !set) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const startLoop = () => {
          tweenRef.current?.kill();
          const distance = set.offsetHeight;
          if (distance <= 0) return;

          const from = direction === 1 ? 0 : -distance;
          const to = direction === 1 ? -distance : 0;
          gsap.set(track, { y: from });

          tweenRef.current = gsap.to(track, {
            y: to,
            duration: distance / PIXELS_PER_SECOND,
            ease: "none",
            repeat: -1,
          });
          if (phase) tweenRef.current.progress(phase);
        };

        startLoop();

        const ro = new ResizeObserver(startLoop);
        ro.observe(set);

        return () => {
          ro.disconnect();
          tweenRef.current?.kill();
          tweenRef.current = null;
          gsap.set(track, { y: 0 });
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        tweenRef.current?.kill();
        tweenRef.current = null;
        gsap.set(track, { y: 0 });
      });

      return () => mm.revert();
    },
    { dependencies: [direction, phase] },
  );

  return (
    <div className="w-[112px] desktop:w-[136px]">
      <div ref={trackRef} className="flex flex-col will-change-transform">
        <RewardSet cards={cards} measureRef={setRef} />
        <RewardSet cards={cards} />
      </div>
    </div>
  );
}

/**
 * The Engage tab's "Real-World Rewards" view: two columns of brand reward cards
 * over the right of the video, scrolling in opposite directions in a seamless loop
 * (Figma 2836:9324). It sits inside its own clip that matches the video's rounded
 * corners, fades in when the column is selected, and is hidden on mobile — the same
 * envelope as the floating chat-log the other columns use.
 */
export default function RewardsColumns() {
  return (
    <div
      className="rewards-columns pointer-events-none absolute inset-0 z-10 hidden overflow-hidden rounded-md tablet:block"
      aria-hidden
    >
      <div className="absolute inset-y-0 right-[16px] flex gap-[16px] tablet:right-[28px] tablet:gap-[20px] desktop:right-[44px] desktop:gap-[24px]">
        <RewardColumn cards={rewardColumns.left} direction={-1} />
        <RewardColumn cards={rewardColumns.right} direction={1} phase={0.35} />
      </div>
    </div>
  );
}
