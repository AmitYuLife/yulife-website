import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { MenuItemLink } from "./MenuItemLink";
import type { MenuDropColumn } from "./menuContent";

export function MenuDropCol({
  column,
  onNavigate,
}: {
  column: MenuDropColumn;
  onNavigate?: () => void;
}) {
  const isVariant2 = column.variant === "Variant2";
  const lastGroupIndex = column.groups.length - 1;

  return (
    <div
      className={cn(
        "flex flex-col gap-24 overflow-clip p-32",
        isVariant2
          ? "w-[409px] shrink-0 bg-surface-subtle"
          : "min-w-0 flex-[1_0_0] bg-surface",
      )}
    >
      <p className="type-caption text-surface-accent-purple">{column.label}</p>

      <div className="flex w-full items-start gap-16">
        {column.groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="flex min-w-0 flex-[1_0_0] flex-col gap-24"
          >
            {group.map((item) => (
              <MenuItemLink
                key={`${item.href}-${item.title}`}
                item={item}
                onNavigate={onNavigate}
              />
            ))}

            {isVariant2 && column.cta && groupIndex === lastGroupIndex && (
              <Button
                href={column.cta.href}
                onClick={onNavigate}
                size="sm"
                variant="solid"
                theme="onLight"
                className="self-start hover:translate-y-0"
              >
                {column.cta.label}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MenuDropCol;
