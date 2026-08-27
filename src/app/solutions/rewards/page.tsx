import type { Metadata } from "next";
import SimpleHero from "@/components/sections/SimpleHero";
import { getPageByRoute } from "@/data/sitemap";

const route = "/solutions/rewards";
const page = getPageByRoute(route);

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

export default function Page() {
  return <SimpleHero page={page} />;
}
