"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { useReveal } from "@/components/home/useReveal";
import TabbedPanel, { DEFAULT_ACTIVE_TAB, PILLAR_COLORS } from "./TabbedPanel";
import YunityDiagram from "./YunityDiagram";
import ConnectingPaths, {
  type ColorPoint,
  type Point,
} from "./ConnectingPaths";

const PLATFORM_INTRO =
  "From daily habits to life's hardest moments — every layer of your people's health in one place.";

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
export default function PillarsSection() {
  const revealScope = useReveal<HTMLElement>();
  const rootRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(DEFAULT_ACTIVE_TAB);
  const [geo, setGeo] = useState<Geometry>(EMPTY);

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
        tops[index] = { x: cx, y: r.bottom - rb.top, color: PILLAR_COLORS[index % 4] };
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
    <section ref={setRefs} className="relative isolate" aria-labelledby="platform-heading">
      {/* Live connecting diagram — above the band backgrounds, behind content. */}
      <ConnectingPaths
        width={geo.width}
        height={geo.height}
        topPoints={geo.topPoints}
        star={geo.star}
        bottomPoints={geo.bottomPoints}
      />

      {/* Band 1 — capability platform */}
      <div className="relative border-b border-line-emphasis bg-surface-inverse-raised">
        {/* Bottom padding drops to zero at desktop so the capability boxes'
            natural bottom lands on the divider; the grid itself is then pulled
            down half its height to straddle it (see TabbedPanel). */}
        <div className="page-container py-[var(--layout-section-y)] desktop:pb-0 relative z-10 flex flex-col items-center gap-[var(--layout-section-gap)]">
          <div className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-flow text-center">
            <h2 id="platform-heading" data-reveal className="type-heading-h2 text-on-inverse">
              One platform,
              <br />
              four ways to make an impact
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

      {/* Band 2 — Yunity diagram. The roots travel down through it from the
          boxes above to the star. At desktop the capability boxes straddle the
          divider (overflowing ~74px = half their 148px height into this band), so
          the top padding adds that 74px back — making the visible gap above the
          SectionCard match the section-y gap below the outcome cards. */}
      <div className="pointer-events-none relative bg-surface-inverse">
        {/* Padding-top clears the straddling boxes; pointer-events stay off that
            spacer so the lower half of each box remains hoverable. */}
        <div className="page-container py-[var(--layout-section-y)] desktop:pt-[calc(var(--layout-section-y)+74px)]">
          <div className="pointer-events-auto relative z-10">
            <YunityDiagram />
          </div>
        </div>
      </div>
    </section>
  );
}
