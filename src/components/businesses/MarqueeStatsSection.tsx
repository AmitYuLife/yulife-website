import LogoMarquee from "@/components/hero/LogoMarquee";
import StatCountCards, {
  type StatCountCardItem,
} from "@/components/businesses/StatCountCards";
import { domSrc } from "@/lib/domSrc";

export type MarqueeStatsContent = {
  stats: readonly StatCountCardItem[];
  /** Override the card grid, e.g. `desktop:grid-cols-3` for a three-stat row. */
  cardsClassName?: string;
};

/**
 * Businesses section 2 (Figma node 2495:7477) — the shared client-logo marquee
 * (both rows) over a row of odometer stat cards, on one raised-purple band with
 * a bottom divider. The marquee is the site-wide `LogoMarquee`; the cards are
 * the Businesses-specific `StatCountCards`.
 */
export default function MarqueeStatsSection({
  stats,
  cardsClassName,
}: MarqueeStatsContent) {
  return (
    <section
      {...domSrc("MarqueeStatsSection")}
      className="border-b border-line-emphasis bg-surface-inverse-raised"
      aria-label="Trusted by leading organisations"
    >
      <div className="flex flex-col items-center gap-block-gap pb-section-gap">
        <LogoMarquee />
        <div className="page-container flex w-full justify-center">
          <StatCountCards stats={stats} className={cardsClassName} />
        </div>
      </div>
    </section>
  );
}
