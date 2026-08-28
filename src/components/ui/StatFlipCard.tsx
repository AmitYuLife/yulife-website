"use client";

import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/assetPath";
import { cn } from "@/lib/utils";
import type { ProvenRoiStat } from "@/data/pages/types";

gsap.registerPlugin(useGSAP);

const HATCH = "/products/stat-fan/hatch.svg";

// As a raised card lifts to the front it clips past its neighbours; the others
// shrink back and tilt away so it reads as the card parting them.
const DIM_SCALE = 0.94;
const PUSH_DEG = 6; // rotation of a neighbour away from the active card
const PUSH_X = 16; // shift of a neighbour away from the active card, px

// Pointer tilt — the same lean as the home-page floating cards, without the
// drop-shadow/sheen (which softened the text and lagged during the flip).
const TILT_MAX_DEG = 12;

// Hatch-gradient sweep easing (same fix as HeroHeadline's gradient tracking:
// ease toward the pointer via rAF, decoupled from pointermove's event rate,
// instead of a CSS transition — see hero-accent-gradient-interactive).
const HATCH_EASE_FACTOR = 0.25; // share of the remaining distance closed each frame
const HATCH_SETTLE_THRESHOLD_DEG = 0.5; // stop the rAF loop once this close to target

/** Shortest signed distance from `from` to `to` around a circle, in degrees. */
function shortestAngleDelta(from: number, to: number) {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

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

/**
 * One arced hatch band on the card back, coloured by the angular brand sweep
 * masked to the hairline artwork (mask alpha = the SVG's own hairlines, so
 * their opacity carries straight through). The sweep's `from` angle reads
 * `--hatch-gradient-angle`, which the pointer-tilt handler drives — turning
 * the band into a foil-style sheen that reacts to where the light "hits".
 */
function HatchBand({ className }: { className: string }) {
  const maskUrl = `url(${assetPath(HATCH)})`;
  return (
    <div
      aria-hidden
      className={cn(
        "stat-card-hatch-band pointer-events-none absolute aspect-[334/246] select-none",
        "[mask-mode:alpha] [mask-repeat:no-repeat] [mask-size:100%_100%]",
        "[-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]",
        className,
      )}
      style={{ WebkitMaskImage: maskUrl, maskImage: maskUrl }}
    />
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

export type StatFlipCardProps = {
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
 *
 * The individual card of the StatCardFan block.
 */
export default function StatFlipCard({
  stat,
  index,
  isOpen,
  isHovered,
  onToggle,
  onHover,
  activeIndex,
  angle,
  layout,
}: StatFlipCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<HTMLDivElement>(null);
  const reducedRef = useRef(false);
  const hatchTargetAngle = useRef(0);
  const hatchCurrentAngle = useRef(0);
  const hatchRafId = useRef<number | null>(null);
  const { number, suffix } = parseStatValue(stat.value);
  const label = stat.label.replace(/\n/g, " ");
  const active = isHovered || isOpen;

  useEffect(() => {
    reducedRef.current = prefersReducedMotion();
  }, []);

  // Eases the applied --hatch-gradient-angle toward the latest pointer
  // target every frame, decoupled from pointermove's event rate — this is
  // what makes the sweep glide instead of jumping straight to each sample
  // (same fix as HeroHeadline's gradient tracking).
  const tickHatchGradient = useCallback(() => {
    const el = cardRef.current;
    if (!el) {
      hatchRafId.current = null;
      return;
    }

    const delta = shortestAngleDelta(hatchCurrentAngle.current, hatchTargetAngle.current);
    hatchCurrentAngle.current += delta * HATCH_EASE_FACTOR;
    el.style.setProperty("--hatch-gradient-angle", `${hatchCurrentAngle.current.toFixed(2)}deg`);

    if (Math.abs(delta) < HATCH_SETTLE_THRESHOLD_DEG) {
      hatchRafId.current = null;
      return;
    }
    hatchRafId.current = requestAnimationFrame(tickHatchGradient);
  }, []);

  useEffect(
    () => () => {
      if (hatchRafId.current !== null) cancelAnimationFrame(hatchRafId.current);
    },
    [],
  );

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
    // Sweep the hatch gradient to face the pointer, like foil catching light
    // from that direction (atan2 measured from centre, converted from
    // math convention — 0deg = east — to the conic-gradient convention
    // used by `from`, where 0deg = north). Only the target updates here;
    // tickHatchGradient eases the applied value toward it every frame.
    hatchTargetAngle.current = (Math.atan2(py, px) * 180) / Math.PI + 90;
    if (hatchRafId.current === null) {
      hatchRafId.current = requestAnimationFrame(tickHatchGradient);
    }
  };

  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    onHover(index, false);
    const el = e.currentTarget;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    hatchTargetAngle.current = 0;
    if (reducedRef.current) {
      if (hatchRafId.current !== null) {
        cancelAnimationFrame(hatchRafId.current);
        hatchRafId.current = null;
      }
      hatchCurrentAngle.current = 0;
      el.style.setProperty("--hatch-gradient-angle", "0deg");
    } else if (hatchRafId.current === null) {
      hatchRafId.current = requestAnimationFrame(tickHatchGradient);
    }
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
        ref={cardRef}
        data-stat-card={index}
        className={cn(
          "relative h-[487px] w-[324px] cursor-pointer rounded-[24px] will-change-transform [transform:perspective(1000px)_rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] [transition:transform_0.4s_cubic-bezier(0.22,1,0.36,1),box-shadow_0.25s_ease] motion-reduce:transition-none",
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
          <div ref={flipRef} className="relative h-full w-full will-change-transform [transform-style:preserve-3d]">
            {/* Front */}
            <div
              aria-hidden={isOpen}
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center gap-8 overflow-hidden rounded-[24px] border border-line-emphasis p-40 text-center transition-colors duration-150 [backface-visibility:hidden] will-change-transform motion-reduce:transition-none",
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
              className="absolute inset-0 flex flex-col items-start justify-between overflow-hidden rounded-[24px] border border-line-emphasis bg-surface-inverse p-40 text-left [backface-visibility:hidden] will-change-transform [transform:rotateY(180deg)]"
            >
              <HatchBand className="left-0 top-0 w-full rotate-180" />
              <HatchBand className="bottom-0 left-0 w-full" />
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
