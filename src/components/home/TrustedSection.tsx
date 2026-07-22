"use client";

import { socialProof } from "@/data/home-content";
import { useReveal } from "./useReveal";
import { assetPath } from "@/lib/assetPath";

const testimonial = {
  brand: "OZONE.bg",
  quote:
    "The best part of YuLife is that everything is in the app, making it easier to keep it top of mind and check it daily. It's a clear improvement from before we had YuLife.",
  author: "Bryan Scott, CMO",
  tag: "HR Leader",
};

const AWARDS = [
  assetPath("/home/award-1.svg"),
  assetPath("/home/award-2.svg"),
  assetPath("/home/award-3.svg"),
];

function ControlButton({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid size-32 place-items-center rounded-full transition-colors"
      style={{ backgroundColor: "color-mix(in srgb, var(--neutral-white) 40%, transparent)" }}
    >
      {children}
    </button>
  );
}

export default function TrustedSection() {
  const scope = useReveal<HTMLElement>();

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t"
      style={{
        backgroundColor: "var(--purple-800)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="trusted-heading"
    >
      <div className="page-container section-y">
        <h2
          id="trusted-heading"
          data-reveal
          className="type-heading-h2"
          style={{ color: "var(--neutral-white)" }}
        >
          {socialProof.heading}
        </h2>
        <p
          data-reveal
          className="type-body-lg mt-16 max-w-[820px]"
          style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
        >
          {socialProof.body}
        </p>

        <div
          data-reveal
          className="relative mt-48 flex min-h-[420px] flex-col justify-end overflow-hidden rounded-md border p-32 tablet:min-h-[520px] tablet:p-48"
          style={{
            borderColor: "color-mix(in srgb, var(--purple-700) 60%, transparent)",
            backgroundImage:
              "linear-gradient(120deg, color-mix(in srgb, var(--purple-900) 82%, transparent), color-mix(in srgb, var(--purple-700) 55%, transparent)), radial-gradient(120% 120% at 80% 20%, color-mix(in srgb, var(--blue-600) 30%, transparent), transparent 60%)",
            backgroundColor: "var(--purple-900)",
          }}
        >
          <span
            className="type-heading-h5 font-bold tracking-tight"
            style={{ color: "var(--neutral-white)" }}
          >
            {testimonial.brand}
          </span>
          <blockquote
            className="type-body-lg mt-16 max-w-[900px] font-semibold"
            style={{ color: "var(--neutral-white)" }}
          >
            &ldquo;{testimonial.quote}&rdquo;
          </blockquote>
          <div className="mt-24 flex flex-wrap items-center gap-16">
            <span className="type-body-lg font-semibold" style={{ color: "var(--green-600)" }}>
              {testimonial.author}
            </span>
            <span
              className="type-eyebrow rounded-full px-16 py-4 font-semibold"
              style={{ backgroundColor: "var(--green-600)", color: "var(--neutral-white)" }}
            >
              {testimonial.tag}
            </span>
          </div>

          <div className="absolute bottom-32 right-32 flex gap-8 tablet:bottom-48 tablet:right-48">
            <ControlButton label="Previous testimonial">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 3 5 8l5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ControlButton>
            <ControlButton label="Next testimonial">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </ControlButton>
          </div>
        </div>

        <ul
          data-reveal
          className="mt-40 flex flex-wrap items-center justify-center gap-x-48 gap-y-24 tablet:mt-48 tablet:justify-between"
        >
          {AWARDS.map((src) => (
            <li key={src}>
              <img src={src} alt="Industry award" className="h-80 w-auto" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
