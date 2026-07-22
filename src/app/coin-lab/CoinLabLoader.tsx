"use client";

import dynamic from "next/dynamic";

const CoinLab = dynamic(() => import("./CoinLab"), {
  ssr: false,
  loading: () => null,
});

export default function CoinLabLoader() {
  return <CoinLab />;
}
