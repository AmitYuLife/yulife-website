/**
 * Figma HeroAsset frame (node 1705:729) — 1920×720 band with a centred iPhone
 * and dispersed YuCoins. Coins may spill upward into the headline zone.
 * Left/right membership comes from Figma groups `LeftCoins` / `RightCoins`.
 */

export const HERO_ASSET = {
  width: 1920,
  height: 720,
  phone: { x: 742.5, y: 0, width: 434, height: 901 },
} as const;

/** Design px the coin field extends above the 720px artboard (into headline area). */
export const HERO_COIN_SPILL_TOP = 520;

/**
 * Design px the coin canvas extends BELOW the artboard. This is pure fall-room
 * for the gravity drop: coins still LAND within [minY, maxY], but a dropped coin
 * can keep falling past the hero band and slip behind the next section instead of
 * clipping at a fixed edge. Rendering-only — not part of the landing field. Kept
 * generous so a coin dropped while the field is pinned up (intro) still clears the
 * band before it's culled.
 */
export const HERO_COIN_SPILL_BOTTOM = 900;

/** Extended coin-field bounds in design coordinates (y=0 is still the artboard top). */
export const HERO_COIN_FIELD = {
  minY: -HERO_COIN_SPILL_TOP,
  maxY: HERO_ASSET.height,
  height: HERO_ASSET.height + HERO_COIN_SPILL_TOP,
} as const;

export type HeroCoinSide = "left" | "right";

export type HeroCoinLayout = {
  id: string;
  x: number;
  y: number;
  size: number;
  side: HeroCoinSide;
  tiltX: number;
  tiltY: number;
  tiltZ: number;
};

type CoinSpec = {
  id: string;
  figmaId?: string;
  side: HeroCoinSide;
  size: number;
};

/** Size variants cycled per coin slot (desktop XL uses all seven). */
const COIN_SIZE_POOL = [96, 96, 94, 92, 90, 88, 84] as const;

/** Matches design-token breakpoints — mobile is the base (no query). */
export const HERO_COIN_BREAKPOINTS = {
  tablet: 768,
  desktop: 1280,
  xl: 1920,
} as const;

/** Coin count per side at each breakpoint tier. */
export function coinsPerSideForViewport(viewportWidthPx: number): number {
  if (viewportWidthPx >= HERO_COIN_BREAKPOINTS.xl) return 7;
  if (viewportWidthPx >= HERO_COIN_BREAKPOINTS.desktop) return 6;
  if (viewportWidthPx >= HERO_COIN_BREAKPOINTS.tablet) return 5;
  return 4;
}

function coinSpecsForSideCount(perSide: number): CoinSpec[] {
  const specs: CoinSpec[] = [];
  for (let i = 0; i < perSide; i++) {
    specs.push({
      id: `L${i}`,
      side: "left",
      size: COIN_SIZE_POOL[i % COIN_SIZE_POOL.length],
    });
    specs.push({
      id: `R${i}`,
      side: "right",
      size: COIN_SIZE_POOL[(i + 3) % COIN_SIZE_POOL.length],
    });
  }
  return specs;
}

/** 100 design px → 1 Three.js world unit (matches the orthographic frustum). */
export const DESIGN_UNIT = 100;

const COIN_SIZE_SCALE = 1.12;
const SPREAD_GAIN = 1.22;
/** Minimum clear gap between coin edges — 3rem at the rendered scene scale. */
export const COIN_MIN_GAP_REM = 3;
/** Viewport edge inset on desktop XL — keeps coins off the screen edge. */
export const COIN_EDGE_INSET_REM_XL = 2.5;
export const COIN_EDGE_INSET_REM = 2;
const PHONE_PAD = 28;
const SEPARATION_ITERATIONS = 60;
const PLACEMENT_ATTEMPTS = 80;
const ARTBOARD_CENTER_Y = HERO_ASSET.height / 2;

const BRAND_TILT_X = -0.06;
const BRAND_TILT_Y = 0.45;

const phoneCenterY = HERO_ASSET.phone.y + HERO_ASSET.phone.height / 2;
const DESIGN_ASPECT = HERO_ASSET.width / HERO_ASSET.height;
const MAX_COIN_RADIUS = (Math.max(...COIN_SIZE_POOL) * COIN_SIZE_SCALE) / 2;

/**
 * Floor for the field's design width: the phone plus one coin-diameter lane
 * (and breathing room) per side. Below this there'd be nowhere to place
 * coins, so ultra-narrow viewports accept a slight horizontal squash instead.
 */
const MIN_FIELD_WIDTH =
  HERO_ASSET.phone.width + 2 * (PHONE_PAD + MAX_COIN_RADIUS * 2 + 40);

/** Legacy phone centre for the fixed 1920 artboard (CSS phone layer). */
const phoneCenterX = HERO_ASSET.phone.x + HERO_ASSET.phone.width / 2;

export function remToDesignPx(
  rem: number,
  sceneWidthPx: number,
  fieldWidth: number = HERO_ASSET.width,
) {
  const rootFontSizePx = 16;
  return rem * rootFontSizePx * (fieldWidth / sceneWidthPx);
}

export type HeroFieldMetrics = {
  fieldWidth: number;
  phoneCenterX: number;
  phoneLeft: number;
  phoneRight: number;
  edgeInset: number;
};

/** Map the rendered coin scene to design coordinates (expands horizontally on wide viewports). */
export function heroFieldMetrics(
  sceneWidthPx: number,
  sceneHeightPx: number,
  viewportWidthPx: number,
): HeroFieldMetrics {
  // sceneHeightPx is the full (fall-room-extended) canvas; recover the band
  // height so the width/aspect derivation matches the original mapping.
  const bandHeightPx = sceneHeightPx / HERO_COIN_CANVAS_SCALE;
  const nominalSceneWidth = bandHeightPx * (HERO_ASSET.width / HERO_COIN_FIELD.height);
  // Keep px-per-design-unit identical on both axes at every viewport: narrow
  // viewports get a NARROWER field (cropped lanes), never a squashed render.
  // The old max(1, …) clamp held the field at 1920 design px and compressed
  // it horizontally on screen, which exaggerated the coins' resting yaw the
  // smaller the viewport got.
  const fieldWidth = Math.max(
    MIN_FIELD_WIDTH,
    HERO_ASSET.width * (sceneWidthPx / nominalSceneWidth),
  );
  const phoneCenterX = fieldWidth / 2;
  const phoneHalfW = HERO_ASSET.phone.width / 2;
  const edgeInsetRem =
    viewportWidthPx >= HERO_COIN_BREAKPOINTS.xl ? COIN_EDGE_INSET_REM_XL : COIN_EDGE_INSET_REM;

  return {
    fieldWidth,
    phoneCenterX,
    phoneLeft: phoneCenterX - phoneHalfW - PHONE_PAD,
    phoneRight: phoneCenterX + phoneHalfW + PHONE_PAD,
    edgeInset: remToDesignPx(edgeInsetRem, sceneWidthPx, fieldWidth),
  };
}

// Vertical frustum bounds in world units. Width-independent, so precomputed.
// The top clears the upward spill (plus a coin radius + margin). The artboard
// bottom is where the visible hero band ends; the real bottom drops further so a
// falling coin has somewhere to go before the next section covers it.
const FRUSTUM_TOP =
  (ARTBOARD_CENTER_Y - HERO_COIN_FIELD.minY + MAX_COIN_RADIUS + 56) / DESIGN_UNIT;
const FRUSTUM_BOTTOM_ARTBOARD = -ARTBOARD_CENTER_Y / DESIGN_UNIT;
const FRUSTUM_BOTTOM = FRUSTUM_BOTTOM_ARTBOARD - HERO_COIN_SPILL_BOTTOM / DESIGN_UNIT;
/** Frustum heights before/after the fall-room extension (for scale preservation). */
const FRUSTUM_HEIGHT_ARTBOARD = FRUSTUM_TOP - FRUSTUM_BOTTOM_ARTBOARD;
const FRUSTUM_HEIGHT = FRUSTUM_TOP - FRUSTUM_BOTTOM;

/**
 * How much taller the canvas is than the original band-only canvas, once the
 * fall-room is added. Formulas that assume the canvas maps to HERO_COIN_FIELD
 * (the landing field) must divide the measured canvas height by this to recover
 * the band height — coin placement is otherwise unchanged.
 */
export const HERO_COIN_CANVAS_SCALE = FRUSTUM_HEIGHT / FRUSTUM_HEIGHT_ARTBOARD;

/** World y below the frustum floor where a fallen coin is fully gone. */
export const HERO_COIN_EXIT_Y = FRUSTUM_BOTTOM - 0.4;

export function orthoFrustumForField(fieldWidth: number) {
  const halfW = fieldWidth / DESIGN_UNIT / 2;
  return {
    left: -halfW,
    right: halfW,
    top: FRUSTUM_TOP,
    bottom: FRUSTUM_BOTTOM,
  };
}

/**
 * Convert a point on the coin canvas — given as fractions of its width/height
 * from the top-left — into world coordinates for the current frustum. Lets the
 * fountain launch from wherever the phone actually sits on screen (measured live),
 * so the origin tracks the phone across breakpoints and through any coin-layer
 * transform (the intro pin, the scroll follow) rather than a baked-in constant.
 */
export function canvasFractionToWorld(
  fracX: number,
  fracY: number,
  fieldWidth: number,
): [number, number] {
  const { left, right, top, bottom } = orthoFrustumForField(fieldWidth);
  return [left + fracX * (right - left), top - fracY * (top - bottom)];
}

/** Phone centre in the orthographic world space (matches designToWorld). */
export const PHONE_CENTER_WORLD: [number, number] = [
  (phoneCenterX - HERO_ASSET.width / 2) / DESIGN_UNIT,
  -(phoneCenterY - ARTBOARD_CENTER_Y) / DESIGN_UNIT,
];

export type BuildHeroCoinsOptions = {
  spread: { horizontal: number; vertical: number };
  sessionSeed: number;
  sceneWidthPx: number;
  sceneHeightPx: number;
  viewportWidthPx: number;
  coinsPerSide: number;
  /**
   * Design-space y the coins' top edges must stay below (measured from the
   * sub-heading's bottom at runtime). Shrinks the upward spill so no coin
   * rests behind the headline copy. Defaults to the full spill.
   */
  spillTopY?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Fresh layout seed on each page load; stays stable for the lifetime of the mount. */
export function createHeroCoinLayoutSeed(): number {
  if (typeof window === "undefined") return 0xdecafbad;
  return Math.floor(Math.random() * 0x1_0000_0000);
}

function createRng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffledCoinSpecs(seed: number, specs: CoinSpec[]): CoinSpec[] {
  const rng = createRng(seed ^ 0x9e3779b9);
  const order = [...specs];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function minCenterGap(aHalf: number, bHalf: number, minEdgeGap: number) {
  return aHalf + bHalf + minEdgeGap;
}

function maxReachX(fieldWidth: number, phoneCenterX: number, spread: number) {
  const laneHalf = Math.min(phoneCenterX, fieldWidth - phoneCenterX) - HERO_ASSET.phone.width / 2;
  return laneHalf * spread;
}

function maxReachY(spread: number) {
  const spillReach = HERO_COIN_SPILL_TOP * 0.92;
  const downReach = HERO_ASSET.height / 2 - 12;
  return (spillReach + downReach) * spread;
}

export function spreadForViewport(containerAspect: number, viewportWidthPx: number) {
  const aspectBoost = clamp(containerAspect / DESIGN_ASPECT, 1, 1.65);
  let horizontal = clamp(1.25 + (aspectBoost - 1) * 2.1, 1.25, 2.45);
  const vertical = clamp(1.08 + (aspectBoost - 1) * 0.55, 1.08, 1.38);

  if (viewportWidthPx >= HERO_COIN_BREAKPOINTS.xl) {
    horizontal = Math.max(horizontal, 2.5);
  } else if (viewportWidthPx >= HERO_COIN_BREAKPOINTS.desktop) {
    horizontal = Math.max(horizontal, 2.1);
  }

  return { horizontal, vertical, aspectBoost };
}

const YAW_SPREAD = 0.1;
const YAW_MIN = 0.36;
const YAW_MAX = 0.52;

function tiltForSide(side: HeroCoinSide, relX: number, relY: number) {
  const reach = clamp(Math.abs(relX), 0.35, 1);
  const magnitude = clamp(BRAND_TILT_Y + (reach - 0.35) * YAW_SPREAD, YAW_MIN, YAW_MAX);
  const tiltY = side === "left" ? magnitude : -magnitude;
  const tiltX = clamp(BRAND_TILT_X - relY * 0.05, -0.12, 0.08);
  const tiltZ = (side === "left" ? 1 : -1) * reach * 0.015;
  return { tiltX, tiltY, tiltZ };
}

function relFromCenter(
  cx: number,
  cy: number,
  field: HeroFieldMetrics,
  spread: { horizontal: number; vertical: number },
) {
  return {
    relX: clamp((cx - field.phoneCenterX) / maxReachX(field.fieldWidth, field.phoneCenterX, 1), -1, 1),
    relY: clamp((cy - phoneCenterY) / maxReachY(1), -1, 1),
  };
}

type MutableCoin = HeroCoinLayout & {
  cx: number;
  cy: number;
  half: number;
  laneMinX: number;
  laneMaxX: number;
};

/**
 * Centre-travel span, in coin halves, below which a lane reads as a rigid
 * vertical column. Tight lanes are widened outward past the canvas edge.
 */
const LANE_MIN_SPAN_HALVES = 3;
/** How far past the canvas edge a coin centre may sit (fraction of a half). */
const LANE_OVERHANG = 0.4;

function sideBounds(
  side: HeroCoinSide,
  half: number,
  field: HeroFieldMetrics,
  spread: { horizontal: number },
) {
  const innerPad = half + 4;
  const edge = field.edgeInset + half;

  let minX: number;
  let maxX: number;
  if (side === "left") {
    minX = edge;
    maxX = field.phoneLeft - innerPad;
  } else {
    minX = field.phoneRight + innerPad;
    maxX = field.fieldWidth - edge;
  }

  // On narrow viewports the side lanes collapse into single-file columns.
  // Widen them outward only — letting some coins hang partly off canvas —
  // so the scatter stays two-dimensional; the phone-side bound never moves.
  const deficit = half * LANE_MIN_SPAN_HALVES - (maxX - minX);
  if (deficit > 0) {
    if (side === "left") {
      minX = Math.max(minX - deficit, -half * LANE_OVERHANG);
    } else {
      maxX = Math.min(maxX + deficit, field.fieldWidth + half * LANE_OVERHANG);
    }
  }

  return { minX, maxX };
}

function verticalBounds(half: number, spillTopY: number) {
  return {
    maxY: HERO_COIN_FIELD.maxY - half,
    spillMinY: spillTopY + half,
  };
}

/** Pick a well-separated random point in the allowed zone for this coin. */
function randomCoinCenter(
  rand: () => number,
  bounds: { minX: number; maxX: number },
  half: number,
  minEdgeGap: number,
  spillTopY: number,
  placed: MutableCoin[],
) {
  const { minX, maxX } = bounds;
  const { maxY, spillMinY } = verticalBounds(half, spillTopY);

  let best = {
    cx: minX + rand() * (maxX - minX),
    cy: spillMinY + rand() * (maxY - spillMinY),
    score: -1,
  };

  for (let attempt = 0; attempt < PLACEMENT_ATTEMPTS; attempt++) {
    const cx = minX + rand() * (maxX - minX);
    const cy = spillMinY + rand() * (maxY - spillMinY);

    const clampedCx = clamp(cx, minX, maxX);
    const clampedCy = clamp(cy, spillMinY, maxY);

    let nearest = Infinity;
    for (const other of placed) {
      nearest = Math.min(
        nearest,
        Math.hypot(clampedCx - other.cx, clampedCy - other.cy) -
          minCenterGap(half, other.half, minEdgeGap),
      );
    }

    const score = placed.length === 0 ? rand() : nearest;
    if (score > best.score) {
      best = { cx: clampedCx, cy: clampedCy, score };
    }
    if (nearest >= 0) {
      return { cx: clampedCx, cy: clampedCy };
    }
  }

  return { cx: best.cx, cy: best.cy };
}

function pushFromPhone(coin: MutableCoin, field: HeroFieldMetrics) {
  const rect = {
    left: field.phoneLeft,
    right: field.phoneRight,
    top: HERO_ASSET.phone.y - PHONE_PAD,
    bottom: clamp(
      HERO_ASSET.phone.y + HERO_ASSET.phone.height,
      PHONE_PAD,
      HERO_ASSET.height - PHONE_PAD,
    ),
  };

  const closestX = clamp(coin.cx, rect.left, rect.right);
  const closestY = clamp(coin.cy, rect.top, rect.bottom);
  let dx = coin.cx - closestX;
  let dy = coin.cy - closestY;
  let dist = Math.hypot(dx, dy);

  if (dist === 0) {
    dx = coin.cx < field.phoneCenterX ? -1 : 1;
    dy = coin.cy < phoneCenterY ? -0.35 : 0.35;
    dist = Math.hypot(dx, dy);
  }

  if (dist < coin.half) {
    const push = coin.half - dist + 2;
    coin.cx += (dx / dist) * push;
    coin.cy += (dy / dist) * push;
  }
}

function clampCoinToField(coin: MutableCoin, spillTopY: number) {
  // Horizontal bounds are the coin's own lane (including any off-canvas
  // overhang granted on tight viewports), so separation passes can never
  // shove a coin past the edge inset or onto the phone. The vertical floor
  // of the spill honours the sub-heading exclusion zone.
  coin.cx = clamp(coin.cx, coin.laneMinX, coin.laneMaxX);
  coin.cy = clamp(
    coin.cy,
    spillTopY + coin.half,
    HERO_COIN_FIELD.maxY - coin.half,
  );
}

function separateCoins(
  coins: MutableCoin[],
  minEdgeGap: number,
  field: HeroFieldMetrics,
  spillTopY: number,
) {
  for (let iter = 0; iter < SEPARATION_ITERATIONS; iter++) {
    for (let i = 0; i < coins.length; i++) {
      for (let j = i + 1; j < coins.length; j++) {
        const a = coins[i];
        const b = coins[j];
        let dx = b.cx - a.cx;
        let dy = b.cy - a.cy;
        let dist = Math.hypot(dx, dy);
        const minDist = minCenterGap(a.half, b.half, minEdgeGap);

        if (dist < minDist) {
          if (dist < 0.001) {
            const angle = (i * 2.399 + j * 1.713) % (Math.PI * 2);
            dx = Math.cos(angle);
            dy = Math.sin(angle);
            dist = 1;
          }
          const push = (minDist - dist) / 2 + 0.5;
          const nx = dx / dist;
          const ny = dy / dist;
          a.cx -= nx * push;
          a.cy -= ny * push;
          b.cx += nx * push;
          b.cy += ny * push;
        }
      }
    }

    for (const coin of coins) {
      pushFromPhone(coin, field);
      clampCoinToField(coin, spillTopY);
    }
  }
}

export function buildHeroCoins({
  spread,
  sessionSeed,
  sceneWidthPx,
  sceneHeightPx,
  viewportWidthPx,
  coinsPerSide,
  spillTopY,
}: BuildHeroCoinsOptions): HeroCoinLayout[] {
  const rng = createRng(sessionSeed);
  const field = heroFieldMetrics(sceneWidthPx, sceneHeightPx, viewportWidthPx);
  const minEdgeGap = remToDesignPx(COIN_MIN_GAP_REM, sceneWidthPx, field.fieldWidth);
  const placed: MutableCoin[] = [];
  const specs = shuffledCoinSpecs(sessionSeed, coinSpecsForSideCount(coinsPerSide));
  // Clamp the exclusion zone so a pathological measurement (giant fonts,
  // tiny band) can never squeeze the coins out of existence.
  const spillTop = clamp(
    spillTopY ?? HERO_COIN_FIELD.minY,
    HERO_COIN_FIELD.minY,
    HERO_ASSET.height / 2 - 60,
  );

  for (const { id, side, size: baseSize } of specs) {
    const size = Math.round(baseSize * COIN_SIZE_SCALE);
    const half = size / 2;
    const bounds = sideBounds(side, half, field, spread);
    const { cx, cy } = randomCoinCenter(rng, bounds, half, minEdgeGap, spillTop, placed);
    const { relX, relY } = relFromCenter(cx, cy, field, spread);
    const spreadX = clamp(relX * SPREAD_GAIN, -1, 1);
    const spreadY = clamp(relY * SPREAD_GAIN, -1, 1);

    placed.push({
      id,
      x: 0,
      y: 0,
      size,
      side,
      ...tiltForSide(side, spreadX, spreadY),
      cx,
      cy,
      half,
      laneMinX: bounds.minX,
      laneMaxX: bounds.maxX,
    });
  }

  separateCoins(placed, minEdgeGap, field, spillTop);

  return placed.map(({ cx, cy, half: _half, laneMinX: _minX, laneMaxX: _maxX, ...coin }) => ({
    ...coin,
    x: cx - coin.size / 2,
    y: cy - coin.size / 2,
  }));
}

/** Per-coin parameters for the fountain entrance from behind the phone. */
export type HeroCoinEntrance = {
  /** Seconds after the field mounts before this coin launches. */
  delay: number;
  /** Flight time from phone centre to resting position, in seconds. */
  duration: number;
  /**
   * Height of the parabolic bump added on top of the straight origin→slot
   * line, world units. The flight is `dy·s + 4·arc·s(1−s)` — a true projectile
   * parabola — so the apex always clears BOTH endpoints and every coin is
   * thrown up before it curves back down into its slot.
   */
  arc: number;
  /**
   * Lateral offset of this coin's launch point from the phone centre, world
   * units. Still well inside the phone silhouette, so the coin stays hidden
   * until it crests — but the jet leaves from a spread of points rather than
   * every coin erupting from the same pixel.
   */
  launchOffsetX: number;
  /**
   * How far up the phone body this coin launches from, world units above the
   * phone's centre. Staggered so the jet leaves from a column of points down the
   * mockup's side — the further a coin travels, the higher it starts — which is
   * what makes the arcs read as nested spray lines instead of one uniform jet.
   */
  launchOffsetY: number;
  /**
   * Exponent on this coin's horizontal progress. Below ~1.2 it fans out early
   * (a shallow launch), above it stays vertical longer. Per-coin so trajectories
   * diverge instead of the whole cohort travelling as one clump.
   */
  spread: number;
  /**
   * Depth lane held during flight, world units, eased back to the layout plane
   * before landing. The camera is orthographic, so z costs nothing visually —
   * it only decides draw order. Without it every coin is coplanar at z=0 and
   * overlapping coins intersect geometrically, which reads as clipping; with it
   * they cleanly pass in front of and behind each other.
   */
  flightZ: number;
  /** Tumble to unwind during flight (radians); Y is the dominant coin-flip axis. */
  spinX: number;
  spinY: number;
  spinZ: number;
  /** Scale at launch relative to the resting scale (reads as depth behind the phone). */
  fromScale: number;
  /** Seconds before this coin reacts when gravity is switched on. */
  exitDelay: number;
  /** Downward acceleration for the gravity drop, world units/s². */
  exitGravity: number;
  /** Slow roll picked up while falling, radians/s (Z only — can't expose the back). */
  exitDrift: number;
  /**
   * Face-down pitch the coin tips toward while falling, radians. Kept well
   * below π/2 (plus YuCoin's resting tilt) so the reverse face — whose
   * geometry is culled at rest — is never exposed.
   */
  exitPitch: number;
};

// Tight stagger: the coins read as one burst rather than a queue, and it's the
// cheapest way to shorten the whole sequence without making any single coin whippy.
const ENTRANCE_LAUNCH_INTERVAL = 0.045;
const ENTRANCE_LAUNCH_JITTER = 0.04;
// The arc travels up and over before settling, so the flight needs a beat more
// than the straight-line distance alone suggests — taller arcs get more of it.
const ENTRANCE_BASE_DURATION = 0.7;
const ENTRANCE_DURATION_PER_UNIT = 0.032;
const ENTRANCE_DURATION_PER_ARC = 0.055;
const ENTRANCE_DURATION_JITTER = 0.16;

/**
 * Gap between flight depth lanes, world units. Must exceed the widest coin's
 * DIAMETER, not its thickness: the tumble takes coins edge-on, where their
 * z-extent is the full diameter. One lane per coin at this spacing makes
 * geometric intersection impossible while they're bunched near the launch.
 *
 * Free to spend: the camera is orthographic (z never changes screen position or
 * size) and the rig is ambient + directional + environment map (no point lights,
 * so z never changes shading either). The frustum spans z −90…9.9, and the
 * widest fan here is ±8.4.
 */
const FLIGHT_Z_SPACING =
  (Math.max(...COIN_SIZE_POOL) * COIN_SIZE_SCALE) / DESIGN_UNIT + 0.13;
/** Path fraction at which lanes start easing back to the layout plane (z=0). */
export const FLIGHT_Z_MERGE_START = 0.75;
/**
 * Launch points fan across the phone rather than stacking at its centre, ordered
 * by how far a coin has to travel: the one headed furthest out leaves from
 * nearest the edge, so trajectories on a side splay apart instead of crossing.
 */
const LAUNCH_OFFSET_MIN = 0.15;
const LAUNCH_OFFSET_JITTER = 0.18;
/**
 * Launches also climb the phone's side, from its centre up toward its top edge —
 * again ordered by reach. Paired with the reach-scaled apex below, this is what
 * turns the jet into nested spray lines: the short-reach coins slip out low from
 * the phone's sides on shallow arcs, the far ones leave high and sweep up over it.
 */
const LAUNCH_RISE_TOP_MARGIN = 0.75;
const LAUNCH_RISE_JITTER = 0.35;
/**
 * Kept clear of the phone's edge so the outermost coins are still behind the
 * mockup at launch and emerge around its top corners rather than sliding out of
 * its sides. Just over the widest resting radius (0.54 world — half of the 1.075
 * widest diameter), since coins reach full size during the hidden climb.
 */
const LAUNCH_EDGE_MARGIN = 0.6;
/** Fallback half-width when the phone hasn't been measured yet. */
const PHONE_HALF_WIDTH_WORLD = HERO_ASSET.phone.width / 2 / DESIGN_UNIT;
/**
 * Per-coin horizontal-progress exponent. Below 1 the horizontal LEADS the flight:
 * the coin is carried out past the phone early and crests late, which is what
 * makes the arc a long outward sweep rather than a tall narrow jet.
 */
const SPREAD_EXPONENT_MIN = 0.55;
const SPREAD_EXPONENT_JITTER = 0.3;

/** World y of the phone mockup's top edge. */
const PHONE_TOP_WORLD = (ARTBOARD_CENTER_Y - HERO_ASSET.phone.y) / DESIGN_UNIT;
/** Hard ceiling for a flight apex: keeps the whole arc inside the canvas. */
const FLIGHT_APEX_CEILING = FRUSTUM_TOP - 0.6;
/**
 * Apex rise above the higher of launch point / slot, world units. Scaled by reach
 * rather than forced over the phone's top edge: the short-reach coins get low,
 * shallow sweeps out of the phone's sides and the far ones tall ones that carry
 * over its top. That spread across the cohort IS the nesting — a single clearance
 * floor applied to every coin collapses them into one uniform band instead.
 */
const APEX_RISE_MIN = 0.4;
const APEX_RISE_PER_REACH = 1.8;
const APEX_RISE_JITTER = 0.45;

/**
 * Bump height for a parabolic flight whose apex sits `rise` above the higher of
 * its two endpoints.
 *
 * With y(s) = dy·s + 4h·s(1−s) the apex is at s = ½ + dy/(8h) and sits
 * dy/2 + h + dy²/(16h) above the launch point. Solving that for h against a
 * target rise collapses — for either sign of dy — to the expression below.
 */
function arcBumpForRise(dy: number, rise: number) {
  const drop = Math.abs(dy);
  return (2 * rise + drop + 2 * Math.sqrt(rise * (rise + drop))) / 4;
}

/**
 * Fountain-entrance parameters for each coin, seeded from the layout seed so
 * a single page load (including React strict-mode remount) replays identically.
 * Launch order is randomised independently of layout order so the spurts
 * alternate irregularly between sides, like a real fountain.
 */
export function buildHeroCoinEntrances(
  coins: HeroCoinLayout[],
  sessionSeed: number,
  fieldWidth: number,
  /**
   * Live geometry for the launch, measured from the DOM (HeroCoinField). The CSS
   * phone layer and the WebGL canvas are sized independently, so the design
   * constants below are only fallbacks for when nothing has been measured yet.
   */
  launch?: {
    /** Launch point in world space — the phone's centre. */
    origin?: [number, number];
    /** World y of the phone's top edge; every apex has to clear it to be seen. */
    phoneTopY?: number;
    /** Half the phone's width; bounds how far launch points fan across its top. */
    phoneHalfWidth?: number;
    /** World y the flight apex must stay below (sub-heading / on-screen limit). */
    apexCeiling?: number;
  },
): HeroCoinEntrance[] {
  const rng = createRng(sessionSeed ^ 0x5f3759df);

  // Depth lanes get their own shuffle so the front-to-back mix stays incidental
  // — keying them to launch order below would put every far coin in front.
  const laneOrder = coins.map((_, i) => i);
  for (let i = laneOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [laneOrder[i], laneOrder[j]] = [laneOrder[j], laneOrder[i]];
  }
  const laneSlot = new Array<number>(coins.length);
  laneOrder.forEach((coinIndex, slot) => {
    laneSlot[coinIndex] = slot;
  });

  const [originX, originY] = launch?.origin ?? PHONE_CENTER_WORLD;
  const phoneTopY = launch?.phoneTopY ?? PHONE_TOP_WORLD;
  // The sub-heading / on-screen limit applies to the flight too, but never above
  // the canvas ceiling. On the first fountain the copy is still collapsed, so
  // the viewport top is what bites; on a gravity-toggle replay the copy is laid
  // out and the sub-heading boundary keeps the arcs out from behind the text.
  const apexCeiling = Math.min(FLIGHT_APEX_CEILING, launch?.apexCeiling ?? FLIGHT_APEX_CEILING);

  const laneCentre = (coins.length - 1) / 2;

  // Rank each coin against the others on its side by how far out it's headed.
  // Rank 0 leaves from nearest the phone's centre, the last from nearest its
  // corner, so a side's trajectories splay outward instead of crossing.
  const targetX = coins.map((coin) => designToWorld(coin.x, coin.y, coin.size, fieldWidth)[0]);
  const reachRank = new Map<number, { rank: number; of: number }>();
  for (const side of ["left", "right"] as const) {
    const onSide = coins
      .map((coin, i) => i)
      .filter((i) => coins[i].side === side)
      .sort((a, b) => Math.abs(targetX[a] - originX) - Math.abs(targetX[b] - originX));
    onSide.forEach((i, rank) => reachRank.set(i, { rank, of: onSide.length }));
  }

  // Launch furthest-reaching first. Those coins leave from high on the phone's
  // side and clear its silhouette almost at once (~0.01s, against ~0.7s for the
  // short, low ones), so the burst breaks cover the instant the phone jolts
  // instead of waiting on whichever coin a shuffle happened to pick. It also
  // reads right: the biggest arcs are the ones the knock threw hardest. Left and
  // right interleave on their own, since the two sides' reaches differ.
  const launchSlot = new Array<number>(coins.length);
  coins
    .map((coin, i) => i)
    .sort((a, b) => Math.abs(targetX[b] - originX) - Math.abs(targetX[a] - originX))
    .forEach((coinIndex, slot) => {
      launchSlot[coinIndex] = slot;
    });

  const halfWidth = launch?.phoneHalfWidth ?? PHONE_HALF_WIDTH_WORLD;
  // Never let the margin invert the range on a very narrow phone.
  const maxOffset = Math.max(LAUNCH_OFFSET_MIN, halfWidth - LAUNCH_EDGE_MARGIN);

  return coins.map((coin, i) => {
    const [tx, ty] = designToWorld(coin.x, coin.y, coin.size, fieldWidth);
    const { rank, of } = reachRank.get(i) ?? { rank: 0, of: 1 };
    const spreadT = of > 1 ? rank / (of - 1) : 0.5;
    const launchOffsetX =
      Math.sign(tx - originX) *
      Math.min(
        maxOffset,
        LAUNCH_OFFSET_MIN +
          spreadT * (maxOffset - LAUNCH_OFFSET_MIN) +
          (rng() - 0.5) * LAUNCH_OFFSET_JITTER,
      );
    // Climb the phone's side with reach, so the jet leaves from a column of
    // points rather than all at the centre line. Capped short of the top edge so
    // the coin is still behind the mockup when it sets off — and never above the
    // apex ceiling, or a coin would launch higher than it's allowed to peak and
    // the rise below would clamp into a mid-flight hump on a falling path
    // instead of an arc.
    const maxRise = Math.max(
      0,
      Math.min(
        phoneTopY - originY - LAUNCH_RISE_TOP_MARGIN,
        apexCeiling - originY - APEX_RISE_MIN,
      ),
    );
    const launchOffsetY = Math.min(
      maxRise,
      Math.max(0, spreadT * maxRise + (rng() - 0.5) * LAUNCH_RISE_JITTER),
    );
    const launchY = originY + launchOffsetY;

    const dx = tx - (originX + launchOffsetX);
    const dy = ty - launchY;
    const dist = Math.hypot(dx, dy);
    const outward = coin.side === "left" ? 1 : -1;

    // Rise scales with reach instead of being forced over the phone's top edge.
    // Short-reach coins slip out low from the sides on shallow arcs; far ones
    // sweep high over the top. The ceiling still caps the tallest.
    const rise =
      APEX_RISE_MIN + spreadT * APEX_RISE_PER_REACH + rng() * APEX_RISE_JITTER;
    const apexY = Math.min(apexCeiling, Math.max(launchY, ty) + rise);
    const arc = arcBumpForRise(dy, Math.max(0.25, apexY - Math.max(launchY, ty)));

    return {
      delay: launchSlot[i] * ENTRANCE_LAUNCH_INTERVAL + rng() * ENTRANCE_LAUNCH_JITTER,
      duration:
        ENTRANCE_BASE_DURATION +
        dist * ENTRANCE_DURATION_PER_UNIT +
        arc * ENTRANCE_DURATION_PER_ARC +
        rng() * ENTRANCE_DURATION_JITTER,
      arc,
      launchOffsetX,
      launchOffsetY,
      spread: SPREAD_EXPONENT_MIN + rng() * SPREAD_EXPONENT_JITTER,
      flightZ: (laneSlot[i] - laneCentre) * FLIGHT_Z_SPACING,
      spinX: (rng() - 0.5) * 0.9,
      // 1.25–2.25 full flips, tumbling outward from the phone.
      spinY: outward * Math.PI * 2 * (1.25 + rng()),
      spinZ: (rng() - 0.5) * 0.5,
      fromScale: 0.5 + rng() * 0.15,
      exitDelay: rng() * 0.07,
      exitGravity: 62 + rng() * 18,
      exitDrift: (rng() - 0.5) * 1.0,
      // 0.9–1.25 rad (52–72°) face-down; with YuCoin's resting tilt on top
      // the combined pitch still stays safely short of 90°.
      exitPitch: 0.9 + rng() * 0.35,
    };
  });
}

export const HERO_COIN_TILT_LIMITS = {
  x: [-0.16, 0.1] as [number, number],
  y: [-0.56, 0.56] as [number, number],
};

export const PHONE_ORIGIN = {
  x: (phoneCenterX / HERO_ASSET.width) * 100,
  y: (phoneCenterY / HERO_ASSET.height) * 100,
} as const;

export function toPercent(
  value: number,
  axis: "x" | "y" | "size",
  frame: "artboard" | "coinField" = "artboard",
) {
  if (axis === "y") {
    if (frame === "coinField") {
      return ((value + HERO_COIN_SPILL_TOP) / HERO_COIN_FIELD.height) * 100;
    }
    return (value / HERO_ASSET.height) * 100;
  }
  const base = HERO_ASSET.width;
  return (value / base) * 100;
}

export function designToWorld(
  x: number,
  y: number,
  size: number,
  fieldWidth: number = HERO_ASSET.width,
): [number, number, number] {
  const cx = x + size / 2;
  const cy = y + size / 2;
  return [
    (cx - fieldWidth / 2) / DESIGN_UNIT,
    -(cy - ARTBOARD_CENTER_Y) / DESIGN_UNIT,
    0,
  ];
}

export function designCoinScale(size: number) {
  return size / DESIGN_UNIT / 2;
}

/** Default ortho frustum for the base artboard width (overridden at runtime on wide viewports). */
export const ORTHO_FRUSTUM = orthoFrustumForField(HERO_ASSET.width);

/**
 * Canvas height as a fraction of the visible phone band. The base maps the landing
 * field; it's scaled up by the frustum-height ratio so the added fall-room renders
 * at the SAME px-per-world as before — coin size and landing positions are
 * unchanged, we only add room below. HERO_COIN_SPILL_BOTTOM_RATIO is how far the
 * canvas hangs below the band so the extra room sits underneath (not above).
 */
const BASE_SCENE_HEIGHT_RATIO = HERO_COIN_FIELD.height / HERO_ASSET.height;
export const HERO_SCENE_HEIGHT_RATIO =
  BASE_SCENE_HEIGHT_RATIO * (FRUSTUM_HEIGHT / FRUSTUM_HEIGHT_ARTBOARD);
export const HERO_COIN_SPILL_BOTTOM_RATIO =
  (HERO_COIN_SPILL_BOTTOM / DESIGN_UNIT) *
  (BASE_SCENE_HEIGHT_RATIO / FRUSTUM_HEIGHT_ARTBOARD);
