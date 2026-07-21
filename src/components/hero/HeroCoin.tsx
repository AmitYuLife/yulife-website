"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const YuCoin3D = dynamic(() => import("../yucoin/YuCoinCanvas"), {
  ssr: false,
  loading: () => <div className="size-full" aria-hidden />,
});

export default function HeroCoin() {
  return (
    <div
      className="hero-coin relative mx-auto aspect-square w-[16rem] overflow-visible md:w-[19rem]"
      aria-hidden="true"
      data-coin-index="0"
    >
      <Suspense fallback={null}>
        <YuCoin3D />
      </Suspense>
    </div>
  );
}
