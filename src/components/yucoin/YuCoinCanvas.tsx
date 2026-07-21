"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import YuCoin from "./YuCoin";
import CoinLighting from "./CoinLighting";
import useVisibleFrameloop from "./useVisibleFrameloop";

/**
 * Drop-in single-coin canvas (same contract as the previous YuCoin3D):
 * transparent background, fills its positioned parent. For multiple coins,
 * compose your own <Canvas> with <CoinLighting /> and several <YuCoin />
 * instances instead — see README.md in this folder.
 */
export default function YuCoinCanvas() {
  const wrapper = useRef<HTMLDivElement>(null);
  // Stop rendering entirely while scrolled offscreen
  const frameloop = useVisibleFrameloop(wrapper);

  return (
    <div ref={wrapper} className="absolute inset-0 touch-none">
      <Canvas
        frameloop={frameloop}
        camera={{ position: [0, 0, 4.6], fov: 30, near: 0.1, far: 50 }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <CoinLighting />
        {/* The hero pose never turns past 90°, so skip the reverse face */}
        <YuCoin scale={0.92} backFace={false} />
        {/* Compile shaders before first paint instead of on first frame */}
        <Preload all />
      </Canvas>
    </div>
  );
}
