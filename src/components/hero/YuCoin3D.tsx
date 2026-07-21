"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const COIN_RADIUS = 1;
const COIN_THICKNESS = 0.17;
const FIELD_RADIUS = 0.848;
const LIP_INNER = 0.902;
const LIP_OUTER = COIN_RADIUS;
const LIP_HEIGHT = 0.014;
const GIRAFFE_RAISE = 0.046;
const COIN_SCALE = 0.74;
const FACE_Z = COIN_THICKNESS / 2;

function createToonGradient(steps = 2) {
  const canvas = document.createElement("canvas");
  canvas.width = steps;
  canvas.height = 1;
  const ctx = canvas.getContext("2d")!;
  const bands = ["#ffffff", "#777777"];
  for (let x = 0; x < steps; x++) {
    ctx.fillStyle = bands[Math.min(x, bands.length - 1)];
    ctx.fillRect(x, 0, 1, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

function flipShapeY(shape: THREE.Shape) {
  const flipped = new THREE.Shape(
    shape.getPoints().map((p) => new THREE.Vector2(p.x, -p.y)),
  );
  for (const hole of shape.holes) {
    flipped.holes.push(
      new THREE.Path(
        hole.getPoints().map((p) => new THREE.Vector2(p.x, -p.y)),
      ),
    );
  }
  return flipped;
}

function buildGiraffeGeometry() {
  return new Promise<THREE.BufferGeometry>((resolve, reject) => {
    const loader = new SVGLoader();
    loader.load(
      "/coin/yucoin-engrave.svg",
      (data) => {
        const parts: THREE.BufferGeometry[] = [];

        for (const path of data.paths) {
          for (const shape of SVGLoader.createShapes(path)) {
            parts.push(
              new THREE.ExtrudeGeometry(flipShapeY(shape), {
                depth: GIRAFFE_RAISE,
                bevelEnabled: true,
                bevelThickness: 0.006,
                bevelSize: 0.0045,
                bevelSegments: 2,
                curveSegments: 12,
              }),
            );
          }
        }

        if (!parts.length) {
          reject(new Error("No giraffe shapes found"));
          return;
        }

        const merged = parts.length === 1 ? parts[0] : mergeGeometries(parts)!;
        merged.computeBoundingBox();
        const box = merged.boundingBox!;
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        merged.translate(-center.x, -center.y, -box.min.z);

        const targetHeight = FIELD_RADIUS * 1.62;
        const s = targetHeight / size.y;
        merged.scale(s, s, 1);

        merged.computeBoundingBox();
        box.getCenter(center);
        merged.translate(-center.x, -center.y, -merged.boundingBox!.min.z);
        merged.computeVertexNormals();

        resolve(merged);
      },
      undefined,
      reject,
    );
  });
}

function annulusShape(innerR: number, outerR: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
  shape.holes.push(hole);
  return shape;
}

/** Lip extruded upward from z = 0 → LIP_HEIGHT (sits flush on the face plane). */
function buildLipGeometry() {
  const geo = new THREE.ExtrudeGeometry(annulusShape(LIP_INNER, LIP_OUTER), {
    depth: LIP_HEIGHT,
    bevelEnabled: true,
    bevelThickness: LIP_HEIGHT * 0.38,
    bevelSize: LIP_HEIGHT * 0.32,
    bevelSegments: 2,
    curveSegments: 96,
  });
  return geo;
}

function buildBodyGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, COIN_RADIUS, 0, Math.PI * 2, false);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: COIN_THICKNESS,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelSegments: 2,
    curveSegments: 96,
  });
  geo.translate(0, 0, -COIN_THICKNESS / 2);
  return geo;
}

function useGiraffeGeometry() {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  useEffect(() => {
    let active = true;
    buildGiraffeGeometry()
      .then((geo) => {
        if (active) setGeometry(geo);
        else geo.dispose();
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => geometry?.dispose(), [geometry]);
  return geometry;
}

function useCoinMaterials() {
  return useMemo(() => {
    const gradientMap = createToonGradient(2);
    const makeToon = (color: string) =>
      new THREE.MeshToonMaterial({ color, gradientMap });

    return {
      gradientMap,
      body: makeToon("#ffed44"),
      face: makeToon("#fff48e"),
      lip: makeToon("#ffe62a"),
      back: makeToon("#e8c820"),
      giraffe: makeToon("#ed9c28"),
      outline: new THREE.MeshBasicMaterial({
        color: "#c99218",
        side: THREE.BackSide,
      }),
    };
  }, []);
}

function CoinModel() {
  const groupRef = useRef<THREE.Group>(null);
  const bump = useRef({ rx: 0, ry: 0, px: 0, py: 0, pz: 0 });
  const giraffeGeometry = useGiraffeGeometry();
  const materials = useCoinMaterials();

  const bodyGeometry = useMemo(() => buildBodyGeometry(), []);
  const faceGeometry = useMemo(
    () => new THREE.CircleGeometry(FIELD_RADIUS, 128),
    [],
  );
  const lipGeometry = useMemo(() => buildLipGeometry(), []);

  useEffect(
    () => () => {
      bodyGeometry.dispose();
      faceGeometry.dispose();
      lipGeometry.dispose();
      materials.gradientMap.dispose();
      materials.body.dispose();
      materials.face.dispose();
      materials.lip.dispose();
      materials.back.dispose();
      materials.giraffe.dispose();
      materials.outline.dispose();
    },
    [bodyGeometry, faceGeometry, lipGeometry, materials],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const { pointer } = state;
    const dist = Math.hypot(pointer.x, pointer.y);
    const strength = THREE.MathUtils.clamp(1 - dist / 0.95, 0, 1) ** 2;
    const lerp = 1 - Math.pow(0.001, delta);

    bump.current.rx += (-pointer.y * strength * 0.1 - bump.current.rx) * lerp;
    bump.current.ry += (pointer.x * strength * 0.1 - bump.current.ry) * lerp;
    bump.current.px += (-pointer.x * strength * 0.035 - bump.current.px) * lerp;
    bump.current.py += (-pointer.y * strength * 0.035 - bump.current.py) * lerp;
    bump.current.pz += (strength * 0.015 - bump.current.pz) * lerp;

    group.rotation.x = 0.34 + bump.current.rx;
    group.rotation.y = -0.32 + bump.current.ry;
    group.position.set(bump.current.px, bump.current.py, bump.current.pz);
  });

  return (
    <group ref={groupRef} scale={COIN_SCALE}>
      <mesh geometry={bodyGeometry} material={materials.outline} scale={1.014} />
      <mesh geometry={bodyGeometry} material={materials.body} />

      <mesh
        geometry={faceGeometry}
        material={materials.back}
        position={[0, 0, -FACE_Z]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Face field — coplanar with body top at FACE_Z */}
      <mesh
        geometry={faceGeometry}
        material={materials.face}
        position={[0, 0, FACE_Z]}
      />

      {/* Giraffe emboss — base on face, grows outward */}
      {giraffeGeometry && (
        <mesh
          geometry={giraffeGeometry}
          material={materials.giraffe}
          position={[0, 0, FACE_Z]}
        />
      )}

      {/* Bevelled rim lip — base on face, only at outer edge */}
      <mesh
        geometry={lipGeometry}
        material={materials.lip}
        position={[0, 0, FACE_Z]}
      />
    </group>
  );
}

function SceneContent() {
  return (
    <>
      <ambientLight intensity={0.55} color="#fffef5" />
      <directionalLight position={[3, 5, 4]} intensity={1.35} color="#ffffff" />
      <directionalLight position={[-2, 1, 2]} intensity={0.28} color="#fff8d0" />

      <CoinModel />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 1.55}
        minAzimuthAngle={-Math.PI / 2.2}
        maxAzimuthAngle={Math.PI / 2.2}
        rotateSpeed={0.45}
        dampingFactor={0.08}
        enableDamping
      />
    </>
  );
}

export default function YuCoin3D() {
  return (
    <Canvas
      className="absolute inset-0 touch-none"
      camera={{ position: [0.46, 0.3, 5.1], fov: 22, near: 0.1, far: 50 }}
      dpr={[1, 2]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x000000, 0);
        gl.toneMapping = THREE.NoToneMapping;
        scene.background = null;
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
