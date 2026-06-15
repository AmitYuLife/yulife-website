import type { Metadata } from "next";
import ProductWireframe from "@/components/wireframe/ProductWireframe";
import { productPages } from "@/data/wireframes/products";
import { getPageByRoute } from "@/data/sitemap";

const route = "/products/income-protection";
const page = getPageByRoute(route);
const data = productPages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <ProductWireframe data={data} />;
}
