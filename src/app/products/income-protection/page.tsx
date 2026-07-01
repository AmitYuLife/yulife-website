import type { Metadata } from "next";
import ProductHiFi from "@/components/hifi/ProductHiFi";
import { productPages } from "@/data/pages/products";
import { getPageByRoute } from "@/data/sitemap";

const route = "/products/income-protection";
const page = getPageByRoute(route);
const data = productPages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <ProductHiFi data={data} />;
}
