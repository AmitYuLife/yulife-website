import type { ProductPageData } from "./types";

const defaultRatings = [
  { platform: "Trustpilot", score: "4.9 ★" },
  { platform: "Capterra", score: "4.8 ★" },
  { platform: "App Store", score: "4.9 ★" },
];

const defaultCta = { label: "Speak to our team", href: "/contact" };

export const incomeProtection: ProductPageData = {
  pageTitle: "Group Income Protection",
  carrier: "MetLife",
  primaryCta: defaultCta,
  flags: ["FAQ near-duplicates — de-duplicate before build"],
  hero: {
    h1: "Group income protection that protects, rewards and inspires life",
    body: "Prevention, protection and recovery in one place. A game-changing approach to protecting your people and your business. Gold-standard group income protection your people will value every day, not just the day they need it most. Underwritten by MetLife.",
    ctas: [defaultCta],
  },
  ratings: defaultRatings,
  carrierQuote: {
    text: "Deepening our partnership with YuLife brings a unique dimension to our Group Income Protection enhancing employee wellbeing and empowering employers to keep work working.",
    author: "Dominic Grinstead",
    role: "CEO, MetLife UK",
  },
  valueSections: [
    {
      number: 1,
      eyebrow: "Value they feel every day",
      heading: "Group income protection that prevents before the claim.",
      body: "Most people know what a healthy life looks like. Living it, consistently, is the harder part. YuLife makes that easier, turning everyday health choices into rewarding habits that stick.",
      bullets: [
        "Continuous engagement: 1 in 2 members use the app daily for walking, meditation or cycling — as a habit that sticks.*",
        "Tangible rewards: Employees earn YuCoin for healthy actions and spend it at Amazon, Nike and Tesco, or donate to causes like Earthy, Charity: Water and Clean the Ocean.",
        "On-demand care: 24/7 virtual GP and mental health support at the touch of a button.",
      ],
      footnote: "*YuLife internal data across 1,200 companies.",
    },
    {
      number: 2,
      eyebrow: "Support before it becomes a struggle",
      heading: "The earlier the intervention, the better the outcome.",
      body: "Most absence management begins too late. By the time a claim is filed, weeks or months of opportunity to help have already passed. YuLife and MetLife identify risk early and trigger the right support before an employee reaches breaking point.",
      bullets: [
        "Fast access to care: Unlimited 24/7 virtual GP appointments and private prescriptions to accelerate recovery from day one.",
        "Mental health support: A comprehensive EAP providing up to 10 structured counselling sessions, available the moment an employee needs it.",
        "Proactive absence management: Continuous monitoring of workforce health signals triggers MetLife's early-intervention protocols weeks ahead of a traditional insurer.",
      ],
    },
    {
      number: 3,
      eyebrow: "Recovery done proactively",
      heading: "More than a safety net. A route back.",
      body: "When the unexpected happens, financial security matters — so does clinical expertise. MetLife's rehabilitation programmes focus on capability, recovery and a safe return to work.",
      bullets: [
        "96% positive outcomes: When MetLife is notified within the first four weeks, 96% of employees return to or remain in work. (MetLife UK Claims Data, April 2024.)",
        "Specialist clinical pathways: Dedicated rehabilitation for mental health, MSK and long-COVID.",
        "Financial peace of mind: Income replacement of up to 80% of salary during long-term illness.",
      ],
    },
    {
      number: 4,
      eyebrow: "Smarter protection",
      heading: "Your business has a pulse. We help you read it.",
      body: "An intelligence layer turns daily signals from across your workforce into a clear, human picture.",
      bullets: [
        "Sense — workplace health: Real-time eNPS and engagement trends.",
        "Interpret — proactive risk detection: Subtle shifts in stress, energy and absence risk surfaced early.",
        "Guide — early intervention: Targeted HR support up to four weeks ahead.",
      ],
    },
    {
      number: 5,
      eyebrow: "Proven ROI",
      heading: "Independently verified. Consistently delivered.",
      bullets: [
        "80% employee adoption (across YuLife accounts)",
        "12% reduction in sickness absence (Forrester Consulting 2023)",
        "25% lower claims risk (University of Essex RCT 2025)",
      ],
    },
    {
      number: 6,
      eyebrow: "Streamline your people strategy",
      heading: "Built to fit inside your world.",
      bullets: [
        "Automated onboarding: Integrates with Workday, HiBob, Personio and Sage HR.",
        "ESG reporting built in: Ready-to-share health and wellbeing reports for board and investor audiences.",
        "Dedicated support: Implementation support from day one plus an ongoing customer success manager.",
      ],
    },
  ],
  faqs: [
    "What is group income protection and how does it work?",
    "What makes YuLife and MetLife's approach different from a standard GIP policy?",
    "What clinical support is available to absent employees?",
    "How does early intervention affect premium costs?",
    "How does YuLife protect employee data and privacy?",
    "How does YuLife simplify administration while providing business insight?",
    "What does YuLife's group income protection cover and how does it benefit employees?",
    "How does YuLife's GIP support early intervention and absence management?",
    "How do employees access support?",
    "Is YuLife's GIP more cost-effective than traditional policies?",
  ],
};

export const groupHealthInsurance: ProductPageData = {
  pageTitle: "Group Health Insurance",
  carrier: "Bupa",
  primaryCta: defaultCta,
  flags: ["Engagement stat differs from GIP page (93% vs 80%)"],
  hero: {
    h1: "Group health insurance that inspires life",
    body: "A game-changing approach to business health insurance. YuLife and Bupa combine daily engagement that rewards healthy living with fast access to clinical care when your people need it most. Underwritten by Bupa.",
    ctas: [defaultCta],
  },
  ratings: defaultRatings,
  carrierQuote: {
    text: "Looking after the health and wellbeing of employees is fundamental to building a thriving and successful business. This partnership will help more people to take charge of their everyday health and wellbeing, while also offering reassurance that high-quality healthcare is there when it's needed.",
    author: "Richard Norris",
    role: "GM for business & specialist products, Bupa UK Insurance",
  },
  valueSections: [
    {
      number: 1,
      eyebrow: "Health and wellbeing every day for everyone",
      heading: "Health insurance your people will value every day",
      body: "Most group health insurance is invisible until something goes wrong. YuLife and Bupa unify private medical, dental, mental health and daily rewards into a single benefit your people use every day. 80% of illness is due to everyday lifestyle factors — so 80% is preventable.",
      bullets: [
        "Continuous engagement: 1 in 2 members use the app daily.⁴",
        "Tangible rewards: YuCoin for healthy actions, spent at Amazon, Nike, Tesco or donated to causes.",
        "Seamless connectivity: Every wearable sync, step and mindful minute counted automatically.",
        "Exclusive health rewards: Over £700 of value unlocked in year one, including Boots vouchers, a free health assessment and a Garmin smartwatch.³",
      ],
    },
    {
      number: 2,
      eyebrow: "Bupa clinical excellence",
      heading: "See a specialist sooner. Save weeks of worrying.",
      body: "With Bupa's Connected Care, the right specialist is accessible directly, at the moment it matters.",
      bullets: [
        "Direct access: Contact Bupa directly about cancer, mental health or MSK problems without a GP referral first.¹",
        "Cancer care: Same-day all-clear or referral; eligible treatment covered in full.²",
        "Mental health cover: Bupa covers more mental health conditions than any other leading insurer.³",
        "MSK support: Direct access to muscle, bone and joint specialists.",
        "24/7 virtual GP: Digital appointments and private prescriptions via the My Bupa app.*",
        "Dental cover: Exams, scale & polish, fillings and emergency treatment via Bupa Dental.",
      ],
      footnote:
        "Footnotes ¹²³* regarding cover limits, network use and Defaqto comparison — see source/legal.",
    },
    {
      number: 3,
      eyebrow: "Smarter protection",
      heading: "Your business has a pulse. We help you read it.",
      body: "On the health plan the signal starts with a daily AI-powered check-in: a short health questionnaire, personalised tips, and automatic routing to the right Bupa service.",
      bullets: [
        "Sense — cultural health: Real-time eNPS and engagement trends.",
        "Interpret — proactive risk detection: Early signals of stress, energy and absence risk.",
        "Guide — early intervention: Targeted HR support up to four weeks ahead.",
      ],
    },
    {
      number: 4,
      eyebrow: "Proven ROI",
      heading: "Independently verified. Consistently delivered.",
      bullets: [
        "93% highly engaged app users (YuLife internal data, 2025)",
        "181% return on investment (Forrester TEI of YuLife, 2023)",
        "85% of employees feel more productive (YuLife internal data, 2025)",
        "12% reduction in sickness absence (Forrester, 2023)",
        "25% lower claims risk (University of Essex, 2025)",
      ],
    },
  ],
  faqs: [
    "What does YuLife's group health insurance cover?",
    "How does it provide faster access to specialists?",
    "What mental health cover is included?",
    "How does YuLife protect employee data and privacy?",
    "Is it more cost-effective than other private medical cover?",
    "How does it simplify administration while providing business insight?",
  ],
};

export const cashPlan: ProductPageData = {
  pageTitle: "Cash Plan",
  carrier: "Bupa",
  primaryCta: { label: "Get a quote", href: "/contact" },
  meta: {
    title: "Health Cash Plan for Employees | YuLife",
    description:
      "Give your team a Health Cash Plan that rewards daily wellbeing and covers everyday health expenses. Backed by Bupa. Powered by YuLife.",
  },
  hero: {
    eyebrow: "Health Cash Plan",
    h1: "Health Cash Plan that protects, rewards and inspires life.",
    body: "The first everyday Health Cash Plan that pairs Bupa's trusted insurance expertise with YuLife's science-backed engagement platform. Your employees get cash back on everyday health costs and daily rewards for looking after themselves.",
    partnerLockup: "Bupa",
    ctas: [
      { label: "Get a quote", href: "/contact" },
      { label: "Download the guide", href: "/resources/ebooks" },
    ],
  },
  statChips: [
    { value: "80%", label: "average workforce engagement" },
    { value: "1 in 2", label: "members engage daily" },
    { value: "99.5%", label: "of claims paid in 5 days" },
    { value: "12%", label: "average reduction in sickness absence" },
  ],
  explainer: {
    heading: "Cover for the bills. Rewards for the habits.",
    body: "A Health Cash Plan gives employees money back on everyday health expenses (dental, optical, physio, therapies). The Bupa × YuLife plan goes further: through the app, employees are rewarded daily for small healthy choices and get 24/7 virtual GP and EAP access — building a healthier, more engaged workforce with measurable ROI.",
  },
  coverage: {
    heading: "Comprehensive cover, from day one.",
    subheading: "Provided by Bupa",
    groups: [
      {
        label: "Protect (cash back; 99.5% of claims paid within 5 days)",
        items: [
          "Dental · Optical · Therapies (physio, osteopathy, chiropractic, acupuncture)",
          "Consultations & diagnostics (incl. home visits)",
          "Prescriptions, vaccinations & flu jabs",
          "Hospital benefit (daily cash for inpatient/day-case nights)",
          "Health Benefits allowance (Bupa Clinics, health assessments, menopause/period/sexual-function plans)",
        ],
        footnote: "Three membership levels; full limits confirmed on quote.",
      },
      {
        label: "Prevent (get help early)",
        items: [
          "24/7 EAP helpline (legal, financial, family + counselling for Premier members)",
          "Anytime HealthLine · 24/7 Digital GP (unlimited) · SkinVision skin-cancer checks · Phio digital physiotherapy",
        ],
        footnote:
          "Digital GP, SkinVision, Phio provided by YuLife partners; subject to change.",
      },
      {
        label: "Engage (everyday wellbeing via the app)",
        items: [
          "Daily health challenges (earn YuCoin) · Rewards programme",
          "Meditopia, HIIT & Body Coach classes · Mental health & CBT via Stresscoach",
          "Discounted gym membership (Fitness First, F45) · In-app health surveys · Smoking-cessation programme",
        ],
      },
      {
        label: "Dependants",
        items: ["Earn YuCoin for adding partners/children; cover varies by membership."],
      },
    ],
  },
  processSteps: {
    heading: "From day one to daily habit.",
    steps: [
      {
        title: "Set up your scheme",
        description: "Light admin; employees get a welcome email and activate in minutes.",
      },
      {
        title: "Employees activate the YuLife app",
        description: "Full plan, health tools and daily challenges.",
      },
      {
        title: "Submit claims instantly",
        description: "From the phone, no paper; 99.5% paid within 5 days.",
      },
      {
        title: "Insights for you, habits for them",
        description: "HR dashboard shows engagement, health trends and absence risk.",
      },
    ],
  },
  employeeSection: {
    heading: "Benefits your people will actually notice.",
    body: "Average employer sees 80% workforce engagement (vs ~20% for traditional programmes). A package that feels relevant every day, with demonstrable ROI.",
    quote: {
      text: "A benefits package designed for humans by humans — one we went out of our way to make genuinely enjoyable to use, every day.",
      author: "Bupa × YuLife",
      role: "",
    },
  },
  faqs: [
    "What does the plan cover?",
    "Is it the same as private health insurance? (No.)",
    "How do employees claim?",
    "What wellbeing benefits come alongside it?",
    "Can employees add family members?",
    "How is data/privacy protected?",
    "What employer insights are provided?",
    "What size businesses is it suited to?",
  ],
  legalFooter:
    "YuLife standard legal (FCA FRN 783352; company no. 10308260) · Bupa Health Cash Plan legal (Bupa Insurance Limited, reg. 3956433) · Third-party services legal. Full text in source — render in footer/legal styling.",
};

export const productPages: Record<string, ProductPageData> = {
  "/products/income-protection": incomeProtection,
  "/products/health": groupHealthInsurance,
  "/products/cash-plan": cashPlan,
};
