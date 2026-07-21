import type { Metadata } from "next";
import ProductPage from "@/components/ProductPage";
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
  return <ProductPage data={data} />;
}
