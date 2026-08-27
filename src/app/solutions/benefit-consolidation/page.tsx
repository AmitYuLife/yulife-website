import type { Metadata } from "next";
import PageHero, { type PageHeroContent } from "@/components/sections/PageHero";
import MarqueeStatsSection, {
  type MarqueeStatsContent,
} from "@/components/sections/MarqueeStatsSection";
import IntroSection, {
  type IntroSectionContent,
} from "@/components/sections/IntroSection";
import LaunchStepsSection, {
  type LaunchStepsContent,
} from "@/components/sections/LaunchStepsSection";
import PillarsSection from "@/components/sections/PillarsSection";
import TrustedSection from "@/components/sections/TrustedSection";
import JoinMissionCard from "@/components/sections/JoinMissionCard";
import { getPageByRoute } from "@/data/sitemap";
import { assetPath } from "@/lib/assetPath";

const route = "/solutions/benefit-consolidation";
const page = getPageByRoute(route);

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

// Copy transcribed verbatim from the Figma design (node 2497:8306), which is the
// source of truth over the copy doc. The page reuses the Businesses section
// stack, mapping 1:1 to the frame — every section design is pre-existing.
//
// CTA hrefs aren't expressed in the design; the buttons read "Speak to our
// team". As on the Businesses page, they resolve to "/contact" here.
const speakToTeam = { label: "Speak to our team", href: "/contact" };

const hero: PageHeroContent = {
  eyebrow: "Benefit consolidation",
  headline: {
    lead: "Every benefit your people have in a place ",
    accent: "they love",
  },
  body:
    "Most benefits go unused because employees don’t know they exist. YuLife " +
    "brings your EAP, Virtual GP, wellbeing services and your company’s own " +
    "benefits together in one app your people open every day. Everything you " +
    "offer gets seen, and used.",
  ctas: [speakToTeam],
  ratings: [
    { platform: "Trustpilot", score: "4.9" },
    { platform: "Capterra", score: "4.8" },
    { platform: "App Store", score: "4.9" },
  ],
  // The design's hero shows the app's benefits hub, not a person — the same
  // phone mockup the product heroes use (2x export, 436×768 at 1x).
  visual: {
    kind: "device",
    src: assetPath("/products/hero-phone-mockup-2x.png"),
    width: 436,
    height: 768,
  },
};

// Stats bar — three cards exactly as the design shows them.
const marqueeStats: MarqueeStatsContent = {
  cardsClassName: "max-w-[912px] desktop:grid-cols-3",
  stats: [
    { id: "eap-vgp", value: "4x", label: "increase in engagement\nto EAP and VGP" },
    { id: "risk", value: "25%", label: "lower risk" },
    { id: "engaged", value: "80%", label: "highly engaged users" },
  ],
};

// Explainer — "Scattered benefits are invisible benefits", with the design's
// serif-italic accent on "invisible".
const intro: IntroSectionContent = {
  heading: "Scattered benefits are invisible benefits",
  accent: "invisible",
  paragraphs: [
    "The average benefits package is spread across providers, portals, logins " +
      "and PDFs, and employees are expected to remember all of it. They don’t.",
    "YuLife takes a different approach: one app for insurance-linked services, " +
      "wellbeing tools and everything else you offer. When people can see what " +
      "they have, they use what they have.",
  ],
};

// "How it works" — eyebrow, heading, lead/body and the closing "One benefit
// story" panel all transcribed from the design. The panel is the section's
// closing card (the emphasis rail runs down into it), exactly as on other pages.
const howItWorks: LaunchStepsContent = {
  eyebrow: "3 simple steps",
  heading: "How it works",
  accent: "works",
  lead: "Upload your team, connect your HR systems, go live.",
  body:
    "After that, the benefit does the work and the portal tells you what it’s " +
    "changing.",
  steps: [
    {
      title: "One hub for everything wellbeing",
      body:
        "Your EAP and Virtual GP appear in the YuLife app automatically, right " +
        "alongside your company’s own benefits. Whatever you offer your people, " +
        "it lives here, organised by category and searchable in seconds, in the " +
        "same app where employees build habits and earn rewards every day.",
    },
    {
      title: "Visibility that drives engagement",
      body:
        "A benefit nobody can find is a cost, not a benefit. Because support " +
        "sits inside the app your people already open daily, engagement " +
        "follows: YuLife drives a 4x increase in EAP and Virtual GP use. " +
        "Consolidation isn’t a convenience. It’s the reason everything else " +
        "you’ve invested in gets used.",
    },
    {
      title: "Control without the admin",
      body:
        "HR teams manage the whole picture from the Employer Portal. Add a new " +
        "benefit in minutes, show it only to the employees it applies to with " +
        "eligibility rules, group entries by category, and set the order your " +
        "people see. No IT project. No extra logins. One clear view for you, " +
        "and for them.",
    },
  ],
  panel: {
    heading: "One benefit story. Simply told.",
    paragraphs: [
      "Whether you’re an HR leader juggling providers or an adviser building a " +
        "recommendation, YuLife turns a complicated benefits stack into one " +
        "clear, engaging offer.",
    ],
    cta: speakToTeam,
  },
};

export default function Page() {
  return (
    <>
      <PageHero {...hero} />
      <MarqueeStatsSection {...marqueeStats} />
      <IntroSection {...intro} />
      <LaunchStepsSection content={howItWorks} />
      {/*
        Backgrounds alternate through the stack; the shared sections below reuse
        home content (Four Pillars / Yunity, testimonials, awards, final CTA),
        exactly as the design composes them from pre-existing sections.
      */}
      <PillarsSection firstBand="inverse" />
      <TrustedSection surface="inverse" />
      <JoinMissionCard />
    </>
  );
}
