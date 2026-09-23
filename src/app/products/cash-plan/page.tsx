import type { Metadata } from "next";
import ImageRightHero, { type ImageRightHeroContent } from "@/components/sections/ImageRightHero";
import MarqueeStatsSection from "@/components/sections/MarqueeStatsSection";
import EverydayValueSection, {
  QuoteBlock,
  type CarrierLogo,
} from "@/components/sections/EverydayValueSection";
import ClinicalExcellenceSection from "@/components/sections/ClinicalExcellenceSection";
import StatCardFan from "@/components/blocks/StatCardFan";
import FaqSection from "@/components/sections/FaqSection";
import JoinMissionCard from "@/components/sections/JoinMissionCard";
import type {
  Cta,
  Quote,
  FaqEntry,
  ProvenRoiStat,
  EverydayValueSection as EverydayValueData,
  EverydayValuePanel,
  ClinicalExcellenceSection as ClinicalExcellenceData,
} from "@/data/pages/types";
import { assetPath } from "@/lib/assetPath";

/*
  Health Cash Plan — bespoke product page assembled from existing section
  components (Figma node 2520:10230, YuLife Website Design System). Copy is
  transcribed verbatim from the design (the source of truth over the copy doc);
  the three stat-fan hover notes are authored to YuLife tone of voice (the
  design shows the card fronts only) over the copy doc's approved sources.

  Section order (top → bottom), each keyed to its Figma node:
    · Hero (2520:10233) — eyebrow + italic-accent headline, Bupa lockup, ratings.
    · Logo marquee (logos only; the trust stats moved down into the fan below).
    · "What is a Health Cash Plan?" (2520:10937) — two-col header, the Dan
      Sullivan carrier quote, a two-col follow-on, and the three trust stats as
      a StatCardFan.
    · "Help your people take charge of their health" (2520:10321) — the shared
      scroll-scrollytelling EverydayValueSection, closing on the "One benefit
      story" panel.
    · "Everyday health, all in one place" (2520:10351) — the RevealCardGrid in
      its static (icon+title only) state, via ClinicalExcellenceSection.
    · FAQs and Join-the-mission — unchanged.
  CTA hrefs aren't in the design; buttons read "Speak to our team" → /contact.
*/

export const metadata: Metadata = {
  title: "Health Cash Plan for Employees | YuLife",
  description:
    "A Health Cash Plan that pays your team back on everyday health costs and rewards daily wellbeing. Underwritten by Bupa. Powered by YuLife.",
};

const speakToTeam: Cta = { label: "Speak to our team", href: "/contact" };

const bupaLogo: CarrierLogo = { src: "/logos/carriers/bupa.svg", alt: "Bupa" };

// § Hero (2520:10233) — eyebrow + headline with the italic "everyday" falling
// mid-phrase (lead + accent + trail). Body, Bupa lockup and ratings verbatim.
const hero: ImageRightHeroContent = {
  eyebrow: "Health cash plan",
  headline: {
    lead: "Trusted cover for ",
    accent: "everyday",
    trail: " health expenses",
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
  // The design's hero phone (node 2520:10234): the Bupa × YuLife Health Cash
  // Plan app screen. Device mockup, no orbiting coins.
  visual: {
    kind: "device",
    src: assetPath("/products/hero-cash-plan-phone.png"),
    width: 436,
    height: 760,
  },
};

// § "What is a Health Cash Plan?" (2520:10937) — the two intro paragraphs that
// sit right of the heading, then the two that follow the quote. All verbatim.
const whatIsIntro: readonly string[] = [
  "Money back on the everyday health costs your employees would otherwise pay " +
    "themselves. Dental check-up, covered.",
  "New glasses, claim it back. Physio for a bad back, sorted. They pay, they " +
    "claim, they’re reimbursed up to an annual limit for each benefit. No " +
    "referral needed.",
];

const whatIsOutro: readonly string[] = [
  "It isn’t private medical insurance. It’s the routine care your whole team " +
    "will use several times a year, which is why it costs less.",
  "And it doesn’t sit in a drawer until something goes wrong. Daily challenges " +
    "and rewards build healthier habits, and your portal shows you how your " +
    "workforce is really doing.",
];

// Carrier quote — Dan Sullivan, verbatim from the design; headshot already in
// /public. Rendered as the shared QuoteBlock with the Bupa mark.
const carrierQuote: Quote = {
  text:
    "Employers are looking for solutions that not only support people when they " +
    "become unwell, but help them stay healthy in the first place.",
  author: "Dan Sullivan",
  role: "Director of Product and Proposition",
  avatar: "/people/dan-sullivan.jpg",
};

// Trust stats — the three ROI figures, now a StatCardFan at the foot of the
// "What is a Health Cash Plan?" section (they used to be an odometer row under
// the logo marquee). Values/labels from the design; the visible 12% follows the
// Figma over the copy doc's 11.5%. Sources are the copy doc's; the hover notes
// are authored to ToV.
const trustStats: readonly ProvenRoiStat[] = [
  {
    value: "1 in 2",
    label: "members engage daily",
    note:
      "Half your team opens YuLife every day — walking, meditating, earning " +
      "rewards. Not once. As a habit that sticks.",
    source: "YuLife internal data, 2025",
  },
  {
    value: "4x",
    label: "increase in EAP utilisation",
    note:
      "When support is part of daily life, people actually reach for it — EAP " +
      "use runs at four times the industry norm.",
    source: "YuLife internal data against industry benchmarks",
  },
  {
    value: "12%",
    label: "reduction in absenteeism",
    note:
      "When wellbeing is part of every day, fewer sick days follow — not just " +
      "on the day a claim is made.",
    source: "Forrester Total Economic Impact of YuLife, 2022",
  },
];

// § "Help your people take charge of their health" (2520:10321) — the shared
// scroll-scrollytelling section: two-col header, a pinned illustration stepping
// through three value blocks, closing on the "One benefit story" panel. Copy
// verbatim from the design; illustrations reuse the /products/everyday spots.
const takeCharge: EverydayValueData = {
  eyebrow: "Everyday health",
  heading: "Help your people take charge of their health",
  accent: "take charge",
  lead:
    "Dental, optical, physiotherapy and other everyday healthcare expenses can " +
    "add up.",
  body:
    "A Health Cash Plan helps employees claim money back towards the costs that " +
    "keep them healthy and feeling their best.",
  blocks: [
    {
      title: "Make treatment easier to access",
      body:
        "Employees can get treatment without a referral for most benefits, then " +
        "claim back their eligible benefit allowance afterwards, helping save " +
        "time and money.",
      image: "/products/everyday/video-call.png",
      alt: "",
    },
    {
      title: "Affordable support for your whole team",
      body:
        "A Health Cash Plan is a simple, affordable way to support employee " +
        "health and wellbeing, with flexible levels of cover to suit different " +
        "needs.",
      image: "/products/everyday/medikit.png",
      alt: "",
    },
    {
      title: "A benefit they use every day",
      body:
        "Every plan comes with the YuLife app. Daily challenges build healthier " +
        "habits, so this is a benefit your people open all year, not just at " +
        "claim time.",
      image: "/products/everyday/thought-bubble.png",
      alt: "",
    },
  ],
};

// Closing panel for the section (design: heading + body + button).
const takeChargePanel: EverydayValuePanel = {
  heading: "One benefit story. Simply told.",
  paragraphs: [
    "Whether you’re an HR leader juggling providers or an adviser building a " +
      "recommendation, YuLife turns a complicated benefits stack into one clear, " +
      "engaging offer.",
  ],
  cta: speakToTeam,
};

// § "Everyday health, all in one place" (2520:10351) — a 3×3 grid of
// icon+title callouts (no body, no reveal), via ClinicalExcellenceSection over
// the static RevealCardGrid. Titles verbatim; icons reuse the four
// /products/everyday spots as placeholders, as the design's own grid does.
const benefitGrid: ClinicalExcellenceData = {
  heading: "Everyday health, all in one place",
  accent: "one place",
  body:
    "A cost-effective way to deliver meaningful engagement, everyday support, " +
    "seamless access, and measurable impact.",
  cards: [
    { icon: "/products/everyday/video-call.png", alt: "", title: "Money back on everyday health costs" },
    { icon: "/products/everyday/medikit.png", alt: "", title: "Therapies, consultations and diagnostics" },
    { icon: "/products/everyday/thought-bubble.png", alt: "", title: "Hospital and Bupa health benefits" },
    { icon: "/products/everyday/tooth.png", alt: "", title: "Pre-existing conditions covered" },
    { icon: "/products/everyday/thought-bubble.png", alt: "", title: "Cover for the whole family" },
    { icon: "/products/everyday/medikit.png", alt: "", title: "24/7 support as standard" },
    { icon: "/products/everyday/video-call.png", alt: "", title: "Digital care in the app" },
    { icon: "/products/everyday/thought-bubble.png", alt: "", title: "A benefit they open every day" },
    { icon: "/products/everyday/medikit.png", alt: "", title: "Wellbeing insights in your Employer Portal" },
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
      <ImageRightHero {...hero} />
      {/* Logo-only marquee — the trust stats now live in the fan below. */}
      <MarqueeStatsSection />

      {/* § What is a Health Cash Plan? (2520:10937) — the four groups stack
          centred with the design's 120px rhythm (section-gap-xl) inside the
          200px band (section-y-lg). Header + quote span the full 1216 band; the
          follow-on paragraphs and the stat fan are the design's narrower 902px,
          centred. */}
      <section
        data-surface="inverse"
        className="border-b border-line-emphasis bg-surface-inverse"
      >
        <div className="page-container-wide section-y-lg flex flex-col items-center gap-[var(--layout-section-gap-xl)]">
          {/* TwoCol — 747px heading column + intro, 32px gutter; the intro is
              nudged down 48px and both columns centre against each other. */}
          <header className="grid w-full gap-flow desktop:grid-cols-[747px_minmax(0,1fr)] desktop:items-center desktop:gap-x-controls">
            <div className="flex flex-col gap-related">
              <p className="type-eyebrow uppercase text-accent-purple">
                What is a Health Cash Plan?
              </p>
              <h2 className="type-heading-h2 text-on-inverse">
                What is a Health Cash Plan?
              </h2>
            </div>
            <div className="flex flex-col gap-flow type-body-lg text-on-inverse desktop:pt-block-gap">
              <p>{whatIsIntro[0]}</p>
              <p>{whatIsIntro[1]}</p>
            </div>
          </header>

          <QuoteBlock quote={carrierQuote} carrierLogo={bupaLogo} />

          {/* Follow-on — two 902px columns with the design's 120px gutter. */}
          <div className="mx-auto grid w-full max-w-[902px] gap-flow type-body-lg text-on-inverse desktop:grid-cols-2 desktop:gap-x-[var(--layout-section-gap-xl)]">
            <p>{whatIsOutro[0]}</p>
            <p>{whatIsOutro[1]}</p>
          </div>

          <div className="mx-auto w-full max-w-[902px]">
            <StatCardFan stats={trustStats} />
          </div>
        </div>
      </section>

      <EverydayValueSection
        data={takeCharge}
        panel={takeChargePanel}
        surface="inverse-raised"
      />

      <ClinicalExcellenceSection data={benefitGrid} surface="inverse" />

      {/* Keep the dark/raised alternation running to the foot of the page:
          grid (inverse) → FAQ (raised) → Join-mission (inverse). */}
      <FaqSection faqs={faqs} surface="inverse-raised" />
      <JoinMissionCard surface="inverse" />
    </>
  );
}
