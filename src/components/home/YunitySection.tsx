"use client";

import { yunity } from "@/data/home-content";
import { useReveal } from "./useReveal";

const DOTS = [
  { cx: 120, color: "var(--green-600)" },
  { cx: 430, color: "var(--blue-600)" },
  { cx: 720, color: "var(--yellow-600)" },
  { cx: 1020, color: "var(--purple-600)" },
];

/** Neural "roots" backdrop: coloured signals fan in from the top, converge at
 *  the Yunity mark, then branch back out to the three capability cards. */
function RootsBackdrop() {
  const converge = { x: 570, y: 470 };
  return (
    <svg
      className="pointer-events-none absolute inset-0 hidden h-full w-full tablet:block"
      viewBox="0 0 1140 900"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {DOTS.map((d, i) => (
        <g key={i}>
          <path
            d={`M ${d.cx} 40 C ${d.cx} 220, ${converge.x} 300, ${converge.x} ${converge.y}`}
            stroke={d.color}
            strokeWidth={1.5}
            strokeOpacity={0.5}
            fill="none"
          />
          <circle cx={d.cx} cy={40} r={7} fill={d.color} />
        </g>
      ))}
      {[230, 570, 910].map((x, i) => (
        <path
          key={i}
          d={`M ${converge.x} ${converge.y} C ${converge.x} 660, ${x} 640, ${x} 780`}
          stroke="var(--yellow-600)"
          strokeWidth={1.5}
          strokeOpacity={0.35}
          fill="none"
        />
      ))}
    </svg>
  );
}

export default function YunitySection() {
  const scope = useReveal<HTMLElement>();
  const [lead, ...rest] = yunity.intro.split(". YuLife tells you what's about to happen next week.");
  const para1 = lead + ". YuLife tells you what's about to happen next week.";
  const para2 = rest.join("").trim();

  return (
    <section
      ref={scope}
      className="relative overflow-hidden border-t"
      style={{
        backgroundColor: "var(--purple-900)",
        borderColor: "color-mix(in srgb, var(--purple-700) 45%, transparent)",
      }}
      aria-labelledby="yunity-heading"
    >
      <RootsBackdrop />

      <div className="page-container section-y relative z-10">
        <div className="mx-auto max-w-[900px] text-center">
          <h2
            id="yunity-heading"
            data-reveal
            className="type-heading-h2"
            style={{ color: "var(--neutral-white)" }}
          >
            {yunity.heading}
          </h2>

          <p
            data-reveal
            className="type-body-lg mx-auto mt-24 max-w-[720px]"
            style={{ color: "color-mix(in srgb, var(--neutral-white) 88%, transparent)" }}
          >
            {para1}
          </p>
          {para2 && (
            <p
              data-reveal
              className="type-body-lg mx-auto mt-16 max-w-[640px]"
              style={{ color: "color-mix(in srgb, var(--neutral-white) 72%, transparent)" }}
            >
              {para2}
            </p>
          )}

          <img
            src="/home/yunity-wordmark.svg"
            alt="Yunity"
            data-reveal
            className="mx-auto mt-48 h-48 w-auto tablet:mt-64 tablet:h-64"
          />
        </div>

        <div className="mx-auto mt-48 grid max-w-[1140px] gap-24 tablet:mt-64 tablet:grid-cols-3">
          {yunity.steps.map((step, i) => (
            <div
              key={step.title}
              data-reveal
              className="flex flex-col rounded-md border p-32 text-center"
              style={{
                backgroundColor: "color-mix(in srgb, var(--purple-800) 55%, var(--purple-900))",
                borderColor: "color-mix(in srgb, var(--purple-700) 60%, transparent)",
              }}
            >
              <span
                className="type-display-number"
                style={{ color: "var(--neutral-white)" }}
              >
                {i + 1}
              </span>
              <span
                className="type-eyebrow mt-8 uppercase tracking-[0.18em]"
                style={{ color: "var(--purple-500)" }}
              >
                {step.title}
              </span>
              <p
                className="type-body-lg mt-16 font-semibold"
                style={{ color: "var(--neutral-white)" }}
              >
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
