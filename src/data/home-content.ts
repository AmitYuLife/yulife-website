import { assetPath } from "@/lib/assetPath";

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
    { name: "Paramount", approved: true },
    { name: "Havas", approved: true },
    { name: "Qinetiq", approved: true },
    { name: "Mintel", approved: true },
    { name: "Bruntwood", approved: true },
    { name: "Kiko Milano", approved: true },
    { name: "Old Mutual", approved: true },
    { name: "Aviva", approved: true },
    { name: "Dishoom", approved: true },
    { name: "XMA", approved: true },
    { name: "what3words", approved: true },
    { name: "ManyPets", approved: true },
    { name: "Curve", approved: true },
    { name: "Paymentology", approved: true },
    { name: "Moneyhub", approved: true },
    { name: "Oddbox", approved: true },
    { name: "CreateFuture (xDesign)", approved: true },
  ],
} as const;

export const ecosystem = {
  eyebrow: "The complete health ecosystem",
  heading: "Built for daily life, not just moments of need",
  stats: [
    {
      value: "80%",
      label: "employee\nadoption",
      note: "Engaged YuLife users have significantly fewer claims, supporting more sustainable premiums over time.",
    },
    {
      value: "25%",
      label: "lower claims risk",
      note: "Our model reaches the people other platforms miss, ensuring your investment works for the whole workforce.",
      footnote: 1,
    },
    {
      value: "12%",
      label: "reduction in sickness absence",
      note: "Active prevention and daily engagement build healthier teams with fewer sick days.",
      footnote: 2,
    },
  ],
  insurers: [
    { name: "Aviva", src: assetPath("/home/logo-aviva.svg"), width: 189, height: 34 },
    { name: "MetLife", src: assetPath("/home/logo-metlife.svg"), width: 186, height: 40 },
    { name: "Bupa", src: assetPath("/home/logo-bupa.svg"), width: 153, height: 40 },
    { name: "Daiichi Life", src: assetPath("/home/logo-daiichi.svg"), width: 219, height: 40 },
  ],
} as const;

/** Per-card background — Figma Carousel (2047:1567) SliderItem specs. */
export type ProductCardBackground =
  | {
      src: string;
      fit: "cover";
    }
  | {
      src: string;
      fit: "positioned";
      width: string;
      height: string;
      left: string;
      top: string;
    };

export const products = {
  eyebrow: "A new standard",
  heading: "Protection for today's world",
  intro:
    "YuLife is the centralised one-stop-shop that unifies world-class cover with a digital-first health experience.",
  cards: [
    {
      titleEmphasis: "Health",
      titleRest: "Cash Plan",
      titleBreakBeforeRest: true,
      description:
        "Simple, digital reimbursements for everyday healthcare costs like dental and optical.",
      carrier: "bupa",
      href: "/products/cash-plan",
      background: {
        src: assetPath("/home/products/health-cash-plan-bg.webp"),
        fit: "positioned",
        width: "369.65%",
        height: "107.16%",
        left: "-158.23%",
        top: "0",
      },
    },
    {
      titleEmphasis: "Life",
      titleRest: "Insurance",
      titleBreakBeforeRest: true,
      description: "A tax-efficient lump sum payment for families if a loved one dies.",
      carrier: "metlife",
      href: "/products/life-insurance",
      background: {
        src: assetPath("/home/products/life-insurance-bg.webp"),
        fit: "cover",
      },
    },
    {
      titleEmphasis: "Health",
      titleRest: " insurance",
      description:
        "Private medical cover with fast-track access to specialists and hospitals.",
      carrier: "bupa",
      href: "/products/health",
      background: {
        src: assetPath("/home/products/health-insurance-bg.webp"),
        fit: "cover",
      },
    },
    {
      titleEmphasis: "Dental",
      titleRest: "Insurance",
      titleBreakBeforeRest: true,
      description: "High-visibility benefit employees use.",
      carrier: "bupa",
      href: "/products/dental-insurance",
      background: {
        src: assetPath("/home/products/dental-insurance-bg.webp"),
        fit: "cover",
      },
    },
    {
      titleEmphasis: "Income",
      titleRest: " Protection",
      description:
        "Financial support and rehabilitation for employees unable to work due to illness",
      carrier: "metlife",
      href: "/products/income-protection",
      background: {
        src: assetPath("/home/products/income-protection-bg.webp"),
        fit: "positioned",
        width: "221.62%",
        height: "100%",
        left: "-93.88%",
        top: "0.07%",
      },
    },
  ],
} as const;

/** Optional hero video per platform tab — add mp4 + poster via npm run optimize:platform-videos */
export type PillarVideo = {
  mp4: string;
  poster: string;
};

export const pillars = [
  {
    id: "engage",
    eyebrow: "Engage",
    heading: "Daily Wellbeing Experience",
    video: {
      mp4: assetPath("/home/platform/engage.mp4"),
      poster: assetPath("/home/platform/engage-poster.jpg"),
    },
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
    video: {
      mp4: assetPath("/home/platform/prevent.mp4"),
      poster: assetPath("/home/platform/prevent-poster.jpg"),
    },
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
    video: {
      mp4: assetPath("/home/platform/protect.mp4"),
      poster: assetPath("/home/platform/protect-poster.jpg"),
    },
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
    video: {
      mp4: assetPath("/home/platform/empower.mp4"),
      poster: assetPath("/home/platform/empower-poster.jpg"),
    },
    bullets: [
      "Aggregated Wellbeing Data: Combine employee feedback with app activity for a clear, holistic view of workforce health.",
      "Predictive Insights: Spot rising burnout and absence risk earlier, so you can act before it costs you.",
      "Live eNPS Tracking: Monitor Employee Net Promoter Scores in real time to understand cultural health and retention risk.",
      "Leadership-ready reporting: that turns wellbeing into boardroom outcomes and shows the ROI of your investment in people.",
    ],
  },
] as const;

export const yunity = {
  eyebrow: "Powered by",
  heading: "The more your people use it, the smarter it gets",
  intro:
    "Most platforms tell you what happened last quarter. YuLife tells you what's about to happen next week. Every check-in, every challenge, every consultation adds to a continuously learning picture of your workforce's health.",
  body:
    "Yunity sits beneath the YuLife experience, quietly turning everyday engagement into insight. It helps YuLife understand what's changing in people's lives, interpret what that means, and guide more relevant, timely support.",
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
