"use client";

import { useEffect, useRef, type RefObject } from "react";

export type CarouselOrientation = "horizontal" | "vertical";
export type CarouselDirection = "prev" | "next";

type OrientationInput = CarouselOrientation | (() => CarouselOrientation);

type CarouselRegistration = {
  id: symbol;
  ratio: number;
  getOrientation: () => CarouselOrientation;
  onPrev: () => void;
  onNext: () => void;
  onDirectionActiveChange?: (direction: CarouselDirection | null) => void;
};

const carousels = new Map<symbol, CarouselRegistration>();
let listenerAttached = false;
/** The carousel + key currently driving a held-down arrow press, so keyup/blur can clear its hover-equivalent state. */
let heldCarouselId: symbol | null = null;
let heldKey: string | null = null;

const INTERSECTION_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);
const ARROW_KEYS = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]);

function resolveOrientation(orientation: OrientationInput): CarouselOrientation {
  return typeof orientation === "function" ? orientation() : orientation;
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function pickActiveCarousel(): CarouselRegistration | null {
  let best: CarouselRegistration | null = null;

  for (const reg of carousels.values()) {
    if (reg.ratio <= 0) continue;
    if (!best || reg.ratio > best.ratio) best = reg;
  }

  return best;
}

function directionForKey(
  orientation: CarouselOrientation,
  key: string,
): CarouselDirection | null {
  if (orientation === "horizontal") {
    if (key === "ArrowLeft") return "prev";
    if (key === "ArrowRight") return "next";
    return null;
  }
  if (key === "ArrowUp") return "prev";
  if (key === "ArrowDown") return "next";
  return null;
}

function clearHeld() {
  if (heldCarouselId == null) return;
  carousels.get(heldCarouselId)?.onDirectionActiveChange?.(null);
  heldCarouselId = null;
  heldKey = null;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (isEditableTarget(event.target)) return;
  if (!ARROW_KEYS.has(event.key)) return;

  const active = pickActiveCarousel();
  if (!active) return;

  const direction = directionForKey(active.getOrientation(), event.key);
  if (!direction) return;

  event.preventDefault();
  if (direction === "prev") active.onPrev();
  else active.onNext();

  active.onDirectionActiveChange?.(direction);
  heldCarouselId = active.id;
  heldKey = event.key;
}

function handleKeyUp(event: KeyboardEvent) {
  if (event.key !== heldKey) return;
  clearHeld();
}

function attachListener() {
  if (listenerAttached) return;
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("blur", clearHeld);
  listenerAttached = true;
}

function detachListenerIfIdle() {
  if (carousels.size > 0 || !listenerAttached) return;
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
  window.removeEventListener("blur", clearHeld);
  listenerAttached = false;
}

/**
 * Enables arrow-key navigation for a carousel while it is visible in the
 * viewport. When multiple carousels overlap in view, the most visible one
 * receives keyboard input. `onDirectionActiveChange` fires "prev"/"next" for
 * as long as the matching arrow key is held, then `null` on release — mirrors
 * a mouse hover so the corresponding control button can show its hover state.
 */
export function useCarouselKeyboard({
  ref,
  orientation,
  onPrev,
  onNext,
  onDirectionActiveChange,
  enabled = true,
}: {
  ref: RefObject<Element | null>;
  orientation: OrientationInput;
  onPrev: () => void;
  onNext: () => void;
  onDirectionActiveChange?: (direction: CarouselDirection | null) => void;
  enabled?: boolean;
}) {
  const idRef = useRef(Symbol("carousel"));
  const orientationRef = useRef(orientation);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);
  const onDirectionActiveChangeRef = useRef(onDirectionActiveChange);

  orientationRef.current = orientation;
  onPrevRef.current = onPrev;
  onNextRef.current = onNext;
  onDirectionActiveChangeRef.current = onDirectionActiveChange;

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    const id = idRef.current;
    const registration: CarouselRegistration = {
      id,
      ratio: 0,
      getOrientation: () => resolveOrientation(orientationRef.current),
      onPrev: () => onPrevRef.current(),
      onNext: () => onNextRef.current(),
      onDirectionActiveChange: (direction) => onDirectionActiveChangeRef.current?.(direction),
    };

    carousels.set(id, registration);
    attachListener();

    const observer = new IntersectionObserver(
      ([entry]) => {
        registration.ratio = entry?.isIntersecting ? entry.intersectionRatio : 0;
      },
      { threshold: INTERSECTION_THRESHOLDS },
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      carousels.delete(id);
      if (heldCarouselId === id) {
        heldCarouselId = null;
        heldKey = null;
      }
      detachListenerIfIdle();
    };
  }, [enabled, ref]);
}
