/**
 * Shared clock for the pillars signal flow: the dots travelling into the
 * Yunity star derive from these constants and `performance.now()`, so their
 * cadence is drift-free.
 *
 * With four dots (one per top line) the launch stagger and travel time are
 * tuned so the four are evenly spaced around the cycle — DURATION = DOTS ×
 * STAGGER — which makes a dot reach the star exactly every STAGGER seconds
 * with no pause between the last arrival and the next.
 */

export const FLOW_DURATION = 2.0; // seconds for a dot to travel box → star
export const FLOW_STAGGER = 0.5; // launch offset between the four dots → one arrival every 0.5s
export const FLOW_DOTS = 4; // one dot per top line

// cubic-bezier(0.45, 0, 0.25, 1) — the same easing the dots have always used.
const X1 = 0.45;
const Y1 = 0;
const X2 = 0.25;
const Y2 = 1;

function sampleX(t: number) {
  const mt = 1 - t;
  return 3 * mt * mt * t * X1 + 3 * mt * t * t * X2 + t * t * t;
}

function sampleY(t: number) {
  const mt = 1 - t;
  return 3 * mt * mt * t * Y1 + 3 * mt * t * t * Y2 + t * t * t;
}

/** Timing-function solve: progress x (0..1) → eased value, via bisection. */
export function flowEase(x: number) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 24; i++) {
    const cx = sampleX(t);
    if (Math.abs(cx - x) < 1e-4) break;
    if (cx < x) lo = t;
    else hi = t;
    t = (lo + hi) / 2;
  }
  return sampleY(t);
}

const cyclePhase = (nowSec: number, i: number) =>
  (((nowSec - i * FLOW_STAGGER) % FLOW_DURATION) + FLOW_DURATION) % FLOW_DURATION;

/**
 * Dot i's state at an absolute clock time: eased path position u (0 = box,
 * 1 = star) and opacity (fade in over the first 10%, out over the last 28% —
 * the ramp the SMIL version used).
 */
export function dotState(nowSec: number, i: number) {
  const p = cyclePhase(nowSec, i) / FLOW_DURATION;
  const u = flowEase(p);
  const opacity = p < 0.1 ? p / 0.1 : p < 0.72 ? 1 : 1 - (p - 0.72) / 0.28;
  return { u, opacity };
}
