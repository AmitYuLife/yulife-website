import type { Metadata } from "next";
import BusinessesHero, {
  type BusinessesHeroContent,
} from "@/components/businesses/BusinessesHero";
import MarqueeStatsSection, {
  type MarqueeStatsContent,
} from "@/components/businesses/MarqueeStatsSection";
import IntroSection, {
  type IntroSectionContent,
} from "@/components/businesses/IntroSection";
import LaunchStepsSection, {
  type LaunchStepsContent,
} from "@/components/businesses/LaunchStepsSection";
import ProductShowcase from "@/components/home/ProductShowcase";
import PillarsSection from "@/components/home/pillars/PillarsSection";
import TrustedSection from "@/components/home/TrustedSection";
import JoinMissionCard from "@/components/home/JoinMissionCard";
import FaqSection from "@/components/product/FaqSection";
import type { FaqEntry } from "@/data/pages/types";
import { getPageByRoute } from "@/data/sitemap";

const route = "/who-we-help/businesses";
const page = getPageByRoute(route);

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

// Hero copy from the Figma design (node 2495:7454). Verify against the approved
// copy doc before launch.
const hero: BusinessesHeroContent = {
  eyebrow: "For businesses",
  headline: {
    lead: "Employee benefits that make a difference ",
    accent: "every day",
  },
  body:
    "YuLife is an AI-forward insurance and wellbeing benefit. We bring group cover, " +
    "daily wellbeing and real rewards into a single experience, with insurance from " +
    "Bupa and MetLife. Available with cover, or as an app-only benefit.",
  cta: { label: "Speak to our team", href: "/contact" },
  ratings: [
    { platform: "Trustpilot", score: "4.9" },
    { platform: "Capterra", score: "4.8" },
    { platform: "App Store", score: "4.9" },
  ],
};

// Stats + intro copy from the Figma design (nodes 2495:7526, 2495:7539). Verify
// against the approved copy doc — and confirm the four figures are cleared for
// the employer audience — before launch.
const marqueeStats: MarqueeStatsContent = {
  stats: [
    { id: "covered", value: "1m+", label: "employees covered globally" },
    { id: "risk", value: "25%", label: "lower risk" },
    { id: "adoption", value: "80%", label: "adoption" },
    { id: "sick-days", value: "12%", label: "fewer sick days" },
  ],
};

const intro: IntroSectionContent = {
  heading: "Where insurance meets wellbeing",
  paragraphs: [
    "We bring group insurance, everyday wellbeing and real rewards into one " +
      "experience, so your people get value from their cover long before they " +
      "ever need to claim.",
    "The result: healthier employees, a business that runs better, lower insurance risk.",
  ],
};

// "3 simple steps" scroll section (Figma node 2495:7546). Copy verbatim from the
// design — verify against the approved copy doc before launch.
const launchSteps: LaunchStepsContent = {
  eyebrow: "3 simple steps",
  heading: "Easy to launch. Even easier to use",
  accent: "easier to use",
  lead: "Upload your team, connect your HR systems, go live.",
  body: "After that, the benefit does the work and the portal tells you what it’s changing.",
  steps: [
    {
      title: "1. Set up",
      body:
        "Upload your team and connect your HR or payroll system. We work with " +
        "over 60 of them, so there’s nothing to build and no spreadsheets to wrangle.",
    },
    {
      title: "2. They make it their own",
      body:
        "Walking, meditating, learning something new: it all earns YuCoin, which " +
        "your people spend on rewards they actually want. 2 in 3 sign up. 1 in 2 " +
        "come back every week.",
    },
    {
      title: "3. You see it working",
      body: [
        "Your portal shows how your team is doing, where people could use more " +
          "support, and what your benefits spend is buying. Always anonymised, " +
          "never individual.",
        "And it gets better the longer you’re with us. What your portal learns " +
          "shapes what your people are offered next, so the support becomes more " +
          "useful over time.",
      ],
    },
  ],
  panel: {
    heading: "YuLife works with or without insurance",
    paragraphs: [
      "YuLife is available as an app-only benefit: the wellbeing experience, the " +
        "rewards and the employer insights, with no cover attached.",
      "Most businesses come to us for the cover and get the app with it. Some " +
        "start with the app and add cover later. Both work.",
    ],
  },
};

// Businesses FAQ (Figma node 1479:2532). Real copy transcribed from the design;
// the heading, intro and Help Hub CTA reuse FaqSection's defaults. Verify against
// the approved copy doc before launch.
const faqs: FaqEntry[] = [
  {
    question: "Can we have YuLife without insurance?",
    answer:
      "Yes. YuLife is available as an app-only benefit, with the wellbeing " +
      "experience, rewards and employer insights but no cover attached. You can " +
      "add insurance later.",
  },
  {
    question: "How does YuLife use AI?",
    answer:
      "Two ways. Preventative AI spots changes in an employee’s wellbeing " +
      "patterns and offers support earlier. Yunity turns those same signals into " +
      "aggregated, anonymised insight for employers. Employers never see " +
      "individual health data.",
  },
  {
    question: "Is my employees’ health data private?",
    answer:
      "Yes. Employers only ever see anonymised trends across the workforce, and " +
      "no group smaller than five people is displayed.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Pricing depends on headcount, cover and workforce profile, so it’s quoted " +
      "per business. Group cover through YuLife is priced comparably to standard " +
      "group cover. The app, rewards and employer insights are included, not " +
      "charged extra.",
  },
  {
    question: "How many employees do you need?",
    answer: "A minimum of 3.",
  },
  {
    question: "Does it integrate with our HR system?",
    answer:
      "Yes, with 60+ HR and payroll systems through a single integration, plus " +
      "SFTP and secure email as alternatives. Most businesses go live inside a " +
      "fortnight.",
  },
];

export default function Page() {
  return (
    <>
      <BusinessesHero {...hero} />
      <MarqueeStatsSection {...marqueeStats} />
      <IntroSection {...intro} />
      <LaunchStepsSection content={launchSteps} />
      {/*
        Below here mirrors the home page (Figma node 1479:2532) — same
        components, same content — but with three extra sections ahead of them
        (marquee/stats, intro, launch steps), section backgrounds must alternate
        starting from a different phase than they do on home, and the FAQ sits
        where home has none. The `surface`/`firstBand` overrides below only flip
        which literal colour each section's *root* takes so backgrounds keep
        alternating through the extra sections; every card/panel inside keeps
        its own fixed colour exactly as on home. FaqSection and JoinMissionCard
        already land on the right colour by default, so they're untouched.
      */}
      <ProductShowcase surface="inverse" />
      <PillarsSection firstBand="inverse-raised" />
      <TrustedSection surface="inverse-raised" />
      <FaqSection faqs={faqs} />
      <JoinMissionCard />
    </>
  );
}
