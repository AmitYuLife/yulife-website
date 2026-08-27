import { assetPath } from "@/lib/assetPath";
import { domSrc } from "@/lib/domSrc";
import type { Quote } from "@/data/pages/types";

/**
 * Carrier testimonial that sits directly under the product hero (Figma
 * node 2319:3589). A raised dark band — surface-inverse-raised is a step
 * lighter than the hero's surface-inverse — carrying a centred lockup:
 * optional 80px headshot, the quote set in italic serif (H3), then the
 * attribution in bold body. Spacing is the standard section rhythm
 * (section-y block padding, section-gap between the three items), so it
 * scales with the rest of the page rather than pinning to the 1920 frame.
 */
export default function CarrierQuoteSection({ quote }: { quote: Quote }) {
  return (
    <section
      {...domSrc("CarrierQuoteSection")}
      className="border-b border-line-emphasis bg-surface-inverse-raised"
    >
      <figure className="page-container-wide section-y flex flex-col items-center gap-section-gap text-center">
        {quote.avatar && (
          <div className="size-80 shrink-0 overflow-hidden rounded-full">
            <img
              src={assetPath(quote.avatar)}
              alt=""
              width={80}
              height={80}
              className="size-full object-cover"
            />
          </div>
        )}
        <blockquote className="type-heading-h3 max-w-[1216px] text-balance italic text-on-inverse">
          &ldquo;{quote.text}&rdquo;
        </blockquote>
        <figcaption className="type-body-lg font-bold text-on-inverse">
          {quote.author} · {quote.role}
        </figcaption>
      </figure>
    </section>
  );
}
