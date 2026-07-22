"use client";

import { useRef, useState } from "react";

const BOX_HEIGHT = "h-[132px] tablet:h-[148px]";

function prefersHoverInteraction() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * One of the four capability boxes below the tab panel. Shares the stats
 * component's slide-reveal: the title sits centred by default and slides up to
 * reveal the longer description on hover (pointer) or tap (touch/keyboard).
 *
 * Hover uses CSS transitions (not GSAP) so rapid moves across the four-column
 * grid never leave a box stuck mid-animation.
 */
export default function PillarBox({
  title,
  description,
  className = "",
  anchorIndex,
}: {
  title: string;
  description: string;
  className?: string;
  /** When set, marks this box as a connecting-path anchor at this index. */
  anchorIndex?: number;
}) {
  const hoverCapableRef = useRef<boolean | null>(null);
  if (hoverCapableRef.current === null) {
    hoverCapableRef.current = prefersHoverInteraction();
  }
  const hoverCapable = hoverCapableRef.current;

  const [tapped, setTapped] = useState(false);

  const handleClick = () => {
    if (!hoverCapable) setTapped((current) => !current);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setTapped((current) => !current);
    }
  };

  const expanded = !hoverCapable && tapped;

  return (
    <div
      className={`pillar-box relative flex ${BOX_HEIGHT} cursor-default flex-col bg-surface-inverse-raised text-center ${
        hoverCapable ? "pillar-box--hover-capable" : ""
      } ${expanded ? "pillar-box--active" : ""} ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
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
            <p className="type-heading-h5 w-full text-on-inverse">{title}</p>
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
