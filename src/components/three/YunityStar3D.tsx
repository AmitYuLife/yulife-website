"use client";
// 3D Yunity star: steady body + standalone 1s halo breathing (see useFrame).

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { FLOW_STAGGER } from "@/lib/flowTiming";

// The four signal-dot colours, in the order the dots arrive at the star, so the
// glow can pulse through the same palette in time with them. CSS vars (set via
// `style.fill`, which resolves them) so the pulse matches the dots exactly.
const PULSE_COLORS = [
  "var(--green-600)",
  "var(--blue-600)",
  "var(--yellow-600)",
  "var(--purple-600)",
] as const;

/* ------------------------------------------------------------------ */
/* Geometry — concave superquadric diamond (3D); smooth star profile   */
/* (2D glow silhouette — the halo behind the canvas)                   */
/* ------------------------------------------------------------------ */

// Brand construction for the 2D glow silhouette: tips reach distance 1 along
// the axes, each concave flank is an arc of a large circle carved out along
// the 45° diagonal, and each tip is capped with a small circle tangent to its
// two carve circles. (The 3D mesh below is a different construction — a
// superquadric — but its exponent is derived from WAIST so both silhouettes
// share the same 45° waist.)
const WAIST = 0.52; // radius at the 45° waist (depth of the carve)
const TIP_R = 0.05; // radius of the rounded tip caps

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
 * Concave-faced diamond matching the Yunity mark: six tips at ±1 on each
 * axis, but instead of the octahedron |x|+|y|+|z| = 1 the surface is the
 * superquadric |x|^p + |y|^p + |z|^p = 1 with p < 1, so every face bowls
 * inward and every edge bows toward the centre. The silhouette waist sits at
 * 2^(1/2 − 1/p); CONCAVE_P is derived from BODY_WAIST. The body is carved a
 * touch shallower than the 2D halo star (WAIST) — matching it exactly read
 * as too sharp — so the halo's points peek out past a softer body.
 *
 * Each of the 8 octant faces is tessellated and its vertices projected onto
 * the superquadric (closed form: d · Σ|dᵢ|^p ^(−1/p)). Normals are the
 * analytic gradient p·sᵢ·|xᵢ|^(p−1) — with the sign sᵢ taken from the octant,
 * not the coordinate, so seam vertices (a coordinate at 0) get that face's
 * one-sided normal. The mesh stays non-indexed per octant, so duplicated seam
 * vertices carry different normals and the 8 edges stay razor sharp while
 * each face shades as one smooth polished surface. Both shells below share
 * this one geometry.
 */
const BODY_WAIST = 0.62; // 3D silhouette waist — softer than the halo's 0.52
const CONCAVE_P = 1 / (0.5 - Math.log2(BODY_WAIST)); // ≈ 0.82

function buildStarGeometry(segments = 24) {
  const p = CONCAVE_P;
  const positions: number[] = [];
  const normals: number[] = [];
  const EPS = 1e-4;

  const pushVertex = (dx: number, dy: number, dz: number, s: number[]) => {
    // Project the octant-plane point onto the superquadric surface.
    const m =
      Math.abs(dx) ** p + Math.abs(dy) ** p + Math.abs(dz) ** p || EPS;
    const t = m ** (-1 / p);
    const x = dx * t;
    const y = dy * t;
    const z = dz * t;
    positions.push(x, y, z);

    // Analytic gradient of Σ|xᵢ|^p, octant sign, clamped away from the
    // |xᵢ|^(p−1) blow-up at the seams (the limit there is correct: normals
    // flip hard across octant edges and lie ⟂ to the axis at the cusp tips).
    let nx = s[0] * Math.max(Math.abs(x), EPS) ** (p - 1);
    let ny = s[1] * Math.max(Math.abs(y), EPS) ** (p - 1);
    let nz = s[2] * Math.max(Math.abs(z), EPS) ** (p - 1);
    const len = Math.hypot(nx, ny, nz);
    nx /= len;
    ny /= len;
    nz /= len;
    normals.push(nx, ny, nz);
  };

  for (const sx of [1, -1]) {
    for (const sy of [1, -1]) {
      for (const sz of [1, -1]) {
        const s = [sx, sy, sz];
        // Corners of this octant's flat reference triangle; barycentric
        // point (u, v, w) → u·A + v·B + w·C, then projected onto the surface.
        const A = [sx, 0, 0];
        const B = [0, sy, 0];
        const C = [0, 0, sz];
        const at = (u: number, v: number) => {
          const w = 1 - u - v;
          return [
            u * A[0] + v * B[0] + w * C[0],
            u * A[1] + v * B[1] + w * C[1],
            u * A[2] + v * B[2] + w * C[2],
          ] as const;
        };

        // Standard triangle tessellation: rows of small triangles between
        // barycentric grid lines. Winding parity as before: (A, B, C) faces
        // outward when sx·sy·sz is positive; otherwise swap two vertices.
        const outward = sx * sy * sz > 0;
        const emit = (
          v0: readonly number[],
          v1: readonly number[],
          v2: readonly number[],
        ) => {
          pushVertex(v0[0], v0[1], v0[2], s);
          if (outward) {
            pushVertex(v1[0], v1[1], v1[2], s);
            pushVertex(v2[0], v2[1], v2[2], s);
          } else {
            pushVertex(v2[0], v2[1], v2[2], s);
            pushVertex(v1[0], v1[1], v1[2], s);
          }
        };

        for (let i = 0; i < segments; i++) {
          for (let j = 0; j < segments - i; j++) {
            const u0 = i / segments;
            const u1 = (i + 1) / segments;
            const v0 = j / segments;
            const v1 = (j + 1) / segments;
            emit(at(u0, v0), at(u1, v0), at(u0, v1));
            if (j < segments - i - 1) {
              emit(at(u1, v0), at(u1, v1), at(u0, v1));
            }
          }
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
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
  pulseRef,
  reduced,
}: {
  spin: React.MutableRefObject<SpinState>;
  haloRef: React.RefObject<HTMLDivElement | null>;
  pulseRef: React.RefObject<SVGPathElement | null>;
  reduced: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Group>(null);

  // Both shells share the one tessellated superquadric geometry.
  const geometry = useMemo(() => buildStarGeometry(), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

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

    // Base aura: a gentle breath so the star always carries a soft glow. Kept
    // faint so the glow reads as a diffuse halo, not a hard rim.
    const breath = 0.5 - 0.5 * Math.cos(t * Math.PI * 2); // 0..1, 1s period
    const halo = haloRef.current;
    if (halo) halo.style.opacity = String(0.24 + 0.07 * breath);

    // Colour pulse: read the SAME flow clock the signal dots use (performance
    // .now, not the R3F clock) so the glow beats with their arrivals, swelling
    // through the dot palette — one coloured pulse per dot. The envelope is 0 at
    // the beat boundaries, where the colour switches, so it cross-fades cleanly
    // instead of snapping. Screen-blended (see the halo wrapper) so the vibrant
    // hues read as light against the purple band rather than muddying into it.
    const pulse = pulseRef.current;
    if (pulse) {
      const beat = performance.now() / 1000 / FLOW_STAGGER;
      const k = Math.floor(beat);
      const frac = beat - k; // 0 at a dot's arrival → 1 at the next
      const env = 0.5 - 0.5 * Math.cos(frac * Math.PI * 2); // smooth bump, 0 at ends
      const n = PULSE_COLORS.length;
      pulse.style.fill = PULSE_COLORS[((k % n) + n) % n];
      pulse.style.opacity = String(0.45 * env);
    }

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
  const pulseRef = useRef<SVGPathElement>(null);
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
        // Screen blend so the glow adds light to the deep-purple band it sits on
        // (the vibrant hues brighten it) rather than painting over it.
        style={{ opacity: 0.28, transform: "translate(-50%, -50%)", mixBlendMode: "screen" }}
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
            <filter id="starGlowBlur" x="-90%" y="-90%" width="280%" height="280%">
              <feGaussianBlur stdDeviation="0.16" />
            </filter>
            {/* Softer, wider blur for the pulse so it blooms diffusely past the
                silhouette rather than tracing a sharp coloured edge. */}
            <filter id="starPulseBlur" x="-120%" y="-120%" width="340%" height="340%">
              <feGaussianBlur stdDeviation="0.34" />
            </filter>
          </defs>
          {/* Base multi-hue aura — a steady soft glow, gently breathing. */}
          <g filter="url(#starGlowBlur)">
            <path d={GLOW_PATH_D} fill="url(#starGlowPurple)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowYellow)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowGreen)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowTeal)" />
            <path d={GLOW_PATH_D} fill="url(#starGlowBlue)" />
          </g>
          {/* Dot-colour pulse — fill + opacity are driven per frame from the
              shared flow clock (see useFrame), so it beats in the dots' colours. */}
          <path
            ref={pulseRef}
            d={GLOW_PATH_D}
            filter="url(#starPulseBlur)"
            style={{ fill: "var(--green-600)", opacity: 0 }}
          />
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
        <StarScene spin={spin} haloRef={haloRef} pulseRef={pulseRef} reduced={reduced} />
      </Canvas>
    </div>
  );
}
