import { domSrc } from "@/lib/domSrc";
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
}: {
  data: ClinicalExcellenceData;
}) {
  const { eyebrow, heading, body, cards, footnote } = data;

  return (
    <section
      {...domSrc("ClinicalExcellenceSection")}
      className="border-b border-line-emphasis bg-surface-inverse-raised"
    >
      <div className="page-container-wide section-y-lg flex flex-col gap-section-gap">
        {/* Header — eyebrow / serif H2 / supporting paragraph */}
        <header className="flex flex-col gap-flow">
          <p className="type-eyebrow uppercase text-on-inverse">{eyebrow}</p>
          <h2 className="type-heading-h2 max-w-[18ch] text-balance text-on-inverse">
            {heading}
          </h2>
          <p className="type-body-lg max-w-[62ch] text-balance text-on-inverse/85">
            {body}
          </p>
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
