"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReveal } from "@/components/hooks/useReveal";
import YunityDiagram from "@/components/blocks/YunityDiagram";
import ConnectingPaths, {
  type ColorPoint,
  type Point,
} from "@/components/ui/ConnectingPaths";
import { domSrc } from "@/lib/domSrc";
import type { YunitySection as YunityData } from "@/data/pages/types";

// Brand accents for the descending root-lines — matches PILLAR_COLORS in the
// homepage TabbedPanel; kept local so this section doesn't pull in the
// capability-tabs module. The roots originate at the three stat cards, so only
// the first three are used.
const ROOT_COLORS = [
  "var(--green-600)",
  "var(--blue-600)",
  "var(--yellow-600)",
  "var(--purple-600)",
] as const;

type Geometry = {
  width: number;
  height: number;
  topPoints: ColorPoint[];
  star: Point | null;
  bottomPoints: Point[];
};

const EMPTY: Geometry = { width: 0, height: 0, topPoints: [], star: null, bottomPoints: [] };

/**
 * Standalone Yunity section (Figma 1731:2441). The same Yunity block as the
 * homepage — the framed card with the wordmark lockup, heading, body and the
 * three Sense/Interpret/Guide stat cards, with the live star beneath it — but
 * self-contained: in place of the homepage's capability boxes, four decorative
 * root-points at the top edge feed the animated connecting roots down into the
 * star. Copy is passed in, so pages can reuse it with their own wording.
 */
export default function YunitySection({ data }: { data: YunityData }) {
  const revealScope = useReveal<HTMLElement>();
  const rootRef = useRef<HTMLElement | null>(null);
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
    // The stat cards are the top anchors; arm the entrance once they scroll into
    // view (not the heading above them).
    let cardsInView = false;

    root.querySelectorAll<HTMLElement>("[data-pillar-node]").forEach((el) => {
      const r = el.getBoundingClientRect();
      const node = el.dataset.pillarNode;
      const index = Number(el.dataset.pillarIndex ?? 0);
      const cx = r.left - rb.left + r.width / 2;

      if (node === "top") {
        tops[index] = {
          x: cx,
          y: r.bottom - rb.top,
          color: ROOT_COLORS[index % ROOT_COLORS.length],
        };
        if (r.top < window.innerHeight * 0.85 && r.bottom > 0) cardsInView = true;
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

    // Arm the entrance once the 1/2/3 stat cards scroll into view, so the roots
    // draw in and the star rises into place right as they're reached.
    if (cardsInView) setArmed(true);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Coalesce measure requests into a single rAF, then re-measure once the
    // scroll-reveal transforms (which lift anchors ~24px as they enter view)
    // settle, so the star convergence locks onto the resting positions.
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
  }, [measure]);

  return (
    <section
      {...domSrc("YunitySection")}
      ref={setRefs}
      className="relative isolate overflow-hidden border-b border-line-emphasis bg-surface-inverse-raised"
      aria-labelledby="yunity-section-heading"
    >
      {/* Live connecting diagram — above the band background, behind content. */}
      <ConnectingPaths
        width={geo.width}
        height={geo.height}
        topPoints={geo.topPoints}
        star={geo.star}
        bottomPoints={geo.bottomPoints}
        active={armed}
        onLinesDrawn={() => setStarLit(true)}
      />

      <div className="page-container relative z-10 flex flex-col items-center gap-[var(--layout-section-gap)] py-[var(--layout-section-y)]">
        <YunityDiagram content={data} headingId="yunity-section-heading" starLit={starLit} />
      </div>
    </section>
  );
}
