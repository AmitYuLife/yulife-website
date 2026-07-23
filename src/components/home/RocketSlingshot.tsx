"use client";

import { useRef } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { assetPath } from "@/lib/assetPath";

gsap.registerPlugin(Draggable, useGSAP);

/**
 * Slingshot rocket for the join-the-mission card. The flame is the drag
 * handle: pressing it arms the rocket (shrinks to the Figma "drag active"
 * pose at 0.8 opacity), pulling it away draws the dashed inverse-trajectory
 * line between the two, and releasing snaps the flame back onto the rocket's
 * tail so it reads as propelling it — both fly off, clipped by the card, then
 * fade back in near the rest pose. Geometry is fraction-based against the
 * Figma 488x456 DragCanvas so it scales fluidly down to mobile.
 */

// Rest pose (fractions of canvas width/height).
const ROCKET_W = 0.7074; // sprite width / canvas width
const ROCKET_REST = { x: 0.55, y: 0.48 };
const REST_ROTATION = 15;

// Flame anchor: offset of the flame centre from the rocket centre, expressed
// in rocket sprite widths in the rocket's unrotated local space. Equal x/y
// magnitudes put the flame exactly on the 45deg thrust axis, matching the
// reference art (verified against the Figma Flame&Rocket group).
const FLAME_ANCHOR = { x: -0.322, y: 0.322 };
const FLAME_REL = 0.3006; // flame sprite width / rocket sprite width (natural)
const FLAME_W = ROCKET_W * FLAME_REL;

// How far the artwork actually reaches along the thrust axis (measured from
// the sprites' alpha channels), as fractions of each sprite's width. Used to
// hang the dashed line an equal visual gap off both the nozzle and the flame.
const ROCKET_TAIL_EXTENT = 0.235;
const FLAME_HEAD_EXTENT = 0.5625;

// Armed pose (Figma "Drag Active" state): rocket shifts up-right and shrinks.
const ROCKET_ARMED = { x: 0.6486, y: 0.3958 };
const ARMED_SCALE = 0.55;
const MAX_SCALE = 0.95;
const ARMED_ROCKET_OPACITY = 0.8;

const LINE_GAP = 6; // px of clear space between the dashes and each sprite

// Sprites point up-right at 45deg when unrotated, so heading = angle + 45.
const SPRITE_AXIS_OFFSET = 45;
const REST_HEADING = REST_ROTATION - SPRITE_AXIS_OFFSET; // -30deg, up-right

type Point = { x: number; y: number };

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Rotate the local-space flame anchor by `rotation` (CSS clockwise degrees).
function anchorOffset(rotation: number, rocketWidthPx: number): Point {
  const r = toRad(rotation);
  return {
    x: (FLAME_ANCHOR.x * Math.cos(r) - FLAME_ANCHOR.y * Math.sin(r)) * rocketWidthPx,
    y: (FLAME_ANCHOR.x * Math.sin(r) + FLAME_ANCHOR.y * Math.cos(r)) * rocketWidthPx,
  };
}

// Flame rest centre as canvas fractions (anchor rotated to the rest tilt).
const REST_OFF_X = (FLAME_ANCHOR.x * Math.cos(toRad(REST_ROTATION)) - FLAME_ANCHOR.y * Math.sin(toRad(REST_ROTATION))) * ROCKET_W;
const REST_OFF_Y = (FLAME_ANCHOR.x * Math.sin(toRad(REST_ROTATION)) + FLAME_ANCHOR.y * Math.cos(toRad(REST_ROTATION))) * ROCKET_W;
const FLAME_REST = {
  x: ROCKET_REST.x + REST_OFF_X,
  y: ROCKET_REST.y + REST_OFF_Y * (488 / 456), // x-fractions -> y-fractions
};

// Sprites are positioned by their top-left corner (centre minus half size) —
// GSAP takes over `translate`/`transform` inline, so CSS-based centring via
// `translate: -50% -50%` gets wiped the moment a tween or Draggable touches
// the element. Heights are width-fractions converted to canvas-height terms.
const X_TO_Y = 488 / 456;
const ROCKET_TOPLEFT = {
  x: ROCKET_REST.x - ROCKET_W / 2,
  y: ROCKET_REST.y - (ROCKET_W * X_TO_Y) / 2,
};
const FLAME_TOPLEFT = {
  x: FLAME_REST.x - FLAME_W / 2,
  y: FLAME_REST.y - (FLAME_W * X_TO_Y) / 2,
};

export default function RocketSlingshot() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const rocketFloatRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);
  const flameFloatRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const rocket = rocketRef.current;
      const rocketFloat = rocketFloatRef.current;
      const flame = flameRef.current;
      const flameFloat = flameFloatRef.current;
      const line = lineRef.current;
      const label = labelRef.current;
      if (!canvas || !rocket || !rocketFloat || !flame || !flameFloat || !line || !label) {
        return;
      }

      let draggable: Draggable | null = null;
      let floatTweens: gsap.core.Tween[] = [];
      let flightTl: gsap.core.Timeline | null = null;
      let isFlying = false;
      let isDragging = false;

      // Pixel geometry, captured on press (percent layout handles resize).
      let W = 0;
      let H = 0;
      let diag = 0;
      let rocketWpx = 0;
      let flameRestPx: Point = { x: 0, y: 0 };
      let rocketRestPx: Point = { x: 0, y: 0 };
      let rocketArmedPx: Point = { x: 0, y: 0 };
      // Bounds the flame may be dragged within (the SectionCard, fix #3),
      // expressed in canvas-local coordinates.
      let bounds = { left: 0, top: 0, right: 0, bottom: 0 };
      // Flame-to-rocket separation at press; pull strength is measured as the
      // increase over this, so an accidental tap never fires a launch.
      let pressDist = 0;

      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        diag = Math.hypot(W, H);
        rocketWpx = ROCKET_W * W;
        flameRestPx = { x: FLAME_REST.x * W, y: FLAME_REST.y * H };
        rocketRestPx = { x: ROCKET_REST.x * W, y: ROCKET_REST.y * H };
        rocketArmedPx = { x: ROCKET_ARMED.x * W, y: ROCKET_ARMED.y * H };
        pressDist = Math.hypot(
          rocketArmedPx.x - flameRestPx.x,
          rocketArmedPx.y - flameRestPx.y,
        );

        const boundsEl = canvas.closest<HTMLElement>("[data-rocket-bounds]") ?? canvas;
        const br = boundsEl.getBoundingClientRect();
        bounds = {
          left: br.left - rect.left,
          top: br.top - rect.top,
          right: br.right - rect.left,
          bottom: br.bottom - rect.top,
        };
      };

      const setRestPose = () => {
        gsap.set([rocket, flame], {
          x: 0,
          y: 0,
          scale: 1,
          rotation: REST_ROTATION,
          autoAlpha: 1,
        });
        gsap.set([line, label], { autoAlpha: 0 });
      };

      // The pair hovers gently, each on its own rhythm so they drift slightly
      // out of phase (fix #7).
      const startFloat = () => {
        floatTweens.forEach((t) => t.kill());
        gsap.set([rocketFloat, flameFloat], { y: 0 });
        floatTweens = [
          gsap.to(rocketFloat, {
            y: -12,
            duration: 1.9,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          }),
          gsap.to(flameFloat, {
            y: -8,
            duration: 1.55,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
            delay: 0.2,
          }),
        ];
      };

      const stopFloat = () => {
        floatTweens.forEach((t) => t.kill());
        floatTweens = [];
        gsap.set([rocketFloat, flameFloat], { y: 0 });
      };

      // Current flame centre in canvas px (rest position + drag offset).
      const flameCenter = (): Point => ({
        x: flameRestPx.x + (gsap.getProperty(flame, "x") as number),
        y: flameRestPx.y + (gsap.getProperty(flame, "y") as number),
      });

      // Heading from flame to rocket = launch direction (inverse of the pull).
      const headingDeg = (from: Point) =>
        (Math.atan2(rocketArmedPx.y - from.y, rocketArmedPx.x - from.x) * 180) /
        Math.PI;

      // 0 at press, 1 once the pull has grown by ~half the canvas diagonal.
      const pullStrength = (dist: number) =>
        gsap.utils.clamp(0, 1, (dist - pressDist) / (diag * 0.5));

      const rocketScaleForDist = (dist: number) =>
        ARMED_SCALE +
        (MAX_SCALE - ARMED_SCALE) * Math.pow(pullStrength(dist), 0.6);

      const updateAiming = () => {
        const fc = flameCenter();
        const angle = headingDeg(fc);
        const dist = Math.hypot(rocketArmedPx.x - fc.x, rocketArmedPx.y - fc.y);
        const rocketScale = rocketScaleForDist(dist);

        gsap.set(flame, { rotation: angle + SPRITE_AXIS_OFFSET });
        gsap.to(rocket, {
          rotation: angle + SPRITE_AXIS_OFFSET,
          scale: rocketScale,
          duration: 0.15,
          ease: "power1.out",
          overwrite: "auto",
        });

        // Dashed line floats between the two, detached from both by the same
        // visual gap beyond each sprite's actual artwork.
        const flameEdge = FLAME_HEAD_EXTENT * FLAME_W * W * ARMED_SCALE;
        const rocketEdge = ROCKET_TAIL_EXTENT * rocketWpx * rocketScale;
        const start = flameEdge + LINE_GAP;
        const end = dist - rocketEdge - LINE_GAP;
        if (end - start > 4) {
          const rad = toRad(angle);
          const x1 = fc.x + Math.cos(rad) * start;
          const y1 = fc.y + Math.sin(rad) * start;
          const x2 = fc.x + Math.cos(rad) * end;
          const y2 = fc.y + Math.sin(rad) * end;
          line.setAttribute("d", `M ${x1} ${y1} L ${x2} ${y2}`);
          gsap.set(line, { autoAlpha: 1 });
        } else {
          gsap.set(line, { autoAlpha: 0 });
        }

        // "drag me" sits just below the flame, upright regardless of rotation.
        gsap.set(label, {
          x: fc.x,
          y: fc.y + FLAME_W * W * ARMED_SCALE * 0.5 + 14,
          xPercent: -50,
          autoAlpha: 1,
        });
      };

      const arm = () => {
        measure();
        stopFloat();
        flightTl?.kill();

        // Scale/rotation are owned by updateAiming so the tweens don't fight.
        // The rocket dims to 0.8 while the drag is live (fix #1).
        gsap.to(rocket, {
          x: rocketArmedPx.x - rocketRestPx.x,
          y: rocketArmedPx.y - rocketRestPx.y,
          autoAlpha: ARMED_ROCKET_OPACITY,
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(flame, {
          scale: ARMED_SCALE,
          autoAlpha: 1,
          duration: 0.25,
          ease: "power2.out",
          overwrite: "auto",
        });
        updateAiming();
      };

      const settleBack = () => {
        gsap.to([line, label], { autoAlpha: 0, duration: 0.15 });
        gsap.to([rocket, flame], {
          x: 0,
          y: 0,
          scale: 1,
          rotation: REST_ROTATION,
          autoAlpha: 1,
          duration: 0.55,
          ease: "elastic.out(1, 0.6)",
          overwrite: "auto",
          onComplete: startFloat,
        });
      };

      const launch = () => {
        const fc = flameCenter();
        const dist = Math.hypot(rocketArmedPx.x - fc.x, rocketArmedPx.y - fc.y);
        const minPull = Math.max(24, diag * 0.05);

        if (dist - pressDist < minPull) {
          settleBack();
          return;
        }

        isFlying = true;
        draggable?.disable();

        const power = pullStrength(dist);
        const angle = headingDeg(fc);
        const rad = toRad(angle);
        const rot = angle + SPRITE_AXIS_OFFSET;
        const rocketScale = rocketScaleForDist(dist);
        const travel = diag + rocketWpx;
        // Abrupt kick the moment the flame slams into the tail.
        const jolt = rocketWpx * rocketScale * 0.13;

        // Where the flame docks on the launching rocket's tail (fix #4).
        const dock = anchorOffset(rot, rocketWpx * rocketScale);
        const dockX = rocketArmedPx.x + dock.x - flameRestPx.x;
        const dockY = rocketArmedPx.y + dock.y - flameRestPx.y;

        gsap.set([line, label], { autoAlpha: 0 });

        // Re-entry starts just shy of the rest pose and fades in, so the pair
        // never visibly teleports across the card (fix #6).
        const backRad = toRad(REST_HEADING);
        const backDist = diag * 0.22;
        const offX = -Math.cos(backRad) * backDist;
        const offY = -Math.sin(backRad) * backDist;

        flightTl = gsap
          .timeline({
            onComplete: () => {
              isFlying = false;
              draggable?.enable();
              startFloat();
            },
          })
          // The flame snaps back onto the rocket's tail...
          .to(flame, {
            x: dockX,
            y: dockY,
            scale: rocketScale,
            rotation: rot,
            duration: 0.12,
            ease: "power2.in",
            overwrite: "auto",
          })
          .to(rocket, { autoAlpha: 1, duration: 0.12 }, 0)
          // ...the impact jolts the rocket forward, the flame catching up a
          // beat later so the impulse visibly transfers...
          .to(rocket, {
            x: `+=${Math.cos(rad) * jolt}`,
            y: `+=${Math.sin(rad) * jolt}`,
            duration: 0.08,
            ease: "power4.out",
          })
          .to(
            flame,
            {
              x: `+=${Math.cos(rad) * jolt}`,
              y: `+=${Math.sin(rad) * jolt}`,
              duration: 0.1,
              ease: "power2.out",
            },
            "<0.03",
          )
          // ...and then it sends both flying off together, docked.
          .to([rocket, flame], {
            x: `+=${Math.cos(rad) * travel}`,
            y: `+=${Math.sin(rad) * travel}`,
            duration: 0.9 - power * 0.4,
            ease: "power2.in",
          })
          // Reassemble just off the rest pose, faded out...
          .set([rocket, flame], {
            x: offX,
            y: offY,
            scale: 1,
            rotation: REST_ROTATION,
            autoAlpha: 0,
          })
          // ...and glide home while fading in.
          .to(
            [rocket, flame],
            { x: 0, y: 0, duration: 0.8, ease: "power2.out" },
            "+=0.2",
          )
          .to([rocket, flame], { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, "<")
          .fromTo(
            [rocket, flame],
            { scale: 0.96 },
            { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.6)" },
            "<+=0.4",
          );
      };

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        measure();
        setRestPose();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        measure();
        setRestPose();
        startFloat();

        const [instance] = Draggable.create(flame, {
          type: "x,y",
          cursor: "grab",
          activeCursor: "grabbing",
          allowNativeTouchScrolling: false,
          minimumMovement: 0,
          onPress() {
            if (isFlying) return;
            isDragging = true;
            arm();
          },
          onDrag() {
            // Keep the flame inside the SectionCard (fix #3).
            const pad = FLAME_W * W * ARMED_SCALE * 0.4;
            const cx = gsap.utils.clamp(
              bounds.left + pad,
              bounds.right - pad,
              flameRestPx.x + this.x,
            );
            const cy = gsap.utils.clamp(
              bounds.top + pad,
              bounds.bottom - pad,
              flameRestPx.y + this.y,
            );
            if (cx !== flameRestPx.x + this.x || cy !== flameRestPx.y + this.y) {
              gsap.set(flame, { x: cx - flameRestPx.x, y: cy - flameRestPx.y });
              this.update();
            }
            updateAiming();
          },
          onRelease() {
            isDragging = false;
            if (isFlying) return;
            launch();
          },
        });
        draggable = instance;

        const onResize = () => {
          if (isFlying || isDragging) return;
          measure();
        };
        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          instance.kill();
          draggable = null;
          stopFloat();
          flightTl?.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: canvasRef },
  );

  return (
    <div
      ref={canvasRef}
      data-reveal
      className="relative w-full max-w-[488px] shrink-0"
      style={{ aspectRatio: "488 / 456" }}
    >
      <svg
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          ref={lineRef}
          fill="none"
          stroke="var(--neutral-white)"
          strokeWidth="2"
          strokeDasharray="4 8"
          strokeLinecap="round"
        />
      </svg>

      <div
        ref={rocketRef}
        className="pointer-events-none absolute z-[2]"
        style={{
          width: `${ROCKET_W * 100}%`,
          aspectRatio: "1",
          left: `${ROCKET_TOPLEFT.x * 100}%`,
          top: `${ROCKET_TOPLEFT.y * 100}%`,
        }}
      >
        <div ref={rocketFloatRef} className="size-full">
          <img
            src={assetPath("/home/rocket-body.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="size-full select-none"
          />
        </div>
      </div>

      <div
        ref={flameRef}
        role="img"
        aria-label="Drag the flame to launch the rocket"
        className="final-cta-rocket-drag absolute z-[3] touch-none select-none will-change-transform"
        style={{
          width: `${FLAME_W * 100}%`,
          aspectRatio: "1",
          left: `${FLAME_TOPLEFT.x * 100}%`,
          top: `${FLAME_TOPLEFT.y * 100}%`,
        }}
      >
        <div ref={flameFloatRef} className="size-full">
          <img
            src={assetPath("/home/flame.png")}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="pointer-events-none size-full"
          />
        </div>
      </div>

      <span
        ref={labelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-[3] whitespace-nowrap text-[14px] font-semibold tracking-wide opacity-0"
        style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
      >
        drag me
      </span>
    </div>
  );
}
