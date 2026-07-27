"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { pillars, type PillarVideo } from "@/data/home-content";
import PillarBox from "./PillarBox";
import PlatformHeadingMarquee from "./PlatformHeadingMarquee";
import PlatformTabList from "./PlatformTabList";
import { PLATFORM_SWITCH_MS, PLATFORM_SWITCH_EASE } from "./platform-switch";
import { domSrc } from "@/lib/domSrc";

/** Accent per capability box / start-node, left → right. */
export const PILLAR_COLORS = [
  "var(--green-600)",
  "var(--blue-600)",
  "var(--yellow-600)",
  "var(--purple-600)",
] as const;

/** Engage opens by default on page load. */
const DEFAULT_TAB = pillars.findIndex((p) => p.id === "engage");

const PILLARS_WITH_VIDEO = pillars.filter(
  (pillar): pillar is (typeof pillars)[number] & { video: PillarVideo } =>
    "video" in pillar && !!pillar.video,
);

/** Match ProductShowcase card background transitions. */
const SWITCH_MS = PLATFORM_SWITCH_MS;
const SWITCH_EASE = PLATFORM_SWITCH_EASE;
/** Floating cards — rise/fade like useReveal; enter is reversed exit with ease-in. */
const FLOATING_REVEAL_MS = 550;
const FLOATING_REVEAL_EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const FLOATING_REVEAL_EASE_IN = "cubic-bezier(0.64, 0, 0.78, 0)";

function usePlatformTabSwitch(activeIndex: number) {
  const prevActiveIndexRef = useRef(activeIndex);
  const switchTimeoutRef = useRef<number>(undefined);

  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (activeIndex === prevActiveIndexRef.current) return;

    setExitingIndex(prevActiveIndexRef.current);
    setSlideDirection(activeIndex > prevActiveIndexRef.current ? 1 : -1);
    setIsSwitching(true);

    window.clearTimeout(switchTimeoutRef.current);
    switchTimeoutRef.current = window.setTimeout(() => {
      setIsSwitching(false);
      setExitingIndex(null);
    }, SWITCH_MS);

    prevActiveIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => () => window.clearTimeout(switchTimeoutRef.current), []);

  const slideVariant: "Left" | "Right" = slideDirection > 0 ? "Right" : "Left";

  const activePillarId = pillars[activeIndex]?.id;
  const exitingPillarId = exitingIndex != null ? pillars[exitingIndex]?.id : undefined;
  const activeFloatingCards = activePillarId ? FLOATING_CARDS[activePillarId] : undefined;
  const exitingFloatingCards = exitingPillarId ? FLOATING_CARDS[exitingPillarId] : undefined;
  const isFloatingEntering = isSwitching && !!activeFloatingCards;
  const isFloatingExiting = isSwitching && !!exitingFloatingCards;

  const exitingPillar = exitingIndex != null ? pillars[exitingIndex] : undefined;
  const exitingVideoId =
    exitingPillar && "video" in exitingPillar && exitingPillar.video
      ? exitingPillar.id
      : null;

  return {
    isSwitching,
    slideVariant,
    activeFloatingCards,
    exitingFloatingCards,
    isFloatingEntering,
    isFloatingExiting,
    exitingVideoId,
  };
}

function FloatingCardShell({
  children,
  className,
  isEntering,
  isExiting,
}: {
  children: ReactNode;
  className: string;
  isEntering: boolean;
  isExiting: boolean;
}) {
  const [enterActive, setEnterActive] = useState(false);

  useEffect(() => {
    if (isExiting) {
      setEnterActive(false);
      return;
    }
    if (!isEntering) return;

    setEnterActive(true);
    const timer = window.setTimeout(() => setEnterActive(false), FLOATING_REVEAL_MS);
    return () => window.clearTimeout(timer);
  }, [isEntering, isExiting]);

  const layerAnimation = isExiting
    ? `platformFloatExit ${FLOATING_REVEAL_MS}ms ${FLOATING_REVEAL_EASE_OUT} both`
    : enterActive
      ? `platformFloatExit ${FLOATING_REVEAL_MS}ms ${FLOATING_REVEAL_EASE_IN} reverse both`
      : undefined;

  return (
    <div
      className={`platform-floating-layer ${className}`}
      style={layerAnimation ? { animation: layerAnimation } : undefined}
    >
      {children}
    </div>
  );
}

function splitBullet(bullet: string) {
  const idx = bullet.indexOf(":");
  if (idx === -1) return { title: bullet.trim(), description: "" };
  return {
    title: bullet.slice(0, idx).trim(),
    description: bullet.slice(idx + 1).trim(),
  };
}

/** Hairline dividers between boxes — borders instead of grid gap so pointer
 *  events stay continuous when moving across four desktop columns. */
function boxBorderClass(index: number) {
  if (index === 0) return "";
  const classes = ["border-t border-line-emphasis"];
  if (index % 2 === 1) classes.push("tablet:border-l");
  if (index >= 2) classes.push("tablet:border-t");
  classes.push("desktop:border-t-0");
  if (index % 4 !== 0) classes.push("desktop:border-l");
  return classes.join(" ");
}

/** Hover tilt tuning — subtle, like the hero YuCoin's pointer response. */
const TILT_MAX_DEG = 9;
const SHADOW_BASE_PX = 8;
const SHADOW_RANGE_PX = 6;

/** Imperative CSS-var updates (no re-render) driving `.platform-floating-card-tilt`:
 *  rotateX/Y for the tilt, a shifted drop-shadow so it reads as one lit object
 *  rather than a tilt effect plus a static shadow, and a pointer-tracked sheen. */
function useCardTiltHandlers() {
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;

    el.style.setProperty("--tilt-x", `${(-py * TILT_MAX_DEG).toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${(px * TILT_MAX_DEG).toFixed(2)}deg`);
    el.style.setProperty("--shadow-x", `${(SHADOW_BASE_PX - px * SHADOW_RANGE_PX).toFixed(2)}px`);
    el.style.setProperty("--shadow-y", `${(SHADOW_BASE_PX - py * SHADOW_RANGE_PX).toFixed(2)}px`);
    el.style.setProperty("--sheen-x", `${((px + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--sheen-y", `${((py + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--sheen-opacity", "1");
  };

  const handlePointerLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
    el.style.setProperty("--shadow-x", `${SHADOW_BASE_PX}px`);
    el.style.setProperty("--shadow-y", `${SHADOW_BASE_PX}px`);
    el.style.setProperty("--sheen-opacity", "0");
  };

  return { handlePointerMove, handlePointerLeave };
}

/** A floating card image: idle bob (own animation layer, phase-offset per
 *  card like the hero coins) + hover tilt/lighting (pointer-driven layer). */
function FloatingTiltCard({
  src,
  alt,
  width,
  height,
  widthClassName,
  radiusClassName,
  bobDelay,
  bobDuration,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  widthClassName: string;
  radiusClassName: string;
  bobDelay: string;
  bobDuration: string;
}) {
  const { handlePointerMove, handlePointerLeave } = useCardTiltHandlers();

  return (
    <div
      className="platform-floating-card"
      style={{ "--bob-delay": bobDelay, "--bob-duration": bobDuration } as React.CSSProperties}
    >
      <div
        className={`platform-floating-card-tilt overflow-hidden ${radiusClassName} ${widthClassName}`}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static export; drop-shadow filter needs the raw element */}
        <img src={src} alt={alt} width={width} height={height} className="h-auto w-full" />
        <div className="platform-floating-card-sheen" aria-hidden />
      </div>
    </div>
  );
}

type FloatingCardConfig = {
  key: string;
  /** Absolute positioning classes — which corner the card floats in. */
  cornerClassName: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  widthClassName: string;
  radiusClassName: string;
  bobDelay: string;
  bobDuration: string;
};

/** Floating cards per pillar id — only pillars with real design assets get
 *  an entry; others render the video hero with no floating cards. */
const FLOATING_CARDS: Record<string, FloatingCardConfig[]> = {
  prevent: [
    {
      key: "mood",
      cornerClassName: "absolute -left-8 bottom-24 z-10 hidden tablet:block desktop:-left-24",
      src: "/home/platform/prevent-mood-card.png",
      alt: "Your Mood tracker showing a week of mood check-ins",
      width: 361,
      height: 145,
      widthClassName: "w-[220px] tablet:w-[280px] desktop:w-[361px]",
      radiusClassName: "rounded-md",
      bobDelay: "0s",
      bobDuration: "4.6s",
    },
    {
      key: "breathing",
      cornerClassName: "absolute -right-8 top-24 z-10 hidden tablet:block desktop:-right-24",
      src: "/home/platform/prevent-breathing-card.png",
      alt: "Breathing exercises card",
      width: 166,
      height: 214,
      widthClassName: "w-[120px] tablet:w-[150px] desktop:w-[166px]",
      radiusClassName: "rounded-lg",
      bobDelay: "0.9s",
      bobDuration: "5.3s",
    },
  ],
  empower: [
    {
      key: "nps",
      cornerClassName: "absolute -left-8 top-24 z-10 hidden tablet:block desktop:-left-24",
      src: "/home/platform/empower-nps-card.png",
      alt: "Employee NPS score of 72, with a detractors, passives, and promoters breakdown",
      width: 357,
      height: 400,
      widthClassName: "w-[215px] tablet:w-[275px] desktop:w-[357px]",
      radiusClassName: "rounded-sm",
      bobDelay: "0s",
      bobDuration: "4.9s",
    },
    {
      key: "burnout",
      cornerClassName: "absolute -right-8 bottom-24 z-10 hidden tablet:block desktop:-right-24",
      src: "/home/platform/empower-burnout-card.png",
      alt: "Burnout risk distribution across high, neutral, and low risk",
      width: 357,
      height: 189,
      widthClassName: "w-[215px] tablet:w-[275px] desktop:w-[357px]",
      radiusClassName: "rounded-sm",
      bobDelay: "1.1s",
      bobDuration: "5.6s",
    },
  ],
};

function PlatformVideoStack({
  activeIndex,
  isSwitching,
  exitingVideoId,
  slideVariant,
}: {
  activeIndex: number;
  isSwitching: boolean;
  exitingVideoId: string | null;
  slideVariant: "Left" | "Right";
}) {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const activeId = pillars[activeIndex]?.id ?? "";
  const activeHasVideo = PILLARS_WITH_VIDEO.some((pillar) => pillar.id === activeId);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    for (const { id } of PILLARS_WITH_VIDEO) {
      const el = videoRefs.current.get(id);
      if (!el) continue;

      const isActive = id === activeId;
      const isExiting = id === exitingVideoId && isSwitching;

      if (isActive && !reducedMotion) {
        el.play().catch(() => {});
      } else if (!isExiting) {
        el.pause();
      }
    }
  }, [activeId, exitingVideoId, isSwitching]);

  useEffect(() => {
    if (!isSwitching || !exitingVideoId) return;

    const el = videoRefs.current.get(exitingVideoId);
    if (!el) return;

    const timeout = window.setTimeout(() => el.pause(), SWITCH_MS);
    return () => window.clearTimeout(timeout);
  }, [exitingVideoId, isSwitching]);

  if (PILLARS_WITH_VIDEO.length === 0 && !activeHasVideo) {
    return <VideoPlaceholder built={false} />;
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {PILLARS_WITH_VIDEO.map(({ id, video }) => {
        const isActive = id === activeId;
        const isExiting = id === exitingVideoId && isSwitching;
        const isVisible = isActive || isExiting;

        const layerAnimation = isExiting
          ? `productBgExit${slideVariant} ${SWITCH_MS}ms ${SWITCH_EASE} both`
          : isSwitching && isActive
            ? `productBgEnter${slideVariant} ${SWITCH_MS}ms ${SWITCH_EASE} both`
            : undefined;

        return (
          <div
            key={id}
            className="product-showcase-bg-layer absolute inset-0 overflow-hidden"
            style={{
              visibility: isVisible ? "visible" : "hidden",
              zIndex: isActive ? 2 : isExiting ? 1 : 0,
              animation: layerAnimation,
            }}
            aria-hidden={!isActive}
          >
            <video
              ref={(el) => {
                if (el) videoRefs.current.set(id, el);
                else videoRefs.current.delete(id);
              }}
              className="absolute inset-0 block h-full w-full object-cover"
              src={video.mp4}
              width={1600}
              height={900}
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden={!isActive}
              aria-label={isActive ? "Platform demonstration video" : undefined}
            />
          </div>
        );
      })}

      {!activeHasVideo && (
        <div className="absolute inset-0 z-10">
          <VideoPlaceholder built={false} />
        </div>
      )}
    </div>
  );
}

function VideoPlaceholder({ built }: { built: boolean }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-md"
      style={{
        backgroundImage:
          "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--purple-600) 26%, transparent), transparent 62%), linear-gradient(160deg, var(--purple-800), var(--purple-900))",
      }}
    >
      {built ? (
        <span
          className="grid size-64 place-items-center rounded-full border"
          style={{
            borderColor: "color-mix(in srgb, var(--neutral-white) 55%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--neutral-white) 10%, transparent)",
          }}
          aria-label="Video placeholder"
        >
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true">
            <path d="M2 2l18 11L2 24V2z" fill="var(--neutral-white)" />
          </svg>
        </span>
      ) : (
        <span
          className="type-body-lg px-24 text-center"
          style={{ color: "color-mix(in srgb, var(--neutral-white) 72%, transparent)" }}
        >
          Coming soon
        </span>
      )}
    </div>
  );
}

export const DEFAULT_ACTIVE_TAB = DEFAULT_TAB;

export default function TabbedPanel({
  active,
  onActiveChange,
}: {
  active: number;
  onActiveChange: (index: number) => void;
}) {
  const activePillar = pillars[active];
  const tabSwitch = usePlatformTabSwitch(active);
  const boxes = activePillar.bullets.slice(0, 4).map(splitBullet);
  const desktopCols =
    boxes.length >= 4 ? "desktop:grid-cols-4" : "desktop:grid-cols-3";

  return (
    <div {...domSrc("TabbedPanel")} className="flex w-full max-w-[1216px] flex-col items-center gap-flow tablet:gap-group">
      <PlatformTabList active={active} onActiveChange={onActiveChange} />

      {/* Video / hero placeholder with floating cards */}
      <div className="relative w-full">
        <div
          className="pointer-events-none absolute z-0 h-[320px] overflow-hidden tablet:h-[440px] desktop:h-[548px]"
          style={{
            left: "50%",
            width: "100vw",
            marginLeft: "-50vw",
          }}
          aria-hidden
        >
          <PlatformHeadingMarquee heading={activePillar.heading} />
        </div>

        <div className="relative z-[2] h-[320px] w-full overflow-hidden rounded-md border border-line-emphasis tablet:h-[440px] desktop:h-[548px]">
          <PlatformVideoStack
            activeIndex={active}
            isSwitching={tabSwitch.isSwitching}
            exitingVideoId={tabSwitch.exitingVideoId}
            slideVariant={tabSwitch.slideVariant}
          />
        </div>

        {tabSwitch.exitingFloatingCards?.map(({ key, cornerClassName, ...card }) => (
          <FloatingCardShell
            key={`exit-${key}`}
            className={cornerClassName}
            isEntering={false}
            isExiting={tabSwitch.isFloatingExiting}
          >
            <FloatingTiltCard {...card} />
          </FloatingCardShell>
        ))}
        {tabSwitch.activeFloatingCards?.map(({ key, cornerClassName, ...card }) => (
          <FloatingCardShell
            key={`active-${key}`}
            className={cornerClassName}
            isEntering={tabSwitch.isFloatingEntering}
            isExiting={false}
          >
            <FloatingTiltCard {...card} />
          </FloatingCardShell>
        ))}
      </div>

      {/* Capability boxes — pulled down half their height on desktop so they
          straddle the platform / Yunity divider; -mt-[74px] cancels the extra
          visual gap the translate adds below the video hero. */}
      <div
        className={`relative grid w-full grid-cols-1 overflow-hidden rounded-md border border-line-emphasis bg-surface-inverse-raised tablet:grid-cols-2 desktop:-mt-[74px] desktop:translate-y-1/2 ${desktopCols}`}
      >
        {boxes.map((box, i) => (
          <PillarBox
            key={`${activePillar.id}-${box.title}`}
            anchorIndex={i}
            title={box.title}
            description={box.description}
            className={boxBorderClass(i)}
          />
        ))}
      </div>
    </div>
  );
}
