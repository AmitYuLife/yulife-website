"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RollingStatNumber } from "@/components/stats/RollingStatNumber";
import type { StatColumnProps } from "@/components/stats/types";

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
