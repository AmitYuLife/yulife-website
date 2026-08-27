"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FLIGHT_Z_MERGE_START, HERO_COIN_EXIT_Y } from "./heroAssetLayout";
import type { HeroCoinEntrance as EntranceParams } from "./heroAssetLayout";

export type HeroCoinEntranceProps = {
  /**
   * World-space phone centre. Each coin's actual launch point is this plus its
   * own `launchOffsetX/Y`, which fan the jet across and up the mockup's body —
   * still behind it, so nothing is visible until it clears the edge.
   */
  origin: [number, number, number];
  /** World-space resting position (the coin's scattered layout slot). */
  target: [number, number, number];
  entrance: EntranceParams;
  /** False skips the flight entirely (reduced motion, post-resize rebuilds). */
  play: boolean;
  /**
   * Gravity switch: while true the coin drops from wherever it currently is,
   * accelerating out of the bottom of the canvas, then hides.
   */
  exit?: boolean;
  /**
   * Increments for each re-show after a gravity drop. The SAME mounted coin
   * (same meshes, same shared geometry) resets its flight state and replays
   * the fountain — nothing is ever spawned on top of the previous run.
   */
  runId?: number;
  /** Fires once when this coin lands. */
  onLanded?: () => void;
  children: ReactNode;
};

/** Fraction of the flight spent on the ballistic launch, before the catch. */
const CATCH_START = 0.55;

/**
 * Linear through the launch and apex — the arc is a real parabola, so gravity's
 * own slow-down sets the pace there — then a cubic Hermite "catch" over the last
 * stretch. The catch enters at exactly the linear speed and arrives at exactly
 * zero, so the coin decelerates into its slot instead of stopping dead.
 *
 * A power ease (the obvious `1-(1-t)^n`) can't do this: its velocity collapses
 * only in the final instants, so the coin is still travelling ~300px/s at 98% of
 * the flight and then snaps. This lands at ~0px/s with less than half the peak
 * deceleration, and keeps the apex near the middle of the flight rather than
 * blowing past it in the first third.
 */
const easeFlight = (t: number) => {
  if (t < CATCH_START) return t;
  const span = 1 - CATCH_START;
  const u = (t - CATCH_START) / span;
  // G(u) = -u³ + u² + u: G(0)=0, G'(0)=1, G(1)=1, G'(1)=0.
  return CATCH_START + span * (u * (1 + u * (1 - u)));
};
/**
 * Horizontal progress runs AHEAD of the flight (entrance.spread is below 1), so
 * the coin is carried out past the phone early and crests late — a long outward
 * sweep rather than a tall narrow jet. Per-coin, so trajectories diverge instead
 * of the cohort travelling as one clump.
 */
const easeSpread = (s: number, exponent: number) => Math.pow(s, exponent);

/**
 * Fountain entrance for one hero coin: thrown up from behind the phone mockup,
 * follows a ballistic arc to its layout slot while tumbling in 3D, and
 * hands off to YuCoin's idle bob/pointer logic the moment it lands. When
 * `exit` flips on, the coin free-falls out of the band instead.
 *
 * Split across two groups so translation+scale (outer) compose cleanly with
 * the tumble (inner) — the tumble unwinds to exactly zero, leaving YuCoin's
 * own baseTilt as the landed pose.
 */
export default function HeroCoinEntrance({
  origin,
  target,
  entrance,
  play,
  exit = false,
  runId = 0,
  onLanded,
  children,
}: HeroCoinEntranceProps) {
  const mover = useRef<THREE.Group>(null);
  const tumbler = useRef<THREE.Group>(null);
  // Own clock accumulated from capped deltas: survives the visible-frameloop
  // pause/resume without the entrance "completing" while off screen.
  const time = useRef(0);
  const done = useRef(!play);
  const landedNotified = useRef(!play);
  const fallElapsed = useRef(0);
  const fallVelocity = useRef(0);
  const falling = useRef(false);
  const gone = useRef(false);
  const targetRef = useRef(target);
  targetRef.current = target;
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Recycle this instance for a new run: same groups and meshes, flight
  // state zeroed. Runs before the slot-tracking effect below so `done`/`gone`
  // reflect the new run when it fires.
  const lastRunRef = useRef(runId);
  useLayoutEffect(() => {
    if (lastRunRef.current === runId) return;
    lastRunRef.current = runId;

    time.current = 0;
    fallElapsed.current = 0;
    fallVelocity.current = 0;
    falling.current = false;
    gone.current = false;
    done.current = !play;
    landedNotified.current = !play;

    const g = mover.current;
    if (!g) return;
    g.visible = true;
    if (play) {
      g.position.set(
        origin[0] + entrance.launchOffsetX,
        origin[1] + entrance.launchOffsetY,
        origin[2],
      );
      g.scale.setScalar(entrance.fromScale);
    } else {
      g.position.set(target[0], target[1], target[2]);
      g.scale.setScalar(1);
    }
    tumbler.current?.rotation.set(0, 0, 0);
  }, [
    runId,
    play,
    origin,
    target,
    entrance.fromScale,
    entrance.launchOffsetX,
    entrance.launchOffsetY,
  ]);

  // Scalar deps: the origin/target ARRAYS get a fresh identity every parent
  // render, and re-running this on unrelated renders (like the gravity
  // toggle) would teleport a mid-entrance coin back to the origin the moment
  // the drop begins. With scalars it fires only when a slot genuinely moves.
  const [originX, originY, originZ] = origin;
  const [targetX, targetY, targetZ] = target;

  useLayoutEffect(() => {
    const g = mover.current;
    // Never reposition a coin gravity already owns — it falls from wherever
    // it is, even if a resize moves its (now irrelevant) layout slot.
    if (!g || gone.current || falling.current) return;
    if (done.current) {
      // Not animating (or already landed): track the layout slot directly so
      // resize rebuilds reposition landed coins without replaying the flight.
      g.position.set(targetX, targetY, targetZ);
      g.scale.setScalar(1);
      tumbler.current?.rotation.set(0, 0, 0);
    } else {
      g.position.set(
        originX + entrance.launchOffsetX,
        originY + entrance.launchOffsetY,
        originZ,
      );
      g.scale.setScalar(entrance.fromScale);
    }
  }, [
    originX,
    originY,
    originZ,
    targetX,
    targetY,
    targetZ,
    entrance.fromScale,
    entrance.launchOffsetX,
    entrance.launchOffsetY,
  ]);

  useFrame((_, delta) => {
    const g = mover.current;
    const r = tumbler.current;
    if (!g || !r) return;

    const dt = Math.min(delta, 0.1);

    if (exit) {
      if (gone.current) return;
      // Interrupting a mid-flight entrance is fine: the drop starts from the
      // coin's current transform, and the entrance never resumes (the next
      // show recycles this instance via runId).
      done.current = true;
      falling.current = true;
      if (reducedMotion) {
        g.visible = false;
        gone.current = true;
        return;
      }
      fallElapsed.current += dt;
      if (fallElapsed.current < entrance.exitDelay) return;
      fallVelocity.current += entrance.exitGravity * dt;
      g.position.y -= fallVelocity.current * dt;
      // Tip face-down into the fall so the coin reads as dragged by gravity.
      // Pitch is damped toward a per-coin limit well short of 90° — the
      // reverse face has no geometry at rest and must never come around.
      r.rotation.x = THREE.MathUtils.damp(
        r.rotation.x,
        entrance.exitPitch,
        4.5,
        dt,
      );
      // Straighten any leftover entrance yaw; a light roll keeps it lively.
      r.rotation.y = THREE.MathUtils.damp(r.rotation.y, 0, 4, dt);
      r.rotation.z += entrance.exitDrift * dt;
      if (g.position.y < HERO_COIN_EXIT_Y) {
        g.visible = false;
        gone.current = true;
      }
      return;
    }

    if (done.current) return;

    time.current += dt;
    const p = THREE.MathUtils.clamp(
      (time.current - entrance.delay) / entrance.duration,
      0,
      1,
    );

    if (p >= 1) {
      const [tx, ty, tz] = targetRef.current;
      g.position.set(tx, ty, tz);
      g.scale.setScalar(1);
      r.rotation.set(0, 0, 0);
      done.current = true;
      if (!landedNotified.current) {
        landedNotified.current = true;
        onLanded?.();
      }
      return;
    }

    const s = easeFlight(p);
    const [tx, ty, tz] = targetRef.current;

    // Projectile arc: straight origin→slot travel plus a parabolic bump whose
    // height (entrance.arc, derived in heroAssetLayout from the clearance each
    // coin needs) puts the apex above BOTH ends. So the coin is always thrown
    // up out of the phone first and always curves back down into its slot,
    // whether that slot sits above or below the launch point.
    const launchX = originX + entrance.launchOffsetX;
    const launchY = originY + entrance.launchOffsetY;
    g.position.x = launchX + (tx - launchX) * easeSpread(s, entrance.spread);
    g.position.y = launchY + (ty - launchY) * s + entrance.arc * 4 * s * (1 - s);
    // Hold this coin's depth lane while the jet is bunched, then merge back to
    // the layout plane once the coins have fanned out to their own airspace.
    // Lanes shrink proportionally, so the front-to-back order never swaps
    // mid-merge — and by z=0 the slots' own spacing keeps them clear.
    const laneHold =
      1 - Math.min(1, Math.max(0, (s - FLIGHT_Z_MERGE_START) / (1 - FLIGHT_Z_MERGE_START)));
    g.position.z = tz + entrance.flightZ * laneHold;

    // Tumble unwinds with the flight: several fast flips as it emerges,
    // slowing until the face settles into the brand pose exactly on landing.
    const unwind = 1 - s;
    r.rotation.set(
      entrance.spinX * unwind,
      entrance.spinY * unwind,
      entrance.spinZ * unwind,
    );

    // Full size early in the hidden climb. The growth is only a depth cue for
    // emerging from behind the mockup — and the outermost coins in the fan can
    // crest near its corners quite early, so it has to be done before then.
    g.scale.setScalar(
      entrance.fromScale + (1 - entrance.fromScale) * Math.min(1, s * 5),
    );
  });

  return (
    <group ref={mover}>
      <group ref={tumbler}>{children}</group>
    </group>
  );
}
