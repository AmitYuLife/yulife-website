import type { ComponentPropsWithoutRef } from "react";

/**
 * The framed content card that sits above the Yunity star. A raised,
 * hairline-bordered panel (Figma "SectionCard") that overlays the connecting
 * roots — the signal lines run behind it, entering the top edge and re-emerging
 * at the bottom to converge on the star. Kept generic so other bands can reuse
 * the same frame; forwards div props so callers can attach `data-reveal` etc.
 */
export default function SectionCard({
  children,
  className = "",
  ...rest
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...rest}
      className={`relative z-10 flex w-full max-w-[1216px] flex-col items-center justify-center rounded-md border border-line-emphasis bg-surface-inverse-raised p-32 tablet:p-40 desktop:p-80 ${className}`}
    >
      {children}
    </div>
  );
}
