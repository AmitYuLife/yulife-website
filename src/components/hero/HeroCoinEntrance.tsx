"use client";

import { useLayoutEffect, useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HERO_COIN_EXIT_Y } from "./heroAssetLayout";
import type { HeroCoinEntrance as EntranceParams } from "./heroAssetLayout";

export type HeroCoinEntranceProps = {
  /** World-space launch point (phone centre) — coins sit here, hidden behind the phone. */
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

// Between quad and cubic: still bursts out fast, but the tail keeps enough
// speed that the settle-down into the slot doesn't crawl.
const easeOutFountain = (t: number) => 1 - Math.pow(1 - t, 2.2);

/**
 * Fountain entrance for one hero coin: launches from behind the phone mockup,
 * follows a gravity-style arc to its layout slot while tumbling in 3D, and
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
      g.position.set(origin[0], origin[1], origin[2]);
      g.scale.setScalar(entrance.fromScale);
    } else {
      g.position.set(target[0], target[1], target[2]);
      g.scale.setScalar(1);
    }
    tumbler.current?.rotation.set(0, 0, 0);
  }, [runId, play, origin, target, entrance.fromScale]);

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
      g.position.set(originX, originY, originZ);
      g.scale.setScalar(entrance.fromScale);
    }
  }, [originX, originY, originZ, targetX, targetY, targetZ, entrance.fromScale]);

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

    // Ease-out timing gives the fountain burst: the coin erupts from behind
    // the phone at speed and decelerates into its slot.
    const q = easeOutFountain(p);
    const [tx, ty, tz] = targetRef.current;

    // Cubic bezier fountain arc. C1 sits almost directly above the origin,
    // so the coin launches near-vertically out of the phone; C2 sits directly
    // above the slot, so the landing tangent is straight down — every coin
    // rises past its resting height and drops into place like a droplet.
    const c1x = originX + (tx - originX) * 0.15;
    const c1y = originY + entrance.arc;
    const c2x = tx;
    const c2y = ty + entrance.settle;
    const u = 1 - q;
    const uu = u * u;
    const qq = q * q;
    g.position.x = u * uu * originX + 3 * uu * q * c1x + 3 * u * qq * c2x + q * qq * tx;
    g.position.y = u * uu * originY + 3 * uu * q * c1y + 3 * u * qq * c2y + q * qq * ty;
    g.position.z = tz;

    // Tumble unwinds with the same easing: several fast flips as it emerges,
    // slowing until the face settles into the brand pose exactly on landing.
    const unwind = 1 - q;
    r.rotation.set(
      entrance.spinX * unwind,
      entrance.spinY * unwind,
      entrance.spinZ * unwind,
    );

    g.scale.setScalar(
      entrance.fromScale + (1 - entrance.fromScale) * Math.min(1, q * 1.6),
    );
  });

  return (
    <group ref={mover}>
      <group ref={tumbler}>{children}</group>
    </group>
  );
}
