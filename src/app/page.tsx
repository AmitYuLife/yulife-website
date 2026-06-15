import type { Metadata } from "next";
import HomeWireframe from "@/components/home/HomeWireframe";
import { home } from "@/data/sitemap";

export const metadata: Metadata = {
  title: "Home",
  description: home.purpose,
};

export default function HomePage() {
  return <HomeWireframe />;
}
