import type { Metadata } from "next";
import HomePage from "@/components/HomePage";
import { home } from "@/data/sitemap";

export const metadata: Metadata = {
  title: "Home",
  description: home.purpose,
};

export default function Page() {
  return <HomePage />;
}
