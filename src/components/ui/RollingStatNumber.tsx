"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Shared odometer number: each digit is a vertical strip of 0–9 that rolls up
// to its target on scroll-in, with rows fading as they leave the viewport for
// the classic "counting" blur. Used by the homepage/product `StatColumn`
// (reveal cards) and the Businesses `StatCountCards` (static cards) so both
// count identically. Sizing lives here on purpose — every odometer on the site
// shares the 56 → 64 → 80 scale.

const DIGIT_CYCLES = 2;
const START_DIGIT = 1;

function parseStatValue(value: string) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const numStr = match ? match[1] : value;
  return {
    digits: numStr.split("").map((char) => Number(char)),
    suffix: match ? match[2] : "",
  };
}

function buildDigitStrip() {
  const strip: number[] = [];
  for (let cycle = 0; cycle <= DIGIT_CYCLES; cycle += 1) {
    for (let digit = 0; digit <= 9; digit += 1) {
      strip.push(digit);
    }
  }
  return strip;
}

function setDigitRowOpacities(
  viewport: HTMLElement,
  track: HTMLElement,
  visibleIndex?: number,
) {
  const rows = gsap.utils.toArray<HTMLElement>("[data-digit-row]", track);
  if (visibleIndex !== undefined) {
    rows.forEach((row, index) => {
      row.style.opacity = index === visibleIndex ? "1" : "0";
    });
    return;
  }

  const viewportHeight = viewport.offsetHeight;
  const fadeDistance = viewportHeight * 0.55;
  const vTop = viewport.getBoundingClientRect().top;

  rows.forEach((row) => {
    const rowTop = row.getBoundingClientRect().top - vTop;
    const rowBottom = rowTop + row.offsetHeight;

    let opacity = 1;
    if (rowTop < 0) {
      opacity = Math.max(0, 1 + rowTop / fadeDistance);
    }
    if (rowBottom > viewportHeight) {
      opacity = Math.min(
        opacity,
        Math.max(0, 1 - (rowBottom - viewportHeight) / fadeDistance),
      );
    }

    row.style.opacity = String(opacity);
  });
}

function syncAllDigitOpacities(
  viewports: HTMLElement[],
  tracks: HTMLElement[],
  visibleIndices?: number[],
) {
  tracks.forEach((track, index) => {
    setDigitRowOpacities(
      viewports[index],
      track,
      visibleIndices?.[index],
    );
  });
}

function digitTargetY(target: number) {
  return -(DIGIT_CYCLES * 10 + target);
}

export function RollingStatNumber({
  value,
  triggerEl,
  index = 0,
}: {
  value: string;
  triggerEl: HTMLElement | null;
  index?: number;
}) {
  const { digits, suffix } = parseStatValue(value);
  const containerRef = useRef<HTMLSpanElement>(null);
  const strip = buildDigitStrip();
  const statDelay = index * 0.1;

  useGSAP(
    () => {
      const container = containerRef.current;
      if (!container || !triggerEl) return;

      const tracks = gsap.utils.toArray<HTMLElement>("[data-digit-track]", container);
      const viewports = gsap.utils.toArray<HTMLElement>("[data-digit-viewport]", container);
      if (!tracks.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        tracks.forEach((track, digitIndex) => {
          gsap.set(track, { y: `-${START_DIGIT}em`, force3D: true });
          setDigitRowOpacities(viewports[digitIndex], track, START_DIGIT);
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: triggerEl,
            start: "top 72%",
            once: true,
            onEnter: () => {
              container.dataset.animating = "true";
            },
          },
          onUpdate: () => {
            syncAllDigitOpacities(viewports, tracks);
          },
          onComplete: () => {
            container.dataset.animating = "false";
            container.dataset.complete = "true";
            syncAllDigitOpacities(
              viewports,
              tracks,
              digits.map((digit) => DIGIT_CYCLES * 10 + digit),
            );
          },
        });

        tracks.forEach((track, digitIndex) => {
          timeline.to(
            track,
            {
              y: `${digitTargetY(digits[digitIndex])}em`,
              duration: 1.55 + digitIndex * 0.12,
              ease: "power3.out",
            },
            statDelay + digitIndex * 0.18,
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        tracks.forEach((track, digitIndex) => {
          gsap.set(track, { y: `${digitTargetY(digits[digitIndex])}em`, force3D: true });
          setDigitRowOpacities(
            viewports[digitIndex],
            track,
            DIGIT_CYCLES * 10 + digits[digitIndex],
          );
        });
        container.dataset.complete = "true";
      });

      return () => mm.revert();
    },
    { dependencies: [triggerEl, value, index], scope: containerRef },
  );

  return (
    <span
      ref={containerRef}
      className="rolling-stat-number group type-display-number inline-flex items-baseline leading-none text-on-inverse text-[56px] tablet:text-[64px] desktop:text-[80px]"
      aria-label={value}
    >
      {digits.map((_digit, digitIndex) => {
        const isLeading = digitIndex < digits.length - 1;
        return (
          <span
            key={digitIndex}
            className={`relative inline-block h-[1em] shrink-0 overflow-hidden leading-none ${
              isLeading
                ? "w-0 opacity-0 group-data-[animating=true]:w-[1ch] group-data-[complete=true]:w-[1ch] group-data-[animating=true]:opacity-100 group-data-[complete=true]:opacity-100"
                : "w-[1ch]"
            }`}
          >
            <span
              data-digit-viewport
              className="block h-[1em] w-[1ch] overflow-hidden"
            >
              <span
                data-digit-track
                className="inline-flex flex-col will-change-transform"
                style={{ transform: `translateY(-${START_DIGIT}em)` }}
              >
                {strip.map((num, row) => (
                  <span
                    key={row}
                    data-digit-row
                    className="block h-[1em] leading-[1em] tabular-nums will-change-[opacity]"
                    style={{ opacity: row === START_DIGIT ? 1 : 0 }}
                  >
                    {num}
                  </span>
                ))}
              </span>
            </span>
          </span>
        );
      })}
      {suffix && (
        <span
          className="text-[0.5em] leading-[0.4em]"
          aria-hidden="true"
        >
          {suffix}
        </span>
      )}
    </span>
  );
}

export default RollingStatNumber;
