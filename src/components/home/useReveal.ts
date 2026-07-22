"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const REVEAL_FROM = { opacity: 0, y: 24 };
const REVEAL_TO = { opacity: 1, y: 0 };
const REVEAL_DURATION = 0.55;
const REVEAL_EASE = "power3.out";
const REVEAL_STAGGER = 0.08;

/**
 * Shared scroll-triggered reveal for the home sections. Fades and lifts any
 * descendant carrying the `data-reveal` attribute, staggered in DOM order.
 *
 * Use `data-reveal-anchor` + `data-reveal-on="<name>"` for a second trigger
 * inside the section (e.g. a carousel that should animate when it enters
 * view, not when the section header does).
 *
 * Honours reduced-motion by showing everything immediately.
 */
export function useReveal<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;

      const defaultItems = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll("[data-reveal]"),
      );

      const anchorNames = [
        ...new Set(
          gsap.utils
            .toArray<HTMLElement>(root.querySelectorAll("[data-reveal-anchor]"))
            .map((el) => el.dataset.revealAnchor)
            .filter(Boolean),
        ),
      ] as string[];

      const anchoredGroups = anchorNames
        .map((name) => ({
          name,
          anchor: root.querySelector<HTMLElement>(
            `[data-reveal-anchor="${name}"]`,
          ),
          items: gsap.utils.toArray<HTMLElement>(
            root.querySelectorAll(`[data-reveal-on="${name}"]`),
          ),
        }))
        .filter(
          (group): group is typeof group & { anchor: HTMLElement } =>
            Boolean(group.anchor && group.items.length),
        );

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (defaultItems.length) {
          gsap.set(defaultItems, REVEAL_FROM);
          gsap.to(defaultItems, {
            ...REVEAL_TO,
            duration: REVEAL_DURATION,
            ease: REVEAL_EASE,
            stagger: REVEAL_STAGGER,
            scrollTrigger: {
              trigger: root,
              start: "top 78%",
              once: true,
            },
          });
        }

        for (const { anchor, items } of anchoredGroups) {
          gsap.set(items, REVEAL_FROM);
          gsap.to(items, {
            ...REVEAL_TO,
            duration: REVEAL_DURATION,
            ease: REVEAL_EASE,
            stagger: REVEAL_STAGGER,
            scrollTrigger: {
              trigger: anchor,
              start: "top 90%",
              once: true,
            },
          });
        }
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([...defaultItems, ...anchoredGroups.flatMap((g) => g.items)], {
          ...REVEAL_TO,
        });
      });
    },
    { scope },
  );

  return scope;
}
