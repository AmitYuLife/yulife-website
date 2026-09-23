"use client";

import { useEffect, useState } from "react";

const BOX_HEIGHT = "h-[132px] tablet:h-[148px]";

function prefersHoverInteraction() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * One of the four capability boxes below the tab panel. The title sits centred
 * by default and slides up to reveal the longer description on hover (pointer)
 * or when the box is opened by tap/keyboard.
 *
 * Two independent behaviours:
 *  - Reveal (title → description): a transient hover affordance on pointer
 *    devices, or the `open` state on touch/keyboard. Hover NEVER changes which
 *    box is active.
 *  - Selection (the darker `surface-inverse` highlight + white title): a
 *    persistent, click/tap-driven state owned by the parent group. The first
 *    box is selected by default and the last-clicked box wins.
 *
 * When the group props (`selected`/`onSelect`) are omitted the box falls back
 * to standalone behaviour (always white, no persistent highlight, tap toggles
 * its own reveal) so single-box demos keep working.
 *
 * Reveal uses CSS transitions (not GSAP) so rapid moves across the four-column
 * grid never leave a box stuck mid-animation.
 */
export default function PillarBox({
  title,
  description,
  className = "",
  selected,
  open,
  onSelect,
  onToggleOpen,
  anchorIndex,
}: {
  title: string;
  description: string;
  className?: string;
  /** Controlled group: whether this box is the active (highlighted) column. */
  selected?: boolean;
  /** Controlled group: force the description revealed (touch tap / keyboard). */
  open?: boolean;
  /** Controlled group: make this box the active column (click/tap/keyboard). */
  onSelect?: () => void;
  /** Controlled group: toggle this box's reveal on touch/keyboard. */
  onToggleOpen?: () => void;
  /** When set, marks this box as a connecting-path anchor at this index. */
  anchorIndex?: number;
}) {
  const controlled = onSelect != null;

  // Detect hover capability after mount so the initial (server-prerendered)
  // render never touches `window`. Defaults to tap behaviour until then.
  const [hoverCapable, setHoverCapable] = useState(false);
  useEffect(() => {
    setHoverCapable(prefersHoverInteraction());
  }, []);

  // Standalone fallback reveal state (only used when uncontrolled).
  const [tapped, setTapped] = useState(false);

  const handleClick = () => {
    if (controlled) {
      onSelect?.();
      // On touch there is no hover, so a tap both selects and reveals.
      if (!hoverCapable) onToggleOpen?.();
    } else if (!hoverCapable) {
      setTapped((current) => !current);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (controlled) {
        onSelect?.();
        // Keyboard users have no hover either — reveal on activation.
        onToggleOpen?.();
      } else {
        setTapped((current) => !current);
      }
    }
  };

  const expanded = controlled ? !!open : !hoverCapable && tapped;
  // The darker highlight + muted title only exist inside a selectable group;
  // a standalone box keeps the original raised background and white title.
  const groupSelected = controlled && !!selected;
  const mutedTitle = controlled && !selected;

  return (
    <div
      className={`pillar-box relative flex ${BOX_HEIGHT} flex-col text-center transition-colors duration-300 ${
        controlled ? "cursor-pointer" : "cursor-default"
      } ${groupSelected ? "bg-surface-inverse" : "bg-surface-inverse-raised"} ${
        hoverCapable ? "pillar-box--hover-capable" : ""
      } ${expanded ? "pillar-box--active" : ""} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={controlled ? groupSelected : undefined}
      aria-expanded={expanded}
      aria-label={title}
      data-pillar-node={anchorIndex != null ? "top" : undefined}
      data-pillar-index={anchorIndex}
    >
      <div className={`relative w-full overflow-hidden ${BOX_HEIGHT}`}>
        <div className="pillar-box-track will-change-transform">
          <div
            aria-hidden={expanded}
            className={`pillar-box-default flex ${BOX_HEIGHT} items-center justify-center p-32 tablet:p-40`}
          >
            <p
              className={`type-label w-full transition-colors duration-300 ${
                mutedTitle ? "text-on-inverse-muted" : "text-on-inverse"
              }`}
            >
              {title}
            </p>
          </div>
          <div
            aria-hidden={!expanded}
            className={`pillar-box-reveal flex ${BOX_HEIGHT} items-center justify-center px-24 tablet:px-32`}
          >
            <p className="type-body-md w-full text-balance text-on-inverse">
              {description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
