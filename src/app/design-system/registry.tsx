import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import RevealCardGrid, { type RevealCardGridItem } from "@/components/ui/RevealCardGrid";
import { StatsColumns, type StatsColumnItem } from "@/components/stats";

export type Spec = {
  name: string;
  /** Where the real component lives, so the workbench doubles as a jump-to-code index. */
  source: string;
  note?: string;
  tone?: "light" | "dark";
  /** Full-bleed content renders without the stage padding. */
  padded?: boolean;
  render: () => ReactNode;
};

// Inline SVG data URIs — no network, no 404s in the workbench console.
const dotIcon = (hex: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%23${hex}'/%3E%3C/svg%3E`;

const revealItems: RevealCardGridItem[] = [
  { icon: dotIcon("00ed9d"), alt: "", title: "Move", body: "Earn YuCoin for every walk, run and ride — converted into real rewards." },
  { icon: dotIcon("00c0f3"), alt: "", title: "Mind", body: "Guided meditations and mental-health support, a tap away in the app." },
  { icon: dotIcon("ffd600"), alt: "", title: "Money", body: "Financial wellbeing tools that make the most of every reward earned." },
];

const sampleStats: StatsColumnItem[] = [
  { value: "80%", label: "of members\nstay active", note: "Four in five members keep engaging month after month.", source: "YuLife platform data, 2025", footnote: 1 },
  { value: "86", label: "member NPS", note: "Against an industry average of 27.", source: "YuLife member survey", footnote: 2 },
  { value: "30x", label: "more engagement", note: "Members engage 30× more than with a traditional insurer app.", footnote: 3 },
];

// ── Components ────────────────────────────────────────────────────────────────
// The genuinely reusable UI primitives. (The grey-box wireframe scaffolding —
// SectionBlock, section/shared and the four page templates — was removed with
// the wireframe system.)
export const componentSpecs: Spec[] = [
  {
    name: "Button",
    source: "src/components/ui/Button.tsx",
    note: "size × variant × theme",
    render: () => (
      <div className="flex flex-col gap-flow">
        <div className="flex flex-wrap items-center gap-controls">
          <Button size="lg" variant="solid" theme="onLight">Solid · LG</Button>
          <Button size="sm" variant="solid" theme="onLight">Solid · SM</Button>
          <Button size="lg" variant="outline" theme="onLight">Outline · LG</Button>
          <Button size="sm" variant="outline" theme="onLight" trailingIcon>Outline · SM</Button>
        </div>
        <div className="flex flex-wrap items-center gap-controls rounded-md bg-surface-inverse p-24">
          <Button size="lg" variant="solid" theme="onDark">Solid · LG</Button>
          <Button size="sm" variant="solid" theme="onDark">Solid · SM</Button>
          <Button size="lg" variant="outline" theme="onDark">Outline · LG</Button>
          <Button size="sm" variant="outline" theme="onDark" trailingIcon>Outline · SM</Button>
        </div>
      </div>
    ),
  },
  {
    name: "Accordion",
    source: "src/components/ui/Accordion.tsx",
    note: "one row open at a time",
    render: () => (
      <Accordion>
        <AccordionItem question="How does YuCoin work?" answer="Members earn YuCoin for healthy actions, then swap it for rewards from 50+ brands." />
        <AccordionItem question="Is it available on iOS and Android?" answer="Yes — the YuLife app is on both the App Store and Google Play." />
        <AccordionItem question="Can employers see individual data?" answer="No. Employers only ever see aggregated, anonymised insights." />
      </Accordion>
    ),
  },
  {
    name: "RevealCardGrid",
    source: "src/components/ui/RevealCardGrid.tsx",
    note: "hover / tap to reveal",
    tone: "dark",
    render: () => <RevealCardGrid items={revealItems} columns={3} />,
  },
  {
    name: "StatsColumns",
    source: "src/components/stats/StatsColumns.tsx",
    note: "hover to reveal · odometer is scroll-triggered",
    tone: "dark",
    render: () => <StatsColumns stats={sampleStats} />,
  },
];
