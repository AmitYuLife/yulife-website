"use client";

import { useState } from "react";
import PillarAccordion from "@/components/ui/PillarAccordion";
import { pillars } from "@/data/home-content";

/** Mirrors TabbedPanel's wiring: the countdown advances through the items and
 *  loops; opening an item yourself stops it (Restart brings it back). */
export default function PillarAccordionDemo() {
  const items = pillars[1].bullets;
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(true);

  return (
    <div className="flex w-full max-w-[388px] flex-col gap-stack">
      <PillarAccordion
        items={items}
        active={active}
        onSelect={(i) => {
          setRunning(false);
          setActive(i);
        }}
        countdown={
          running
            ? { durationMs: 10_000, paused: false, onEnd: () => setActive((active + 1) % items.length) }
            : undefined
        }
      />
      {!running && (
        <button
          type="button"
          onClick={() => setRunning(true)}
          className="type-label self-start text-on-inverse underline"
        >
          Restart countdown
        </button>
      )}
    </div>
  );
}
