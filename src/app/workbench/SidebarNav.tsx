"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "workbench:sidebar-collapsed";

const LINKS = [
  {
    href: "/workbench",
    label: "Overview",
    icon: (
      <path d="M3 10.5 12 4l9 6.5M5 9.5V19a1 1 0 0 0 1 1h4v-5h4v5h4a1 1 0 0 0 1-1V9.5" />
    ),
  },
  {
    href: "/workbench/foundations",
    label: "Foundations",
    icon: <path d="M4 20h16M6 20V10l6-6 6 6v10M10 20v-6h4v6" />,
  },
  {
    href: "/workbench/components",
    label: "Components",
    icon: (
      <>
        <rect x="4" y="4" width="7" height="7" rx="1" />
        <rect x="13" y="4" width="7" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    href: "/workbench/blocks",
    label: "Blocks",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="7" rx="1" />
        <rect x="4" y="13" width="7" height="7" rx="1" />
        <rect x="13" y="13" width="7" height="7" rx="1" />
      </>
    ),
  },
  {
    href: "/workbench/sections",
    label: "Sections",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="5" rx="1" />
        <rect x="4" y="11" width="16" height="4" rx="1" />
        <rect x="4" y="17" width="16" height="3" rx="1" />
      </>
    ),
  },
  {
    href: "/workbench/app",
    label: "App",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2" />
        <path d="M10.5 18.5h3" />
      </>
    ),
  },
];

export default function SidebarNav() {
  const pathname = usePathname()?.replace(/\/$/, "") || "/workbench";
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(STORAGE_KEY) === "1");
    setHydrated(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "hidden shrink-0 overflow-y-auto border-r border-line bg-surface py-32 transition-[width] duration-150 md:block",
        collapsed ? "w-[64px] px-8" : "w-[188px] px-16",
        !hydrated && "invisible",
      )}
    >
      <nav className="flex flex-col gap-stack">
        <div className={cn("mb-8 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <div>
              <p className="type-label text-default">Workbench</p>
              <p className="type-caption text-emphasis">Dev only</p>
            </div>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={collapsed}
            className="flex size-32 shrink-0 items-center justify-center rounded-sm text-emphasis transition-colors hover:bg-surface-subtle hover:text-default"
          >
            <svg viewBox="0 0 24 24" className="size-16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
            </svg>
          </button>
        </div>
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              title={collapsed ? link.label : undefined}
              className={cn(
                "type-nav-link flex items-center gap-inline rounded-sm py-8 transition-colors",
                collapsed ? "justify-center px-8" : "px-16",
                active
                  ? "bg-surface-inverse text-on-inverse"
                  : "text-default hover:bg-surface-subtle",
              )}
            >
              <svg viewBox="0 0 24 24" className="size-16 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {link.icon}
              </svg>
              {!collapsed && <span>{link.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
