"use client";

import { useState } from "react";
import PillarBox from "@/components/ui/PillarBox";
import { pillars } from "@/data/home-content";

/** Standalone capability-box group (the homepage now renders the pillars as
 *  an accordion instead) showing the group behaviour: first box selected by
 *  default, click/tap sets the active column (last-clicked wins, hover never
 *  changes it), hover reveals the description, tap/keyboard opens it on touch. */
function boxBorderClass(index: number) {
  if (index === 0) return "";
  const classes = ["border-t border-line-emphasis"];
  if (index % 2 === 1) classes.push("tablet:border-l");
  if (index >= 2) classes.push("tablet:border-t");
  classes.push("desktop:border-t-0");
  if (index % 4 !== 0) classes.push("desktop:border-l");
  return classes.join(" ");
}

export default function PillarBoxGroupDemo() {
  const boxes = pillars[0].bullets.slice(0, 4);
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-[1216px]">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-md border border-line-emphasis bg-surface-inverse-raised tablet:grid-cols-2 desktop:grid-cols-4">
        {boxes.map((box, i) => (
          <PillarBox
            key={box.title}
            title={box.title}
            description={box.description}
            className={boxBorderClass(i)}
            selected={i === active}
            open={open === i}
            onSelect={() => setActive(i)}
            onToggleOpen={() => setOpen((prev) => (prev === i ? null : i))}
          />
        ))}
      </div>
    </div>
  );
}
