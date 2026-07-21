"use client";

import { ecosystem } from "@/data/home-content";
import { useReveal } from "@/components/home/useReveal";

function StatNumber({ value }: { value: string }) {
  const match = value.match(/^([\d.]+)(.*)$/);
  const num = match ? match[1] : value;
  const suffix = match ? match[2] : "";
  return (
    <span className="type-display-number" style={{ color: "var(--neutral-white)" }}>
      {num}
      {suffix && <span className="align-super text-[0.5em]">{suffix}</span>}
    </span>
  );
}

export default function EcosystemStats() {
  const scope = useReveal<HTMLElement>();
  const [before, after] = ecosystem.heading.split("daily life");

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t"
      style={{
        backgroundColor: "var(--purple-800)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="ecosystem-heading"
    >
      <div className="page-container section-y">
        <div className="mx-auto max-w-[900px] text-center">
          <p
            data-reveal
            className="type-eyebrow uppercase tracking-[0.16em]"
            style={{ color: "var(--purple-500)" }}
          >
            {ecosystem.eyebrow}
          </p>
          <h2
            id="ecosystem-heading"
            data-reveal
            className="type-heading-h2 mt-16"
            style={{ color: "var(--neutral-white)" }}
          >
            {before}
            <em className="italic">daily life</em>
            {after}
          </h2>
        </div>

        <div
          data-reveal
          className="mx-auto mt-48 grid max-w-[1216px] overflow-hidden rounded-md border tablet:grid-cols-3"
          style={{ borderColor: "color-mix(in srgb, var(--purple-700) 60%, transparent)" }}
        >
          {ecosystem.stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center p-32 text-center tablet:p-40 ${
                i > 0 ? "border-t tablet:border-t-0 tablet:border-l" : ""
              }`}
              style={{ borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)" }}
            >
              <div>
                <StatNumber value={stat.value} />
                {"footnote" in stat && stat.footnote && (
                  <sup className="type-caption ml-4">
                    <a
                      href="#sources"
                      className="transition-colors"
                      style={{ color: "color-mix(in srgb, var(--neutral-white) 45%, transparent)" }}
                    >
                      {stat.footnote === 1 ? "¹" : "²"}
                    </a>
                  </sup>
                )}
              </div>
              <p
                className="type-body-lg mt-8 font-bold"
                style={{ color: "var(--neutral-white)" }}
              >
                {stat.label}
              </p>
              {"note" in stat && stat.note && (
                <p
                  className="type-body-md mt-16 max-w-[320px]"
                  style={{ color: "color-mix(in srgb, var(--neutral-white) 78%, transparent)" }}
                >
                  {stat.note}
                </p>
              )}
            </div>
          ))}
        </div>

        <div data-reveal className="mt-48 text-center">
          <p
            className="type-eyebrow"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 60%, transparent)" }}
          >
            Trusted by world-leading insurers
          </p>
          <div className="mt-24 flex flex-wrap items-center justify-center gap-x-48 gap-y-24">
            {ecosystem.insurers.map((insurer) => (
              <img
                key={insurer.name}
                src={insurer.src}
                alt={insurer.name}
                style={{ width: insurer.width }}
                className="h-40 w-auto object-contain"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
