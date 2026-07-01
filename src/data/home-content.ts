export const hero = {
  h1: "Insurance that inspires life",
  subheading:
    "The all-in-one insurance and health benefit for your team. We unify world-class protection with AI-driven engagement to build more resilient, high performance teams.",
  cta: { label: "Request a demo", href: "/contact" },
  ratings: [
    { platform: "Trustpilot", score: "4.9" },
    { platform: "Capterra", score: "4.8" },
    { platform: "App Store", score: "4.9" },
  ],
  marquee: [
    { name: "Novartis", approved: true },
    { name: "Fujitsu", approved: true },
    { name: "Sodexo", approved: true },
    { name: "Severn Trent", approved: true },
    { name: "Paramount", approved: true },
    { name: "Havas", approved: true },
    { name: "Financial Times", approved: false },
    { name: "Qinetiq", approved: true },
    { name: "Wolseley", approved: true },
    { name: "Del Monte UK", approved: true },
    { name: "Kiko Milano", approved: false },
    { name: "Mintel", approved: true },
    { name: "Bruntwood", approved: true },
    { name: "XMA", approved: true },
    { name: "Nice-Pak", approved: true },
    { name: "what3words", approved: true },
    { name: "ManyPets", approved: true },
    { name: "Curve", approved: true },
    { name: "ITRS Group", approved: true },
    { name: "Paymentology", approved: true },
    { name: "Moneyhub", approved: true },
    { name: "CreateFuture (xDesign)", approved: false },
    { name: "Dishoom", approved: false },
    { name: "Wolf & Badger", approved: true },
    { name: "Abel & Cole", approved: true },
    { name: "Oddbox", approved: true },
    { name: "Chilly's", approved: true },
  ],
} as const;

export const ecosystem = {
  eyebrow: "Complete health ecosystem",
  heading: "Built for daily life, not just moments of need",
  stats: [
    {
      value: "80%",
      label: "adoption",
      description: "a benefit your people actually use.",
    },
    {
      value: "25%",
      label: "lower claims risk",
      description: "healthier teams mean fewer claims and steadier costs.",
      footnote: 1,
    },
    {
      value: "11.5%",
      label: "less sickness absence",
      description: "more workdays back, through earlier intervention.",
      footnote: 2,
    },
  ],
  insurers: ["Bupa", "MetLife", "Dai-ichi", "Mutual of Omaha"],
} as const;

export const products = {
  eyebrow: "A new standard",
  heading: "Protection for today's world",
  cards: [
    {
      title: "Group Health Insurance",
      description:
        "Private medical cover with fast-track access to specialists and hospitals.",
      carrier: "Bupa",
      href: "/products/health",
    },
    {
      title: "Health Cash Plan",
      description:
        "Simple, digital reimbursements for everyday healthcare costs like dental and optical.",
      carrier: "Bupa",
      href: "/products/cash-plan",
    },
    {
      title: "Group Life Insurance",
      description: "Essential financial security for the people your employees love.",
      carrier: "MetLife",
      href: "/products/life-insurance",
    },
    {
      title: "Group Income Protection",
      description: "Income and expert rehabilitation support if an employee cannot work.",
      carrier: "MetLife",
      href: "/products/income-protection",
    },
  ],
} as const;

export const pillars = [
  {
    id: "engage",
    eyebrow: "Engage",
    heading: "Daily Wellbeing Experience",
    bullets: [
      "Daily Health Challenges: Our gamified app transforms walking, meditation, and cycling into a rewarding daily quest.",
      "Seamless Connectivity: Integrates instantly with Garmin, Fitbit, Apple Health, and Google Fit to track every move.",
      "Real-World Rewards: Earn YuCoin for healthy habits to spend at Amazon, Nike, and Tesco, or fund global impact projects.",
      'Team Challenges: Spark healthy competition with company-wide leaderboards and 1-on-1 "Duels."',
    ],
  },
  {
    id: "prevent",
    eyebrow: "Prevent",
    heading: "Proactive Health Support",
    bullets: [
      "Daily Reflections: Short, daily check-ins that sense shifts in stress and energy and trigger support when patterns change.",
      "24/7 Virtual GP: Unlimited video calls and private prescriptions available at your team's fingertips.",
      "Comprehensive EAP: 24/7 mental health support and CBT tools triggered by real-life signals.",
      "Centralised Employee Benefits Hub: One digital home for all your company's insurance and wellness policies.",
    ],
  },
  {
    id: "protect",
    eyebrow: "Protect",
    heading: "Gold-Standard Insurance",
    bullets: [
      "Market-Leading Cover: Trusted policies integrated directly into the YuLife app.",
      "Global Partnerships: The institutional weight and clinical excellence of world-leading insurance brands.",
      "Total Transparency: 24/7 digital access ensures your team knows exactly how they are protected, anywhere in the world.",
    ],
  },
  {
    id: "empower",
    eyebrow: "Empower",
    heading: "Actionable Data & Insights",
    bullets: [
      "Aggregated Wellbeing Data: Combine employee feedback with app activity for a clear, holistic view of workforce health.",
      "Predictive Insights: Spot rising burnout and absence risk earlier, so you can act before it costs you.",
      "Live eNPS Tracking: Monitor Employee Net Promoter Scores in real time to understand cultural health and retention risk.",
      "Leadership-ready reporting that turns wellbeing into boardroom outcomes and shows the ROI of your investment in people.",
    ],
  },
] as const;

export const yunity = {
  heading: "The more your people use it the smarter it gets",
  intro:
    "Most platforms tell you what happened last quarter. YuLife tells you what's about to happen next week. Every check-in, every challenge, every consultation adds to a continuously learning picture of your workforce's health: sensing what's changing, interpreting what it means, and guiding what to do next.",
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
  lockup: "Powered by Yunity",
} as const;

export const solutions = {
  eyebrow: "Solutions",
  heading: "Built for everyone in the benefits ecosystem",
  intro:
    "Whether you're buying, selling, advising or receiving — YuLife has a path for you.",
  cards: [
    {
      title: "Employers",
      description:
        "Attract and retain talent with benefits that go beyond a policy document. Real engagement, measurable ROI.",
      cta: { label: "For employers", href: "/who-we-help/businesses" },
    },
    {
      title: "Individuals",
      description:
        "Already a YuLife member through work? Manage your cover, earn rewards and access your benefits anywhere.",
      cta: { label: "For individuals", href: "/who-we-help/individuals" },
    },
    {
      title: "Insurance Carriers",
      description:
        "Become a partner with YuLife to offer health and wellness-led products that drive healthier, more engaged policyholders.",
      cta: { label: "For carriers", href: "/who-we-help/carriers" },
    },
    {
      title: "Advisers",
      description:
        "Access tools, resources and dedicated support to help your clients implement benefits they value.",
      cta: { label: "For advisers", href: "/who-we-help/advisers" },
    },
  ],
} as const;

export const socialProof = {
  heading: "Trusted, proven, scalable",
  body: "Trusted by millions worldwide, YuLife provides a clearer view of population health — enabling more predictable intervention and sustainable risk management.",
  awards: ["Award A", "Award B", "Award C", "Award D"],
} as const;

export const finalCta = {
  heading: "Join the mission to inspire life",
  subheading:
    "Ready to turn employee benefits into a daily engine for healthier, higher-performing teams?",
  cta: { label: "Speak to our team", href: "/contact" },
} as const;

export const sources = [
  {
    marker: 1,
    text: "University of Essex (2025): Longitudinal study on gamified wellbeing and claim frequency.",
  },
  {
    marker: 2,
    text: "Forrester Consulting (2023): The Total Economic Impact™ of YuLife.",
  },
] as const;
