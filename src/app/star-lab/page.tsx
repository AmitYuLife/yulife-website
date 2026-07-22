import type { Metadata } from "next";
import StarLabLoader from "./StarLabLoader";

export const metadata: Metadata = { title: "Star lab" };

export default function StarLabPage() {
  return <StarLabLoader />;
}
