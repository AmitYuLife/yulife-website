import type { Metadata } from "next";
import ImageRightHero, { type ImageRightHeroContent } from "@/components/sections/ImageRightHero";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import ProvenRoiSection from "@/components/sections/ProvenRoiSection";
import EverydayValueSection from "@/components/sections/EverydayValueSection";
import PillarsSection from "@/components/sections/PillarsSection";
import TrustedSection from "@/components/sections/TrustedSection";
import FaqSection from "@/components/sections/FaqSection";
import JoinMissionCard, { type JoinMissionContent } from "@/components/sections/JoinMissionCard";
import type {
  EverydayValueLayer,
  EverydayValuePanel,
  EverydayValueSection as EverydayValueData,
  EverydayValueWindow,
  FaqEntry,
  ProvenRoiSection as ProvenRoiData,
} from "@/data/pages/types";
import { getPageByRoute } from "@/data/sitemap";
import { assetPath } from "@/lib/assetPath";

const route = "/solutions/wellbeing-hub";
const page = getPageByRoute(route);

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

// Wellbeing Hub (formerly Benefit Consolidation). The hero follows the new
// design (Figma 2896:14660); the sections below it still follow the earlier
// design (node 2497:8306) until they're rebuilt. Figma is the source of truth
// over the copy doc. The page reuses the Businesses section
// stack, mapping 1:1 to the frame — every section design is pre-existing.
//
// CTA hrefs aren't expressed in the design; the buttons read "Speak to our
// team". As on the Businesses page, they resolve to "/contact" here.
const speakToTeam = { label: "Speak to our team", href: "/contact" };

// § Hero — Wellbeing Hub (Figma 2896:14666), copy verbatim from the design.
// The design breaks the headline after "all in", so `lead` carries the "\n".
const hero: ImageRightHeroContent = {
  eyebrow: "Wellbeing Hub",
  headline: {
    lead: "Every employee benefit, all in\n",
    accent: "one place",
  },
  body:
    "Bring your EAP, Virtual GP, wellbeing services and company benefits " +
    "together in the YuLife app, making it easier for your people to find and " +
    "use the support available to them.",
  ctas: [speakToTeam],
  ratings: [
    { platform: "Trustpilot", score: "4.9" },
    { platform: "Capterra", score: "4.8" },
    { platform: "App Store", score: "4.9" },
  ],
  // The full, unclipped phone frame (Figma 2903:55970) — phone, hub header and
  // service cards — as one 3x raster (436×906 at 1x). The hero crops it at the
  // bottom border, so however tall the copy makes the hero, the phone runs off it.
  visual: {
    kind: "device",
    src: assetPath("/products/hero-wellbeing-hub-phone.png"),
    width: 436,
    height: 906,
  },
};

// § "Benefits people can find. Value you can see" (Figma 2896:14738) — centred
// header (no eyebrow) over the three-card StatCardFan. Heading, body and the
// card fronts are verbatim from the design; sources are from the copy doc.
// ⚑ The back-face `note` on each card is authored to ToV (the design shows the
// fronts only and the doc gives no note copy).
// The third stat uses the copy doc's approved 18x, not the design's 12x
// (confirmed 2026-09-23; Figma needs updating to match).
const benefitsProof: ProvenRoiData = {
  eyebrow: "",
  heading: "Benefits people can find.\nValue you can see",
  emphasis: ["find", "see"],
  body:
    "A benefit only creates value when people know it exists. YuLife puts your " +
    "employee benefits and wellbeing services somewhere your people already " +
    "know to look.",
  stats: [
    {
      value: "4x",
      label: "higher engagement with EAP & Virtual GP",
      note:
        "When support sits in the app your people open every day, they " +
        "actually use it. That includes their EAP and Virtual GP.",
      source: "YuLife internal data against industry benchmarks",
    },
    {
      value: "80%",
      label: "average app adoption",
      note:
        "Most of your workforce is active on YuLife, so every benefit in the " +
        "hub reaches the many, not the few.",
      source: "YuLife internal data, 2025",
    },
    {
      value: "18x",
      label: "more app engagement than the industry average",
      note:
        "Your people open YuLife far more often than a typical health app. " +
        "The hub is already where they are.",
      source:
        "YuLife internal data, 2025, against published health and fitness app benchmarks",
    },
  ],
};

// § "Make every benefit easier to find and use" (Figma 2896:14747) — the
// scroll section with the windowed parallax visual. Copy verbatim from the
// design (double space in "know  to look" and the straight apostrophe in
// "company's" normalised). Each block's foreground is exported art (4x WebP),
// positioned in the design's 400px window coordinates.
const hubWindow: EverydayValueWindow = {
  size: 400,
  background: { src: "/products/wellbeing-hub/hub-window-bg.webp", width: 750, height: 1624 },
  backgroundHeight: 868,
};

const serviceCard = (src: string, alt: string, y: number): EverydayValueLayer => ({
  src,
  alt,
  width: 1103,
  height: 356,
  x: 63,
  y,
  w: 275.75,
  shadow: true,
});

const benefitsHub: EverydayValueData = {
  eyebrow: "Employee Benefits Hub",
  heading: "Make every benefit easier to find and use",
  accent: "easier",
  lead:
    "Employee benefits are often spread across different providers, portals and " +
    "logins. YuLife brings them together in one simple Wellbeing Hub, alongside " +
    "the everyday experience your people already use to build healthy habits and " +
    "earn rewards.",
  window: hubWindow,
  blocks: [
    {
      title: "Your whole benefits package, in their pocket",
      body: [
        "Bring your EAP, Virtual GP, wellbeing services and your company’s own " +
          "employee benefits into one easy-to-navigate hub.",
        "Benefits are grouped into categories your people can filter by, so they " +
          "don’t have to remember which provider, portal or login they need when " +
          "they’re looking for support.",
      ],
      layers: [
        {
          src: "/products/wellbeing-hub/hub-header-card.webp",
          alt: "The Wellbeing Hub in the YuLife app, with benefits filtered by category",
          width: 1309,
          height: 901,
          x: 41,
          y: 91,
          w: 327.25,
        },
      ],
    },
    {
      title: "Make your existing benefits work harder",
      body: [
        "Putting benefits somewhere people regularly engage makes them easier to " +
          "discover when they’re needed.",
        "Instead of another benefits portal employees have to remember to visit, " +
          "the Wellbeing Hub sits inside the same YuLife experience they use for " +
          "challenges, rewards and everyday wellbeing.",
      ],
      layers: [
        serviceCard("/products/wellbeing-hub/hub-card-yumatter.webp", "YuMatter: mental health support when you need it", 45),
        serviceCard("/products/wellbeing-hub/hub-card-sleep-cycle.webp", "Sleep Cycle: improve your sleep and wake up refreshed", 156),
        serviceCard("/products/wellbeing-hub/hub-card-breathwrk.webp", "Breathwrk: mental health support when you need it", 267),
      ],
    },
    {
      title: "Simple for HR to manage",
      body: [
        "Manage your benefits from the Employer Portal. Add new benefits, organise " +
          "them by category, control who can see them using eligibility rules and " +
          "choose the order in which they appear.",
        "No separate IT project, and no need to rebuild your existing benefits " +
          "package. Just one place your people know to look.",
      ],
      layers: [
        {
          src: "/products/wellbeing-hub/hub-portal-form.webp",
          alt: "Adding a benefit in the Employer Portal",
          width: 1406,
          height: 1408,
          x: 49,
          y: 48,
          w: 351.5,
        },
      ],
    },
  ],
};

const benefitsHubPanel: EverydayValuePanel = {
  heading: "Give your people a benefit worth coming back to",
  accent: "coming back",
  align: "center",
  paragraphs: [
    "Bring your employee benefits and wellbeing services together in one place " +
      "your people know to look.",
  ],
  cta: speakToTeam,
};

/** FAQ copy transcribed from Figma 2896:15009 (10 · FAQ). */
const faqs: FaqEntry[] = [
  {
    question: "What is an employee benefits hub?",
    answer:
      "An employee benefits hub gives employees one place to find and access the " +
      "benefits and support available through their employer. YuLife's Wellbeing " +
      "Hub brings company benefits together with insurance-linked services and " +
      "wellbeing support inside the YuLife app.",
  },
  {
    question: "What benefits can we add to the Wellbeing Hub?",
    answer:
      "You can add your company's own benefits alongside services available " +
      "through YuLife, such as EAP, Virtual GP and wellbeing support. Benefits can " +
      "be organised into categories so employees can quickly find what they need.",
  },
  {
    question: "Can we add benefits from other providers?",
    answer:
      "Yes. The Wellbeing Hub is designed to bring your wider benefits offering " +
      "together, including benefits provided outside YuLife.",
  },
  {
    question: "Can different employees see different benefits?",
    answer:
      "Yes. Eligibility rules allow you to control which benefits are visible to " +
      "different groups of employees.",
  },
  {
    question: "How do employees find their benefits?",
    answer:
      "Employees access the Wellbeing Hub through the YuLife app. Benefits are " +
      "grouped into categories they can filter by, so they can find the right " +
      "support without having to remember different providers and portals.",
  },
  {
    question: "Can HR manage the benefits in the hub?",
    answer:
      "Yes. HR teams can manage benefits through the Employer Portal, including " +
      "adding benefits, organising them by category, setting eligibility and " +
      "controlling how they appear to employees.",
  },
  {
    question: "Does YuLife replace our existing benefit providers?",
    answer:
      "No. The Wellbeing Hub can bring existing benefits and providers together in " +
      "one employee experience, helping your people discover and access the " +
      "benefits you already offer.",
  },
];

// § Closing card (Figma 2896:15020), copy from the design.
const closingCard: JoinMissionContent = {
  heading: "Make every benefit easier to find",
  accent: "easier",
  body:
    "Bring your employee benefits and wellbeing services together in one place " +
    "your people know to look.",
  cta: speakToTeam,
};

export default function Page() {
  return (
    <>
      <ImageRightHero {...hero} />
      {/* Client logo marquee — logos only, on its own raised band (Figma
          LogoSection 2896:14689). LogoMarquee carries its own vertical padding. */}
      <section
        className="border-b border-line-emphasis bg-surface-inverse-raised"
        aria-label="Trusted by leading organisations"
      >
        <LogoMarquee />
      </section>
      <ProvenRoiSection data={benefitsProof} surface="inverse" />
      <EverydayValueSection
        data={benefitsHub}
        panel={benefitsHubPanel}
        surface="inverse-raised"
      />
      {/*
        Backgrounds alternate through the stack; the shared sections below reuse
        home content (Four Pillars / Yunity, testimonials, awards, final CTA),
        exactly as the design composes them from pre-existing sections.
      */}
      <PillarsSection firstBand="inverse" />
      <TrustedSection surface="inverse" />
      <FaqSection faqs={faqs} surface="inverse-raised" />
      <JoinMissionCard surface="inverse" content={closingCard} />
    </>
  );
}
