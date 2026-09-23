"use client";

import dynamic from "next/dynamic";
import { finalCta } from "@/data/home-content";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/components/hooks/useReveal";
import { domSrc } from "@/lib/domSrc";
import { surfaceData } from "@/lib/surface";
import type { Cta } from "@/data/pages/types";

const RocketSlingshot = dynamic(() => import("@/components/blocks/RocketSlingshot"), {
  ssr: false,
  loading: () => (
    <div
      className="relative w-full max-w-[488px] shrink-0"
      style={{ aspectRatio: "488 / 456" }}
      aria-hidden
    />
  ),
});

/** Page-specific copy for the closing card. Omit for the homepage's
 *  "Join the mission to inspire life" copy. */
export type JoinMissionContent = {
  heading: string;
  /** Word(s) within `heading` to set in italic. */
  accent?: string;
  body: string;
  cta: Cta;
};

/** Italicise the first occurrence of `accent` within `heading`. */
function renderAccent(heading: string, accent?: string) {
  const at = accent ? heading.indexOf(accent) : -1;
  if (!accent || at === -1) return heading;
  return (
    <>
      {heading.slice(0, at)}
      <em className="italic">{accent}</em>
      {heading.slice(at + accent.length)}
    </>
  );
}

/**
 * The join-the-mission CTA as its own full-bleed section (Figma node
 * 2128:1735): copy and button on the left, the slingshot rocket canvas on
 * the right. `data-rocket-bounds` sits on the section itself, so the flame
 * can be dragged across the whole section, not just the rocket's own column.
 */
export default function JoinMissionCard({
  surface = "inverse-raised",
  content,
}: {
  /** Section background. Defaults to raised; the Health page runs it dark so its
   *  closing band keeps the page's dark/raised alternation. */
  surface?: "inverse" | "inverse-raised";
  /** Replaces the heading, body and CTA (e.g. Wellbeing Hub, Figma 2896:15020). */
  content?: JoinMissionContent;
} = {}) {
  const scope = useReveal<HTMLElement>();

  return (
    <section {...domSrc("JoinMissionCard")}
      {...surfaceData(surface)}
      ref={scope}
      data-rocket-bounds
      className="relative overflow-hidden border-b border-line-emphasis"
      style={{
        backgroundColor:
          surface === "inverse-raised"
            ? "var(--surface-inverse-raised)"
            : "var(--surface-inverse)",
      }}
      aria-labelledby="final-cta-heading"
    >
      <div className="page-container section-y flex flex-col items-center gap-split desktop:flex-row desktop:items-center">
        <div className="relative flex w-full shrink-0 flex-col items-center gap-controls text-center desktop:items-start desktop:text-left desktop:z-10 desktop:min-w-0 desktop:flex-1">
          <h2
            id="final-cta-heading"
            data-reveal
            className="type-heading-h2 desktop:w-[620px] xl:w-[700px]"
            style={{ color: "var(--neutral-white)" }}
          >
            {content ? (
              renderAccent(content.heading, content.accent)
            ) : (
              <>
                Join the mission
                <br />
                to <em className="italic">inspire life</em>
              </>
            )}
          </h2>

          <p
            data-reveal
            className="type-body-lg max-w-[592px]"
            style={{ color: "var(--text-on-inverse)" }}
          >
            {content?.body ?? finalCta.subheading}
          </p>

          <div data-reveal>
            <Button href={(content?.cta ?? finalCta.cta).href} size="lg" variant="solid" theme="onDark">
              {(content?.cta ?? finalCta.cta).label}
            </Button>
          </div>
        </div>

        <div data-reveal className="relative z-20 flex w-full shrink-0 -translate-x-16 justify-center desktop:min-w-0 desktop:flex-1">
          <RocketSlingshot />
        </div>
      </div>
    </section>
  );
}
