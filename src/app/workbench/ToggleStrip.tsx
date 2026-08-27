"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Workbench chrome: a light control strip that sits above a specimen (which must
 * be registered `padded: false`) so a reviewer can exercise a component's
 * toggleable props / variants in place — the same affordance the ImageRightHero
 * demo uses for its visual variants. Not part of any real component.
 */
export function ToggleStrip({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-inline border-b border-line bg-surface-subtle px-16 py-12">
      {label && <span className="type-caption text-emphasis">{label}</span>}
      <div className="flex flex-wrap gap-inline" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

/**
 * A single pill in a ToggleStrip. `active` drives the pressed look; use it as an
 * independent on/off (aria-pressed) toggle or, across a set, as a one-of-N
 * variant switch — the styling is identical either way.
 */
export function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "type-label rounded-sm border px-controls py-inline capitalize transition-colors",
        active
          ? "border-line-emphasis bg-surface-inverse text-on-inverse"
          : "border-line bg-surface text-emphasis hover:border-line-emphasis",
      )}
    >
      {children}
    </button>
  );
}
