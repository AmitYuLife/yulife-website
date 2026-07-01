import type { Metadata } from "next";
import AudienceHiFi from "@/components/hifi/AudienceHiFi";
import { audiencePages } from "@/data/pages/audience";
import { getPageByRoute } from "@/data/sitemap";

const route = "/who-we-help/individuals";
const page = getPageByRoute(route);
const data = audiencePages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <AudienceHiFi data={data} />;
}
