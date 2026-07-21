"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const LEADER_RANGE = 140;
const IDLE_RESET_MS = 1800;

function blobGradient(colorVar: string) {
  return `radial-gradient(circle, ${colorVar} 0%, color-mix(in oklch, ${colorVar} 40%, transparent) 45%, transparent 65%)`;
}

const BLOBS = [
  {
    className: "hero-blob-mint",
    style: {
      background: blobGradient("var(--hero-aurora-mint)"),
      width: "62vw",
      height: "62vw",
      maxWidth: "820px",
      maxHeight: "820px",
      top: "-18%",
      right: "-8%",
      opacity: 0.16,
    },
    lava: { xRange: 85, yRange: 105, scale: [0.9, 1.14] as const, minDur: 9, maxDur: 16 },
    parallax: { x: 0.1, y: 0.08 },
    lag: 0.58,
  },
  {
    className: "hero-blob-sky",
    style: {
      background: blobGradient("var(--hero-aurora-sky)"),
      width: "50vw",
      height: "50vw",
      maxWidth: "640px",
      maxHeight: "640px",
      top: "28%",
      left: "50%",
      opacity: 0.16,
    },
    lava: { xRange: 55, yRange: 90, scale: [0.88, 1.22] as const, minDur: 8, maxDur: 14 },
    parallax: { x: 1, y: 1 },
    lag: 0.12,
    centered: true,
  },
  {
    className: "hero-blob-yellow",
    style: {
      background: blobGradient("var(--hero-aurora-yellow)"),
      width: "46vw",
      height: "46vw",
      maxWidth: "580px",
      maxHeight: "580px",
      top: "8%",
      left: "-6%",
      opacity: 0.1,
    },
    lava: { xRange: 70, yRange: 115, scale: [0.87, 1.18] as const, minDur: 10, maxDur: 18 },
    parallax: { x: 0.22, y: 0.18 },
    lag: 0.45,
  },
  {
    className: "hero-blob-purple",
    style: {
      background: blobGradient("var(--hero-aurora-purple)"),
      width: "56vw",
      height: "56vw",
      maxWidth: "740px",
      maxHeight: "740px",
      bottom: "-12%",
      left: "-10%",
      opacity: 0.22,
    },
    lava: { xRange: 78, yRange: 125, scale: [0.86, 1.2] as const, minDur: 11, maxDur: 19 },
    parallax: { x: -0.4, y: -0.36 },
    lag: 0.72,
  },
] as const;

export default function AuroraBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(
    (_, contextSafe) => {
      const safe =
        contextSafe ??
        (<T extends (...args: never[]) => void>(fn: T) => fn);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const setters = BLOBS.map((blob, i) => {
          const wrapper = wrapperRefs.current[i];
          if (!wrapper) return null;

          return {
            x: gsap.quickTo(wrapper, "x", {
              duration: blob.lag,
              ease: "power2.out",
            }),
            y: gsap.quickTo(wrapper, "y", {
              duration: blob.lag,
              ease: "power2.out",
            }),
          };
        });

        BLOBS.forEach((blob, i) => {
          const el = blobRefs.current[i];
          if (!el) return;

          if ("centered" in blob && blob.centered) {
            gsap.set(el, { xPercent: -50 });
          }

          const driftStep = safe(() => {
            gsap.to(el, {
              x: gsap.utils.random(-blob.lava.xRange, blob.lava.xRange),
              y: gsap.utils.random(-blob.lava.yRange, blob.lava.yRange),
              scale: gsap.utils.random(blob.lava.scale[0], blob.lava.scale[1]),
              duration: gsap.utils.random(blob.lava.minDur, blob.lava.maxDur),
              ease: "sine.inOut",
              onComplete: driftStep,
            });
          });

          gsap.delayedCall(i * 0.35, driftStep);
        });

        let idleTimer: gsap.core.Tween | null = null;

        const releaseControl = safe(() => {
          wrapperRefs.current.forEach((wrapper) => {
            if (!wrapper) return;
            gsap.to(wrapper, {
              x: 0,
              y: 0,
              duration: 1.4,
              ease: "sine.inOut",
              overwrite: "auto",
            });
          });
        });

        const onMouseMove = safe((event: MouseEvent) => {
          const dx = (event.clientX / window.innerWidth - 0.5) * 2;
          const dy = (event.clientY / window.innerHeight - 0.5) * 2;
          const leaderX = dx * LEADER_RANGE;
          const leaderY = dy * LEADER_RANGE;

          BLOBS.forEach((blob, i) => {
            setters[i]?.x(leaderX * blob.parallax.x);
            setters[i]?.y(leaderY * blob.parallax.y);
          });

          idleTimer?.kill();
          idleTimer = gsap.delayedCall(IDLE_RESET_MS / 1000, releaseControl);
        });

        window.addEventListener("mousemove", onMouseMove);

        return () => {
          window.removeEventListener("mousemove", onMouseMove);
          idleTimer?.kill();
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        blobRefs.current.forEach((el) => {
          if (el) gsap.set(el, { opacity: 0.08 });
        });
      });

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {BLOBS.map((blob, i) => (
        <div
          key={blob.className}
          ref={(node) => {
            wrapperRefs.current[i] = node;
          }}
          className="absolute inset-0 will-change-transform"
        >
          <div
            ref={(node) => {
              blobRefs.current[i] = node;
            }}
            className={`${blob.className} absolute rounded-full blur-2xl will-change-transform`}
            style={blob.style}
          />
        </div>
      ))}
    </div>
  );
}
