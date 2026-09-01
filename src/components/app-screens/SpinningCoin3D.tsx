"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCoinAssets } from "@/components/three/yucoin/assets";
import {
  buildToonCoinGeometry,
  makeToonSheenMaterials,
  TOON_LIGHT_DIR,
  TOON_STREAK_AXIS,
  TOON_DRIVE_BASELINE,
  TOON_DRIVE_CENTRE_OFFSET,
  TOON_DRIVE_SCALE,
} from "@/components/three/yucoin/toonSheen";
import useVisibleFrameloop from "@/components/hooks/useVisibleFrameloop";

/** Radians per second of idle spin — slow, continuous, horizontal. */
const SPIN_SPEED = 0.9;

// The illustrated toon look (colours, shader, geometry) lives in
// three/yucoin/toonSheen.ts and is shared with the businesses-hero orbit. Here
// the sheen is driven in WORLD space: the plugin orbits its camera around a
// static coin, so the spin angle is fed in as an equivalent orbital view
// direction (see useFrame below) and the streak rolls across the coin as it
// turns.

function useIllustratedCoin() {
  return useMemo(() => {
    const { edges, faceFront, faceBack } = buildToonCoinGeometry();
    // One streak lights all three surfaces together — the band lines carry
    // straight across face -> bevel -> side as one unbroken diagonal. The
    // engrave geometry is the shared singleton from the 3D coin.
    const { faceMaterial, edgeMaterial, engraveMaterial } = makeToonSheenMaterials("world");
    return { edges, faceFront, faceBack, faceMaterial, edgeMaterial, engraveMaterial };
  }, []);
}

function SpinningGroup({
  paused,
  spinBoostRef,
  scaleBoostRef,
  syncAngleRef,
  reportAngleRef,
  onReady,
}: {
  paused: boolean;
  spinBoostRef: RefObject<number>;
  scaleBoostRef: RefObject<number>;
  syncAngleRef?: RefObject<number | null>;
  reportAngleRef?: RefObject<number>;
  onReady?: () => void;
}) {
  const spin = useRef<THREE.Group>(null);
  const coin = useIllustratedCoin();
  const assets = useMemo(getCoinAssets, []);
  const view = useMemo(() => new THREE.Vector3(), []);
  const readyRef = useRef(false);

  useFrame((_, delta) => {
    const g = spin.current;
    if (!g) return;
    // First rendered frame — the coin is now painted, so callers can reveal
    // whatever was waiting on it (the hero fades the phone in only now, so the
    // coin never pops in a beat after the phone).
    if (!readyRef.current) {
      readyRef.current = true;
      onReady?.();
    }
    g.scale.setScalar(scaleBoostRef.current);
    // One-time external rotation sync: a caller drops an angle here (e.g. the
    // hero hands the flying intro coin's angle to the phone's own coin) so this
    // coin continues from exactly there rather than blinking to its own angle.
    if (syncAngleRef && syncAngleRef.current != null) {
      g.rotation.y = syncAngleRef.current;
      syncAngleRef.current = null;
    } else if (!paused) {
      g.rotation.y += Math.min(delta, 0.1) * SPIN_SPEED * spinBoostRef.current;
    }
    // Expose the live angle so a caller can read it (for the hand-off above).
    if (reportAngleRef) reportAngleRef.current = g.rotation.y;

    // Spinning the coin by θ under a fixed camera is the plugin's orbiting
    // camera seen from the coin's frame: drive the streak from that
    // equivalent view direction so it sweeps as the coin turns.
    const theta = g.rotation.y;
    view.set(Math.sin(-theta), 0, Math.cos(-theta));
    const half = view.add(TOON_LIGHT_DIR).normalize();
    const alignment = half.x * TOON_STREAK_AXIS.x + half.y * TOON_STREAK_AXIS.y;
    const drive =
      (alignment - TOON_DRIVE_BASELINE) * TOON_DRIVE_SCALE + TOON_DRIVE_CENTRE_OFFSET;
    coin.faceMaterial.uniforms.uDrive.value = drive;
    coin.edgeMaterial.uniforms.uDrive.value = drive;
    coin.engraveMaterial.uniforms.uDrive.value = drive;
  });

  return (
    <group ref={spin} rotation={[-0.06, 0, 0]}>
      {coin.edges.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={coin.edgeMaterial} />
      ))}
      <mesh geometry={coin.faceFront} material={coin.faceMaterial} />
      <mesh geometry={coin.faceBack} material={coin.faceMaterial} />
      <mesh geometry={assets.engraveBoth} material={coin.engraveMaterial} />
    </group>
  );
}

/**
 * The illustrated YuCoin in 3D, spinning slowly on its Y axis as the screen's
 * idle state. Look and sheen are the toon shader from the YuCoin Figma plugin
 * (yucoin-figma-plugin): two flat diagonal highlight bands sweeping the face,
 * rim and engrave as one streak. No lighting rig — the shader is
 * self-contained. Rendering pauses entirely offscreen.
 *
 * `spinBoostRef` is a live multiplier on the spin speed (1 = idle) and
 * `scaleBoostRef` a live multiplier on the coin's size (1 = idle) — both read
 * fresh every frame rather than passed as re-rendering props, so the
 * CollectButton press/release can drive them without triggering React
 * renders.
 */
export default function SpinningCoin3D({
  className,
  spinBoostRef,
  scaleBoostRef,
  syncAngleRef,
  reportAngleRef,
  alwaysRender = false,
  onReady,
}: {
  className?: string;
  spinBoostRef?: RefObject<number>;
  scaleBoostRef?: RefObject<number>;
  /** Drop an angle (radians) here to jump the coin's spin to it once, then it's
   * consumed (set back to null). Used to hand a spin position between two coin
   * instances without a visible reset. */
  syncAngleRef?: RefObject<number | null>;
  /** The coin writes its live spin angle (radians) here every frame. */
  reportAngleRef?: RefObject<number>;
  /** Force the render loop to keep running even while offscreen. The default
   * pauses offscreen for perf; a caller animating the coin *through* the
   * viewport edge (e.g. the hero intro flight) needs it to keep spinning. */
  alwaysRender?: boolean;
  /** Fired once, on the first rendered frame — the coin is now on screen. */
  onReady?: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const visibleFrameloop = useVisibleFrameloop(wrapRef);
  const frameloop = alwaysRender ? "always" : visibleFrameloop;
  const ownBoostRef = useRef(1);
  const ownScaleRef = useRef(1);
  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  return (
    <div ref={wrapRef} className={`relative ${className ?? ""}`}>
      {/* Sized larger than the layout box (which stays fixed for flex
          spacing) and centred over it, so the press/release scale bounce has
          headroom to render past the coin's resting silhouette without being
          clipped at the canvas edge. */}
      <div className="absolute left-1/2 top-1/2 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2">
        <Canvas
          orthographic
          camera={{ position: [0, 0, 500], near: 0.1, far: 1000, zoom: 72 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
          frameloop={frameloop}
          style={{ overflow: "visible" }}
          // react-use-measure defaults to getBoundingClientRect, which reports
          // this container's *post-transform* size — inflated by
          // AppScreenFrame's CSS scale() on every ancestor chain. Canvas then
          // applies that oversized width/height as its own inline style, and
          // the same ancestor transform scales it again, so the coin renders
          // larger than its box and off-centre. offsetSize reads the
          // pre-transform layout size instead, which is what Canvas needs.
          resize={{ offsetSize: true }}
        >
          <SpinningGroup
            paused={reducedMotion}
            spinBoostRef={spinBoostRef ?? ownBoostRef}
            scaleBoostRef={scaleBoostRef ?? ownScaleRef}
            syncAngleRef={syncAngleRef}
            reportAngleRef={reportAngleRef}
            onReady={onReady}
          />
        </Canvas>
      </div>
    </div>
  );
}
