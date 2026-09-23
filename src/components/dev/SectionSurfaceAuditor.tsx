"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Dev-only guard that the dark product pages keep alternating backgrounds. It
 * reads the *computed* background of each top-level `<main>` section, so it
 * catches every case — a `surface` prop, a hardcoded class, or an inline style —
 * and warns in the console when:
 *
 *   1. two adjacent sections share the same dark surface (a broken band), or
 *   2. a card/panel stamped with its own `data-surface` matches the surface of
 *      the section it sits in, so it renders with no contrast.
 *
 * It's the live companion to the build-time
 * `scripts/check-section-alternation.mjs`, which enforces the same two rules
 * from the `data-surface` stamps in CI; this one gives instant feedback while
 * building a page. It never runs in production (the effect body is dead-code-
 * eliminated) and renders nothing.
 */
export default function SectionSurfaceAuditor() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    // A tick out, so section backgrounds and card borders have painted. A timer
    // (not requestAnimationFrame) so the audit still runs when the tab/preview
    // is backgrounded — rAF is throttled to a standstill there.
    const id = window.setTimeout(() => audit(pathname), 200);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

/** Resolve a utility class to a canonical computed colour string. */
function probeBg(className: string): string {
  const el = document.createElement("div");
  el.className = className;
  el.style.cssText =
    "position:absolute;left:-9999px;top:-9999px;visibility:hidden;pointer-events:none";
  document.body.appendChild(el);
  const value = getComputedStyle(el).backgroundColor;
  el.remove();
  return value;
}

const label = (el: Element, fallback: string) =>
  (el as HTMLElement).dataset?.src ||
  el.getAttribute("aria-label") ||
  el.querySelector("h1, h2, h3")?.textContent?.trim().slice(0, 40) ||
  fallback;

function audit(pathname: string) {
  const main = document.querySelector("main");
  if (!main) return;

  const inverse = probeBg("bg-surface-inverse");
  const raised = probeBg("bg-surface-inverse-raised");
  const classify = (c: string): "inverse" | "raised" | null =>
    c === inverse ? "inverse" : c === raised ? "raised" : null;

  const sections = Array.from(main.children).filter(
    (el): el is HTMLElement => el instanceof HTMLElement && el.offsetParent !== null,
  );

  // 1) Adjacent top-level sections must not share a dark surface. Read from the
  //    computed background, so it catches props, hardcoded classes and inline
  //    styles alike (this is the half CI enforces from the data-surface stamps).
  const collisions: string[] = [];
  for (let i = 0; i < sections.length - 1; i += 1) {
    const a = classify(getComputedStyle(sections[i]).backgroundColor);
    const b = classify(getComputedStyle(sections[i + 1]).backgroundColor);
    if (a && b && a === b) {
      collisions.push(
        `  · ${label(sections[i], `section[${i}]`)} → ${label(sections[i + 1], `section[${i + 1}]`)} are both ${a}`,
      );
    }
  }

  // 2) Content adaptation: any element that declares its own surface (a card or
  //    panel meant to contrast, stamped with surfaceData) must differ from the
  //    nearest ancestor that declares one — otherwise it blends into its
  //    section. Intent-based, so it never false-positives on same-surface
  //    bordered groups (accordions, hairline card grids) that don't opt in.
  const contrast: string[] = [];
  main.querySelectorAll<HTMLElement>("[data-surface]").forEach((el) => {
    const ancestor = el.parentElement?.closest<HTMLElement>("[data-surface]");
    if (!ancestor) return;
    if (el.dataset.surface === ancestor.dataset.surface) {
      contrast.push(
        `  · ${label(el, el.tagName.toLowerCase())} (${el.dataset.surface}) matches its container ${label(ancestor, ancestor.tagName.toLowerCase())}`,
      );
    }
  });

  if (!collisions.length && !contrast.length) return;
  const lines = [`[surface-audit] ${pathname} — surface issues:`];
  if (collisions.length) lines.push("Adjacent sections share a background:", ...collisions);
  if (contrast.length) lines.push("Surface boxes matching their container:", ...contrast);
  // eslint-disable-next-line no-console
  console.warn(lines.join("\n"));
}
