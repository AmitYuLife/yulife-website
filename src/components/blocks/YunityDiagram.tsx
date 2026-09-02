"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { yunity } from "@/data/home-content";
import SectionCard from "@/components/ui/SectionCard";
import YunityWordmark from "@/components/ui/YunityWordmark";
import { domSrc } from "@/lib/domSrc";

// R3F canvas is browser-only; load it client-side without blocking the band.
const YunityStar3D = dynamic(() => import("@/components/three/YunityStar3D"), {
  ssr: false,
  loading: () => null,
});

function capitalizeFirst(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Render a heading, italicising the first occurrence of `emphasis` (Berlingske
 * Serif Bold Italic — the heading is already serif/bold, so the `italic` face
 * is picked up on inherit). Falls back to the plain string when there's no
 * emphasis word or it isn't found.
 */
function renderHeading(heading: string, emphasis?: string): ReactNode {
  if (!emphasis) return heading;
  const at = heading.indexOf(emphasis);
  if (at === -1) return heading;
  return (
    <>
      {heading.slice(0, at)}
      <em className="italic">{emphasis}</em>
      {heading.slice(at + emphasis.length)}
    </>
  );
}

export type YunityContent = {
  heading: string;
  /** Word within `heading` to italicise (e.g. "smarter"). Optional. */
  emphasis?: string;
  body: string;
  steps: readonly { title: string; description: string }[];
};

/**
 * The Yunity card — wordmark lockup, heading, body and the three
 * Sense/Interpret/Guide stat cards, all inside a single framed SectionCard,
 * with the live star centred beneath it (Figma 1731:2441). Copy defaults to the
 * homepage `yunity` data; pass `content` to reuse the same visual with different
 * copy. The star carries the `data-pillar-node="star"` anchor the parent
 * measures so the connecting roots converge into its centre.
 */
export default function YunityDiagram({
  content = yunity,
  headingId = "yunity-heading",
  starLit = true,
}: {
  content?: YunityContent;
  headingId?: string;
  /**
   * Whether the star is lit. The parent section drives the entrance sequence
   * (lines draw in → star lights → dots flow) and flips this true once the
   * connecting lines have drawn in. Defaults to true so any other consumer just
   * shows the star. Reduced motion always shows it (see the wrapper classes).
   */
  starLit?: boolean;
}) {
  return (
    <div
      {...domSrc("YunityDiagram")}
      data-yunity-root
      className="flex flex-col items-center gap-[var(--layout-section-gap-xl)]"
    >
      {/* Framed card. It overlays the connecting roots: signal lines enter its
          top edge and re-emerge below to converge on the star beneath it. */}
      <SectionCard data-reveal>
        <div className="flex w-full flex-col items-center gap-[var(--layout-section-gap-xl)]">
          {/* Lockup + heading + body */}
          <div className="flex w-full flex-col items-center gap-flow">
            <div className="flex w-full flex-col items-center gap-stack">
              <YunityWordmark className="h-[52px] w-auto shrink-0" />
              <h2 id={headingId} className="type-heading-h3 text-center text-on-inverse">
                {renderHeading(content.heading, content.emphasis)}
              </h2>
            </div>
            <p className="type-body-lg w-full text-center text-on-inverse">{content.body}</p>
          </div>

          {/* Three stat cards (Sense / Interpret / Guide). The big number
              overhangs the top edge of each card. */}
          <div className="flex w-full flex-col gap-[48px] text-center tablet:flex-row tablet:gap-group">
            {content.steps.map((step, i) => (
              <div
                key={step.title}
                className="relative flex flex-1 flex-col items-center gap-related rounded-md border border-line-emphasis p-32 tablet:p-40"
              >
                <span
                  aria-hidden="true"
                  className="type-display-number pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[64%] text-on-inverse"
                >
                  {i + 1}
                </span>
                <span className="type-eyebrow uppercase text-accent-purple">{step.title}</span>
                <p className="type-body-lg text-on-inverse">
                  {capitalizeFirst(step.description).replace(/\.$/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* The Yunity star — a live 3D instance beneath the card. The invisible
          anchor marks its exact centre, so every connecting root converges into
          the middle of the star. aspect-square reserves the full 200×200 before
          the canvas loads, so the measured convergence point never shifts. Lit
          as the last step of the entrance sequence via opacity only — a CSS
          scale would change the canvas's measured (getBoundingClientRect) size
          and knock the 3D star off-centre until the next resize. Reduced motion
          shows it immediately (the motion-reduce override wins regardless). */}
      <div
        className={`relative aspect-square w-[300px] max-w-full transition-opacity duration-700 ease-out motion-reduce:!opacity-100 motion-reduce:transition-none ${
          starLit ? "opacity-100" : "opacity-0"
        }`}
      >
        <YunityStar3D size={300} />
        <span
          data-pillar-node="star"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-0 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
}
