"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import type {
  EverydayValueSection as EverydayValueData,
  Quote,
} from "@/data/pages/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Matches the `desktop` breakpoint (1280px) — the sticky interaction only runs above it. */
const DESKTOP_QUERY = "(min-width: 1280px)";
const DIM_OPACITY = 0.35;

/**
 * The trailing "every day" is set in italic serif, matching the hero headline.
 */
function Heading({ text }: { text: string }) {
  const accent = "every day";
  if (text.endsWith(` ${accent}`)) {
    return (
      <h2 className="type-display text-on-inverse">
        {text.slice(0, text.length - accent.length)}
        <em className="italic">{accent}</em>
      </h2>
    );
  }
  return <h2 className="type-display text-on-inverse">{text}</h2>;
}

/**
 * QuoteBlock — bordered card at the foot of the section. Serif-bold pull quote
 * over a small avatar + name / role lockup. Fed by the page's carrier quote,
 * which used to live in its own section (CarrierQuoteSection); on pages with an
 * everyday-value section it now sits here instead.
 */
function QuoteBlock({ quote }: { quote: Quote }) {
  return (
    <figure className="flex w-full flex-col gap-flow rounded-[var(--radius-md)] border border-line-emphasis p-[var(--gap-group)]">
      <blockquote className="type-heading-h3 text-balance text-on-inverse">
        &ldquo;{quote.text}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-stack">
        {quote.avatar && (
          <img
            src={assetPath(quote.avatar)}
            alt=""
            width={64}
            height={64}
            className="size-[64px] shrink-0 rounded-full object-cover"
          />
        )}
        <div className="flex flex-col">
          <span className="type-body-lg font-bold text-on-inverse">{quote.author}</span>
          <span className="type-body-lg text-on-inverse/80">{quote.role}</span>
        </div>
      </figcaption>
    </figure>
  );
}

/**
 * Engagement section for the Health product page (Figma node 2179:2139).
 *
 * Two-column header (display headline left, supporting copy bottom-aligned
 * right), then sticky-scrollytelling: each block is the height of the image
 * container (a ScrollRow), the illustration on the left stays pinned to the
 * vertical centre of the viewport, and each value block on the right becomes
 * active as it crosses that centre line — the active block goes full-white
 * while the others dim, and the illustration crossfades to match. The text
 * column shares its right edge with the header copy column above.
 *
 * The divider between the two sides is two strokes: a persistent emphasis line
 * spanning the full row height (a continuous border), and a brand-gradient
 * stroke bound to the sticky image container that rides on top of it and
 * travels with the image.
 *
 * Below the scroll feature is the QuoteBlock. Below `desktop` the two columns
 * collapse: the divider and sticky image drop, and each block shows its
 * illustration inline as a plain stacked list.
 */
export default function EverydayValueSection({
  data,
  quote,
}: {
  data: EverydayValueData;
  quote?: Quote;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { eyebrow, heading, lead, body, blocks } = data;

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add(DESKTOP_QUERY, () => {
        const blockEls = gsap.utils.toArray<HTMLElement>("[data-ev-block]", el);
        const imageEls = gsap.utils.toArray<HTMLElement>("[data-ev-image]", el);
        if (!blockEls.length) return;

        // Reduced-motion visitors still get the scroll-driven highlight (it is
        // position-, not time-, driven) but the swaps are instant.
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dur = reduce ? 0 : 0.4;

        let active = -1;
        const setActive = (index: number) => {
          if (index === active) return;
          active = index;
          blockEls.forEach((block, i) =>
            gsap.to(block, {
              opacity: i === index ? 1 : DIM_OPACITY,
              duration: dur,
              ease: "power2.out",
              overwrite: true,
            }),
          );
          imageEls.forEach((image, i) =>
            gsap.to(image, {
              opacity: i === index ? 1 : 0,
              duration: dur,
              ease: "power2.out",
              overwrite: true,
            }),
          );
        };
        setActive(0);

        // One trigger per block: it owns "active" for the whole stretch its box
        // straddles the viewport centre. In the gaps between blocks the last
        // one entered stays active.
        const triggers = blockEls.map((block, i) =>
          ScrollTrigger.create({
            trigger: block,
            start: "top center",
            end: "bottom center",
            onEnter: () => setActive(i),
            onEnterBack: () => setActive(i),
          }),
        );

        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: root, dependencies: [blocks.length] },
  );

  return (
    <section
      {...domSrc("EverydayValueSection")}
      className="section-y border-b border-line-emphasis bg-surface-inverse-raised"
    >
      <div ref={root} className="page-container-wide flex flex-col gap-section-gap">
        {/* Header — display headline (left) + supporting copy (bottom-aligned
            right). The copy column is a fixed 440px flush to the right edge, so
            it shares an edge with the scroll section's text column below. */}
        <header className="grid w-full gap-flow desktop:grid-cols-[minmax(0,1fr)_440px] desktop:items-end desktop:gap-x-section-gap">
          <div className="flex flex-col gap-related">
            <p className="type-eyebrow uppercase text-accent-purple">{eyebrow}</p>
            <Heading text={heading} />
          </div>
          <div className="flex flex-col gap-flow">
            <p className="type-body-lg text-on-inverse">{lead}</p>
            <p className="type-body-lg text-on-inverse">{body}</p>
          </div>
        </header>

        {/* Sticky illustration (left) · stepped blocks (right). Each block is
            the height of the image container (a ScrollRow); the image column
            stretches to the full list so the sticky pair has its scroll range.
            The text column is a fixed 440px flush right, matching the header
            copy column above. Left column = 1216 − 184 gap − 440 = 592, the
            design's image-container width. */}
        <div className="relative grid w-full gap-flow desktop:grid-cols-[minmax(0,1fr)_440px] desktop:items-stretch desktop:gap-x-[184px] desktop:py-[5rem]">
          {/* Persistent emphasis stroke — a continuous border between the two
              sides for the full row height, sitting under the gradient. Pinned
              to the image column's right edge (440 text + 184 gap from the
              right). Inset by the 80px block padding. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-[5rem] hidden w-px bg-line-emphasis desktop:block"
            style={{ right: "624px" }}
          />

          {/* Image column (left): sticky, crossfading illustration; the gradient
              stroke rides its right edge, bound to the 436px container and
              overlaying the persistent stroke. */}
          <div className="hidden desktop:block">
            <div className="sticky top-[calc(50vh-218px)] relative h-[436px] w-full">
              {/* Gradient stroke — full container height, on the right edge */}
              <div
                data-ev-divider
                aria-hidden
                className="absolute inset-y-0 right-0 w-[2px]"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, transparent 0%, var(--text-accent-blue) 10%, var(--text-accent-purple) 37%, var(--text-accent-green) 63%, var(--text-accent-yellow) 90%, transparent 100%)",
                }}
              />

              {/* Crossfading illustration, centred in the container */}
              {blocks.map((block, i) => (
                <img
                  key={block.title}
                  data-ev-image
                  src={assetPath(block.image)}
                  alt={block.alt}
                  width={480}
                  height={480}
                  className="absolute inset-0 m-auto size-60 object-contain"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          {/* Text column (right) — aligns with the header copy column */}
          <ol className="flex flex-col gap-flow desktop:gap-0">
            {blocks.map((block) => (
              <li
                key={block.title}
                data-ev-block
                className="flex flex-col gap-related desktop:min-h-[436px] desktop:justify-center"
              >
                {/* Inline illustration — collapsed (mobile) layout only */}
                <img
                  src={assetPath(block.image)}
                  alt={block.alt}
                  width={96}
                  height={96}
                  className="size-20 object-contain desktop:hidden"
                  loading="lazy"
                />
                <h3 className="type-heading-h4 text-on-inverse">{block.title}</h3>
                <p className="type-body-lg text-on-inverse">{block.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* QuoteBlock — moved into this section from its standalone version */}
        {quote && <QuoteBlock quote={quote} />}
      </div>
    </section>
  );
}
