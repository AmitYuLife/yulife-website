import type { Metadata } from "next";
import HomeHiFi from "@/components/hifi/HomeHiFi";
import { home } from "@/data/sitemap";

export const metadata: Metadata = {
  title: "Home",
  description: home.purpose,
};

export default function HomePage() {
  return <HomeHiFi />;
}
