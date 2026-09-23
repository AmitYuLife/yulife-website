"use client";

import { pillars } from "@/data/home-content";
import AnimatedTabList from "./AnimatedTabList";

/**
 * The four platform tabs as separate outlined boxes (Figma 2912:57731): the
 * selected tab takes the darker surface and white label, the rest sit on the
 * raised surface with the muted label. Each tab paints its own state, so the
 * sliding indicator is hidden.
 */
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
        className="relative z-10 grid w-full grid-cols-2 gap-stack tablet:grid-cols-4"
        tabClassName="type-heading-h5 rounded-sm border border-line-emphasis px-16 py-16 text-center tablet:px-40"
        tabClassNameFor={(_, selected) =>
          selected
            ? "bg-surface-inverse text-on-inverse"
            : "bg-surface-inverse-raised text-on-inverse-muted hover:text-on-inverse"
        }
        indicatorClassName="hidden"
      />
    </div>
  );
}
