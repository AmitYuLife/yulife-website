"use client";

import { cn } from "@/lib/utils";
import StatColumn from "@/components/stats/StatColumn";
import type { StatsColumnsProps } from "@/components/stats/types";

export default function StatsColumns({
  stats,
  sourcesHref = "#sources",
  showHorizontalRule = true,
  className,
}: StatsColumnsProps) {
  return (
    <div className={cn("relative w-full max-w-[1216px]", className)}>
      {showHorizontalRule && (
        <div
          className="pointer-events-none absolute top-1/2 z-0 hidden h-px -translate-y-1/2 bg-line-emphasis tablet:block"
          style={{
            left: "50%",
            width: "100vw",
            marginLeft: "-50vw",
          }}
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 grid overflow-clip rounded-md border border-line-emphasis bg-surface-inverse-raised tablet:h-[272px] tablet:grid-cols-3">
        {stats.map((stat, index) => (
          <StatColumn
            key={stat.id ?? stat.label}
            value={stat.value}
            label={stat.label}
            note={stat.note}
            footnote={stat.footnote}
            sourcesHref={sourcesHref}
            index={index}
            className={
              index > 0
                ? "border-t border-line-emphasis tablet:border-t-0 tablet:border-l"
                : ""
            }
          />
        ))}
      </div>
    </div>
  );
}
