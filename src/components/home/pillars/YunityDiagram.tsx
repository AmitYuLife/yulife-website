"use client";

import dynamic from "next/dynamic";
import { yunity } from "@/data/home-content";
import { assetPath } from "@/lib/assetPath";
import SectionCard from "./SectionCard";

// R3F canvas is browser-only; load it client-side without blocking the band.
const YunityStar3D = dynamic(() => import("@/components/star/YunityStar3D"), {
  ssr: false,
  loading: () => null,
});

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function YunityDiagram() {
  return (
    <div className="flex flex-col items-center gap-[var(--layout-section-gap)]">
      {/* Framed heading + copy — two columns (lockup + heading | body copy).
          The card overlays the connecting roots: signal lines enter its top edge
          and re-emerge below to converge on the star. */}
      <SectionCard data-reveal>
        <div className="flex flex-col gap-group tablet:flex-row tablet:items-end">
          {/* Column 1 — lockup + heading */}
          <div className="flex flex-1 flex-col items-start gap-block-gap">
            <div className="flex items-center gap-inline">
              <span className="type-eyebrow uppercase text-on-inverse">
                {yunity.eyebrow}
              </span>
              <img
                src={assetPath("/home/yunity-logo.png")}
                alt="Yunity"
                className="h-[calc(24px+0.5rem)] w-auto -translate-y-[0.2em]"
              />
            </div>
            <h2
              id="yunity-heading"
              className="type-heading-h2 text-left text-on-inverse"
            >
              {yunity.heading}
            </h2>
          </div>

          {/* Column 2 — body copy */}
          <div className="flex flex-1 flex-col gap-block-gap">
            <p className="type-body-lg text-on-inverse">{yunity.intro}</p>
            <p className="type-body-lg text-on-inverse">{yunity.body}</p>
          </div>
        </div>
      </SectionCard>

      {/* The Yunity star — a live 3D instance, centre-aligned in the band. The
          invisible anchor marks its exact centre, so every connecting path
          converges into (and out of) the middle of the star. aspect-square
          reserves the full 200×200 before the canvas loads, so the measured
          convergence point never shifts. */}
      <div data-reveal className="relative aspect-square w-[200px] max-w-full">
        <YunityStar3D size={200} />
        <span
          data-pillar-node="star"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-0 -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      {/* Three outcome cards (Sense / Interpret / Guide) */}
      <div
        data-reveal
        className="flex w-full max-w-[1216px] flex-col gap-stack text-center tablet:flex-row tablet:gap-group"
      >
        {yunity.steps.map((step, i) => (
          <div
            key={step.title}
            data-pillar-node="bottom"
            data-pillar-index={i}
            className="relative flex flex-1 flex-col items-center gap-related rounded-md bg-surface-inverse p-32 tablet:p-40"
          >
            <span className="pillar-card-ring" aria-hidden="true" />
            <span className="type-display-number text-on-inverse">{i + 1}</span>
            <span className="type-eyebrow uppercase text-surface-accent-purple">
              {step.title}
            </span>
            <p className="type-heading-h5 text-on-inverse">
              {capitalizeFirst(step.description).replace(/\.$/, "")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
