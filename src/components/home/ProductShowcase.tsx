"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productCardBackground, products } from "@/data/home-content";
import { useReveal } from "./useReveal";

const SWITCH_MS = 300;
const SWITCH_EASE = "cubic-bezier(0.33, 0, 0.2, 1)";

const CARD_CLASS =
  "relative flex h-[440px] w-[280px] shrink-0 flex-col justify-end overflow-hidden rounded-md p-32 tablet:h-[520px] tablet:w-[380px] desktop:h-[656px] desktop:w-[592px] desktop:p-80";

const CARRIER_LOGOS = {
  bupa: { src: "/home/logo-bupa.svg", width: 153, height: 40 },
  metlife: { src: "/home/logo-metlife.svg", width: 186, height: 40 },
} as const;

type ProductCard = (typeof products.cards)[number];

function ControlButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-32 place-items-center rounded-xl border border-line-inverse bg-line-inverse transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}

function CardBackground({
  slideVariant,
  animationName,
}: {
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
        src={productCardBackground.src}
        className="pointer-events-none absolute select-none"
        style={{
          // maxWidth inline: the max-w-none utility resolves to 0px because the
          // theme defines a --spacing-none token that shadows it.
          maxWidth: "none",
          opacity: 0.16,
          width: productCardBackground.width,
          height: productCardBackground.height,
          left: productCardBackground.left,
          top: productCardBackground.top,
        }}
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
      <Link
        href={card.href}
        data-card
        onMouseEnter={() => onEnter(index)}
        onFocus={() => onEnter(index)}
        className={[
          CARD_CLASS,
          "group block border transition-colors duration-200",
          isActive ? "border-transparent" : "border-line-emphasis",
        ].join(" ")}
      >
        {(isActive || isExiting) && (
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
            aria-hidden="true"
          >
            {isExiting ? (
              <CardBackground slideVariant={slideVariant} animationName="productBgExit" />
            ) : (
              <CardBackground
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
        <span className="product-showcase-ring" aria-hidden="true" />
      )}
    </div>
  );
}

export default function ProductShowcase() {
  const scope = useReveal<HTMLElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const switchTimeoutRef = useRef<number>(undefined);
  const [activeIndex, setActiveIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [slotIndex, setSlotIndex] = useState(0);
  const [isSwitching, setIsSwitching] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);

  const slideVariant = slideDirection > 0 ? "Right" : "Left";
  const lastCardIndex = products.cards.length - 1;

  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startScroll: 0,
    moved: false,
  });

  const trackInset = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;
    return parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
  }, []);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;

      const card = track.querySelector<HTMLElement>(
        `[data-card-index="${index}"]`,
      );
      if (!card) return;

      track.scrollTo({
        left: card.offsetLeft - trackInset(),
        behavior: "smooth",
      });
    },
    [trackInset],
  );

  const nearestIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return 0;

    const cards = track.querySelectorAll<HTMLElement>("[data-card-index]");
    const target = track.scrollLeft + trackInset();
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card) => {
      const index = Number(card.dataset.cardIndex);
      const distance = Math.abs(card.offsetLeft - target);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });
    return closestIndex;
  }, [trackInset]);

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
      if (dragRef.current.dragging) return;
      if (index === activeIndex) return;
      runSwitch(index, index > activeIndex ? 1 : -1);
    },
    [activeIndex, runSwitch],
  );

  const goToIndex = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(lastCardIndex, index));
      if (clamped !== activeIndex) {
        runSwitch(clamped, clamped > activeIndex ? 1 : -1);
      }
      setSlotIndex(clamped);
      scrollToIndex(clamped);
    },
    [activeIndex, lastCardIndex, runSwitch, scrollToIndex],
  );

  const scrollByStep = useCallback(
    (dir: 1 | -1) => goToIndex(slotIndex + dir),
    [goToIndex, slotIndex],
  );

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore secondary buttons; let real clicks through until movement begins.
    if (e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startScroll: track.scrollLeft,
      moved: false,
    };
    track.classList.add("is-dragging");
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;
    const track = trackRef.current;
    if (!track) return;

    const dx = e.clientX - drag.startX;
    if (!drag.moved && Math.abs(dx) > 4) {
      drag.moved = true;
      // Take pointer capture once we know it's a drag, not a click.
      try {
        track.setPointerCapture(e.pointerId);
      } catch {
        /* no active pointer (e.g. synthetic event) — safe to ignore */
      }
    }
    if (drag.moved) {
      track.scrollLeft = drag.startScroll - dx;
    }
  }, []);

  const endDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag.dragging) return;
      const track = trackRef.current;

      drag.dragging = false;
      track?.classList.remove("is-dragging");
      try {
        if (track?.hasPointerCapture(e.pointerId)) {
          track.releasePointerCapture(e.pointerId);
        }
      } catch {
        /* no active pointer — safe to ignore */
      }

      if (drag.moved) {
        goToIndex(nearestIndex());
      }
    },
    [goToIndex, nearestIndex],
  );

  // Cancel the navigation click that follows a drag gesture.
  const onClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.moved = false;
    }
  }, []);

  return (
    <section
      ref={scope}
      className="relative border-b border-line-emphasis bg-surface-inverse"
      aria-labelledby="protect-heading"
    >
      <div className="page-container pt-[var(--layout-section-y-lg)]">
        <div className="grid grid-cols-1 items-start gap-flow xl:grid-cols-[594px_minmax(0,1fr)] xl:items-end xl:gap-block-gap">
          <div className="flex min-w-0 flex-col gap-related">
            <p
              data-reveal
              className="type-eyebrow uppercase text-surface-accent-purple"
            >
              {products.eyebrow}
            </p>
            <h2
              id="protect-heading"
              data-reveal
              className="type-heading-h2 text-on-inverse"
            >
              {products.heading}
            </h2>
          </div>
          <p
            data-reveal
            className="type-body-lg min-w-0 text-on-inverse xl:pb-[0.06em]"
          >
            {products.intro}
          </p>
        </div>
      </div>

      {/* Full-bleed scrollport: first card aligns with the page-container left
          edge (via --carousel-inset padding), the rest bleed to the viewport.
          Drag-to-scroll with snap; wheel/trackpad scrolling is disabled. */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className="product-showcase-track relative mt-section-gap flex gap-32 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
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

      <div className="page-container pb-[var(--layout-section-y-lg)] pt-section-gap">
        <div data-reveal className="flex justify-end gap-stack">
          <ControlButton
            label="Previous product"
            disabled={slotIndex === 0}
            onClick={() => scrollByStep(-1)}
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
            disabled={slotIndex === lastCardIndex}
            onClick={() => scrollByStep(1)}
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
