import type { Metadata } from "next";
import EditorialHiFi from "@/components/hifi/EditorialHiFi";
import { editorialPages } from "@/data/pages/editorial";
import { getPageByRoute } from "@/data/sitemap";

const route = "/about/about-us";
const page = getPageByRoute(route);
const data = editorialPages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <EditorialHiFi data={data} />;
}
