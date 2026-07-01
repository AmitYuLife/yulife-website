"use client";

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  home,
  isNavGroupActive,
  navGroups,
  type NavGroup,
  type Page,
} from "@/data/sitemap";

const CLOSE_DELAY = 180;
const MEGA_MENU_HIT_PADDING_Y = 12; // tolerance above/below panel
const MEGA_MENU_HIT_PADDING_X = 16; // tolerance beside panel
const TRANSITION_MS = 280;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const shortDesc: Record<string, string> = {
  "/products/health": "Complete health cover that goes beyond the basics",
  "/products/cash-plan": "Money back on everyday health costs",
  "/products/income-protection": "Income security when it matters most",
  "/products/life-insurance": "Group life cover with real engagement",
  "/products/dental-insurance": "High-visibility benefit employees use",
  "/products/wellbeing-platform": "Gamified wellbeing that drives daily engagement",
  "/who-we-help/businesses": "For HR leaders, People teams and business owners",
  "/who-we-help/carriers": "Commercial partnerships for insurance carriers",
  "/who-we-help/advisers": "Tools, support and differentiation for EB consultants",
  "/who-we-help/individuals": "For members who joined through work",
  "/resources/case-studies": "Real results from real companies",
  "/resources/blog": "Insights on health, benefits and culture",
  "/resources/news-events": "Latest from YuLife",
  "/resources/ebooks": "Deeper dives for decision-makers",
  "/about/about-us": "Our story, mission and values",
  "/about/careers": "Join the YuLife team",
  "/about/press": "Media resources and coverage",
  "/contact": "Get in touch with our team",
};

const routeIcon: Record<string, ReactNode> = {
  "/products/health": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  "/products/cash-plan": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  "/products/income-protection": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  "/products/life-insurance": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  "/products/dental-insurance": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  ),
  "/products/wellbeing-platform": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  "/who-we-help/businesses": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  "/who-we-help/carriers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21m-3.75 3H21" />
    </svg>
  ),
  "/who-we-help/advisers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  ),
  "/who-we-help/individuals": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  "/resources/case-studies": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  "/resources/blog": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  "/resources/news-events": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
  "/resources/ebooks": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  ),
  "/about/about-us": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  "/about/careers": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  ),
  "/about/press": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
    </svg>
  ),
  "/contact": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
};

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

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="14"
      viewBox="0 0 20 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M0 1h20M0 7h20M0 13h20" />
    </svg>
  );
}

function MenuItemCard({
  page,
  onNavigate,
}: {
  page: Page;
  onNavigate: () => void;
}) {
  const icon = routeIcon[page.route];
  const desc = shortDesc[page.route];

  return (
    <Link
      href={page.route}
      onClick={onNavigate}
      className="mega-menu-item group/item flex items-start gap-3.5 rounded-xl p-3 transition-colors duration-150 hover:bg-[var(--hero-mist,#f3f4f6)]"
    >
      <span className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--hero-mist,#f3f4f6)] text-[var(--hero-indigo,#6b7280)] transition-colors duration-150 group-hover/item:bg-white group-hover/item:text-[var(--hero-coral,#e8573a)] group-hover/item:shadow-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <span className="type-label font-semibold text-[var(--hero-ink,#1f2937)] group-hover/item:text-[var(--hero-coral,#e8573a)] transition-colors duration-150">
            {page.label}
          </span>
          {page.flag && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
              {page.flag === "orphan" ? "orphan" : "TBC"}
            </span>
          )}
        </span>
        {desc && (
          <span className="type-caption mt-0.5 block text-gray-500">
            {desc}
          </span>
        )}
      </span>
    </Link>
  );
}

function ProductsPanel({ onNavigate }: { onNavigate: () => void }) {
  const group = navGroups.find((g) => g.id === "products")!;
  const insurance = group.pages.filter(
    (p) => p.route !== "/products/wellbeing-platform",
  );
  const platform = group.pages.filter(
    (p) => p.route === "/products/wellbeing-platform",
  );

  return (
    <div className="grid grid-cols-[1fr_auto] gap-8">
      <div>
        <p className="type-micro mb-2 px-3 text-gray-400">
          Insurance
        </p>
        <div className="grid grid-cols-2 gap-0.5">
          {insurance.map((p) => (
            <MenuItemCard key={p.route} page={p} onNavigate={onNavigate} />
          ))}
        </div>
      </div>
      <div className="w-56 border-l border-gray-100 pl-6">
        <p className="type-micro mb-2 px-3 text-gray-400">
          Platform
        </p>
        {platform.map((p) => (
          <MenuItemCard key={p.route} page={p} onNavigate={onNavigate} />
        ))}
        <div className="mt-4 rounded-xl bg-gradient-to-br from-[var(--hero-mist,#f3f4f6)] to-[var(--hero-canvas,#fafaf9)] p-4">
          <p className="type-subheading text-[var(--hero-ink,#1f2937)]">
            Not sure which product?
          </p>
          <p className="type-caption mt-1 text-gray-500">
            Our team can help match the right cover for your business.
          </p>
          <Link
            href="/contact"
            onClick={onNavigate}
            className="type-label mt-3 inline-flex items-center gap-1 font-semibold text-[var(--hero-coral,#e8573a)] hover:underline"
          >
            Talk to us
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StandardPanel({
  groupId,
  columns = 2,
  onNavigate,
}: {
  groupId: string;
  columns?: 2 | 3;
  onNavigate: () => void;
}) {
  const group = navGroups.find((g) => g.id === groupId)!;

  return (
    <div
      className={`grid gap-0.5 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}
    >
      {group.pages.map((p) => (
        <MenuItemCard key={p.route} page={p} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

function MegaMenuPanelContent({
  groupId,
  onNavigate,
}: {
  groupId: string;
  onNavigate: () => void;
}) {
  if (groupId === "products") {
    return <ProductsPanel onNavigate={onNavigate} />;
  }

  return (
    <StandardPanel groupId={groupId} columns={2} onNavigate={onNavigate} />
  );
}

/* ─── Mobile navigation ─── */

function MobileNav({
  isOpen,
  onClose,
  primary,
  pathname,
}: {
  isOpen: boolean;
  onClose: () => void;
  primary: NavGroup[];
  pathname: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (!isOpen) setExpandedId(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-white transition-transform duration-[350ms] md:hidden"
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
      {/* Top bar — match site header spacing */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3">
        <Link
          href={home.route}
          className="flex items-center gap-1.5 outline-none"
          onClick={onClose}
        >
          <span
            className="grid h-9 place-items-center rounded-lg px-2 text-[1.05rem] font-bold lowercase leading-none text-white shadow-sm"
            style={{ backgroundColor: "var(--hero-pink, #e6248c)" }}
          >
            yu
          </span>
          <span
            className="text-[1.2rem] font-bold lowercase tracking-tight"
            style={{ color: "var(--hero-ink, #1b1340)" }}
          >
            life
          </span>
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="-mr-1 p-1 text-gray-500 outline-none"
          aria-label="Close menu"
        >
          <svg
            className="h-5 w-5"
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

      {/* Nav + CTA in one scrollable column */}
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        {primary.map((group, groupIndex) => {
          const isExpanded = expandedId === group.id;
          const isCurrent = isNavGroupActive(group, pathname);

          return (
            <div
              key={group.id}
              className="border-b border-gray-100"
              style={{
                animation: isOpen
                  ? `mobileNavSlideIn 400ms ${EASE} ${groupIndex * 50}ms both`
                  : undefined,
              }}
            >
              <button
                type="button"
                onClick={() => toggleSection(group.id)}
                className={`flex w-full items-center justify-between py-4 text-left outline-none ${
                  isCurrent
                    ? "text-[var(--hero-ink,#111827)]"
                    : "text-[var(--hero-ink,#1b1340)]"
                }`}
              >
                <span className="type-card-title">
                  {group.label}
                </span>
                <ChevronDown
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Grid accordion — expands to full content height (no clipped maxHeight) */}
              <div
                className="grid transition-[grid-template-rows] duration-300"
                style={{
                  gridTemplateRows: isExpanded ? "1fr" : "0fr",
                  transitionTimingFunction: EASE,
                }}
              >
                <div className="overflow-hidden">
                  <div className="pb-3">
                    {group.pages.map((page) => (
                      <Link
                        key={page.route}
                        href={page.route}
                        onClick={onClose}
                        className="flex items-center gap-3 rounded-lg px-2 py-3 text-gray-600 transition-colors hover:bg-[var(--hero-mist,#f3f4f6)] hover:text-[var(--hero-ink,#1f2937)]"
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[var(--hero-mist,#f3f4f6)] text-[var(--hero-indigo,#6b7280)]">
                          {routeIcon[page.route]}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="type-label font-medium">
                              {page.label}
                            </span>
                            {page.flag && (
                              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                                {page.flag === "orphan" ? "orphan" : "TBC"}
                              </span>
                            )}
                          </span>
                          {shortDesc[page.route] && (
                            <span className="type-caption mt-0.5 block text-gray-400">
                              {shortDesc[page.route]}
                            </span>
                          )}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-2 border-t border-gray-100 pt-5">
          <Link
            href="/contact"
            onClick={onClose}
            className="type-button block w-full rounded-full border-2 border-[var(--hero-ink,#1b1340)] py-3.5 text-center text-[var(--hero-ink,#1b1340)] transition-colors hover:bg-[var(--hero-mist,#f3f4f6)]"
          >
            Speak to the team
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Header ─── */

export default function HeaderHiFi() {
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
  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    width: number;
    /** Centre of the active trigger, measured from the page-container edge so
        the mega-menu arrow lines up regardless of where the nav sits in the bar. */
    arrowCenter: number;
  } | null>(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileMounted, setMobileMounted] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // On the homepage the nav is a solid deep-purple bar that reads as part of the
  // dark hero (white text, hairline divider). Everywhere else it stays light.
  const isHome = pathname === home.route;
  const darkNav = isHome;

  const navContainerRef = useRef<HTMLDivElement>(null);
  const headerInnerRef = useRef<HTMLDivElement>(null);
  const headerBarRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelContentRef = useRef<HTMLDivElement>(null);
  const leaveTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [headerBottom, setHeaderBottom] = useState(0);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Track scroll position to flip the homepage header from transparent → solid
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep mobile nav mounted during close animation, then remove from DOM
  useEffect(() => {
    if (mobileOpen) {
      setMobileMounted(true);
      return;
    }
    const timer = setTimeout(() => setMobileMounted(false), 350);
    return () => clearTimeout(timer);
  }, [mobileOpen]);

  // Safety: never leave scroll locked after mount/unmount
  useEffect(() => {
    setPortalReady(true);
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const measureHeaderBottom = useCallback(() => {
    if (!headerBarRef.current) return;
    setHeaderBottom(headerBarRef.current.getBoundingClientRect().bottom);
  }, []);

  useEffect(() => {
    measureHeaderBottom();
    window.addEventListener("resize", measureHeaderBottom);
    return () => window.removeEventListener("resize", measureHeaderBottom);
  }, [measureHeaderBottom]);

  useEffect(() => {
    if (isOpen) measureHeaderBottom();
  }, [isOpen, measureHeaderBottom]);

  const measureIndicator = useCallback((groupId: string) => {
    const btn = buttonRefs.current[groupId];
    const container = navContainerRef.current;
    const inner = headerInnerRef.current;
    if (!btn || !container) return;
    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    // The mega-menu panel/arrow live in a full-width page-container that shares
    // its left edge with the header's page-container, so anchor the arrow there.
    const innerRect = inner?.getBoundingClientRect() ?? cRect;
    setIndicatorStyle({
      left: bRect.left - cRect.left,
      width: bRect.width,
      arrowCenter: bRect.left + bRect.width / 2 - innerRect.left,
    });
  }, []);

  const measurePanel = useCallback(() => {
    const panel = panelContentRef.current;
    if (!panel) return;
    setPanelHeight(panel.offsetHeight);
  }, []);

  useEffect(() => {
    if (!activeId || !menuVisible) return;

    measurePanel();

    const panel = panelContentRef.current;
    if (!panel || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      measurePanel();
    });
    observer.observe(panel);

    return () => observer.disconnect();
  }, [activeId, menuVisible, measurePanel]);

  const handleEnter = useCallback(
    (groupId: string) => {
      clearTimeout(leaveTimeout.current);
      clearTimeout(closeTimeout.current);

      const wasOpen = isOpen;
      const switching =
        wasOpen && activeId !== null && activeId !== groupId;

      if (switching) {
        const prevIdx = primary.findIndex((g) => g.id === activeId);
        const nextIdx = primary.findIndex((g) => g.id === groupId);
        setSlideDirection(nextIdx > prevIdx ? 1 : -1);
        setHasTransitioned(true);
      } else if (!wasOpen) {
        setHasTransitioned(false);
      }

      setMenuVisible(true);
      setActiveId(groupId);
      setIsOpen(true);

      requestAnimationFrame(() => measureIndicator(groupId));
    },
    [activeId, isOpen, measureIndicator, primary],
  );

  const finishClose = useCallback(() => {
    setActiveId(null);
    setHasTransitioned(false);
    setIndicatorStyle(null);
    setMenuVisible(false);
    setPanelHeight(null);
  }, []);

  const startClose = useCallback(() => {
    if (!isOpen) return;
    setIsOpen(false);
    closeTimeout.current = setTimeout(finishClose, TRANSITION_MS);
  }, [isOpen, finishClose]);

  const handleLeave = useCallback(() => {
    if (!isOpen) return;
    leaveTimeout.current = setTimeout(startClose, CLOSE_DELAY);
  }, [isOpen, startClose]);

  const cancelLeave = useCallback(() => {
    clearTimeout(leaveTimeout.current);
    clearTimeout(closeTimeout.current);
  }, []);

  const handleMegaMenuZoneLeave = useCallback(
    (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null;
      const megaWrapper = e.currentTarget
        .closest(".mega-header")
        ?.querySelector(".mega-menu-wrapper");
      if (related && megaWrapper?.contains(related)) return;
      handleLeave();
    },
    [handleLeave],
  );

  const closeMenu = useCallback(() => {
    clearTimeout(leaveTimeout.current);
    clearTimeout(closeTimeout.current);
    startClose();
  }, [startClose]);

  const panelSlideVariant = slideDirection > 0 ? "Right" : "Left";

  return (
    <>
    <header
      className="mega-header sticky top-0 z-50"
      aria-hidden={mobileOpen ? true : undefined}
    >
      <div
        ref={headerBarRef}
        className={`relative transition-shadow duration-300 ${
          darkNav
            ? `border-b ${scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]" : ""}`
            : `md:backdrop-blur-xl ${menuVisible ? "bg-white" : "bg-white/80"}`
        }`}
        style={
          darkNav
            ? {
                backgroundColor: "var(--hero-purple, #290163)",
                borderBottomColor: "var(--hero-divider, rgba(105,83,243,0.4))",
              }
            : undefined
        }
      >
      <div
        ref={headerInnerRef}
        className="page-container flex items-center justify-between py-4"
      >
        {/* ─── Logo ─── */}
        <Link
          href={home.route}
          className="flex items-center gap-1.5 outline-none"
          onClick={closeMenu}
        >
          <span
            className="grid h-10 place-items-center rounded-lg px-2 text-[1.15rem] font-bold lowercase leading-none text-white shadow-sm"
            style={{ backgroundColor: "var(--hero-pink, #e6248c)" }}
          >
            yu
          </span>
          <span
            className="text-[1.35rem] font-bold lowercase tracking-tight transition-colors duration-300"
            style={{ color: darkNav ? "#fff" : "var(--hero-ink, #1b1340)" }}
          >
            life
          </span>
        </Link>

        {/* ─── Desktop cluster: nav + auth actions ─── */}
        <div className="hidden items-center gap-6 md:flex">
          <div ref={navContainerRef} className="relative">
            <nav
              className="flex items-center gap-2"
              aria-label="Primary"
              onMouseLeave={handleMegaMenuZoneLeave}
            >
              {primary.map((group) => {
                const isCurrent = isNavGroupActive(group, pathname);
                const isActive = activeId === group.id;

                return (
                  <button
                    key={group.id}
                    ref={(el) => {
                      buttonRefs.current[group.id] = el;
                    }}
                    type="button"
                    className={`font-body relative flex items-center gap-2 border-0 px-2 py-2 text-base outline-none transition-colors duration-150 focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${
                      darkNav
                        ? isActive || isCurrent
                          ? "text-white"
                          : "text-white/80 hover:text-white"
                        : isActive || isCurrent
                          ? "text-[var(--hero-ink,#111827)]"
                          : "text-gray-500 hover:text-gray-700"
                    }`}
                    onMouseEnter={() => handleEnter(group.id)}
                    aria-haspopup="true"
                    aria-expanded={isActive}
                  >
                    {group.label}
                    <ChevronDown
                      className={`transition-all duration-200 ${
                        isActive ? "translate-y-[1px] opacity-60" : "opacity-70"
                      }`}
                    />
                  </button>
                );
              })}
            </nav>

            {/* Sliding indicator */}
            {indicatorStyle && (
              <div
                className="pointer-events-none absolute bottom-0 h-[2px] rounded-full"
                style={{
                  left: indicatorStyle.left,
                  width: indicatorStyle.width,
                  backgroundColor: "var(--hero-pink, #e6248c)",
                  opacity: isOpen ? 1 : 0,
                  transition: hasTransitioned
                    ? `left ${TRANSITION_MS}ms ${EASE}, width ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}`
                    : `opacity ${TRANSITION_MS}ms ${EASE}`,
                }}
              />
            )}
          </div>

          {/* ─── Log in ─── */}
          <a
            href="https://app.yulife.com"
            className="font-body inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-base outline-none transition-colors duration-200"
            style={{
              borderColor: darkNav
                ? "rgba(255,255,255,0.55)"
                : "var(--hero-ink, #1b1340)",
              color: darkNav ? "#fff" : "var(--hero-ink, #1b1340)",
            }}
          >
            Log in
            <ChevronDown className="opacity-70" />
          </a>

          {/* ─── CTA ─── */}
          <Link
            href="/contact"
            onClick={closeMenu}
            className="font-body inline-flex items-center gap-2 rounded-lg px-4 py-2 text-base shadow-sm outline-none transition-all duration-200 hover:shadow-md hover:brightness-105"
            style={
              darkNav
                ? { backgroundColor: "#fff", color: "var(--hero-purple, #290163)" }
                : { backgroundColor: "var(--hero-pink, #e6248c)", color: "#fff" }
            }
          >
            Speak to our team
          </Link>
        </div>

        {/* ─── Mobile hamburger ─── */}
        <button
          type="button"
          className="-mr-1 p-1 outline-none transition-colors duration-300 md:hidden"
          style={{ color: darkNav ? "#fff" : "var(--hero-ink, #1b1340)" }}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(true)}
        >
          <HamburgerIcon />
        </button>
      </div>

      {/* ─── Mega menu dropdown (inside bar zone for unified hover) ─── */}
      <div
        className="mega-menu-wrapper absolute left-0 right-0 top-full hidden md:block"
        onMouseEnter={cancelLeave}
        onMouseLeave={handleLeave}
        style={{
          pointerEvents: menuVisible ? "auto" : "none",
          marginTop: -MEGA_MENU_HIT_PADDING_Y,
          paddingTop: MEGA_MENU_HIT_PADDING_Y,
          paddingBottom: MEGA_MENU_HIT_PADDING_Y * 2,
        }}
      >
        {/* Scrim */}
        <div
          className="fixed inset-x-0 bottom-0 bg-black/[0.04] backdrop-blur-[2px]"
          style={{
            top: headerBottom > 0 ? headerBottom : undefined,
            opacity: isOpen && headerBottom > 0 ? 1 : 0,
            pointerEvents: isOpen && headerBottom > 0 ? "auto" : "none",
            visibility:
              menuVisible && headerBottom > 0 ? "visible" : "hidden",
            transition: `opacity ${TRANSITION_MS}ms ease`,
          }}
          onClick={closeMenu}
        />

        <div
          className="page-container relative"
          style={{
            paddingLeft: MEGA_MENU_HIT_PADDING_X,
            paddingRight: MEGA_MENU_HIT_PADDING_X,
          }}
        >
          {/* Arrow */}
          {indicatorStyle && (
            <div
              className="absolute top-[2px] z-[2] h-3 w-3 -translate-x-1/2 rotate-45 rounded-tl-[2px] border-l border-t border-gray-200/60 bg-white"
              style={{
                left: indicatorStyle.arrowCenter,
                opacity: isOpen ? 1 : 0,
                transition: hasTransitioned
                  ? `left ${TRANSITION_MS}ms ${EASE}, opacity ${TRANSITION_MS}ms ${EASE}`
                  : `opacity ${TRANSITION_MS}ms ${EASE}`,
              }}
            />
          )}

          {/* Panel */}
          <div
            className="relative z-[1] mt-2 overflow-hidden rounded-2xl border border-gray-200/60 bg-white shadow-[0_24px_80px_-12px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.02)]"
            style={{
              opacity: isOpen ? 1 : 0,
              transform: isOpen
                ? "translateY(0) scale(1)"
                : "translateY(-6px) scale(0.98)",
              height:
                menuVisible && panelHeight !== null ? panelHeight : undefined,
              pointerEvents: isOpen ? "auto" : "none",
              visibility: menuVisible ? "visible" : "hidden",
              transition: `opacity ${TRANSITION_MS}ms ${EASE}, transform ${TRANSITION_MS}ms ${EASE}${panelHeight !== null ? `, height ${TRANSITION_MS}ms ${EASE}` : ""}`,
            }}
          >
            <div className="relative overflow-hidden">
              {activeId && (
                <div
                  key={activeId}
                  ref={panelContentRef}
                  className="mega-menu-panel p-6"
                  style={{
                    animation: hasTransitioned
                      ? `megaPanelEnter${panelSlideVariant} ${TRANSITION_MS}ms ${EASE} both`
                      : undefined,
                  }}
                >
                  <MegaMenuPanelContent
                    groupId={activeId}
                    onNavigate={closeMenu}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </header>

    {/* Mobile nav portaled to body — avoids backdrop-filter containing-block trap */}
    {portalReady &&
      mobileMounted &&
      createPortal(
        <MobileNav
          isOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          primary={primary}
          pathname={pathname}
        />,
        document.body,
      )}
    </>
  );
}
