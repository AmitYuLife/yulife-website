import type { ReactNode } from "react";
import { assetPath } from "@/lib/assetPath";
import { cn } from "@/lib/utils";
import AppScreenFrame from "./AppScreenFrame";

/**
 * The iPhone device frame from the design system (Figma node 2570:3743,
 * 434×901 native), rebuilt from its exported parts: the metallic bezel SVG,
 * textured side buttons, and a rounded screen hole that clips whatever app
 * screen it wraps. Sized by its container width; every internal measurement is
 * expressed in cqw so the whole device scales as one drawing.
 *
 * The 375×812 screens are slightly taller than the mock-up's screen hole
 * (413.44×873.8) — the screen fills the hole's width, anchored to the top, and
 * the last ~19px of scene (sand) clips off the bottom.
 */

const MOCK_W = 434;
/** Convert a native mock-up px measurement to container-query width units. */
const cqw = (px: number) => `${(px / MOCK_W) * 100}cqw`;

const BUTTON_SHINE =
  "linear-gradient(180deg, rgb(255,255,255) 1%, rgba(0,0,0,0.1) 10%, rgba(255,255,255,0) 15%, rgb(255,255,255) 25%, rgba(255,255,255,0) 75%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0.3) 95%, rgba(0,0,0,0) 98.5%)";
const BUTTON_SHINE_RIGHT =
  "linear-gradient(180deg, rgba(0,0,0,0) 1.4%, rgba(0,0,0,0.3) 5%, rgba(0,0,0,0.35) 10%, rgba(255,255,255,0) 25%, rgb(255,255,255) 75%, rgba(255,255,255,0) 85%, rgba(0,0,0,0.1) 90%, rgb(255,255,255) 99%)";

function SideButton({
  side,
  top,
  height,
  texture,
}: {
  side: "left" | "right";
  top: number;
  height: number;
  texture: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute overflow-hidden"
      style={{
        [side]: 0,
        top: cqw(top),
        width: cqw(2.38),
        height: cqw(height),
        borderRadius:
          side === "left" ? `${cqw(0.95)} 0 0 ${cqw(0.95)}` : `0 ${cqw(0.95)} ${cqw(0.95)} 0`,
        backgroundColor: "#b3afa7",
      }}
    >
      <img src={assetPath(texture)} alt="" className="absolute inset-0 size-full object-cover" />
      <div
        className="absolute inset-0 mix-blend-hard-light"
        style={{ backgroundImage: side === "left" ? BUTTON_SHINE : BUTTON_SHINE_RIGHT }}
      />
    </div>
  );
}

export default function PhoneMockup({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ aspectRatio: "434 / 901", containerType: "inline-size" }}
    >
      {/* Side buttons sit behind the bezel, poking out of its edges. */}
      <SideButton side="left" top={201.28} height={45.3} texture="/app-screens/iphone-btn-small.png" />
      <SideButton side="left" top={276.35} height={72.71} texture="/app-screens/iphone-btn-tall.png" />
      <SideButton side="left" top={378.86} height={72.71} texture="/app-screens/iphone-btn-tall.png" />
      <SideButton side="right" top={301.41} height={116.82} texture="/app-screens/iphone-btn-right.png" />

      {/* Black display glass filling the bezel's inner cutout, with the live
          screen inset ~6.5px inside it (measured from the reference device
          renders) — the dark ring softens the screen edge against the metal. */}
      <div
        className="absolute bg-black"
        style={{
          left: cqw(10.19),
          top: cqw(8.1),
          width: cqw(413.44),
          height: cqw(873.8),
          borderRadius: cqw(45.854),
        }}
      >
        <div
          className="absolute overflow-hidden"
          style={{
            left: cqw(6.5),
            top: cqw(6.5),
            width: cqw(400.44),
            height: cqw(860.8),
            borderRadius: cqw(39.35),
          }}
        >
          <AppScreenFrame fill>{children}</AppScreenFrame>
        </div>
      </div>

      {/* Metallic bezel (transparent screen hole); stored flipped in Figma. */}
      <img
        src={assetPath("/app-screens/iphone-frame.svg")}
        alt=""
        className="pointer-events-none absolute"
        style={{
          left: cqw(2.55),
          top: 0,
          width: cqw(430.18),
          height: cqw(898.45),
          maxWidth: "none",
          transform: "scaleY(-1)",
        }}
      />
    </div>
  );
}
