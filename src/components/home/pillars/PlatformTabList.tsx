"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { pillars } from "@/data/home-content";
import { PLATFORM_SWITCH_DURATION_S, PLATFORM_SWITCH_EASE } from "./platform-switch";

gsap.registerPlugin(useGSAP);

function tabBorderClass(index: number) {
  const mobileCol = index % 2 === 0 ? "border-r border-line-emphasis" : "";
  const mobileRow = index < 2 ? "border-b border-line-emphasis" : "";

  return [
    mobileCol,
    mobileRow,
    index > 0 ? "tablet:border-l tablet:border-line-emphasis" : "",
    "tablet:border-b-0 tablet:border-r-0",
  ]
    .filter(Boolean)
    .join(" ");
}

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

export default function PlatformTabList({
  active,
  onActiveChange,
}: {
  active: number;
  onActiveChange: (index: number) => void;
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
      aria-label="Platform capabilities"
      className="platform-tablist relative grid w-full grid-cols-2 overflow-hidden rounded-md border border-line-emphasis bg-surface-inverse-raised tablet:grid-cols-4"
    >
      <div
        ref={indicatorRef}
        className="platform-tab-indicator pointer-events-none absolute z-0 will-change-[top,left,width,height]"
        aria-hidden
      />

      {pillars.map((pillar, index) => {
        const selected = index === active;

        return (
          <button
            key={pillar.id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onActiveChange(index)}
            className={`type-label relative z-10 flex h-14 cursor-pointer items-center justify-center px-24 text-center transition-colors ${tabBorderClass(index)} ${
              selected ? "text-on-inverse" : "text-on-inverse-muted hover:text-on-inverse"
            }`}
          >
            {pillar.eyebrow}
          </button>
        );
      })}
    </div>
  );
}
