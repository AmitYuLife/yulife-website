"use client";

import { useEffect, useRef } from "react";

/** Space reserved for the hamburger control when switching to compact nav. */
const HAMBURGER_RESERVE_PX = 44;

/**
 * Switches to compact (hamburger) nav when the desktop cluster would overflow
 * the pill — i.e. when labels would wrap or crush the layout.
 */
export function useNavCompactMode(onCompactChange: (compact: boolean) => void) {
  const barRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const probeRef = useRef<HTMLDivElement>(null);
  const compactRef = useRef(false);

  useEffect(() => {
    const bar = barRef.current;
    const logo = logoRef.current;
    const probe = probeRef.current;
    if (!bar || !logo || !probe) return;

    const update = () => {
      const available =
        bar.clientWidth - logo.offsetWidth - HAMBURGER_RESERVE_PX;
      const next = probe.scrollWidth > available;

      if (next === compactRef.current) return;
      compactRef.current = next;
      onCompactChange(next);
    };

    const observer = new ResizeObserver(update);
    observer.observe(bar);
    observer.observe(logo);
    observer.observe(probe);
    update();

    return () => observer.disconnect();
  }, [onCompactChange]);

  return { barRef, logoRef, probeRef };
}
