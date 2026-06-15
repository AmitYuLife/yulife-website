"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { home, isNavGroupActive, navGroups } from "@/data/sitemap";

export default function Header() {
  const pathname = usePathname();
  const primary = navGroups.filter((g) => g.tier === "primary");

  return (
    <header className="border-b border-gray-300 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href={home.route} className="flex items-center gap-2 font-bold text-gray-900">
          <span className="grid h-8 w-8 place-items-center rounded bg-gray-900 text-xs text-white">
            YL
          </span>
          <span>YuLife</span>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
            Wireframe
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {primary.map((group) => (
            <div key={group.id} className="group relative">
              <button
                type="button"
                className={`rounded px-3 py-2 text-sm font-medium hover:bg-gray-100 ${
                  isNavGroupActive(group, pathname) ? "text-gray-900" : "text-gray-600"
                }`}
                aria-haspopup="true"
                aria-expanded="false"
              >
                {group.label}
              </button>
              <div className="invisible absolute left-0 top-full z-10 min-w-[260px] rounded-md border border-gray-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                {group.pages.map((p) => (
                  <Link
                    key={p.route}
                    href={p.route}
                    className="flex items-center justify-between gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <span>{p.label}</span>
                    {p.flag && (
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase text-amber-700">
                        {p.flag === "orphan" ? "orphan" : "TBC"}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <Link
          href="/contact"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
        >
          Speak to our team
        </Link>
      </div>
    </header>
  );
}
