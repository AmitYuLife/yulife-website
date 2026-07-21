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
  const nominalSceneWidth = sceneHeightPx * (HERO_ASSET.width / HERO_COIN_FIELD.height);
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

export function orthoFrustumForField(fieldWidth: number) {
  const halfW = fieldWidth / DESIGN_UNIT / 2;
  return {
    left: -halfW,
    right: halfW,
    top:
      (ARTBOARD_CENTER_Y - HERO_COIN_FIELD.minY + MAX_COIN_RADIUS + 56) / DESIGN_UNIT,
    bottom: -ARTBOARD_CENTER_Y / DESIGN_UNIT,
  };
}

/** Phone centre in the orthographic world space (matches designToWorld). */
export const PHONE_CENTER_WORLD: [number, number] = [
  (phoneCenterX - HERO_ASSET.width / 2) / DESIGN_UNIT,
  -(phoneCenterY - ARTBOARD_CENTER_Y) / DESIGN_UNIT,
];

const HERO_COIN_SEED_KEY = "hero-coin-layout-seed";

export type BuildHeroCoinsOptions = {
  spread: { horizontal: number; vertical: number };
  sessionSeed: number;
  sceneWidthPx: number;
  sceneHeightPx: number;
  viewportWidthPx: number;
  coinsPerSide: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** One seed per browser session — layout stays stable until the tab closes. */
export function getHeroCoinSessionSeed(): number {
  if (typeof window === "undefined") return 0xdecafbad;

  const stored = sessionStorage.getItem(HERO_COIN_SEED_KEY);
  if (stored) return Number(stored);

  const seed = Math.floor(Math.random() * 0x1_0000_0000);
  sessionStorage.setItem(HERO_COIN_SEED_KEY, String(seed));
  return seed;
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

type MutableCoin = HeroCoinLayout & { cx: number; cy: number; half: number };

function sideBounds(
  side: HeroCoinSide,
  half: number,
  field: HeroFieldMetrics,
  spread: { horizontal: number },
) {
  const innerPad = half + 4;
  const edge = field.edgeInset + half;

  if (side === "left") {
    return {
      minX: edge,
      maxX: field.phoneLeft - innerPad,
    };
  }
  return {
    minX: field.phoneRight + innerPad,
    maxX: field.fieldWidth - edge,
  };
}

function verticalBounds(half: number) {
  return {
    maxY: HERO_COIN_FIELD.maxY - half,
    spillMinY: HERO_COIN_FIELD.minY + half,
  };
}

/** Pick a well-separated random point in the allowed zone for this coin. */
function randomCoinCenter(
  rand: () => number,
  side: HeroCoinSide,
  half: number,
  minEdgeGap: number,
  field: HeroFieldMetrics,
  spread: { horizontal: number; vertical: number },
  placed: MutableCoin[],
) {
  const { minX, maxX } = sideBounds(side, half, field, spread);
  const { maxY, spillMinY } = verticalBounds(half);

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

function clampCoinToField(coin: MutableCoin, fieldWidth: number) {
  coin.cx = clamp(coin.cx, coin.half, fieldWidth - coin.half);
  coin.cy = clamp(
    coin.cy,
    HERO_COIN_FIELD.minY + coin.half,
    HERO_COIN_FIELD.maxY - coin.half,
  );
}

function separateCoins(coins: MutableCoin[], minEdgeGap: number, field: HeroFieldMetrics) {
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
      clampCoinToField(coin, field.fieldWidth);
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
}: BuildHeroCoinsOptions): HeroCoinLayout[] {
  const rng = createRng(sessionSeed);
  const field = heroFieldMetrics(sceneWidthPx, sceneHeightPx, viewportWidthPx);
  const minEdgeGap = remToDesignPx(COIN_MIN_GAP_REM, sceneWidthPx, field.fieldWidth);
  const placed: MutableCoin[] = [];
  const specs = shuffledCoinSpecs(sessionSeed, coinSpecsForSideCount(coinsPerSide));

  for (const { id, side, size: baseSize } of specs) {
    const size = Math.round(baseSize * COIN_SIZE_SCALE);
    const half = size / 2;
    const { cx, cy } = randomCoinCenter(rng, side, half, minEdgeGap, field, spread, placed);
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
    });
  }

  separateCoins(placed, minEdgeGap, field);

  return placed.map(({ cx, cy, half: _half, ...coin }) => ({
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
  /** Extra apex height of the arc, in world units. */
  arc: number;
  /** Tumble to unwind during flight (radians); Y is the dominant coin-flip axis. */
  spinX: number;
  spinY: number;
  spinZ: number;
  /** Scale at launch relative to the resting scale (reads as depth behind the phone). */
  fromScale: number;
};

const ENTRANCE_LAUNCH_INTERVAL = 0.085;
const ENTRANCE_BASE_DURATION = 0.95;
const ENTRANCE_DURATION_PER_UNIT = 0.05;

/**
 * Fountain-entrance parameters for each coin, seeded so a session's replay
 * (e.g. React strict-mode remount) produces the identical burst.
 * Launch order is randomised independently of layout order so the spurts
 * alternate irregularly between sides, like a real fountain.
 */
export function buildHeroCoinEntrances(
  coins: HeroCoinLayout[],
  sessionSeed: number,
  fieldWidth: number,
): HeroCoinEntrance[] {
  const rng = createRng(sessionSeed ^ 0x5f3759df);

  const launchOrder = coins.map((_, i) => i);
  for (let i = launchOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [launchOrder[i], launchOrder[j]] = [launchOrder[j], launchOrder[i]];
  }
  const launchSlot = new Array<number>(coins.length);
  launchOrder.forEach((coinIndex, slot) => {
    launchSlot[coinIndex] = slot;
  });

  return coins.map((coin, i) => {
    const [tx, ty] = designToWorld(coin.x, coin.y, coin.size, fieldWidth);
    const dx = tx - PHONE_CENTER_WORLD[0];
    const dy = ty - PHONE_CENTER_WORLD[1];
    const dist = Math.hypot(dx, dy);
    const outward = coin.side === "left" ? 1 : -1;

    return {
      delay: launchSlot[i] * ENTRANCE_LAUNCH_INTERVAL + rng() * 0.06,
      duration:
        ENTRANCE_BASE_DURATION + dist * ENTRANCE_DURATION_PER_UNIT + rng() * 0.25,
      // Higher arcs for coins travelling further sideways; every arc clears
      // the phone top so the burst always reads as "up and over".
      arc: clamp(0.9 + Math.abs(dx) * 0.16 + rng() * 0.6, 1.0, 2.4),
      spinX: (rng() - 0.5) * 0.9,
      // 1.25–2.25 full flips, tumbling outward from the phone.
      spinY: outward * Math.PI * 2 * (1.25 + rng()),
      spinZ: (rng() - 0.5) * 0.5,
      fromScale: 0.5 + rng() * 0.15,
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

/** Scene height as a fraction of the visible phone band (for bottom-anchored layout). */
export const HERO_SCENE_HEIGHT_RATIO = HERO_COIN_FIELD.height / HERO_ASSET.height;
