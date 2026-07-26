"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { PLATFORM_SWITCH_DURATION_S, PLATFORM_SWITCH_EASE } from "./platform-switch";

gsap.registerPlugin(useGSAP);

function measureTab(list: HTMLElement, tab: HTMLElement) {
  const listRect = list.getBoundingClientRect();
  const tabRect = tab.getBoundingClientRect();

  return {
    x: tabRect.left - listRect.left - list.clientLeft,
    y: tabRect.top - listRect.top - list.clientTop,
    width: tabRect.width,
    height: tabRect.height,
  };
}

type TabRect = ReturnType<typeof measureTab>;

function setIndicator(indicator: HTMLElement, rect: TabRect) {
  gsap.set(indicator, {
    top: rect.y,
    left: rect.x,
    width: rect.width,
    height: rect.height,
  });
}

export type AnimatedTab = {
  key: string;
  content: ReactNode;
  ariaLabel?: string;
};

/**
 * Reusable animated tab list: a sliding indicator that measures the active
 * tab's real box and tweens `top/left/width/height` to it, so the same engine
 * drives both the horizontal platform tabs and the vertical Trusted sidebar.
 * Layout (grid vs flex-column), tab styling and the indicator look are all
 * supplied by the caller via className props.
 */
export default function AnimatedTabList({
  items,
  active,
  onActiveChange,
  ariaLabel,
  orientation = "horizontal",
  className = "",
  tabClassName = "",
  tabClassNameFor,
  indicatorClassName = "platform-tab-indicator",
}: {
  items: readonly AnimatedTab[];
  active: number;
  onActiveChange: (index: number) => void;
  ariaLabel: string;
  orientation?: "horizontal" | "vertical";
  className?: string;
  tabClassName?: string;
  tabClassNameFor?: (index: number, selected: boolean) => string;
  indicatorClassName?: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(active);
  const readyRef = useRef(false);
  const isAnimatingRef = useRef(false);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  activeRef.current = active;

  useGSAP(
    () => {
      const list = listRef.current;
      if (!list) return;

      const snapActive = () => {
        if (isAnimatingRef.current) return;

        const indicator = indicatorRef.current;
        const tab = tabRefs.current[activeRef.current];
        if (!indicator || !tab) return;

        tweenRef.current?.kill();
        tweenRef.current = null;
        setIndicator(indicator, measureTab(list, tab));
      };

      snapActive();

      const ro = new ResizeObserver(snapActive);
      ro.observe(list);
      tabRefs.current.forEach((el) => {
        if (el) ro.observe(el);
      });

      return () => {
        ro.disconnect();
        tweenRef.current?.kill();
        tweenRef.current = null;
      };
    },
    { scope: listRef },
  );

  useGSAP(
    () => {
      const list = listRef.current;
      const indicator = indicatorRef.current;
      const tab = tabRefs.current[active];
      if (!list || !indicator || !tab) return;

      const target = measureTab(list, tab);

      if (!readyRef.current) {
        setIndicator(indicator, target);
        readyRef.current = true;
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        tweenRef.current?.kill();
        isAnimatingRef.current = true;

        tweenRef.current = gsap.to(indicator, {
          top: target.y,
          left: target.x,
          width: target.width,
          height: target.height,
          duration: PLATFORM_SWITCH_DURATION_S,
          ease: PLATFORM_SWITCH_EASE,
          overwrite: true,
          onComplete: () => {
            isAnimatingRef.current = false;
            setIndicator(indicator, target);
          },
        });

        return () => {
          tweenRef.current?.kill();
          tweenRef.current = null;
          isAnimatingRef.current = false;
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        setIndicator(indicator, target);
      });

      return () => mm.revert();
    },
    { dependencies: [active], scope: listRef },
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation={orientation}
      className={`platform-tablist relative overflow-hidden ${className}`}
    >
      <div
        ref={indicatorRef}
        className={`pointer-events-none absolute z-0 will-change-[top,left,width,height] ${indicatorClassName}`}
        aria-hidden
      />

      {items.map((item, index) => {
        const selected = index === active;

        return (
          <button
            key={item.key}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-label={item.ariaLabel}
            onClick={() => onActiveChange(index)}
            className={`relative z-10 flex cursor-pointer items-center justify-center transition-[color,opacity] ${tabClassName} ${
              tabClassNameFor?.(index, selected) ?? ""
            }`}
          >
            {item.content}
          </button>
        );
      })}
    </div>
  );
}
