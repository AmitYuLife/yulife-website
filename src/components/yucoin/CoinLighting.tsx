"use client";

import { Environment, Lightformer } from "@react-three/drei";

/**
 * Lighting rig for YuCoin scenes. Add ONE of these per Canvas, however many
 * coins the canvas holds. Reflections come from Lightformers rendered into a
 * small local environment map — nothing is fetched over the network.
 */
export default function CoinLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[4, 6, 5]} intensity={1.1} />
      <directionalLight position={[-5, -2, 3]} intensity={0.25} color="#ffe6b0" />

      <Environment resolution={256}>
        {/* Warm base so the metal never reflects pure black */}
        <color attach="background" args={["#8d8474"]} />
        <Lightformer form="rect" intensity={4} position={[0, 5, 6]} scale={[10, 5, 1]} color="#fff0cc" />
        <Lightformer form="rect" intensity={1.2} position={[-6, 1, 4]} rotation-y={0.6} scale={[3, 8, 1]} color="#f2d59c" />
        <Lightformer form="rect" intensity={1} position={[6, -1, 3]} rotation-y={-0.6} scale={[3, 8, 1]} color="#f2d59c" />
        <Lightformer form="ring" intensity={1.2} position={[0, -5, 4]} scale={5} color="#f5cf8e" />
      </Environment>
    </>
  );
}
