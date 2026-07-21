# YuCoin 3D

Realistic gold YuCoin rendered with React Three Fiber. The giraffe engraving
is the exact `CoinEngrave` path from the design system (Figma node 2022:1566),
inlined — no runtime asset fetches.

## Files

- `assets.ts` — geometries, materials, and the grain texture, built lazily
  **once per page** and shared by every coin instance.
- `YuCoin.tsx` — one coin (no canvas). Compose as many as you like per scene.
- `CoinLighting.tsx` — lights + local environment reflections. One per canvas.
- `YuCoinCanvas.tsx` — drop-in single-coin transparent canvas (same contract
  as the old `YuCoin3D`).

## Single coin (current hero usage)

```tsx
const YuCoinCanvas = dynamic(() => import("../yucoin/YuCoinCanvas"), { ssr: false });

<div className="relative aspect-square w-[16rem]">
  <YuCoinCanvas />
</div>
```

## Multiple coins, one canvas (homepage field)

```tsx
"use client";
import { Canvas } from "@react-three/fiber";
import YuCoin from "@/components/yucoin/YuCoin";
import CoinLighting from "@/components/yucoin/CoinLighting";

const COINS = [
  { position: [0, 0, 0] as const, scale: 1 },
  { position: [-2.4, 1.1, -1] as const, scale: 0.55 },
  { position: [2.6, -0.8, -1.5] as const, scale: 0.4 },
];

export default function CoinField() {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 4.6], fov: 30 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <CoinLighting />
      {COINS.map((coin, i) => (
        <YuCoin key={i} {...coin} phase={i * 1.7} />
      ))}
    </Canvas>
  );
}
```

`phase` offsets the idle sway so coins don't move in lockstep. Other props:
`baseTilt` (resting pose), `pointerTilt` (0 disables cursor-follow), `idle`
(0 disables the sway/bob), `hoverScale`, `backFace` (pass `false` when a coin
can never turn past ~90° — halves its heaviest geometry with no visible
difference).

For custom multi-coin canvases, reuse the built-in offscreen pause and shader
precompile:

```tsx
const wrapper = useRef<HTMLDivElement>(null);
const frameloop = useVisibleFrameloop(wrapper); // from ./useVisibleFrameloop

<div ref={wrapper} className="absolute inset-0">
  <Canvas frameloop={frameloop} ...>
    ...
    <Preload all /> {/* from @react-three/drei */}
  </Canvas>
</div>
```

## Performance notes

- All coins share one set of geometries/materials/one 256px texture; each
  extra coin adds a handful of draw calls and nothing else. A dozen coins in
  one canvas is comfortable on mid-range mobile.
- Prefer ONE canvas holding many coins over many canvases (each canvas is a
  separate WebGL context — browsers cap these, and each costs memory).
- Materials stay MeshPhysicalMaterial on purpose: its env-light multiscatter
  compensation keeps the gold rich; MeshStandardMaterial renders visibly
  paler here despite being cheaper.
- The engraving is welded into an indexed geometry at build time (~2-3x fewer
  vertices to process than the raw extrusion).
- Pointer hover raycasts against an invisible low-poly disc per coin — the
  visible meshes opt out — so mousemove cost stays flat as coins are added.
- `YuCoinCanvas` stops its render loop entirely while scrolled offscreen
  (`useVisibleFrameloop`) and precompiles shaders before first paint
  (`<Preload all />`).
- The shared assets intentionally persist for the app lifetime (never
  disposed); they are a few hundred KB of GPU memory total.
- Respects `prefers-reduced-motion`: coins hold their resting pose.
