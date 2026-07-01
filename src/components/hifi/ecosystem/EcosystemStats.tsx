"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ecosystem } from "@/data/home-content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Fire when the stats block reaches the middle of the viewport */
const STATS_SCROLL_START = "center center";

function RollingDigit({ digit, delay }: { digit: number; delay: number }) {
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ height: "1em", width: "0.58em" }}
      aria-hidden="true"
    >
      <div
        className="eco-digit-column flex flex-col"
        data-digit={digit}
        data-delay={delay}
        style={{ height: "1000%" }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex items-center justify-center tabular-nums"
            style={{ height: "10%" }}
          >
            {d}
          </span>
        ))}
      </div>
    </span>
  );
}

function RollingNumber({ value, delay }: { value: string; delay: number }) {
  const chars = value.split("");
  let digitIndex = 0;

  return (
    <span className="inline-flex items-baseline" aria-label={value}>
      {chars.map((char, i) => {
        const d = parseInt(char, 10);
        if (!isNaN(d)) {
          const stagger = delay + digitIndex * 0.08;
          digitIndex++;
          return <RollingDigit key={i} digit={d} delay={stagger} />;
        }
        return (
          <span key={i} className="inline-block">
            {char}
          </span>
        );
      })}
    </span>
  );
}

function EcosystemBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--hero-sage) 0%, transparent 70%)",
          width: "45vw",
          height: "45vw",
          maxWidth: "560px",
          maxHeight: "560px",
          top: "-25%",
          right: "-10%",
          opacity: 0.07,
        }}
      />
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--hero-indigo) 0%, transparent 70%)",
          width: "40vw",
          height: "40vw",
          maxWidth: "500px",
          maxHeight: "500px",
          bottom: "-20%",
          left: "-8%",
          opacity: 0.06,
        }}
      />
    </div>
  );
}

function StatCard({
  value,
  label,
  description,
  footnote,
  index,
}: {
  value: string;
  label: string;
  description: string;
  footnote?: number;
  index: number;
}) {
  return (
    <div
      className="eco-card group relative flex flex-col items-center rounded-2xl border p-8 text-center transition-shadow duration-300 hover:shadow-lg 2xl:p-10"
      style={{
        borderColor: "color-mix(in oklch, var(--hero-indigo) 10%, transparent)",
        backgroundColor: "color-mix(in oklch, white 92%, var(--hero-mist))",
      }}
    >
      <p
        className="type-heading"
        style={{ color: "var(--hero-ink)" }}
      >
        <RollingNumber value={value} delay={index * 0.2} />
        {footnote && (
          <sup
            className="type-caption ml-1 font-medium"
            style={{ color: "color-mix(in oklch, var(--hero-ink) 35%, transparent)" }}
          >
            <a href="#sources" className="transition-colors hover:text-[var(--hero-coral)]">
              {footnote === 1 ? "¹" : "²"}
            </a>
          </sup>
        )}
      </p>
      <p
        className="type-label mt-3 font-semibold uppercase tracking-wider"
        style={{ color: "var(--hero-coral)" }}
      >
        {label}
      </p>
      <p
        className="type-body-lg mt-2"
        style={{ color: "color-mix(in oklch, var(--hero-ink) 60%, transparent)" }}
      >
        {description}
      </p>
    </div>
  );
}

export default function EcosystemStats() {
  const sectionRef = useRef<HTMLElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const hasStatsAnimated = useRef(false);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const grid = statsGridRef.current;
      if (!section || !grid) return;

      const mm = gsap.matchMedia();
      let triggersReady = false;

      const playStats = () => {
        if (hasStatsAnimated.current) return;
        hasStatsAnimated.current = true;

        gsap.to(".eco-card", {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.1,
          ease: "power3.out",
        });
        gsap.to(".eco-digit-column", {
          yPercent: (_i, el) => -Number((el as HTMLElement).dataset.digit) * 10,
          duration: 2,
          ease: "cubic-bezier(.42,.08,.04,1)",
          delay: (_i, el) => Number((el as HTMLElement).dataset.delay ?? 0),
        });
      };

      const setupScrollTriggers = () => {
        if (triggersReady) return;
        triggersReady = true;

        ScrollTrigger.refresh();

        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        })
          .to(".eco-eyebrow", { opacity: 1, y: 0, duration: 0.4 })
          .to(".eco-heading", { opacity: 1, y: 0, duration: 0.45 }, "-=0.2");

        ScrollTrigger.create({
          trigger: grid,
          start: STATS_SCROLL_START,
          once: true,
          invalidateOnRefresh: true,
          onEnter: playStats,
        });

        gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 75%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        }).to(".eco-insurers", { opacity: 1, duration: 0.4 }, 0.6);
      };

      const bootScrollTriggers = () => {
        requestAnimationFrame(setupScrollTriggers);
      };

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set([".eco-eyebrow", ".eco-heading"], { opacity: 0, y: 20 });
        gsap.set(".eco-card", { opacity: 0, y: 30 });
        gsap.set(".eco-insurers", { opacity: 0 });
        gsap.set(".eco-digit-column", { yPercent: 0 });

        if (document.readyState === "complete") {
          bootScrollTriggers();
        } else {
          window.addEventListener("load", bootScrollTriggers, { once: true });
        }

        return () => window.removeEventListener("load", bootScrollTriggers);
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([".eco-eyebrow", ".eco-heading", ".eco-card", ".eco-insurers"], {
          opacity: 1,
          y: 0,
        });
        gsap.set(".eco-digit-column", {
          yPercent: (_i, el) => -Number((el as HTMLElement).dataset.digit) * 10,
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--hero-canvas)" }}
      aria-labelledby="ecosystem-heading"
    >
      <EcosystemBackground />

      <div className="relative z-10 page-container section-y">
        <p
          className="type-eyebrow eco-eyebrow"
          style={{ color: "color-mix(in oklch, var(--hero-ink) 45%, transparent)" }}
        >
          {ecosystem.eyebrow}
        </p>

        <h2
          id="ecosystem-heading"
          className="type-section-display eco-heading mt-4 max-w-5xl"
          style={{ color: "var(--hero-ink)" }}
        >
          {ecosystem.heading}
        </h2>

        <div ref={statsGridRef} className="eco-stats-grid mt-12 grid gap-6 md:grid-cols-3 2xl:gap-8">
          {ecosystem.stats.map((stat, i) => (
            <StatCard
              key={stat.label}
              value={stat.value}
              label={stat.label}
              description={stat.description}
              footnote={"footnote" in stat ? (stat.footnote as number) : undefined}
              index={i}
            />
          ))}
        </div>

        <div
          className="eco-insurers mt-12 rounded-2xl border p-6"
          style={{
            borderColor: "color-mix(in oklch, var(--hero-indigo) 10%, transparent)",
            backgroundColor: "color-mix(in oklch, var(--hero-mist) 40%, white)",
          }}
        >
          <p
            className="type-eyebrow mb-4 text-center"
            style={{ color: "color-mix(in oklch, var(--hero-ink) 40%, transparent)" }}
          >
            World-leading insurers including
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {ecosystem.insurers.map((name) => (
              <span
                key={name}
                className="type-label font-semibold tracking-wide"
                style={{ color: "color-mix(in oklch, var(--hero-ink) 55%, transparent)" }}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
