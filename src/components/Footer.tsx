import Link from "next/link";
import { navGroups } from "@/data/sitemap";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-300 bg-gray-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        {navGroups.map((group) => (
          <div key={group.id}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {group.label}
            </h2>
            <ul className="space-y-2 text-sm">
              {group.pages.map((p) => (
                <li key={p.route}>
                  <Link href={p.route} className="text-gray-700 hover:text-gray-900">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 px-4 py-4 text-center text-xs text-gray-400">
        YuLife 2026 — wireframe skeleton. Structure only; not for publication. ·{" "}
        <Link href="/sitemap" className="underline hover:text-gray-600">
          View sitemap
        </Link>
      </div>
    </footer>
  );
}
