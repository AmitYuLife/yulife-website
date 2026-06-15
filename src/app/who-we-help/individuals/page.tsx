import type { Metadata } from "next";
import AudienceWireframe from "@/components/wireframe/AudienceWireframe";
import { audiencePages } from "@/data/wireframes/audience";
import { getPageByRoute } from "@/data/sitemap";

const route = "/who-we-help/individuals";
const page = getPageByRoute(route);
const data = audiencePages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <AudienceWireframe data={data} />;
}
