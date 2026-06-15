import type { Metadata } from "next";
import EditorialWireframe from "@/components/wireframe/EditorialWireframe";
import { editorialPages } from "@/data/wireframes/editorial";
import { getPageByRoute } from "@/data/sitemap";

const route = "/about/about-us";
const page = getPageByRoute(route);
const data = editorialPages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <EditorialWireframe data={data} />;
}
