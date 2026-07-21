"use client";

import { useState } from "react";
import { pillars } from "@/data/home-content";
import { useReveal } from "./useReveal";

const PLATFORM_INTRO =
  "From daily habits to life's hardest moments — every layer of your people's health in one place.";

const TAB_ACCENTS = [
  "var(--green-600)",
  "var(--blue-600)",
  "var(--purple-600)",
  "var(--yellow-600)",
] as const;

function featureTitle(bullet: string) {
  const idx = bullet.indexOf(":");
  return idx === -1 ? bullet : bullet.slice(0, idx).trim();
}

function MoodCard() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const moods = ["🙂", "😄", "😌", "😐", "😄", "🙂", "😄"];
  return (
    <div
      className="w-[240px] rounded-md border p-16 shadow-lg"
      style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-300)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold" style={{ color: "#5a5a5c" }}>
          Your Mood
        </span>
        <span className="text-[13px]" style={{ color: "#8a8a8c" }}>
          View calendar →
        </span>
      </div>
      <div className="mt-12 flex justify-between">
        {days.map((d, i) => (
          <div key={d} className="flex flex-col items-center gap-4">
            <span className="text-[11px] font-semibold" style={{ color: "#9a9a9c" }}>
              {d}
            </span>
            <span className="text-[16px] leading-none">{moods[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BreathingCard() {
  return (
    <div
      className="flex items-center gap-8 rounded-md border p-12 shadow-lg"
      style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-300)" }}
    >
      <span
        className="grid size-32 place-items-center rounded-sm text-[16px]"
        style={{ backgroundColor: "color-mix(in srgb, var(--green-600) 22%, white)" }}
      >
        🪷
      </span>
      <span className="text-[13px] font-bold" style={{ color: "#5a5a5c" }}>
        Breathing
        <br />
        exercises
      </span>
    </div>
  );
}

export default function PlatformSection() {
  const scope = useReveal<HTMLElement>();
  const [active, setActive] = useState(0);
  const activePillar = pillars[active];

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t"
      style={{
        backgroundColor: "var(--purple-800)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="platform-heading"
    >
      <div className="page-container section-y">
        <div className="mx-auto max-w-[900px] text-center">
          <h2
            id="platform-heading"
            data-reveal
            className="type-heading-h2"
            style={{ color: "var(--neutral-white)" }}
          >
            One platform,
            <br />
            four ways to make an impact
          </h2>
          <p
            data-reveal
            className="type-body-lg mx-auto mt-24 max-w-[720px]"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 85%, transparent)" }}
          >
            {PLATFORM_INTRO}
          </p>
        </div>

        <div
          data-reveal
          role="tablist"
          aria-label="Platform capabilities"
          className="mx-auto mt-40 grid max-w-[1216px] grid-cols-2 overflow-hidden rounded-md border tablet:grid-cols-4"
          style={{ borderColor: "color-mix(in srgb, var(--purple-700) 70%, transparent)" }}
        >
          {pillars.map((pillar, i) => {
            const selected = i === active;
            return (
              <button
                key={pillar.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(i)}
                className="type-button-md relative px-24 py-16 transition-colors"
                style={{
                  color: selected ? "var(--neutral-white)" : "var(--purple-500)",
                  backgroundColor: selected
                    ? "color-mix(in srgb, var(--purple-700) 30%, transparent)"
                    : "transparent",
                  borderRight: "1px solid color-mix(in srgb, var(--purple-700) 45%, transparent)",
                }}
              >
                {pillar.eyebrow}
                {selected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-[3px]"
                    style={{ backgroundColor: TAB_ACCENTS[i % TAB_ACCENTS.length] }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          data-reveal
          className="relative mt-24 flex min-h-[320px] items-center justify-center overflow-hidden rounded-md border tablet:min-h-[480px]"
          style={{
            borderColor: "color-mix(in srgb, var(--purple-700) 60%, transparent)",
            backgroundImage: `radial-gradient(90% 120% at 50% 10%, color-mix(in srgb, ${TAB_ACCENTS[active]} 30%, transparent), transparent 60%), linear-gradient(160deg, var(--purple-900), var(--purple-800))`,
          }}
        >
          <span
            className="type-heading-h4 px-24 text-center"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 92%, transparent)" }}
          >
            {activePillar.heading}
          </span>

          <div className="absolute bottom-24 left-24 hidden tablet:block">
            <MoodCard />
          </div>
          <div className="absolute right-24 top-24 hidden tablet:block">
            <BreathingCard />
          </div>
        </div>

        <div className="mt-24 grid gap-16 tablet:grid-cols-2 desktop:grid-cols-4">
          {activePillar.bullets.slice(0, 4).map((bullet) => (
            <div
              key={bullet}
              className="flex items-center rounded-md border p-24 text-center"
              style={{
                minHeight: "104px",
                borderColor: "color-mix(in srgb, var(--purple-700) 55%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--purple-900) 55%, transparent)",
              }}
            >
              <span
                className="type-body-lg mx-auto font-semibold"
                style={{ color: "var(--neutral-white)" }}
              >
                {featureTitle(bullet)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
