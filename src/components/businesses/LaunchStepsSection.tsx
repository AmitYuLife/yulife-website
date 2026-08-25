"use client";

import { useEffect, useState } from "react";
import EverydayValueSection from "@/components/product/EverydayValueSection";
import type {
  EverydayValuePanel,
  EverydayValueSection as EverydayValueData,
} from "@/data/pages/types";

/**
 * Placeholder spot-illustration pool — the same set the product-page parallax
 * uses. Final Businesses illustrations aren't designed yet, so the left column
 * shows these as stand-ins, re-shuffled on each load.
 */
const PLACEHOLDER_POOL = [
  "/products/everyday/video-call.png",
  "/products/everyday/thought-bubble.png",
  "/products/everyday/tooth.png",
  "/products/everyday/medikit.png",
] as const;

export type LaunchStep = {
  title: string;
  /** One paragraph, or several stacked. */
  body: string | readonly string[];
};

export type LaunchStepsContent = {
  eyebrow: string;
  heading: string;
  /** Trailing serif-italic fragment of `heading`. */
  accent: string;
  lead: string;
  body: string;
  steps: readonly LaunchStep[];
  /** Closing gradient-border card. Omit to end the section on the last step. */
  panel?: EverydayValuePanel;
};

/** Fisher–Yates — client-only (called inside an effect), so no hydration skew. */
function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Businesses "3 simple steps" section. Reuses the product pages' scroll-driven
 * `EverydayValueSection` (sticky crossfading illustration, stepped blocks, the
 * emphasis rail + gradient-border comet on the closing panel), on the raised
 * surface with a heading/body panel instead of a testimonial.
 *
 * The left illustrations are placeholders drawn from the shared everyday pool
 * and re-shuffled per load — SSR renders a stable default order, then the mount
 * effect randomises, so hydration stays clean.
 */
export default function LaunchStepsSection({
  content,
}: {
  content: LaunchStepsContent;
}) {
  const { eyebrow, heading, accent, lead, body, steps, panel } = content;

  // Deterministic on the server + first client render; randomised after mount.
  const [images, setImages] = useState<readonly string[]>(() =>
    PLACEHOLDER_POOL.slice(0, steps.length),
  );

  useEffect(() => {
    setImages(shuffle(PLACEHOLDER_POOL).slice(0, steps.length));
  }, [steps.length]);

  const data: EverydayValueData = {
    eyebrow,
    heading,
    accent,
    lead,
    body,
    blocks: steps.map((step, index) => ({
      title: step.title,
      body: step.body,
      image: images[index] ?? PLACEHOLDER_POOL[index % PLACEHOLDER_POOL.length],
      alt: "",
    })),
  };

  return <EverydayValueSection data={data} panel={panel} surface="inverse-raised" />;
}
