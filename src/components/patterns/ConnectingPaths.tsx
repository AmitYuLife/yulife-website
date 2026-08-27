"use client";

import { useEffect, useRef, useState } from "react";
import { dotState, flowEase } from "./flowTiming";

const WAVE_DURATION = 2.2; // seconds for one pulse to travel star → card
const WAVE_STAGGER = 0.4; // launch offset between the three bottom lines

export type Point = { x: number; y: number };
export type ColorPoint = Point & { color: string };

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
 * The neural "roots" overlay. Signal lines rise from the four capability boxes,
 * converge exactly at the Yunity star, then fan back out to the three outcome
 * cards. Coordinates are supplied in the wrapper's pixel space (measured from
 * the live DOM), so the geometry — including the convergence point behind the
 * star — stays locked at every viewport width. Below the tablet/desktop grid,
 * the capability boxes and outcome cards stack in a single column, so every
 * anchor shares one horizontal centre and the same bezier formula degenerates
 * into a plain straight line — no separate mobile layout needed.
 *
 * Each line carries the brand gradient, and a coloured dot continuously travels
 * down each top line into the star (a flowing-signal effect). Dots are driven
 * in JS from the shared flow clock (flowTiming.ts) — the same clock the star's
 * pulse reads — so each arrival lands exactly on a pulse beat. The bottom
 * lines carry the same idea outward: a bright band slides up each gradient
 * from the card to the star, fading in and out so the loop hides its own seam.
 */
export default function ConnectingPaths({
  width,
  height,
  topPoints,
  star,
  bottomPoints,
}: {
  width: number;
  height: number;
  topPoints: ColorPoint[];
  star: Point | null;
  bottomPoints: Point[];
}) {
  const reduced = usePrefersReducedMotion();
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const bottomWaveRefs = useRef<(SVGStopElement | null)[]>([]);

  // Latest geometry for the rAF loop, without re-subscribing it every measure.
  const geom = useRef<{ tops: ColorPoint[]; star: Point | null; bottomCount: number }>({
    tops: [],
    star: null,
    bottomCount: 0,
  });
  geom.current = { tops: topPoints, star, bottomCount: bottomPoints.length };

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const tick = () => {
      const { tops, star: s, bottomCount } = geom.current;
      const now = performance.now() / 1000;
      if (s) {
        tops.forEach((p, i) => {
          const g = dotRefs.current[i];
          if (!g) return;
          const { u, opacity } = dotState(now, i);
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

      // Bottom lines: slide the gradient's bright band from each card back up
      // toward the star, looping. Fading in/out at the ends hides the seam.
      for (let i = 0; i < bottomCount; i++) {
        const stop = bottomWaveRefs.current[i];
        if (!stop) continue;
        const phase = (((now - i * WAVE_STAGGER) % WAVE_DURATION) + WAVE_DURATION) % WAVE_DURATION;
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
            brighter band that slides along (animated per-frame below; the
            reduced-motion fallback below leaves it parked at its base 0.5). */}
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

      {/* Capability boxes → star */}
      {topPoints.map((p, i) => (
        <path key={`t${i}`} d={toStar(p)} stroke={`url(#pillars-grad-top-${i})`} strokeWidth={1.5} fill="none" />
      ))}

      {/* Signal dots — travel down each top line into the star, positioned
          every frame from the shared flow clock. */}
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
