import dynamic from "next/dynamic";
import {
  HERO_ASSET,
  HERO_SCENE_HEIGHT_RATIO,
  PHONE_ORIGIN,
  toPercent,
} from "./heroAssetLayout";

const HeroCoinField = dynamic(() => import("./HeroCoinField"), {
  ssr: false,
  loading: () => null,
});

/**
 * Hero band: phone mockup centred on the artboard; YuCoins spill upward
 * into the headline zone only (never into the logo marquee below).
 */
export default function HeroAsset() {
  return (
    <div
      className="hero-asset relative h-[300px] w-full overflow-visible tablet:h-[460px] desktop:h-[620px]"
      aria-hidden="true"
      style={{
        ["--phone-origin-x" as string]: `${PHONE_ORIGIN.x}%`,
        ["--phone-origin-y" as string]: `${PHONE_ORIGIN.y}%`,
        // Allow coins to spill upward into the headline; clip only at the band bottom.
        clipPath: "inset(-150% 0 0 0)",
      }}
    >
      {/* Coins — full viewport width, extends upward into the headline zone. */}
      <div
        className="hero-coin-spill pointer-events-none absolute bottom-0 left-0 right-0 w-full"
        style={{
          height: `${HERO_SCENE_HEIGHT_RATIO * 100}%`,
        }}
      >
        <div className="hero-coin-field pointer-events-auto absolute inset-0 touch-none">
          <HeroCoinField />
        </div>
      </div>

      {/* Phone — original 1920×720 artboard; clipped at the hero band bottom. */}
      <div
        className="hero-asset-scene pointer-events-none absolute left-1/2 top-0 h-full -translate-x-1/2 overflow-hidden"
        style={{ aspectRatio: `${HERO_ASSET.width} / ${HERO_ASSET.height}` }}
      >
        <img
          src="/hero/iphone.png"
          alt=""
          width={868}
          height={1802}
          draggable={false}
          className="hero-asset-phone absolute select-none"
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
