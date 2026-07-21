"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Shared scroll-triggered reveal for the home sections. Fades and lifts any
 * descendant carrying the `data-reveal` attribute, staggered in DOM order.
 * Honours reduced-motion by showing everything immediately.
 */
export function useReveal<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (!items.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(items, { opacity: 0, y: 24 });
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: scope.current,
            start: "top 78%",
            once: true,
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(items, { opacity: 1, y: 0 });
      });
    },
    { scope },
  );

  return scope;
}
