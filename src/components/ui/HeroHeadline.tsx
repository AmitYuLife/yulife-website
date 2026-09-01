"use client";

import { useCallback, useEffect, useRef } from "react";
import { hero } from "@/data/home-content";
import { domSrc } from "@/lib/domSrc";

/** Share of the remaining distance closed each frame (0–1). Higher = snappier. */
const EASE_FACTOR = 0.2;
/** Stop the rAF loop once centre + radius are within this many px of target. */
const SETTLE_THRESHOLD = 0.5;
/** Blob radius relative to the accent overlay's height — a localised spotlight,
 * not a wash over the whole word, so the reveal reads as it moves. */
const SPOT_RADIUS_RATIO = 0.85;

export default function HeroHeadline() {
  const accentRef = useRef<HTMLElement>(null);
  // The gradient overlay carries the spotlight mask + its --spot-* vars. It's
  // measured and written directly (not via the base) because it's offset a
  // little above the base line to clear the glyph overhang — see globals.css.
  const spotRef = useRef<HTMLSpanElement>(null);
  // Eased (applied) vs target spotlight state, in px within the overlay box.
  const current = useRef({ x: 0, y: 0, r: 0 });
  const target = useRef({ x: 0, y: 0, r: 0 });
  const rafId = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const write = useCallback((x: number, y: number, r: number) => {
    const el = spotRef.current;
    if (!el) return;
    el.style.setProperty("--spot-x", `${x}px`);
    el.style.setProperty("--spot-y", `${y}px`);
    el.style.setProperty("--spot-r", `${r}px`);
  }, []);

  // Eases the applied spotlight (centre + radius) toward the latest target
  // every frame, decoupled from pointermove's rate — this is what makes the
  // reveal glide and swell/retract instead of snapping to each sample.
  const tick = useCallback(() => {
    const c = current.current;
    const t = target.current;
    c.x += (t.x - c.x) * EASE_FACTOR;
    c.y += (t.y - c.y) * EASE_FACTOR;
    c.r += (t.r - c.r) * EASE_FACTOR;
    write(c.x, c.y, c.r);

    if (
      Math.abs(t.x - c.x) < SETTLE_THRESHOLD &&
      Math.abs(t.y - c.y) < SETTLE_THRESHOLD &&
      Math.abs(t.r - c.r) < SETTLE_THRESHOLD
    ) {
      rafId.current = null;
      return;
    }
    rafId.current = requestAnimationFrame(tick);
  }, [write]);

  const kick = useCallback(() => {
    if (reducedMotion.current) {
      const t = target.current;
      current.current = { ...t };
      write(t.x, t.y, t.r);
      return;
    }
    if (rafId.current === null) rafId.current = requestAnimationFrame(tick);
  }, [tick, write]);

  useEffect(() => () => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
  }, []);

  const pointFromEvent = (event: React.PointerEvent<HTMLElement>) => {
    const el = spotRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      r: rect.height * SPOT_RADIUS_RATIO,
    };
  };

  const onPointerEnter = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const el = accentRef.current;
      const p = pointFromEvent(event);
      if (!el || !p) return;
      el.dataset.spot = "on";
      // Start the blob from the entry point at zero radius so it swells open
      // rather than sweeping in from wherever it last rested.
      current.current = { x: p.x, y: p.y, r: 0 };
      target.current = p;
      kick();
    },
    [kick],
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      if (accentRef.current?.dataset.spot !== "on") return;
      const p = pointFromEvent(event);
      if (!p) return;
      target.current = p;
      kick();
    },
    [kick],
  );

  const onPointerLeave = useCallback(() => {
    const el = accentRef.current;
    if (!el) return;
    el.dataset.spot = "";
    // Retract the blob to nothing at its current centre; the opacity fade (CSS)
    // rides on top so it dissolves as it shrinks.
    target.current = { ...current.current, r: 0 };
    kick();
  }, [kick]);

  return (
    <div {...domSrc("HeroHeadline")} className="hero-headline flex w-full flex-col items-center gap-stack text-center">
      {/* Two sizes, tight line-heights so the larger italic accent overlaps up
          into the lead line (see the design). */}
      <h1 className="w-full" style={{ color: "var(--hero-ink)" }}>
        <span className="type-heading-h2 block leading-[0.9]">{hero.h1Lead}</span>
        <span
          ref={accentRef}
          className="hero-accent type-display-hero italic leading-[0.68]"
          onPointerEnter={onPointerEnter}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
        >
          {hero.h1Accent}
          <span
            ref={spotRef}
            aria-hidden
            className="hero-accent-spotlight type-display-hero italic leading-[0.68]"
          >
            {hero.h1Accent}
          </span>
        </span>
      </h1>
      <p className="type-lead w-full" style={{ color: "var(--hero-ink)" }}>
        <strong className="font-bold">{hero.subheadingLead}</strong>{" "}
        {hero.subheadingRest}
      </p>
    </div>
  );
}
