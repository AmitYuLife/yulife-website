"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products, type ProductCardBackground } from "@/data/home-content";
import { useCarouselKeyboard, type CarouselDirection } from "@/hooks/useCarouselKeyboard";
import { useReveal } from "@/components/hooks/useReveal";
import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";

const SWITCH_MS = 300;
const SWITCH_EASE = "cubic-bezier(0.33, 0, 0.2, 1)";

const CARD_CLASS =
  "relative flex h-[440px] w-[280px] shrink-0 flex-col items-start justify-start overflow-hidden rounded-md p-32 tablet:h-[520px] tablet:w-[380px] desktop:h-[656px] desktop:w-[592px] desktop:p-80";

const CARRIER_LOGOS = {
  bupa: { src: assetPath("/home/logo-bupa.svg"), width: 153, height: 40 },
  metlife: { src: assetPath("/home/logo-metlife.svg"), width: 186, height: 40 },
} as const;

type ProductCard = (typeof products.cards)[number];

function ControlButton({
  label,
  disabled,
  active,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`grid size-32 place-items-center rounded-xl border border-line-inverse bg-line-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35 ${active ? "opacity-90" : ""}`}
    >
      {children}
    </button>
  );
}

function cardBackgroundImageStyle(background: ProductCardBackground) {
  const base = {
    // maxWidth inline: the max-w-none utility resolves to 0px because the
    // theme defines a --spacing-none token that shadows it.
    maxWidth: "none" as const,
    opacity: 0.16,
  };

  if (background.fit === "cover") {
    return {
      ...base,
      width: "100%",
      height: "100%",
      left: "0",
      top: "0",
      objectFit: "cover" as const,
    };
  }

  return {
    ...base,
    width: background.width,
    height: background.height,
    left: background.left,
    top: background.top,
  };
}

function CardBackground({
  background,
  slideVariant,
  animationName,
}: {
  background: ProductCardBackground;
  slideVariant: "Left" | "Right";
  animationName?: string;
}) {
  return (
    <div
      className="product-showcase-bg-layer absolute inset-0 overflow-hidden rounded-[inherit]"
      style={
        animationName
          ? {
              animation: `${animationName}${slideVariant} ${SWITCH_MS}ms ${SWITCH_EASE} both`,
            }
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt=""
        src={background.src}
        className="pointer-events-none absolute select-none"
        style={cardBackgroundImageStyle(background)}
        draggable={false}
      />
    </div>
  );
}

function ProductCardTitle({ card }: { card: ProductCard }) {
  const rest = card.titleRest.trimStart();

  if ("titleBreakBeforeRest" in card && card.titleBreakBeforeRest) {
    return (
      <h3 className="type-heading-card text-on-inverse">
        <span className="block">
          <em className="italic">{card.titleEmphasis}</em>
        </span>
        {rest ? <span className="block">{rest}</span> : null}
      </h3>
    );
  }

  return (
    <h3 className="type-heading-card text-on-inverse">
      <em className="italic">{card.titleEmphasis}</em>
      {card.titleRest}
    </h3>
  );
}

function ProductCard({
  card,
  index,
  isActive,
  isExiting,
  isSwitching,
  slideVariant,
  onEnter,
}: {
  card: ProductCard;
  index: number;
  isActive: boolean;
  isExiting: boolean;
  isSwitching: boolean;
  slideVariant: "Left" | "Right";
  onEnter: (index: number) => void;
}) {
  const logo = CARRIER_LOGOS[card.carrier];

  return (
    <div className="relative shrink-0" data-card-index={index}>
      <div className="relative" data-reveal-on="carousel">
        <Link
          href={card.href}
          data-card
          onMouseEnter={() => onEnter(index)}
          onFocus={() => onEnter(index)}
          className={[
            CARD_CLASS,
            "group block border border-line-emphasis transition-colors duration-200",
            isActive ? "" : "bg-surface-inverse-raised",
          ].join(" ")}
        >
          {(isActive || isExiting) && (
            <div
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
              aria-hidden="true"
            >
              {isExiting ? (
                <CardBackground
                  background={card.background}
                  slideVariant={slideVariant}
                  animationName="productBgExit"
                />
              ) : (
                <CardBackground
                  background={card.background}
                  slideVariant={slideVariant}
                  animationName={isSwitching ? "productBgEnter" : undefined}
                />
              )}
            </div>
          )}

          <div className="relative z-10 flex flex-col gap-stack">
            <Image
              src={logo.src}
              alt=""
              width={logo.width}
              height={logo.height}
              className="h-40 w-auto object-contain object-left"
              draggable={false}
            />
            <ProductCardTitle card={card} />
            <p className="type-body-lg text-on-inverse">{card.description}</p>
          </div>
        </Link>

        {/* Gradient stroke overlay — an absolute sibling of the card so it isn't
            clipped by the card's overflow:hidden and doesn't change layout on
            activation (no hover shift). */}
        {isActive && (
          <span className="product-showcase-ring-draw" aria-hidden="true">
            <span className="product-showcase-ring" />
          </span>
        )}
      </div>
    </div>
  );
}

export default function ProductShowcase({
  surface = "inverse-raised",
}: {
  /**
   * Section background. Defaults to "inverse-raised" (the homepage). Pages that
   * reuse this section elsewhere in a section stack pass whichever surface keeps
   * backgrounds alternating with their neighbours — the cards' own colour is
   * fixed and unaffected either way.
   */
  surface?: "inverse" | "inverse-raised";
} = {}) {
  const scope = useReveal<HTMLElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const switchTimeoutRef = useRef<number>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [keyboardDirection, setKeyboardDirection] = useState<CarouselDirection | null>(null);

  const slideVariant = slideDirection > 0 ? "Right" : "Left";
  const lastCardIndex = products.cards.length - 1;

  // Native horizontal scroll on .product-showcase-track (see globals.css)
  // does the actual scrolling — touch swipe, trackpad, wheel, and edge
  // elasticity all come from the browser for free, and there is no snap:
  // it rests wherever the gesture ends. This only drives it explicitly for
  // Next/Prev and keyboard step navigation.
  const scrollToIndex = useCallback((index: number) => {
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;

    const card = row.querySelector<HTMLElement>(`[data-card-index="${index}"]`);
    if (!card) return;

    // card.offsetLeft is relative to the track's border edge, so it already
    // includes the track's own left inset padding. scrollLeft's coordinate
    // space doesn't need that added back in — scrollLeft: 0 already shows
    // the inset as blank space before the content. Using offsetLeft directly
    // overshoots every target by exactly the inset amount.
    const inset = parseFloat(getComputedStyle(track).paddingLeft) || 0;
    track.scrollTo({ left: card.offsetLeft - inset, behavior: "smooth" });
  }, []);

  const runSwitch = useCallback(
    (index: number, direction: 1 | -1) => {
      window.clearTimeout(switchTimeoutRef.current);
      setPrevIndex(activeIndex);
      setSlideDirection(direction);
      setIsSwitching(true);
      setActiveIndex(index);

      switchTimeoutRef.current = window.setTimeout(() => {
        setIsSwitching(false);
        setPrevIndex(null);
      }, SWITCH_MS);
    },
    [activeIndex],
  );

  useEffect(() => () => window.clearTimeout(switchTimeoutRef.current), []);

  const activateIndex = useCallback(
    (index: number) => {
      if (index === activeIndex) return;
      runSwitch(index, index > activeIndex ? 1 : -1);
    },
    [activeIndex, runSwitch],
  );

  const goToIndex = useCallback(
    (index: number) => {
      const cardCount = lastCardIndex + 1;
      const wrapped = ((index % cardCount) + cardCount) % cardCount;

      if (wrapped !== activeIndex) {
        let direction: 1 | -1;
        if (wrapped === 0 && activeIndex === lastCardIndex) {
          direction = 1;
        } else if (wrapped === lastCardIndex && activeIndex === 0) {
          direction = -1;
        } else {
          direction = wrapped > activeIndex ? 1 : -1;
        }
        runSwitch(wrapped, direction);
      }

      scrollToIndex(wrapped);
    },
    [activeIndex, lastCardIndex, runSwitch, scrollToIndex],
  );

  // Steps from activeIndex (React state, always in sync immediately on every
  // click) rather than reading live scrollLeft — a still-in-flight smooth
  // scroll from the previous click would otherwise read a mid-animation
  // position and step from the wrong card. goToIndex already wraps.
  const scrollByStep = useCallback(
    (dir: 1 | -1) => {
      goToIndex(activeIndex + dir);
    },
    [activeIndex, goToIndex],
  );

  useCarouselKeyboard({
    ref: scope,
    orientation: "horizontal",
    onPrev: () => scrollByStep(-1),
    onNext: () => scrollByStep(1),
    onDirectionActiveChange: setKeyboardDirection,
  });

  return (
    <section {...domSrc("ProductShowcase")}
      ref={scope}
      className={`relative overflow-x-clip overflow-y-visible border-b border-line-emphasis ${
        surface === "inverse" ? "bg-surface-inverse" : "bg-surface-inverse-raised"
      }`}
      aria-labelledby="protect-heading"
    >
      <div className="page-container pt-[var(--layout-section-y-lg)]">
        <div className="grid grid-cols-1 items-start gap-flow desktop:grid-cols-[594px_minmax(0,1fr)] desktop:items-end desktop:gap-block-gap">
          <div className="flex min-w-0 flex-col gap-related">
            <p
              data-reveal
              className="type-eyebrow uppercase text-accent-purple"
            >
              {products.eyebrow}
            </p>
            <h2
              id="protect-heading"
              data-reveal
              className="type-heading-h2 text-on-inverse"
            >
              {(() => {
                const at = products.heading.indexOf(products.headingAccent);
                if (at === -1) return products.heading;
                return (
                  <>
                    {products.heading.slice(0, at)}
                    <em className="italic">{products.headingAccent}</em>
                    {products.heading.slice(at + products.headingAccent.length)}
                  </>
                );
              })()}
            </h2>
          </div>
          <p
            data-reveal
            className="type-body-lg min-w-0 text-on-inverse desktop:pb-[0.06em]"
          >
            {products.intro}
          </p>
        </div>
      </div>

      {/* Full-bleed scrollport: first card aligns with the page-container left
          edge (via --carousel-inset padding), the rest bleed to the viewport.
          Native horizontal scroll (touch, trackpad, wheel) — no custom drag
          or snap logic; the browser handles elasticity and momentum. */}
      <div
        className="product-showcase-shell relative mt-section-gap overflow-visible"
        data-reveal-anchor="carousel"
      >
        <div
          ref={trackRef}
          className="product-showcase-track relative"
        >
          <div ref={rowRef} className="product-showcase-row">
            {products.cards.map((card, index) => (
              <ProductCard
                key={card.href}
                card={card}
                index={index}
                isActive={activeIndex === index}
                isExiting={isSwitching && prevIndex === index && activeIndex !== index}
                isSwitching={isSwitching}
                slideVariant={slideVariant}
                onEnter={activateIndex}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="page-container pb-[var(--layout-section-y-lg)] pt-section-gap">
        <div data-reveal-on="carousel" className="flex justify-end gap-stack">
          <ControlButton
            label="Previous product"
            onClick={() => scrollByStep(-1)}
            active={keyboardDirection === "prev"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3 5 8l5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-on-inverse"
              />
            </svg>
          </ControlButton>
          <ControlButton
            label="Next product"
            onClick={() => scrollByStep(1)}
            active={keyboardDirection === "next"}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-on-inverse"
              />
            </svg>
          </ControlButton>
        </div>
      </div>
    </section>
  );
}
