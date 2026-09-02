/**
 * Shared illustrated ("toon") YuCoin look — flat colours plus two hard-edged
 * diagonal highlight bands, ported from the YuCoin Figma plugin
 * (yucoin-figma-plugin, src/ui/Coin.jsx), the source of truth for this style.
 *
 * The home-hero coin (SpinningCoin3D) drives the sheen in WORLD space so the
 * highlight sweeps as the coin spins under a fixed light. The businesses-hero
 * orbit uses ORIENTED space instead: the orbit carries each coin all over the
 * canvas and the moon-lock keeps turning it, so a raw world-space band would
 * either miss the coin entirely (translation) or be glued to the geometry and
 * roll with it (object space). Oriented space measures the streak from the
 * vertex's offset from its OWN centre, rotated into world axes and normalised
 * by the coin's scale — the band then holds a fixed SCREEN direction on every
 * coin, and the coin's surface sweeps under it as it turns, reading as one
 * consistent light for the whole orbit. (The ortho camera looks straight down
 * −Z, so world XY = screen XY.)
 */
import * as THREE from "three";

export type ToonSheenSpace = "world" | "oriented";

// ─── Colours ─────────────────────────────────────────────────────────────────
// Each surface has a base colour and the lighter colour the sheen swaps in; the
// rim's pair is what makes the streak read as continuing over the coin's edge.
// Measured directly off the reference illustration (Figma: Illustration
// Library, node 18205:130).
const TOON_FACE_COLOR = "#FFE242";
const TOON_FACE_LIT_COLOR = "#FEF399";
const TOON_RIM_COLOR = "#F99E02";
const TOON_RIM_LIT_COLOR = "#F9B80D";
const TOON_LINE_COLOR = "#FA9E00";
const TOON_LINE_LIT_COLOR = "#FAC118";

// Direction toward the nominal key light.
export const TOON_LIGHT_DIR = new THREE.Vector3(4, 6, 5).normalize();

// Fixed 45° streak, measured off the reference. The axis is the band's
// *normal*, so -45° puts the band itself on the bottom-left-to-top-right
// diagonal the reference uses.
const TOON_STREAK_ANGLE = -Math.PI / 4;
export const TOON_STREAK_AXIS = new THREE.Vector2(
  Math.cos(TOON_STREAK_ANGLE),
  Math.sin(TOON_STREAK_ANGLE),
);

// ─── Geometry cross-section (mirrored from assets.ts) ────────────────────────
const COIN_RADIUS = 1;
const FACE_Z = 0.12;
const EDGE_Z = 0.102;
const SEG = 96;
const FACE_RADIUS = 0.96;

// Two parallel bands: wide band, thin unlit gap, narrow band — widths as
// fractions of the face radius, measured from the reference.
const TOON_WIDE_HALF_WIDTH = (0.457 / 2) * FACE_RADIUS;
const TOON_NARROW_OFFSET = 0.386 * FACE_RADIUS;
const TOON_NARROW_HALF_WIDTH = (0.173 / 2) * FACE_RADIUS;

// See the plugin for the derivation of these three: they re-zero the
// light/view half-vector against a head-on view and centre the band pair on
// the face at drive 0.
const TOON_DRIVE_REFERENCE_VIEW = new THREE.Vector3(0, 0, 1);
export const TOON_DRIVE_BASELINE = new THREE.Vector3()
  .addVectors(TOON_LIGHT_DIR, TOON_DRIVE_REFERENCE_VIEW)
  .normalize()
  .dot(new THREE.Vector3(TOON_STREAK_AXIS.x, TOON_STREAK_AXIS.y, 0));
export const TOON_DRIVE_CENTRE_OFFSET =
  -(TOON_NARROW_OFFSET + TOON_NARROW_HALF_WIDTH - TOON_WIDE_HALF_WIDTH) / 2;
export const TOON_DRIVE_SCALE = 1.1;

// ─── Shaders ─────────────────────────────────────────────────────────────────
// WORLD: the fragment's world-space XY — the highlight is fixed in the scene,
// so a coin spinning in place (the home hero) sweeps through it.
const worldVertexShader = /* glsl */ `
  varying vec3 vCoord;
  void main() {
    vCoord = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ORIENTED: the vertex's offset from the coin's OWN centre, with the coin's
// rotation applied but its translation removed and its scale normalised out.
// mat3(modelMatrix) is R·S (rotation·uniform-scale); dividing by the scale
// (the length of a basis column) leaves R·position — a screen-oriented,
// scale-invariant, per-coin-centred coordinate. The band holds a fixed screen
// direction on every coin and the surface sweeps under it as the coin turns.
const orientedVertexShader = /* glsl */ `
  varying vec3 vCoord;
  void main() {
    float coinScale = length(modelMatrix[0].xyz);
    vCoord = (mat3(modelMatrix) * position) / max(coinScale, 1e-6);
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

  varying vec3 vCoord;

  vec3 linearToSRGB(vec3 c) {
    vec3 low = c * 12.92;
    vec3 high = 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055;
    return mix(high, low, step(c, vec3(0.0031308)));
  }

  float band(float coord, float centre, float halfWidth) {
    return step(centre - halfWidth, coord) - step(centre + halfWidth, coord);
  }

  void main() {
    float coord = dot(vCoord.xy, uStreakAxis);

    float lit =
      band(coord, uDrive, uWideHalfWidth) +
      band(coord, uDrive + uNarrowOffset, uNarrowHalfWidth);

    vec3 color = mix(uBaseColor, uLitColor, clamp(lit, 0.0, 1.0));
    gl_FragColor = vec4(linearToSRGB(color), 1.0);
  }
`;

/**
 * Build one toon sheen material.
 * @param space "world" for the spinning coin's swept sheen; "oriented" for the
 * orbit, where the streak holds a fixed screen direction on every coin.
 */
function makeToonSheenMaterial(
  baseColorHex: string,
  litColorHex: string,
  space: ToonSheenSpace = "world",
) {
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
    vertexShader: space === "world" ? worldVertexShader : orientedVertexShader,
    fragmentShader: sheenFragmentShader,
  });
}

export interface ToonSheenMaterials {
  faceMaterial: THREE.ShaderMaterial;
  edgeMaterial: THREE.ShaderMaterial;
  engraveMaterial: THREE.ShaderMaterial;
}

/** The three toon materials (face / rim / engrave) built together. */
export function makeToonSheenMaterials(space: ToonSheenSpace = "world"): ToonSheenMaterials {
  return {
    faceMaterial: makeToonSheenMaterial(TOON_FACE_COLOR, TOON_FACE_LIT_COLOR, space),
    edgeMaterial: makeToonSheenMaterial(TOON_RIM_COLOR, TOON_RIM_LIT_COLOR, space),
    engraveMaterial: makeToonSheenMaterial(TOON_LINE_COLOR, TOON_LINE_LIT_COLOR, space),
  };
}

export interface ToonCoinGeometry {
  /** Rim/bevel/side surfaces — all rendered with edgeMaterial. */
  edges: THREE.BufferGeometry[];
  faceFront: THREE.BufferGeometry;
  faceBack: THREE.BufferGeometry;
}

/**
 * The illustrated coin body split by surface (rebuilt instead of reusing the
 * merged gold geometry, because the toon style needs the rim and face in
 * different materials). The engrave geometry is the shared singleton from
 * assets.ts (getCoinAssets().engraveBoth) — the caller pairs it with
 * engraveMaterial.
 */
export function buildToonCoinGeometry(): ToonCoinGeometry {
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

  return { edges, faceFront, faceBack };
}
