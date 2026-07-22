"use client";

import { ecosystem } from "@/data/home-content";
import { useReveal } from "@/components/home/useReveal";
import { StatsColumns } from "@/components/stats";

export default function EcosystemStats() {
  const scope = useReveal<HTMLElement>();
  const [before, after] = ecosystem.heading.split("daily life");

  return (
    <section
      ref={scope}
      className="relative isolate overflow-hidden border-t border-line-subtle bg-surface-inverse-raised"
      aria-labelledby="ecosystem-heading"
    >
      <div className="page-container section-y flex flex-col items-center gap-[var(--layout-section-gap-xl)]">
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

        <div
          data-reveal
          className="flex w-full flex-col items-center gap-related text-center"
        >
          <p className="type-eyebrow text-accent-purple">Trusted by world-leading insurers</p>
          <div className="flex flex-wrap items-center justify-center gap-group px-40">
            {ecosystem.insurers.map((insurer) => (
              <img
                key={insurer.name}
                src={insurer.src}
                alt={insurer.name}
                style={{ width: insurer.width, height: insurer.height }}
                className="w-auto object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
