"use client";

import { useEffect, useRef, type RefObject } from "react";
import type gsap from "gsap";

export type LoopRegistry = {
  /** Tweens/timelines that should stop while the screen is offscreen. */
  loops: gsap.core.Animation[];
  /** True while offscreen — spawners must not start new work. */
  pausedRef: { current: boolean };
};

/**
 * Pauses a registry of infinite GSAP animations while the screen is out of
 * view and resumes them when it returns. IntersectionObserver rather than
 * ScrollTrigger on purpose: the workbench scrolls an inner container inside a
 * fixed overlay (where window-scroller triggers misfire), and IO keeps working
 * unchanged when a screen is later embedded in a page hero.
 */
export default function useLoopPause(ref: RefObject<Element | null>): LoopRegistry {
  const registry = useRef<LoopRegistry>({ loops: [], pausedRef: { current: false } });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const { loops, pausedRef } = registry.current;
    const observer = new IntersectionObserver(([entry]) => {
      pausedRef.current = !entry.isIntersecting;
      for (const loop of loops) {
        if (entry.isIntersecting) loop.resume();
        else loop.pause();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return registry.current;
}
