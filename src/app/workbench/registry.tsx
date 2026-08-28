import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import RevealCardGrid, { type RevealCardGridItem } from "@/components/blocks/RevealCardGrid";
import StatBlock from "@/components/blocks/StatBlock";
import StatColumn from "@/components/ui/StatColumn";
import type { StatsColumnItem } from "@/components/ui/statsTypes";
import TrustRatings from "@/components/ui/TrustRatings";
import SectionCard from "@/components/ui/SectionCard";
import PillarBox from "@/components/ui/PillarBox";
import YunityDiagram from "@/components/blocks/YunityDiagram";
import StatFlipCardDemo from "./StatFlipCardDemo";
import QuoteBlockDemo from "./QuoteBlockDemo";

import SimpleHero from "@/components/sections/SimpleHero";
import ImageRightHeroDemo from "./ImageRightHeroDemo";
import ClinicalExcellenceSection from "@/components/sections/ClinicalExcellenceSection";
import IntroSection from "@/components/sections/IntroSection";

// Scroll/GSAP/R3F sections — shown via the ReducedMotionHarness (final state).
import Hero from "@/components/sections/Hero";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import FaqSection from "@/components/sections/FaqSection";
import ProvenRoiSection from "@/components/sections/ProvenRoiSection";
import EverydayValueSection from "@/components/sections/EverydayValueSection";
import BusinessPulseSection from "@/components/sections/BusinessPulseSection";
import StatCardFan from "@/components/blocks/StatCardFan";
import ProductLogoBar from "@/components/sections/ProductLogoBar";
import MarqueeStatsSection from "@/components/sections/MarqueeStatsSection";
import StatCountCards from "@/components/sections/StatCountCards";

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
// The genuinely reusable UI primitives (src/components/ui/*). Composites that
// assemble these into a self-contained unit live in `blockSpecs` below.
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
    name: "StatFlipCard",
    source: "src/components/ui/StatFlipCard.tsx",
    note: "the single card inside StatCardFan · click / tap to flip",
    tone: "dark",
    render: () => <StatFlipCardDemo />,
  },
  {
    name: "StatColumn",
    source: "src/components/ui/StatColumn.tsx",
    note: "the single column inside StatBlock · hover to reveal",
    tone: "dark",
    render: () => (
      <div className="mx-auto w-[280px]">
        <StatColumn
          value={sampleStats[0].value}
          label={sampleStats[0].label}
          note={sampleStats[0].note}
          source={sampleStats[0].source}
          footnote={sampleStats[0].footnote}
        />
      </div>
    ),
  },
  {
    name: "SectionCard",
    source: "src/components/ui/SectionCard.tsx",
    note: "framed inverse content panel · forwards div props",
    tone: "dark",
    render: () => (
      <SectionCard>
        <div className="flex flex-col items-center gap-stack text-center">
          <h4 className="type-heading-h4 text-on-inverse">A framed content panel</h4>
          <p className="type-body-md max-w-[48ch] text-on-inverse">
            The generic inverse card used above the Yunity star and reusable by other bands.
          </p>
        </div>
      </SectionCard>
    ),
  },
  {
    name: "PillarBox",
    source: "src/components/ui/PillarBox.tsx",
    note: "one capability box · hover / tap to reveal description",
    tone: "dark",
    render: () => (
      <div className="mx-auto w-[280px]">
        <PillarBox
          title="Move"
          description="Earn YuCoin for every walk, run and ride — converted into real rewards."
        />
      </div>
    ),
  },
  {
    name: "TrustRatings",
    source: "src/components/ui/TrustRatings.tsx",
    note: "rating badges · reads home-content",
    render: () => <TrustRatings />,
  },
];

// ── Blocks ────────────────────────────────────────────────────────────────────
// Self-contained composites that assemble components (and their own animation)
// into a reusable unit. Interactive / scroll-reveal / R3F blocks are shown in
// their resolved state via the ReducedMotionHarness.
export const blockSpecs: Spec[] = [
  {
    name: "StatBlock",
    source: "src/components/blocks/StatBlock.tsx",
    note: "3-up stat columns · hover to reveal · odometer counts under the harness",
    tone: "dark",
    render: () => <StatBlock stats={sampleStats} />,
  },
  {
    name: "StatCardFan",
    source: "src/components/blocks/StatCardFan.tsx",
    note: "fanned + interactive (hover to flip) · entrance resolved by harness",
    tone: "dark",
    render: () => <StatCardFan stats={sampleStats} />,
  },
  {
    name: "QuoteBlock",
    source: "src/components/blocks/QuoteBlock.tsx",
    note: "bordered pull-quote card · toggle the optional avatar + partner logo",
    padded: false,
    render: () => <QuoteBlockDemo />,
  },
  {
    name: "RevealCardGrid",
    source: "src/components/blocks/RevealCardGrid.tsx",
    note: "hover / tap to reveal",
    tone: "dark",
    render: () => <RevealCardGrid items={revealItems} columns={3} />,
  },
  {
    name: "LogoMarquee",
    source: "src/components/blocks/LogoMarquee.tsx",
    note: "fixed content (reads home-content); rowCount is the only prop",
    tone: "dark",
    render: () => <LogoMarquee rowCount={2} />,
  },
  {
    name: "YunityDiagram",
    source: "src/components/blocks/YunityDiagram.tsx",
    note: "Yunity lockup + live star + outcome cards · R3F resolved by harness",
    tone: "dark",
    render: () => <YunityDiagram />,
  },
];

// ── Sections ──────────────────────────────────────────────────────────────────
// Reusable, prop-driven page sections. These are full-bleed (own <section> +
// dark background), so they render with padded: false. Scroll-reveal / GSAP-
// ScrollTrigger / R3F sections are deferred — they need a scroll/canvas harness.
export const sectionSpecs: Spec[] = [
  {
    name: "ImageRightHero",
    source: "src/components/sections/ImageRightHero.tsx",
    note: "content-page hero · copy left, visual right · toggle device ⇄ person+coins",
    padded: false,
    // Real section with a variant toggle (device mockup ⇄ person + R3F coins).
    // Mirrors the Health Cash Plan (2520:10233) and For Businesses (2495:7454)
    // heroes; both share the 700 · 80 · 436 frame — only the visual changes.
    render: () => <ImageRightHeroDemo />,
  },
  {
    name: "SimpleHero",
    source: "src/components/sections/SimpleHero.tsx",
    note: "minimal placeholder hero — eyebrow · title · CTA",
    padded: false,
    render: () => (
      <SimpleHero
        page={{
          label: "Health Insurance",
          route: "/products/health",
          purpose: "",
          copyStatus: "none",
        }}
      />
    ),
  },
  {
    name: "IntroSection",
    source: "src/components/sections/IntroSection.tsx",
    padded: false,
    render: () => (
      <IntroSection
        heading="Where insurance meets wellbeing"
        accent="wellbeing"
        paragraphs={[
          "We turn everyday benefits into an experience your people actually love — and use.",
        ]}
      />
    ),
  },
  {
    name: "ClinicalExcellenceSection",
    source: "src/components/sections/ClinicalExcellenceSection.tsx",
    note: "cards reveal on hover / tap",
    padded: false,
    render: () => (
      <ClinicalExcellenceSection
        data={{
          eyebrow: "Clinical excellence",
          heading: "Care your people can count on",
          body: "Round-the-clock access to clinicians, backed by a leading carrier.",
          cards: [
            { icon: dotIcon("00ed9d"), alt: "", title: "24/7 virtual GP", body: "Appointments within hours, day or night." },
            { icon: dotIcon("00c0f3"), alt: "", title: "Mental-health support", body: "Confidential counselling and self-guided tools." },
            { icon: dotIcon("ffd600"), alt: "", title: "Private prescriptions", body: "Delivered to the door, no clinic queue." },
          ],
          footnote: "Illustrative sample content.",
        }}
      />
    ),
  },

  // ── Scroll / GSAP / R3F sections (rendered in resolved state via the harness) ──
  {
    name: "FaqSection",
    source: "src/components/sections/FaqSection.tsx",
    note: "reveal resolved by harness",
    padded: false,
    render: () => (
      <FaqSection
        faqs={[
          { question: "How quickly can we launch?", answer: "Most schemes go live in under a week." },
          { question: "How do employees earn rewards?", answer: "Healthy actions earn YuCoin, swapped for rewards from 50+ brands." },
          { question: "Can I add dependants?", answer: "Yes — partners and children can be covered." },
        ]}
      />
    ),
  },
  {
    name: "ProvenRoiSection",
    source: "src/components/sections/ProvenRoiSection.tsx",
    note: "reveal + StatCardFan resolved by harness",
    padded: false,
    render: () => (
      <ProvenRoiSection
        data={{
          eyebrow: "Proven ROI",
          heading: "Wellbeing that pays back",
          body: "Engaged members mean healthier teams and a measurable return.",
          stats: [
            { value: "98%", label: "policy renewal", note: "vs an 82% market average.", source: "YuLife book of business" },
            { value: "86", label: "member NPS", note: "against an industry average of 27.", source: "YuLife member survey" },
            { value: "30x", label: "more engagement", note: "than a traditional insurer app." },
          ],
        }}
      />
    ),
  },
  {
    name: "EverydayValueSection",
    source: "src/components/sections/EverydayValueSection.tsx",
    note: "scroll-scrubbed steps shown resolved (first block active)",
    padded: false,
    render: () => (
      <EverydayValueSection
        data={{
          eyebrow: "Everyday value",
          heading: "Benefits your people use ",
          accent: "every day",
          lead: "Not a policy that sits in a drawer.",
          body: "From a virtual GP to rewards for healthy habits, YuLife earns a place in the daily routine.",
          blocks: [
            { title: "See a GP in minutes", body: "24/7 virtual appointments, no waiting room.", image: "/products/everyday/video-call.png", alt: "" },
            { title: "Support when it matters", body: "Confidential mental-health help, a tap away.", image: "/products/everyday/thought-bubble.png", alt: "" },
            { title: "Care for the whole family", body: "Cover extends to partners and children.", image: "/products/everyday/tooth.png", alt: "" },
            { title: "Rewards for healthy habits", body: "Every walk, run and ride earns YuCoin.", image: "/products/everyday/medikit.png", alt: "" },
          ],
        }}
      />
    ),
  },
  {
    name: "BusinessPulseSection",
    source: "src/components/sections/BusinessPulseSection.tsx",
    note: "R3F star (Yunity) + reveal — live 3D via harness",
    padded: false,
    render: () => (
      <BusinessPulseSection
        data={{
          heading: "A live pulse on your people",
          body: "Yunity turns everyday engagement into anonymised, aggregated insight.",
          steps: [
            { title: "Sense", description: "signals from daily wellbeing activity." },
            { title: "Interpret", description: "patterns in burnout and engagement risk." },
            { title: "Guide", description: "nudges and actions for healthier teams." },
          ],
        }}
      />
    ),
  },
  {
    name: "StatCountCards",
    source: "src/components/sections/StatCountCards.tsx",
    note: "odometers count under the harness",
    tone: "dark",
    render: () => (
      <StatCountCards
        stats={[
          { value: "1m+", label: "members protected" },
          { value: "80%", label: "stay active monthly" },
          { value: "50+", label: "reward brands" },
        ]}
      />
    ),
  },
  {
    name: "MarqueeStatsSection",
    source: "src/components/sections/MarqueeStatsSection.tsx",
    note: "logo marquee (fixed content) + stat cards",
    padded: false,
    render: () => (
      <MarqueeStatsSection
        stats={[
          { value: "1m+", label: "members protected" },
          { value: "86", label: "member NPS" },
          { value: "30x", label: "more engagement" },
        ]}
      />
    ),
  },
  {
    name: "ProductLogoBar",
    source: "src/components/sections/ProductLogoBar.tsx",
    note: "fixed content (reads home-content) — not prop-driven",
    padded: false,
    render: () => <ProductLogoBar />,
  },
  {
    name: "Hero (homepage)",
    source: "src/components/sections/Hero.tsx",
    note: "fixed content + R3F coin field; copy resolved by harness",
    padded: false,
    render: () => <Hero />,
  },
];
