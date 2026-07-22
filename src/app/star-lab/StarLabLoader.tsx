"use client";

import dynamic from "next/dynamic";

const StarLab = dynamic(() => import("./StarLab"), {
  ssr: false,
  loading: () => null,
});

export default function StarLabLoader() {
  return <StarLab />;
}
