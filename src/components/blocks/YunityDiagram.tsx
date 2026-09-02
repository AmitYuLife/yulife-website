"use client";

import { Fragment, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { yunity } from "@/data/home-content";
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
 * Render a heading, italicising each `emphasis` word (Berlingske Serif Bold
 * Italic — the heading is already serif/bold, so the `italic` face is picked up
 * on inherit). Accepts one word or several; falls back to the plain string.
 */
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

export type YunityContent = {
  heading: string;
  /** Word(s) within `heading` to italicise (e.g. ["more", "smarter"]). Optional. */
  emphasis?: string | readonly string[];
  body: string;
  steps: readonly { title: string; description: string }[];
};

/**
 * The Yunity content — wordmark lockup, heading, body and the three
 * Sense/Interpret/Guide stat cards, with the live star centred beneath them
 * (Figma 2706:4997). No outer frame: everything sits directly on the band. Each
 * stat card carries a `data-pillar-node="top"` anchor and the star carries
 * `data-pillar-node="star"`, so the parent measures the roots descending from
 * the cards into the star. Copy defaults to the homepage `yunity` data.
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
      className="flex flex-col items-center gap-[var(--layout-section-y)]"
    >
      {/* Lockup + heading + body — directly on the band, no frame. */}
      <div data-reveal className="flex w-full flex-col items-center gap-flow">
        <div className="flex w-full flex-col items-center gap-stack">
          <YunityWordmark className="h-[80px] w-auto shrink-0" />
          <h2 id={headingId} className="type-heading-h2 text-center text-on-inverse">
            {renderHeading(content.heading, content.emphasis)}
          </h2>
        </div>
        <p className="type-body-lg w-full text-center text-on-inverse">{content.body}</p>
      </div>

      {/* Three stat cards (Sense / Interpret / Guide). Each is a root origin —
          the connecting line descends from its bottom into the star. The big
          number overhangs the top edge. */}
      <div
        data-reveal
        className="flex w-full flex-col gap-[48px] text-center tablet:flex-row tablet:gap-group"
      >
        {content.steps.map((step, i) => (
          <div
            key={step.title}
            data-pillar-node="top"
            data-pillar-index={i}
            className="relative flex flex-1 flex-col items-center gap-related rounded-md border border-line-emphasis bg-surface-inverse p-32 tablet:p-40"
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

      {/* The Yunity star — a live 3D instance beneath the cards. As the last
          step of the entrance sequence it fades in (opacity here) while, inside
          the scene, it rises up into place and spins fast then eases to its
          normal speed (see YunityStar3D, driven by `revealed`). The fade is
          opacity-only — a CSS transform would change the canvas's measured size
          and knock the 3D star off-centre. Reduced motion shows it settled. */}
      <div
        className={`relative aspect-square w-[300px] max-w-full transition-opacity duration-700 ease-out motion-reduce:!opacity-100 motion-reduce:transition-none ${
          starLit ? "opacity-100" : "opacity-0"
        }`}
      >
        <YunityStar3D size={300} revealed={starLit} />
        <span
          data-pillar-node="star"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 size-0 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
    </div>
  );
}
