"use client";

import { useEffect, useRef, useState } from "react";
import { pillars, type PillarVideo } from "@/data/home-content";
import PillarAccordion from "@/components/ui/PillarAccordion";
import PlatformTabList from "@/components/ui/PlatformTabList";
import RewardsColumns from "@/components/ui/RewardsColumns";
import { PLATFORM_SWITCH_MS, PLATFORM_SWITCH_EASE } from "@/lib/platform-switch";
import { assetPath } from "@/lib/assetPath";
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
/** Delay between each floating card's fade-up — the chat-log stagger. */
const FLOATING_STAGGER_MS = 130;

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

  const exitingPillar = exitingIndex != null ? pillars[exitingIndex] : undefined;
  const exitingVideoId =
    exitingPillar && "video" in exitingPillar && exitingPillar.video
      ? exitingPillar.id
      : null;

  return { isSwitching, slideVariant, exitingVideoId };
}

type FloatingCard = {
  key: string;
  src: string;
  alt: string;
  /** Intrinsic pixel size (the 4x export) — sets the aspect ratio. */
  width: number;
  height: number;
  /** Desktop display width in px; the whole log scales down below desktop. */
  w: number;
  /** Extra layout on the card's wrapper — its top gap and any chat indent. */
  itemClassName?: string;
  bobDelay: string;
  bobDuration: string;
  /** Shadow already in the image (or intentionally none) — skip the CSS one. */
  bakedShadow?: boolean;
};

type FloatingLogConfig = {
  /** Desktop log width in px (the widest card, including any indent). */
  width: number;
  cards: FloatingCard[];
};

/**
 * Floating "chat log" per pillar id → column index. Each card is an exported
 * image (4x → webp; the cards are pixel-faithful product UI, never rebuilt in
 * markup) laid out per the Figma "Log". Only designed columns have an entry;
 * every other column renders nothing.
 * (Figma 2802:8047 · 2813:10605 · 2813:10630 · 2813:10659 · 2847:9559.)
 */
const FLOATING_LOGS: Record<string, Record<number, FloatingLogConfig>> = {
  prevent: {
    // Daily Reflections — greeting, week's mood log, rested prompt, YuCoin reward.
    0: {
      width: 370,
      cards: [
        { key: "checkin-greeting", src: assetPath("/home/platform/prevent-checkin-greeting-card.webp"), alt: "App check-in greeting — how are you feeling today? — with a row of mood emojis", width: 1480, height: 568, w: 370, bobDelay: "0s", bobDuration: "4.8s" },
        { key: "mood-week", src: assetPath("/home/platform/prevent-mood-week-card.webp"), alt: "A look at your mood this week, showing a daily mood check-in for each day", width: 1480, height: 528, w: 370, itemClassName: "mt-[16px]", bobDelay: "0.5s", bobDuration: "5.1s" },
        { key: "rested", src: assetPath("/home/platform/prevent-rested-card.webp"), alt: "A how-well-rested-are-you scale from less than usual to more than usual", width: 1480, height: 408, w: 370, itemClassName: "mt-[16px]", bobDelay: "1s", bobDuration: "4.6s" },
        { key: "yucoin-reward", src: assetPath("/home/platform/prevent-yucoin-card.webp"), alt: "Reward notice: you earned 200 YuCoin for checking in with yourself", width: 1480, height: 304, w: 370, itemClassName: "mt-[16px]", bobDelay: "1.4s", bobDuration: "5.4s" },
      ],
    },
    // 24/7 Virtual GP — an incoming chat message, an indented reply, then the
    // booked-appointment card (Figma 2813:10605).
    1: {
      width: 370,
      cards: [
        { key: "vgp-chat1", src: assetPath("/home/platform/prevent-vgp-chat1.webp"), alt: "Chat message: I'm worried about a medical issue, but my doctor has no availability", width: 1384, height: 344, w: 346, bobDelay: "0s", bobDuration: "4.7s", bakedShadow: true },
        { key: "vgp-chat2", src: assetPath("/home/platform/prevent-vgp-chat2.webp"), alt: "Chat reply: should we book in a video call appointment to discuss more?", width: 1384, height: 344, w: 346, itemClassName: "mt-[16px] ml-[24px]", bobDelay: "0.5s", bobDuration: "5.2s", bakedShadow: true },
        { key: "vgp-appointment", src: assetPath("/home/platform/prevent-vgp-appointment.webp"), alt: "Booked Virtual GP video call with Dr. Tan, tomorrow at 1pm", width: 1480, height: 344, w: 370, itemClassName: "mt-[24px]", bobDelay: "1s", bobDuration: "4.9s", bakedShadow: true },
      ],
    },
    // Comprehensive EAP — an active counselling call, then a row of resources.
    2: {
      width: 370,
      cards: [
        { key: "eap-call", src: assetPath("/home/platform/prevent-eap-call.webp"), alt: "Active call with the Employee Counselling Line", width: 1480, height: 376, w: 370, bobDelay: "0s", bobDuration: "4.8s", bakedShadow: true },
        { key: "eap-resources", src: assetPath("/home/platform/prevent-eap-resources.webp"), alt: "Mental-health resources: restful routines, mental-health awareness, mindful moments", width: 1480, height: 984, w: 370, itemClassName: "mt-[24px]", bobDelay: "0.6s", bobDuration: "5.3s", bakedShadow: true },
      ],
    },
    // Centralised Benefits Hub — a single quick-access card of wellbeing benefits.
    3: {
      width: 378,
      cards: [
        { key: "benefits-hub", src: assetPath("/home/platform/prevent-benefits-hub.webp"), alt: "Benefits hub: a welcome message and a list of the company's wellbeing benefits", width: 1512, height: 1544, w: 378, bobDelay: "0s", bobDuration: "5s", bakedShadow: true },
      ],
    },
  },
  engage: {
    // Daily Health Challenges — a stack of daily challenge cards (Figma 2818:7845).
    // Exports are the card only (transparent rounded corners, 4x); the hard offset
    // shadow is added in CSS.
    0: {
      width: 274,
      cards: [
        { key: "eng-meditation", src: assetPath("/home/platform/engage-challenge-meditation.webp"), alt: "Meditation challenge — 5 minutes, 160 YuCoin", width: 1096, height: 416, w: 274, bobDelay: "0s", bobDuration: "4.8s" },
        { key: "eng-workout", src: assetPath("/home/platform/engage-challenge-workout.webp"), alt: "Workout challenge — 30 minutes, 240 YuCoin", width: 1096, height: 416, w: 274, itemClassName: "mt-[16px]", bobDelay: "0.4s", bobDuration: "5.1s" },
        { key: "eng-yudoku", src: assetPath("/home/platform/engage-challenge-yudoku.webp"), alt: "Daily Yudoku challenge — 120 YuCoin", width: 1096, height: 416, w: 274, itemClassName: "mt-[16px]", bobDelay: "0.8s", bobDuration: "4.6s" },
        { key: "eng-longwalk", src: assetPath("/home/platform/engage-challenge-longwalk.webp"), alt: "Long walk challenge — 30 minutes, 240 YuCoin", width: 1096, height: 416, w: 274, itemClassName: "mt-[16px]", bobDelay: "1.2s", bobDuration: "5.4s" },
      ],
    },
    // Seamless Connectivity — a stack of "integration connected" cards, one per
    // wearable, each with its brand toggle switched on (Figma 2847:9559). The
    // exports are the card only (transparent rounded corners, 4x); the hard offset
    // shadow is added in CSS, so the stack pitch is one card height plus the 16px
    // gap (mt-[16px]).
    1: {
      width: 362,
      cards: [
        { key: "connect-fitbit", src: assetPath("/home/platform/engage-connect-fitbit.webp"), alt: "Fitbit — connected", width: 1448, height: 288, w: 362, bobDelay: "0s", bobDuration: "4.8s" },
        { key: "connect-garmin", src: assetPath("/home/platform/engage-connect-garmin.webp"), alt: "Garmin Connect — connected", width: 1448, height: 288, w: 362, itemClassName: "mt-[16px]", bobDelay: "0.45s", bobDuration: "5.1s" },
        { key: "connect-strava", src: assetPath("/home/platform/engage-connect-strava.webp"), alt: "Strava — connected", width: 1448, height: 288, w: 362, itemClassName: "mt-[16px]", bobDelay: "0.9s", bobDuration: "4.6s" },
        { key: "connect-withings", src: assetPath("/home/platform/engage-connect-withings.webp"), alt: "Withings — connected", width: 1448, height: 288, w: 362, itemClassName: "mt-[16px]", bobDelay: "1.3s", bobDuration: "5.4s" },
      ],
    },
  },
};

/**
 * The right-side floating "chat log" for the selected column: exported card
 * images stacked per the Figma layout. The log remounts on every column/pillar
 * change — keyed on `${pillarId}-${column}` — so each card replays its
 * staggered fade-up, then bobs idly. It always sits top-right of the video,
 * scales down on tablet and is hidden on mobile.
 */
function FloatingLog({ pillarId, column }: { pillarId: string; column: number }) {
  const log = FLOATING_LOGS[pillarId]?.[column];
  if (!log) return null;

  return (
    <div
      key={`${pillarId}-${column}`}
      className="pointer-events-none absolute right-[16px] top-[16px] z-10 hidden origin-top-right tablet:right-[28px] tablet:top-[32px] tablet:block tablet:scale-[0.8] desktop:right-40 desktop:top-40 desktop:scale-100"
      style={{ width: log.width }}
      aria-hidden
    >
      <div className="flex flex-col items-end">
        {log.cards.map((card, i) => (
          <div
            key={card.key}
            className={`platform-float-in ${card.itemClassName ?? ""}`}
            style={
              { "--float-delay": `${i * FLOATING_STAGGER_MS}ms`, width: card.w } as React.CSSProperties
            }
          >
            <div
              className="platform-floating-card"
              style={
                {
                  "--bob-delay": card.bobDelay,
                  "--bob-duration": card.bobDuration,
                } as React.CSSProperties
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- static export; drop-shadow filter needs the raw element */}
              <img
                src={card.src}
                alt={card.alt}
                width={card.width}
                height={card.height}
                className={`platform-floating-card-img block h-auto w-full ${
                  card.bakedShadow ? "" : "platform-floating-card-img--shadow"
                }`}
              />
            </div>
          </div>
        ))}
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
              className="absolute inset-0 block h-full w-full object-cover object-[var(--video-focus-x)_50%] tablet:object-right"
              style={{ "--video-focus-x": video.focusX } as React.CSSProperties}
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

/** How long each accordion item stays open before autoplay advances. */
const SLIDE_MS = 10_000;

/**
 * Autoplay gate for the pillar accordion. Opening an accordion item stops it;
 * picking a different tab starts it again on the new tab's content. It is
 * disabled under reduced motion, and pauses (without resetting) while the
 * panel is off-screen or the page is hidden.
 */
function usePillarAutoplay(rootRef: React.RefObject<HTMLElement | null>) {
  const [enabled, setEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const onVisibility = () => setPageVisible(document.visibilityState === "visible");
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);

    const root = rootRef.current;
    const io = root
      ? new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
          threshold: 0.35,
        })
      : null;
    if (root) io?.observe(root);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, [rootRef]);

  return {
    running: enabled && !reducedMotion,
    paused: !inView || !pageVisible,
    stop: () => setEnabled(false),
    start: () => setEnabled(true),
  };
}

export default function TabbedPanel({
  active,
  onActiveChange,
}: {
  active: number;
  onActiveChange: (index: number) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const activePillar = pillars[active];
  const tabSwitch = usePlatformTabSwitch(active);
  const items = activePillar.bullets.slice(0, 4);
  const autoplay = usePillarAutoplay(rootRef);

  // One accordion item is open at a time, and every top-tab switch resets it to
  // the first item — including returning to a tab left on a later item. Reset
  // during render (not in an effect) so the new tab never paints a stale item.
  // The open item also drives the floating cards.
  const [itemActive, setItemActive] = useState(0);
  const [itemTab, setItemTab] = useState(active);
  if (itemTab !== active) {
    setItemTab(active);
    setItemActive(0);
  }

  // Autoplay: each item stays open for SLIDE_MS, then the next opens, looping
  // within the current tab.
  const advance = () => setItemActive((itemActive + 1) % items.length);

  return (
    <div
      {...domSrc("TabbedPanel")}
      ref={rootRef}
      className="flex w-full max-w-[1216px] flex-col items-center gap-[var(--layout-section-gap)]"
    >
      <PlatformTabList
        active={active}
        onActiveChange={(index) => {
          if (index === active) return;
          // A new tab restarts the countdown on its first item (the accordion
          // remounts per tab), even if an earlier interaction had stopped it.
          autoplay.start();
          onActiveChange(index);
        }}
      />

      {/* Accordion left, video right (Figma 2912:57740, ContentVideo). Tabs and
          this row are siblings in the section, a section gap apart. On desktop
          the accordion takes the remaining width with no gap, so its item
          borders run into the video frame. Stacks below desktop, accordion
          first. */}
      <div className="flex w-full flex-col gap-flow desktop:flex-row desktop:items-center desktop:gap-0">
        <div className="w-full desktop:min-w-0 desktop:flex-1">
          <PillarAccordion
            key={activePillar.id}
            items={items}
            active={itemActive}
            onSelect={(index) => {
              autoplay.stop();
              setItemActive(index);
            }}
            countdown={
              autoplay.running
                ? { durationMs: SLIDE_MS, paused: autoplay.paused, onEnd: advance }
                : undefined
            }
          />
        </div>

        {/* Video with the open item's floating cards */}
        <div className="relative w-full min-w-0 desktop:w-[748px] desktop:shrink-0">
          <div className="relative z-[2] h-[360px] w-full overflow-hidden rounded-md border border-transparent tablet:h-[480px] desktop:h-[600px]">
            <PlatformVideoStack
              activeIndex={active}
              isSwitching={tabSwitch.isSwitching}
              exitingVideoId={tabSwitch.exitingVideoId}
              slideVariant={tabSwitch.slideVariant}
            />
          </div>

          {activePillar.id === "engage" &&
          items[itemActive]?.title === "Real-World Rewards" ? (
            <RewardsColumns key={`rewards-${active}`} />
          ) : (
            <FloatingLog pillarId={activePillar.id} column={itemActive} />
          )}

          {/* Brand-gradient frame border, painted over the transparent 1px
              border above so it also sits over the floating cards' clip. */}
          <div aria-hidden className="pillar-frame-ring pointer-events-none absolute inset-0 z-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
