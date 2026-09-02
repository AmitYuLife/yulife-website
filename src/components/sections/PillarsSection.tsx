"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReveal } from "@/components/hooks/useReveal";
import TabbedPanel, { DEFAULT_ACTIVE_TAB, PILLAR_COLORS } from "@/components/blocks/TabbedPanel";
import YunityDiagram from "@/components/blocks/YunityDiagram";
import { domSrc } from "@/lib/domSrc";
import ConnectingPaths, {
  type ColorPoint,
  type Point,
} from "@/components/ui/ConnectingPaths";

// Yunity band entrance: connecting lines draw in → star lights → dots flow.
const PLATFORM_INTRO =
  "From daily habits to life's hardest moments — every layer of your people's health in one place.";

// Four root-origins pinned to the top edge of the Yunity band — the roots
// descend from this section's own top into the star, so nothing crosses up into
// the platform band above. Values are horizontal fractions of the 1216px band.
const TOP_ROOTS = [0.06, 0.36, 0.64, 0.94] as const;

type Geometry = {
  width: number;
  height: number;
  topPoints: ColorPoint[];
  star: Point | null;
  bottomPoints: Point[];
};

const EMPTY: Geometry = {
  width: 0,
  height: 0,
  topPoints: [],
  star: null,
  bottomPoints: [],
};

/**
 * "One platform, four ways to make an impact" + "The more your people use it,
 * the smarter it gets" — two overlapping bands joined by a live diagram. The
 * connecting lines are measured from the real DOM (box bottoms → star → card
 * tops) so the convergence behind the Yunity star holds at every width.
 */
export default function PillarsSection({
  firstBand = "inverse",
}: {
  /**
   * Background of the first ("one platform") band; the second (Yunity) band
   * always takes the other surface. Defaults to "inverse" (the homepage). Pages
   * that reuse this section elsewhere in a section stack pass whichever value
   * keeps backgrounds alternating with their neighbours — the capability boxes
   * and Yunity card keep their own fixed colour either way.
   */
  firstBand?: "inverse" | "inverse-raised";
} = {}) {
  const revealScope = useReveal<HTMLElement>();
  const secondBand = firstBand === "inverse" ? "inverse-raised" : "inverse";
  const rootRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(DEFAULT_ACTIVE_TAB);
  const [geo, setGeo] = useState<Geometry>(EMPTY);
  // Entrance sequence for the connecting graphic: armed when the star scrolls
  // into view, then the lines draw in and (via onLinesDrawn) the star lights.
  const [armed, setArmed] = useState(false);
  const [starLit, setStarLit] = useState(false);

  const setRefs = useCallback(
    (node: HTMLElement | null) => {
      rootRef.current = node;
      revealScope.current = node;
    },
    [revealScope],
  );

  const measure = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const rb = root.getBoundingClientRect();

    const tops: ColorPoint[] = [];
    let star: Point | null = null;
    const bottoms: Point[] = [];

    root.querySelectorAll<HTMLElement>("[data-pillar-node]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const node = el.dataset.pillarNode;
      const index = Number(el.dataset.pillarIndex ?? 0);
      const cx = r.left - rb.left + r.width / 2;

      if (node === "top") {
        tops[index] = { x: cx, y: r.top - rb.top + r.height / 2, color: PILLAR_COLORS[index % 4] };
      } else if (node === "star") {
        star = { x: cx, y: r.top - rb.top + r.height / 2 };
      } else if (node === "bottom") {
        bottoms[index] = { x: cx, y: r.top - rb.top };
      }
    });

    setGeo({
      width: rb.width,
      height: rb.height,
      topPoints: tops.filter(Boolean),
      star,
      bottomPoints: bottoms.filter(Boolean),
    });

    // Arm the entrance as soon as the Yunity card enters the viewport, so the
    // draw-in → star → flow sequence plays when the section comes into view
    // (not only once the star at the very bottom is reached). Driven from this
    // scroll/resize/rAF-fed loop so it fires reliably.
    const card = root.querySelector("[data-yunity-root]");
    if (card) {
      const cr = card.getBoundingClientRect();
      if (cr.top < window.innerHeight * 0.9 && cr.bottom > 0) setArmed(true);
    }
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Coalesce bursts of measure requests into a single rAF, and re-measure
    // shortly after so scroll-reveal transforms (which lift anchors ~24px as
    // they enter view) settle into their resting positions before we redraw.
    let raf = 0;
    let trailing = 0;
    const scheduleMeasure = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        measure();
      });
      window.clearTimeout(trailing);
      trailing = window.setTimeout(measure, 620);
    };

    measure();

    const ro = new ResizeObserver(scheduleMeasure);
    ro.observe(root);
    window.addEventListener("resize", scheduleMeasure);
    // The reveal animations are scroll-triggered, so re-measure while scrolling
    // to keep the star convergence locked as anchors animate in.
    window.addEventListener("scroll", scheduleMeasure, { passive: true });

    const timers = [120, 700, 1300].map((ms) => window.setTimeout(measure, ms));
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", scheduleMeasure);
      window.removeEventListener("scroll", scheduleMeasure);
      window.cancelAnimationFrame(raf);
      window.clearTimeout(trailing);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [measure, active]);

  return (
    <section {...domSrc("PillarsSection")} ref={setRefs} className="relative isolate" aria-labelledby="platform-heading">
      {/* Live connecting diagram — above the band backgrounds, behind content. */}
      <ConnectingPaths
        width={geo.width}
        height={geo.height}
        topPoints={geo.topPoints}
        star={geo.star}
        bottomPoints={geo.bottomPoints}
        active={armed}
        onLinesDrawn={() => setStarLit(true)}
      />

      {/* Band 1 — capability platform */}
      <div
        className={`relative border-b border-line-emphasis ${
          firstBand === "inverse-raised" ? "bg-surface-inverse-raised" : "bg-surface-inverse"
        }`}
      >
        <div className="page-container py-[var(--layout-section-y)] relative z-10 flex flex-col items-center gap-[var(--layout-section-gap)]">
          <div className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-flow text-center">
            <h2 id="platform-heading" data-reveal className="type-heading-h2 text-on-inverse">
              One platform,
              <br />
              four ways to make an <em className="italic">impact</em>
            </h2>
            <p
              data-reveal
              className="type-body-lg mx-auto max-w-[720px]"
              style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
            >
              {PLATFORM_INTRO}
            </p>
          </div>

          <div data-reveal className="w-full">
            <div className="flex justify-center">
              <TabbedPanel active={active} onActiveChange={setActive} />
            </div>
          </div>
        </div>
      </div>

      {/* Band 2 — Yunity diagram. The roots descend from this band's own top
          edge into the star below the card — never from the platform band above,
          so the two sections stay separate (Figma 2706:4997, YunityRoots). Uses
          the larger section-y-lg vertical padding. */}
      <div
        className={`relative border-b border-line-emphasis ${
          secondBand === "inverse-raised" ? "bg-surface-inverse-raised" : "bg-surface-inverse"
        }`}
      >
        {/* Root-origins pinned to the top edge of the Yunity band. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto w-full max-w-[1216px]"
        >
          {TOP_ROOTS.map((x, i) => (
            <span
              key={i}
              data-pillar-node="top"
              data-pillar-index={i}
              className="absolute top-0 size-0"
              style={{ left: `${x * 100}%` }}
            />
          ))}
        </div>

        <div className="page-container py-[var(--layout-section-y-lg)]">
          <div className="relative z-10">
            <YunityDiagram starLit={starLit} />
          </div>
        </div>
      </div>
    </section>
  );
}
