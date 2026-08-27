"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import { cn } from "@/lib/utils";
import type { ProvenRoiStat } from "@/data/pages/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const HATCH = "/products/stat-fan/hatch.svg";

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

// As a raised card lifts to the front it clips past its neighbours; the others
// shrink back and tilt away so it reads as the card parting them.
const DIM_SCALE = 0.94;
const PUSH_DEG = 6; // rotation of a neighbour away from the active card
const PUSH_X = 16; // shift of a neighbour away from the active card, px

// Pointer tilt — the same lean as the home-page floating cards, without the
// drop-shadow/sheen (which softened the text and lagged during the flip).
const TILT_MAX_DEG = 12;

// Flip timing — snappy, and closing runs 10% faster than opening.
const FLIP_OPEN_DURATION = 0.45;
const FLIP_CLOSE_DURATION = FLIP_OPEN_DURATION * 0.9;

function prefersHoverInteraction() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** "12%" → { number: "12", suffix: "%" }; anything non-numeric stays whole. */
function parseStatValue(value: string) {
  const match = value.match(/^([\d.,]+)(.*)$/);
  return match
    ? { number: match[1], suffix: match[2] }
    : { number: value, suffix: "" };
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

/** Heart "suit" glyph — inlined so the body fill can track the card background
 * (via currentColor) and darken with it on hover. Exact vector from Figma. */
function HeartGlyph({ className }: { className?: string }) {
  return (
    <svg
      width="44"
      height="40"
      viewBox="0 0 45 41"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M41.5285 24.2906C37.6737 31.0081 28.5432 37.2791 24.3896 39.8983C23.0764 40.7263 21.4692 40.6975 20.1807 39.8259C16.1691 37.1124 7.40056 30.6914 3.15979 23.7919C-0.257021 18.2329 -0.587865 8.66465 3.83288 3.98843C8.2537 -0.701996 15.3621 -0.656771 19.7308 4.08958L21.8426 6.38388C22.1879 6.75906 22.7512 6.76264 23.1006 6.39189L25.2376 4.12461C29.6584 -0.565815 36.7668 -0.52059 41.1355 4.22576C45.4779 8.95773 45.5578 17.2687 41.5285 24.2906Z"
        fill="currentColor"
      />
      <path
        d="M12.1297 33.6995C11.4889 33.1692 12.7044 34.2194 12.1297 33.6995C8.18311 29.9556 0.799154 24.7453 0.507825 14.1766C0.244868 4.24597 6.6678 1.07237 10.2162 0.592127M12.1297 33.6995C11.5327 33.167 12.7449 34.2201 12.1297 33.6995ZM44.416 15.2886C45.3861 4.69914 37.633 1.6473 37.633 1.6473M41.5285 24.2906C37.6737 31.0081 28.5432 37.2791 24.3896 39.8983C23.0764 40.7263 21.4692 40.6975 20.1807 39.8259C16.1691 37.1124 7.40056 30.6914 3.15979 23.7919C-0.257021 18.2329 -0.587865 8.66465 3.83288 3.98843C8.2537 -0.701996 15.3621 -0.656771 19.7308 4.08958L21.8426 6.38388C22.1879 6.75906 22.7512 6.76264 23.1006 6.39189L25.2376 4.12461C29.6584 -0.565815 36.7668 -0.52059 41.1355 4.22576C45.4779 8.95773 45.5578 17.2687 41.5285 24.2906Z"
        stroke="var(--color-line-emphasis)"
      />
    </svg>
  );
}

type CardProps = {
  stat: ProvenRoiStat;
  index: number;
  isOpen: boolean;
  isHovered: boolean;
  onToggle: (index: number) => void;
  onHover: (index: number, hovered: boolean) => void;
  /** The card that is currently open or hovered (the "active" card), or null. */
  activeIndex: number | null;
  /** Fan angle for this slot; the lift wrapper counter-rotates to straighten when open. */
  angle: number;
  layout: "fan" | "stack";
};

/**
 * A single stat rendered as a two-faced playing card. Front: big serif number +
 * label with heart "suit" glyphs in opposing corners. Back: the claim + source
 * over a diagonal arc "card back" texture. Clicking flips it (3D rotateY); in the
 * fan layout hovering raises it (with an inverse "active" face) and leans it
 * toward the pointer, and clicking lifts it clear of the fan and straightens it.
 *
 * Nested transform layers keep GSAP, the flip and the tilt from clobbering one
 * another (see CLAUDE.md): the outer slot carries the fan rotation, the lift
 * wrapper owns y/scale/straighten/push, the tilt layer leans toward the pointer,
 * and an inner perspective box owns the rotateY flip.
 */
function StatFlipCard({
  stat,
  index,
  isOpen,
  isHovered,
  onToggle,
  onHover,
  activeIndex,
  angle,
  layout,
}: CardProps) {
  const liftRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);
  const { number, suffix } = parseStatValue(stat.value);
  const label = stat.label.replace(/\n/g, " ");
  const active = isHovered || isOpen;

  useEffect(() => {
    reducedRef.current = prefersReducedMotion();
  }, []);

  // Lift / peek / straighten / part — fan layout only.
  useGSAP(
    () => {
      if (layout !== "fan" || !liftRef.current) return;
      const reduce = prefersReducedMotion();
      let target: gsap.TweenVars;
      if (isOpen) {
        target = { x: 0, y: -60, scale: 1.06, rotation: -angle };
      } else if (isHovered) {
        target = { x: 0, y: -28, scale: 1.04, rotation: 0 };
      } else if (activeIndex !== null) {
        // A different card is active — part away from it, shrinking back.
        const dist = index - activeIndex;
        const dir = Math.sign(dist);
        const falloff = 1 / Math.abs(dist);
        target = {
          x: dir * PUSH_X * falloff,
          y: 0,
          scale: DIM_SCALE,
          rotation: dir * PUSH_DEG * falloff,
        };
      } else {
        target = { x: 0, y: 0, scale: 1, rotation: 0 };
      }
      gsap.to(liftRef.current, {
        ...target,
        duration: reduce ? 0 : 0.4,
        ease: "power3.out",
        overwrite: true,
      });
    },
    { dependencies: [isOpen, isHovered, activeIndex, index, angle, layout], scope: liftRef },
  );

  // Flip — both layouts.
  useGSAP(
    () => {
      if (!flipRef.current) return;
      const reduce = prefersReducedMotion();
      gsap.to(flipRef.current, {
        rotationY: isOpen ? 180 : 0,
        duration: reduce ? 0 : isOpen ? FLIP_OPEN_DURATION : FLIP_CLOSE_DURATION,
        ease: "power3.inOut",
        overwrite: true,
      });
    },
    { dependencies: [isOpen], scope: flipRef },
  );

  const handleEnter = () => {
    if (prefersHoverInteraction()) onHover(index, true);
  };

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedRef.current || !prefersHoverInteraction()) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty("--tilt-x", `${(-py * TILT_MAX_DEG).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * TILT_MAX_DEG).toFixed(2)}deg`);
  };

  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    onHover(index, false);
    const el = e.currentTarget;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggle(index);
    }
  };

  return (
    <div ref={liftRef} className="will-change-transform">
      <div
        data-stat-card={index}
        className={cn(
          "relative h-[487px] w-[324px] cursor-pointer rounded-[24px] [transform:perspective(1000px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] [transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),box-shadow_0.25s_ease] motion-reduce:transition-none",
          // Shadow/Card (Figma) — a flat offset drop shadow when the card is
          // resting; it drops away as the card tilts/lifts on hover or open.
          active ? "shadow-none" : "shadow-[8px_8px_0px_0px_rgba(0,0,0,0.08)]",
        )}
        onPointerEnter={handleEnter}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        onClick={() => onToggle(index)}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`${stat.value} ${label}`}
      >
        <div className="absolute inset-0 [perspective:1200px]">
          <div ref={flipRef} className="relative h-full w-full [transform-style:preserve-3d]">
            {/* Front */}
            <div
              aria-hidden={isOpen}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-8 overflow-hidden rounded-[24px] border border-line-emphasis p-40 text-center transition-colors duration-150 [backface-visibility:hidden] motion-reduce:transition-none",
                active ? "bg-surface-inverse" : "bg-surface-inverse-raised",
              )}
            >
              <CardFrame />
              <HeartGlyph
                className={cn(
                  "absolute left-[16px] top-[16px] transition-colors duration-150 motion-reduce:transition-none",
                  active ? "text-surface-inverse" : "text-surface-inverse-raised",
                )}
              />
              <HeartGlyph
                className={cn(
                  "absolute bottom-[16px] right-[16px] rotate-180 transition-colors duration-150 motion-reduce:transition-none",
                  active ? "text-surface-inverse" : "text-surface-inverse-raised",
                )}
              />
              <span className="flex h-[72px] flex-col justify-center">
                <span className="type-display-number inline-flex items-baseline leading-none text-on-inverse">
                  <span className="text-[80px] leading-none">{number}</span>
                  {suffix && <span className="text-[40px] leading-none">{suffix}</span>}
                </span>
              </span>
              <p className="type-body-lg font-bold whitespace-pre-line text-on-inverse">
                {stat.label}
              </p>
            </div>

            {/* Back (Figma node 2440:5339) — claim top, source bottom, left-aligned. */}
            <div
              aria-hidden={!isOpen}
              className="absolute inset-0 flex flex-col items-start justify-between overflow-hidden rounded-[24px] border border-line-emphasis bg-surface-inverse p-40 text-left [backface-visibility:hidden] [transform:rotateY(180deg)]"
            >
              <img
                src={assetPath(HATCH)}
                alt=""
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 w-full rotate-180 select-none"
              />
              <img
                src={assetPath(HATCH)}
                alt=""
                aria-hidden
                className="pointer-events-none absolute bottom-0 left-0 w-full select-none"
              />
              <p className="type-body-lg relative text-balance text-on-inverse">{stat.note}</p>
              {stat.source && (
                <p className="type-body-sm relative text-on-inverse">{stat.source}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Decorative inner border, inset ~32px — the "picture frame" of a playing card. */
function CardFrame() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-[32px] rounded-[16px] border border-line-emphasis"
    />
  );
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
