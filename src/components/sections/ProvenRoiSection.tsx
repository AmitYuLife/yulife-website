"use client";

import { Fragment, type ReactNode } from "react";
import StatCardFan from "@/components/blocks/StatCardFan";
import { useReveal } from "@/components/hooks/useReveal";
import { domSrc } from "@/lib/domSrc";
import type { ProvenRoiSection as ProvenRoiData } from "@/data/pages/types";

/** Render a heading, italicising each `emphasis` word. One word or several;
 *  falls back to the plain string. Mirrors YunityDiagram's helper. */
function renderHeading(heading: string, emphasis?: string | readonly string[]): ReactNode {
  const words = (typeof emphasis === "string" ? [emphasis] : emphasis ? [...emphasis] : []).filter(
    Boolean,
  );
  if (words.length === 0) return heading;
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const parts = heading.split(new RegExp(`(${escaped.join("|")})`, "g"));
  return parts.map((part, i) =>
    part && words.includes(part) ? (
      <em key={i} className="italic">
        {part}
      </em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * "Proven ROI" section for the Health product page (Figma node 2425:5202).
 *
 * An inverse dark-purple band with a centred header — eyebrow, serif headline and
 * a supporting paragraph — over the stat "fan of playing cards" (`StatCardFan`):
 * each stat is a two-faced card that flips to reveal its note and source. Replaces
 * the "Proven ROI" grey-box value section (number 4).
 */
export default function ProvenRoiSection({
  data,
  surface = "inverse",
}: {
  data: ProvenRoiData;
  /** Section background. Defaults to dark; the Health page runs it raised to keep
   *  the page's dark/raised alternation correct. */
  surface?: "inverse" | "inverse-raised";
}) {
  const scope = useReveal<HTMLElement>();
  const { eyebrow, heading, emphasis, body, stats } = data;
  const bgClass =
    surface === "inverse-raised" ? "bg-surface-inverse-raised" : "bg-surface-inverse";

  return (
    <section
      {...domSrc("ProvenRoiSection")}
      ref={scope}
      className={`relative isolate overflow-hidden border-b border-line-emphasis ${bgClass}`}
      aria-labelledby="proven-roi-heading"
    >
      {/* Figma IntroSection (2896:14738): space/160 top and bottom at desktop,
          space/80 between the header and the fan. */}
      <div className="page-container section-y flex flex-col items-center gap-80 desktop:py-160">
        <div
          data-reveal
          className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-32 text-center"
        >
          <div className="flex flex-col items-center gap-related">
            {eyebrow && (
              <p className="type-eyebrow uppercase text-accent-purple">{eyebrow}</p>
            )}
            <h2
              id="proven-roi-heading"
              // whitespace-pre-line lets a heading honour explicit "\n" break
              // points from the design; headings without one wrap normally.
              // The design sets this heading solid (line-height = font size),
              // tighter than the h2 role's own line height.
              className="type-heading-h2 whitespace-pre-line leading-[1] text-on-inverse"
            >
              {renderHeading(heading, emphasis)}
            </h2>
          </div>
          <p className="type-body-lg max-w-[62ch] text-on-inverse">{body}</p>
        </div>

        <StatCardFan stats={stats} />
      </div>
    </section>
  );
}
