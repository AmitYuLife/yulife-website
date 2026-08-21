"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";
import type { StatColumnProps } from "@/components/stats/types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DIGIT_CYCLES = 2;

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

const START_DIGIT = 1;

function digitTargetY(target: number) {
  return -(DIGIT_CYCLES * 10 + target);
}

function RollingStatNumber({
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

function StatLabel({
  label,
  footnote,
  sourcesHref,
}: {
  label: string;
  footnote?: number;
  sourcesHref: string;
}) {
  return (
    <p className="type-body-sm w-full text-center font-bold text-on-inverse">
      <span className="whitespace-pre-line">{label.trimEnd()}</span>
      {footnote != null && (
        <>
          {"\u00a0"}
          <sub className="text-[0.645em] not-italic">
            <a
              href={sourcesHref}
              className="transition-opacity hover:opacity-80"
              onClick={(e) => e.stopPropagation()}
            >
              {footnote}
            </a>
          </sub>
        </>
      )}
    </p>
  );
}

function prefersHoverInteraction() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function StatColumn({
  value,
  label,
  note,
  source,
  footnote,
  sourcesHref = "#sources",
  noteClassName = "type-body-sm",
  className = "",
  index = 0,
}: StatColumnProps) {
  const [columnEl, setColumnEl] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  const handlePointerEnter = () => {
    if (prefersHoverInteraction()) setActive(true);
  };

  const handlePointerLeave = () => {
    if (prefersHoverInteraction()) setActive(false);
  };

  const handleClick = () => {
    if (!prefersHoverInteraction()) setActive((current) => !current);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setActive((current) => !current);
    }
  };

  // Both states are stacked in one grid cell, so the card sizes to the taller
  // of them and stays equal-height across its row — no fixed height. Each state
  // stretches to fill the card, so hover slides the number up and out of view
  // while the note slides up into it (a full-height reveal, not just a fade);
  // overflow-hidden on the card clips the travel.
  return (
    <div
      ref={setColumnEl}
      className={cn(
        "group relative grid cursor-default overflow-hidden rounded-md border border-line-emphasis text-center transition-colors duration-300 ease-out",
        active ? "bg-surface-inverse" : "bg-surface-inverse-raised",
        className,
      )}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-expanded={active}
      aria-label={`${value} ${label}`}
    >
      {/* Default state — number + label */}
      <div
        aria-hidden={active}
        className={cn(
          "col-start-1 row-start-1 flex flex-col items-center justify-center gap-8 p-32 text-center transition-[opacity,translate] ease-out [transition-duration:180ms,300ms] tablet:p-40 motion-reduce:transition-none",
          active ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100",
        )}
      >
        <span className="flex h-[72px] flex-col justify-center">
          <RollingStatNumber value={value} triggerEl={columnEl} index={index} />
        </span>
        <StatLabel label={label} footnote={footnote} sourcesHref={sourcesHref} />
      </div>

      {/* Revealed state — note (+ source) */}
      <div
        aria-hidden={!active}
        className={cn(
          "col-start-1 row-start-1 flex flex-col items-center justify-center gap-inline p-32 text-center transition-[opacity,translate] ease-out [transition-duration:180ms,300ms] tablet:p-40 motion-reduce:transition-none",
          active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <p className={cn(noteClassName, "text-balance leading-snug text-on-inverse")}>{note}</p>
        {source && <p className="type-caption text-balance text-on-inverse/60">{source}</p>}
      </div>
    </div>
  );
}
