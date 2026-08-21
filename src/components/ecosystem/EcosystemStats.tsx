"use client";

import { ecosystem } from "@/data/home-content";
import { useReveal } from "@/components/home/useReveal";
import { StatsColumns } from "@/components/stats";
import { domSrc } from "@/lib/domSrc";

export default function EcosystemStats() {
  const scope = useReveal<HTMLElement>();
  const [before, after] = ecosystem.heading.split("daily life");

  return (
    <section {...domSrc("EcosystemStats")}
      ref={scope}
      className="relative isolate overflow-hidden border-b border-line-emphasis bg-surface-inverse"
      aria-labelledby="ecosystem-heading"
    >
      <div className="page-container section-y flex flex-col items-center gap-80">
        <div
          data-reveal
          className="mx-auto flex w-full max-w-[1216px] flex-col items-center gap-related text-center"
        >
          <p className="type-eyebrow uppercase tracking-[0.16em] text-accent-purple">
            {ecosystem.eyebrow}
          </p>
          <h2 id="ecosystem-heading" className="type-heading-h2 text-on-inverse">
            {before}
            <em className="italic">daily life</em>
            {after}
          </h2>
        </div>

        <div data-reveal className="w-full flex justify-center">
          <StatsColumns stats={ecosystem.stats} />
        </div>
      </div>
    </section>
  );
}
