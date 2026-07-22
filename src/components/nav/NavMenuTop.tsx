"use client";

import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { home } from "@/data/sitemap";

import { LOGIN_MENU_ID, type NavMenu } from "./menuContent";
import { useNavCompactMode } from "./useNavCompactMode";
import { YuLifeLogo } from "./YuLifeLogo";

function HamburgerIcon() {
  return (
    <svg
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M0 1h20M0 7h20M0 13h20" />
    </svg>
  );
}

function DesktopNavCluster({
  menus,
  activeId,
  isOpen,
  panelId,
  onTriggerEnter,
  onTriggerToggle,
  onTriggerLeave,
  onNavigate,
  measureOnly = false,
}: {
  menus: NavMenu[];
  activeId: string | null;
  isOpen: boolean;
  panelId: string;
  onTriggerEnter: (id: string) => void;
  onTriggerToggle: (id: string) => void;
  onTriggerLeave: () => void;
  onNavigate: () => void;
  measureOnly?: boolean;
}) {
  return (
    <div className="flex shrink-0 flex-nowrap items-center gap-40">
      <div className="flex shrink-0 flex-nowrap items-center gap-8">
        {menus.map((menu) => {
          const isActive = isOpen && activeId === menu.id;
          return (
            <Button
              key={menu.id}
              size="sm"
              variant="solid"
              theme="onLight"
              trailingIcon
              tabIndex={measureOnly ? -1 : undefined}
              aria-hidden={measureOnly ? true : undefined}
              data-nav-trigger={measureOnly ? undefined : menu.id}
              aria-haspopup={measureOnly ? undefined : "true"}
              aria-expanded={measureOnly ? undefined : isActive}
              aria-controls={measureOnly ? undefined : panelId}
              onMouseEnter={
                measureOnly ? undefined : () => onTriggerEnter(menu.id)
              }
              onClick={
                measureOnly ? undefined : () => onTriggerToggle(menu.id)
              }
              className={`shrink-0 hover:translate-y-0 [&>svg]:transition-transform [&>svg]:duration-150 [&>svg]:ease-[cubic-bezier(0.55,0.05,1,0.8)] ${
                isActive ? "[&>svg]:rotate-180" : ""
              }`}
            >
              {menu.label}
            </Button>
          );
        })}
      </div>

      <div className="flex shrink-0 flex-nowrap items-center gap-16">
        <Button
          size="sm"
          variant="outline"
          theme="onDark"
          trailingIcon
          tabIndex={measureOnly ? -1 : undefined}
          aria-hidden={measureOnly ? true : undefined}
          data-nav-trigger={measureOnly ? undefined : LOGIN_MENU_ID}
          aria-haspopup={measureOnly ? undefined : "true"}
          aria-expanded={
            measureOnly ? undefined : isOpen && activeId === LOGIN_MENU_ID
          }
          aria-controls={measureOnly ? undefined : panelId}
          onMouseEnter={
            measureOnly ? undefined : () => onTriggerEnter(LOGIN_MENU_ID)
          }
          onClick={
            measureOnly ? undefined : () => onTriggerToggle(LOGIN_MENU_ID)
          }
          className={`shrink-0 hover:translate-y-0 [&>svg]:transition-transform [&>svg]:duration-150 [&>svg]:ease-[cubic-bezier(0.55,0.05,1,0.8)] ${
            isOpen && activeId === LOGIN_MENU_ID ? "[&>svg]:rotate-180" : ""
          }`}
        >
          Log in
        </Button>
        <Button
          href={measureOnly ? undefined : "/contact"}
          onClick={measureOnly ? undefined : onNavigate}
          onMouseEnter={measureOnly ? undefined : onTriggerLeave}
          variant="solid"
          theme="onDark"
          tabIndex={measureOnly ? -1 : undefined}
          aria-hidden={measureOnly ? true : undefined}
        >
          Speak to our team
        </Button>
      </div>
    </div>
  );
}

export function NavMenuTop({
  menus,
  activeId,
  isOpen,
  panelId,
  onTriggerEnter,
  onTriggerToggle,
  onTriggerLeave,
  onNavigate,
  onOpenMobile,
  mobileOpen,
  isCompactNav,
  onCompactChange,
}: {
  menus: NavMenu[];
  activeId: string | null;
  isOpen: boolean;
  panelId: string;
  onTriggerEnter: (id: string) => void;
  onTriggerToggle: (id: string) => void;
  onTriggerLeave: () => void;
  onNavigate: () => void;
  onOpenMobile: () => void;
  mobileOpen: boolean;
  isCompactNav: boolean;
  onCompactChange: (compact: boolean) => void;
}) {
  const { barRef, logoRef, probeRef } = useNavCompactMode(onCompactChange);

  return (
    <div
      ref={barRef}
      className="relative z-10 flex h-full w-full items-center justify-between p-16"
    >
      <Link
        ref={logoRef}
        href={home.route}
        onClick={onNavigate}
        aria-label="YuLife home"
        className="flex h-40 w-[76px] shrink-0 items-center text-on-inverse outline-none focus-visible:ring-2 focus-visible:ring-on-inverse focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      >
        <YuLifeLogo />
      </Link>

      {/* Width probe — same cluster as desktop nav, kept off-screen */}
      <div
        ref={probeRef}
        className="pointer-events-none invisible absolute top-0 left-[-9999px] flex w-max flex-nowrap whitespace-nowrap"
        aria-hidden="true"
      >
        <DesktopNavCluster
          menus={menus}
          activeId={activeId}
          isOpen={isOpen}
          panelId={panelId}
          onTriggerEnter={onTriggerEnter}
          onTriggerToggle={onTriggerToggle}
          onTriggerLeave={onTriggerLeave}
          onNavigate={onNavigate}
          measureOnly
        />
      </div>

      {!isCompactNav && (
        <DesktopNavCluster
          menus={menus}
          activeId={activeId}
          isOpen={isOpen}
          panelId={panelId}
          onTriggerEnter={onTriggerEnter}
          onTriggerToggle={onTriggerToggle}
          onTriggerLeave={onTriggerLeave}
          onNavigate={onNavigate}
        />
      )}

      {isCompactNav && (
        <button
          type="button"
          className="-mr-4 shrink-0 p-4 text-on-inverse outline-none"
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={onOpenMobile}
        >
          <HamburgerIcon />
        </button>
      )}
    </div>
  );
}

export default NavMenuTop;
