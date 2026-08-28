"use client";

import { useState } from "react";
import ChallengeSuccess from "@/components/app-screens/ChallengeSuccess";
import { ToggleStrip, ToggleButton } from "./ToggleStrip";

const WIDTHS = [320, 434, 560] as const;

/**
 * Workbench harness for the ChallengeSuccess app screen: a width switch to
 * prove the phone mock-up (434px native) scales cleanly at hero sizes, plus a
 * click counter wired to `onCollect` to prove the seam the YuCoin fountain
 * will bind to later.
 */
export default function ChallengeSuccessDemo() {
  const [width, setWidth] = useState<(typeof WIDTHS)[number]>(434);
  const [collected, setCollected] = useState(0);

  return (
    <div>
      <ToggleStrip label="Device width">
        {WIDTHS.map((w) => (
          <ToggleButton key={w} active={width === w} onClick={() => setWidth(w)}>
            {w}px
          </ToggleButton>
        ))}
        <span className="type-caption self-center text-emphasis">
          onCollect fired ×{collected}
        </span>
      </ToggleStrip>
      <div className="flex justify-center bg-surface-inverse p-32">
        <div style={{ width }}>
          <ChallengeSuccess onCollect={() => setCollected((n) => n + 1)} />
        </div>
      </div>
    </div>
  );
}
