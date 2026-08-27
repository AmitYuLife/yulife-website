"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCoinAssets, COIN_RADIUS } from "./assets";

// Visible meshes opt out of pointer raycasting; the invisible proxy disc
// below is the only hit target, so mousemove never ray-tests the
// high-poly engraving.
const NO_RAYCAST = () => null;

export interface YuCoinProps {
  position?: [number, number, number];
  /** Uniform scale of this coin (radius is 1 world unit at scale 1). */
  scale?: number;
  /** Resting pose in radians; the default matches the brand 3/4 view. */
  baseTilt?: [x: number, y: number];
  /** 0 disables cursor-follow; 1 is the default subtle strength. */
  pointerTilt?: number;
  /** Multiplier on pointer tilt range (default 1). */
  pointerSens?: number;
  /** When true, pointer tilt only applies while this coin is hovered. */
  pointerOnHoverOnly?: boolean;
  /** Amplitude of the idle vertical bob; 0 disables float. */
  idle?: number;
  /** Multiplier on idle bob distance (default 1). */
  idleFloat?: number;
  /** Amplitude of idle rotation drift; 0 keeps the resting pose still. */
  idleRotation?: number;
  /** Scale multiplier while the cursor is over the coin. */
  hoverScale?: number;
  /** Offsets the idle animation so multiple coins don't move in sync. */
  phase?: number;
  /** Resting roll in radians (Z axis). */
  baseRoll?: number;
  /** Optional [min, max] clamps applied after pointer/idle offsets (radians). */
  tiltLimits?: { x?: [number, number]; y?: [number, number] };
  /**
   * Render the reverse face and engraving. Disable when the coin can never
   * turn past ~90° (as in the hero pose) to halve its heaviest geometry.
   */
  backFace?: boolean;
}

export default function YuCoin({
  position,
  scale = 1,
  baseTilt = [-0.06, 0.45],
  pointerTilt = 1,
  pointerSens = 1,
  pointerOnHoverOnly = false,
  idle = 1,
  idleFloat = 1,
  idleRotation = 1,
  hoverScale = 1.04,
  phase = 0,
  baseRoll = 0,
  tiltLimits,
  backFace = true,
}: YuCoinProps) {
  const group = useRef<THREE.Group>(null);
  const baseTiltRef = useRef(baseTilt);
  const baseRollRef = useRef(baseRoll);
  const time = useRef(phase);
  const localPointer = useRef({ x: 0, y: 0 });
  const hoverMix = useRef(0);
  const [hovered, setHovered] = useState(false);
  baseTiltRef.current = baseTilt;
  baseRollRef.current = baseRoll;

  useLayoutEffect(() => {
    const g = group.current;
    if (!g) return;
    g.rotation.set(baseTilt[0], baseTilt[1], baseRoll);
    g.position.y = 0;
    g.scale.setScalar(1);
  }, [baseTilt, baseRoll]);
  const assets = useMemo(getCoinAssets, []);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const restingTilt = baseTiltRef.current;
    const restingRoll = baseRollRef.current;

    if (reducedMotion) {
      const clampAxis = (value: number, limits?: [number, number]) =>
        limits ? THREE.MathUtils.clamp(value, limits[0], limits[1]) : value;
      g.rotation.set(
        clampAxis(restingTilt[0], tiltLimits?.x),
        clampAxis(restingTilt[1], tiltLimits?.y),
        restingRoll,
      );
      return;
    }
    // Trust nothing from outside the design range: the frameloop pause/resume
    // hands us a giant delta and resets the clock, and captured-pointer events
    // during scroll report coordinates far outside the canvas. Cap the
    // timestep, keep our own idle clock, and clamp the pointer so the tilt
    // can never leave its intended bounds.
    const dt = Math.min(delta, 0.1);
    time.current += dt;
    const t = time.current;

    hoverMix.current = THREE.MathUtils.damp(
      hoverMix.current,
      hovered ? 1 : 0,
      10,
      dt,
    );

    if (pointerOnHoverOnly) {
      if (!hovered) {
        localPointer.current.x = THREE.MathUtils.damp(localPointer.current.x, 0, 8, dt);
        localPointer.current.y = THREE.MathUtils.damp(localPointer.current.y, 0, 8, dt);
      }
    } else {
      localPointer.current.x = THREE.MathUtils.clamp(state.pointer.x, -1, 1);
      localPointer.current.y = THREE.MathUtils.clamp(state.pointer.y, -1, 1);
    }

    const pointerStrength = pointerOnHoverOnly ? hoverMix.current : 1;
    const px = localPointer.current.x * pointerStrength * pointerTilt;
    const py = localPointer.current.y * pointerStrength * pointerTilt;
    const sens = pointerSens;

    const targetY =
      restingTilt[1] + px * 0.28 * sens + Math.sin(t * 0.5) * 0.05 * idle * idleRotation;
    const targetX =
      restingTilt[0] - py * 0.24 * sens + Math.cos(t * 0.7) * 0.04 * idle * idleRotation;
    const clampAxis = (value: number, limits?: [number, number]) =>
      limits ? THREE.MathUtils.clamp(value, limits[0], limits[1]) : value;
    g.rotation.y = THREE.MathUtils.damp(
      g.rotation.y,
      clampAxis(targetY, tiltLimits?.y),
      4,
      dt,
    );
    g.rotation.x = THREE.MathUtils.damp(
      g.rotation.x,
      clampAxis(targetX, tiltLimits?.x),
      4,
      dt,
    );
    g.rotation.z = restingRoll;
    const targetScale = hovered ? hoverScale : 1;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, targetScale, 6, dt));
    g.position.y = Math.sin(t * 0.85) * 0.065 * idle * idleFloat;
  });

  const trackPointer = (x: number, y: number) => {
    localPointer.current.x = THREE.MathUtils.clamp(x, -1, 1);
    localPointer.current.y = THREE.MathUtils.clamp(y, -1, 1);
  };

  return (
    <group position={position} scale={scale}>
      <group ref={group}>
        {/* Invisible hover hit target (never rendered, cheap to raycast) */}
        <mesh
          visible={false}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
          onPointerMove={(e) => {
            e.stopPropagation();
            trackPointer(e.pointer.x, e.pointer.y);
          }}
        >
          <circleGeometry args={[COIN_RADIUS * 1.05, 24]} />
        </mesh>

        {/* Body + face(s) share one material and are pre-baked to their final
            position — one draw call instead of up to three. */}
        <mesh
          geometry={backFace ? assets.goldBoth : assets.goldFrontOnly}
          material={assets.gold}
          raycast={NO_RAYCAST}
        />
        <mesh
          geometry={backFace ? assets.engraveBoth : assets.engraveFrontOnly}
          material={assets.goldEngrave}
          raycast={NO_RAYCAST}
        />
      </group>
    </group>
  );
}
