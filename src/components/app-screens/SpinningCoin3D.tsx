"use client";

import { useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getCoinAssets } from "@/components/three/yucoin/assets";
import useVisibleFrameloop from "@/components/hooks/useVisibleFrameloop";

/** Radians per second of idle spin — slow, continuous, horizontal. */
const SPIN_SPEED = 0.9;

// ─── Illustrated toon sheen ──────────────────────────────────────────────────
// Ported from the YuCoin Figma plugin (yucoin-figma-plugin, src/ui/Coin.jsx),
// which is the source of truth for this look: every constant below was
// measured there directly off the reference illustration (Figma: Illustration
// Library, node 18205:130). Each surface has a base colour and the lighter
// colour the sheen swaps in; the rim's pair is what makes the streak read as
// continuing over the coin's edge.
const TOON_FACE_COLOR = "#FFE242";
const TOON_FACE_LIT_COLOR = "#FEF399";
const TOON_RIM_COLOR = "#F99E02";
const TOON_RIM_LIT_COLOR = "#F9B80D";
const TOON_LINE_COLOR = "#FA9E00";
const TOON_LINE_LIT_COLOR = "#FAC118";

// Direction toward the nominal key light. The plugin orbits its camera around
// a static coin; here the coin spins under a fixed camera, so the spin angle
// is fed in as an equivalent orbital view direction (see useFrame below) and
// the streak rolls across the coin as it turns.
const TOON_LIGHT_DIR = new THREE.Vector3(4, 6, 5).normalize();

// Fixed 45° streak, measured off the reference. The axis is the band's
// *normal*, so -45° puts the band itself on the bottom-left-to-top-right
// diagonal the reference uses.
const TOON_STREAK_ANGLE = -Math.PI / 4;
const TOON_STREAK_AXIS = new THREE.Vector2(
  Math.cos(TOON_STREAK_ANGLE),
  Math.sin(TOON_STREAK_ANGLE),
);

// Two parallel bands: wide band, thin unlit gap, narrow band — widths as
// fractions of the face radius, measured from the reference.
const FACE_RADIUS = 0.96;
const TOON_WIDE_HALF_WIDTH = (0.457 / 2) * FACE_RADIUS;
const TOON_NARROW_OFFSET = 0.386 * FACE_RADIUS;
const TOON_NARROW_HALF_WIDTH = (0.173 / 2) * FACE_RADIUS;

// See the plugin for the derivation of these three: they re-zero the
// light/view half-vector against a head-on view and centre the band pair on
// the face at drive 0.
const TOON_DRIVE_REFERENCE_VIEW = new THREE.Vector3(0, 0, 1);
const TOON_DRIVE_BASELINE = new THREE.Vector3()
  .addVectors(TOON_LIGHT_DIR, TOON_DRIVE_REFERENCE_VIEW)
  .normalize()
  .dot(new THREE.Vector3(TOON_STREAK_AXIS.x, TOON_STREAK_AXIS.y, 0));
const TOON_DRIVE_CENTRE_OFFSET =
  -(TOON_NARROW_OFFSET + TOON_NARROW_HALF_WIDTH - TOON_WIDE_HALF_WIDTH) / 2;
const TOON_DRIVE_SCALE = 1.1;

const sheenVertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Two hard-edged parallel bands, fixed to uStreakAxis and sliding along it
// together as uDrive changes. Every fragment is either fully base or fully
// lit (step(), no gradients); the shader does its own sRGB conversion so the
// colours are unaffected by the renderer's ACES tone mapping.
const sheenFragmentShader = /* glsl */ `
  uniform vec3 uBaseColor;
  uniform vec3 uLitColor;
  uniform vec2 uStreakAxis;
  uniform float uDrive;
  uniform float uWideHalfWidth;
  uniform float uNarrowOffset;
  uniform float uNarrowHalfWidth;

  varying vec3 vWorldPosition;

  vec3 linearToSRGB(vec3 c) {
    vec3 low = c * 12.92;
    vec3 high = 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return mix(high, low, step(c, vec3(0.0031308)));
  }

  float band(float coord, float centre, float halfWidth) {
    return step(centre - halfWidth, coord) - step(centre + halfWidth, coord);
  }

  void main() {
    float coord = dot(vWorldPosition.xy, uStreakAxis);

    float lit =
      band(coord, uDrive, uWideHalfWidth) +
      band(coord, uDrive + uNarrowOffset, uNarrowHalfWidth);

    vec3 color = mix(uBaseColor, uLitColor, clamp(lit, 0.0, 1.0));
    gl_FragColor = vec4(linearToSRGB(color), 1.0);
  }
`;

function makeSheenMaterial(baseColorHex: string, litColorHex: string) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uBaseColor: { value: new THREE.Color(baseColorHex) },
      uLitColor: { value: new THREE.Color(litColorHex) },
      uStreakAxis: { value: TOON_STREAK_AXIS },
      uDrive: { value: TOON_DRIVE_CENTRE_OFFSET },
      uWideHalfWidth: { value: TOON_WIDE_HALF_WIDTH },
      uNarrowOffset: { value: TOON_NARROW_OFFSET },
      uNarrowHalfWidth: { value: TOON_NARROW_HALF_WIDTH },
    },
    vertexShader: sheenVertexShader,
    fragmentShader: sheenFragmentShader,
  });
}

// ─── Geometry ────────────────────────────────────────────────────────────────
// Cross-section constants mirrored from three/yucoin/assets.ts — the body is
// rebuilt here (instead of reusing the merged gold geometry) because the
// illustrated style needs the rim and face in different materials.
const COIN_RADIUS = 1;
const FACE_Z = 0.12;
const EDGE_Z = 0.102;
const SEG = 96;

function useIllustratedCoin() {
  return useMemo(() => {
    // Cylinder axis Y -> Z so the coin faces the camera (same as assets.ts).
    const side = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, EDGE_Z * 2, SEG, 1, true);
    const bevelFront = new THREE.CylinderGeometry(FACE_RADIUS, COIN_RADIUS, FACE_Z - EDGE_Z, SEG, 1, true);
    bevelFront.translate(0, (FACE_Z + EDGE_Z) / 2, 0);
    const bevelBack = bevelFront.clone().rotateX(Math.PI);
    const edges = [side, bevelFront, bevelBack];
    for (const part of edges) part.rotateX(Math.PI / 2);

    const faceFront = new THREE.CircleGeometry(FACE_RADIUS + 0.004, 64);
    faceFront.translate(0, 0, FACE_Z);
    const faceBack = new THREE.CircleGeometry(FACE_RADIUS + 0.004, 64);
    faceBack.rotateY(Math.PI);
    faceBack.translate(0, 0, -FACE_Z);

    // One streak lights all three surfaces together — the band lines carry
    // straight across face -> bevel -> side as one unbroken diagonal. The
    // engrave geometry is the shared singleton from the 3D coin.
    const faceMaterial = makeSheenMaterial(TOON_FACE_COLOR, TOON_FACE_LIT_COLOR);
    const edgeMaterial = makeSheenMaterial(TOON_RIM_COLOR, TOON_RIM_LIT_COLOR);
    const engraveMaterial = makeSheenMaterial(TOON_LINE_COLOR, TOON_LINE_LIT_COLOR);
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
