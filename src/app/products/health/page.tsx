import type { Metadata } from "next";
import ImageRightHero, { type ImageRightHeroContent } from "@/components/sections/ImageRightHero";
import LogoMarquee from "@/components/blocks/LogoMarquee";
import QuoteBlock from "@/components/blocks/QuoteBlock";
import EverydayValueSection from "@/components/sections/EverydayValueSection";
import ClinicalExcellenceSection from "@/components/sections/ClinicalExcellenceSection";
import ProvenRoiSection from "@/components/sections/ProvenRoiSection";
import YunitySection from "@/components/sections/YunitySection";
import FaqSection from "@/components/sections/FaqSection";
import JoinMissionCard from "@/components/sections/JoinMissionCard";
import type {
  Cta,
  FaqEntry,
  EverydayValueSection as EverydayValueData,
  EverydayValuePanel,
  ClinicalExcellenceSection as ClinicalExcellenceData,
  ProvenRoiSection as ProvenRoiData,
  YunitySection as YunityData,
} from "@/data/pages/types";
import { assetPath } from "@/lib/assetPath";

/*
  Group Health Insurance — bespoke product page assembled from existing section
  components (Figma node 2179:2051, YuLife Website Design System). Replaces the
  SimpleHero stub on /products/health.

  Copy is transcribed verbatim from the approved "Group Health Insurance" Google
  Doc (the source of truth), preserving its unicode footnote superscripts. Two
  on-canvas elements the doc omits are transcribed from the Figma canvas and
  marked ⚑ below for review:
    · The Dan Sullivan QuoteBlock (§3).
    · The "YuLife works with or without insurance" panel (§4 closing card).
  Authored-to-ToV lines (neither doc nor design supplies them) are also marked ⚑:
    · The ClinicalExcellence supporting paragraph.
    · The three Proven-ROI flip-card notes (the doc gives only value + source).
  The nine benefit-card icons reuse existing /products spot illustrations — the
  design's own grid is in a repeated-placeholder state — so they should be
  swapped for final art later. Hero phone + Dan Sullivan headshot are exported
  from the Figma file.
*/

export const metadata: Metadata = {
  title: "Group Health Insurance for Business | YuLife & Bupa",
  description:
    "Private medical cover underwritten by Bupa, plus a daily wellbeing app your " +
    "people actually use. Fast access to expert care, and rewards for healthy habits.",
};

const speakToTeam: Cta = { label: "Speak to our team", href: "/contact" };

// § Hero (§1–§2) — headline, sub-headline + body, carrier lockup and ratings
// verbatim from the doc. The sub-headline is folded into `body` (the hero has a
// single copy slot). Visual is the exported Bupa "Health insurance" phone.
const hero: ImageRightHeroContent = {
  eyebrow: "Group health insurance",
  headline: {
    lead: "A game-changing approach to group health insurance",
  },
  body:
    "Two powerful partners. One unique health benefit. YuLife and Bupa combine " +
    "daily engagement that rewards healthy living with fast access to expert " +
    "care when your people need it most.",
  ctas: [speakToTeam],
  carrier: {
    name: "Bupa",
    logo: { src: assetPath("/logos/carriers/bupa.svg"), width: 123, height: 32 },
  },
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

// § "What is group health insurance?" (§3) — heading + explainer paragraphs
// transcribed verbatim from the Figma canvas (node 2390:2547), closing on the
// Dan Sullivan QuoteBlock.
const introParagraphs: readonly string[] = [
  "Group health insurance is private medical cover an employer buys for their " +
    "whole team, usually at better rates than individuals can get alone.",
  "It pays for private diagnosis and treatment, so people are seen faster than " +
    "they would be otherwise. Bupa provides the cover and pays the claims. " +
    "YuLife adds the daily wellbeing experience, the rewards and the insight on top.",
];

// ⚑ Design-sourced (not in the copy doc) — transcribed from the Figma QuoteBlock.
const carrierQuote = {
  text:
    "Employers are looking for solutions that not only support people when they " +
    "become unwell, but help them stay healthy in the first place.",
  author: "Dan Sullivan",
  role: "Director of Product and Proposition",
  avatar: "/people/dan-sullivan.jpg",
};

const bupaLogo = { src: "/logos/carriers/bupa.svg", alt: "Bupa" } as const;

// § "What we solve for" (§4) — heading/lead/body and the three problem blocks
// verbatim from the doc. Illustrations reuse existing everyday spot art.
const solveFor: EverydayValueData = {
  eyebrow: "What we solve for",
  heading: "The workplace is evolving. So should your health benefits",
  accent: "benefits",
  lead: "Employee wellbeing matters more than ever, but people expect more than a safety net.",
  body: "They want support that helps them feel better, live healthier and stay motivated every day.",
  blocks: [
    {
      title: "There is a long-term health crisis",
      body:
        "41% of adults aged 16 and older in England have at least one " +
        "longstanding illness or condition.¹",
      image: "/products/everyday/video-call.png",
      alt: "",
    },
    {
      title: "Current tools engage few, not many",
      body:
        "Under 2% current utilisation of intervention tools, EAP and " +
        "telemedicine.²",
      image: "/products/everyday/thought-bubble.png",
      alt: "",
    },
    {
      title: "Insurance costs are rising",
      body:
        "Rising premiums mean preventative health and wellbeing support should " +
        "be a priority, not an extra.",
      image: "/products/everyday/tooth.png",
      alt: "",
    },
  ],
};

// ⚑ Design-sourced (not in the copy doc) — the closing "app-only" panel card.
const solveForPanel: EverydayValuePanel = {
  heading: "YuLife works with or without insurance",
  paragraphs: [
    "YuLife is available as an app-only benefit: the wellbeing experience, the " +
      "rewards and the employer insights, with no cover attached.",
    "Most businesses come to us for the cover and get the app with it. Some " +
      "start with the app and add cover later. Both work.",
  ],
};

// § "What you get with your group health insurance" (§5) — the nine benefit
// titles + descriptions verbatim from the doc (with its ³⁴⁵⁶ superscripts).
// Icons reuse existing /products illustrations (design grid is placeholder).
const benefitCards: readonly { icon: string; title: string; body: string }[] = [
  {
    icon: "/products/everyday/video-call.png",
    title: "Private medical treatment",
    body:
      "Inpatient, day-patient and outpatient care, diagnostics and scans. " +
      "Access to 900 facilities nationwide and 21,000 consultants.",
  },
  {
    icon: "/products/clinical/test-tube.svg",
    title: "Full cancer cover as standard",
    body:
      "Specialist cancer centres, same-day all-clear or referral, and all " +
      "eligible treatment costs covered in full for as long as your employee " +
      "has Bupa health cover.³",
  },
  {
    icon: "/products/everyday/thought-bubble.png",
    title: "Market-leading mental health cover",
    body:
      "Bupa covers more mental health conditions than any other leading " +
      "insurer. No time limits on outpatient treatment, and up to 45 days " +
      "inpatient a year.⁴",
  },
  {
    icon: "/products/clinical/dumbbell.svg",
    title: "Direct Access",
    body:
      "Employees can go straight to Bupa about cancer, mental health or muscle, " +
      "bone and joint problems, without seeing a GP first.⁵",
  },
  {
    icon: "/products/everyday/medikit.png",
    title: "Digital GP, day or night",
    body:
      "24/7 GP appointments and private prescriptions through the Bupa app, " +
      "including weekends and bank holidays.",
  },
  {
    icon: "/products/everyday/tooth.png",
    title: "Dental cover",
    body:
      "Routine examinations, scale and polish, fillings and emergency " +
      "treatment. Full cover at Bupa Dental Care practices, cash back at any " +
      "recognised dentist.",
  },
  {
    icon: "/products/everyday/video-call.png",
    title: "A benefit they open every day",
    body:
      "Walking, cycling, meditation and daily challenges earn YuCoin, spendable " +
      "at Amazon, Nike and Tesco or donated to charity. 1 in 2 members engage " +
      "daily.",
  },
  {
    icon: "/products/everyday/medikit.png",
    title: "The Wellbeing Pass, worth up to £1,400",
    body:
      "Unlocked through everyday engagement. A Bupa health assessment, at-home " +
      "blood tests, a Garmin watch, gym discounts, an eye test and more.⁶",
  },
  {
    icon: "/products/everyday/thought-bubble.png",
    title: "Wellbeing insights in your portal",
    body:
      "Real-time engagement, eNPS and risk trends across burnout and absence. " +
      "Always anonymised and aggregated, never individual.",
  },
];

const sourcesFootnote =
  "¹ Health Survey for England, 2022 Part 2 Adults’ health, NHS England Digital, " +
  "published 24 September 2024. ² Industry benchmarks provided by HealthHero and " +
  "Healthcare RM, 12-month period April 2024 to March 2025. ³ Subject to cover. " +
  "Employees must use a Bupa network hospital and a Bupa recognised consultant " +
  "charging within Bupa’s rates. ⁴ As of September 2025, based on Bupa’s and " +
  "Defaqto’s interpretation of differences between Bupa’s SME Select and other " +
  "health insurance products offering mental health cover. ⁵ Any onward referrals " +
  "are subject to the benefits and exclusions of your cover. ⁶ Rewards through the " +
  "Wellbeing Pass are unlocked over time through engagement with the YuLife app " +
  "and are not immediately available. Not every product or service is available " +
  "to claim each policy year.";

const whatYouGet: ClinicalExcellenceData = {
  eyebrow: "What you get with your group health insurance",
  heading: "Best of prevention meets best of private healthcare",
  // ⚑ Authored to ToV — the doc/design supply no supporting line for §5.
  body:
    "Private medical cover from Bupa and a daily wellbeing experience from " +
    "YuLife, in one benefit — so your people stay well, and get seen fast when " +
    "they’re not.",
  cards: benefitCards.map(({ icon, title, body }) => ({ icon, alt: "", title, body })),
  footnote: sourcesFootnote,
};

// § "The proof" (§6) — the three ROI figures + sources verbatim from the doc.
// ⚑ The flip-card `note` on each is authored to ToV (the doc gives only the
// value + source; the reverse face copy is not in the doc or design).
const provenRoi: ProvenRoiData = {
  eyebrow: "The proof",
  heading: "Independently verified. Consistently delivered.",
  body:
    "As your people engage with their Bupa and YuLife health benefit, expect to " +
    "see measurable business impact. Every figure below comes from independent " +
    "research or verified platform data.",
  stats: [
    {
      value: "1 in 2",
      label: "members engage daily",
      note:
        "Half your team opens YuLife every day — walking, meditating, earning " +
        "rewards. Not once. As a habit that sticks.",
      source: "YuLife internal data, May 2025",
    },
    {
      value: "80 NPS",
      label: "for outpatient and hospital treatment experience",
      note:
        "Members rate their outpatient and hospital treatment experience with " +
        "Bupa at an exceptional 80 NPS.",
      source: "Bupa internal data, 2025",
    },
    {
      value: "11.5%",
      label: "reduction in absenteeism",
      note:
        "When wellbeing is part of daily life, fewer sick days follow — not just " +
        "on the day a claim is made.",
      source: "Forrester Total Economic Impact of YuLife",
    },
  ],
};

// § Yunity — the same band as the homepage, with the design's wording (which
// matches the homepage copy). ⚑ Yunity step copy is design-/home-sourced.
const yunity: YunityData = {
  heading: "The more your people use it,\nthe smarter it gets",
  emphasis: ["more", "smarter"],
  body:
    "Yunity sits beneath the YuLife experience, quietly turning everyday " +
    "engagement into insight. It helps YuLife understand what’s changing in " +
    "people’s lives, interpret what that means, and guide more relevant, timely " +
    "support.",
  steps: [
    {
      title: "Sense",
      description: "capture real-time lifestyle data that traditional models miss.",
    },
    {
      title: "Interpret",
      description: "spot the subtle shifts that often signal rising stress or physical risk.",
    },
    {
      title: "Guide",
      description: "trigger support early, to protect health and prove return on investment.",
    },
  ],
};

// § FAQs — the six Q&As transcribed verbatim from the doc.
const faqs: readonly FaqEntry[] = [
  {
    question:
      "What does YuLife's group health insurance cover and how does it benefit employees?",
    answer:
      "YuLife's group health insurance is underwritten by Bupa, one of the UK's leading private medical insurers - meaning Bupa is responsible for paying claims, while YuLife delivers the employee engagement, wellbeing tools and daily rewards on top. The policy provides fast access to private medical care, including inpatient and day-patient treatment, outpatient consultations, diagnostic tests and scans, and full cancer cover. Employees also benefit from a 24/7 virtual GP via Bupa's Blua digital service, private prescriptions, and access to YuLife's gamified wellbeing tools - earning YuCoin for healthy habits redeemable at Amazon, Nike and Tesco.",
  },
  {
    question:
      "How does YuLife's group health insurance provide faster access to specialists?",
    answer:
      "Through Bupa's Connected Care model, employees can access cancer, mental health and musculoskeletal (MSK) treatment directly without needing a GP referral first. Bupa shortlists specialist consultants based on location, waiting times and fee-assured network membership, so employees are guided to the right care quickly. For cancer, results for key conditions can be returned within 2–4 days, with treatment starting within 31 days of first contact. For MSK, face-to-face or virtual physiotherapy is available within 2 days.",
  },
  {
    question:
      "What mental health cover is included in YuLife's group health insurance?",
    answer:
      "YuLife's group health insurance includes Bupa's mental health cover, which is broader than any other leading UK insurer and covering more conditions, with no time limits for outpatient treatment and inpatient cover of up to 45 days per year. Employees also have access to Bupa's Family Mental HealthLine and the 24/7 Anytime HealthLine, and can access mental health support directly through Bupa's Connected Care model without a GP referral. One course of addiction treatment per lifetime is also included.",
  },
  {
    question:
      "How does YuLife's group health insurance protect employee data and privacy?",
    answer:
      "All personal data within YuLife's group health insurance platform is handled with the highest level of protection. Employers receive high-level insights through the Yunity portal, but all data is strictly anonymised and aggregated. Employers can see broad trends across a department but can never access individual activity or personal health data.",
  },
  {
    question:
      "Is YuLife's group health insurance more cost-effective than other private medical cover?",
    answer:
      "Yes. Because YuLife's group health insurance is purchased as a group policy underwritten by Bupa, employers benefit from collective rates typically lower than individual private medical cover. The policy is available for businesses with as few as 2 employees, with a choice of cover levels - Key, Enhanced and Complete - allowing employers to tailor the level of outpatient, therapy and hospital access to suit their budget. Dental cover can also be added to the same policy.",
  },
  {
    question:
      "How does YuLife's group health insurance simplify administration while providing business insight?",
    answer:
      "YuLife's group health insurance consolidates private medical cover, virtual healthcare, mental health support and daily wellbeing rewards into a single platform, removing the need for multiple vendor contracts. Through the employer portal, businesses receive a real-time dashboard showing eNPS scores and risk distributions for burnout and absenteeism, with data-led insights proven to deliver a 12% reduction in sickness absence and 25% lower claims risk.",
  },
];

export default function Page() {
  return (
    <>
      <ImageRightHero {...hero} />

      {/* Client logo marquee — logos only (the design shows no stat cards here;
          the trust figures live in "The proof" band below). LogoMarquee carries
          its own vertical padding, so no extra wrapper spacing. */}
      <section
        className="border-b border-line-emphasis bg-surface-inverse-raised"
        aria-label="Trusted by leading organisations"
      >
        <LogoMarquee />
      </section>

      {/* § What is group health insurance? — heading + explainer paragraphs in a
          two-column layout, closing on the carrier QuoteBlock (with the Bupa
          mark). */}
      <section className="border-b border-line-emphasis bg-surface-inverse">
        <div className="page-container-wide section-y-lg flex flex-col gap-section-gap">
          <div className="grid gap-flow desktop:grid-cols-2 desktop:gap-x-section-gap">
            <div className="flex flex-col gap-related">
              <p className="type-eyebrow uppercase text-accent-purple">
                What is group health insurance?
              </p>
              <h2 className="type-heading-h2 max-w-[18ch] text-balance text-on-inverse">
                Health insurance your people will value{" "}
                <em className="italic">every day</em>
              </h2>
            </div>
            <div className="flex flex-col gap-flow type-body-lg text-on-inverse">
              {introParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
          <QuoteBlock
            quote={carrierQuote.text}
            author={carrierQuote.author}
            role={carrierQuote.role}
            avatar={carrierQuote.avatar}
            partnerLogo={bupaLogo}
          />
        </div>
      </section>

      <EverydayValueSection
        data={solveFor}
        panel={solveForPanel}
        surface="inverse-raised"
      />

      {/* Backgrounds alternate dark → raised down the page (Figma 2179:2051):
          What-is (dark) · solve-for (raised) · what-you-get (dark) · proof
          (raised) · Yunity (dark) · FAQ (raised) · closing CTA (dark). */}
      <ClinicalExcellenceSection data={whatYouGet} surface="inverse" />

      <ProvenRoiSection data={provenRoi} surface="inverse-raised" />

      <YunitySection data={yunity} surface="inverse" />

      <FaqSection faqs={faqs} surface="inverse-raised" />
      <JoinMissionCard surface="inverse" />
    </>
  );
}
