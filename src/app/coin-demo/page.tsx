import type { Metadata } from "next";
import HeroAsset from "@/components/hero/HeroAsset";

export const metadata: Metadata = { title: "Coin demo" };

/**
 * Isolated playground for the hero coin animation: just the phone mockup and
 * coin field on the hero canvas. Click the phone to switch gravity on; click
 * again for a freshly randomised fountain.
 *
 * Rendered as a fixed overlay so the site header/footer (injected by the
 * root layout) stay out of the demo without restructuring the app's layouts.
 */
export default function CoinDemoPage() {
  return (
    <div
      className="hero-dark fixed inset-0 z-[100] flex flex-col justify-end overflow-hidden"
      style={{ backgroundColor: "var(--hero-canvas)" }}
    >
      <HeroAsset />
    </div>
  );
}
