"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/design-system", label: "Overview" },
  { href: "/design-system/foundations", label: "Foundations" },
  { href: "/design-system/components", label: "Components" },
];

export default function SidebarNav() {
  const pathname = usePathname()?.replace(/\/$/, "") || "/design-system";

  return (
    <nav className="flex flex-col gap-stack">
      <div className="mb-8">
        <p className="type-label text-default">Design System</p>
        <p className="type-caption text-emphasis">Component workbench · dev only</p>
      </div>
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "type-nav-link rounded-sm px-16 py-8 transition-colors",
              active
                ? "bg-surface-inverse text-on-inverse"
                : "text-default hover:bg-surface-subtle",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
