import Link from "next/link";

import { cn } from "@/lib/utils";

import type { MenuItem } from "./menuContent";
import { routeIcons } from "./routeIcons";

export function MenuItemLink({
  item,
  onNavigate,
  className,
}: {
  item: MenuItem;
  onNavigate?: () => void;
  className?: string;
}) {
  const icon = routeIcons[item.href];
  const isExternal = item.href.startsWith("http");

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group/item flex w-full items-start gap-12 rounded-sm outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
        className,
      )}
    >
      {icon && (
        <span className="flex size-32 shrink-0 items-center justify-center rounded-sm bg-surface-subtle text-emphasis">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex flex-col gap-8">
        <span className="type-nav-link text-on-inverse-muted transition-colors duration-150 group-hover/item:text-emphasis">
          {item.title}
        </span>
        {item.description && (
          <span className="type-caption text-default">{item.description}</span>
        )}
      </span>
    </Link>
  );
}

export default MenuItemLink;
