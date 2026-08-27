import type { Metadata } from "next";
import SimpleHero from "@/components/sections/SimpleHero";
import FaqSection from "@/components/sections/FaqSection";
import { lifeInsuranceFaqs } from "@/data/pages/products";
import { getPageByRoute } from "@/data/sitemap";

const route = "/products/life-insurance";
const page = getPageByRoute(route);

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

// Minimal bespoke placeholder hero (hero/quote/value copy not approved yet),
// with the approved FAQ copy (Figma 2357:2321) wired in via FaqSection.
export default function Page() {
  return (
    <>
      <SimpleHero page={page} />
      <FaqSection faqs={lifeInsuranceFaqs} />
    </>
  );
}
