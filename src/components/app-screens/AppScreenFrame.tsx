"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Native design size of every app screen (iPhone X). */
export const SCREEN_W = 375;
export const SCREEN_H = 812;

/**
 * Scaling wrapper shared by all fake app screens: the screen renders at its
 * native 375×812 coordinate system and is scaled to whatever width the host
 * gives this frame (the PhoneMockup screen hole, a workbench specimen). The
 * outer box reserves the correct aspect ratio — unless `fill`, where the
 * parent owns the size (e.g. the mock-up's screen hole, which is slightly
 * shorter than 375:812 and clips the bottom of the scene) — and a
 * ResizeObserver writes the scale factor straight onto the element so resizes
 * never re-render React.
 *
 * GSAP inside the screen animates its own elements — the scale transform
 * lives out here on a separate element, so the two never fight.
 */
export default function AppScreenFrame({
  className,
  fill = false,
  children,
}: {
  className?: string;
  /** Fill the parent instead of reserving the 375:812 aspect ratio. */
  fill?: boolean;
  children: ReactNode;
}) {
  const outerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const apply = () =>
      outer.style.setProperty("--screen-scale", String(outer.clientWidth / SCREEN_W));
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={outerRef}
      className={cn("relative w-full overflow-hidden", fill && "h-full", className)}
      style={{
        ...(fill ? {} : { aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }),
        ["--screen-scale" as string]: "1",
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          transform: "scale(var(--screen-scale))",
        }}
      >
        {children}
      </div>
    </div>
  );
}
