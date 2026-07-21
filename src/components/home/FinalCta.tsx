"use client";

import { finalCta } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { useReveal } from "./useReveal";

export default function FinalCta() {
  const scope = useReveal<HTMLElement>();

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t"
      style={{
        backgroundColor: "var(--purple-900)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="final-cta-heading"
    >
      <div className="page-container section-y">
        <div className="flex flex-col items-center gap-24 text-center desktop:flex-row desktop:justify-center desktop:gap-48 desktop:text-left">
          <img
            src="/home/rocket.png"
            alt=""
            aria-hidden="true"
            data-reveal
            className="h-[220px] w-[220px] shrink-0 select-none tablet:h-[300px] tablet:w-[300px] desktop:h-[400px] desktop:w-[400px]"
          />

          <div className="max-w-[600px]">
            <h2
              id="final-cta-heading"
              data-reveal
              className="type-heading-h2"
              style={{ color: "var(--neutral-white)" }}
            >
              Join the mission
              <br />
              to <span className="hero-accent-gradient">inspire life</span>
            </h2>

            <p
              data-reveal
              className="type-body-lg mx-auto mt-24 max-w-[520px] desktop:mx-0"
              style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
            >
              {finalCta.subheading}
            </p>

            <div data-reveal className="mt-40">
              <Button href={finalCta.cta.href} size="lg" variant="solid" theme="onDark">
                {finalCta.cta.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
