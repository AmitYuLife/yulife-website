import { cn } from "@/lib/utils";

type SectionBlockProps = {
  block: string;
  label: string;
  flag?: string;
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  band?: boolean;
};

export default function SectionBlock({
  block,
  label,
  flag,
  children,
  className,
  innerClassName,
  band = false,
}: SectionBlockProps) {
  return (
    <section
      className={cn(
        "border-b border-gray-200",
        band ? "bg-gray-50" : "bg-white",
        className
      )}
      aria-labelledby={`block-${block}-label`}
    >
      <div className={cn("page-container py-12 md:py-16", innerClassName)}>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span
            id={`block-${block}-label`}
            className="rounded bg-gray-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white"
          >
            Block {block}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            {label}
          </span>
          {flag && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-medium text-amber-800">
              ⚠ {flag}
            </span>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}
