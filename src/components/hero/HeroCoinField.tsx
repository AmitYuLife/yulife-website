"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Preload } from "@react-three/drei";
import YuCoin from "@/components/yucoin/YuCoin";
import CoinLighting from "@/components/yucoin/CoinLighting";
import useVisibleFrameloop from "@/components/yucoin/useVisibleFrameloop";
import HeroCoinEntrance from "./HeroCoinEntrance";
import {
  buildHeroCoinEntrances,
  buildHeroCoins,
  coinsPerSideForViewport,
  designCoinScale,
  designToWorld,
  getHeroCoinSessionSeed,
  heroFieldMetrics,
  HERO_COIN_BREAKPOINTS,
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

/**
 * YuCoins in one WebGL canvas, positioned via the HeroAsset layout.
 * Positions randomise once per browser session; count scales by breakpoint.
 * On first layout the coins fountain out from behind the phone mockup.
 */
export default function HeroCoinField() {
  const wrapper = useRef<HTMLDivElement>(null);
  const frameloop = useVisibleFrameloop(wrapper);
  const sessionSeedRef = useRef<number | null>(null);
  const layoutBucketRef = useRef<string | null>(null);
  const entrancePlayedRef = useRef(false);
  const landedCountRef = useRef(0);
  const flyingCountRef = useRef(0);
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

  // The fountain waits for the hero intro: Hero.tsx fades .hero-asset in via
  // GSAP, and launching while it's still transparent would waste the burst.
  // Coins mount once that fade has (nearly) landed — or after a short
  // fallback when the field is used outside the animated hero.
  const [armed, setArmed] = useState(false);

  const handleLanded = useCallback(() => {
    landedCountRef.current += 1;
    if (landedCountRef.current >= flyingCountRef.current) {
      setEntranceActive(false);
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
      entrancePlayedRef.current = true;
      flyingCountRef.current = coins.length;
      landedCountRef.current = 0;
      setEntranceActive(true);
    }
  }, [armed, playEntrance, coins.length]);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;

    const build = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const viewportWidth = window.innerWidth;
      const perSide = coinsPerSideForViewport(viewportWidth);
      const field = heroFieldMetrics(width, height, viewportWidth);
      const bucket = `${perSide}-${Math.round(field.fieldWidth / 64)}`;

      if (layoutBucketRef.current === bucket) return;
      layoutBucketRef.current = bucket;

      if (sessionSeedRef.current === null) {
        sessionSeedRef.current = getHeroCoinSessionSeed();
      }

      const coins = buildHeroCoins({
        spread: spreadForViewport(width / height, viewportWidth),
        sessionSeed: sessionSeedRef.current,
        sceneWidthPx: width,
        sceneHeightPx: height,
        viewportWidthPx: viewportWidth,
        coinsPerSide: perSide,
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
          sessionSeedRef.current,
          field.fieldWidth,
        ),
        playEntrance,
      });
    };

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
            origin={[PHONE_CENTER_WORLD[0], PHONE_CENTER_WORLD[1], 0]}
            target={designToWorld(coin.x, coin.y, coin.size, fieldWidth)}
            entrance={entrances[index]}
            play={playEntrance}
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
