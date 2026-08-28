import type { ReactNode } from "react";
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
 * shorter than 375:812 and clips the bottom of the scene).
 *
 * The scale factor is pure CSS, not measured in JS: the outer box declares
 * itself a query container, and the inner element reads its resolved width
 * back as `cqw` units, converting to a unitless scale via `calc(<length> /
 * <length>)`. That's resolved during layout, before the first paint — so
 * unlike a ResizeObserver-driven scale, there is no wrong-size frame (and
 * therefore nothing to hide or fade in while waiting for one).
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
  return (
    <div
      className={cn("relative w-full overflow-hidden", fill && "h-full", className)}
      style={{
        ...(fill ? {} : { aspectRatio: `${SCREEN_W} / ${SCREEN_H}` }),
        containerType: "inline-size",
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: SCREEN_W,
          height: SCREEN_H,
          transform: `scale(calc(100cqw / ${SCREEN_W}px))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
