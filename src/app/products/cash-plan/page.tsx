import type { Metadata } from "next";
import PageHero, { type PageHeroContent } from "@/components/sections/PageHero";
import MarqueeStatsSection, {
  type MarqueeStatsContent,
} from "@/components/sections/MarqueeStatsSection";
import EverydayValueSection, {
  QuoteBlock,
  type CarrierLogo,
} from "@/components/sections/EverydayValueSection";
import ClinicalExcellenceSection from "@/components/sections/ClinicalExcellenceSection";
import FaqSection from "@/components/sections/FaqSection";
import JoinMissionCard from "@/components/sections/JoinMissionCard";
import type {
  Cta,
  Quote,
  FaqEntry,
  EverydayValueSection as EverydayValueData,
  ClinicalExcellenceSection as ClinicalExcellenceData,
} from "@/data/pages/types";
import { assetPath } from "@/lib/assetPath";

/*
  Health Cash Plan — bespoke product page assembled from existing section
  components (Figma node 2520:10230, YuLife Website Design System). Replaces the
  plain ProductPage-template render on this route. Copy is transcribed verbatim
  from the design (the source of truth over the copy doc) EXCEPT:
    · The nine benefit-card body lines, the section-4 supporting sentence and the
      two eyebrow kickers ("The problem", "What's included") are authored to
      YuLife tone of voice — the design shows icon+title only. Marked below.
    · The three trust stats sit as odometer cards under the logo marquee (one
      MarqueeStatsSection band), the Businesses treatment, rather than a
      standalone stats section.
    · Section-3's quote is the shared QuoteBlock card (with the Bupa mark), sitting
      at the foot of the "What is a Health Cash Plan?" section as in the design.
    · Section-5's benefit icons reuse existing /products illustrations as
      placeholders (the design's own grid uses a repeated placeholder glyph).
  CTA hrefs aren't in the design; buttons read "Speak to our team" → /contact.
*/

export const metadata: Metadata = {
  title: "Health Cash Plan for Employees | YuLife",
  description:
    "A Health Cash Plan that pays your team back on everyday health costs and rewards daily wellbeing. Underwritten by Bupa. Powered by YuLife.",
};

const speakToTeam: Cta = { label: "Speak to our team", href: "/contact" };

// § Hero — headline, body, carrier lockup and ratings verbatim from the design.
const hero: PageHeroContent = {
  headline: {
    lead: "Game-changing cash plan designed for ",
    accent: "every day use",
  },
  body:
    "We’re bringing together Bupa’s trusted insurance expertise and care " +
    "pathways with YuLife’s daily wellbeing experience, so health benefits are " +
    "used, understood, and valued as part of daily life, not just at the point " +
    "of claim.",
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
  // The design's hero phone (node 2520:10234), exported from Figma: the Bupa ×
  // YuLife Health Cash Plan app screen. Device mockup, no orbiting coins.
  visual: {
    kind: "device",
    src: assetPath("/products/hero-cash-plan-phone.png"),
    width: 436,
    height: 760,
  },
};

// § "What is a Health Cash Plan?" — four explainer paragraphs, verbatim.
const introParagraphs: readonly string[] = [
  "A health cash plan pays your employees money back on everyday healthcare " +
    "costs they would otherwise pay for themselves. Dental check-ups, new " +
    "glasses, physiotherapy, prescriptions.",
  "They pay the bill, claim it back, and are reimbursed up to an annual " +
    "allowance for each category. No referral needed.",
  "It isn’t private medical insurance. A cash plan covers routine, everyday " +
    "care rather than the diagnosis and treatment of new conditions, which " +
    "makes it a lower-cost way to give your whole team something they will use " +
    "several times a year. All pre-existing conditions are covered, across " +
    "every benefit.",
  "YuLife’s health cash plan is underwritten by Bupa. Bupa provides the cover " +
    "and pays the claims. YuLife adds the daily wellbeing experience, the " +
    "rewards, and the insight on top.",
];

// § Carrier quote — verbatim; Richard Norris headshot already in /public. Sits
// as a QuoteBlock card at the foot of the "What is a Health Cash Plan?" section,
// with the Bupa mark, exactly as the design places it.
const carrierQuote: Quote = {
  text:
    "This partnership will help more people to take charge of their everyday " +
    "health and wellbeing, while also offering reassurance that high-quality " +
    "healthcare is there when it’s needed.",
  author: "Richard Norris",
  role: "General Manager for Business & Specialist Products",
  avatar: "/people/richard-norris.jpg",
};

const bupaLogo: CarrierLogo = { src: "/logos/carriers/bupa.svg", alt: "Bupa" };

// § "What we solve for" — heading/lead and the three problem blocks verbatim.
// The `eyebrow` kicker and the second header sentence (`body`) are authored to ToV.
const solveFor: EverydayValueData = {
  eyebrow: "The problem",
  heading: "What we solve for",
  lead: "Health benefits only work if people use them.",
  body:
    "Most cover only proves its worth at the point of claim. Everyday health " +
    "is where a benefit is felt, or forgotten.",
  blocks: [
    {
      title: "Everyday health costs land on employees",
      body:
        "Dental, optical, and physiotherapy sit outside private medical cover, " +
        "so people either absorb the cost or put the treatment off.",
      image: "/products/everyday/video-call.png",
      alt: "",
    },
    {
      title: "The tools people already have go unused",
      body:
        "Under 2% current utilisation of intervention tools, EAP, and " +
        "telemedicine across the industry.¹",
      image: "/products/everyday/thought-bubble.png",
      alt: "",
    },
    {
      title: "Benefits budgets are under pressure",
      body:
        "Rising costs mean everyday support has to be affordable enough to " +
        "offer everyone, not just a few.",
      image: "/products/everyday/tooth.png",
      alt: "",
    },
  ],
};

// Closing callout card for the "What we solve for" section (design: heading +
// button, no supporting paragraph).
const solveForPanel = {
  heading: "Let’s make every day health happen.",
  paragraphs: [] as readonly string[],
  cta: speakToTeam,
};

// § "What you get" — titles verbatim; body lines authored to ToV. Icons reuse
// existing /products illustrations as placeholders (cycled), matching the
// placeholder state of the design's own grid.
const benefitIcons = [
  "/products/everyday/medikit.png",
  "/products/everyday/video-call.png",
  "/products/everyday/tooth.png",
  "/products/everyday/thought-bubble.png",
] as const;

const benefitTitles: readonly [string, string][] = [
  [
    "Money back on everyday health costs",
    "Dental, optical, physiotherapy, prescriptions and more, reimbursed up to a yearly allowance for each category.",
  ],
  [
    "Therapies, consultations and diagnostics",
    "Physiotherapy, osteopathy, acupuncture, specialist consultations and diagnostic scans, all without a referral.",
  ],
  [
    "Hospital and Bupa health benefits",
    "Cash towards hospital stays, plus a Bupa allowance for clinics, health assessments and targeted health plans.",
  ],
  [
    "Pre-existing conditions covered",
    "Every benefit covers pre-existing conditions from day one, with nothing excluded and no waiting period.",
  ],
  [
    "Cover for the whole family",
    "Add a partner and up to four children to the age of 24, each with their own full benefit allowance.",
  ],
  [
    "24/7 support as standard",
    "A confidential EAP helpline for emotional, financial and family matters, there whenever your people need it.",
  ],
  [
    "Digital care in the app",
    "A 24/7 digital GP, digital physiotherapy and mental health support, all a tap away inside YuLife.",
  ],
  [
    "A benefit they open every day",
    "Rewards for healthy habits turn the plan into something your team uses daily, not only when they claim.",
  ],
  [
    "Wellbeing insights in your Employer Portal",
    "See engagement and wellbeing trends across your team, always anonymised and never individual.",
  ],
];

const whatYouGet: ClinicalExcellenceData = {
  eyebrow: "What’s included",
  heading: "What you get with your Health Cash Plan",
  body:
    "A cost-effective way to deliver meaningful engagement, everyday support, " +
    "seamless access, and measurable impact.",
  cards: benefitTitles.map(([title, body], i) => ({
    icon: benefitIcons[i % benefitIcons.length],
    alt: "",
    title,
    body,
  })),
};

// § Trust stats — the three ROI figures, shown as odometer cards beneath the
// logo marquee (one band), the same treatment as the Businesses page.
const marqueeStats: MarqueeStatsContent = {
  cardsClassName: "max-w-[912px] desktop:grid-cols-3",
  stats: [
    { id: "engage", value: "1 in 2", label: "members engage daily" },
    { id: "eap", value: "4X", label: "increase in EAP utilisation" },
    { id: "absence", value: "12%", label: "reduction in absenteeism" },
  ],
};

// § FAQs — seven Q&As transcribed verbatim from the design.
const faqs: readonly FaqEntry[] = [
  {
    question: "What is a health cash plan and how does it work?",
    answer:
      "A health cash plan pays employees money back on everyday healthcare costs, such as dental check-ups, glasses, physiotherapy, prescriptions, and flu jabs. Your employee pays the bill, submits the receipt, and is reimbursed up to an annual allowance for each benefit category. There is no referral needed and no need to see a GP first. YuLife’s health cash plan is underwritten by Bupa, so Bupa provides the cover and pays the claims, while YuLife delivers the daily wellbeing experience, the rewards, and the employer insight on top.",
  },
  {
    question:
      "What’s the difference between a health cash plan and private medical insurance?",
    answer:
      "A cash plan reimburses routine, everyday costs that private medical insurance does not usually cover, such as dental, optical, and physiotherapy. Private medical insurance pays for the diagnosis and treatment of new conditions, normally in a private hospital. A cash plan covers all pre-existing conditions across every benefit, which private medical insurance generally does not. Cash plans cost less per employee and get claimed on more often, so many employers offer both: the cash plan for everyone, private medical insurance for a smaller group.",
  },
  {
    question: "What can employees claim for?",
    answer:
      "Dental and dental injury, optical, prescriptions, flu jabs and vaccinations, therapies including physiotherapy, osteopathy, chiropractic, acupuncture and chiropody or podiatry, consultations and diagnostic tests or scans, and money towards hospital stays and day cases. There is also a Bupa health benefits allowance covering Bupa Clinics, health assessments, and health plans such as the menopause plan, period plan, and men’s sexual function plan. Allowances depend on which of the 3 membership levels you choose.",
  },
  {
    question: "Can employees add their family?",
    answer:
      "Yes. Individual plus membership covers the main member and up to 4 child dependants to the age of 24. Family membership covers the main member, their partner, and up to 4 child dependants to the age of 24. Each covered member gets the full benefit allowance. Employees and their dependants must be UK residents.",
  },
  {
    question: "How do employees claim?",
    answer:
      "Through the Bupa claims page, reached directly from the Health Cash Plan section of the YuLife app. They enter their details, submit the receipt, and Bupa pays the money back. No referral, no pre-authorisation.",
  },
  {
    question: "What mental health support is included?",
    answer:
      "The Bupa Employee Assistance Programme is included as standard, giving members and named dependants aged 16 and over a confidential helpline for emotional health, money management, consumer rights, and family matters, with first-time resolution counselling over the phone and guidance towards further treatment. Two options are available: Key EAP as standard, and Premier EAP, which adds up to 6 telephone or face-to-face counselling sessions per member aged 16 or over, or access to online Cognitive Behavioural Therapy, for an additional fee.",
  },
  {
    question: "How much does it cost, and how is it paid for?",
    answer:
      "The plan runs on an annual contract, payable monthly or annually, with 3 levels of cover. It can be fully group funded, group funded with voluntary upgrades through salary deduction, or offered as an entirely voluntary arrangement. Community rated pricing applies by group size, for teams of 2 to 9, 10 to 299, and 300 or more. YuLife is an optional addition at extra cost, available as YuLife Core or YuLife Epic.",
  },
];

export default function Page() {
  return (
    <>
      <PageHero {...hero} />
      <MarqueeStatsSection {...marqueeStats} />

      {/* § What is a Health Cash Plan? — heading over a two-column explainer,
          closing on the carrier QuoteBlock card (with the Bupa mark). */}
      <section className="border-b border-line-emphasis bg-surface-inverse">
        <div className="page-container-wide section-y-lg flex flex-col gap-section-gap">
          <h2 className="type-heading-h2 max-w-[20ch] text-on-inverse">
            What is a Health Cash Plan?
          </h2>
          <div className="grid gap-flow desktop:grid-cols-2 desktop:gap-x-section-gap">
            <div className="flex flex-col gap-flow type-body-lg text-on-inverse">
              <p>{introParagraphs[0]}</p>
              <p>{introParagraphs[1]}</p>
            </div>
            <div className="flex flex-col gap-flow type-body-lg text-on-inverse">
              <p>{introParagraphs[2]}</p>
              <p>{introParagraphs[3]}</p>
            </div>
          </div>
          <QuoteBlock quote={carrierQuote} carrierLogo={bupaLogo} />
        </div>
      </section>

      <EverydayValueSection
        data={solveFor}
        panel={solveForPanel}
        surface="inverse-raised"
      />

      <ClinicalExcellenceSection data={whatYouGet} />

      <FaqSection faqs={faqs} />
      <JoinMissionCard />
    </>
  );
}
