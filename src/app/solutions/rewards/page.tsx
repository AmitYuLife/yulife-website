import type { Metadata } from "next";
import FeatureWireframe from "@/components/wireframe/FeatureWireframe";
import { featurePages } from "@/data/wireframes/features";
import { getPageByRoute } from "@/data/sitemap";

const route = "/solutions/rewards";
const page = getPageByRoute(route);
const data = featurePages[route];

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <FeatureWireframe data={data} />;
}
