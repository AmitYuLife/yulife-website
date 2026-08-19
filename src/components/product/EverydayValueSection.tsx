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

/** The page carrier's logo, shown at the foot of the quote block. */
export type CarrierLogo = { src: string; alt: string };

/** Matches the `desktop` breakpoint (1280px) — the sticky interaction only runs above it. */
const DESKTOP_QUERY = "(min-width: 1280px)";
const DIM_OPACITY = 0.35;

/** Distance from the section's content right edge to the divider line (px). */
const RAIL_RIGHT = 624;
/** Top inset of the rail — matches the scroll grid's 5rem top padding. */
const RAIL_TOP = 80;

/**
 * Builds a rounded-rectangle path that *starts at the line junction* on the top
 * edge and runs clockwise all the way round back to it. Starting the path at the
 * junction means a stroke-dash comet at offset 0 begins exactly where the
 * straight rail meets the quote block, so the light reads as continuing off the
 * line and around the border.
 */
function roundedBorderPath(
  w: number,
  h: number,
  r: number,
  inset: number,
  junctionX: number,
): string {
  const l = inset;
  const rt = w - inset;
  const t = inset;
  const b = h - inset;
  return [
    `M ${junctionX} ${t}`,
    `L ${rt - r} ${t}`,
    `A ${r} ${r} 0 0 1 ${rt} ${t + r}`,
    `L ${rt} ${b - r}`,
    `A ${r} ${r} 0 0 1 ${rt - r} ${b}`,
    `L ${l + r} ${b}`,
    `A ${r} ${r} 0 0 1 ${l} ${b - r}`,
    `L ${l} ${t + r}`,
    `A ${r} ${r} 0 0 1 ${l + r} ${t}`,
    `L ${junctionX} ${t} Z`,
  ].join(" ");
}

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
 *
 * The emphasis rail runs down to this block's top border and, on desktop, a
 * gradient comet laps the border clockwise when the scroll reaches it — drawn by
 * the overlaid SVG path (see the section's useGSAP). The path's geometry is set
 * at runtime from the block's measured box.
 */
function QuoteBlock({
  quote,
  carrierLogo,
}: {
  quote: Quote;
  carrierLogo?: CarrierLogo;
}) {
  return (
    <figure
      data-ev-quote
      className="relative flex w-full flex-col gap-flow rounded-[var(--radius-md)] border border-line-emphasis p-[var(--gap-group)]"
    >
      {/* Gradient border trace — desktop-only flourish, kept invisible until the
          rail's head arrives (opacity driven by GSAP). preserveAspectRatio is
          "none" because the viewBox is set to the block's exact pixel box. */}
      <svg
        data-ev-quote-svg
        aria-hidden
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 hidden size-full overflow-visible desktop:block"
      >
        <defs>
          <linearGradient id="ev-quote-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--text-accent-blue)" />
            <stop offset="37%" stopColor="var(--text-accent-purple)" />
            <stop offset="63%" stopColor="var(--text-accent-green)" />
            <stop offset="100%" stopColor="var(--text-accent-yellow)" />
          </linearGradient>
        </defs>
        <path
          data-ev-quote-path
          fill="none"
          stroke="url(#ev-quote-gradient)"
          strokeWidth={1}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="22 78"
          style={{ opacity: 0 }}
        />
      </svg>

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
          <span className="type-body-lg text-on-inverse">{quote.role}</span>
        </div>
        {carrierLogo && (
          <img
            src={assetPath(carrierLogo.src)}
            alt={carrierLogo.alt}
            className="ml-auto h-[32px] w-auto shrink-0"
          />
        )}
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
 * The divider between the two sides is a continuous emphasis rail: a faint line
 * running the full height from the first block down to the quote block's top
 * border, with a brand-gradient comet that rides down it as you scroll. When the
 * comet reaches the quote block it laps the border clockwise once and fades,
 * then settles back at the foot of the straight line so scrolling back up
 * reverses cleanly. The lap is a self-contained, time-based timeline, so a fast
 * fling still plays a complete loop rather than stalling mid-border.
 *
 * Below `desktop` the two columns collapse: the rail and sticky image drop, and
 * each block shows its illustration inline as a plain stacked list.
 */
export default function EverydayValueSection({
  data,
  quote,
  carrierLogo,
}: {
  data: EverydayValueData;
  quote?: Quote;
  carrierLogo?: CarrierLogo;
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
        // position-, not time-, driven) but the swaps are instant and the
        // border-lap flourish is skipped.
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const dur = reduce ? 0 : 0.4;

        let active = -1;
        let flipTl: gsap.core.Timeline | null = null;
        const setActive = (index: number) => {
          if (index === active) return;
          const prev = active;
          active = index;

          blockEls.forEach((block, i) =>
            gsap.to(block, {
              opacity: i === index ? 1 : DIM_OPACITY,
              duration: dur,
              ease: "power2.out",
              overwrite: true,
            }),
          );

          // First paint (and reduced motion): swap instantly, no flip.
          if (prev < 0 || reduce) {
            flipTl?.kill();
            imageEls.forEach((image, i) =>
              gsap.set(image, { opacity: i === index ? 1 : 0, rotateY: 0 }),
            );
            return;
          }

          // Card flip: the active illustration turns edge-on (0 → 90°) while the
          // next turns in behind it (−90° → 0), both rotating the same way so it
          // reads as one continuous flip. Direction follows scroll — flipping
          // forward on the way down, reversing on the way back up.
          const dir = index > prev ? 1 : -1;
          const outgoing = imageEls[prev];
          const incoming = imageEls[index];
          const half = dur * 0.45;

          flipTl?.kill();
          imageEls.forEach((image, i) => {
            if (i !== prev && i !== index) gsap.set(image, { opacity: 0, rotateY: 0 });
          });
          flipTl = gsap
            .timeline()
            .set(incoming, { rotateY: -90 * dir, opacity: 1 }, 0)
            .set(outgoing, { opacity: 1 }, 0)
            .to(outgoing, { rotateY: 90 * dir, duration: half, ease: "power2.in" }, 0)
            .set(outgoing, { opacity: 0, rotateY: 0 }, half)
            .to(incoming, { rotateY: 0, duration: half, ease: "power2.out" }, half);
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

        // ── Emphasis rail ───────────────────────────────────────────────────
        const railWrap = el.querySelector<HTMLElement>("[data-ev-railwrap]");
        const rail = el.querySelector<HTMLElement>("[data-ev-rail]");
        const head = el.querySelector<HTMLElement>("[data-ev-head]");
        const quoteEl = el.querySelector<HTMLElement>("[data-ev-quote]");
        const svg = el.querySelector<SVGSVGElement>("[data-ev-quote-svg]");
        const path = el.querySelector<SVGPathElement>("[data-ev-quote-path]");

        const railTriggers: ScrollTrigger[] = [];
        let lapTl: gsap.core.Timeline | null = null;
        let headTravel = 0;

        // Height the rail + comet geometry from live measurements, and re-run on
        // every ScrollTrigger refresh so it survives resizes and font swaps.
        const measure = () => {
          if (!rail || !quoteEl) return;
          const railH = Math.max(0, quoteEl.offsetTop - RAIL_TOP);
          rail.style.height = `${railH}px`;
          if (head) headTravel = Math.max(0, railH - head.offsetHeight);

          if (svg && path) {
            const w = quoteEl.offsetWidth;
            const h = quoteEl.offsetHeight;
            const inset = 1;
            const cssRadius = parseFloat(
              getComputedStyle(quoteEl).borderTopLeftRadius,
            );
            const r = Math.min(
              Number.isFinite(cssRadius) ? cssRadius : 16,
              (w - 2 * inset) / 2,
              (h - 2 * inset) / 2,
            );
            // Where the straight rail meets the block's top edge.
            const junctionX = Math.min(Math.max(w - RAIL_RIGHT, r), w - r);
            svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
            path.setAttribute("d", roundedBorderPath(w, h, r, inset, junctionX));
          }
        };

        if (railWrap && rail && head && quoteEl) {
          measure();
          ScrollTrigger.addEventListener("refresh", measure);

          // Travelling gradient comet — scrubbed down the rail so its leading
          // edge lands at the junction as the quote block enters.
          railTriggers.push(
            ScrollTrigger.create({
              trigger: railWrap,
              start: "top 60%",
              endTrigger: quoteEl,
              end: "top 62%",
              scrub: true,
              onUpdate: (self) =>
                gsap.set(head, { y: self.progress * headTravel }),
            }),
          );

          // One clockwise lap of the border, then fade. Time-based (not scrubbed)
          // so a fast fling always completes a clean loop instead of freezing
          // partway round.
          if (!reduce && path) {
            gsap.set(path, { opacity: 0, strokeDashoffset: 0 });
            lapTl = gsap
              .timeline({ paused: true })
              .to(path, { opacity: 1, duration: 0.12, ease: "power1.out" }, 0)
              .to(
                path,
                { strokeDashoffset: -100, duration: 0.9, ease: "power2.inOut" },
                0,
              )
              .to(path, { opacity: 0, duration: 0.28, ease: "power1.in" }, 0.74);

            railTriggers.push(
              ScrollTrigger.create({
                trigger: quoteEl,
                start: "top 62%",
                onEnter: () => lapTl?.restart(),
              }),
            );
          }
        }

        return () => {
          triggers.forEach((t) => t.kill());
          railTriggers.forEach((t) => t.kill());
          lapTl?.kill();
          ScrollTrigger.removeEventListener("refresh", measure);
        };
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

        {/* Rail wrapper — spans the scroll feature and the quote block so the
            continuous emphasis line and its comet can run from the first block
            all the way down to the quote block's top border. */}
        <div data-ev-railwrap className="relative flex flex-col gap-section-gap">
          {/* Persistent emphasis line — faint, full length. Height is set at
              runtime to reach the quote block's top edge. Inset 5rem at the top
              to line up with the first block. */}
          <span
            data-ev-rail
            aria-hidden
            className="pointer-events-none absolute top-[5rem] hidden w-px bg-line-emphasis desktop:block"
            style={{ right: `${RAIL_RIGHT}px` }}
          />
          {/* Gradient comet — rides down the rail; GSAP drives its translateY. */}
          <span
            data-ev-head
            aria-hidden
            className="pointer-events-none absolute top-[5rem] hidden h-[340px] w-px desktop:block"
            style={{
              right: `${RAIL_RIGHT}px`,
              backgroundImage:
                "linear-gradient(180deg, transparent 0%, var(--text-accent-blue) 12%, var(--text-accent-purple) 40%, var(--text-accent-green) 62%, var(--text-accent-yellow) 88%, transparent 100%)",
            }}
          />

          {/* Sticky illustration (left) · stepped blocks (right). Each block is
              the height of the image container (a ScrollRow); the image column
              stretches to the full list so the sticky pair has its scroll range.
              The text column is a fixed 440px flush right, matching the header
              copy column above. Left column = 1216 − 184 gap − 440 = 592, the
              design's image-container width. */}
          <div className="relative grid w-full gap-flow desktop:grid-cols-[minmax(0,1fr)_440px] desktop:items-stretch desktop:gap-x-[184px] desktop:py-[5rem]">
            {/* Image column (left): sticky, crossfading illustration. */}
            <div className="hidden desktop:block">
              <div className="sticky top-[calc(50vh-218px)] relative h-[436px] w-full [perspective:1000px]">
                {/* Crossfading illustration, centred in the container */}
                {blocks.map((block, i) => (
                  <img
                    key={block.title}
                    data-ev-image
                    src={assetPath(block.image)}
                    alt={block.alt}
                    width={480}
                    height={480}
                    className="absolute inset-0 m-auto size-60 object-contain [backface-visibility:hidden]"
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
          {quote && <QuoteBlock quote={quote} carrierLogo={carrierLogo} />}
        </div>
      </div>
    </section>
  );
}
