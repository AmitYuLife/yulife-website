import { domSrc } from "@/lib/domSrc";
import { surfaceData } from "@/lib/surface";
import RevealCardGrid from "@/components/blocks/RevealCardGrid";
import type { ClinicalExcellenceSection as ClinicalExcellenceData } from "@/data/pages/types";

/**
 * Clinical-benefits section for the Health product page (Figma node 2357:1512).
 *
 * A raised dark-purple panel (surface-inverse-raised, a step lighter than the
 * inverse everyday-value section above it): a serif headline over a supporting
 * paragraph, then a bordered `RevealCardGrid` of illustrated benefit
 * callouts — hover (or tap/keyboard on touch) a card to slide up and reveal
 * its body copy, the same reveal as the Proven ROI stat columns. Three
 * across on desktop, two on tablet, one on mobile. Spacing follows the
 * standard section rhythm rather than pinning to the frame.
 */
export default function ClinicalExcellenceSection({
  data,
  surface = "inverse-raised",
}: {
  data: ClinicalExcellenceData;
  /** Section background. Defaults to raised; the Health page runs it dark so the
   *  page's dark/raised alternation stays correct. */
  surface?: "inverse" | "inverse-raised";
}) {
  const { eyebrow, heading, accent, body, cards, footnote } = data;
  const accentAt = accent ? heading.indexOf(accent) : -1;
  // A heading with explicit "\n" break points controls its own wrap, so drop
  // the soft-wrap width clamp and honour the breaks; otherwise keep the default
  // 18ch balance used by the product-page headings.
  const headingWrapClass = heading.includes("\n")
    ? "whitespace-pre-line"
    : "max-w-[18ch] text-balance";
  const bgClass =
    surface === "inverse-raised" ? "bg-surface-inverse-raised" : "bg-surface-inverse";

  return (
    <section
      {...domSrc("ClinicalExcellenceSection")}
      {...surfaceData(surface)}
      className={`border-b border-line-emphasis ${bgClass}`}
    >
      <div className="page-container-wide section-y-lg flex flex-col gap-section-gap">
        {/* Header — eyebrow + serif H2 grouped tight, then the supporting paragraph */}
        <header className="flex flex-col gap-flow">
          <div className="flex flex-col gap-related">
            {eyebrow && (
              <p className="type-eyebrow uppercase text-accent-purple">{eyebrow}</p>
            )}
            <h2 className={`type-heading-h2 text-on-inverse ${headingWrapClass}`}>
              {accentAt !== -1 ? (
                <>
                  {heading.slice(0, accentAt)}
                  <em className="italic">{accent}</em>
                  {heading.slice(accentAt + accent!.length)}
                </>
              ) : (
                heading
              )}
            </h2>
          </div>
          {body && (
            <p className="type-body-lg max-w-[62ch] text-balance text-on-inverse/85">
              {body}
            </p>
          )}
        </header>

        {/* Illustrated benefit callouts — hover (or tap) a card to reveal
            its body copy. */}
        <RevealCardGrid items={cards} />

        {footnote && (
          <p className="type-body-sm text-on-inverse/60">{footnote}</p>
        )}
      </div>
    </section>
  );
}
