"use client";

import { useId, useRef } from "react";
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

// The dashed line carries the same gradient as the "inspire life" heading,
// flowing from the flame into the rocket while the drag is live. One colour
// cycle spans this fraction of the canvas diagonal, so it reads the same at
// every breakpoint, and repeats to fill however long the line is.
const LINE_GRADIENT_PERIOD = 0.32;
const LINE_GRADIENT_CYCLE = 1.1; // seconds per cycle

// The dashes themselves march back toward the flame (right-to-left for the
// usual bottom-left pull), speeding up the further the flame is dragged.
// Canvas-diagonals per second, so the pace holds at every breakpoint.
const DASH_SPEED_MIN = 0.05;
const DASH_SPEED_MAX = 0.15;

// Power-up: the rocket trembles harder the further the flame is pulled, and
// the flame swells as it charges. Amplitudes are fractions of the rocket's
// on-screen width so they hold up at every breakpoint.
const TREMBLE_DRAG = 0.02;
const TREMBLE_PEAK = 0.038;
const FLAME_CHARGE_GROWTH = 0.3;

// Release: the rocket compresses backwards as the flame slams home (tension
// that resolves into the burst, rather than a beat of dead air), then leaves
// stretched along its own axis at a speed set by how hard it was pulled.
const LOAD_BACK = 0.055;
const SLAM_DURATION = 0.1;

// Launch speed is what the pull actually buys: a light tug lobs the rocket
// out (~18px/frame), a full pull hurls it (~48px/frame). Expressed as
// canvas-diagonals per second so it reads identically at every breakpoint.
const BURST_SPEED_MIN = 1.45;
const BURST_SPEED_MAX = 5.5;
// `power1.out` covers its distance in `2 * distance / v0` (GSAP's power1 is
// quadratic — power2 is cubic and would start 1.5x faster for the same
// duration), so the flight time follows from the speed the pull earned.
const BURST_EASE = "power1.out";
const BURST_VELOCITY_FACTOR = 2;
// Stretch added along the rocket's axis at full pull (weak pulls barely any).
const BURST_STRETCH = 0.3;

// The stretch wrapper counter-rotates the sprite so its scaleX runs along the
// rocket's body: rotate(-45) . scaleX . rotate(45), the inner half in CSS.
const STRETCH_AXIS_ROTATION = -45;

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
  const rocketBurstRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const gradientId = `rocket-line-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const rocket = rocketRef.current;
      const burst = rocketBurstRef.current;
      const flame = flameRef.current;
      const line = lineRef.current;
      const gradient = gradientRef.current;
      if (!canvas || !rocket || !burst || !flame || !line || !gradient) {
        return;
      }

      let draggable: Draggable | null = null;
      let flightTl: gsap.core.Timeline | null = null;
      let trembleTween: gsap.core.Tween | null = null;
      let flowActive = false;
      // Aiming owns rotation/scale for both sprites. Tracked so a drag can cut
      // them dead: GSAP's auto-overwrite can't kill a tween that has not
      // rendered yet, which otherwise lets `arm()` keep writing scale over the
      // drag's own values for its first frames.
      let aimTweens: gsap.core.Tween[] = [];
      let isFlying = false;
      let isDragging = false;
      let isVisible = false;

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
      // Gradient flow: where the visible dashes start, which way they run, and
      // how far one colour cycle spans.
      let gradientPeriod = 0;
      let lineOrigin: Point = { x: 0, y: 0 };
      let lineDir: Point = { x: 1, y: 0 };
      let gradientPhase = 0;
      let dashOffset = 0;
      let dashSpeed = 0;
      // Flame-to-rocket separation at press; pull strength is measured as the
      // increase over this, so an accidental tap never fires a launch.
      let pressDist = 0;

      const measure = () => {
        const rect = canvas.getBoundingClientRect();
        W = rect.width;
        H = rect.height;
        diag = Math.hypot(W, H);
        gradientPeriod = diag * LINE_GRADIENT_PERIOD;
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

      // CSS handles the idle hover; this toggles play/pause without GSAP tick work.
      const setFloatActive = (active: boolean) => {
        canvas.dataset.paused = active ? "false" : "true";
      };

      const resumeFloatIfVisible = () => {
        if (isVisible && !isFlying && !isDragging) {
          setFloatActive(true);
        }
      };

      const setRestPose = () => {
        gsap.set([rocket, flame], {
          x: 0,
          y: 0,
          scale: 1,
          rotation: REST_ROTATION,
          autoAlpha: 1,
        });
        gsap.set(burst, {
          x: 0,
          y: 0,
          scaleX: 1,
          rotation: STRETCH_AXIS_ROTATION,
        });
        gsap.set(line, { autoAlpha: 0 });
      };

      // Charge tremble: a single looping tween re-randomises its target every
      // cycle, reading its amplitude live so the drag can dial it up and the
      // impact can cut it dead.
      const charge = { amp: 0 };

      const startTremble = () => {
        trembleTween?.kill();
        gsap.set(burst, { x: 0, y: 0 });
        trembleTween = gsap.to(burst, {
          x: () => gsap.utils.random(-charge.amp, charge.amp),
          y: () => gsap.utils.random(-charge.amp, charge.amp),
          duration: 0.04,
          repeat: -1,
          repeatRefresh: true,
          ease: "none",
        });
      };

      const stopTremble = () => {
        trembleTween?.kill();
        trembleTween = null;
        charge.amp = 0;
        gsap.set(burst, { x: 0, y: 0 });
      };

      const killAimTweens = () => {
        aimTweens.forEach((t) => t.kill());
        aimTweens = [];
      };

      // Slide the gradient's origin along the line. With spreadMethod="repeat"
      // and a colour cycle that starts and ends on the same green, advancing
      // the origin makes the colours travel toward the rocket seamlessly.
      const applyLineGradient = () => {
        const shift = gradientPhase * gradientPeriod;
        const ox = lineOrigin.x + lineDir.x * shift;
        const oy = lineOrigin.y + lineDir.y * shift;

        gradient.setAttribute("x1", String(ox));
        gradient.setAttribute("y1", String(oy));
        gradient.setAttribute("x2", String(ox + lineDir.x * gradientPeriod));
        gradient.setAttribute("y2", String(oy + lineDir.y * gradientPeriod));
      };

      // Integrated per tick rather than tweened: the dash march has to change
      // speed continuously as the pull changes, which a fixed-duration tween
      // cannot express.
      const onFlowTick = (_time: number, deltaMs: number) => {
        const dt = deltaMs / 1000;

        gradientPhase = (gradientPhase + dt / LINE_GRADIENT_CYCLE) % 1;
        applyLineGradient();

        // A positive dashoffset walks the pattern back toward the path's start
        // — the flame end — so the dashes travel right-to-left.
        dashOffset += dashSpeed * dt;
        line.style.strokeDashoffset = String(dashOffset);
      };

      const startLineFlow = () => {
        if (flowActive) return;
        flowActive = true;
        gsap.ticker.add(onFlowTick);
      };

      const stopLineFlow = () => {
        if (!flowActive) return;
        gsap.ticker.remove(onFlowTick);
        flowActive = false;
        gradientPhase = 0;
        dashOffset = 0;
        dashSpeed = 0;
        line.style.strokeDashoffset = "0";
      };

      // Current flame centre in canvas px (rest position + drag offset).
      const flameCenter = (): Point => ({
        x: flameRestPx.x + (gsap.getProperty(flame, "x") as number),
        y: flameRestPx.y + (gsap.getProperty(flame, "y") as number),
      });

      // Distance from `origin` along `rad` until the rocket has fully left the
      // card, so the flight covers what it needs to and no more.
      const exitDistance = (origin: Point, rad: number) => {
        const dx = Math.cos(rad);
        const dy = Math.sin(rad);
        const hits: number[] = [];

        if (Math.abs(dx) > 1e-6) {
          hits.push(((dx > 0 ? bounds.right : bounds.left) - origin.x) / dx);
        }
        if (Math.abs(dy) > 1e-6) {
          hits.push(((dy > 0 ? bounds.bottom : bounds.top) - origin.y) / dy);
        }

        const edge = hits.length ? Math.min(...hits) : diag;
        return Math.max(edge, 0) + rocketWpx * 0.5;
      };

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

      // The flame swells as it charges.
      const flameScaleForDist = (dist: number) =>
        ARMED_SCALE * (1 + FLAME_CHARGE_GROWTH * pullStrength(dist));

      const updateAiming = (immediate = false) => {
        const fc = flameCenter();
        const angle = headingDeg(fc);
        const dist = Math.hypot(rocketArmedPx.x - fc.x, rocketArmedPx.y - fc.y);
        const rocketScale = rocketScaleForDist(dist);
        const flameScale = flameScaleForDist(dist);
        const rocketRotation = angle + SPRITE_AXIS_OFFSET;

        const pull = pullStrength(dist);

        // The harder the pull, the harder the rocket strains against it and the
        // faster the dashes race back down the line.
        charge.amp = pull * rocketWpx * TREMBLE_DRAG;
        dashSpeed =
          diag * (DASH_SPEED_MIN + pull * (DASH_SPEED_MAX - DASH_SPEED_MIN));

        if (immediate) {
          killAimTweens();
          gsap.set(rocket, { rotation: rocketRotation, scale: rocketScale });
          gsap.set(flame, { rotation: rocketRotation, scale: flameScale });
        } else {
          aimTweens = [
            gsap.to(rocket, {
              rotation: rocketRotation,
              scale: rocketScale,
              duration: 0.15,
              ease: "power1.out",
              overwrite: "auto",
            }),
            gsap.to(flame, {
              rotation: rocketRotation,
              scale: flameScale,
              duration: 0.22,
              ease: "power2.out",
              overwrite: "auto",
            }),
          ];
        }

        // Dashed line floats between the two, detached from both by the same
        // visual gap beyond each sprite's actual artwork.
        const flameEdge = FLAME_HEAD_EXTENT * FLAME_W * W * flameScale;
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
          // The gradient runs along the line itself, so it stays correct at
          // any drag angle rather than being fixed to the screen axes.
          lineOrigin = { x: x1, y: y1 };
          lineDir = { x: Math.cos(rad), y: Math.sin(rad) };
          applyLineGradient();
          gsap.set(line, { autoAlpha: 1 });
        } else {
          gsap.set(line, { autoAlpha: 0 });
        }
      };

      const arm = () => {
        measure();
        setFloatActive(false);
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
        gsap.to(flame, { autoAlpha: 1, duration: 0.25, ease: "power2.out" });
        startTremble();
        startLineFlow();
        updateAiming();
      };

      const settleBack = () => {
        stopTremble();
        stopLineFlow();
        killAimTweens();
        gsap.to(line, { autoAlpha: 0, duration: 0.15 });
        gsap.to([rocket, flame], {
          x: 0,
          y: 0,
          scale: 1,
          rotation: REST_ROTATION,
          autoAlpha: 1,
          duration: 0.55,
          ease: "elastic.out(1, 0.6)",
          overwrite: "auto",
          onComplete: resumeFloatIfVisible,
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
        killAimTweens();
        stopLineFlow();

        const power = pullStrength(dist);
        const angle = headingDeg(fc);
        const rad = toRad(angle);
        const rot = angle + SPRITE_AXIS_OFFSET;
        const rocketScale = rocketScaleForDist(dist);

        // Travel only as far as it takes to leave the card: the pull buys speed,
        // not distance. (A fixed travel distance is what made every launch come
        // out at the same excessive speed.)
        const travel = exitDistance(rocketArmedPx, rad);

        // The rocket loads backwards while the flame slams home, so the burst
        // launches out of visible tension instead of from a standstill.
        const load = rocketWpx * rocketScale * LOAD_BACK * (0.5 + 0.5 * power);
        const loadX = -Math.cos(rad) * load;
        const loadY = -Math.sin(rad) * load;

        // Speed comes from the pull, and is the velocity on the launch's very
        // first frame because the ease is front-loaded. (`power2.in` here would
        // instead start at zero velocity, which made the release feel like a
        // delay rather than a launch.)
        const speed =
          diag * (BURST_SPEED_MIN + power * (BURST_SPEED_MAX - BURST_SPEED_MIN));
        const burstDuration = gsap.utils.clamp(
          0.25,
          1,
          (BURST_VELOCITY_FACTOR * travel) / speed,
        );
        const stretch = 1 + power * BURST_STRETCH;

        // Where the flame docks on the loaded rocket's tail (fix #4).
        const dock = anchorOffset(rot, rocketWpx * rocketScale);
        const dockX = rocketArmedPx.x + loadX + dock.x - flameRestPx.x;
        const dockY = rocketArmedPx.y + loadY + dock.y - flameRestPx.y;

        gsap.set(line, { autoAlpha: 0 });

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
              if (isVisible) {
                draggable?.enable();
              }
              resumeFloatIfVisible();
            },
          })
          // The flame slams home as the rocket loads back and revs to a peak...
          .to(
            flame,
            {
              x: dockX,
              y: dockY,
              scale: rocketScale,
              rotation: rot,
              duration: SLAM_DURATION,
              ease: "power3.in",
              overwrite: "auto",
            },
            0,
          )
          .to(
            rocket,
            {
              x: rocketArmedPx.x + loadX - rocketRestPx.x,
              y: rocketArmedPx.y + loadY - rocketRestPx.y,
              // Aim from the release heading, not from whatever the last drag
              // frame set: a quick flick moves the pointer after the final
              // onDrag, which would otherwise fly the rocket sideways.
              rotation: rot,
              autoAlpha: 1,
              duration: SLAM_DURATION,
              ease: "power2.in",
            },
            0,
          )
          .to(
            charge,
            {
              amp: rocketWpx * TREMBLE_PEAK * (0.3 + 0.7 * power),
              duration: SLAM_DURATION,
              ease: "power2.in",
            },
            0,
          )
          // ...IMPACT: the rev cuts dead and every bit of it goes into one
          // burst that is already at full speed on its first frame.
          .call(stopTremble)
          .to([rocket, flame], {
            x: `+=${Math.cos(rad) * travel}`,
            y: `+=${Math.sin(rad) * travel}`,
            duration: burstDuration,
            ease: BURST_EASE,
          })
          // Stretched along its own axis by the acceleration, easing off as it
          // clears the card.
          .to(burst, { scaleX: stretch, duration: 0.07, ease: "power2.out" }, "<")
          .to(
            burst,
            { scaleX: 1, duration: burstDuration * 0.55, ease: "power1.inOut" },
            "<0.07",
          )
          // Reassemble just off the rest pose, faded out...
          .set([rocket, flame], {
            x: offX,
            y: offY,
            scale: 1,
            rotation: REST_ROTATION,
            autoAlpha: 0,
          })
          .set(burst, { x: 0, y: 0, scaleX: 1 })
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
        setFloatActive(false);
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        measure();
        setRestPose();
        setFloatActive(false);

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
            updateAiming(true);
          },
          onRelease() {
            isDragging = false;
            if (isFlying) return;
            launch();
          },
        });
        draggable = instance;
        instance.disable();

        const observer = new IntersectionObserver(
          ([entry]) => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
              if (!isFlying && !isDragging) {
                instance.enable();
                setFloatActive(true);
              }
            } else {
              setFloatActive(false);
              stopTremble();
              stopLineFlow();
              instance.disable();
            }
          },
          { rootMargin: "120px" },
        );
        observer.observe(canvas);

        const onResize = () => {
          if (isFlying || isDragging) return;
          measure();
        };
        window.addEventListener("resize", onResize);

        return () => {
          observer.disconnect();
          window.removeEventListener("resize", onResize);
          instance.kill();
          draggable = null;
          setFloatActive(false);
          stopTremble();
          stopLineFlow();
          flightTl?.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: canvasRef },
  );

  return (
    <div className="flex w-full max-w-[488px] shrink-0 flex-col items-center">
      <div
        ref={canvasRef}
        data-reveal
        data-paused="true"
        className="rocket-slingshot-canvas relative w-full"
        // The 488x456 aspect ratio is load-bearing for the drag/launch geometry
        // (all rest/armed poses are fractions of it), but the flame art bottoms
        // out at ~79% of the canvas, leaving a dead strip below the rocket. Pull
        // the label up into that strip so it hugs the rocket per the Figma
        // design. The offset is a % of width, so it scales with the canvas.
        style={{ aspectRatio: "488 / 456", marginBottom: "-14%" }}
      >
        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Same ramp as the "inspire life" heading. It closes on the opening
                green so spreadMethod="repeat" tiles without a visible seam. */}
            <linearGradient
              ref={gradientRef}
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              spreadMethod="repeat"
            >
              <stop offset="0" style={{ stopColor: "var(--green-600)" }} />
              <stop offset="0.25" style={{ stopColor: "var(--blue-600)" }} />
              <stop offset="0.5" style={{ stopColor: "var(--yellow-600)" }} />
              <stop offset="0.75" style={{ stopColor: "var(--purple-600)" }} />
              <stop offset="1" style={{ stopColor: "var(--green-600)" }} />
            </linearGradient>
          </defs>
          <path
            ref={lineRef}
            fill="none"
            stroke={`url(#${gradientId})`}
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
          <div className="rocket-slingshot-float size-full">
            {/* Tremble + thrust-axis stretch. The sprite's nose points up-right
                at 45deg, so rotating -45, scaling x, then rotating +45 back on
                the child stretches the rocket along its own length. */}
            <div ref={rocketBurstRef} className="size-full">
              <div className="size-full" style={{ transform: "rotate(45deg)" }}>
                <picture className="size-full">
                  <source srcSet={assetPath("/home/rocket-body.webp")} type="image/webp" />
                  <img
                    src={assetPath("/home/rocket-body.png")}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    width={1384}
                    height={1388}
                    className="size-full select-none"
                  />
                </picture>
              </div>
            </div>
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
          <div className="rocket-slingshot-float-flame size-full">
            <picture className="size-full">
              <source srcSet={assetPath("/home/flame.webp")} type="image/webp" />
              <img
                src={assetPath("/home/flame.png")}
                alt=""
                aria-hidden="true"
                draggable={false}
                loading="lazy"
                decoding="async"
                width={416}
                height={416}
                className="pointer-events-none size-full"
              />
            </picture>
          </div>
        </div>
      </div>

      <p
        data-reveal
        className="type-body-sm text-center font-semibold"
        style={{ color: "var(--text-on-inverse)" }}
      >
        Drag the flame to launch YuLife!
      </p>
    </div>
  );
}
