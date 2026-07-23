"use client";

import { useCallback, useRef } from "react";
import { finalCta } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import FinalCtaRocket from "@/components/home/FinalCtaRocket";
import { useReveal } from "./useReveal";

/** How much of the pointer range shifts the gradient (0–1). Lower = subtler. */
const POINTER_INFLUENCE = 0.55;

export default function FinalCta() {
  const scope = useReveal<HTMLElement>();
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
    <section
      ref={scope}
      className="relative isolate overflow-hidden border-b"
      style={{
        backgroundColor: "var(--purple-900)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="final-cta-heading"
    >
      <FinalCtaRocket />

      <div className="page-container relative z-[2] section-y pointer-events-none">
        <div className="mx-auto flex w-full max-w-[904px] flex-col items-center gap-flow text-center pointer-events-none">
          <div className="flex flex-col items-center gap-flow pointer-events-none">
            <h2
              id="final-cta-heading"
              data-reveal
              className="type-heading-h2 pointer-events-auto"
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
              data-reveal
              className="type-body-lg pointer-events-auto max-w-[592px]"
              style={{ color: "var(--text-on-inverse)" }}
            >
              {finalCta.subheading}
            </p>
          </div>

          <div data-reveal className="pointer-events-auto">
            <Button href={finalCta.cta.href} size="lg" variant="solid" theme="onDark">
              {finalCta.cta.label}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
