"use client";

import { pillars } from "@/data/home-content";
import AnimatedTabList from "./AnimatedTabList";

/** Hairline dividers between the four horizontal tabs (2-col mobile → 4-col
 *  desktop) — borders instead of grid gap so hover state stays continuous. */
function tabBorderClass(index: number) {
  const mobileCol = index % 2 === 0 ? "border-r border-line-emphasis" : "";
  const mobileRow = index < 2 ? "border-b border-line-emphasis" : "";

  return [
    mobileCol,
    mobileRow,
    index > 0 ? "tablet:border-l tablet:border-line-emphasis" : "",
    "tablet:border-b-0 tablet:border-r-0",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function PlatformTabList({
  active,
  onActiveChange,
}: {
  active: number;
  onActiveChange: (index: number) => void;
}) {
  return (
    <div className="relative w-full">
      <AnimatedTabList
        items={pillars.map((pillar) => ({
          key: pillar.id,
          content: pillar.eyebrow,
          ariaLabel: pillar.eyebrow,
        }))}
        active={active}
        onActiveChange={onActiveChange}
        ariaLabel="Platform capabilities"
        orientation="horizontal"
        className="relative z-10 grid w-full grid-cols-2 rounded-md border border-line-emphasis bg-surface-inverse-raised tablet:grid-cols-4"
        tabClassName="type-label h-14 px-24 text-center"
        tabClassNameFor={(index, selected) =>
          `${tabBorderClass(index)} ${
            selected ? "text-on-inverse" : "text-on-inverse-muted hover:text-on-inverse"
          }`
        }
      />
    </div>
  );
}
