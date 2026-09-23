"use client";

import { useState } from "react";
import PlatformTabList from "@/components/ui/PlatformTabList";

export default function PlatformTabListDemo() {
  const [active, setActive] = useState(0);
  return (
    <div className="w-full max-w-[1216px]">
      <PlatformTabList active={active} onActiveChange={setActive} />
    </div>
  );
}
