"use client";

import Link from "next/link";
import { useId } from "react";
import { PLATFORM_SWITCH_EASE, PLATFORM_SWITCH_MS } from "@/lib/platform-switch";

export type PillarAccordionItem = {
  title: string;
  description: string;
  href: string;
};

/**
 * The platform pillar's capabilities as a single-open accordion (Figma
 * 2920:58393, TabColumns). The open item has a white title, 32px top and bottom
 * padding and a brand-gradient bottom stroke; closed items have muted titles
 * and a tighter 16px bottom. While autoplay is running the
 * stroke sweeps across the muted emphasis border as a countdown, and
 * `countdown.onEnd` fires when it completes; with autoplay stopped the stroke is
 * fully filled. The countdown is a CSS animation, so pausing it (off-screen,
 * hidden tab) pauses the timer.
 */
export default function PillarAccordion({
  items,
  active,
  onSelect,
  countdown,
}: {
  items: readonly PillarAccordionItem[];
  active: number;
  onSelect: (index: number) => void;
  /** Omit when autoplay is stopped: the stroke then shows fully filled. */
  countdown?: { durationMs: number; paused: boolean; onEnd: () => void };
}) {
  const baseId = useId();

  return (
    <div
      className="flex w-full flex-col"
      style={
        {
          "--switch-ms": `${PLATFORM_SWITCH_MS}ms`,
          "--switch-ease": PLATFORM_SWITCH_EASE,
        } as React.CSSProperties
      }
    >
      {items.map((item, i) => {
        const open = i === active;
        const buttonId = `${baseId}-button-${i}`;
        const panelId = `${baseId}-panel-${i}`;

        return (
          <div
            key={item.title}
            className={`relative border-b pt-32 desktop:pr-80 transition-[border-color,padding-bottom] duration-(--switch-ms) ease-(--switch-ease) ${
              open ? "border-line-emphasis pb-32" : "border-transparent pb-16"
            }`}
          >
            <h3
              className={`type-heading-h5 transition-colors duration-(--switch-ms) ease-(--switch-ease) ${
                open ? "text-on-inverse" : "text-on-inverse-muted hover:text-on-inverse"
              }`}
            >
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => onSelect(i)}
                className="w-full cursor-pointer text-left"
              >
                {item.title}
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!open}
              inert={!open}
              className="pillar-accordion-panel grid"
              data-open={open || undefined}
            >
              <div className="overflow-hidden">
                <div className="pillar-accordion-body type-label pt-16 text-on-inverse">
                  <p>{item.description}</p>
                  <Link href={item.href} className="mt-24 inline-block underline">
                    Find out more
                  </Link>
                </div>
              </div>
            </div>

            {open && (
              <span
                aria-hidden
                className="pillar-countdown pointer-events-none absolute inset-x-0 -bottom-px h-px"
                style={
                  countdown
                    ? ({ "--countdown-ms": `${countdown.durationMs}ms` } as React.CSSProperties)
                    : undefined
                }
                data-running={countdown ? "" : undefined}
                data-paused={countdown?.paused || undefined}
                onAnimationEnd={countdown?.onEnd}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
