import type { Metadata } from "next";
import FeatureHiFi from "@/components/hifi/FeatureHiFi";
import { featurePages } from "@/data/pages/features";
import { getPageByRoute } from "@/data/sitemap";

const route = "/solutions/virtual-gp";
const page = getPageByRoute(route);
const data = featurePages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <FeatureHiFi data={data} />;
}
