import type { Metadata } from "next";
import type { ReactNode } from "react";
import SidebarNav from "./SidebarNav";

export const metadata: Metadata = {
  title: "Design System",
  robots: { index: false, follow: false },
};

/**
 * The design-system workbench is a dev-only tool. Two safeguards keep it off the
 * public site:
 *  1. `next build` strips `out/design-system` when GITHUB_PAGES=true (see the
 *     build script in package.json — the Actions deploy sets that flag).
 *  2. This guard: during a Pages build the route renders nothing meaningful.
 * Together they mean a stray deploy can't expose a half-built tool.
 *
 * The site's root layout wraps every route in the marketing Header/Footer. A
 * nested layout can't remove a parent layout, so the workbench sits in a
 * fixed, full-viewport overlay that covers that chrome — a contained choice
 * that needs no site-wide refactor.
 */
export default function DesignSystemLayout({ children }: { children: ReactNode }) {
  if (process.env.GITHUB_PAGES === "true") {
    return (
      <div className="page-container py-64">
        <p className="type-body-md text-default">
          The design-system workbench is a development-only tool and is not
          available on the published site.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-surface text-default">
      <aside className="hidden w-[260px] shrink-0 overflow-y-auto border-r border-line bg-surface px-24 py-32 md:block">
        <SidebarNav />
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
