import { assetPath } from "@/lib/assetPath";

export const hero = {
  /** Headline is two sizes: a smaller lead line over a larger italic accent
   * line (see HeroHeadline). Kept as separate strings so each renders at its
   * own type scale; screen readers still read them in order as one heading. */
  h1Lead: "Insurance that",
  h1Accent: "inspires life",
  /** Sub-heading leads with a bold sentence, then a regular remainder. */
  subheadingLead: "The all-in-one insurance and health benefit for your team.",
  subheadingRest:
    "We unify world-class protection with AI-driven engagement to build more resilient, high-performance teams.",
  cta: { label: "Request a demo", href: "/contact" },
  ratings: [
    { platform: "Trustpilot", score: "4.9" },
    { platform: "Capterra", score: "4.8" },
    { platform: "App Store", score: "4.9" },
  ],
  /** Two-row logo marquee. Order within each row matches the approved Figma layout. */
  marqueeRows: [
    [
      "Fujitsu",
      "Sodexo",
      "Paramount",
      "Havas",
      "Qinetiq",
      "Mintel",
      "Bruntwood",
      "Kiko Milano",
      "Tesco",
      "Breathe",
      "Nicepak",
      "Wolf & Badger",
      "Dakota Hotels",
      "Distology",
      "Financial Times",
    ],
    [
      "Dishoom",
      "XMA",
      "what3words",
      "ManyPets",
      "Curve",
      "Paymentology",
      "Moneyhub",
      "Rightmove",
      "Brother Marcus",
      "Castore",
      "Wolseley",
      "Chilly's",
      "Thinkmoney",
      "Orange Business",
    ],
  ],
} as const;

export const ecosystem = {
  eyebrow: "The complete health ecosystem",
  heading: "Built for daily life, not just moments of need",
  stats: [
    {
      value: "80%",
      label: "employee adoption",
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
  /** Serif-italic fragment inside `heading` (first occurrence wrapped in <em>). */
  headingAccent: "world",
  intro:
    "YuLife is the centralised one-stop-shop that unifies world-class cover with a digital-first health experience.",
  cards: [
    {
      titleEmphasis: "Health",
      titleRest: " Insurance",
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
  ],
} as const;

/** Optional hero video per platform tab — add mp4 + poster via npm run optimize:platform-videos */
export type PillarVideo = {
  mp4: string;
  poster: string;
  /** Horizontal object-position on mobile, where the video crops tightly and
   *  no floating cards cover it: the subject's face centre. Tablet and up
   *  always crop to the right edge so the face clears the floating cards. */
  focusX: string;
};

export const pillars = [
  {
    id: "engage",
    eyebrow: "Engage",
    heading: "Daily Wellbeing Experience",
    video: {
      mp4: assetPath("/home/platform/engage.mp4"),
      poster: assetPath("/home/platform/engage-poster.jpg"),
      focusX: "50%",
    },
    bullets: [
      { title: "Daily Health Challenges", description: "Our gamified app transforms walking, meditation, and cycling into a rewarding daily quest.", href: "/solutions/employee-engagement/" },
      { title: "Seamless Connectivity", description: "Integrates instantly with Garmin, Fitbit, Apple Health, and Google Fit to track every move.", href: "/products/wellbeing-platform/" },
      { title: "Real-World Rewards", description: "Earn YuCoin for healthy habits to spend at Amazon, Nike, and Tesco, or fund global impact projects.", href: "/solutions/rewards/" },
      { title: "Team Challenges", description: "Spark healthy competition with company-wide leaderboards and 1-on-1 \"Duels.\"", href: "/solutions/employee-engagement/" },
    ],
  },
  {
    id: "prevent",
    eyebrow: "Prevent",
    heading: "Proactive Health Support",
    video: {
      mp4: assetPath("/home/platform/prevent.mp4"),
      poster: assetPath("/home/platform/prevent-poster.jpg"),
      focusX: "46%",
    },
    bullets: [
      { title: "Daily Reflections", description: "Short, daily check-ins that sense shifts in stress and energy and trigger support when patterns change.", href: "/products/wellbeing-platform/" },
      { title: "24/7 Virtual GP", description: "Unlimited video calls and private prescriptions available at your team's fingertips.", href: "/solutions/virtual-gp/" },
      { title: "Comprehensive EAP", description: "24/7 mental health support and CBT tools triggered by real-life signals.", href: "/solutions/mental-health-eap/" },
      { title: "Centralised Benefits Hub", description: "One digital home for all your company's insurance and wellness policies.", href: "/solutions/wellbeing-hub/" },
    ],
  },
  {
    id: "protect",
    eyebrow: "Protect",
    heading: "Gold-Standard Insurance",
    video: {
      mp4: assetPath("/home/platform/protect.mp4"),
      poster: assetPath("/home/platform/protect-poster.jpg"),
      focusX: "44%",
    },
    bullets: [
      { title: "Market-Leading Cover", description: "Trusted policies integrated directly into the YuLife app.", href: "/products/life-insurance/" },
      { title: "Global Partnerships", description: "The institutional weight and clinical excellence of world-leading insurance brands.", href: "/who-we-help/carriers/" },
      { title: "Total Transparency", description: "24/7 digital access ensures your team knows exactly how they are protected, anywhere in the world.", href: "/products/wellbeing-platform/" },
    ],
  },
  {
    id: "empower",
    eyebrow: "Empower",
    heading: "Actionable Data & Insights",
    video: {
      mp4: assetPath("/home/platform/empower.mp4"),
      poster: assetPath("/home/platform/empower-poster.jpg"),
      focusX: "60%",
    },
    bullets: [
      { title: "Aggregated Wellbeing Data", description: "Combine employee feedback with app activity for a clear, holistic view of workforce health.", href: "/solutions/wellbeing-insights-reporting/" },
      { title: "Predictive Insights", description: "Spot rising burnout and absence risk earlier, so you can act before it costs you.", href: "/solutions/wellbeing-insights-reporting/" },
      { title: "Live eNPS Tracking", description: "Monitor Employee Net Promoter Scores in real time to understand cultural health and retention risk.", href: "/solutions/employee-surveys/" },
      { title: "Leadership-ready reporting", description: "Turn wellbeing into boardroom outcomes and show the ROI of your investment in people.", href: "/solutions/wellbeing-insights-reporting/" },
    ],
  },
] as const;

/** Real-World Rewards brand cards for the Engage tab's two scrolling columns
 *  (Figma node 2836:9324). Each tile is a lifestyle photo with the brand's white
 *  logo, exported flat (photo + dark overlay + logo) as a retina WebP — pixel-
 *  faithful brand art, never rebuilt in markup; the white card frame around it is
 *  CSS. The columns scroll in opposite directions (left down, right up). The whole
 *  band is decorative motion, so its container is aria-hidden and tiles carry no
 *  alt. `brand` is the react key / dev label only. */
const rewardTile = (slug: string, brand: string) => ({
  brand,
  src: assetPath(`/home/platform/rewards/${slug}.webp`),
});

export const rewardColumns = {
  left: [
    rewardTile("amazon", "Amazon"),
    rewardTile("marks-and-spencer", "M&S"),
    rewardTile("nike", "Nike"),
    rewardTile("garmin", "Garmin"),
    rewardTile("aldi", "Aldi"),
  ],
  right: [
    rewardTile("john-lewis", "John Lewis"),
    rewardTile("apple", "Apple"),
    rewardTile("starbucks", "Starbucks"),
    rewardTile("adidas", "Adidas"),
    rewardTile("sainsburys", "Sainsbury's"),
  ],
} as const;

export const yunity = {
  eyebrow: "Powered by",
  heading: "The more your people use it,\nthe smarter it gets",
  // Words within `heading` rendered in italic serif (Figma 2706:4997).
  emphasis: ["more", "smarter"],
  intro:
    "Most platforms tell you what happened last quarter. YuLife tells you what's about to happen next week. Every check-in, every challenge, every consultation adds to a continuously learning picture of your workforce's health.",
  body:
    "Yunity sits beneath the YuLife experience, quietly turning everyday engagement into insight. It helps YuLife understand what's changing in people's lives, interpret what that means, and guide more relevant, timely support.",
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

/** Customer tabs for the Trusted section sidebar (order matches the design).
 *  A tab with a `quote` shows the testimonial panel; without one it shows a
 *  "Coming soon" placeholder. `logoSlug` points at /public/logos/marquee/<slug>.svg
 *  — set to null to render the company name as text until the logo asset lands. */
export type Testimonial = {
  id: string;
  company: string;
  logoSlug: string | null;
  quote?: string;
  author?: string;
};

// FAKE PLACEHOLDER QUOTES — none of these have been said by anyone at these
// companies. They're stand-ins for layout/design review only. Every quote
// and author below must be replaced with a real, approved testimonial before
// this ships to production.
export const testimonials: readonly Testimonial[] = [
  {
    id: "what3words",
    company: "what3words",
    logoSlug: "what3words",
    quote:
      "Our team is spread across time zones, so a benefit that fits into someone's day rather than adding to it made all the difference. YuLife just works, wherever people are.",
    author: "Priya Malhotra, Head of People",
  },
  {
    id: "xma",
    company: "XMA",
    logoSlug: "xma",
    quote:
      "We wanted a benefit our people would actually use, not one that sat unopened in an inbox. YuLife's given us real visibility into how the team's doing, not just another line on the benefits list.",
    author: "Callum Reid, People Director",
  },
  {
    id: "ozone",
    company: "OZONE.bg",
    logoSlug: "ozone",
    quote:
      "The best part of YuLife is that everything is in the app, making it easier to keep it top of mind and check it daily. It's a clear improvement from before we had YuLife.",
    author: "Bryan Scott, CMO",
  },
  {
    id: "bruntwood",
    company: "bruntwood",
    logoSlug: "bruntwood",
    quote:
      "Bruntwood is all about creating places where people can do their best work, so our own benefits needed to live up to that. YuLife's made it easy to show our people we mean it.",
    author: "Naomi Clarke, HR Business Partner",
  },
  {
    id: "nicepak",
    company: "NICE-PAK",
    logoSlug: "nicepak",
    quote:
      "A lot of our team are on the factory floor, not sat at a desk, so a benefit that reaches everyone equally was non-negotiable. YuLife's the first one that's actually landed with the whole workforce.",
    author: "Danielle Ogundipe, HR Manager",
  },
];

/** OZONE.bg opens by default — the one tab with a published testimonial. */
export const DEFAULT_TESTIMONIAL = Math.max(
  0,
  testimonials.findIndex((t) => t.quote),
);

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
