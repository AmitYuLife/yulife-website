"use client";

import { pillars } from "@/data/home-content";
import PillarBox from "./PillarBox";

/** Accent per capability box / start-node, left → right. */
export const PILLAR_COLORS = [
  "var(--green-600)",
  "var(--blue-600)",
  "var(--yellow-600)",
  "var(--purple-600)",
] as const;

/** Prevent is the tab fully designed in Figma; it opens by default. */
const DEFAULT_TAB = pillars.findIndex((p) => p.id === "prevent");

function splitBullet(bullet: string) {
  const idx = bullet.indexOf(":");
  if (idx === -1) return { title: bullet.trim(), description: "" };
  return {
    title: bullet.slice(0, idx).trim(),
    description: bullet.slice(idx + 1).trim(),
  };
}

/** Hairline dividers between boxes — borders instead of grid gap so pointer
 *  events stay continuous when moving across four desktop columns. */
function boxBorderClass(index: number) {
  if (index === 0) return "";
  const classes = ["border-t border-line-emphasis"];
  if (index % 2 === 1) classes.push("tablet:border-l");
  if (index >= 2) classes.push("tablet:border-t");
  classes.push("desktop:border-t-0");
  if (index % 4 !== 0) classes.push("desktop:border-l");
  return classes.join(" ");
}

function MoodCard() {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const moods = ["😍", "😄", "😌", "🙂", "😄", "😌", "😄"];
  return (
    <div
      className="w-[220px] rounded-lg border p-16 shadow-[8px_8px_0_0_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-300)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[15px] font-bold" style={{ color: "#5a5a5c" }}>
          Your Mood
        </span>
        <span className="text-[12px]" style={{ color: "#8a8a8c" }}>
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
      className="w-[150px] overflow-hidden rounded-lg border shadow-[8px_8px_0_0_rgba(0,0,0,0.12)]"
      style={{ backgroundColor: "var(--neutral-white)", borderColor: "var(--neutral-300)" }}
    >
      <div
        className="flex h-[108px] items-center justify-center text-[40px]"
        style={{ backgroundColor: "#018547" }}
      >
        🪷
      </div>
      <div className="px-12 py-14 text-center text-[15px] font-bold leading-tight" style={{ color: "#5a5a5c" }}>
        Breathing
        <br />
        exercises
      </div>
    </div>
  );
}

function VideoPlaceholder({ built }: { built: boolean }) {
  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-md"
      style={{
        backgroundImage:
          "radial-gradient(120% 120% at 50% 0%, color-mix(in srgb, var(--purple-600) 26%, transparent), transparent 62%), linear-gradient(160deg, var(--purple-800), var(--purple-900))",
      }}
    >
      {built ? (
        <span
          className="grid size-64 place-items-center rounded-full border"
          style={{
            borderColor: "color-mix(in srgb, var(--neutral-white) 55%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--neutral-white) 10%, transparent)",
          }}
          aria-label="Video placeholder"
        >
          <svg width="22" height="26" viewBox="0 0 22 26" fill="none" aria-hidden="true">
            <path d="M2 2l18 11L2 24V2z" fill="var(--neutral-white)" />
          </svg>
        </span>
      ) : (
        <span
          className="type-body-lg px-24 text-center"
          style={{ color: "color-mix(in srgb, var(--neutral-white) 72%, transparent)" }}
        >
          Coming soon
        </span>
      )}
    </div>
  );
}

export const DEFAULT_ACTIVE_TAB = DEFAULT_TAB;

export default function TabbedPanel({
  active,
  onActiveChange,
}: {
  active: number;
  onActiveChange: (index: number) => void;
}) {
  const activePillar = pillars[active];
  // The Prevent tab carries the bespoke floating cards from the Figma design;
  // every tab now renders its capability boxes from the pillars content.
  const hasFloatingCards = activePillar.id === "prevent";
  const boxes = activePillar.bullets.slice(0, 4).map(splitBullet);
  const desktopCols =
    boxes.length >= 4 ? "desktop:grid-cols-4" : "desktop:grid-cols-3";

  return (
    <div className="flex w-full max-w-[1216px] flex-col items-center gap-flow tablet:gap-group">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Platform capabilities"
        className="grid w-full grid-cols-2 overflow-hidden rounded-md border border-line-emphasis tablet:grid-cols-4"
      >
        {pillars.map((pillar, i) => {
          const selected = i === active;
          return (
            <button
              key={pillar.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onActiveChange(i)}
              className={`type-label relative px-24 py-16 text-center transition-colors tablet:border-l tablet:border-line-emphasis tablet:first:border-l-0 ${
                selected ? "text-on-inverse" : "text-on-inverse-muted hover:text-on-inverse"
              }`}
            >
              {pillar.eyebrow}
            </button>
          );
        })}
      </div>

      {/* Video / hero placeholder with floating cards */}
      <div className="relative w-full">
        <div className="h-[320px] w-full overflow-hidden rounded-md border border-line-emphasis tablet:h-[440px] desktop:h-[548px]">
          <VideoPlaceholder built />
        </div>

        {hasFloatingCards && (
          <>
            <div className="absolute -left-8 bottom-24 hidden tablet:block desktop:-left-24">
              <MoodCard />
            </div>
            <div className="absolute -right-8 top-24 hidden tablet:block desktop:-right-24">
              <BreathingCard />
            </div>
          </>
        )}
      </div>

      {/* Capability boxes — pulled down half their height on desktop so they
          straddle the platform / Yunity divider; -mt-[74px] cancels the extra
          visual gap the translate adds below the video hero. */}
      <div
        className={`relative grid w-full grid-cols-1 overflow-hidden rounded-md border border-line-emphasis bg-surface-inverse-raised tablet:grid-cols-2 desktop:-mt-[74px] desktop:translate-y-1/2 ${desktopCols}`}
      >
        {boxes.map((box, i) => (
          <PillarBox
            key={`${activePillar.id}-${box.title}`}
            anchorIndex={i}
            title={box.title}
            description={box.description}
            className={boxBorderClass(i)}
          />
        ))}
      </div>
    </div>
  );
}
