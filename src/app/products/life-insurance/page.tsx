import type { Metadata } from "next";
import PageStub from "@/components/PageStub";
import FaqSection from "@/components/product/FaqSection";
import { lifeInsuranceFaqs } from "@/data/pages/products";
import { getPageByRoute } from "@/data/sitemap";

const page = getPageByRoute("/products/life-insurance");

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

// Hand-authored (see authoredRoutes in @/data/pages) so it survives `npm run
// gen:pages`. Hero, quote and value-section copy aren't approved yet — the
// rest of the page stays the grey-box PageStub — but the FAQ copy is
// approved (Figma 2357:2321), so FaqSection renders alongside it.
export default function Page() {
  return (
    <>
      <PageStub page={page} groupId="products" />
      <FaqSection faqs={lifeInsuranceFaqs} />
    </>
  );
}
