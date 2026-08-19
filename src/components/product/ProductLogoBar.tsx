import LogoMarquee from "@/components/hero/LogoMarquee";
import { domSrc } from "@/lib/domSrc";

/**
 * Dark logo band directly beneath the product hero. Mirrors the homepage
 * marquee treatment (scrolling logos, edge fade, dark canvas) but a single
 * row. Reuses the homepage's top row for now — per-product logo sets come
 * later. `border-b` closes the dark band before the first light section; the
 * line above it is the hero's own `border-b`, matching the homepage pattern.
 */
export default function ProductLogoBar() {
  return (
    <section
      {...domSrc("ProductLogoBar")}
      className="hero-dark border-b border-line-emphasis"
      style={{ backgroundColor: "var(--hero-canvas)" }}
    >
      <LogoMarquee rowCount={1} />
    </section>
  );
}
