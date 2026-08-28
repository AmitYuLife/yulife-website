"use client";

import { useCallback, useEffect, useRef } from "react";
import { hero } from "@/data/home-content";
import { domSrc } from "@/lib/domSrc";

/** How much of the pointer range shifts the gradient (0–1). Lower = subtler. */
const POINTER_INFLUENCE = 0.55;
/** Share of the remaining distance closed each frame (0–1). Higher = snappier. */
const EASE_FACTOR = 0.25;
/** Stop the rAF loop once within this many % points of the target. */
const SETTLE_THRESHOLD = 0.05;

export default function HeroHeadline() {
  const accentRef = useRef<HTMLElement>(null);
  const targetPos = useRef({ x: 50, y: 50 });
  const currentPos = useRef({ x: 50, y: 50 });
  const rafId = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Eases the applied background-position toward the latest pointer target
  // every frame, decoupled from pointermove's event rate — this is what
  // makes the gradient glide instead of jumping straight to each new sample.
  const tick = useCallback(() => {
    const accentEl = accentRef.current;
    if (!accentEl) {
      rafId.current = null;
      return;
    }

    const current = currentPos.current;
    const target = targetPos.current;
    current.x += (target.x - current.x) * EASE_FACTOR;
    current.y += (target.y - current.y) * EASE_FACTOR;
    accentEl.style.backgroundPosition = `${current.x}% ${current.y}%`;

    if (Math.abs(target.x - current.x) < SETTLE_THRESHOLD && Math.abs(target.y - current.y) < SETTLE_THRESHOLD) {
      rafId.current = null;
      return;
    }
    rafId.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => () => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const accentEl = accentRef.current;
    if (!accentEl) return;

    const rect = accentEl.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    const offsetX = (nx - 0.5) * 100 * POINTER_INFLUENCE;
    const offsetY = (ny - 0.5) * 100 * POINTER_INFLUENCE;

    // A higher background-position shifts the image the opposite way, so
    // subtract the offset to make the gradient travel with the pointer.
    targetPos.current = { x: 50 - offsetX, y: 50 - offsetY };

    if (reducedMotion.current) {
      currentPos.current = targetPos.current;
      accentEl.style.backgroundPosition = `${targetPos.current.x}% ${targetPos.current.y}%`;
      return;
    }

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const breakAt = hero.h1.indexOf(" that ");
  const headline =
    breakAt === -1 ? (
      hero.h1
    ) : (
      <>
        {hero.h1.slice(0, breakAt + 5)}
        <br />
        <em
          ref={accentRef}
          className="hero-accent-gradient hero-accent-gradient-interactive italic"
          onPointerMove={onPointerMove}
        >
          {hero.h1.slice(breakAt + 6)}
        </em>
      </>
    );

  return (
    <div {...domSrc("HeroHeadline")} className="hero-headline flex w-full flex-col items-center gap-stack text-center">
      <h1
        className="type-display w-full"
        style={{ color: "var(--hero-ink)" }}
      >
        {headline}
      </h1>
      <p className="type-lead w-full" style={{ color: "var(--hero-ink)" }}>
        {hero.subheading}
      </p>
    </div>
  );
}
