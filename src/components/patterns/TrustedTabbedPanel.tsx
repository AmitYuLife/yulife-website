"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { testimonials, DEFAULT_TESTIMONIAL, type Testimonial } from "@/data/home-content";
import { useCarouselKeyboard, type CarouselDirection } from "@/hooks/useCarouselKeyboard";
import { marqueeLogoSrc } from "@/data/marquee-logos";
import AnimatedTabList from "./AnimatedTabList";
import { PLATFORM_SWITCH_MS, PLATFORM_SWITCH_EASE } from "./platform-switch";
import { domSrc } from "@/lib/domSrc";

const TABLET_MEDIA = "(min-width: 768px)";

/** Horizontal hairline dividers between the stacked desktop sidebar rows. */
function sidebarBorderClass(index: number) {
  return index === 0 ? "" : "border-t border-line-emphasis";
}

function TabContent({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.logoSlug) {
    return (
      <img
        src={marqueeLogoSrc(testimonial.logoSlug)}
        alt={testimonial.company}
        className="h-[24px] w-auto max-w-[80%] object-contain tablet:h-[28px]"
        draggable={false}
      />
    );
  }

  return (
    <span className="text-center text-[11px] font-semibold leading-tight text-on-inverse tablet:text-[14px]">
      {testimonial.company}
    </span>
  );
}

/** Preview-only: case study video behind each tab, with a darkening scrim
 *  (mirrors the old PANEL_GRADIENT's tone) so quote/author text stays legible.
 *  Tabs without their own encoded clip yet fall back to the XMA video. */
const VIDEO_SCRIM =
  "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--purple-600) 30%, transparent), transparent 55%), linear-gradient(180deg, color-mix(in srgb, var(--purple-900) 8%, transparent) 0%, color-mix(in srgb, var(--purple-900) 88%, transparent) 100%)";

const DEFAULT_VIDEO_ID = "xma";
const CASESTUDY_VIDEO_IDS = new Set(["xma", "what3words", "ozone", "bruntwood", "nicepak"]);

function TestimonialPanel({ testimonial }: { testimonial: Testimonial }) {
  const videoId = CASESTUDY_VIDEO_IDS.has(testimonial.id) ? testimonial.id : DEFAULT_VIDEO_ID;

  return (
    <div className="relative h-full w-full overflow-hidden">
      <video
        key={videoId}
        className="absolute inset-0 block h-full w-full object-cover"
        src={`/home/casestudies/${videoId}.mp4`}
        poster={`/home/casestudies/${videoId}-poster.jpg`}
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0" style={{ backgroundImage: VIDEO_SCRIM }} />

      {testimonial.quote ? (
        <div className="relative flex h-full w-full flex-col justify-end p-24 pr-64 tablet:p-40 tablet:pr-80">
          <blockquote className="type-body-lg max-w-[640px] font-semibold text-on-inverse">
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          {testimonial.author && (
            <div className="mt-24">
              <span
                className="type-label inline-flex rounded-full px-16 py-8 font-semibold"
                style={{ backgroundColor: "var(--neutral-white)", color: "var(--text-emphasis)" }}
              >
                {testimonial.author}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative grid h-full w-full place-items-center">
          <span
            className="type-body-lg"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 72%, transparent)" }}
          >
            Coming soon
          </span>
        </div>
      )}
    </div>
  );
}

function ControlButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-32 cursor-pointer place-items-center rounded-full transition-opacity hover:opacity-90 ${active ? "opacity-90" : ""}`}
      style={{ backgroundColor: "color-mix(in srgb, var(--neutral-white) 40%, transparent)" }}
    >
      {children}
    </button>
  );
}

/** Mobile-only: a horizontally draggable/swipeable logo strip that shows ~2.5
 *  brands at a time (each tab is 40% wide). The active brand is scrolled into
 *  view when it changes via the arrows. Desktop uses AnimatedTabList instead. */
function MobileTabStrip({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const tab = scroller.querySelector<HTMLElement>(`[data-strip-index="${active}"]`);
    if (!tab) return;

    // Centre the active tab, scrolling only the strip (never the page).
    const left = tab.offsetLeft - (scroller.clientWidth - tab.clientWidth) / 2;
    scroller.scrollTo({ left, behavior: mountedRef.current ? "smooth" : "auto" });
    mountedRef.current = true;
  }, [active]);

  return (
    <div className="border-t border-line-emphasis bg-surface-inverse-raised tablet:hidden">
      <div
        ref={scrollerRef}
        role="tablist"
        aria-label="Customer testimonials"
        className="flex overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {testimonials.map((testimonial, index) => {
          const selected = index === active;
          return (
            <button
              key={testimonial.id}
              data-strip-index={index}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-label={`${testimonial.company} testimonial`}
              onClick={() => onSelect(index)}
              className={`flex h-14 w-[40%] shrink-0 cursor-pointer items-center justify-center overflow-hidden px-8 transition-colors ${
                index > 0 ? "border-l border-line-emphasis" : ""
              } ${selected ? "bg-surface-inverse" : ""}`}
            >
              <TabContent testimonial={testimonial} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TrustedTabbedPanel() {
  const panelRef = useRef<HTMLDivElement>(null);
  const count = testimonials.length;
  const [active, setActive] = useState(DEFAULT_TESTIMONIAL);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [keyboardDirection, setKeyboardDirection] = useState<CarouselDirection | null>(null);
  const switchTimeoutRef = useRef<number>(undefined);

  const slideVariant: "Left" | "Right" = direction > 0 ? "Right" : "Left";

  // Imperative switch (mirrors ProductShowcase) so the slide direction is
  // explicit — this lets the carousel loop past the ends in the right visual
  // direction rather than snapping backwards on wrap-around.
  const runSwitch = useCallback(
    (index: number, dir: 1 | -1) => {
      if (index === active) return;
      window.clearTimeout(switchTimeoutRef.current);
      setExitingIndex(active);
      setDirection(dir);
      setIsSwitching(true);
      setActive(index);
      switchTimeoutRef.current = window.setTimeout(() => {
        setIsSwitching(false);
        setExitingIndex(null);
      }, PLATFORM_SWITCH_MS);
    },
    [active],
  );

  useEffect(() => () => window.clearTimeout(switchTimeoutRef.current), []);

  const selectTab = useCallback(
    (index: number) => runSwitch(index, index > active ? 1 : -1),
    [active, runSwitch],
  );

  // Loops around the ends like the insurance products carousel.
  const step = useCallback(
    (dir: 1 | -1) => runSwitch((active + dir + count) % count, dir),
    [active, count, runSwitch],
  );

  useCarouselKeyboard({
    ref: panelRef,
    orientation: () =>
      window.matchMedia(TABLET_MEDIA).matches ? "vertical" : "horizontal",
    onPrev: () => step(-1),
    onNext: () => step(1),
    onDirectionActiveChange: setKeyboardDirection,
  });

  return (
    <div {...domSrc("TrustedTabbedPanel")}
      ref={panelRef}
      className="flex w-full flex-col overflow-hidden rounded-md border border-line-emphasis tablet:flex-row"
    >
      {/* Desktop / tablet: vertical sidebar with the sliding indicator. */}
      <AnimatedTabList
        items={testimonials.map((testimonial) => ({
          key: testimonial.id,
          ariaLabel: `${testimonial.company} testimonial`,
          content: <TabContent testimonial={testimonial} />,
        }))}
        active={active}
        onActiveChange={selectTab}
        ariaLabel="Customer testimonials"
        orientation="vertical"
        className="hidden bg-surface-inverse-raised tablet:flex tablet:w-[220px] tablet:shrink-0 tablet:flex-col tablet:border-r tablet:border-line-emphasis"
        tabClassName="flex-1 overflow-hidden px-24"
        tabClassNameFor={(index) => sidebarBorderClass(index)}
      />

      <div className="relative min-h-[420px] w-full flex-1 overflow-hidden tablet:min-h-[520px]">
        {testimonials.map((testimonial, index) => {
          const isActive = index === active;
          const isExiting = index === exitingIndex && isSwitching;
          const isVisible = isActive || isExiting;

          const layerAnimation = isExiting
            ? `productBgExit${slideVariant} ${PLATFORM_SWITCH_MS}ms ${PLATFORM_SWITCH_EASE} both`
            : isSwitching && isActive
              ? `productBgEnter${slideVariant} ${PLATFORM_SWITCH_MS}ms ${PLATFORM_SWITCH_EASE} both`
              : undefined;

          return (
            <div
              key={testimonial.id}
              className="product-showcase-bg-layer absolute inset-0"
              style={{
                visibility: isVisible ? "visible" : "hidden",
                zIndex: isActive ? 2 : isExiting ? 1 : 0,
                animation: layerAnimation,
              }}
              aria-hidden={!isActive}
            >
              <TestimonialPanel testimonial={testimonial} />
            </div>
          );
        })}

        {/* Arrows: left/right on mobile (horizontal strip), up/down on desktop
            (vertical sidebar). Kept at the panel's bottom-right in both. */}
        <div className="absolute bottom-24 right-24 z-20 flex gap-stack tablet:bottom-32 tablet:right-32 tablet:flex-col">
          <ControlButton
            label="Previous testimonial"
            onClick={() => step(-1)}
            active={keyboardDirection === "prev"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {/* left on mobile, up on desktop */}
              <path className="tablet:hidden" d="M10 3 5 8l5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path className="hidden tablet:inline" d="M3 10l5-5 5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ControlButton>
          <ControlButton
            label="Next testimonial"
            onClick={() => step(1)}
            active={keyboardDirection === "next"}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {/* right on mobile, down on desktop */}
              <path className="tablet:hidden" d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path className="hidden tablet:inline" d="M3 6l5 5 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ControlButton>
        </div>
      </div>

      {/* Mobile: draggable logo strip below the panel. */}
      <MobileTabStrip active={active} onSelect={selectTab} />
    </div>
  );
}
