import type { Metadata } from "next";
import ProductHiFi from "@/components/hifi/ProductHiFi";
import { productPages } from "@/data/pages/products";
import { getPageByRoute } from "@/data/sitemap";

const route = "/products/cash-plan";
const page = getPageByRoute(route);
const data = productPages[route];

export const metadata: Metadata = {
  title: data.meta?.title ?? page.label,
  description: data.meta?.description ?? page.purpose,
};

export default function Page() {
  return <ProductHiFi data={data} />;
}
