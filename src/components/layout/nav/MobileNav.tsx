"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { home, isNavGroupActive, type NavGroup } from "@/data/sitemap";

import { LOGIN_MENU_ID, loginMenuItems, pageToMenuItem } from "./menuContent";
import { MenuItemLink } from "./MenuItemLink";
import { YuLifeLogo } from "./YuLifeLogo";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l4 4 4-4" />
    </svg>
  );
}

export function MobileNav({
  isOpen,
  onClose,
  primary,
  pathname,
  enabled,
}: {
  isOpen: boolean;
  onClose: () => void;
  primary: NavGroup[];
  pathname: string;
  enabled: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && enabled) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (!isOpen) setExpandedId(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [enabled, isOpen]);

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-surface transition-transform duration-[350ms]"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        pointerEvents: isOpen ? "auto" : "none",
        visibility: isOpen ? "visible" : "hidden",
        transitionTimingFunction: EASE,
      }}
      role="dialog"
      aria-modal={isOpen}
      aria-hidden={!isOpen}
      aria-label="Mobile navigation"
      inert={!isOpen}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-line px-16 py-12">
        <Link
          href={home.route}
          className="flex items-center text-default outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
          onClick={onClose}
          aria-label="YuLife home"
        >
          <YuLifeLogo />
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="-mr-4 p-4 text-default outline-none"
          aria-label="Close menu"
        >
          <svg
            className="size-24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.25}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-16 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {primary.map((group, groupIndex) => {
          const isExpanded = expandedId === group.id;
          const isCurrent = isNavGroupActive(group, pathname);

          return (
            <div
              key={group.id}
              className="border-b border-line"
              style={{
                animation: isOpen
                  ? `mobileNavSlideIn 400ms ${EASE} ${groupIndex * 50}ms both`
                  : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                className={`flex w-full items-center justify-between py-16 text-left text-default outline-none ${
                  isCurrent ? "opacity-100" : "opacity-90"
                }`}
              >
                <span className="type-heading-h5">{group.label}</span>
                <ChevronDown
                  className={`shrink-0 text-default/40 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-300"
                style={{
                  gridTemplateRows: isExpanded ? "1fr" : "0fr",
                  transitionTimingFunction: EASE,
                }}
              >
                <div className="overflow-hidden">
                  <div className="flex flex-col gap-8 pb-12 pt-4">
                    {group.pages.map((page) => (
                      <MenuItemLink
                        key={page.route}
                        item={pageToMenuItem(page)}
                        onNavigate={onClose}
                        className="px-8 py-12 hover:bg-surface-subtle"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div
          className="border-b border-line"
          style={{
            animation: isOpen
              ? `mobileNavSlideIn 400ms ${EASE} ${primary.length * 50}ms both`
              : undefined,
          }}
        >
          <button
            type="button"
            onClick={() => toggleSection(LOGIN_MENU_ID)}
            className="flex w-full items-center justify-between py-16 text-left text-default outline-none opacity-90"
          >
            <span className="type-heading-h5">Log in</span>
            <ChevronDown
              className={`shrink-0 text-default/40 transition-transform duration-200 ${
                expandedId === LOGIN_MENU_ID ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className="grid transition-[grid-template-rows] duration-300"
            style={{
              gridTemplateRows: expandedId === LOGIN_MENU_ID ? "1fr" : "0fr",
              transitionTimingFunction: EASE,
            }}
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-8 pb-12 pt-4">
                {loginMenuItems.map((item) => (
                  <MenuItemLink
                    key={item.href}
                    item={item}
                    onNavigate={onClose}
                    className="px-8 py-12 hover:bg-surface-subtle"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-line pt-20">
          <Button
            href="/contact"
            onClick={onClose}
            variant="outline"
            theme="onLight"
            className="w-full"
          >
            Speak to the team
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MobileNav;
