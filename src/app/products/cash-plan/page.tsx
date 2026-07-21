import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
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
  return <ProductPage data={data} />;
}
