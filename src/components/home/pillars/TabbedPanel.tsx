"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { pillars, type PillarVideo } from "@/data/home-content";
import PillarBox from "./PillarBox";
import PlatformHeadingMarquee from "./PlatformHeadingMarquee";
import PlatformTabList from "./PlatformTabList";
import { PLATFORM_SWITCH_MS, PLATFORM_SWITCH_EASE } from "./platform-switch";

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

const PREVENT_INDEX = pillars.findIndex((p) => p.id === "prevent");

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
  const isPreventActive = activeIndex === PREVENT_INDEX;
  const isPreventExiting = isSwitching && exitingIndex === PREVENT_INDEX;
  const isPreventEntering = isSwitching && activeIndex === PREVENT_INDEX;
  const showFloatingCards = isPreventActive || isPreventExiting;

  const exitingPillar = exitingIndex != null ? pillars[exitingIndex] : undefined;
  const exitingVideoId =
    exitingPillar && "video" in exitingPillar && exitingPillar.video
      ? exitingPillar.id
      : null;

  return {
    isSwitching,
    slideVariant,
    showFloatingCards,
    isPreventActive,
    isPreventExiting,
    isPreventEntering,
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

function MoodCard() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const moods = ["😍", "😄", "😌", "🙂", "😄", "😌", "😄"];
  return (
    <div
      className="w-[220px] rounded-lg border p-16 shadow-[8px_8px_0_0_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-300)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold" style={{ color: "#5a5a5c" }}>
          Your Mood
        </span>
        <span className="text-[12px]" style={{ color: "#8a8a8c" }}>
          View calendar →
        </span>
      </div>
      <div className="mt-12 flex justify-between">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-4">
            <span className="text-[11px] font-semibold" style={{ color: "#9a9a9c" }}>
              {d}
            </span>
            <span className="text-[16px] leading-none">{moods[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreathingCard() {
  return (
    <div
      className="w-[150px] overflow-hidden rounded-lg border shadow-[8px_8px_0_0_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-300)" }}
    >
      <div
        className="flex h-[108px] items-center justify-center text-[40px]"
        style={{ backgroundColor: "#018547" }}
      >
        🪷
      </div>
      <div className="px-12 py-14 text-center text-[15px] font-bold leading-tight" style={{ color: "#5a5a5c" }}>
        Breathing
        <br />
        exercises
      </div>
    </div>
  );
}

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
    <div className="flex w-full max-w-[1216px] flex-col items-center gap-flow tablet:gap-group">
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

        {tabSwitch.showFloatingCards && (
          <>
            <FloatingCardShell
              className="absolute -left-8 bottom-24 z-10 hidden tablet:block desktop:-left-24"
              isEntering={tabSwitch.isPreventEntering}
              isExiting={tabSwitch.isPreventExiting}
            >
              <MoodCard />
            </FloatingCardShell>
            <FloatingCardShell
              className="absolute -right-8 top-24 z-10 hidden tablet:block desktop:-right-24"
              isEntering={tabSwitch.isPreventEntering}
              isExiting={tabSwitch.isPreventExiting}
            >
              <BreathingCard />
            </FloatingCardShell>
          </>
        )}
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
