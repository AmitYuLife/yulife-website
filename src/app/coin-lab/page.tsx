import type { Metadata } from "next";
import CoinLabLoader from "./CoinLabLoader";

export const metadata: Metadata = { title: "Coin lab" };

export default function CoinLabPage() {
  return <CoinLabLoader />;
}
