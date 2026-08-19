import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import type { ClinicalExcellenceSection as ClinicalExcellenceData } from "@/data/pages/types";

/**
 * Clinical-benefits section for the Health product page (Figma node 2357:1512).
 *
 * A raised dark-purple panel (surface-inverse-raised, a step lighter than the
 * everyday-value section above it): a serif headline over a supporting
 * paragraph, then a grid of illustrated benefit callouts — a 120px spot
 * illustration, a bold title and a paragraph each. Three across on desktop,
 * two on tablet, one on mobile. Static, like the sibling CarrierQuoteSection —
 * spacing follows the standard section rhythm rather than pinning to the frame.
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

        {/* Illustrated benefit callouts */}
        <ul className="grid gap-x-section-gap gap-y-group sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <li key={card.title} className="flex flex-col gap-group">
              <img
                src={assetPath(card.icon)}
                alt={card.alt}
                width={120}
                height={120}
                className="h-30 w-auto self-start object-contain"
                loading="lazy"
              />
              <div className="flex flex-col gap-related">
                <h3 className="type-heading-h4 text-on-inverse">{card.title}</h3>
                <p className="type-body-lg text-on-inverse/90">{card.body}</p>
              </div>
            </li>
          ))}
        </ul>

        {footnote && (
          <p className="type-body-sm text-on-inverse/60">{footnote}</p>
        )}
      </div>
    </section>
  );
}
