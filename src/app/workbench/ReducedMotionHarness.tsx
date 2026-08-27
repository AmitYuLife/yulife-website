"use client";

import { useState, type ReactNode } from "react";

/**
 * Makes scroll-driven sections render in the workbench.
 *
 * The animated components gate on `prefers-reduced-motion`: under "reduce" they
 * skip the GSAP ScrollTrigger / entrance choreography and set their FINAL,
 * visible state immediately (see useReveal, StatCardFan, EverydayValueSection,
 * Hero, RollingStatNumber). In an isolated frame there is no page scroll to
 * fire those ScrollTriggers, so without this the sections would sit invisible
 * (opacity 0) or show wrong stat values.
 *
 * So we force reduced-motion for the workbench subtree by patching
 * `window.matchMedia` to report `matches: true` for reduced-motion queries only
 * (every other query — breakpoints, hover/pointer — passes through untouched).
 * The patch is installed via a useState initializer so it runs during THIS
 * component's render, before any child's GSAP effects evaluate the query.
 *
 * Trade-off: entrance/scroll-scrubbed animations show their resolved end state
 * rather than playing. That is the most useful thing to see when editing a
 * section, and the only thing that can render truthfully without a scroll rig.
 * Interactive motion (hover card flips, accordion, hover-reveal) still works.
 */
function forceReducedMotion() {
  if (typeof window === "undefined") return;
  const w = window as Window & { __dsReducedMotionPatched?: boolean };
  if (w.__dsReducedMotionPatched) return;
  w.__dsReducedMotionPatched = true;

  const original = window.matchMedia.bind(window);
  window.matchMedia = (query: string): MediaQueryList => {
    if (!/prefers-reduced-motion/i.test(query)) return original(query);
    // Minimal MediaQueryList that always reports "reduce", with no-op listeners
    // (GSAP attaches change listeners it never needs to fire here).
    const noop = () => {};
    return {
      matches: true,
      media: query,
      onchange: null,
      addEventListener: noop,
      removeEventListener: noop,
      addListener: noop,
      removeListener: noop,
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
}

export default function ReducedMotionHarness({ children }: { children: ReactNode }) {
  // Runs during render, before children mount and run their GSAP effects.
  useState(() => {
    forceReducedMotion();
    return null;
  });
  return <>{children}</>;
}
