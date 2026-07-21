import type { Metadata } from "next";
import FeaturePage from "@/components/FeaturePage";
import { featurePages } from "@/data/pages/features";
import { getPageByRoute } from "@/data/sitemap";

const route = "/solutions/wellbeing-insights-reporting";
const page = getPageByRoute(route);
const data = featurePages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <FeaturePage data={data} />;
}
