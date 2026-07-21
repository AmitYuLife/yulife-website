"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { HeroCoinEntrance as EntranceParams } from "./heroAssetLayout";

export type HeroCoinEntranceProps = {
  /** World-space launch point (phone centre) — coins sit here, hidden behind the phone. */
  origin: [number, number, number];
  /** World-space resting position (the coin's scattered layout slot). */
  target: [number, number, number];
  entrance: EntranceParams;
  /** False skips the flight entirely (reduced motion, post-resize rebuilds). */
  play: boolean;
  /** Fires once when this coin lands. */
  onLanded?: () => void;
  children: ReactNode;
};

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Fountain entrance for one hero coin: launches from behind the phone mockup,
 * follows a gravity-style arc to its layout slot while tumbling in 3D, and
 * hands off to YuCoin's idle bob/pointer logic the moment it lands.
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
  const targetRef = useRef(target);
  targetRef.current = target;

  useLayoutEffect(() => {
    const g = mover.current;
    if (!g) return;
    if (done.current) {
      // Not animating (or already landed): track the layout slot directly so
      // resize rebuilds reposition landed coins without replaying the flight.
      g.position.set(target[0], target[1], target[2]);
      g.scale.setScalar(1);
      tumbler.current?.rotation.set(0, 0, 0);
    } else {
      g.position.set(origin[0], origin[1], origin[2]);
      g.scale.setScalar(entrance.fromScale);
    }
  }, [origin, target, entrance.fromScale]);

  useFrame((_, delta) => {
    const g = mover.current;
    const r = tumbler.current;
    if (!g || !r || done.current) return;

    time.current += Math.min(delta, 0.1);
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
    const q = easeOutCubic(p);
    const [tx, ty, tz] = targetRef.current;

    // Quadratic bezier arc. The control point sits above a point ~35% along
    // the origin→target line, so the rise is steep (straight up out of the
    // phone) and the descent curls over the apex down onto the slot.
    const cx = origin[0] + (tx - origin[0]) * 0.35;
    const cy = origin[1] + (ty - origin[1]) * 0.35 + entrance.arc;
    const u = 1 - q;
    g.position.x = u * u * origin[0] + 2 * u * q * cx + q * q * tx;
    g.position.y = u * u * origin[1] + 2 * u * q * cy + q * q * ty;
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
