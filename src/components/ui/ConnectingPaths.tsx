"use client";

import { useEffect, useRef, useState } from "react";
import { dotState, flowEase } from "@/lib/flowTiming";

const WAVE_DURATION = 2.2; // seconds for one pulse to travel star → card
const WAVE_STAGGER = 0.4; // launch offset between the three bottom lines

// Entrance sequence: the lines draw in, then the star is lit (via onLinesDrawn),
// then — after a short beat so the star reads first — the signal dots start.
const DRAW_DURATION = 1.1; // seconds for a line to draw from origin to star
const DRAW_STAGGER = 0.14; // launch offset between the descending lines
const FLOW_DELAY = 0.5; // gap between lines-drawn and dots starting to flow

export type Point = { x: number; y: number };
export type ColorPoint = Point & { color: string };

// Draw-in easing — a soft ease-out so each line arrives gently at the star.
const drawEase = (p: number) => 1 - Math.pow(1 - p, 3);

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/**
 * The neural "roots" overlay. Signal lines descend from the capability/root
 * origins and converge exactly on the Yunity star. Coordinates are supplied in
 * the wrapper's pixel space (measured from the live DOM), so the geometry — the
 * convergence point behind the star included — stays locked at every viewport
 * width. Below the tablet/desktop grid the origins stack into a single column,
 * so every anchor shares one horizontal centre and the same bezier degenerates
 * into a plain straight line — no separate mobile layout needed.
 *
 * Entrance is orchestrated: when `active` turns true the lines draw in
 * (animated stroke, staggered); once drawn we call `onLinesDrawn` (the parent
 * lights the star) and, after a short beat, the coloured signal dots begin
 * travelling down each line into the star — driven in JS from the shared flow
 * clock (flowTiming.ts), re-based so they launch from the origins. Honours
 * reduced motion by drawing everything immediately and parking the dots.
 */
export default function ConnectingPaths({
  width,
  height,
  topPoints,
  star,
  bottomPoints,
  active = true,
  onLinesDrawn,
}: {
  width: number;
  height: number;
  topPoints: ColorPoint[];
  star: Point | null;
  bottomPoints: Point[];
  /** When true, play the draw-in → star → flow entrance. */
  active?: boolean;
  /** Fired once, the moment the lines have finished drawing in. */
  onLinesDrawn?: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const topPathRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const bottomWaveRefs = useRef<(SVGStopElement | null)[]>([]);

  // Latest geometry for the rAF loop, without re-subscribing it every measure.
  const geom = useRef<{ tops: ColorPoint[]; star: Point | null; bottomCount: number }>({
    tops: [],
    star: null,
    bottomCount: 0,
  });
  geom.current = { tops: topPoints, star, bottomCount: bottomPoints.length };

  // Entrance state, held in refs so the single rAF loop can read it without
  // re-subscribing. phase: 'hidden' → 'drawing' → 'shown'.
  const activeRef = useRef(active);
  activeRef.current = active;
  const reducedRef = useRef(reduced);
  reducedRef.current = reduced;
  const onDrawnRef = useRef(onLinesDrawn);
  onDrawnRef.current = onLinesDrawn;

  const phaseRef = useRef<"hidden" | "drawing" | "shown">("hidden");
  const drawStartRef = useRef(0);
  const flowStartRef = useRef(0);
  const drawnFiredRef = useRef(false);

  useEffect(() => {
    // Reduced motion: no loop — everything is drawn and parked in the render.
    if (reduced) {
      phaseRef.current = "shown";
      return;
    }

    let raf = 0;
    const tick = () => {
      const { tops, star: s, bottomCount } = geom.current;
      const paths = topPathRefs.current;
      const now = performance.now() / 1000;

      // Kick the draw once we're active and the geometry is ready.
      if (phaseRef.current === "hidden" && activeRef.current && s && tops.length) {
        phaseRef.current = "drawing";
        drawStartRef.current = now;
      }

      if (phaseRef.current === "hidden") {
        // Keep every line hidden until the draw begins (re-applied each frame so
        // a resize before activation can't reveal a partial stroke).
        tops.forEach((_, i) => {
          const path = paths[i];
          if (!path) return;
          const len = path.getTotalLength();
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len);
        });
      } else if (phaseRef.current === "drawing") {
        let allDone = true;
        tops.forEach((_, i) => {
          const path = paths[i];
          if (!path) return;
          const len = path.getTotalLength();
          const raw = (now - drawStartRef.current - i * DRAW_STAGGER) / DRAW_DURATION;
          const p = Math.max(0, Math.min(1, raw));
          if (p < 1) allDone = false;
          path.style.strokeDasharray = String(len);
          path.style.strokeDashoffset = String(len * (1 - drawEase(p)));
        });
        if (allDone) {
          phaseRef.current = "shown";
          flowStartRef.current = now + FLOW_DELAY;
          // Clear the dash so later re-measures render a clean, full line.
          paths.forEach((path) => {
            if (!path) return;
            path.style.strokeDasharray = "";
            path.style.strokeDashoffset = "";
          });
          if (!drawnFiredRef.current) {
            drawnFiredRef.current = true;
            onDrawnRef.current?.();
          }
        }
      }

      // Signal dots — only after the star has been lit (flowStart), re-based so
      // dot 0 launches from its origin the instant the flow begins.
      const flowing = phaseRef.current === "shown" && now >= flowStartRef.current;
      if (s) {
        tops.forEach((p, i) => {
          const g = dotRefs.current[i];
          if (!g) return;
          if (!flowing) {
            g.setAttribute("opacity", "0");
            return;
          }
          const { u, opacity } = dotState(now - flowStartRef.current, i);
          // Point on the same cubic the line is drawn with.
          const k = (s.y - p.y) * 0.5;
          const mu = 1 - u;
          const x =
            mu * mu * mu * p.x + 3 * mu * mu * u * p.x + 3 * mu * u * u * s.x + u * u * u * s.x;
          const y =
            mu * mu * mu * p.y +
            3 * mu * mu * u * (p.y + k) +
            3 * mu * u * u * (s.y - k) +
            u * u * u * s.y;
          g.setAttribute("transform", `translate(${x} ${y})`);
          g.setAttribute("opacity", String(Math.max(0, Math.min(1, opacity))));
        });
      }

      // Bottom lines (if any): slide the gradient's bright band from each card
      // back up toward the star, looping. Only once the flow has started.
      for (let i = 0; i < bottomCount; i++) {
        const stop = bottomWaveRefs.current[i];
        if (!stop) continue;
        if (!flowing) {
          stop.setAttribute("stop-opacity", "0");
          continue;
        }
        const t = now - flowStartRef.current;
        const phase = (((t - i * WAVE_STAGGER) % WAVE_DURATION) + WAVE_DURATION) % WAVE_DURATION;
        const p = phase / WAVE_DURATION;
        const eased = flowEase(p);
        const offset = 0.95 - eased * 0.9;
        const fade = p < 0.08 ? p / 0.08 : p > 0.85 ? Math.max(0, (1 - p) / 0.15) : 1;
        stop.setAttribute("offset", String(offset));
        stop.setAttribute("stop-opacity", String(0.6 * fade));
      }

      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduced]);

  if (!width || !height || !star) return null;

  // Cubic bezier with vertical tangents at both ends, so every line eases
  // straight down into (and straight out of) the star.
  const toStar = (p: Point) => {
    const k = (star.y - p.y) * 0.5;
    return `M ${p.x} ${p.y} C ${p.x} ${p.y + k}, ${star.x} ${star.y - k}, ${star.x} ${star.y}`;
  };
  const fromStar = (p: Point) => {
    const k = (p.y - star.y) * 0.5;
    return `M ${star.x} ${star.y} C ${star.x} ${star.y + k}, ${p.x} ${p.y - k}, ${p.x} ${p.y}`;
  };

  return (
    <svg
      className="pointer-events-none absolute inset-0 z-[1] block h-full w-full"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        {/* Top lines: the accent colour, fading into the convergence. */}
        {topPoints.map((p, i) => (
          <linearGradient
            key={`gt${i}`}
            id={`pillars-grad-top-${i}`}
            gradientUnits="userSpaceOnUse"
            x1={p.x}
            y1={p.y}
            x2={star.x}
            y2={star.y}
          >
            <stop offset="0" stopColor={p.color} stopOpacity="0.9" />
            <stop offset="1" stopColor={p.color} stopOpacity="0.55" />
          </linearGradient>
        ))}
        {/* Bottom lines: warm gold at the star → green at the cards, with a
            brighter band that slides along (animated per-frame above). */}
        {bottomPoints.map((p, i) => (
          <linearGradient
            key={`gb${i}`}
            id={`pillars-grad-bot-${i}`}
            gradientUnits="userSpaceOnUse"
            x1={star.x}
            y1={star.y}
            x2={p.x}
            y2={p.y}
          >
            <stop offset="0" stopColor="var(--yellow-600)" stopOpacity="0.15" />
            <stop
              ref={(el) => {
                bottomWaveRefs.current[i] = el;
              }}
              offset="0.5"
              stopColor="var(--yellow-600)"
              stopOpacity={reduced ? "0.55" : "0"}
            />
            <stop offset="1" stopColor="var(--green-600)" stopOpacity="0.65" />
          </linearGradient>
        ))}
      </defs>

      {/* Star → outcome cards */}
      {bottomPoints.map((p, i) => (
        <path key={`b${i}`} d={fromStar(p)} stroke={`url(#pillars-grad-bot-${i})`} strokeWidth={1.5} fill="none" />
      ))}

      {/* Capability boxes → star. Hidden until the draw-in begins (unless
          reduced motion, where they render full immediately). */}
      {topPoints.map((p, i) => (
        <path
          key={`t${i}`}
          ref={(el) => {
            topPathRefs.current[i] = el;
            // Pin the line hidden on first paint so the draw-in never flashes.
            if (el && !reducedRef.current && phaseRef.current !== "shown") {
              const len = el.getTotalLength();
              el.style.strokeDasharray = String(len);
              el.style.strokeDashoffset = String(len);
            }
          }}
          d={toStar(p)}
          stroke={`url(#pillars-grad-top-${i})`}
          strokeWidth={1.5}
          fill="none"
        />
      ))}

      {/* Signal dots — travel down each top line into the star, positioned
          every frame from the shared flow clock (once the flow has begun). */}
      {topPoints.map((p, i) => {
        if (reduced) {
          return (
            <g key={`d${i}`}>
              <circle cx={p.x} cy={p.y} r={11} fill={p.color} opacity={0.18} />
              <circle cx={p.x} cy={p.y} r={5.5} fill={p.color} />
            </g>
          );
        }
        return (
          <g
            key={`d${i}`}
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            opacity={0}
          >
            <circle r={11} fill={p.color} opacity={0.18} />
            <circle r={5.5} fill={p.color} />
          </g>
        );
      })}
    </svg>
  );
}
