import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A uniform frame around one catalog item in the design-system workbench: a
 * header strip (name · optional note · source path) over a padded stage. Purely
 * presentational — it never touches the component it wraps, so what you see is
 * the real component rendering itself.
 *
 * `tone="dark"` gives the stage an inverse surface for components designed to
 * sit on dark backgrounds (the stat columns, reveal cards, accordion).
 */
export function Specimen({
  name,
  source,
  note,
  tone = "light",
  padded = true,
  children,
}: {
  name: string;
  source?: string;
  note?: string;
  tone?: "light" | "dark";
  padded?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-md border border-line">
      <header className="flex flex-wrap items-baseline justify-between gap-controls border-b border-line bg-surface-subtle px-16 py-12">
        <div className="flex flex-wrap items-baseline gap-controls">
          <h3 className="type-label text-default">{name}</h3>
          {note && <p className="type-caption text-emphasis">{note}</p>}
        </div>
        {source && <code className="type-caption text-emphasis">{source}</code>}
      </header>
      <div
        className={cn(
          padded && "p-32",
          tone === "dark" ? "bg-surface-inverse" : "bg-surface",
        )}
      >
        {children}
      </div>
    </section>
  );
}

export default Specimen;
