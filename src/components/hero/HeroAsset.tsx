"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  HERO_ASSET,
  HERO_COIN_SPILL_BOTTOM_RATIO,
  HERO_SCENE_HEIGHT_RATIO,
  PHONE_ORIGIN,
  toPercent,
} from "./heroAssetLayout";
import { assetPath } from "@/lib/assetPath";

const HeroCoinField = dynamic(() => import("./HeroCoinField"), {
  ssr: false,
  loading: () => null,
});

/** Ignore phone clicks closer together than this — lets each phase land. */
const TOGGLE_COOLDOWN_MS = 900;

/** Tablet+ only: viewport at/above which the coins scroll-follow (below = mobile). */
const FOLLOW_MEDIA = "(min-width: 768px)";
/** Fraction of the scroll distance the landed coins lag behind by. */
const COIN_FOLLOW_FACTOR = 0.35;
/** px cap on the follow — the coins settle just above the next section. */
const COIN_FOLLOW_MAX = 160;
/** Per-frame lerp toward the target: gives the "physics" trail (not sticky). */
const COIN_FOLLOW_EASE = 0.12;
/** Mobile: beat after the fountain lands before the coins drop clear of the text. */
const MOBILE_DROP_DELAY_MS = 550;

interface HeroAssetProps {
  /** Bubbled up from the coin field when the first fountain finishes landing. */
  onEntranceComplete?: () => void;
}

/**
 * Hero band: phone mockup centred on the artboard; YuCoins spill upward
 * into the headline zone only (never into the logo marquee below).
 *
 * Easter egg: clicking the phone switches gravity on — the coins drop out of
 * the band — and clicking again fountains them back out from behind it.
 */
export default function HeroAsset({ onEntranceComplete }: HeroAssetProps) {
  const [coinsShown, setCoinsShown] = useState(true);
  const lastToggleRef = useRef(0);
  const coinScrollRef = useRef<HTMLDivElement>(null);

  const togglePhoneGravity = () => {
    const now = performance.now();
    if (now - lastToggleRef.current < TOGGLE_COOLDOWN_MS) return;
    lastToggleRef.current = now;
    setCoinsShown((shown) => !shown);
  };

  const handleEntranceComplete = useCallback(() => {
    // Drives the hero's copy reveal (Hero.tsx) on every breakpoint.
    onEntranceComplete?.();
    // Mobile: the landed coins sit over the headline text, so drop them away a
    // beat later. The extended canvas lets them fall behind the next section.
    if (window.matchMedia(`(max-width: ${768 - 1}px)`).matches) {
      window.setTimeout(() => setCoinsShown(false), MOBILE_DROP_DELAY_MS);
    }
  }, [onEntranceComplete]);

  // Tablet/desktop: the landed coins lag the scroll (eased "physics") and clamp
  // just above the next section, so the marquee rises over them as you keep
  // scrolling. Mobile: no follow — target stays 0 and the coins drop away instead.
  useEffect(() => {
    const el = coinScrollRef.current;
    if (!el) return;
    const follows = window.matchMedia(FOLLOW_MEDIA);

    let raf = 0;
    let current = 0;
    let target = 0;
    let running = false;

    const tick = () => {
      current += (target - current) * COIN_FOLLOW_EASE;
      if (Math.abs(target - current) < 0.1) current = target;
      el.style.transform = `translate3d(0, ${current}px, 0)`;
      if (Math.abs(target - current) >= 0.1) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };
    const kick = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const update = () => {
      target = follows.matches
        ? Math.min(window.scrollY * COIN_FOLLOW_FACTOR, COIN_FOLLOW_MAX)
        : 0;
      kick();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    follows.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      follows.removeEventListener("change", update);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      className="hero-asset relative h-[300px] w-full overflow-visible tablet:h-[460px] desktop:h-[620px]"
      aria-hidden="true"
      style={{
        ["--phone-origin-x" as string]: `${PHONE_ORIGIN.x}%`,
        ["--phone-origin-y" as string]: `${PHONE_ORIGIN.y}%`,
        // Allow spill upward (headline) and a long way downward, so a dropped
        // coin can keep falling behind the next section without being clipped.
        clipPath: "inset(-150% 0 -250% 0)",
      }}
    >
      {/* Coins — behind the phone mockup; fountain launches from its centre. The
          canvas hangs below the band (HERO_COIN_SPILL_BOTTOM_RATIO) so dropped
          coins fall past it before the marquee (z-10, opaque) covers them. */}
      <div
        className="hero-coin-spill pointer-events-none absolute left-0 right-0 z-0 w-full"
        style={{
          height: `${HERO_SCENE_HEIGHT_RATIO * 100}%`,
          bottom: `-${HERO_COIN_SPILL_BOTTOM_RATIO * 100}%`,
        }}
      >
        {/* Scroll-follow layer (tablet/desktop). Nested inside the spill so it
            composes with the intro pin applied to .hero-coin-spill by Hero.tsx. */}
        <div
          ref={coinScrollRef}
          className="hero-coin-scroll absolute inset-0 will-change-transform"
        >
          <div className="hero-coin-field pointer-events-auto absolute inset-0 touch-none">
            <HeroCoinField
              coinsShown={coinsShown}
              onEntranceComplete={handleEntranceComplete}
            />
          </div>
        </div>
      </div>

      {/* Phone — in front of coins; extends below the band with marquee above. */}
      <div
        className="hero-asset-scene pointer-events-none absolute left-1/2 top-0 z-[2] h-full -translate-x-1/2 overflow-visible"
        style={{ aspectRatio: `${HERO_ASSET.width} / ${HERO_ASSET.height}` }}
      >
        <img
          src={assetPath("/hero/iphone.png")}
          alt=""
          width={868}
          height={1802}
          draggable={false}
          onClick={togglePhoneGravity}
          className="hero-asset-phone pointer-events-auto absolute cursor-pointer select-none"
          style={{
            left: `${toPercent(HERO_ASSET.phone.x, "x")}%`,
            top: `${toPercent(HERO_ASSET.phone.y, "y")}%`,
            width: `${toPercent(HERO_ASSET.phone.width, "size")}%`,
            height: "auto",
            maxWidth: "none",
          }}
        />
      </div>
    </div>
  );
}
