import type { FaqEntry, ProductPageData } from "./types";

const defaultRatings = [
  { platform: "Trustpilot", score: "4.9" },
  { platform: "Capterra", score: "4.8" },
  { platform: "App Store", score: "4.9" },
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
    {
      question: "What is group income protection and how does it work?",
      answer:
        "Group income protection provides a regular income replacement of up to 80% of salary for employees who are unable to work due to long-term illness or injury. Unlike a one-off payout, it provides ongoing financial support during absence while MetLife's clinical team works to support recovery and a safe return to work.",
    },
    {
      question: "What makes YuLife and MetLife's approach different from a standard GIP policy?",
      answer:
        "Most income protection policies are reactive — they pay out when someone is already absent. YuLife and MetLife use daily engagement data to identify risk early, trigger clinical intervention weeks ahead of a traditional insurer, and support recovery with dedicated clinical pathways for mental health, MSK and long-COVID.",
    },
    {
      question: "What clinical support is available to absent employees?",
      answer:
        "MetLife's early intervention service provides expert clinical outreach from day one of a notified absence, with dedicated rehabilitation pathways for mental health conditions, musculoskeletal disorders and long-COVID. When employees are supported early, 96% return to or remain in work (MetLife UK Claims Data, April 2024).",
    },
    {
      question: "How does early intervention affect premium costs?",
      answer:
        "The earlier an absence is identified and supported, the shorter it tends to be. MetLife also offers limited term policies, where premiums are on average 50% lower than standard policies that pay to retirement age.",
    },
    {
      question: "How does YuLife protect employee data and privacy?",
      answer:
        "All personal data is handled with the highest level of protection. Employers receive high-level insights through the employer portal, but all data is strictly anonymised and aggregated — employers can never access individual activity or personal health data.",
    },
    {
      question: "How does YuLife simplify administration while providing business insight?",
      answer:
        "YuLife consolidates income protection, virtual healthcare and wellbeing rewards into a single platform, removing the need for multiple vendor relationships. The employer portal shows a real-time dashboard of eNPS scores and risk distributions for burnout and absenteeism.",
    },
  ],
};

export const groupHealthInsurance: ProductPageData = {
  pageTitle: "Group Health Insurance",
  carrier: "Bupa",
  primaryCta: defaultCta,
  flags: ["Engagement stat differs from GIP page (93% vs 80%)"],
  hero: {
    h1: "Group Health Insurance that inspires life",
    body: "A game-changing approach to business health insurance. YuLife and Bupa combine daily engagement that rewards healthy living with fast access to clinical care when your people need it most.",
    ctas: [defaultCta],
  },
  ratings: defaultRatings,
  carrierQuote: {
    text: "This partnership will help more people to take charge of their everyday health and wellbeing, while also offering reassurance that high-quality healthcare is there when it's needed.",
    author: "Richard Norris",
    role: "General Manager for Business & Specialist Products",
    avatar: "/people/richard-norris.jpg",
  },
  everydayValue: {
    eyebrow: "For everyone",
    heading: "Health insurance your people will value every day",
    lead: "Most group health insurance is invisible until something goes wrong.",
    body: "YuLife and Bupa change that by unifying private medical, dental, mental health and daily rewards into a single benefit your people will love and use every day.",
    blocks: [
      {
        title: "Continuous engagement",
        body: "1 in 2 members use the app daily for walking, meditation or cycling.⁴",
        image: "/products/everyday/video-call.png",
        alt: "",
      },
      {
        title: "Tangible rewards",
        body: "Employees earn YuCoin for healthy actions and spend it at Amazon, Nike and Tesco, or donate to causes like Earthy, Charity: Water and Clean the Ocean.",
        image: "/products/everyday/thought-bubble.png",
        alt: "",
      },
      {
        title: "Seamless connectivity",
        body: "Every wearable sync, every step tracked, every mindful minute counted, automatic and easy.",
        image: "/products/everyday/tooth.png",
        alt: "",
      },
      {
        title: "Exclusive health rewards",
        body: "Through continued engagement, employees unlock over £700 of value in their first year, including Boots vouchers, a free health assessment and a Garmin smartwatch.³",
        image: "/products/everyday/medikit.png",
        alt: "",
      },
    ],
  },
  clinicalExcellence: {
    eyebrow: "Bupa clinical excellence",
    heading: "See a specialist sooner. Save weeks of worrying.",
    body: "When your people need care, every day of delay is a day of worry, reduced performance, or risk of a condition worsening. With Bupa's Connected Care, the right specialist is accessible directly — at the moment it matters.",
    cards: [
      {
        icon: "/products/everyday/video-call.png",
        alt: "",
        title: "Direct access",
        body: "Employees can contact Bupa directly about cancer, mental health or muscle, bone and joint problems without needing to see a GP first. Bupa will provide support, advice and a referral for consultations, tests or treatment where needed.¹",
      },
      {
        icon: "/products/clinical/test-tube.svg",
        alt: "",
        title: "Cancer care",
        body: "Specialist cancer centres offer a same-day all-clear or referral for treatment or further tests. All eligible treatment costs are covered in full, for as long as your employee has Bupa health cover.²",
      },
      {
        icon: "/products/everyday/thought-bubble.png",
        alt: "",
        title: "Mental health cover",
        body: "Bupa covers more mental health conditions than any other leading insurer.³ Mental health is included as standard, with access to specialists directly through the My Bupa app.",
      },
      {
        icon: "/products/clinical/dumbbell.svg",
        alt: "",
        title: "MSK support",
        body: "Employees can access muscle, bone and joint specialists directly, without a GP referral, and get the right treatment sooner.",
      },
      {
        icon: "/products/everyday/medikit.png",
        alt: "",
        title: "24/7 virtual GP",
        body: "Digital GP appointments and private prescriptions through the My Bupa app, available day or night including weekends and bank holidays.*",
      },
      {
        icon: "/products/everyday/tooth.png",
        alt: "",
        title: "Dental cover",
        body: "Routine examinations, scale and polish, fillings and emergency dental treatment covered through Bupa Dental. Full cover at Bupa Dental Care practices, with cash back at any recognised dentist.",
      },
    ],
    footnote:
      "Footnotes ¹²³* regarding cover limits, network use and Defaqto comparison — see source/legal.",
  },
  provenRoi: {
    eyebrow: "Proven ROI",
    heading: "Independently verified. Consistently delivered.",
    body: "As your people engage with their Bupa and YuLife health benefit, expect to see measurable business impact. Every figure below comes from independent research or verified platform data.",
    stats: [
      {
        value: "93%",
        label: "highly engaged\napp users",
        note: "The industry's broadest set of game mechanics drives sustained engagement — while most wellness platforms become ghost towns, our members keep coming back.",
        source: "YuLife internal data, 2025",
      },
      {
        value: "181%",
        label: "return on\ninvestment",
        note: "Verified return on your benefits spend, measured across active YuLife accounts.",
        source: "Forrester Consulting (2023): The Total Economic Impact™ of YuLife",
      },
      {
        value: "85%",
        label: "employees feel\nmore productive",
        note: "When people are supported to be healthier, the business feels it too.",
        source: "YuLife internal data, 2025",
      },
      {
        value: "12%",
        label: "reduction in\nsickness absence",
        note: "The compounding effect of daily healthy habits, measured at scale.",
        source: "Forrester Consulting (2023): The Total Economic Impact™ of YuLife",
      },
      {
        value: "25%",
        label: "lower claims risk",
        note: "Engaged YuLife users generate significantly fewer claims over time — the first clinically validated evidence linking gamified health behaviour to lower claims frequency.",
        source: "University of Essex (2025): Longitudinal study on gamified wellbeing and claim frequency",
      },
    ],
  },
  businessPulse: {
    heading: "Your business has a pulse. We help you read it.",
    body: "Behind every YuLife account is an intelligence layer that turns daily signals from across your workforce into a clear, human picture of how your team is really doing. On the health insurance plan, that signal starts with a daily AI-powered check-in. Employees answer a short health questionnaire, receive personalised tips, and are automatically guided to the right Bupa service when they need it.",
    steps: [
      {
        title: "Sense",
        description: "capture the real-time lifestyle data traditional models miss.",
      },
      {
        title: "Interpret",
        description: "spot the subtle shifts that signal rising stress or physical risk.",
      },
      {
        title: "Guide",
        description: "trigger support early, to protect health and prove ROI.",
      },
    ],
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
    {
      question:
        "What does YuLife's group health insurance cover and how does it benefit employees?",
      answer:
        "YuLife's group health insurance is underwritten by Bupa, one of the UK's leading private medical insurers — meaning Bupa is responsible for paying claims, while YuLife delivers the employee engagement, wellbeing tools and daily rewards on top. The policy provides fast access to private medical care, including inpatient and day-patient treatment, outpatient consultations, diagnostic tests and scans, and full cancer cover. Employees also benefit from a 24/7 virtual GP via Bupa's Blua digital service, private prescriptions, and access to YuLife's gamified wellbeing tools — earning YuCoin for healthy habits redeemable at Amazon, Nike and Tesco.",
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
        "YuLife's group health insurance includes Bupa's mental health cover, which is broader than any other leading UK insurer, covering more conditions, with no time limits for outpatient treatment and inpatient cover of up to 45 days per year. Employees also have access to Bupa's Family Mental HealthLine and the 24/7 Anytime HealthLine, and can access mental health support directly through Bupa's Connected Care model without a GP referral. One course of addiction treatment per lifetime is also included.",
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
        "Yes. Because YuLife's group health insurance is purchased as a group policy underwritten by Bupa, employers benefit from collective rates typically lower than individual private medical cover. The policy is available for businesses with as few as 2 employees, with a choice of cover levels — Key, Enhanced and Complete — allowing employers to tailor the level of outpatient, therapy and hospital access to suit their budget. Dental cover can also be added to the same policy.",
    },
    {
      question:
        "How does YuLife's group health insurance simplify administration while providing business insight?",
      answer:
        "YuLife's group health insurance consolidates private medical cover, virtual healthcare, mental health support and daily wellbeing rewards into a single platform, removing the need for multiple vendor contracts. Through the employer portal, businesses receive a real-time dashboard showing eNPS scores and risk distributions for burnout and absenteeism, with data-led insights proven to deliver a 12% reduction in sickness absence and 25% lower claims risk.",
    },
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
    {
      question: "What does YuLife's Health Cash Plan cover and how does it benefit employees?",
      answer:
        "YuLife's Health Cash Plan is in partnership with Bupa, one of the UK's most established health insurers, with YuLife delivering the employee experience, wellbeing tools, and engagement layer on top. The plan gives employees cash back on everyday health expenses — dental treatment, optical appointments, physiotherapy, diagnostic tests, prescriptions, and more — with 99.5% of claims paid within 5 days. Employees also earn YuCoin for healthy habits, which they can donate to charitable causes to unlock prizes and rewards.",
    },
    {
      question: "Is YuLife's Health Cash Plan the same as private health insurance?",
      answer:
        "No. YuLife's Health Cash Plan, backed by Bupa, reimburses employees for everyday health expenses — dental, optical, physiotherapy and similar costs — up to set limits per membership level. It is separate from, and typically far more affordable than, private medical insurance (PMI). Many employers choose to offer both.",
    },
    {
      question: "How do employees make a claim on YuLife's Health Cash Plan?",
      answer:
        "Employees are guided from YuLife to the Bupa claims portal, where they can submit claims online or by post. The process is quick and straightforward — upload or send your receipts and follow the instructions provided.",
    },
    {
      question: "What wellbeing benefits do employees get alongside the plan?",
      answer:
        "Alongside cash back cover, employees access a full suite of daily wellbeing tools through the YuLife app: a 24/7 Digital GP service, digital physiotherapy from Phio, SkinVision for early cancer detection, and in-app CBT and mental health support.",
    },
    {
      question: "Can employees add family members to the plan?",
      answer:
        "Yes. Employees on YuLife's Health Cash Plan can add partners, with eligibility and benefit levels varying by membership type.",
    },
    {
      question: "How does YuLife protect employee data and privacy on the Health Cash Plan?",
      answer:
        "All personal data is handled with the highest level of protection. Employers access workforce insights through the employer portal, but all data is strictly anonymised and aggregated — employers can never access individual activity or personal health data.",
    },
  ],
  legalFooter:
    "YuLife standard legal (FCA FRN 783352; company no. 10308260) · Bupa Health Cash Plan legal (Bupa Insurance Limited, reg. 3956433) · Third-party services legal. Full text in source — render in footer/legal styling.",
};

/**
 * FAQ copy for the Life Insurance and Dental Insurance pages (Figma
 * 2357:2321). Both pages are still grey-box `PageStub` scaffolds — no hero,
 * quote or value-section copy has been approved yet — so only the FAQ
 * component is wired in for now, via `FaqSection` alongside the stub.
 */
export const lifeInsuranceFaqs: FaqEntry[] = [
  {
    question: "What does YuLife's group life insurance cover and how does it benefit employees?",
    answer:
      "YuLife's group life insurance is underwritten by MetLife, meaning MetLife is responsible for paying claims, while YuLife delivers the employee experience, wellbeing tools and engagement layer on top. The policy provides a tax-free lump sum of up to 12x an employee's base salary, subject to scheme rules. Employees also benefit from a 24/7 virtual GP, private prescriptions and an EAP for mental and financial health.",
  },
  {
    question: "How does it support life and legacy planning for families?",
    answer:
      "Group life insurance underwritten by MetLife goes beyond a lump sum payout. It includes a secure 100GB digital vault, online will writing with 24/7 support, and the Everest funeral concierge — plus bereavement and probate counselling, extending to partners, dependants and parents.",
  },
  {
    question: "How do employees add or manage their beneficiaries?",
    answer:
      "Employees nominate and update beneficiaries directly within the YuLife app, with no complex HR paperwork required — keeping legacy benefits directed exactly where intended.",
  },
  {
    question: "How does YuLife protect employee data and privacy?",
    answer:
      "All personal data is handled with the highest level of protection. Employers receive high-level insights through the Yunity portal, but all data is strictly anonymised and aggregated.",
  },
  {
    question: "Is it more cost-effective than individual cover?",
    answer:
      "Yes. Group life insurance underwritten by MetLife is typically significantly cheaper than individual policies. YuLife offers cover for businesses with as few as two employees, often with instant cover and no medical underwriting required.",
  },
  {
    question: "How does YuLife simplify administration while providing business insight?",
    answer:
      "Group life insurance brings together life cover, virtual healthcare and wellbeing rewards into a single platform. The employer portal shows a real-time dashboard of eNPS scores and risk distributions for burnout and absenteeism.",
  },
];

export const dentalInsuranceFaqs: FaqEntry[] = [
  {
    question: "What does Group Dental Insurance cover?",
    answer:
      "Company dental insurance through YuLife enables employees to claim back the cost of dental treatment — check-ups, preventative and restorative work, dental injuries, emergencies and oral cancer treatment — up to the value of their cover level. Employees can select any dentist (NHS or private) in the UK, and pre-existing conditions are covered.",
  },
  {
    question: "Does the plan cover getting braces fitted?",
    answer:
      "This depends on the IOTN severity grading. The plan covers IOTN Grades 4 and 5 for ages 19+, and Grades 3, 4 and 5 for ages 18 and under. The NHS usually covers Grades 1–3 for under-18s.",
  },
  {
    question: "Are composite veneers covered?",
    answer: "Only if medically necessary — anything fitted for cosmetic reasons is excluded from cover.",
  },
  {
    question: "Can employees add their dependants?",
    answer:
      "Yes — employees can cover partners and children, with no limit on the number of children. You only pay for one, and they're covered up until their 24th birthday.",
  },
  {
    question: "How much is Group Dental Insurance?",
    answer:
      "The cost depends on the number of employees covered and the level of cover chosen, making it viable even for small businesses.",
  },
  {
    question: "Is YuLife available without insurance?",
    answer:
      "Yes — the global app-only option provides all the benefits of the YuLife app, without the insurance, so you can still protect your employees' wellbeing.",
  },
];

export const productPages: Record<string, ProductPageData> = {
  "/products/income-protection": incomeProtection,
  "/products/health": groupHealthInsurance,
  "/products/cash-plan": cashPlan,
};
