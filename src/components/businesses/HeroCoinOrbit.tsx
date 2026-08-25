"use client";

import { useCallback, useMemo, useRef, useState, useLayoutEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { getCoinAssets, COIN_RADIUS } from "@/components/yucoin/assets";
import CoinLighting from "@/components/yucoin/CoinLighting";
import useVisibleFrameloop from "@/components/yucoin/useVisibleFrameloop";
import { assetPath } from "@/lib/assetPath";

gsap.registerPlugin(useGSAP);

/**
 * Five YuCoins orbiting the Businesses-hero figure on a tilted 3D ellipse.
 * They travel clockwise: up the left side BEHIND her, across the top, down the
 * right, then OVER her front at waist height — like a moon orbit.
 *
 * Occlusion is done inside ONE canvas: the person cutout is rendered as an
 * invisible depth mask (colorWrite off, alphaTest on her alpha channel) at the
 * orbit plane's centre. Coins on the far arc fail the depth test wherever her
 * pixels are and vanish behind her; coins on the near arc pass in front. The
 * visible person stays the crisp DOM <img> below this canvas — the mask only
 * writes depth, never pixels, and is sized to the exact same box, so the
 * clipping silhouette lines up with what the viewer sees.
 */

const PERSON_SRC = assetPath("/who-we-help/businesses-hero-person.webp");

// --- Orbit geometry (fractions of the person image box) --------------------
/** Extra room around the person box on every side, so the orbit + coins fit. */
const MARGIN = 0.18;
const CENTER_FX = 0.5; // orbit centre X within the person box
const CENTER_FY = 0.58; // orbit centre Y — her waist/hands
const RX_FRAC = 0.45; // semi-major radius on the RIGHT side, × person width
const LEFT_STRETCH = 1.35; // left side reaches further out than the right
const RY_FRAC = 0.48; // semi-minor radius before tilt, × person width
const TILT = 1.28; // orbit-plane tilt (rad) — high tilt = shallow ellipse, deep z
const ROLL = 0.42; // in-plane roll (rad) — high on the right, LOWEST at the left end
const PERIOD = 8; // seconds per revolution
const OMEGA = (2 * Math.PI) / PERIOD;
/** Base coin diameter in px, to match the home-page hero's coin size. */
const COIN_DIAMETER = 80;
const DEPTH_K = 0.12; // slight size cue: bigger in front, smaller behind
const COIN_COUNT = 5;
const BASE_ANGLES = Array.from({ length: COIN_COUNT }, (_, i) => (i * 2 * Math.PI) / COIN_COUNT);

// Moon-locked: each coin keeps its face pointed OUTWARD from the orbit centre,
// so it rotates exactly once per revolution (tidal lock) — the face shows to
// the viewer on the near arc, the reverse shows (mostly occluded) on the far
// arc, and the coin turns edge-on through the sides.
const FACE_AXIS = new THREE.Vector3(0, 0, 1);

// Cursor-hover response — same feel as the homepage coin field (HeroCoinField):
// each coin tilts toward the cursor and grows slightly, independently of the
// others, only while the pointer is actually over that one coin.
const HOVER_SCALE = 1.12;
const HOVER_TILT = 0.35; // max extra tilt toward the cursor, in radians
const NO_RAYCAST = () => null;

type CoinHover = { hovered: boolean; hoverMix: number; px: number; py: number };

/** Orbit point for a parametric angle, in canvas px (origin at canvas centre). */
function orbitPoint(theta: number, pw: number, ph: number, out: THREE.Vector3) {
  const c0 = Math.cos(theta);
  // Egg-shaped major axis: the radius grows smoothly toward the left side, so
  // the arc stays tight against her right and sweeps wider out to the left.
  const Rx = RX_FRAC * pw * (1 + (LEFT_STRETCH - 1) * (1 - c0) * 0.5);
  const Ry = RY_FRAC * pw;
  const cx = (CENTER_FX - 0.5) * pw;
  const cy = (0.5 - CENTER_FY) * ph;
  const cosr = Math.cos(ROLL);
  const sinr = Math.sin(ROLL);
  const cosb = Math.cos(TILT);
  const sinb = Math.sin(TILT);
  const c = Math.cos(theta);
  const s = Math.sin(theta);
  // Major axis rolled in-plane; minor axis tilted into depth (top arc = −z).
  const x = cx + Rx * c * cosr + Ry * s * -sinr * cosb;
  const y = cy + Rx * c * sinr + Ry * s * cosr * cosb;
  const z = Ry * s * -sinb;
  out.set(x, y, z);
  return out;
}

/**
 * Invisible depth mask of the person: writes depth wherever her cutout is
 * opaque so far-arc coins are hidden behind her; draws no pixels itself.
 * Reports back to the parent once its texture has loaded, so the whole coin
 * layer can stay hidden until occlusion is actually working — otherwise the
 * coins would flash past her un-occluded for a frame before "clipping" into
 * their correct, hidden-behind-her state.
 */
function PersonDepthMask({ onReady }: { onReady: () => void }) {
  const size = useThree((s) => s.size);
  const [ready, setReady] = useState(false);
  const texture = useMemo(
    () =>
      new THREE.TextureLoader().load(PERSON_SRC, () => {
        setReady(true);
        onReady();
      }),
    [onReady],
  );
  const pw = size.width / (1 + 2 * MARGIN);
  const ph = size.height / (1 + 2 * MARGIN);
  return (
    <mesh visible={ready} renderOrder={-1} scale={[pw, ph, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} alphaTest={0.5} colorWrite={false} />
    </mesh>
  );
}

/** One coin mesh from the shared assets; position/orientation driven per frame. */
function OrbitCoin({
  groupRef,
  hover,
}: {
  groupRef: React.RefObject<THREE.Group | null>;
  hover: CoinHover;
}) {
  const a = useMemo(getCoinAssets, []);
  // Moon-locked coins turn fully around, so both faces must be engraved.
  return (
    <group ref={groupRef}>
      {/* Invisible hit target — a touch larger than the coin, raycast-only, so
          hovering this one coin never affects its neighbours. It scales and
          rotates with the group, so the clickable area tracks the coin's
          current on-screen size and pose exactly. */}
      <mesh
        visible={false}
        onPointerOver={(e) => {
          e.stopPropagation();
          hover.hovered = true;
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          hover.hovered = false;
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          hover.px = THREE.MathUtils.clamp(e.pointer.x, -1, 1);
          hover.py = THREE.MathUtils.clamp(e.pointer.y, -1, 1);
        }}
      >
        <circleGeometry args={[COIN_RADIUS * 1.05, 24]} />
      </mesh>
      <mesh geometry={a.goldBoth} material={a.gold} raycast={NO_RAYCAST} />
      <mesh geometry={a.engraveBoth} material={a.goldEngrave} raycast={NO_RAYCAST} />
    </group>
  );
}

/** Drives all coins each frame off an absolute clock. */
function OrbitController() {
  const size = useThree((s) => s.size);
  const refs = useRef<Array<React.RefObject<THREE.Group | null>>>(
    Array.from({ length: COIN_COUNT }, () => ({ current: null })),
  );
  const hovers = useMemo<CoinHover[]>(
    () => Array.from({ length: COIN_COUNT }, () => ({ hovered: false, hoverMix: 0, px: 0, py: 0 })),
    [],
  );
  const pos = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const tiltOffset = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const reduced = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    const pw = size.width / (1 + 2 * MARGIN);
    const ph = size.height / (1 + 2 * MARGIN);
    const Ry = RY_FRAC * pw;
    const cx = (CENTER_FX - 0.5) * pw;
    const cy = (0.5 - CENTER_FY) * ph;
    const zmax = Ry * Math.sin(TILT);
    const t = reduced ? 0 : performance.now() / 1000;

    for (let i = 0; i < COIN_COUNT; i++) {
      const g = refs.current[i].current;
      if (!g) continue;
      const theta = BASE_ANGLES[i] - OMEGA * t; // clockwise on screen
      orbitPoint(theta, pw, ph, pos);
      g.position.copy(pos);
      // Moon-lock: face pointed outward from the orbit centre in x/z, but with
      // the vertical component INVERTED — a pure outward lock aims the face
      // downward on the near arc (away from the overhead light). Flipping y
      // leans each coin's top edge back toward the centre, face up to the light.
      dir.set(pos.x - cx, -(pos.y - cy), pos.z).normalize();
      g.quaternion.setFromUnitVectors(FACE_AXIS, dir);

      // Hover response — each coin independently, only while the cursor is
      // over it (mirrors YuCoin's pointerOnHoverOnly behaviour on the home hero).
      const hover = hovers[i];
      hover.hoverMix = THREE.MathUtils.damp(hover.hoverMix, hover.hovered ? 1 : 0, 10, dt);
      if (!hover.hovered) {
        hover.px = THREE.MathUtils.damp(hover.px, 0, 8, dt);
        hover.py = THREE.MathUtils.damp(hover.py, 0, 8, dt);
      }
      euler.set(-hover.py * HOVER_TILT * hover.hoverMix, hover.px * HOVER_TILT * hover.hoverMix, 0);
      tiltOffset.setFromEuler(euler);
      g.quaternion.multiply(tiltOffset);

      const depth = zmax > 0 ? pos.z / zmax : 0; // −1 (back) … +1 (front)
      const hoverScale = 1 + (HOVER_SCALE - 1) * hover.hoverMix;
      g.scale.setScalar(
        (COIN_DIAMETER / 2) * (1 + DEPTH_K * depth) * hoverScale * (1 / COIN_RADIUS),
      );
    }
  });

  return (
    <>
      {refs.current.map((r, i) => (
        <OrbitCoin key={i} groupRef={r} hover={hovers[i]} />
      ))}
    </>
  );
}

/** Pins the ortho frustum to the canvas pixel size (1 world unit = 1 canvas px). */
function FrustumSync() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  useLayoutEffect(() => {
    Object.assign(camera, {
      left: -size.width / 2,
      right: size.width / 2,
      top: size.height / 2,
      bottom: -size.height / 2,
    });
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

export default function HeroCoinOrbit() {
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useVisibleFrameloop(wrapper);
  // The whole layer stays hidden until the depth mask's texture has loaded —
  // otherwise coins on the far arc would render un-occluded for a frame or
  // two, then visibly "clip" into place the moment the mask kicks in.
  const [maskReady, setMaskReady] = useState(false);
  const handleMaskReady = useCallback(() => setMaskReady(true), []);

  // Once occlusion is ready, fade the coins in — same duration/ease as the
  // person image's rise-in (BusinessesHero), so they arrive together instead
  // of the coins popping in separately.
  useGSAP(
    () => {
      const el = wrapper.current;
      if (!maskReady || !el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(el, {
          opacity: 0,
          duration: 0.45,
          ease: "power3.out",
          clearProps: "opacity",
        });
      });
      // reduce: no branch — the layer just becomes visible once occlusion is ready.
    },
    { dependencies: [maskReady], scope: wrapper },
  );

  return (
    <div
      ref={wrapper}
      aria-hidden
      className="pointer-events-none absolute z-20"
      style={{ inset: `-${MARGIN * 100}%`, opacity: maskReady ? undefined : 0 }}
    >
      {/*
        Camera sits at z=500 so the whole orbit (z ≈ ±275 at desktop width)
        stays inside the near/far planes — a closer camera near-clips the
        coins exactly as they swing toward the viewer.
      */}
      <Canvas
        frameloop={frameloop}
        orthographic
        camera={{ position: [0, 0, 500], near: 0.1, far: 1000, zoom: 1 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        className="!pointer-events-auto"
      >
        <FrustumSync />
        <CoinLighting />
        <PersonDepthMask onReady={handleMaskReady} />
        <OrbitController />
      </Canvas>
    </div>
  );
}
