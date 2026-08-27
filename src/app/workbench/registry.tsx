import type { ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import Accordion, { AccordionItem } from "@/components/ui/Accordion";
import RevealCardGrid, { type RevealCardGridItem } from "@/components/patterns/RevealCardGrid";
import StatsColumns from "@/components/patterns/StatsColumns";
import type { StatsColumnItem } from "@/components/patterns/statsTypes";

import SimpleHero from "@/components/sections/SimpleHero";
import PageHero from "@/components/sections/PageHero";
import CarrierQuoteSection from "@/components/sections/CarrierQuoteSection";
import ClinicalExcellenceSection from "@/components/sections/ClinicalExcellenceSection";
import IntroSection from "@/components/sections/IntroSection";

// Scroll/GSAP/R3F sections — shown via the ReducedMotionHarness (final state).
import Hero from "@/components/sections/Hero";
import LogoMarquee from "@/components/patterns/LogoMarquee";
import FaqSection from "@/components/sections/FaqSection";
import ProvenRoiSection from "@/components/sections/ProvenRoiSection";
import EverydayValueSection from "@/components/sections/EverydayValueSection";
import BusinessPulseSection from "@/components/sections/BusinessPulseSection";
import StatCardFan from "@/components/patterns/StatCardFan";
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
    source: "src/components/patterns/RevealCardGrid.tsx",
    note: "hover / tap to reveal",
    tone: "dark",
    render: () => <RevealCardGrid items={revealItems} columns={3} />,
  },
  {
    name: "StatsColumns",
    source: "src/components/patterns/StatsColumns.tsx",
    note: "hover to reveal · odometer counts under the harness",
    tone: "dark",
    render: () => <StatsColumns stats={sampleStats} />,
  },
  {
    name: "StatCardFan",
    source: "src/components/patterns/StatCardFan.tsx",
    note: "fanned + interactive (hover to flip) · entrance resolved by harness",
    tone: "dark",
    render: () => <StatCardFan stats={sampleStats} />,
  },
];

// ── Sections ──────────────────────────────────────────────────────────────────
// Reusable, prop-driven page sections. These are full-bleed (own <section> +
// dark background), so they render with padded: false. Scroll-reveal / GSAP-
// ScrollTrigger / R3F sections are deferred — they need a scroll/canvas harness.
export const sectionSpecs: Spec[] = [
  {
    name: "PageHero",
    source: "src/components/sections/PageHero.tsx",
    note: "content-page hero · static device visual",
    padded: false,
    // The hero tucks under the site header with a negative top margin; the
    // workbench has no site header, so neutralise it inside the frame.
    render: () => (
      <div className="[&>*]:!mt-0">
        <PageHero
          eyebrow="Group Life Insurance"
          headline={{ lead: "Life cover that ", accent: "gives back" }}
          body="Protection your people value every day — with wellbeing rewards built in."
          ctas={[
            { label: "Speak to our team", href: "/contact" },
            { label: "See how it works", href: "/products" },
          ]}
          ratings={[
            { platform: "Trustpilot", score: "4.9" },
            { platform: "Capterra", score: "4.8" },
            { platform: "App Store", score: "4.9" },
          ]}
          carrier={{ name: "MetLife" }}
          visual={{
            kind: "device",
            src: "/products/hero-phone-mockup.png",
            alt: "YuLife app",
            width: 436,
            height: 900,
          }}
        />
      </div>
    ),
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
  {
    name: "CarrierQuoteSection",
    source: "src/components/sections/CarrierQuoteSection.tsx",
    padded: false,
    render: () => (
      <CarrierQuoteSection
        quote={{
          text: "YuLife has transformed how our members engage with their benefits — every single day.",
          author: "Jane Doe",
          role: "Head of People, Acme Co.",
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
    name: "LogoMarquee",
    source: "src/components/patterns/LogoMarquee.tsx",
    note: "fixed content (reads home-content); rowCount is the only prop",
    tone: "dark",
    render: () => <LogoMarquee rowCount={2} />,
  },
  {
    name: "Hero (homepage)",
    source: "src/components/sections/Hero.tsx",
    note: "fixed content + R3F coin field; copy resolved by harness",
    padded: false,
    render: () => <Hero />,
  },
];
