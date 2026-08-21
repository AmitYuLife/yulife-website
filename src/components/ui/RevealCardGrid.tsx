"use client";

import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/assetPath";

gsap.registerPlugin(useGSAP);

const CELL_HEIGHT = "h-[366px]";

export type RevealCardGridItem = {
  icon: string;
  alt: string;
  title: string;
  body: string;
};

function prefersHoverInteraction() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Figma: Callout (State=Closed | Open). Single grid cell — icon + title by
 * default, sliding up to reveal the body copy on hover (desktop) or tap
 * (touch/keyboard) — the same vertical slide-and-crossfade reveal as the
 * Proven ROI stat columns (`StatColumn`). Independent per cell: hovering one
 * has no effect on its neighbours.
 */
export function RevealCard({ item }: { item: RevealCardGridItem }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useGSAP(
    () => {
      if (backRef.current) gsap.set(backRef.current, { opacity: 0 });
    },
    { scope: containerRef },
  );

  const animateTo = useCallback((toActive: boolean) => {
    const container = containerRef.current;
    const track = trackRef.current;
    const front = frontRef.current;
    const back = backRef.current;
    if (!container || !track) return;

    const slideHeight = container.offsetHeight;
    const instant = prefersReducedMotion();

    gsap.to(track, {
      y: toActive ? -slideHeight : 0,
      duration: instant ? 0 : 0.35,
      ease: "power3.out",
      overwrite: true,
    });

    if (front) {
      gsap.to(front, {
        opacity: toActive ? 0 : 1,
        duration: instant ? 0 : 0.22,
        ease: "power2.out",
        overwrite: true,
      });
    }

    if (back) {
      gsap.to(back, {
        opacity: toActive ? 1 : 0,
        duration: instant ? 0 : 0.22,
        ease: "power2.out",
        overwrite: true,
      });
    }
  }, []);

  useGSAP(
    () => {
      animateTo(active);
    },
    { dependencies: [active, animateTo], scope: containerRef },
  );

  const handlePointerEnter = () => {
    if (prefersHoverInteraction()) setActive(true);
  };

  const handlePointerLeave = () => {
    if (prefersHoverInteraction()) setActive(false);
  };

  const handleClick = () => {
    if (!prefersHoverInteraction()) setActive((current) => !current);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActive((current) => !current);
    }
  };

  return (
    <li
      className={`relative ${CELL_HEIGHT} cursor-default transition-colors duration-300 ease-out motion-reduce:transition-none ${
        active ? "bg-surface-inverse" : "bg-surface-inverse-raised"
      }`}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={active}
      aria-label={item.title}
    >
      <div ref={containerRef} className={`relative w-full overflow-hidden ${CELL_HEIGHT}`}>
        <div ref={trackRef} className="will-change-transform">
          <div
            ref={frontRef}
            aria-hidden={active}
            className={`flex ${CELL_HEIGHT} flex-col items-center justify-center gap-group p-32 text-center tablet:p-40`}
          >
            <img
              src={assetPath(item.icon)}
              alt=""
              width={120}
              height={120}
              className="h-120 w-auto object-contain"
              loading="lazy"
            />
            <span className="type-heading-h4 text-on-inverse">{item.title}</span>
          </div>
          <div
            ref={backRef}
            aria-hidden={!active}
            className={`flex ${CELL_HEIGHT} items-start p-32 tablet:p-40`}
          >
            <p className="type-body-lg text-on-inverse">{item.body}</p>
          </div>
        </div>
      </div>
    </li>
  );
}

/**
 * Bordered, hover-to-reveal card grid: hairline-divided cells. Each cell
 * slides up on hover/tap to reveal its body copy, exactly like `StatColumn`.
 * Generic and page-agnostic — reuse wherever this pattern fits (Figma:
 * Callout2Col, nodes 2357:1512 / 2416:3391).
 */
export default function RevealCardGrid({
  items,
  columns = 3,
  className = "",
}: {
  items: readonly RevealCardGridItem[];
  /** Desktop column count; tablet is always 2, mobile always 1. */
  columns?: 2 | 3;
  className?: string;
}) {
  return (
    <ul
      className={`grid grid-cols-1 gap-px overflow-clip rounded-md border border-line-emphasis bg-line-emphasis sm:grid-cols-2 ${
        columns === 3 ? "lg:grid-cols-3" : ""
      } ${className}`}
    >
      {items.map((item) => (
        <RevealCard key={item.title} item={item} />
      ))}
    </ul>
  );
}
