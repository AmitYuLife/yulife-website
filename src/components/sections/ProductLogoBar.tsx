import LogoMarquee from "@/components/patterns/LogoMarquee";
import { domSrc } from "@/lib/domSrc";

/**
 * Logo band directly beneath the product hero. Mirrors the homepage marquee
 * treatment (scrolling logos, edge fade, both rows), and sits on the raised
 * purple (`surface-inverse-raised`) between the inverse hero above and the
 * inverse section below — its own step in the section alternation. Reuses
 * the homepage's logo sets for now — per-product logo sets come later. The
 * marquee's edge fade is a transparency mask, so it fades into whichever band
 * colour sits behind it. `border-b` closes the band before the next section;
 * the line above it is the hero's own `border-b`.
 */
export default function ProductLogoBar() {
  return (
    <section
      {...domSrc("ProductLogoBar")}
      className="border-b border-line-emphasis bg-surface-inverse-raised"
    >
      <LogoMarquee />
    </section>
  );
}
