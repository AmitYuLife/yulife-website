import Link from "next/link";
import { getNavGroupForPage, navGroups, type Page } from "@/data/sitemap";

const flagCopy = {
  "under-consideration":
    "In the agreed IA but not yet confirmed as its own page — keep or fold in (decision needed).",
  orphan:
    "Approved copy exists in the content doc, but this page has no agreed home in the 'Revised' IA. Confirm whether it belongs here.",
} as const;

type PageStubProps = {
  page: Page;
  groupId: string;
};

export default function PageStub({ page, groupId }: PageStubProps) {
  const group = getNavGroupForPage(page.route) ?? navGroups.find((g) => g.id === groupId);
  const approved = page.copyStatus === "approved";

  return (
    <section className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gray-800">
          Home
        </Link>
        {group && (
          <>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{group.label}</span>
          </>
        )}
        <span className="mx-2">/</span>
        <span className="text-gray-800">{page.label}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            approved ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${approved ? "bg-emerald-500" : "bg-gray-400"}`}
          />
          {approved ? "Approved copy available" : "No copy yet — stub only"}
        </span>
        {approved && page.copySource && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
            Source: “{page.copySource}” (2026 content doc)
          </span>
        )}
        {page.flag && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            {page.flag === "orphan" ? "⚠ Orphan — not in agreed IA" : "⚠ Under consideration"}
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">{page.label}</h1>
      <div className="mt-3 rounded-lg border-l-4 border-gray-300 bg-gray-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Page purpose</p>
        <p className="mt-1 text-sm text-gray-700">{page.purpose}</p>
      </div>

      {page.flag && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Open decision:</strong> {flagCopy[page.flag]}
        </div>
      )}

      <div className="mt-10 space-y-6" aria-hidden="true">
        <div className="wf-block rounded-xl border border-gray-200 p-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Section: Hero
          </p>
          <div className="wf-line mb-3 h-7 w-2/3" />
          <div className="wf-line mb-2 h-4 w-1/2" />
          <div className="mt-5 flex gap-3">
            <div className="h-9 w-32 rounded-md bg-gray-300" />
            <div className="h-9 w-28 rounded-md border border-gray-300 bg-white" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((n) => (
            <div key={n} className="wf-block rounded-xl border border-gray-200 p-6">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Section: Content {n}
              </p>
              <div className="wf-line mb-2 h-5 w-1/2" />
              <div className="wf-line mb-2 h-3 w-full" />
              <div className="wf-line mb-2 h-3 w-5/6" />
              <div className="wf-line h-3 w-2/3" />
            </div>
          ))}
        </div>

        <div className="wf-block rounded-xl border border-gray-200 p-6">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Section: Stats / social proof
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-lg bg-white/60 p-4 text-center">
                <div className="wf-line mx-auto mb-2 h-8 w-16" />
                <div className="wf-line mx-auto h-3 w-24" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Section: Final CTA
          </p>
          <div className="wf-line mx-auto mb-4 h-6 w-1/3" />
          <div className="mx-auto h-10 w-40 rounded-md bg-gray-300" />
        </div>
      </div>
    </section>
  );
}
