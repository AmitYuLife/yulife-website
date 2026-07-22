"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { navGroups } from "@/data/sitemap";

import {
  megaMenus,
  navMenus,
  type NavMenu,
} from "./nav/menuContent";
import { MobileNav } from "./nav/MobileNav";
import { NavMenuDrop } from "./nav/NavMenuDrop";
import { NavMenuTop } from "./nav/NavMenuTop";

const CLOSE_DELAY = 80;
const TOP_BAR_H = 72;
/** Air gap between the fixed pill and the settled dropdown. */
const DROP_GAP = 10;
/** Tuck under the pill — high enough to read as a layer behind the bar. */
const DROP_TUCK = TOP_BAR_H + DROP_GAP + 16;
/** Quick opacity fade masks the tucked origin on open. */
const OPEN_FADE_MS = 120;
/** Open — fade + slide down from behind the bar. */
const OPEN_MS = 120;
const OPEN_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Close — snappy exit. */
const CLOSE_MS = 80;
const CLOSE_EASE = "cubic-bezier(0.55, 0.05, 1, 0.85)";
/** Menu-to-menu content switch — Stripe/Linear pace. */
const SWITCH_MS = 120;
const SWITCH_EASE = "cubic-bezier(0.2, 0, 0, 1)";
const PANEL_ID = "nav-mega-menu-panel";


/* ─── Header ─── */

export default function Header() {
  const pathname = usePathname();
  const primary = useMemo(
    () => navGroups.filter((g) => g.tier === "primary"),
    [],
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [renderedMenu, setRenderedMenu] = useState<NavMenu | null>(null);
  const [exitingMenu, setExitingMenu] = useState<NavMenu | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | undefined>(
    undefined,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMounted, setMobileMounted] = useState(false);
  const [isCompactNav, setIsCompactNav] = useState(false);
  const [portalReady, setPortalReady] = useState(false);

  const stackRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const panelContentRef = useRef<HTMLDivElement>(null);
  const incomingRef = useRef<HTMLDivElement>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const switchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const triggerFocusRef = useRef<HTMLElement | null>(null);
  const isOpenRef = useRef(false);
  const renderedMenuRef = useRef<NavMenu | null>(null);
  const [pillBottom, setPillBottom] = useState(0);
  const [dropExpanded, setDropExpanded] = useState(false);
  const menuVisibleRef = useRef(false);

  const activeMenu = useMemo(
    () => megaMenus.find((m) => m.id === activeId) ?? null,
    [activeId],
  );

  // Keep a stable panel shell; cross-slide content when switching menus.
  useEffect(() => {
    if (!activeMenu) {
      clearTimeout(switchTimeout.current);
      renderedMenuRef.current = null;
      setRenderedMenu(null);
      setExitingMenu(null);
      setPanelHeight(undefined);
      return;
    }

    const prev = renderedMenuRef.current;
    if (prev && prev.id !== activeMenu.id && hasTransitioned) {
      clearTimeout(switchTimeout.current);
      setExitingMenu(prev);
      renderedMenuRef.current = activeMenu;
      setRenderedMenu(activeMenu);
      switchTimeout.current = setTimeout(() => {
        setExitingMenu(null);
      }, SWITCH_MS);
      return () => clearTimeout(switchTimeout.current);
    }

    renderedMenuRef.current = activeMenu;
    setRenderedMenu(activeMenu);
    setExitingMenu(null);
  }, [activeMenu, hasTransitioned]);

  // Match shell height to incoming content (animates between menus).
  useEffect(() => {
    if (!renderedMenu) return;
    const el = incomingRef.current;
    if (!el) return;
    const measure = () => setPanelHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [renderedMenu]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isCompactNav) {
      setMobileOpen(false);
    }
  }, [isCompactNav]);

  useEffect(() => {
    if (mobileOpen) {
      setMobileMounted(true);
      return;
    }
    const timer = setTimeout(() => setMobileMounted(false), 350);
    return () => clearTimeout(timer);
  }, [mobileOpen]);

  useEffect(() => {
    setPortalReady(true);
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const measureDropLayout = useCallback(() => {
    const bar = topBarRef.current;
    if (!bar) return;

    const bottomEl =
      menuVisibleRef.current && dropRef.current
        ? dropRef.current
        : topBarRef.current;
    if (bottomEl) {
      setPillBottom(bottomEl.getBoundingClientRect().bottom);
    }
  }, []);

  useEffect(() => {
    measureDropLayout();
    window.addEventListener("resize", measureDropLayout);
    window.addEventListener("scroll", measureDropLayout, { passive: true });
    return () => {
      window.removeEventListener("resize", measureDropLayout);
      window.removeEventListener("scroll", measureDropLayout);
    };
  }, [measureDropLayout]);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    menuVisibleRef.current = menuVisible;
  }, [menuVisible]);

  useEffect(() => {
    if (!menuVisible || !isOpen || !activeMenu || dropExpanded) return;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDropExpanded(true));
    });
    return () => cancelAnimationFrame(frame);
  }, [menuVisible, isOpen, activeMenu, dropExpanded]);

  useEffect(() => {
    if (!menuVisible) return;
    measureDropLayout();
  }, [menuVisible, activeId, measureDropLayout]);

  useEffect(() => {
    if (isOpen || menuVisible) {
      measureDropLayout();
      const id = window.setTimeout(
        measureDropLayout,
        isOpen ? OPEN_MS : CLOSE_MS,
      );
      return () => window.clearTimeout(id);
    }
  }, [isOpen, menuVisible, activeId, measureDropLayout]);

  const handleEnter = useCallback(
    (menuId: string) => {
      clearTimeout(leaveTimeout.current);
      clearTimeout(closeTimeout.current);

      const wasOpen = isOpenRef.current;
      const switching = wasOpen && activeId !== null && activeId !== menuId;

      if (switching) {
        const prevIdx = megaMenus.findIndex((m) => m.id === activeId);
        const nextIdx = megaMenus.findIndex((m) => m.id === menuId);
        setSlideDirection(nextIdx > prevIdx ? 1 : -1);
        setHasTransitioned(true);
        setDropExpanded(true);
      } else if (!wasOpen) {
        setHasTransitioned(false);
      }

      isOpenRef.current = true;
      setMenuVisible(true);
      setActiveId(menuId);
      setIsOpen(true);
      if (!wasOpen) {
        setDropExpanded(false);
      }
    },
    [activeId],
  );

  const finishClose = useCallback(() => {
    if (!menuVisibleRef.current) return;
    clearTimeout(closeTimeout.current);
    clearTimeout(switchTimeout.current);
    menuVisibleRef.current = false;
    isOpenRef.current = false;
    renderedMenuRef.current = null;
    setHasTransitioned(false);
    setDropExpanded(false);
    setMenuVisible(false);
    setActiveId(null);
    setRenderedMenu(null);
    setExitingMenu(null);
    setPanelHeight(undefined);
  }, []);

  const startClose = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    setIsOpen(false);
    setDropExpanded(false);
    clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(finishClose, CLOSE_MS + 32);
  }, [finishClose]);

  const handleLeave = useCallback(() => {
    if (!isOpenRef.current) return;
    leaveTimeout.current = setTimeout(startClose, CLOSE_DELAY);
  }, [startClose]);

  const cancelLeave = useCallback(() => {
    clearTimeout(leaveTimeout.current);
    // Re-open if the pointer re-enters while the close transition is running.
    if (!isOpenRef.current && menuVisible) {
      clearTimeout(closeTimeout.current);
      isOpenRef.current = true;
      setIsOpen(true);
      setDropExpanded(true);
    }
  }, [menuVisible]);

  const closeMenu = useCallback(
    (returnFocus = false) => {
      clearTimeout(leaveTimeout.current);
      clearTimeout(closeTimeout.current);
      startClose();
      if (returnFocus && triggerFocusRef.current) {
        triggerFocusRef.current.focus();
      }
    },
    [startClose],
  );

  useEffect(() => {
    if (isCompactNav && isOpen) {
      closeMenu();
    }
  }, [isCompactNav, isOpen, closeMenu]);

  const handleTriggerToggle = useCallback(
    (menuId: string) => {
      if (isOpen && activeId === menuId) {
        closeMenu();
        return;
      }
      const trigger = document.querySelector(
        `[data-nav-trigger="${menuId}"]`,
      ) as HTMLElement | null;
      triggerFocusRef.current = trigger;
      handleEnter(menuId);
    },
    [activeId, closeMenu, handleEnter, isOpen],
  );

  // Esc closes the mega menu and returns focus to the trigger
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeMenu(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeMenu]);

  const panelSlideVariant = slideDirection > 0 ? "Right" : "Left";
  const motionMs = isOpen ? OPEN_MS : CLOSE_MS;
  const motionEase = isOpen ? OPEN_EASE : CLOSE_EASE;

  return (
    <>
      <header
        className="mega-header sticky top-0 z-50"
        aria-hidden={mobileOpen ? true : undefined}
      >
        <div className="nav-container relative pt-16">
          {/*
            In-flow spacer = top bar only. Dropdown is absolutely positioned
            behind the top-bar pill and translates independently — the pill
            never changes shape or border-radius.
          */}
          <div className="relative overflow-visible">
            <div className="h-[72px]" aria-hidden="true" />

            <div
              ref={stackRef}
              className="absolute inset-x-0 top-0 isolate overflow-visible"
              onMouseEnter={cancelLeave}
              onMouseLeave={handleLeave}
            >
              {/*
                Top bar — always paints above the dropdown (z-20 vs z-0).
              */}
              <div
                ref={topBarRef}
                className="relative z-20 h-[72px] rounded-md border border-line-subtle bg-surface-inverse shadow-[0_8px_20px_rgb(0_0_0/0.25)] [transform:translateZ(0)]"
              >
                <div className="h-full overflow-hidden rounded-[inherit]">
                  <NavMenuTop
                    menus={navMenus}
                    activeId={activeId}
                    isOpen={isOpen}
                    panelId={PANEL_ID}
                    onTriggerEnter={handleEnter}
                    onTriggerToggle={handleTriggerToggle}
                    onTriggerLeave={handleLeave}
                    onNavigate={() => closeMenu()}
                    onOpenMobile={() => setMobileOpen(true)}
                    mobileOpen={mobileOpen}
                    isCompactNav={isCompactNav}
                    onCompactChange={setIsCompactNav}
                  />
                </div>
              </div>

              {/*
                Dropdown clip well — overlaps the pill (z-0). Motion layer
                fades in and slides down from a tucked position under the bar.
              */}
              <div
                ref={dropRef}
                id={PANEL_ID}
                data-expanded={dropExpanded ? "true" : "false"}
                className={`absolute inset-x-0 top-0 z-0 overflow-visible pt-[72px] ${isCompactNav ? "hidden" : "block"}`}
                style={{
                  pointerEvents: isOpen ? "auto" : "none",
                  visibility: menuVisible ? "visible" : "hidden",
                  ["--mega-drop-tuck" as string]: `${DROP_TUCK}px`,
                  ["--mega-open-fade-ms" as string]: `${OPEN_FADE_MS}ms`,
                  ["--mega-open-ms" as string]: `${OPEN_MS}ms`,
                  ["--mega-close-ms" as string]: `${CLOSE_MS}ms`,
                }}
                aria-hidden={!isOpen}
              >
                <div className="mega-menu-drop-motion">
                  <div
                    className="shrink-0"
                    style={{ height: DROP_GAP }}
                    aria-hidden="true"
                  />
                  {renderedMenu && (
                    <div
                      ref={panelContentRef}
                      data-switching={exitingMenu ? "true" : "false"}
                      className="mega-menu-panel overflow-hidden rounded-md border border-line-subtle bg-surface shadow-[0_16px_32px_rgb(0_0_0/0.18)]"
                      style={{
                        height: panelHeight,
                        ["--mega-switch-ms" as string]: `${SWITCH_MS}ms`,
                      }}
                    >
                      <div className="relative">
                        {exitingMenu && (
                          <div
                            className="mega-menu-switch-layer absolute inset-x-0 top-0"
                            style={{
                              animation: `megaPanelExit${panelSlideVariant} ${SWITCH_MS}ms ${SWITCH_EASE} both`,
                              pointerEvents: "none",
                            }}
                            aria-hidden="true"
                          >
                            <NavMenuDrop menu={exitingMenu} />
                          </div>
                        )}
                        <div
                          key={renderedMenu.id}
                          ref={incomingRef}
                          className="mega-menu-switch-layer relative"
                          style={{
                            animation: exitingMenu
                              ? `megaPanelEnter${panelSlideVariant} ${SWITCH_MS}ms ${SWITCH_EASE} both`
                              : undefined,
                          }}
                        >
                          <NavMenuDrop
                            menu={renderedMenu}
                            onNavigate={() => closeMenu()}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Invisible bridge across the pill↔panel gap for hover continuity */}
              {isOpen && (
                <div
                  className="absolute inset-x-0 z-[15]"
                  style={{ top: TOP_BAR_H, height: DROP_GAP }}
                  aria-hidden="true"
                />
              )}
            </div>
          </div>

          {/* Scrim — desktop only, below the visible menu stack */}
          <div
            className={`fixed inset-x-0 bottom-0 z-40 bg-black/[0.04] backdrop-blur-[2px] ${isCompactNav ? "hidden" : "block"}`}
            style={{
              top: pillBottom > 0 ? pillBottom : undefined,
              opacity: isOpen && pillBottom > 0 ? 1 : 0,
              pointerEvents: isOpen && pillBottom > 0 ? "auto" : "none",
              visibility: menuVisible && pillBottom > 0 ? "visible" : "hidden",
              transition: `opacity ${motionMs}ms ${motionEase}`,
            }}
            onClick={() => closeMenu()}
            aria-hidden="true"
          />
        </div>
      </header>

      {portalReady &&
        mobileMounted &&
        createPortal(
          <MobileNav
            isOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            primary={primary}
            pathname={pathname}
            enabled={isCompactNav}
          />,
          document.body,
        )}
    </>
  );
}
