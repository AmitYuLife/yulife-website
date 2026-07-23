"use client";

import { useCallback, useRef } from "react";
import { finalCta } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import SectionCard from "@/components/home/pillars/SectionCard";
import RocketSlingshot from "@/components/home/RocketSlingshot";

/** How much of the pointer range shifts the gradient (0–1). Lower = subtler. */
const POINTER_INFLUENCE = 0.55;

/**
 * The join-the-mission CTA as a SectionCard (Figma node 2097:1657): copy and
 * button on the left, the slingshot rocket canvas on the right. The card
 * clips the rocket's launch, so `overflow-hidden` here is load-bearing.
 */
export default function JoinMissionCard() {
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

  return (
    <SectionCard
      data-reveal
      data-rocket-bounds
      aria-labelledby="final-cta-heading"
      className="overflow-hidden"
      style={{ backgroundColor: "var(--surface-inverse)" }}
    >
      <div className="flex w-full flex-col items-center gap-40 desktop:flex-row desktop:gap-80">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-40">
          <h2
            id="final-cta-heading"
            className="type-heading-h2"
            style={{ color: "var(--neutral-white)" }}
          >
            Join the mission
            <br />
            to{" "}
            <em
              ref={accentRef}
              className="hero-accent-gradient hero-accent-gradient-interactive italic"
              onPointerMove={onPointerMove}
            >
              inspire life
            </em>
          </h2>

          <p
            className="type-body-lg max-w-[592px]"
            style={{ color: "var(--text-on-inverse)" }}
          >
            {finalCta.subheading}
          </p>

          <Button href={finalCta.cta.href} size="lg" variant="solid" theme="onDark">
            {finalCta.cta.label}
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <RocketSlingshot />
        </div>
      </div>
    </SectionCard>
  );
}
