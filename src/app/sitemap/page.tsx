import type { Metadata } from "next";
import Link from "next/link";
import { allPages, home, navGroups } from "@/data/sitemap";

export const metadata: Metadata = {
  title: "Sitemap",
  description: "Information architecture for the YuLife 2026 website redesign.",
};

export default function SitemapPage() {
  const approvedCount = allPages.filter((p) => p.copyStatus === "approved").length;
  const total = allPages.length;
  const primary = navGroups.filter((g) => g.tier === "primary");
  const secondary = navGroups.filter((g) => g.tier === "secondary");

  return (
    <section className="page-container py-10">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sitemap</h1>
      <p className="mt-2 max-w-2xl text-gray-600">
        The agreed information architecture from the “Revised” frame. {approvedCount} of {total}{" "}
        pages have approved copy in the 2026 content doc.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
          Approved copy
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
          No copy yet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-amber-600">⚠</span> Open decision
        </span>
      </div>

      <div className="mt-8">
        <Link
          href={home.route}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 font-semibold text-gray-900"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Home
        </Link>
      </div>

      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Primary navigation
      </h2>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {primary.map((group) => (
          <div key={group.id} className="rounded-xl border border-gray-200">
            <div className="border-b border-gray-100 px-4 py-3">
              <span className="font-semibold text-gray-900">{group.label}</span>
              <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-gray-400">
                nav only
              </span>
            </div>
            <ul className="divide-y divide-gray-50">
              {group.pages.map((p) => (
                <li key={p.route}>
                  <Link
                    href={p.route}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          p.copyStatus === "approved" ? "bg-emerald-500" : "bg-gray-300"
                        }`}
                      />
                      <span className="text-gray-700">{p.label}</span>
                    </span>
                    {p.flag && (
                      <span className="text-amber-600" title={p.flag}>
                        ⚠
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-wide text-gray-400">
        Secondary navigation — {secondary[0].label}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {secondary[0].pages.map((p) => (
          <Link
            key={p.route}
            href={p.route}
            className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  p.copyStatus === "approved" ? "bg-emerald-500" : "bg-gray-300"
                }`}
              />
              <span className="text-gray-700">{p.label}</span>
            </span>
            {p.flag && (
              <span className="text-amber-600" title={p.flag}>
                ⚠
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
