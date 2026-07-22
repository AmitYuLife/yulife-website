"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* ------------------------------------------------------------------ */
/* Geometry — the carved-circle Yunity star                            */
/* ------------------------------------------------------------------ */

// The brand construction: tips reach distance 1 along the axes, each concave
// flank is an arc of a large circle carved out along the 45° diagonal, and
// each tip is capped with a small circle tangent to its two carve circles.
const WAIST = 0.52; // radius at the 45° waist (depth of the carve)
const TIP_R = 0.05; // radius of the rounded tip caps
const SMOOTH = 4.5; // join softness: lower = broader fillets, higher = tighter

/**
 * Radial silhouette r(θ) of the carved star. Solves the carve-circle centre
 * distance D so the carve arc is exactly tangent to the tip cap — the
 * silhouette is then two circle families meeting smoothly, precisely the
 * "circle subtracted from the diamond" construction in the brand asset.
 */
function makeStarProfile() {
  const a = 1 - TIP_R; // tip-cap centre distance along the axis
  const k = TIP_R - WAIST;
  // Tangency |C_carve − C_tip| = R + TIP_R with R = D − WAIST is linear in D:
  const D = (a * a - k * k) / (Math.SQRT2 * a + 2 * k);
  const R = D - WAIST;

  // Angle at which the tip cap hands over to the carve arc (the tangent point).
  const cx = D / Math.SQRT2 - a;
  const cy = D / Math.SQRT2;
  const dist = Math.hypot(cx, cy);
  const tx = a + (TIP_R * cx) / dist;
  const ty = (TIP_R * cy) / dist;
  const thetaT = Math.atan2(ty, tx);

  const QUARTER = Math.PI / 2;
  const EIGHTH = Math.PI / 4;

  return (theta: number) => {
    // Fold into [0, 45°] using the star's 8-fold symmetry.
    let phi = Math.abs(theta) % QUARTER;
    if (phi > EIGHTH) phi = QUARTER - phi;

    if (phi <= thetaT) {
      // Tip cap: far intersection with the small circle centred at (a, 0).
      const s = a * Math.sin(phi);
      return a * Math.cos(phi) + Math.sqrt(Math.max(0, TIP_R * TIP_R - s * s));
    }
    // Carve arc: near intersection with the big circle on the 45° diagonal.
    const c = D * Math.cos(EIGHTH - phi);
    return c - Math.sqrt(Math.max(0, c * c - (D * D - R * R)));
  };
}

/**
 * The 3D diamond star: six points (±x, ±y, ±z — the centre extruded front and
 * back), built as a smooth-blended intersection of three orthogonal star
 * prisms. Looking down any axis, the silhouette is the carved star — the shape
 * reads the same size front-facing or side-facing — but every join is filleted
 * into an organic, facet-free surface.
 *
 * Radially: the largest r along direction u before r·u exits one of the three
 * prisms is min over the prisms, each prism limiting only its two coordinates.
 */
function buildStarGeometry(azimuthSegs = 896, polarSegs = 448) {
  const starR = makeStarProfile();

  // Max r along direction u such that (r·a, r·b) stays inside the 2D star.
  const planeLimit = (a: number, b: number) => {
    const h = Math.hypot(a, b);
    if (h < 1e-9) return Infinity; // direction parallel to this prism's axis
    return starR(Math.atan2(b, a)) / h;
  };

  // Smooth minimum of the three prism limits (inverse p-norm). A hard min
  // creates crease facets where the limiting prism switches; this blends the
  // joins into continuous fillets — no visible facets anywhere. Infinite
  // limits are capped so they contribute nothing rather than poisoning the sum.
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

  // Poles on ±z (the extruded centre points).
  positions.push(0, 0, radius(0, 0, 1));
  for (let i = 1; i < NP; i++) {
    const phi = (i / NP) * Math.PI;
    const sp = Math.sin(phi);
    const cp = Math.cos(phi);
    for (let j = 0; j < NT; j++) {
      const theta = (j / NT) * Math.PI * 2;
      const ux = sp * Math.cos(theta);
      const uy = sp * Math.sin(theta);
      const uz = cp;
      const r = radius(ux, uy, uz);
      positions.push(r * ux, r * uy, r * uz);
    }
  }
  positions.push(0, 0, -radius(0, 0, -1));

  const top = 0;
  const bottom = positions.length / 3 - 1;
  const row = (i: number) => 1 + (i - 1) * NT; // first vertex of polar row i

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
  uniform float uBack; // 1.0 when rendering the inner (back-facing) shell

  varying vec3 vViewPos;
  varying vec3 vN;
  varying vec3 vV;

  // Saturated brand hues from the reference asset.
  const vec3 YELLOW  = vec3(1.00, 0.83, 0.00); // top-left
  const vec3 PURPLE  = vec3(0.52, 0.28, 1.00); // top-right
  const vec3 BLUE    = vec3(0.42, 0.50, 1.00); // right (periwinkle)
  const vec3 CYAN    = vec3(0.00, 0.76, 1.00); // lower-right
  const vec3 TEAL    = vec3(0.00, 0.90, 0.63); // bottom
  const vec3 GREEN   = vec3(0.43, 0.89, 0.23); // left

  void main() {
    vec3 N = normalize(vN);
    // Back faces point away from the camera; flip so lighting still works.
    if (uBack > 0.5) N = -N;
    vec3 V = normalize(vV);

    // Gradient lives in view space so the colour zones stay pinned to the
    // screen while the body turns. The normal offset bends the lookup like
    // refraction through curved glass; the sine warp makes it swim slowly.
    vec2 uv = vViewPos.xy * 0.62;
    uv += N.xy * (uBack > 0.5 ? 0.08 : 0.26);
    uv += 0.05 * vec2(
      sin(2.3 * vViewPos.y + uTime * 0.50),
      cos(2.1 * vViewPos.x + uTime * 0.40)
    );

    // Sharp gaussian pools: each tip owns a hue (top violet, right periwinkle,
    // bottom teal, left green) and yellow sits as the inner top-left patch —
    // matching the reference so no zone averages out to grey.
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

    // Push saturation — the reference reads as pure dye.
    float luma = dot(col, vec3(0.299, 0.587, 0.114));
    col = clamp(mix(vec3(luma), col, 1.55), 0.0, 2.0);

    // Fresnel rim: glassy edge, and where the shell becomes most opaque.
    float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
    float spec1 = 0.0;
    if (uBack < 0.5) {
      // Lighting only on the outer shell. The inner shell stays a flat,
      // smooth colour fill — any shading variation there shows through the
      // glass as a speck at the centre points.
      col += fres * col * 0.55;

      // Glossy speculars: crisp key up-left, soft cool kick low-right.
      vec3 L1 = normalize(vec3(-0.45, 0.70, 0.60));
      vec3 L2 = normalize(vec3( 0.50, -0.35, 0.65));
      spec1 = pow(max(dot(N, normalize(L1 + V)), 0.0), 320.0) * 1.0;
      float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 40.0) * 0.25;
      col += spec1 * vec3(1.0) + spec2 * CYAN;
    }

    // Soft shoulder so grazing angles saturate without clipping.
    col = col / (1.0 + 0.20 * max(max(col.r, col.g), col.b));

    // The hues above are authored as display (sRGB) values, but this shader
    // writes into a linear pipeline that gamma-encodes on output — without
    // this the palette washes out to pastel. Linearize so the final encode
    // reproduces the authored colours exactly.
    col = pow(col, vec3(2.2));

    // Translucency: the face is see-through; rims and highlights firm up.
    // The inner shell stays bright and near-opaque so no ray ever reaches the
    // black background through the glass — the body reads colour-filled, never
    // hollow (no dark dimple at the centre points).
    float alpha = uBack > 0.5
      ? 1.0
      : clamp(0.52 + 0.42 * fres + spec1, 0.0, 1.0);

    gl_FragColor = vec4(col * (uBack > 0.5 ? 0.85 : 1.0), alpha);
  }
`;

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

type SpinState = {
  dragging: boolean;
  pending: { x: number; y: number };
  vel: { x: number; y: number };
};

function YunityStar({ spin }: { spin: React.MutableRefObject<SpinState> }) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildStarGeometry(), []);

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
    if (!g) return;
    const t = clock.getElapsedTime();
    const dt = Math.min(delta, 0.1);


    backUniforms.uTime.value = t;
    frontUniforms.uTime.value = t;

    // Gentle hover, always on.
    g.position.y = Math.sin(t * 0.7) * 0.06;

    // Rotation is yours: drag to spin, release to coast with decaying inertia.
    const s = spin.current;
    const RATE = 0.006;
    if (s.pending.x !== 0 || s.pending.y !== 0) {
      g.rotation.y += s.pending.x * RATE;
      g.rotation.x += s.pending.y * RATE;
      s.vel.x = s.pending.x;
      s.vel.y = s.pending.y;
      s.pending.x = 0;
      s.pending.y = 0;
    } else if (!s.dragging) {
      g.rotation.y += s.vel.x * RATE;
      g.rotation.x += s.vel.y * RATE;
      const decay = Math.exp(-3.2 * dt);
      s.vel.x *= decay;
      s.vel.y *= decay;
    }
  });

  // Two passes make the glass read: the inner (back) surface glows dimly
  // through the translucent front shell.
  return (
    <group ref={group}>
      <mesh geometry={geometry} renderOrder={0}>
        <shaderMaterial
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={backUniforms}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={geometry} renderOrder={1}>
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
  );
}

/**
 * The Yunity star: the carved-circle silhouette inflated into translucent
 * iridescent glass, hovering on black with a soft bloom aura.
 * Drag anywhere to rotate; release to let it coast.
 */
export default function StarLab() {
  const spin = useRef<SpinState>({
    dragging: false,
    pending: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
  });
  const last = useRef({ x: 0, y: 0 });

  return (
    <div
      className="fixed inset-0 z-[100] cursor-grab touch-none bg-black active:cursor-grabbing"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        spin.current.dragging = true;
        spin.current.vel.x = 0;
        spin.current.vel.y = 0;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        // Require a held primary button — guards against synthetic pointer
        // streams (automation, lost pointerup) spinning the star unattended.
        if (!spin.current.dragging || (e.buttons & 1) === 0) return;
        spin.current.pending.x += e.clientX - last.current.x;
        spin.current.pending.y += e.clientY - last.current.y;
        last.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={() => (spin.current.dragging = false)}
      onPointerCancel={() => (spin.current.dragging = false)}
      onLostPointerCapture={() => (spin.current.dragging = false)}
    >
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 35, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000", 1);
          gl.toneMapping = THREE.NoToneMapping;
        }}
      >
        <YunityStar spin={spin} />
        <EffectComposer>
          <Bloom
            mipmapBlur
            intensity={1.0}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.4}
            radius={0.85}
          />
        </EffectComposer>
      </Canvas>

      <p className="pointer-events-none absolute bottom-[16px] left-[16px] text-xs text-white/40">
        Drag to rotate
      </p>
    </div>
  );
}
