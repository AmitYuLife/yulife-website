"use client";

import { cn } from "@/lib/utils";
import StatColumn from "@/components/ui/StatColumn";
import type { StatBlockProps } from "@/components/ui/statsTypes";
import { domSrc } from "@/lib/domSrc";

export default function StatBlock({
  stats,
  sourcesHref = "#sources",
  noteClassName,
  className,
}: StatBlockProps) {
  // Up to three stats sit in a single row (the homepage 3-up). Four or more
  // wrap at a maximum of three per row, each row centred, so the last partial
  // row (e.g. the 4th and 5th of five) is centred rather than left-aligned
  // (Figma 2424:4932). Columns keep a consistent 1/3 width across rows.
  const wide = stats.length > 3;

  return (
    <div {...domSrc("StatBlock")} className={cn("relative w-full max-w-[1216px]", className)}>
      <div
        className={cn(
          "gap-24 tablet:gap-40",
          wide
            ? "flex flex-wrap items-stretch justify-center"
            : "grid tablet:grid-cols-3",
        )}
      >
        {stats.map((stat, index) => (
          <StatColumn
            key={stat.id ?? stat.label}
            value={stat.value}
            label={stat.label}
            note={stat.note}
            source={stat.source}
            footnote={stat.footnote}
            sourcesHref={sourcesHref}
            noteClassName={noteClassName}
            index={index}
            className={
              wide
                ? "w-full tablet:w-[calc((100%-40px)/2)] desktop:w-[calc((100%-80px)/3)]"
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
