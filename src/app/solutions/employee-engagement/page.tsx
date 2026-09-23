import type { Metadata } from "next";
import ImageRightHero, { type ImageRightHeroContent } from "@/components/sections/ImageRightHero";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import ProvenRoiSection from "@/components/sections/ProvenRoiSection";
import EverydayValueSection from "@/components/sections/EverydayValueSection";
import PillarsSection from "@/components/sections/PillarsSection";
import ClinicalExcellenceSection from "@/components/sections/ClinicalExcellenceSection";
import FaqSection from "@/components/sections/FaqSection";
import JoinMissionCard from "@/components/sections/JoinMissionCard";
import type {
  Cta,
  FaqEntry,
  ProvenRoiSection as ProvenRoiData,
  EverydayValueSection as EverydayValueData,
  EverydayValuePanel,
  ClinicalExcellenceSection as ClinicalExcellenceData,
} from "@/data/pages/types";
import { getPageByRoute } from "@/data/sitemap";
import { assetPath } from "@/lib/assetPath";

/*
  Employee Engagement — bespoke solutions page assembled entirely from existing
  section components (Figma node 2732:17301, YuLife Website Design System).
  Replaces the SimpleHero stub on /solutions/employee-engagement.

  Copy is transcribed verbatim from the Figma design (the source of truth). Two
  literal transcriptions in the design look like unfinished placeholders and are
  kept verbatim per the brief, marked ⚑ below:
    · Stat-fan card 1 reads "£120 / employees covered globally" (a money value
      against an employee-count label; that label pairs with "1m+" elsewhere).
    · The §7 heading reads "…engagement event more" (almost certainly "even").
  Authored-to-ToV lines the design doesn't supply are also marked ⚑:
    · The three stat-fan hover-back notes + sources (the design shows the card
      fronts only).
  Spot illustrations (the §4 blocks and the §7 explore cards) reuse the existing
  /products/everyday PNGs as placeholders — the design's own 3D icons aren't in
  the repo — exactly as the Health and Cash Plan pages do. Swap for final art
  later. The hero phone reuses the in-repo "Bupa · Health insurance" screen
  (/products/hero-health-phone.png), which the design's hero shows.

  Backgrounds alternate dark → raised down the page, matching the design's own
  bands (sampled from the export) and the repo's section-alternation rule:
  hero (inverse) · marquee (raised) · engagement fan (inverse) · reason-to-come-
  back (raised) · platform+Yunity (inverse→raised, one PillarsSection) · explore
  (inverse) · FAQ (raised) · closing CTA (inverse).
*/

const page = getPageByRoute("/solutions/employee-engagement");

export const metadata: Metadata = {
  title: page.label,
  description: page.purpose,
};

const speakToTeam: Cta = { label: "Speak to our team", href: "/contact" };

// § Hero (§1) — eyebrow, italic-accent headline, body, ratings. No carrier
// lockup (this is the app benefit, not a carrier product). Visual is the
// in-repo Bupa "Health insurance" phone the design shows.
const hero: ImageRightHeroContent = {
  eyebrow: "Employee engagement",
  headline: {
    // Explicit breaks so the headline lands on the design's three lines —
    // "Turn employee" / "benefits into a" / italic "daily habit". ImageRightHero
    // renders the h1 with whitespace-pre-line, so the \n break points hold.
    lead: "Turn employee\nbenefits into a\n",
    accent: "daily habit",
  },
  body:
    "Most insurance only shows up when something goes wrong. YuLife gives your " +
    "people a reason to engage every day, with healthy challenges, team " +
    "competitions, and valuable rewards that keep their wider benefits visible " +
    "and valuable.",
  ctas: [speakToTeam],
  ratings: [
    { platform: "Trustpilot", score: "4.9" },
    { platform: "Capterra", score: "4.8" },
    { platform: "App Store", score: "4.9" },
  ],
  visual: {
    kind: "device",
    src: assetPath("/products/hero-health-phone.png"),
    width: 436,
    height: 736,
  },
};

// § "Engagement you can see. Impact you can measure" (§3) — centred header (no
// eyebrow) over the three-card StatCardFan. Values + labels verbatim from the
// design; the hover-back note + source on each are authored to ToV. ⚑ Card 1's
// "£120" is transcribed literally from the design (see file header).
const engagementProof: ProvenRoiData = {
  eyebrow: "",
  // Two lines, breaking after the first sentence, as the design sets it.
  heading: "Engagement you can see.\nImpact you can measure",
  emphasis: ["see", "measure"],
  body:
    "YuLife is designed to turn everyday engagement into healthier behaviour, " +
    "greater benefit utilisation and stronger connection across your workforce.",
  stats: [
    {
      // ⚑ Verbatim from the design — looks like an unfinished placeholder.
      value: "£120",
      label: "employees covered globally",
      // ⚑ Authored to ToV — the design shows the card front only.
      note:
        "One of the UK’s most widely held employee benefits, trusted by teams " +
        "from startups to global enterprises.",
      source: "YuLife internal data, 2026",
    },
    {
      value: "80%",
      label: "adoption",
      // ⚑ Authored to ToV.
      note:
        "Most of the workforce actively uses YuLife, so the benefit reaches the " +
        "many, not the few.",
      source: "YuLife internal data, 2026",
    },
    {
      // Approved figure from the copy doc (the design shows 12x; confirmed
      // 2026-09-23 that 18x is correct).
      value: "18x",
      label: "more app engagement than the industry average",
      // ⚑ Authored to ToV.
      note:
        "Your people open YuLife far more often than a typical benefits " +
        "platform — a daily habit, not a once-a-year login.",
      source:
        "YuLife internal data, 2025, against published health and fitness app benchmarks",
    },
  ],
};

// § "Give people a reason to come back" (§4) — the shared scroll-scrollytelling
// section: two-col header, a pinned illustration stepping through three value
// blocks, closing on the CTA panel. Copy verbatim from the design; block
// illustrations reuse the /products/everyday spots as placeholders.
const reasonToComeBack: EverydayValueData = {
  eyebrow: "Daily wellbeing experience",
  // Three lines — "Give people a" / italic "reason to come" / "back".
  heading: "Give people a\nreason to come\nback",
  accent: "reason",
  lead:
    "YuLife makes wellbeing easy to return to, with fresh reasons to engage " +
    "every day.",
  body:
    "From individual rewards to shared challenges, small actions build healthier " +
    "habits and stronger connections across your team.",
  blocks: [
    {
      title: "Healthy habits that pay",
      body:
        "Walking. Cycling. Meditation. Yudoku. Everyday healthy activities earn " +
        "YuCoin to spend on rewards from 50+ brands, or donate to causes " +
        "employees care about.",
      image: "/products/everyday/video-call.png",
      alt: "",
    },
    {
      title: "Make wellbeing a team sport",
      body:
        "Step duels, team challenges, and company-wide leaderboards turn healthy " +
        "habits into shared experiences. From a 5-minute walk to topping the " +
        "company leaderboard, everyone has a way to take part.",
      image: "/products/everyday/medikit.png",
      alt: "",
    },
    {
      title: "Keep your benefits front of mind",
      body:
        "Regular engagement means employees are more likely to discover the " +
        "support already available to them when they need it.",
      image: "/products/everyday/thought-bubble.png",
      alt: "",
    },
  ],
};

const reasonPanel: EverydayValuePanel = {
  heading: "Give your people a benefit\nworth coming back to",
  paragraphs: [
    "Turn insurance into an everyday experience that helps people build " +
      "healthier habits, connect with colleagues, and get more from their " +
      "benefits.",
  ],
  cta: speakToTeam,
};

// § "Level-up your engagement even more" (§7) — the static (icon+title only)
// RevealCardGrid via ClinicalExcellenceSection, no supporting paragraph. Titles
// verbatim from the design; icons reuse the /products/everyday spots as
// placeholders. ⚑ The design heading reads "engagement event more" — kept
// verbatim; "event" is almost certainly a typo for "even".
const exploreMore: ClinicalExcellenceData = {
  eyebrow: "Explore more",
  // Two lines — italic "Level-up your engagement" / "event more".
  heading: "Level-up your engagement\nevent more",
  accent: "Level-up",
  body: "",
  cards: [
    { icon: "/products/everyday/video-call.png", alt: "", title: "Rewards" },
    { icon: "/products/everyday/medikit.png", alt: "", title: "Reward & Recognition" },
    { icon: "/products/everyday/thought-bubble.png", alt: "", title: "Employee Surveys" },
  ],
};

// § FAQs (§8) — five Q&As transcribed verbatim from the design. Heading, intro
// and Help Hub CTA reuse FaqSection's defaults.
const faqs: readonly FaqEntry[] = [
  {
    question: "How does YuLife improve employee engagement?",
    answer:
      "YuLife brings insurance, wellbeing, and rewards into one app, giving " +
      "employees regular reasons to engage with their benefits rather than only " +
      "thinking about them when they need to claim.",
  },
  {
    question: "How does YuLife’s gamification work?",
    answer:
      "Employees earn YuCoin for everyday activities such as walking, cycling, " +
      "and meditation, and can take part in challenges, step duels, and " +
      "leaderboards. It makes healthy behaviour feel rewarding rather than like " +
      "another task.",
  },
  {
    question: "Can everyone take part?",
    answer:
      "Yes. YuLife is designed for different abilities, interests, and working " +
      "environments. A 5-minute walk counts, and meditation, chair-based " +
      "activities, and puzzles can earn YuCoin alongside physical activity.",
  },
  {
    question: "How do you engage deskless employees?",
    answer:
      "Employees access YuLife through the app on their own phone, so they " +
      "don’t need a desktop or company email address to take part.",
  },
  {
    question: "Can employers see individual employee activity?",
    answer:
      "No. Employers see aggregated, anonymised insights through the Employer " +
      "Portal. Individual activity and personal health information remain private.",
  },
];

export default function Page() {
  return (
    <>
      <ImageRightHero {...hero} />

      {/* Client logo marquee — logos only. LogoMarquee carries its own vertical
          padding, so no extra wrapper spacing. */}
      <section
        className="border-b border-line-emphasis bg-surface-inverse-raised"
        aria-label="Trusted by leading organisations"
      >
        <LogoMarquee />
      </section>

      <ProvenRoiSection data={engagementProof} surface="inverse" />

      <EverydayValueSection
        data={reasonToComeBack}
        panel={reasonPanel}
        surface="inverse-raised"
      />

      {/* Platform + Yunity — one section, two bands (band 1 dark, band 2 raised),
          joined by the star roots. Homepage default; firstBand="inverse" keeps
          the alternation running from the raised section above. */}
      <PillarsSection firstBand="inverse" />

      <ClinicalExcellenceSection data={exploreMore} surface="inverse" />

      <FaqSection faqs={faqs} surface="inverse-raised" />
      <JoinMissionCard surface="inverse" />
    </>
  );
}
