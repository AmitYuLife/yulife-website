"use client";

import { useCallback, useRef } from "react";
import { hero } from "@/data/home-content";

/** How much of the pointer range shifts the gradient (0–1). Lower = subtler. */
const POINTER_INFLUENCE = 0.55;

export default function HeroHeadline() {
  const accentRef = useRef<HTMLElement>(null);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const accentEl = accentRef.current;
    if (!accentEl) return;

    const rect = accentEl.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    const offsetX = (nx - 0.5) * 100 * POINTER_INFLUENCE;
    const offsetY = (ny - 0.5) * 100 * POINTER_INFLUENCE;

    accentEl.style.backgroundPosition = `${50 + offsetX}% ${50 + offsetY}%`;
  }, []);

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
    <div className="hero-headline flex w-full flex-col items-center gap-flow text-center">
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
