"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { getCoinAssets } from "@/components/yucoin/assets";

/** Production values from assets.ts / CoinLighting.tsx — the reset baseline. */
const DEFAULTS = {
  gold: {
    color: "#f0c060",
    metalness: 1,
    roughness: 0.32,
    envMapIntensity: 1.4,
    clearcoat: 0,
    grain: true,
  },
  engrave: { color: "#dda43e", metalness: 1, roughness: 0.2, envMapIntensity: 1.5 },
  lights: { ambient: 0.25, key: 1.1, fill: 0.25 },
  env: { base: "#8d8474", formers: 1 },
};

type LabParams = {
  gold: typeof DEFAULTS.gold;
  engrave: typeof DEFAULTS.engrave;
  lights: typeof DEFAULTS.lights;
  env: typeof DEFAULTS.env;
};

const cloneDefaults = (): LabParams => JSON.parse(JSON.stringify(DEFAULTS));

/** Brand three-quarter pose the coin starts (and resets) to. */
const HOME_POSE = { x: -0.06, y: 0.45 };

type SpinState = {
  dragging: boolean;
  pending: { x: number; y: number };
  vel: { x: number; y: number };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * The coin itself. Materials are CLONES of the shared singletons so slider
 * tweaks here can never leak into the hero coins if the user navigates on.
 */
function LabCoin({
  params,
  spin,
  zoom,
  resetToken,
}: {
  params: LabParams;
  spin: MutableRefObject<SpinState>;
  zoom: MutableRefObject<number>;
  resetToken: number;
}) {
  const outer = useRef<THREE.Group>(null);
  const group = useRef<THREE.Group>(null);
  const { assets, gold, engrave, grainMap } = useMemo(() => {
    const shared = getCoinAssets();
    return {
      assets: shared,
      gold: shared.gold.clone(),
      engrave: shared.goldEngrave.clone(),
      grainMap: shared.gold.roughnessMap,
    };
  }, []);

  useEffect(() => () => {
    gold.dispose();
    engrave.dispose();
  }, [gold, engrave]);

  useEffect(() => {
    const g = params.gold;
    // Toggling clearcoat or the grain map across zero/null changes the shader
    // program, not just uniforms — flag a recompile only when that happens.
    if ((gold.clearcoat > 0) !== (g.clearcoat > 0)) gold.needsUpdate = true;
    gold.color.set(g.color);
    gold.metalness = g.metalness;
    gold.roughness = g.roughness;
    gold.envMapIntensity = g.envMapIntensity;
    gold.clearcoat = g.clearcoat;
    const wantMap = g.grain ? grainMap : null;
    if (gold.roughnessMap !== wantMap) {
      gold.roughnessMap = wantMap;
      gold.needsUpdate = true;
    }

    const e = params.engrave;
    engrave.color.set(e.color);
    engrave.metalness = e.metalness;
    engrave.roughness = e.roughness;
    engrave.envMapIntensity = e.envMapIntensity;
  }, [params, gold, engrave, grainMap]);

  useEffect(() => {
    group.current?.rotation.set(HOME_POSE.x, HOME_POSE.y, 0);
    zoom.current = 1;
    spin.current.vel.x = 0;
    spin.current.vel.y = 0;
    spin.current.pending.x = 0;
    spin.current.pending.y = 0;
  }, [resetToken, spin, zoom]);

  useFrame((_, delta) => {
    const g = group.current;
    const o = outer.current;
    if (!g || !o) return;
    const dt = Math.min(delta, 0.1);
    const s = spin.current;
    const RATE = 0.0055;

    if (s.pending.x !== 0 || s.pending.y !== 0) {
      g.rotation.y += s.pending.x * RATE;
      g.rotation.x += s.pending.y * RATE;
      s.vel.x = s.pending.x;
      s.vel.y = s.pending.y;
      s.pending.x = 0;
      s.pending.y = 0;
    } else if (!s.dragging) {
      // Released: keep spinning with the throw velocity, decaying smoothly.
      g.rotation.y += s.vel.x * RATE;
      g.rotation.x += s.vel.y * RATE;
      const decay = Math.exp(-3.2 * dt);
      s.vel.x *= decay;
      s.vel.y *= decay;
    }

    o.scale.setScalar(THREE.MathUtils.damp(o.scale.x, zoom.current, 8, dt));
  });

  return (
    <group ref={outer}>
      <group ref={group} rotation={[HOME_POSE.x, HOME_POSE.y, 0]}>
        {/* Free-spinning lab view always shows both sides — pre-merged,
            pre-positioned buffers, so this is still just 2 draw calls. */}
        <mesh geometry={assets.goldBoth} material={gold} />
        <mesh geometry={assets.engraveBoth} material={engrave} />
      </group>
    </group>
  );
}

/** CoinLighting's rig, with every source parameterised. */
function LabLighting({ lights, env }: { lights: LabParams["lights"]; env: LabParams["env"] }) {
  return (
    <>
      <ambientLight intensity={lights.ambient} />
      <directionalLight position={[4, 6, 5]} intensity={lights.key} />
      <directionalLight position={[-5, -2, 3]} intensity={lights.fill} color="#ffe6b0" />

      {/* The env map renders once; key remounts it when its inputs change. */}
      <Environment resolution={256} key={`${env.base}|${env.formers}`}>
        <color attach="background" args={[env.base]} />
        <Lightformer form="rect" intensity={4 * env.formers} position={[0, 5, 6]} scale={[10, 5, 1]} color="#fff0cc" />
        <Lightformer form="rect" intensity={1.2 * env.formers} position={[-6, 1, 4]} rotation-y={0.6} scale={[3, 8, 1]} color="#f2d59c" />
        <Lightformer form="rect" intensity={1 * env.formers} position={[6, -1, 3]} rotation-y={-0.6} scale={[3, 8, 1]} color="#f2d59c" />
        <Lightformer form="ring" intensity={1.2 * env.formers} position={[0, -5, 4]} scale={5} color="#f5cf8e" />
      </Environment>
    </>
  );
}

function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="flex items-baseline justify-between gap-[8px] text-white/70">
        <span className="truncate">{label}</span>
        <span className="shrink-0 tabular-nums text-white/50">{value.toFixed(2)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-[4px] block w-full accent-amber-300"
      />
    </label>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-[8px] text-xs text-white/70">
      <span className="truncate">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[24px] w-[40px] shrink-0 cursor-pointer rounded-[6px] border border-white/20 bg-transparent"
      />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-[10px] border-t border-white/10 pt-[12px] first:border-t-0 first:pt-0">
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/50">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Single-coin playground: drag anywhere to spin the coin freely, scroll to
 * zoom, and tune every parameter of the two live materials, the three light
 * sources, and the reflection environment.
 */
export default function CoinLab() {
  const [params, setParams] = useState<LabParams>(cloneDefaults);
  const [resetToken, setResetToken] = useState(0);
  const spin = useRef<SpinState>({
    dragging: false,
    pending: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
  });
  const zoom = useRef(1);
  const stage = useRef<HTMLDivElement>(null);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoom.current = clamp(zoom.current * Math.exp(-e.deltaY * 0.0014), 0.3, 4.5);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const patch = <K extends keyof LabParams>(key: K, value: Partial<LabParams[K]>) =>
    setParams((p) => ({ ...p, [key]: { ...p[key], ...value } }));

  return (
    <div className="fixed inset-0 z-[100] bg-[#150041]">
      <div
        ref={stage}
        className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          spin.current.dragging = true;
          spin.current.vel.x = 0;
          spin.current.vel.y = 0;
          last.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerMove={(e) => {
          if (!spin.current.dragging) return;
          spin.current.pending.x += e.clientX - last.current.x;
          spin.current.pending.y += e.clientY - last.current.y;
          last.current = { x: e.clientX, y: e.clientY };
        }}
        onPointerUp={() => (spin.current.dragging = false)}
        onPointerCancel={() => (spin.current.dragging = false)}
      >
        <Canvas
          orthographic
          camera={{ position: [0, 0, 10], zoom: 230, near: 0.1, far: 100 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        >
          <LabLighting lights={params.lights} env={params.env} />
          <LabCoin params={params} spin={spin} zoom={zoom} resetToken={resetToken} />
        </Canvas>
      </div>

      <p className="pointer-events-none absolute bottom-[16px] left-[16px] text-xs text-white/40">
        Drag to spin · Scroll to zoom
      </p>

      {/* Spacing utilities in this codebase are pixel-suffixed tokens, not
          Tailwind's 4px scale — sizes here are explicit px values. */}
      <aside className="absolute bottom-[16px] right-[16px] top-[16px] w-[280px] max-w-[calc(100vw-32px)] space-y-[14px] overflow-y-auto rounded-[16px] bg-black/50 p-[16px] backdrop-blur">
        <Section title="Gold material">
          <ColorField label="Colour" value={params.gold.color} onChange={(v) => patch("gold", { color: v })} />
          <Slider label="Metalness" value={params.gold.metalness} onChange={(v) => patch("gold", { metalness: v })} />
          <Slider label="Roughness" value={params.gold.roughness} onChange={(v) => patch("gold", { roughness: v })} />
          <Slider label="Env intensity" value={params.gold.envMapIntensity} max={3} onChange={(v) => patch("gold", { envMapIntensity: v })} />
          <Slider label="Clearcoat" value={params.gold.clearcoat} onChange={(v) => patch("gold", { clearcoat: v })} />
          <label className="flex items-center justify-between text-xs text-white/70">
            <span>Micro-grain</span>
            <input
              type="checkbox"
              checked={params.gold.grain}
              onChange={(e) => patch("gold", { grain: e.target.checked })}
              className="accent-amber-300"
            />
          </label>
        </Section>

        <Section title="Engrave material">
          <ColorField label="Colour" value={params.engrave.color} onChange={(v) => patch("engrave", { color: v })} />
          <Slider label="Metalness" value={params.engrave.metalness} onChange={(v) => patch("engrave", { metalness: v })} />
          <Slider label="Roughness" value={params.engrave.roughness} onChange={(v) => patch("engrave", { roughness: v })} />
          <Slider label="Env intensity" value={params.engrave.envMapIntensity} max={3} onChange={(v) => patch("engrave", { envMapIntensity: v })} />
        </Section>

        <Section title="Lights">
          <Slider label="Ambient" value={params.lights.ambient} max={1.5} onChange={(v) => patch("lights", { ambient: v })} />
          <Slider label="Key" value={params.lights.key} max={3} onChange={(v) => patch("lights", { key: v })} />
          <Slider label="Warm fill" value={params.lights.fill} max={2} onChange={(v) => patch("lights", { fill: v })} />
        </Section>

        <Section title="Environment">
          <ColorField label="Base colour" value={params.env.base} onChange={(v) => patch("env", { base: v })} />
          <Slider label="Lightformers" value={params.env.formers} max={2.5} onChange={(v) => patch("env", { formers: v })} />
        </Section>

        <div className="flex gap-[8px] border-t border-white/10 pt-[12px]">
          <button
            type="button"
            onClick={() => setParams(cloneDefaults())}
            className="flex-1 rounded-[8px] bg-white/10 px-[8px] py-[6px] text-xs text-white/80 transition hover:bg-white/20"
          >
            Reset shaders
          </button>
          <button
            type="button"
            onClick={() => setResetToken((t) => t + 1)}
            className="flex-1 rounded-[8px] bg-white/10 px-[8px] py-[6px] text-xs text-white/80 transition hover:bg-white/20"
          >
            Reset view
          </button>
        </div>
      </aside>
    </div>
  );
}
