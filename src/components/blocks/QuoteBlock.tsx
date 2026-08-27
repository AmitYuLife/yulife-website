import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import { cn } from "@/lib/utils";

export type QuoteBlockProps = {
  /** The pull quote, without surrounding quotation marks (added by the block). */
  quote: string;
  author: string;
  role: string;
  /** Optional avatar (asset path under /public). */
  avatar?: string;
  /** Optional partner / carrier logo, right-aligned in the author row. */
  partnerLogo?: { src: string; alt: string };
  className?: string;
};

/**
 * QuoteBlock — a bordered pull-quote card (Figma node 2520:10944). A serif h4
 * quote over an author lockup (avatar + name / role) with an optional partner
 * logo aligned to the far right. Static and prop-driven, so any page can drop in
 * a carrier or customer quote.
 *
 * Distinct from the inline quote in EverydayValueSection, which carries the
 * scroll-driven gradient comet and lives inside that section's emphasis rail.
 */
export default function QuoteBlock({
  quote,
  author,
  role,
  avatar,
  partnerLogo,
  className,
}: QuoteBlockProps) {
  return (
    <figure
      {...domSrc("QuoteBlock")}
      className={cn(
        "flex w-full flex-col gap-flow rounded-[var(--radius-sm)] border border-line-emphasis bg-surface-inverse-raised p-32 tablet:p-40 desktop:p-80",
        className,
      )}
    >
      <blockquote className="type-heading-h4 text-balance text-on-inverse">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="flex flex-wrap items-end justify-between gap-group">
        <div className="flex items-center gap-stack">
          {avatar && (
            <img
              src={assetPath(avatar)}
              alt=""
              width={64}
              height={64}
              className="size-[64px] shrink-0 rounded-full object-cover"
            />
          )}
          <div className="flex flex-col">
            <span className="type-body-lg font-bold text-on-inverse">{author}</span>
            <span className="type-body-lg text-on-inverse">{role}</span>
          </div>
        </div>
        {partnerLogo && (
          <img
            src={assetPath(partnerLogo.src)}
            alt={partnerLogo.alt}
            className="h-[32px] w-auto shrink-0"
          />
        )}
      </figcaption>
    </figure>
  );
}
