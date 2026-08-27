"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { RollingStatNumber } from "@/components/ui/RollingStatNumber";
import { domSrc } from "@/lib/domSrc";

export type StatCountCardItem = {
  /** Display value, e.g. "1m+", "25%", "80%". Leading digits roll up. */
  value: string;
  /** Bold label beneath the number. Use `\n` for intentional line breaks. */
  label: string;
  /** Stable key when rendering a list. */
  id?: string;
};

export type StatCountCardsProps = {
  stats: readonly StatCountCardItem[];
  className?: string;
};

/**
 * A single bordered stat card: an odometer number over a bold label. Each card
 * is its own scroll trigger, so its digits roll up as it enters the viewport;
 * `index` staggers the row so the four cards count in sequence.
 */
function StatCountCard({
  value,
  label,
  index,
}: {
  value: string;
  label: string;
  index: number;
}) {
  const [cardEl, setCardEl] = useState<HTMLElement | null>(null);

  return (
    <div
      ref={setCardEl}
      className="flex h-full flex-col items-center justify-center gap-inline rounded-md border border-line-emphasis bg-surface-inverse-raised p-32 text-center tablet:p-40"
    >
      <span className="flex h-[72px] flex-col justify-center">
        <RollingStatNumber value={value} triggerEl={cardEl} index={index} />
      </span>
      <p className="type-body-sm whitespace-pre-line font-bold text-on-inverse">
        {label.trimEnd()}
      </p>
    </div>
  );
}

/**
 * Businesses stats row (Figma node 2495:7526) — a row of bordered cards, each a
 * big odometer number that counts up on scroll over a bold label.
 *
 * Distinct from `StatCardFan` (the flippable "fan of playing cards") and from
 * the reveal-based `StatColumn`: these cards are static number + label, sharing
 * only the `RollingStatNumber` odometer primitive. Four across on desktop,
 * two-up on tablet, stacked on mobile.
 */
export default function StatCountCards({ stats, className }: StatCountCardsProps) {
  return (
    <div
      {...domSrc("StatCountCards")}
      className={cn(
        "grid w-full max-w-[1216px] grid-cols-1 gap-flow tablet:grid-cols-2 desktop:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <StatCountCard
          key={stat.id ?? stat.label}
          value={stat.value}
          label={stat.label}
          index={index}
        />
      ))}
    </div>
  );
}
