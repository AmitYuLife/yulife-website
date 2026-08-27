"use client";

import { useState } from "react";
import StatFlipCard from "@/components/ui/StatFlipCard";
import type { ProvenRoiStat } from "@/data/pages/types";

const stat: ProvenRoiStat = {
  value: "98%",
  label: "policy renewal",
  note: "vs an 82% market average — engaged members stay covered.",
  source: "YuLife book of business",
};

/**
 * Workbench harness for the single StatFlipCard (the card inside StatCardFan):
 * one card in the readable "stack" layout, flipping on click / tap so the
 * component can be reviewed in isolation from the fan.
 */
export default function StatFlipCardDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto w-[324px]">
      <StatFlipCard
        stat={stat}
        index={0}
        isOpen={open}
        isHovered={false}
        onToggle={() => setOpen((v) => !v)}
        onHover={() => {}}
        activeIndex={null}
        angle={0}
        layout="stack"
      />
    </div>
  );
}
