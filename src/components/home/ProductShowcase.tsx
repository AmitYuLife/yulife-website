"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { products } from "@/data/home-content";
import { useReveal } from "./useReveal";

const INTRO =
  "YuLife is the centralised one-stop-shop that unifies world-class cover with a digital-first health experience.";

const CARD_GRADIENTS = [
  "radial-gradient(130% 130% at 20% 0%, color-mix(in srgb, var(--blue-600) 42%, transparent), transparent 62%)",
  "radial-gradient(130% 130% at 20% 0%, color-mix(in srgb, var(--green-600) 34%, transparent), transparent 62%)",
  "radial-gradient(130% 130% at 20% 0%, color-mix(in srgb, var(--purple-600) 48%, transparent), transparent 62%)",
  "radial-gradient(130% 130% at 20% 0%, color-mix(in srgb, var(--yellow-600) 30%, transparent), transparent 62%)",
];

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-48 place-items-center rounded-full transition-transform hover:-translate-y-0.5"
      style={{ backgroundColor: "color-mix(in srgb, var(--neutral-white) 40%, transparent)" }}
    >
      {children}
    </button>
  );
}

export default function ProductShowcase() {
  const scope = useReveal<HTMLElement>();
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByCards = useCallback((dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: dir * amount, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t"
      style={{
        backgroundColor: "var(--purple-900)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="protect-heading"
    >
      <div className="page-container section-y">
        <div className="flex flex-col gap-24 desktop:flex-row desktop:items-end desktop:justify-between">
          <div className="max-w-[640px]">
            <p
              data-reveal
              className="type-eyebrow uppercase tracking-[0.16em]"
              style={{ color: "var(--purple-500)" }}
            >
              {products.eyebrow}
            </p>
            <h2
              id="protect-heading"
              data-reveal
              className="type-heading-h2 mt-16"
              style={{ color: "var(--neutral-white)" }}
            >
              {products.heading}
            </h2>
          </div>
          <p
            data-reveal
            className="type-body-lg max-w-[420px]"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 82%, transparent)" }}
          >
            {INTRO}
          </p>
        </div>

        <div
          ref={trackRef}
          data-reveal
          className="mt-48 flex snap-x snap-mandatory gap-24 overflow-x-auto pb-16 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.cards.map((card, i) => (
            <Link
              key={card.title}
              href={card.href}
              data-card
              className="group flex w-[300px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-md border p-32 transition-transform duration-300 hover:-translate-y-1 tablet:w-[380px] tablet:min-h-[520px] desktop:w-[420px]"
              style={{
                minHeight: "440px",
                borderColor: "color-mix(in srgb, var(--purple-700) 60%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--purple-800) 45%, var(--purple-900))",
                backgroundImage: CARD_GRADIENTS[i % CARD_GRADIENTS.length],
              }}
            >
              <span
                className="type-label font-bold uppercase tracking-[0.14em]"
                style={{ color: "color-mix(in srgb, var(--neutral-white) 70%, transparent)" }}
              >
                {card.carrier}
              </span>
              <div>
                <h3 className="type-heading-h3" style={{ color: "var(--neutral-white)" }}>
                  {card.title}
                </h3>
                <p
                  className="type-body-md mt-16"
                  style={{ color: "color-mix(in srgb, var(--neutral-white) 80%, transparent)" }}
                >
                  {card.description}
                </p>
                <span
                  className="type-button-md mt-24 inline-flex items-center gap-8 transition-colors group-hover:text-[color:var(--green-600)]"
                  style={{ color: "var(--neutral-white)" }}
                >
                  Learn more
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div data-reveal className="mt-24 flex gap-8">
          <ControlButton label="Previous product" onClick={() => scrollByCards(-1)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ControlButton>
          <ControlButton label="Next product" onClick={() => scrollByCards(1)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </ControlButton>
        </div>
      </div>
    </section>
  );
}
