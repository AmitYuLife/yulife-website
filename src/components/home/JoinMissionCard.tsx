"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { finalCta } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import SectionCard from "@/components/home/pillars/SectionCard";

const RocketSlingshot = dynamic(() => import("@/components/home/RocketSlingshot"), {
  ssr: false,
  loading: () => (
    <div
      className="relative w-full max-w-[488px] shrink-0"
      style={{ aspectRatio: "488 / 456" }}
      aria-hidden
    />
  ),
});

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
      className="overflow-hidden justify-start desktop:justify-center"
      style={{ backgroundColor: "var(--surface-inverse)" }}
    >
      <div className="flex w-full flex-col items-center gap-split desktop:flex-row desktop:items-center">
        <div className="relative flex w-full shrink-0 flex-col items-center gap-controls text-center desktop:items-start desktop:text-left desktop:z-10 desktop:min-w-0 desktop:flex-1">
          <h2
            id="final-cta-heading"
            className="type-heading-h2 desktop:w-[620px] xl:w-[700px]"
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

          <Button href={finalCta.cta.href} size="lg" variant="solid" theme="onDark" className="w-full">
            {finalCta.cta.label}
          </Button>
        </div>

        <div className="relative z-20 flex w-full shrink-0 -translate-x-16 justify-center desktop:min-w-0 desktop:flex-1">
          <RocketSlingshot />
        </div>
      </div>
    </SectionCard>
  );
}
