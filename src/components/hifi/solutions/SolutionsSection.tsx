"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { solutions } from "@/data/home-content";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const CARD_ACCENTS = [
  "var(--hero-coral)",
  "var(--hero-indigo)",
  "var(--hero-sage)",
  "var(--hero-indigo)",
] as const;

function SolutionsBandBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--hero-indigo) 0%, transparent 70%)",
          width: "50vw",
          height: "50vw",
          maxWidth: "640px",
          maxHeight: "640px",
          top: "-20%",
          left: "-15%",
          opacity: 0.08,
        }}
      />
      <div
        className="absolute rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--hero-coral) 0%, transparent 70%)",
          width: "45vw",
          height: "45vw",
          maxWidth: "560px",
          maxHeight: "560px",
          bottom: "-15%",
          right: "-10%",
          opacity: 0.07,
        }}
      />
    </div>
  );
}

export default function SolutionsSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const targets = [
        ".solutions-eyebrow",
        ".solutions-heading",
        ".solutions-intro",
        ".solutions-card",
      ];

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(targets, { opacity: 0, y: 20 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
          defaults: { ease: "power3.out" },
        });

        tl.to(".solutions-eyebrow", { opacity: 1, y: 0, duration: 0.4 })
          .to(".solutions-heading", { opacity: 1, y: 0, duration: 0.45 }, "-=0.2")
          .to(".solutions-intro", { opacity: 1, y: 0, duration: 0.4 }, "-=0.15")
          .to(
            ".solutions-card",
            { opacity: 1, y: 0, duration: 0.35, stagger: 0.08 },
            "-=0.1",
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(targets, { opacity: 1, y: 0 });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden"
      style={{ backgroundColor: "var(--hero-mist)" }}
      aria-labelledby="solutions-heading"
    >
      <SolutionsBandBackground />

      <div className="relative z-10 page-container section-y">
        <p
          className="type-eyebrow solutions-eyebrow"
          style={{ color: "color-mix(in oklch, var(--hero-ink) 45%, transparent)" }}
        >
          {solutions.eyebrow}
        </p>

        <h2
          id="solutions-heading"
          className="type-section-display solutions-heading mt-4 max-w-5xl"
          style={{ color: "var(--hero-ink)" }}
        >
          {solutions.heading}
        </h2>

        <p
          className="type-lead solutions-intro mt-6 max-w-3xl"
          style={{
            color: "color-mix(in oklch, var(--hero-ink) 70%, transparent)",
          }}
        >
          {solutions.intro}
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-6 3xl:gap-8">
          {solutions.cards.map((card, index) => (
            <article
              key={card.title}
              className="solutions-card group flex flex-col rounded-xl border p-5 transition-shadow duration-300 hover:shadow-md 2xl:p-6"
              style={{
                borderColor: "color-mix(in oklch, var(--hero-indigo) 12%, transparent)",
                backgroundColor: "color-mix(in oklch, white 88%, var(--hero-mist))",
              }}
            >
              <div
                className="mb-3 h-1 w-8 rounded-full"
                style={{ backgroundColor: CARD_ACCENTS[index % CARD_ACCENTS.length] }}
                aria-hidden="true"
              />
              <h3 className="type-card-title" style={{ color: "var(--hero-ink)" }}>
                {card.title}
              </h3>
              <p
                className="type-body-lg mt-2 flex-1"
                style={{
                  color: "color-mix(in oklch, var(--hero-ink) 65%, transparent)",
                }}
              >
                {card.description}
              </p>
              <Link
                href={card.cta.href}
                className="type-button mt-5 inline-flex w-fit items-center gap-1 rounded-lg border px-4 py-2.5 transition-colors hover:border-[var(--hero-coral)] hover:text-[var(--hero-coral)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                style={{
                  borderColor: "color-mix(in oklch, var(--hero-indigo) 20%, transparent)",
                  color: "var(--hero-ink)",
                }}
              >
                {card.cta.label}
                <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
