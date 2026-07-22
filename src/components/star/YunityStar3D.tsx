"use client";
// 3D Yunity star: steady body + standalone 1s halo breathing (see useFrame).

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Geometry — the smooth six-point diamond star (from the star lab)    */
/* ------------------------------------------------------------------ */

// Brand construction: tips reach distance 1 along the axes, each concave flank
// is an arc of a large circle carved out along the 45° diagonal, and each tip
// is capped with a small circle tangent to its two carve circles.
const WAIST = 0.52; // radius at the 45° waist (depth of the carve)
const TIP_R = 0.05; // radius of the rounded tip caps
const SMOOTH = 4.5; // join softness: lower = broader fillets, higher = tighter

function makeStarProfile() {
  const a = 1 - TIP_R;
  const k = TIP_R - WAIST;
  const D = (a * a - k * k) / (Math.SQRT2 * a + 2 * k);
  const R = D - WAIST;

  const cx = D / Math.SQRT2 - a;
  const cy = D / Math.SQRT2;
  const dist = Math.hypot(cx, cy);
  const tx = a + (TIP_R * cx) / dist;
  const ty = (TIP_R * cy) / dist;
  const thetaT = Math.atan2(ty, tx);

  const QUARTER = Math.PI / 2;
  const EIGHTH = Math.PI / 4;

  return (theta: number) => {
    let phi = Math.abs(theta) % QUARTER;
    if (phi > EIGHTH) phi = QUARTER - phi;

    if (phi <= thetaT) {
      const s = a * Math.sin(phi);
      return a * Math.cos(phi) + Math.sqrt(Math.max(0, TIP_R * TIP_R - s * s));
    }
    const c = D * Math.cos(EIGHTH - phi);
    return c - Math.sqrt(Math.max(0, c * c - (D * D - R * R)));
  };
}

/** 2D star silhouette (same profile as the 3D geometry) as an SVG path, for
 * the glow — so the aura is shaped like the star instead of a plain circle. */
function buildStarPathD(steps = 96) {
  const starR = makeStarProfile();
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * Math.PI * 2;
    const r = starR(theta);
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    d += i === 0 ? `M ${x.toFixed(4)} ${y.toFixed(4)}` : ` L ${x.toFixed(4)} ${y.toFixed(4)}`;
  }
  return d + " Z";
}
const GLOW_PATH_D = buildStarPathD();

/**
 * Six points (±x, ±y, ±z), built as a smooth-blended intersection of three
 * orthogonal star prisms — the silhouette is the carved star from any axis,
 * every join filleted, facet-free. Lower resolution than the lab build: the
 * surface is smooth, so 384×192 is indistinguishable at a 400px viewport.
 */
function buildStarGeometry(azimuthSegs = 384, polarSegs = 192) {
  const starR = makeStarProfile();

  const planeLimit = (a: number, b: number) => {
    const h = Math.hypot(a, b);
    if (h < 1e-9) return Infinity;
    return starR(Math.atan2(b, a)) / h;
  };

  const radius = (ux: number, uy: number, uz: number) => {
    const l1 = Math.min(planeLimit(ux, uy), 2);
    const l2 = Math.min(planeLimit(uy, uz), 2);
    const l3 = Math.min(planeLimit(ux, uz), 2);
    return Math.pow(
      Math.pow(l1, -SMOOTH) + Math.pow(l2, -SMOOTH) + Math.pow(l3, -SMOOTH),
      -1 / SMOOTH,
    );
  };

  const NT = azimuthSegs;
  const NP = polarSegs;
  const positions: number[] = [];
  const indices: number[] = [];

  positions.push(0, 0, radius(0, 0, 1));
  for (let i = 1; i < NP; i++) {
    const phi = (i / NP) * Math.PI;
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    for (let j = 0; j < NT; j++) {
      const theta = (j / NT) * Math.PI * 2;
      const ux = sp * Math.cos(theta);
      const uy = sp * Math.sin(theta);
      const r = radius(ux, uy, cp);
      positions.push(r * ux, r * uy, r * cp);
    }
  }
  positions.push(0, 0, -radius(0, 0, -1));

  const top = 0;
  const bottom = positions.length / 3 - 1;
  const row = (i: number) => 1 + (i - 1) * NT;

  for (let j = 0; j < NT; j++) {
    const j1 = (j + 1) % NT;
    indices.push(top, row(1) + j, row(1) + j1);
    indices.push(bottom, row(NP - 1) + j1, row(NP - 1) + j);
  }
  for (let i = 1; i < NP - 1; i++) {
    const rA = row(i);
    const rB = row(i + 1);
    for (let j = 0; j < NT; j++) {
      const j1 = (j + 1) % NT;
      indices.push(rA + j, rB + j, rA + j1);
      indices.push(rA + j1, rB + j, rB + j1);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* Shader — saturated iridescent gradient on translucent glass         */
/* ------------------------------------------------------------------ */

const VERTEX = /* glsl */ `
  varying vec3 vViewPos;
  varying vec3 vN;
  varying vec3 vV;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uBack;  // 1.0 when rendering the inner (back-facing) shell

  varying vec3 vViewPos;
  varying vec3 vN;
  varying vec3 vV;

  const vec3 YELLOW  = vec3(1.00, 0.83, 0.00); // top-left
  const vec3 PURPLE  = vec3(0.52, 0.28, 1.00); // top
  const vec3 BLUE    = vec3(0.42, 0.50, 1.00); // right (periwinkle)
  const vec3 CYAN    = vec3(0.00, 0.76, 1.00); // lower-right
  const vec3 TEAL    = vec3(0.00, 0.90, 0.63); // bottom
  const vec3 GREEN   = vec3(0.43, 0.89, 0.23); // left

  void main() {
    vec3 N = normalize(vN);
    if (uBack > 0.5) N = -N;
    vec3 V = normalize(vV);

    // View-space gradient: colour zones stay pinned to the screen while the
    // body turns. Normal offset bends the lookup like refraction; the sine
    // warp makes the interior swim slowly.
    vec2 uv = vViewPos.xy * 0.62;
    uv += N.xy * (uBack > 0.5 ? 0.08 : 0.26);
    uv += 0.05 * vec2(
      sin(2.3 * vViewPos.y + uTime * 0.50),
      cos(2.1 * vViewPos.x + uTime * 0.40)
    );

    // Each tip owns a hue; yellow is the inner top-left patch.
    vec2 dY = uv - vec2(-0.40,  0.30);
    vec2 dP = uv - vec2( 0.15,  0.60);
    vec2 dB = uv - vec2( 0.62,  0.02);
    vec2 dC = uv - vec2( 0.30, -0.42);
    vec2 dT = uv - vec2(-0.05, -0.60);
    vec2 dG = uv - vec2(-0.55, -0.10);
    float wY = exp(-3.2 * dot(dY, dY));
    float wP = exp(-1.6 * dot(dP, dP));
    float wB = exp(-2.6 * dot(dB, dB));
    float wC = exp(-3.0 * dot(dC, dC));
    float wT = exp(-2.8 * dot(dT, dT));
    float wG = exp(-2.8 * dot(dG, dG));
    vec3 col = (wY * YELLOW + wP * PURPLE + wB * BLUE + wC * CYAN + wT * TEAL + wG * GREEN)
             / (wY + wP + wB + wC + wT + wG);

    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = clamp(mix(vec3(luma), col, 1.55), 0.0, 2.0);

    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
    float spec1 = 0.0;
    if (uBack < 0.5) {
      // Lighting only on the outer shell; the inner shell stays a flat,
      // smooth colour fill (shading there reads as a speck at the centre).
      col += fres * col * 0.55;

      vec3 L1 = normalize(vec3(-0.45, 0.70, 0.60));
      vec3 L2 = normalize(vec3( 0.50, -0.35, 0.65));
      spec1 = pow(max(dot(N, normalize(L1 + V)), 0.0), 320.0) * 1.0;
      float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 40.0) * 0.25;
      col += spec1 * vec3(1.0) + spec2 * CYAN;
    }

    // Soft shoulder so grazing angles saturate without clipping. No linearize
    // here: without a postprocessing chain there is no output encode pass, so
    // the shader writes display (sRGB) values directly.
    col = col / (1.0 + 0.20 * max(max(col.r, col.g), col.b));

    float alpha = uBack > 0.5
      ? 0.88
      : clamp(0.22 + 0.34 * fres + spec1, 0.0, 1.0);

    gl_FragColor = vec4(col * (uBack > 0.5 ? 0.85 : 1.0), alpha);
  }
`;

/* ------------------------------------------------------------------ */
/* Behaviour                                                           */
/* ------------------------------------------------------------------ */

const IDLE_SPIN = -0.35; // rad/s — slow horizontal spin (yaw) about the Y axis
const DRAG_RATE = 0.009; // drag px → radians (horizontal drag turns the yaw)

type SpinState = {
  dragging: boolean;
  pendingX: number; // accrued horizontal drag, px, consumed each frame
  velExtra: number; // user-imparted spin on top of the idle rate
};

function StarScene({
  spin,
  haloRef,
  reduced,
}: {
  spin: React.MutableRefObject<SpinState>;
  haloRef: React.RefObject<HTMLDivElement | null>;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);

  // The front shell carries the tight specular highlights (pow 320 — a small,
  // sharp glint), which needs enough vertex density that interpolated normals
  // don't make it swim or facet as the star turns. The back shell is
  // deliberately flat/unlit (see the fragment shader below) and only ever
  // reads as a soft colour fill, so it can be far coarser for free.
  const frontGeometry = useMemo(() => buildStarGeometry(192, 96), []);
  const backGeometry = useMemo(() => buildStarGeometry(64, 32), []);
  useEffect(
    () => () => {
      frontGeometry.dispose();
      backGeometry.dispose();
    },
    [frontGeometry, backGeometry],
  );

  const backUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uBack: { value: 1 } }),
    [],
  );
  const frontUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uBack: { value: 0 } }),
    [],
  );

  useFrame(({ clock }, delta) => {
    const g = group.current;
    const sp = spinner.current;
    if (!g || !sp) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);

    backUniforms.uTime.value = t;
    frontUniforms.uTime.value = t;

    if (reduced) return;

    // Hover bob — same frequency/amplitude as YuCoin's idle float, so the two
    // 3D pieces on the page read as one consistent motion language.
    g.position.y = Math.sin(t * 0.85) * 0.065;

    // The star body itself no longer pulses. Instead the halo breathes on its
    // own gentle one-second cycle, a touch brighter than before. Independent of
    // the signal dots (which now flow into the star continuously).
    const glowPulse = 0.5 - 0.5 * Math.cos(t * Math.PI * 2); // 0..1, 1s period
    const halo = haloRef.current;
    if (halo) halo.style.opacity = String(0.34 + 0.14 * glowPulse);

    // Spin: a slow horizontal turntable turn (yaw, about Y); a horizontal drag
    // turns it. Rotation is confined to this one Y axis — the star can never
    // tumble (X) or pinwheel (Z), whatever the user does.
    const s = spin.current;
    if (s.pendingX !== 0) {
      sp.rotation.y += s.pendingX * DRAG_RATE;
      s.velExtra = (s.pendingX * DRAG_RATE) / dt;
      s.pendingX = 0;
    } else {
      if (!s.dragging) s.velExtra *= Math.exp(-1.6 * dt);
      sp.rotation.y += (IDLE_SPIN + s.velExtra) * dt;
    }
  });

  return (
    <group ref={group}>
      {/* Turntable: continuous rotation about world/local Y, driven per frame.
          The camera's own slight upward tilt (see onCreated below) keeps
          depth visible through the turn instead of ever reading perfectly
          flat. */}
      <group ref={spinner}>
        <mesh geometry={backGeometry} renderOrder={0}>
          <shaderMaterial
            vertexShader={VERTEX}
            fragmentShader={FRAGMENT}
            uniforms={backUniforms}
            side={THREE.BackSide}
            transparent
            depthWrite={false}
          />
        </mesh>
        <mesh geometry={frontGeometry} renderOrder={1}>
          <shaderMaterial
            vertexShader={VERTEX}
            fragmentShader={FRAGMENT}
            uniforms={frontUniforms}
            side={THREE.FrontSide}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * The Yunity star, sized for embedding: hovering, viewed slightly from below,
 * turning slowly like a turntable (yaw, about the vertical axis) so the
 * silhouette turns left-right rather than nodding up-down. The body holds a
 * steady brightness; behind it a star-shaped halo breathes on its own gentle
 * one-second cycle (independent of the signal dots flowing in). A horizontal
 * drag turns it (yaw only — never tumbles or pinwheels); idle motion resumes
 * on release.
 */
export default function YunityStar3D({
  size = 200,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const spin = useRef<SpinState>({ dragging: false, pendingX: 0, velExtra: 0 });
  const lastX = useRef(0);
  const haloRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  // Default true so it's already animating the moment it scrolls into place —
  // only ever flips to pause a star that's confirmed off-screen.
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Stop the render loop entirely while scrolled out of view — this canvas
  // (and the hero coin above it) would otherwise animate continuously for the
  // whole time a visitor reads content further down the page. rootMargin
  // starts it a little early so there's no pop-in the moment it arrives.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label="Yunity"
      className={`relative aspect-square w-full max-w-full cursor-grab select-none active:cursor-grabbing ${className}`}
      style={{ maxWidth: size, touchAction: "pan-y" }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        spin.current.dragging = true;
        lastX.current = e.clientX;
      }}
      onPointerMove={(e) => {
        if (!spin.current.dragging || (e.buttons & 1) === 0) return;
        spin.current.pendingX += e.clientX - lastX.current;
        lastX.current = e.clientX;
      }}
      onPointerUp={() => (spin.current.dragging = false)}
      onPointerCancel={() => (spin.current.dragging = false)}
      onLostPointerCapture={() => (spin.current.dragging = false)}
    >
      {/* Pulsing glow, strictly behind the star (painted before the canvas).
          Shaped like the star itself (the same profile the 3D geometry uses),
          blurred as a filled SVG shape so the aura reads as a soft star, not a
          circle. Tight to the star and faint — colour pools stop well inside
          the path so the aura hugs the silhouette rather than spreading.
          Centring is done via the inline transform ONLY — Tailwind v4
          translate utilities set the separate CSS `translate` property, which
          would stack with the per-frame transform and throw the halo
          off-centre. */}
      <div
        ref={haloRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-full w-full"
        style={{ opacity: 0.41, transform: "translate(-50%, -50%)" }}
      >
        <svg viewBox="-1.3 -1.3 2.6 2.6" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="starGlowPurple" cx="0.5" cy="0.26" r="0.42">
              <stop offset="0%" stopColor="#8548ff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#8548ff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="starGlowYellow" cx="0.28" cy="0.38" r="0.4">
              <stop offset="0%" stopColor="#ffd400" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#ffd400" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="starGlowGreen" cx="0.24" cy="0.62" r="0.42">
              <stop offset="0%" stopColor="#6ee33b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6ee33b" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="starGlowTeal" cx="0.52" cy="0.76" r="0.44">
              <stop offset="0%" stopColor="#00e6a1" stopOpacity="0.44" />
              <stop offset="100%" stopColor="#00e6a1" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="starGlowBlue" cx="0.76" cy="0.56" r="0.44">
              <stop offset="0%" stopColor="#547aff" stopOpacity="0.44" />
              <stop offset="100%" stopColor="#547aff" stopOpacity="0" />
            </radialGradient>
            <filter id="starGlowBlur" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="0.11" />
            </filter>
          </defs>
          <g filter="url(#starGlowBlur)">
            <path d={GLOW_PATH_D} fill="url(#starGlowPurple)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowYellow)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowGreen)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowTeal)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowBlue)" />
          </g>
        </svg>
      </div>
      <Canvas
        className="absolute inset-0"
        camera={{ position: [0, 0, 4], fov: 35, near: 0.1, far: 100 }}
        // Capped below the usual [1,2]: the fragment shader (six gaussian
        // pools plus two specular terms, drawn twice for the two shells) costs
        // per output pixel, so a full 2x retina raster roughly quadruples that
        // work for a 200px decorative element — 1.5x keeps it crisp for much
        // less.
        dpr={[1, 1.5]}
        frameloop={inView ? "always" : "never"}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.toneMapping = THREE.NoToneMapping;
          // Sit above the star and look down at it, so the star tilts toward
          // the viewer (reversed from looking up, which tilted it away).
          // lookAt targets the origin, so the star (centred at the origin)
          // still projects to canvas centre and the paths stay converged.
          camera.position.set(0, 0.95, 4);
          camera.lookAt(0, 0, 0);
        }}
      >
        <StarScene spin={spin} haloRef={haloRef} reduced={reduced} />
      </Canvas>
    </div>
  );
}
