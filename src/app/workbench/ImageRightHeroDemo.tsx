"use client";

import { useState } from "react";
import ImageRightHero, {
  type ImageRightHeroContent,
} from "@/components/sections/ImageRightHero";
import { assetPath } from "@/lib/assetPath";
import { cn } from "@/lib/utils";

/**
 * Workbench-only harness: renders the one ImageRightHero section with a toggle
 * between its two visual variants — a static `device` (phone mockup) and a
 * `person` cutout with the live R3F YuCoin orbit. Both share the identical
 * frame (700px copy · 80px gap · 436px anchor); only the right-hand visual
 * changes, which is the whole point of the section. Each variant carries the
 * copy from its real design (Figma nodes 2520:10233 and 2495:7454).
 */

const ratings: ImageRightHeroContent["ratings"] = [
  { platform: "Trustpilot", score: "4.9" },
  { platform: "Capterra", score: "4.8" },
  { platform: "App Store", score: "4.9" },
];

const VARIANTS = {
  device: {
    eyebrow: "Health Cash Plan",
    headline: { lead: "Trusted cover for ", accent: "everyday health" },
    body: "We’re bringing together Bupa’s trusted insurance expertise and care pathways with YuLife’s daily wellbeing experience, so health benefits are used, understood, and valued as part of daily life, not just at the point of claim.",
    ctas: [{ label: "Speak to our team", href: "/contact" }],
    ratings,
    carrier: { name: "Bupa" },
    visual: {
      kind: "device",
      src: assetPath("/products/hero-phone-mockup.png"),
      alt: "YuLife app",
      width: 436,
      height: 900,
    },
  },
  person: {
    eyebrow: "For businesses",
    headline: {
      lead: "Benefits that\nmake a difference\n",
      accent: "every day",
    },
    body: "YuLife is an AI-forward insurance and wellbeing benefit. We bring group cover, daily wellbeing and real rewards into a single experience, with insurance from Bupa and MetLife. Available with cover, or as an app-only benefit.",
    ctas: [{ label: "Speak to our team", href: "/contact" }],
    ratings,
    visual: {
      kind: "person",
      src: assetPath("/who-we-help/businesses-hero-person.webp"),
      width: 962,
      height: 1300,
    },
  },
} satisfies Record<string, ImageRightHeroContent>;

type VariantKey = keyof typeof VARIANTS;

export default function ImageRightHeroDemo() {
  const [variant, setVariant] = useState<VariantKey>("device");

  return (
    <div>
      {/* Toggle strip — workbench chrome, not part of the section. */}
      <div className="flex items-center gap-inline border-b border-line bg-surface-subtle px-16 py-12">
        <span className="type-caption text-emphasis">Visual</span>
        <div className="flex gap-inline" role="group" aria-label="Hero visual variant">
          {(Object.keys(VARIANTS) as VariantKey[]).map((key) => {
            const active = key === variant;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setVariant(key)}
                aria-pressed={active}
                className={cn(
                  "type-label rounded-sm border px-controls py-inline capitalize transition-colors",
                  active
                    ? "border-line-emphasis bg-surface-inverse text-on-inverse"
                    : "border-line bg-surface text-emphasis hover:border-line-emphasis",
                )}
              >
                {key === "person" ? "Person + coins" : "Device"}
              </button>
            );
          })}
        </div>
      </div>

      {/* The hero tucks under the site header with a negative top margin; the
          workbench has no site header, so neutralise it inside the frame. */}
      <div className="[&>*]:!mt-0">
        <ImageRightHero {...VARIANTS[variant]} />
      </div>
    </div>
  );
}
