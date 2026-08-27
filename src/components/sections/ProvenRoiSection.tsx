"use client";

import StatCardFan from "@/components/patterns/StatCardFan";
import { useReveal } from "@/components/hooks/useReveal";
import { domSrc } from "@/lib/domSrc";
import type { ProvenRoiSection as ProvenRoiData } from "@/data/pages/types";

/**
 * "Proven ROI" section for the Health product page (Figma node 2425:5202).
 *
 * An inverse dark-purple band with a centred header — eyebrow, serif headline and
 * a supporting paragraph — over the stat "fan of playing cards" (`StatCardFan`):
 * each stat is a two-faced card that flips to reveal its note and source. Replaces
 * the "Proven ROI" grey-box value section (number 4).
 */
export default function ProvenRoiSection({ data }: { data: ProvenRoiData }) {
  const scope = useReveal<HTMLElement>();
  const { eyebrow, heading, body, stats } = data;

  return (
    <section
      {...domSrc("ProvenRoiSection")}
      ref={scope}
      className="relative isolate overflow-hidden border-b border-line-emphasis bg-surface-inverse"
      aria-labelledby="proven-roi-heading"
    >
      <div className="page-container section-y-lg flex flex-col items-center gap-80">
        <div
          data-reveal
          className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-flow text-center"
        >
          <div className="flex flex-col items-center gap-related">
            <p className="type-eyebrow uppercase text-accent-purple">{eyebrow}</p>
            <h2 id="proven-roi-heading" className="type-heading-h2 text-on-inverse">
              {heading}
            </h2>
          </div>
          <p className="type-body-lg max-w-[62ch] text-on-inverse">{body}</p>
        </div>

        <StatCardFan stats={stats} />
      </div>
    </section>
  );
}
