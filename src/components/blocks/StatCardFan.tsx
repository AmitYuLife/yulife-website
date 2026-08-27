"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { domSrc } from "@/lib/domSrc";
import { cn } from "@/lib/utils";
import StatFlipCard from "@/components/ui/StatFlipCard";
import type { ProvenRoiStat } from "@/data/pages/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Fan geometry (desktop). Every card shares a pivot far below the row, so
// rotating each one fans them into an upward arc — centre highest, ends lower —
// and spreads them left→right at the same time. Layers descend left→right so the
// first card sits on top.
const FAN_ANGLE = 10; // degrees between adjacent cards
const FAN_PIVOT = 1600; // rotation origin depth below the card top, px
// Extra horizontal spread per card step, applied on top of the radial spread as
// a pure translation — it opens the cards up (revealing more of each number and
// label) without touching the rotation, so the arc curve and total height stay
// the same.
const FAN_SPREAD = 30;
const CARD_W = 324; // must match the card's w-[324px]
const CARD_H = 487; // must match the card's h-[487px]

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Vertical bounds of the fanned arc for a given card count, so the list box can
 * hug the arc — no dead space above or overflow below — whatever the count (the
 * cards rotate more with more cards, so the arc's height and baseline shift).
 * Corners are rotated about the shared pivot; we take the extreme Y across them.
 */
function fanBounds(count: number) {
  const mid = (count - 1) / 2;
  const dxs = [-CARD_W / 2, CARD_W / 2];
  const dys = [-FAN_PIVOT, CARD_H - FAN_PIVOT];
  let minRel = Infinity;
  let maxRel = -Infinity;
  for (let i = 0; i < count; i += 1) {
    const th = ((i - mid) * FAN_ANGLE * Math.PI) / 180;
    for (const dx of dxs) {
      for (const dy of dys) {
        const f = dx * Math.sin(th) + dy * Math.cos(th);
        if (f < minRel) minRel = f;
        if (f > maxRel) maxRel = f;
      }
    }
  }
  return {
    height: Math.ceil(maxRel - minRel),
    bottom: Math.round(maxRel - CARD_H + FAN_PIVOT),
  };
}

/**
 * "Fan of playing cards" stat display (Figma IntroSection, node 2425:5202). On
 * desktop the stats fan out left→right along an upward arc, each layered over the
 * last; on entry the deck rises at the right and the fan opens out to the left. Hovering a card raises it,
 * flips its face to the inverse "active" tone and leans it toward the pointer;
 * clicking lifts it clear of the fan and flips it to reveal its claim and source.
 * Clicking away, or Escape, closes it. Below the desktop breakpoint it falls back
 * to a readable vertical stack that flips on tap. One card is open at a time.
 */
export default function StatCardFan({ stats }: { stats: readonly ProvenRoiStat[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fanRef = useRef<HTMLUListElement>(null);
  const mid = (stats.length - 1) / 2;
  // The open card wins over a hovered one as the "active" card the others react to.
  const activeIndex = openIndex ?? hoveredIndex;
  // List box hugs the arc for this card count (correct spacing above/below).
  const bounds = fanBounds(stats.length);

  const toggle = useCallback((index: number) => {
    setOpenIndex((current) => (current === index ? null : index));
  }, []);

  const setHover = useCallback((index: number, hovered: boolean) => {
    setHoveredIndex((current) => (hovered ? index : current === index ? null : current));
  }, []);

  // Entry: the deck starts stacked at the rightmost (last-card) position, the
  // front card rises up like the hero phone device, then the fan opens out to the
  // left. Plays once when scrolled into view.
  useGSAP(
    () => {
      const ul = fanRef.current;
      if (!ul) return;
      const lis = Array.from(ul.children) as HTMLElement[];
      const angleOf = (i: number) => (i - mid) * FAN_ANGLE;
      const spreadOf = (i: number) => (i - mid) * FAN_SPREAD;
      const reduce = prefersReducedMotion();

      if (reduce) {
        lis.forEach((li, i) =>
          gsap.set(li, { rotation: angleOf(i), x: spreadOf(i), y: 0, autoAlpha: 1 }),
        );
        return;
      }

      // Stacked at the rightmost card's angle, below and hidden (x:0 → tight pile).
      const rightAngle = mid * FAN_ANGLE;
      gsap.set(lis, {
        rotation: rightAngle,
        x: 0,
        y: 80,
        autoAlpha: 0,
        transformOrigin: `50% ${FAN_PIVOT}px`,
      });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: ul, start: "top 85%", once: true },
      });
      // The front card rises into view (like the hero phone) while the rest stay
      // hidden — so the stacked cards' numbers never bleed through. Then the fan
      // opens from the right, each card rotating to its slot and fading in
      // front→back: a card is revealed only once the opaque cards in front of it
      // have cleared, so nothing ghosts.
      tl.to(lis, { y: 0, duration: 0.5, ease: "power3.out" }, 0).to(
        lis[0],
        { autoAlpha: 1, duration: 0.3, ease: "power2.out" },
        0.12,
      );

      // Tight stagger so the cards follow the front one closely and fan as one
      // cohesive motion, rather than trailing far behind it.
      const fanStart = 0.4;
      lis.forEach((li, i) => {
        tl.to(
          li,
          { rotation: angleOf(i), x: spreadOf(i), autoAlpha: 1, duration: 0.5, ease: "power3.out" },
          fanStart + i * 0.04,
        );
      });
    },
    { scope: fanRef },
  );

  // Escape, or a click anywhere that is not the open card, closes it.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    const onDown = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.("[data-stat-card]");
      if (!card || Number(card.getAttribute("data-stat-card")) !== openIndex) {
        setOpenIndex(null);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openIndex]);

  return (
    <div ref={rootRef} {...domSrc("StatCardFan")} className="w-full">
      {/* Desktop: fan. The list-box height and the cards' bottom offset (from
          fanBounds) make the box hug the arc's visual bounds — the tips of the
          rotated cards reach the top and bottom edges — so the section's gap above
          and padding below land on the arc itself, not on dead space. */}
      <ul
        ref={fanRef}
        style={{ height: bounds.height }}
        className="relative mx-auto hidden w-full max-w-[1216px] list-none desktop:block"
      >
        {stats.map((stat, i) => {
          const angle = (i - mid) * FAN_ANGLE;
          const isOpen = openIndex === i;
          const isHovered = hoveredIndex === i;
          return (
            <li
              key={stat.value + stat.label}
              // Hidden at first paint so the pre-render doesn't flash the stacked
              // cards at centre before the entry sets up; GSAP's inline opacity
              // then takes over (and wins over this class on later re-renders).
              className="absolute left-1/2 -ml-[162px] opacity-0"
              style={{
                bottom: bounds.bottom,
                // Layers descend left→right, so the first card sits on top.
                zIndex: isOpen ? 100 : isHovered ? 60 : stats.length - 1 - i,
                transformOrigin: `center ${FAN_PIVOT}px`,
              }}
            >
              <StatFlipCard
                stat={stat}
                index={i}
                isOpen={isOpen}
                isHovered={isHovered}
                onToggle={toggle}
                onHover={setHover}
                activeIndex={activeIndex}
                angle={angle}
                layout="fan"
              />
            </li>
          );
        })}
      </ul>

      {/* Tablet / mobile: readable stack */}
      <ul className={cn("mx-auto flex list-none flex-col items-center gap-group", "desktop:hidden")}>
        {stats.map((stat, i) => (
          <li key={stat.value + stat.label} className="w-full max-w-[324px]">
            <StatFlipCard
              stat={stat}
              index={i}
              isOpen={openIndex === i}
              isHovered={false}
              onToggle={toggle}
              onHover={setHover}
              activeIndex={null}
              angle={0}
              layout="stack"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
