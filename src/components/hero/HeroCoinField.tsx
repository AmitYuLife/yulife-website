"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import YuCoin from "@/components/yucoin/YuCoin";
import CoinLighting from "@/components/yucoin/CoinLighting";
import useVisibleFrameloop from "@/components/yucoin/useVisibleFrameloop";
import HeroCoinEntrance from "./HeroCoinEntrance";
import {
  buildHeroCoinEntrances,
  buildHeroCoins,
  canvasFractionToWorld,
  coinsPerSideForViewport,
  designCoinScale,
  designToWorld,
  createHeroCoinLayoutSeed,
  heroFieldMetrics,
  HERO_ASSET,
  HERO_COIN_BREAKPOINTS,
  HERO_COIN_CANVAS_SCALE,
  HERO_COIN_FIELD,
  HERO_COIN_TILT_LIMITS,
  orthoFrustumForField,
  PHONE_CENTER_WORLD,
  spreadForViewport,
  type HeroCoinEntrance as EntranceParams,
  type HeroCoinLayout,
} from "./heroAssetLayout";

const BREAKPOINT_MEDIA = [
  `(min-width: ${HERO_COIN_BREAKPOINTS.xl}px)`,
  `(min-width: ${HERO_COIN_BREAKPOINTS.desktop}px)`,
  `(min-width: ${HERO_COIN_BREAKPOINTS.tablet}px)`,
] as const;

/**
 * Keeps the orthographic frustum in lockstep with the current field width.
 * Applied imperatively because Canvas camera props are only reliably read at
 * creation — and the frustum now changes on every width resize, not just XL.
 */
function FieldFrustum({ fieldWidth }: { fieldWidth: number }) {
  const camera = useThree((state) => state.camera);

  useLayoutEffect(() => {
    const frustum = orthoFrustumForField(fieldWidth > 0 ? fieldWidth : 1920);
    Object.assign(camera, frustum);
    camera.updateProjectionMatrix();
  }, [camera, fieldWidth]);

  return null;
}

type CoinLayoutState = {
  coins: HeroCoinLayout[];
  entrances: EntranceParams[];
  fieldWidth: number;
  /** True only for the first layout of the mount — later rebuilds skip the flight. */
  playEntrance: boolean;
};

export type HeroCoinFieldProps = {
  /**
   * Toggled by clicking the phone mockup: false switches gravity on and the
   * coins drop out of the band; flipping back to true replays the fountain.
   */
  coinsShown?: boolean;
  /**
   * Fired once, when every coin from the initial page-load fountain has
   * landed. Drives the hero's copy reveal (Hero.tsx). Later gravity-toggle
   * replays never re-fire it.
   */
  onEntranceComplete?: () => void;
};

/**
 * YuCoins in one WebGL canvas, positioned via the HeroAsset layout.
 * Positions randomise on every page refresh; count scales by breakpoint.
 * On first layout the coins fountain out from behind the phone mockup.
 */
export default function HeroCoinField({
  coinsShown = true,
  onEntranceComplete,
}: HeroCoinFieldProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useVisibleFrameloop(wrapper);
  const layoutSeedRef = useRef<number | null>(null);
  const layoutBucketRef = useRef<string | null>(null);
  const entrancePlayedRef = useRef(false);
  const landedCountRef = useRef(0);
  const flyingCountRef = useRef(0);
  const fieldWidthRef = useRef(0);
  // Latch so the entrance-complete callback fires for the first fountain only,
  // never for the gravity-toggle replays that reuse the same landing counters.
  const entranceCompleteRef = useRef(false);
  const onEntranceCompleteRef = useRef(onEntranceComplete);
  onEntranceCompleteRef.current = onEntranceComplete;
  // Back faces exist only while coins can tumble past 90° mid-flight; once
  // every coin lands they're dropped again (the resting pose never shows them).
  const [entranceActive, setEntranceActive] = useState(false);
  const [{ coins, entrances, fieldWidth, playEntrance }, setLayout] =
    useState<CoinLayoutState>({
      coins: [],
      entrances: [],
      fieldWidth: 0,
      playEntrance: false,
    });
  fieldWidthRef.current = fieldWidth;

  // Fountain launch point: the phone's on-screen centre mapped into the canvas's
  // world space, measured live (measureOrigin) so it tracks the phone across
  // breakpoints and through the coin-layer transforms — not a baked-in constant.
  const [originWorld, setOriginWorld] = useState<[number, number]>([
    PHONE_CENTER_WORLD[0],
    PHONE_CENTER_WORLD[1],
  ]);

  // The fountain waits for the hero intro: Hero.tsx fades .hero-asset in via
  // GSAP, and launching while it's still transparent would waste the burst.
  // Coins mount once that fade has (nearly) landed — or after a short
  // fallback when the field is used outside the animated hero.
  const [armed, setArmed] = useState(false);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  // Each re-show after a gravity drop bumps `run`, and every mounted coin
  // recycles itself in place — same meshes, reset flight state — so the
  // scene never holds more coins than the original page-load set. A fresh
  // seed + forced rebuild re-randomises the layout for the new fountain:
  // pure math over the same recycled instances, no remounts, no allocation
  // beyond the small layout arrays.
  const [run, setRun] = useState(0);
  const prevShownRef = useRef(coinsShown);
  const rebuildRef = useRef<(() => void) | null>(null);

  // Map the phone's live on-screen centre into the canvas's world space so the
  // fountain launches from behind the phone wherever it currently is.
  const measureOrigin = useCallback(() => {
    const canvasEl = wrapper.current;
    if (!canvasEl) return;
    const phoneEl = canvasEl
      .closest<HTMLElement>(".hero-asset")
      ?.querySelector<HTMLElement>(".hero-asset-phone");
    if (!phoneEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return;
    const phoneRect = phoneEl.getBoundingClientRect();
    const fracX =
      (phoneRect.left + phoneRect.width / 2 - canvasRect.left) / canvasRect.width;
    const fracY =
      (phoneRect.top + phoneRect.height / 2 - canvasRect.top) / canvasRect.height;
    const [wx, wy] = canvasFractionToWorld(
      fracX,
      fracY,
      fieldWidthRef.current || HERO_ASSET.width,
    );
    setOriginWorld((prev) => (prev[0] === wx && prev[1] === wy ? prev : [wx, wy]));
  }, []);

  useEffect(() => {
    if (coinsShown === prevShownRef.current) return;
    prevShownRef.current = coinsShown;
    if (coinsShown) {
      measureOrigin();
      layoutSeedRef.current = createHeroCoinLayoutSeed();
      layoutBucketRef.current = null;
      rebuildRef.current?.();
      setRun((r) => r + 1);
      flyingCountRef.current = coins.length;
      landedCountRef.current = 0;
      if (!reducedMotion) setEntranceActive(true);
    }
    // measureOrigin is a stable useCallback — deliberately omitted from deps so
    // the array size matches the rest of the file's ref-driven effects.
  }, [coinsShown, coins.length, reducedMotion]);

  const handleLanded = useCallback(() => {
    landedCountRef.current += 1;
    if (landedCountRef.current >= flyingCountRef.current) {
      setEntranceActive(false);
      if (!entranceCompleteRef.current) {
        entranceCompleteRef.current = true;
        onEntranceCompleteRef.current?.();
      }
    }
  }, []);

  useEffect(() => {
    const heroAsset = wrapper.current?.closest<HTMLElement>(".hero-asset");
    if (!heroAsset) {
      setArmed(true);
      return;
    }

    let raf = 0;
    const deadline = performance.now() + 4000;
    const check = () => {
      const opacity = Number(getComputedStyle(heroAsset).opacity);
      if (opacity >= 0.9 || performance.now() > deadline) {
        setArmed(true);
        return;
      }
      raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);

    return () => cancelAnimationFrame(raf);
  }, []);

  // The fountain actually begins on the first armed render, so the
  // played-flag and in-flight bookkeeping are stamped here — not at layout
  // build time, where a pre-arm resize would otherwise skip the show.
  useEffect(() => {
    if (armed && playEntrance && coins.length > 0) {
      measureOrigin();
      entrancePlayedRef.current = true;
      flyingCountRef.current = coins.length;
      landedCountRef.current = 0;
      setEntranceActive(true);
    }
    // measureOrigin is stable (useCallback []) — omitted from deps on purpose.
  }, [armed, playEntrance, coins.length]);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;

    const build = () => {
      const rect = el.getBoundingClientRect();
      const { width, height } = rect;
      if (width <= 0 || height <= 0) return;

      const viewportWidth = window.innerWidth;
      const perSide = coinsPerSideForViewport(viewportWidth);
      const field = heroFieldMetrics(width, height, viewportWidth);
      const bucket = `${perSide}-${Math.round(field.fieldWidth / 64)}`;

      if (layoutBucketRef.current === bucket) return;
      layoutBucketRef.current = bucket;

      if (layoutSeedRef.current === null) {
        layoutSeedRef.current = createHeroCoinLayoutSeed();
      }

      // Keep coins out from behind the sub-heading: measure where its text
      // actually ends and convert that viewport gap into the design-space
      // ceiling for coin placement (plus a small breathing margin).
      let spillTopY: number | undefined;
      let apexCeilingWorld: number | undefined;
      const subheading = el
        .closest(".hero-dark")
        ?.querySelector<HTMLElement>(".hero-headline p");
      if (subheading) {
        const subBottom = subheading.getBoundingClientRect().bottom + 12;
        // The canvas is taller than the band (fall-room); scale the ratio back to
        // the band mapping so the sub-heading exclusion lands where it did before.
        const designPerPx = (HERO_COIN_FIELD.height / height) * HERO_COIN_CANVAS_SCALE;
        spillTopY = HERO_COIN_FIELD.minY + (subBottom - rect.top) * designPerPx;
        // Same boundary in world space, minus a coin radius so flight
        // apexes (slot + settle overshoot) respect it too.
        apexCeilingWorld = (HERO_ASSET.height / 2 - spillTopY) / 100 - 0.6;
      }

      const coins = buildHeroCoins({
        spread: spreadForViewport(width / height, viewportWidth),
        sessionSeed: layoutSeedRef.current,
        sceneWidthPx: width,
        sceneHeightPx: height,
        viewportWidthPx: viewportWidth,
        coinsPerSide: perSide,
        spillTopY,
      });

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const playEntrance = !entrancePlayedRef.current && !reducedMotion;

      setLayout({
        fieldWidth: field.fieldWidth,
        coins,
        entrances: buildHeroCoinEntrances(
          coins,
          layoutSeedRef.current,
          field.fieldWidth,
          apexCeilingWorld,
        ),
        playEntrance,
      });
    };

    rebuildRef.current = build;
    build();

    const mediaQueries = BREAKPOINT_MEDIA.map((query) => window.matchMedia(query));
    mediaQueries.forEach((mq) => mq.addEventListener("change", build));

    const observer = new ResizeObserver(build);
    observer.observe(el);

    return () => {
      mediaQueries.forEach((mq) => mq.removeEventListener("change", build));
      observer.disconnect();
    };
  }, []);

  const frustum = fieldWidth > 0 ? orthoFrustumForField(fieldWidth) : orthoFrustumForField(1920);

  return (
    <div ref={wrapper} className="absolute inset-0 touch-none">
      <Canvas
        frameloop={frameloop}
        orthographic
        camera={{
          position: [0, 0, 10],
          zoom: 1,
          ...frustum,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <FieldFrustum fieldWidth={fieldWidth} />
        <CoinLighting />
        {armed && coins.map((coin, index) => (
          <HeroCoinEntrance
            key={coin.id}
            origin={[originWorld[0], originWorld[1], 0]}
            target={designToWorld(coin.x, coin.y, coin.size, fieldWidth)}
            entrance={entrances[index]}
            play={run === 0 ? playEntrance : !reducedMotion}
            exit={!coinsShown}
            runId={run}
            onLanded={handleLanded}
          >
            <YuCoin
              scale={designCoinScale(coin.size)}
              baseTilt={[coin.tiltX, coin.tiltY]}
              baseRoll={coin.tiltZ}
              tiltLimits={HERO_COIN_TILT_LIMITS}
              pointerOnHoverOnly
              pointerTilt={2.5}
              pointerSens={2.35}
              idleRotation={0}
              idleFloat={3}
              hoverScale={1.12}
              backFace={entranceActive}
              phase={index * 1.37}
            />
          </HeroCoinEntrance>
        ))}
        <Preload all />
      </Canvas>
    </div>
  );
}
