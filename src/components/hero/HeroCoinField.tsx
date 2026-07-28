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
  DESIGN_UNIT,
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
 * Coins still in the air when the hero's copy unfold is triggered. One means the
 * penultimate landing. Landing times bunch at the tail — the last two are ~44ms
 * apart — so this fires essentially as the fountain settles.
 */
const REVEAL_WITH_COINS_AIRBORNE = 1;

/**
 * Total vertical translation applied to `from` by itself and every ancestor up to
 * (excluding) `to`, in px. Used to find how far the coin layer has been displaced
 * relative to the phone, which shares `to` as an ancestor but carries none of
 * those transforms.
 */
function transformOffsetY(from: HTMLElement, to: HTMLElement | null): number {
  let total = 0;
  for (let node: HTMLElement | null = from; node && node !== to; node = node.parentElement) {
    const t = getComputedStyle(node).transform;
    if (t && t !== "none") total += new DOMMatrixReadOnly(t).f;
  }
  return total;
}

/** Height of the sticky header, in px — the top of the usable flight space. */
function headerHeightPx() {
  return (
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
    ) || 0
  );
}

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
   * External launch signal. When supplied it fully controls when the fountain
   * starts — the hero fires it on the phone's jolt, so the coins break cover as
   * it kicks. Omit it (standalone use) and the field arms itself once it's on
   * screen and the surrounding asset has faded in.
   */
  armed?: boolean;
  /**
   * Toggled by clicking the phone mockup: false switches gravity on and the
   * coins drop out of the band; flipping back to true replays the fountain.
   */
  coinsShown?: boolean;
  /**
   * Fired once, as the penultimate coin of the initial page-load fountain lands.
   * Drives the hero's copy unfold and the mobile coin drop. Later gravity-toggle
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
  armed: armedProp,
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

  // The fountain waits to be launched: inside the hero that's the `armed` prop,
  // fired on the phone's jolt. Standalone, the field falls back to watching the
  // surrounding asset fade in (plus a short deadline) and arms itself.
  const [selfArmed, setSelfArmed] = useState(false);
  const armed = armedProp ?? selfArmed;

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

  /**
   * Map the phone's live on-screen box into the canvas's world space. The CSS
   * phone layer and the WebGL canvas are sized independently, so the design
   * constants are ~half a world unit out at some viewports — everything the
   * flight needs is measured instead of assumed.
   */
  const measurePhoneWorld = useCallback(() => {
    const canvasEl = wrapper.current;
    if (!canvasEl) return null;
    const phoneEl = canvasEl
      .closest<HTMLElement>(".hero-asset")
      ?.querySelector<HTMLElement>(".hero-asset-phone");
    if (!phoneEl) return null;
    const canvasRect = canvasEl.getBoundingClientRect();
    if (canvasRect.width === 0 || canvasRect.height === 0) return null;
    const phoneRect = phoneEl.getBoundingClientRect();
    const heroTop = canvasEl.closest<HTMLElement>(".hero-dark")?.getBoundingClientRect()
      .top;
    const field = fieldWidthRef.current || HERO_ASSET.width;
    const toWorld = (clientX: number, clientY: number) =>
      canvasFractionToWorld(
        (clientX - canvasRect.left) / canvasRect.width,
        (clientY - canvasRect.top) / canvasRect.height,
        field,
      );

    const [cx, cy] = toWorld(
      phoneRect.left + phoneRect.width / 2,
      phoneRect.top + phoneRect.height / 2,
    );
    return {
      /** Launch point: the phone's centre, where coins sit hidden behind it. */
      origin: [cx, cy] as [number, number],
      /** The arc has to clear this to be seen at all — the canvas is behind the phone. */
      phoneTopY: toWorld(0, phoneRect.top)[1],
      /**
       * Half the phone's width in world units. Bounds how far across its top edge
       * the launch points can spread and still stay hidden behind the mockup.
       */
      phoneHalfWidth: Math.abs(toWorld(phoneRect.right, 0)[0] - cx),
      /**
       * Highest world y an arc can reach and still clear the sticky header.
       *
       * Anchored to the hero's own top edge, NOT the viewport. Both it and the
       * canvas move together with scroll, so the gap between them — and therefore
       * this ceiling — is scroll-invariant, while still resolving to exactly the
       * same line as `headerHeight` alone when the hero sits at the top of the
       * page (which is when the fountain plays on load). Measuring it against the
       * viewport instead dragged the ceiling down as the page scrolled: on a
       * replay a little way down the hero it closed in on the launch points, so
       * some arcs were squashed flat while others weren't and the jet lost its
       * shape entirely.
       */
      onScreenTopY: toWorld(0, (heroTop ?? 0) + headerHeightPx())[1],
    };
  }, []);

  const phoneWorldRef = useRef<ReturnType<typeof measurePhoneWorld>>(null);

  // The fountain launches from behind the phone wherever it currently is.
  const measureOrigin = useCallback(() => {
    const phone = measurePhoneWorld();
    if (!phone) return;
    phoneWorldRef.current = phone;
    const [wx, wy] = phone.origin;
    setOriginWorld((prev) => (prev[0] === wx && prev[1] === wy ? prev : [wx, wy]));
  }, [measurePhoneWorld]);

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

  const completeEntrance = useCallback(() => {
    if (entranceCompleteRef.current) return;
    entranceCompleteRef.current = true;
    onEntranceCompleteRef.current?.();
  }, []);

  const handleLanded = useCallback(() => {
    landedCountRef.current += 1;

    // The hero's copy unfold starts as the PENULTIMATE coin lands, so the drop
    // begins just as the fountain finishes rather than after it has gone still.
    // Expressed as coins-still-airborne rather than a landing count, so it means
    // the same thing at every breakpoint (8–14 coins).
    if (
      landedCountRef.current >=
      Math.max(1, flyingCountRef.current - REVEAL_WITH_COINS_AIRBORNE)
    ) {
      completeEntrance();
    }

    // Back faces can go once nothing is tumbling any more.
    if (landedCountRef.current >= flyingCountRef.current) setEntranceActive(false);
  }, [completeEntrance]);

  useEffect(() => {
    // Someone else owns the launch signal — nothing to work out here.
    if (armedProp !== undefined) return;

    const heroAsset = wrapper.current?.closest<HTMLElement>(".hero-asset");
    if (!heroAsset) {
      setSelfArmed(true);
      return;
    }

    let raf = 0;
    let deadline = 0;
    const check = () => {
      const opacity = Number(getComputedStyle(heroAsset).opacity);
      if (opacity >= 0.9 || performance.now() > deadline) {
        setSelfArmed(true);
        return;
      }
      raf = requestAnimationFrame(check);
    };

    // Nothing arms off screen — not even the fallback deadline. A page
    // refreshed while scrolled down would otherwise spend the fountain into an
    // empty viewport, and re-measure its origin against a phone that the copy
    // unfold has since pushed away. The clock starts when the hero is seen.
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      deadline = performance.now() + 4000;
      raf = requestAnimationFrame(check);
    });
    observer.observe(heroAsset);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [armedProp]);

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
        // Same boundary in world space, minus a coin radius, so arcs don't fly
        // over the text either — but ONLY while the copy is actually laid out.
        // During the intro .hero-copy is collapsed to zero height, so the
        // sub-heading's measured box sits far lower than the text ever renders
        // and would flatten every arc to nothing. Resting slots still respect
        // spillTopY above, because that's where the copy is *going* to be.
        const copyHeight =
          el
            .closest(".hero-dark")
            ?.querySelector<HTMLElement>(".hero-copy")
            ?.getBoundingClientRect().height ?? 0;
        if (copyHeight > 1) {
          apexCeilingWorld = (HERO_ASSET.height / 2 - spillTopY) / 100 - 0.6;
        }
      }

      // The coin LAYER carries transforms the phone doesn't — the intro's pin
      // (.hero-coin-spill, which holds the field still while the copy unfold slides
      // the phone ~460px down) and the scroll parallax (.hero-coin-scroll, up to
      // 160px). Slots live in the layer's space, so each of those silently changes
      // how the phone maps into it: after the intro the phone sits 5.9 world units
      // BELOW where it launched from, turning every arc into a long climb up to
      // slots left behind at the old height, nothing like the intended fountain.
      //
      // Cancelling the layer's total displacement puts the slots back around the
      // phone wherever it now is, so a replay flies the same arc as the one at the
      // jolt. Measured as accumulated transform rather than named elements, so any
      // future transform on the layer is handled too — and it's exactly zero on
      // load, leaving the first fountain untouched.
      const layerOffsetPx = transformOffsetY(el, el.closest<HTMLElement>(".hero-asset"));
      const frustum = orthoFrustumForField(field.fieldWidth);
      const pxPerWorld = height / (frustum.top - frustum.bottom);
      // Design-space y runs opposite to world y, so a downward shift lifts the slots.
      const slotShiftDesign =
        pxPerWorld > 0 ? (layerOffsetPx / pxPerWorld) * DESIGN_UNIT : 0;

      // Shifted here rather than at the two designToWorld call sites, so a flight's
      // endpoint and its resting slot can never drift apart.
      const coins = buildHeroCoins({
        spread: spreadForViewport(width / height, viewportWidth),
        sessionSeed: layoutSeedRef.current,
        sceneWidthPx: width,
        sceneHeightPx: height,
        viewportWidthPx: viewportWidth,
        coinsPerSide: perSide,
        spillTopY,
      }).map((coin) =>
        slotShiftDesign ? { ...coin, y: coin.y - slotShiftDesign } : coin,
      );

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const playEntrance = !entrancePlayedRef.current && !reducedMotion;

      // Re-measure before building: the launch point, the phone's top edge and
      // the on-screen ceiling all shape the arcs, and any resize, breakpoint
      // change or transform on the coin layer moves them.
      measureOrigin();
      const phone = phoneWorldRef.current;

      const entrances = buildHeroCoinEntrances(
        coins,
        layoutSeedRef.current,
        field.fieldWidth,
        {
          origin: phone?.origin,
          phoneTopY: phone?.phoneTopY,
          phoneHalfWidth: phone?.phoneHalfWidth,
          // Whichever bites first: the sub-heading exclusion or the top of the
          // viewport (less a coin radius, so no apex clips off screen).
          apexCeiling: Math.min(
            apexCeilingWorld ?? Infinity,
            phone ? phone.onScreenTopY - 0.6 : Infinity,
          ),
        },
      );
      setLayout({ fieldWidth: field.fieldWidth, coins, entrances, playEntrance });
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
    // measureOrigin is stable (useCallback []) — omitted from deps on purpose.
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
