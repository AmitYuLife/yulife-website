import { MenuDropCol } from "./MenuDropCol";
import type { NavMenu } from "./menuContent";

export function NavMenuDrop({
  menu,
  onNavigate,
  labelledById,
}: {
  menu: NavMenu;
  onNavigate?: () => void;
  labelledById?: string;
}) {
  return (
    <div
      role="region"
      aria-label={`${menu.label} menu`}
      aria-labelledby={labelledById}
      className="flex w-full items-stretch justify-between divide-x divide-line-subtle bg-surface"
    >
      {menu.columns.map((column, index) => (
        <MenuDropCol key={index} column={column} onNavigate={onNavigate} />
      ))}
    </div>
  );
}

export default NavMenuDrop;
