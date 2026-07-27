"use client";

import { useEffect, useRef, type RefObject } from "react";

export type CarouselOrientation = "horizontal" | "vertical";

type OrientationInput = CarouselOrientation | (() => CarouselOrientation);

type CarouselRegistration = {
  id: symbol;
  ratio: number;
  getOrientation: () => CarouselOrientation;
  onPrev: () => void;
  onNext: () => void;
};

const carousels = new Map<symbol, CarouselRegistration>();
let listenerAttached = false;

const INTERSECTION_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

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

function handleKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  if (isEditableTarget(event.target)) return;

  const active = pickActiveCarousel();
  if (!active) return;

  const orientation = active.getOrientation();
  let handled = false;

  if (orientation === "horizontal") {
    if (event.key === "ArrowLeft") {
      active.onPrev();
      handled = true;
    } else if (event.key === "ArrowRight") {
      active.onNext();
      handled = true;
    }
  } else if (event.key === "ArrowUp") {
    active.onPrev();
    handled = true;
  } else if (event.key === "ArrowDown") {
    active.onNext();
    handled = true;
  }

  if (handled) event.preventDefault();
}

function attachListener() {
  if (listenerAttached) return;
  window.addEventListener("keydown", handleKeyDown);
  listenerAttached = true;
}

function detachListenerIfIdle() {
  if (carousels.size > 0 || !listenerAttached) return;
  window.removeEventListener("keydown", handleKeyDown);
  listenerAttached = false;
}

/**
 * Enables arrow-key navigation for a carousel while it is visible in the
 * viewport. When multiple carousels overlap in view, the most visible one
 * receives keyboard input.
 */
export function useCarouselKeyboard({
  ref,
  orientation,
  onPrev,
  onNext,
  enabled = true,
}: {
  ref: RefObject<Element | null>;
  orientation: OrientationInput;
  onPrev: () => void;
  onNext: () => void;
  enabled?: boolean;
}) {
  const idRef = useRef(Symbol("carousel"));
  const orientationRef = useRef(orientation);
  const onPrevRef = useRef(onPrev);
  const onNextRef = useRef(onNext);

  orientationRef.current = orientation;
  onPrevRef.current = onPrev;
  onNextRef.current = onNext;

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
      detachListenerIfIdle();
    };
  }, [enabled, ref]);
}
