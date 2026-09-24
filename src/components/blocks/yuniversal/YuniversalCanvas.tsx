"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import { yuniversalLayers, type YuniversalLayerId } from "./yuniversalLayers";

/**
 * YuniversalCanvas — the "living space realm" hero background (Figma
 * YuniversalCanvas, 2923:67921 inside HeroSection 2921:58710).
 *
 * Every static detail — geometry, rotations, blend modes — is baked into the
 * layer images by scripts/generate-yuniversal.mjs, so at runtime each layer is
 * one image that only moves and fades. Cost model:
 * - Motion is CSS keyframes on the compositor (no JS per frame). Each layer's
 *   loop, spin and parallax use the separate `transform` / `rotate` /
 *   `translate` properties, so they compose on one element instead of nested
 *   wrapper layers. Rules live in globals.css (`.yc-*`).
 * - No page-level blend modes (live blending of large moving layers made
 *   scrolling judder).
 * - Hero loads this module with next/dynamic only once the coin intro starts,
 *   so none of it is on the initial bundle or the coin's critical path.
 *   Images are low-priority and async-decoded, and the layer stays invisible
 *   until every one has decoded — no pop-in.
 * - Loops pause while the hero is off-screen and freeze while the page is
 *   scrolling (only the parallax moves then); off-screen, content-visibility
 *   also lets Chrome drop the layers entirely. State is written straight to
 *   DOM attributes, so after mount the component never re-renders.
 * - Scroll parallax (planets only) is a CSS scroll-driven animation;
 *   browsers without it (Firefox, today) simply don't get it.
 */

/** A layer's motion: its loop class(es) + timing, parallax depth, and entrance. */
type Motion = {
  /** Loop class(es) from globals.css. */
  loop: string;
  /** Loop timing custom properties (see the matching `.yc-*` rule). */
  vars: Record<`--yc-${string}`, string>;
  /**
   * Scroll parallax: how far the layer lags the page over the first 1500px of
   * scroll (the hero is gone by then), e.g. 75px = 5% of scroll speed.
   * Bigger = farther away. Keep the 1500px in step with `.yc-depth`.
   */
  depth?: string;
  /**
   * Entrance fade delay (and optional duration, default 1.2s) once the assets
   * are ready. The canvas mounts as the coin fades in, so the whole stagger —
   * nebulae, planets, dwarf stars, bright stars — is timed to finish (~2.1s)
   * before the hero copy arrives (Hero's BEAT_CONTENT_IN, 2.5s).
   */
  in: string;
  fade?: string;
};

// Only the planets take parallax — nearest the foreground, so they barely
// lag; everything else scrolls with the page.
const PLANET_DEPTH = "75px"; // 5%

// Timings are staggered so no two bodies move in step.
const MOTION: Record<YuniversalLayerId, Motion> = {
  "dwarf-stars-1": { loop: "yc-twinkle", vars: { "--yc-dur": "4.9s", "--yc-offset": "-1.3s" }, in: "0.6s" },
  "dwarf-stars-2": { loop: "yc-twinkle yc-twinkle-soft", vars: { "--yc-dur": "3.7s", "--yc-offset": "-2.8s" }, in: "0.6s" },
  "dwarf-stars-3": { loop: "yc-twinkle yc-twinkle-deep", vars: { "--yc-dur": "7.3s", "--yc-offset": "-5.1s" }, in: "0.6s" },
  "dwarf-stars-4": { loop: "yc-twinkle", vars: { "--yc-dur": "6.1s", "--yc-offset": "-0.4s" }, in: "0.6s" },
  "dwarf-stars-5": { loop: "yc-twinkle yc-twinkle-soft", vars: { "--yc-dur": "5.4s", "--yc-offset": "-3.9s" }, in: "0.6s" },
  "dwarf-stars-6": { loop: "yc-twinkle yc-twinkle-deep", vars: { "--yc-dur": "8.6s", "--yc-offset": "-2.2s" }, in: "0.6s" },
  "gas-giant": { loop: "yc-planet", vars: { "--yc-dur": "52s", "--yc-offset": "-14s" }, depth: PLANET_DEPTH, in: "0.3s" },
  "bright-star-a": {
    loop: "yc-bright-star",
    vars: { "--yc-dur": "140s", "--yc-pulse-dur": "8.4s", "--yc-pulse-offset": "-2.1s" },
    in: "0.8s",
  },
  "bright-star-b": {
    loop: "yc-bright-star",
    vars: { "--yc-dur": "120s", "--yc-dir": "reverse", "--yc-pulse-dur": "6.7s", "--yc-pulse-offset": "-4.3s" },
    in: "0.85s",
  },
  "bright-star-c": {
    loop: "yc-bright-star",
    vars: { "--yc-dur": "160s", "--yc-pulse-dur": "9.6s", "--yc-pulse-offset": "-0.8s" },
    in: "0.9s",
  },
  "nebula-right": { loop: "yc-nebula", vars: { "--yc-dur": "130s", "--yc-offset": "-40s" }, in: "0s", fade: "1.6s" },
  "nebula-left": {
    loop: "yc-nebula",
    vars: { "--yc-dur": "110s", "--yc-offset": "-70s", "--yc-dir": "alternate-reverse" },
    in: "0.1s",
    fade: "1.6s",
  },
  "dwarf-planet": {
    loop: "yc-planet",
    vars: { "--yc-dur": "38s", "--yc-offset": "-9s", "--yc-dir": "reverse" },
    depth: PLANET_DEPTH,
    in: "0.4s",
  },
};

/** How long after the last scroll event the ambient loops resume. */
const SCROLL_SETTLE_MS = 180;
/** Reveal anyway if an asset never decodes. */
const DECODE_CAP_MS = 2000;

/** `style` positions the canvas box (defaults to filling its parent). */
export default function YuniversalCanvas({ style }: { style?: CSSProperties }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let cancelled = false;

    // Reveal once every image has decoded, so the staggered fade-in never
    // shows a half-loaded sky. A transition only runs from a style the browser
    // has already computed: the SVGs decode almost instantly, so without the
    // forced read below the attribute can land before the hidden (opacity 0)
    // style ever existed, and every layer pops in at once.
    const decoded = Promise.all([...root.querySelectorAll("img")].map((img) => img.decode().catch(() => {})));
    const cap = new Promise((resolve) => window.setTimeout(resolve, DECODE_CAP_MS));
    Promise.race([decoded, cap]).then(() => {
      if (cancelled) return;
      for (const layer of root.querySelectorAll(".yc-reveal")) void getComputedStyle(layer).opacity;
      root.setAttribute("data-yc-on", "");
    });

    // Reduced motion: every loop is off in CSS, so there's nothing to pause.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return () => {
        cancelled = true;
      };
    }

    // While scrolling, freeze the ambient loops so scroll frames only
    // composite the parallax. Only listened for while the hero is on screen.
    let settle = 0;
    const onScroll = () => {
      if (!root.hasAttribute("data-yc-scrolling")) root.setAttribute("data-yc-scrolling", "");
      window.clearTimeout(settle);
      settle = window.setTimeout(() => root.removeAttribute("data-yc-scrolling"), SCROLL_SETTLE_MS);
    };

    // Off-screen: pause everything and stop listening to scroll.
    const observer = new IntersectionObserver(([entry]) => {
      root.toggleAttribute("data-yc-paused", !entry.isIntersecting);
      if (entry.isIntersecting) window.addEventListener("scroll", onScroll, { passive: true });
      else window.removeEventListener("scroll", onScroll);
    });
    observer.observe(root);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
    };
  }, []);

  return (
    <div
      {...domSrc("YuniversalCanvas")}
      ref={rootRef}
      className="yc-root pointer-events-none absolute overflow-hidden"
      style={style ?? { inset: 0 }}
      aria-hidden="true"
    >
      {/* The 1920×1465 Figma frame, scaled to cover the hero. */}
      <div className="yc-stage absolute top-0 left-1/2 overflow-hidden">
        {yuniversalLayers.map(({ id, inset: [top, right, bottom, left] }) => {
          const motion = MOTION[id];
          return (
            // Two elements: the entrance fades this box, the loops animate the
            // inner one (the twinkles and pulses animate opacity themselves).
            <div
              key={id}
              className="yc-reveal absolute"
              style={
                {
                  top: `${top}%`,
                  right: `${right}%`,
                  bottom: `${bottom}%`,
                  left: `${left}%`,
                  "--yc-in": motion.in,
                  "--yc-fade": motion.fade,
                } as CSSProperties
              }
            >
              <div
                className={`yc-anim ${motion.loop}${motion.depth ? " yc-depth" : ""} absolute inset-0`}
                style={{ ...motion.vars, "--yc-depth": motion.depth } as CSSProperties}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, no next/image */}
                <img
                  src={assetPath(`/hero/yuniversal/${id}.svg`)}
                  alt=""
                  draggable={false}
                  decoding="async"
                  fetchPriority="low"
                  className="block size-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
