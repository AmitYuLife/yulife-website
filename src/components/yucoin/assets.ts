/**
 * Shared, lazily-built YuCoin assets.
 *
 * Everything here — geometries, materials, the grain texture — is built ONCE
 * per page and shared by every <YuCoin /> instance, so adding more coins to a
 * canvas costs only ~5 extra draw calls each, no extra memory or shader
 * compiles. The singletons intentionally live for the lifetime of the app and
 * are never disposed.
 *
 * Client-only: call getCoinAssets() from inside a component render/effect
 * (it touches `document` to build the grain texture).
 */
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Coin cross-section: flat face running straight into an edge bevel, then a
// cylindrical side — one continuous solid
export const COIN_RADIUS = 1;
export const FACE_Z = 0.12; // z of the flat face
const FACE_RADIUS = 0.96; // where the edge bevel begins
const EDGE_Z = 0.102; // where the bevel meets the cylindrical side
const SEG = 96; // radial segments

/** Where the embossed giraffe sits so its bevel is embedded in the face. */
export const ENGRAVE_Z = FACE_Z + 0.014;

const SVG_SIZE = 868; // viewBox of the Figma export

// The YuCoin giraffe engraving (Figma node 2022:1566), inlined so the
// component needs no runtime asset fetch.
const ENGRAVE_PATH =
  "M441.859 367.659C449.937 357.515 463.148 351.022 474.803 357.636C512.669 381.172 486.163 314.5 443.752 335.318C425.45 344.326 426.208 387.259 441.859 367.659ZM423.094 689.535C377.655 679.958 366 749.592 408.915 756.491L423.515 759.331C424.631 759.55 425.781 759.555 426.899 759.345C428.017 759.135 429.081 758.715 430.031 758.108C430.98 757.502 431.797 756.72 432.433 755.809C433.069 754.898 433.513 753.875 433.739 752.798L470.343 579.524C470.606 578.445 470.638 577.326 470.436 576.235C470.233 575.144 469.802 574.105 469.167 573.181C468.532 572.257 467.708 571.468 466.746 570.863C465.783 570.258 464.702 569.85 463.569 569.663L457.468 568.446C456.352 568.221 455.2 568.212 454.08 568.42C452.96 568.627 451.893 569.047 450.943 569.655C449.992 570.262 449.175 571.046 448.541 571.96C447.906 572.874 447.465 573.9 447.244 574.979L423.094 689.535ZM654.92 360.03C612.552 312.147 532.065 271.77 456.669 254.849C462.433 214.27 490.328 209.522 514.562 180.467C520.873 170.647 538.123 168.699 538.544 154.78C540.227 145.609 533.495 138.224 526.89 132.462C513.594 119.152 494.577 129.459 488.603 144.23C483.68 150.154 475.686 152.873 470.511 158.716C469.796 159.244 447.118 184.484 446.403 185.093C441.775 175.192 431.761 147.76 424.02 139.969C420.023 136.722 418.971 128.444 417.793 123.737C412.323 99.3894 374.036 106.815 369.24 127.795C366.463 137.453 373.994 145.893 380.263 152.548C384.681 159.163 384.891 167.563 389.267 174.339C411.398 204.246 417.12 218.977 413.165 247.707C395.984 245.816 378.637 245.816 361.456 247.707C327.293 185.905 250.761 188.096 194.046 189.719L180.834 190.125L182.728 202.786C192.91 269.741 207.972 369.688 309.201 371.596C308.486 434.696 293.634 491.71 274.995 562.846C264.645 602.411 252.991 647.008 242.388 698.624C242.162 699.709 242.159 700.826 242.382 701.912C242.604 702.997 243.047 704.03 243.684 704.95C244.321 705.87 245.141 706.659 246.095 707.273C247.05 707.887 248.12 708.312 249.246 708.526L255.389 709.662C257.648 710.08 259.986 709.618 261.894 708.379C263.801 707.14 265.123 705.223 265.571 703.048C270.318 680.032 275.494 657.102 281.096 634.266C334.109 658.613 354.977 570.962 297.505 569.947C317.826 492.238 333.94 431.044 332.846 359.868V356.703C332.815 355.584 332.55 354.482 332.068 353.463C331.586 352.444 330.897 351.529 330.042 350.772C329.186 350.015 328.182 349.432 327.088 349.056C325.994 348.681 324.833 348.521 323.674 348.587H320.435C240.789 353.132 220.973 290.64 208.182 212.078C271.84 210.861 321.781 216.136 343.828 264.831L344.837 267.023C345.621 268.749 346.987 270.17 348.713 271.054C350.439 271.938 352.424 272.233 354.346 271.892L356.786 271.486C437.483 256.959 578.935 309.144 636.996 374.842C661.399 402.436 669.098 429.299 659.716 454.58C659.716 454.58 637.838 534.116 544.266 536.064H543.635C539.848 536.267 454.86 540.527 406.307 509.281C404.511 508.094 402.316 507.605 400.162 507.914C398.008 508.222 396.055 509.305 394.695 510.945L390.782 515.652C390.038 516.555 389.495 517.595 389.184 518.709C388.874 519.822 388.803 520.985 388.977 522.125C389.15 523.266 389.564 524.36 390.193 525.341C390.822 526.321 391.652 527.167 392.633 527.826C446.74 563.049 534.673 559.356 544.687 558.747C652.816 556.475 679.659 470.366 682.099 461.763C694.09 429.218 684.708 393.995 654.962 360.233L654.92 360.03Z";

const ENGRAVE_SVG = `<svg viewBox="0 0 ${SVG_SIZE} ${SVG_SIZE + 1}" xmlns="http://www.w3.org/2000/svg"><path d="${ENGRAVE_PATH}"/></svg>`;

// Subtle micro-grain roughness variation — one tiny canvas, no bump map
function makeGrainTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const image = ctx.createImageData(size, size);
  const data = image.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = 225 + Math.random() * 30;
    data[i] = data[i + 1] = data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Rescale a part's UVs so the noise grain has the same world-space density
// as on the face (cylinder/frustum UVs otherwise stretch it beyond visibility)
function scaleUV(geometry: THREE.BufferGeometry, uRepeat: number, vRepeat: number) {
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, uv.getX(i) * uRepeat, uv.getY(i) * vRepeat);
  }
}

// Solid coin body assembled from crisp surfaces (no smoothed lathe normals):
// cylindrical side plus a true edge bevel on each face
function makeBodyGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const tile = FACE_RADIUS * 2; // world size the noise texture covers on the face
  const circumference = Math.PI * 2 * COIN_RADIUS;

  const side = new THREE.CylinderGeometry(COIN_RADIUS, COIN_RADIUS, EDGE_Z * 2, SEG, 1, true);
  scaleUV(side, circumference / tile, (EDGE_Z * 2) / tile);
  parts.push(side);

  const bevel = new THREE.CylinderGeometry(FACE_RADIUS, COIN_RADIUS, FACE_Z - EDGE_Z, SEG, 1, true);
  bevel.translate(0, (FACE_Z + EDGE_Z) / 2, 0);
  const bevelSlant = Math.hypot(COIN_RADIUS - FACE_RADIUS, FACE_Z - EDGE_Z);
  scaleUV(bevel, circumference / tile, bevelSlant / tile);
  parts.push(bevel, bevel.clone().rotateX(Math.PI));

  const geometry = mergeGeometries(parts)!;
  geometry.rotateX(Math.PI / 2); // cylinder axis Y -> Z, so the coin faces the camera
  return geometry;
}

function makeEngraveGeometry(): THREE.BufferGeometry {
  const { paths } = new SVGLoader().parse(ENGRAVE_SVG);
  const shapes = paths.flatMap((path) => SVGLoader.createShapes(path));
  const extruded = new THREE.ExtrudeGeometry(shapes, {
    depth: 7,
    bevelEnabled: true,
    bevelThickness: 3,
    bevelSize: 3,
    bevelSegments: 2,
    curveSegments: 12,
  });
  // Weld the non-indexed extrusion into an indexed geometry (~2-3x fewer
  // vertices to process). Done before scaling, while the weld tolerance is
  // tiny relative to feature size; hard edges survive because vertices only
  // merge when normals match too.
  const geometry = mergeVertices(extruded);
  extruded.dispose();
  geometry.translate(-SVG_SIZE / 2, -SVG_SIZE / 2, 0);
  geometry.rotateX(Math.PI); // SVG y-axis points down; flip to match world up
  const scale = (0.87 * 2 * 0.82 * 1.25) / SVG_SIZE;
  geometry.scale(scale, scale, scale);
  return geometry;
}

export interface CoinAssets {
  body: THREE.BufferGeometry;
  face: THREE.BufferGeometry;
  engrave: THREE.BufferGeometry;
  gold: THREE.MeshPhysicalMaterial;
  goldEngrave: THREE.MeshPhysicalMaterial;
}

let cached: CoinAssets | null = null;

export function getCoinAssets(): CoinAssets {
  if (cached) return cached;

  // Deliberately MeshPhysicalMaterial: its env lighting applies multiscatter
  // energy compensation that keeps the gold rich and saturated. The cheaper
  // MeshStandardMaterial renders this coin visibly paler — do not "optimise".
  const grain = makeGrainTexture();
  const gold = new THREE.MeshPhysicalMaterial({
    color: "#f0c060",
    metalness: 1,
    roughness: 0.32,
    roughnessMap: grain,
    envMapIntensity: 1.4,
  });
  const goldEngrave = new THREE.MeshPhysicalMaterial({
    color: "#dda43e",
    metalness: 1,
    roughness: 0.2,
    envMapIntensity: 1.5,
  });

  cached = {
    body: makeBodyGeometry(),
    // Slightly overlaps the bevel to avoid a hairline seam
    face: new THREE.CircleGeometry(FACE_RADIUS + 0.004, 64),
    engrave: makeEngraveGeometry(),
    gold,
    goldEngrave,
  };
  return cached;
}
