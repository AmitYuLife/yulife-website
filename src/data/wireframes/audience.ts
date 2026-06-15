import type { AudiencePageData } from "./types";

export const carriers: AudiencePageData = {
  pageTitle: "Carriers",
  market: "US (/us/)",
  flags: ["Stats differ from employer-facing pages — confirm carrier vs employer audience"],
  primaryCta: { label: "Tell us about your products", href: "/contact" },
  hero: {
    h1: "Turn protection into something people use every day",
    body: "We partner as an engagement layer around your existing products, or go deeper with admin, member management and insight that feeds underwriting and pricing. Your products. Our engine for daily engagement and better risk visibility.",
  },
  sections: [
    {
      heading: "Why partner with YuLife?",
      body: "Carriers face low engagement, invisible lifestyle risk, and price-only competition. YuLife: members engage 30x more/month than traditional insurer apps → 86 NPS (industry avg 27) and 98% policy renewal (vs 82% market avg); carriers have seen 8x growth.",
    },
    {
      heading: "Products we power",
      body: "Group life · Group health · Income protection · Pension. (Start with one line, expand over time.)",
    },
    {
      heading: "Customer fit",
      bullets: [
        "SME — simple differentiated packages",
        "Mid-size — deeper engagement + insight",
        "Corporate — multi-country/complex schemes",
      ],
    },
    {
      heading: "Current partners",
      cards: [
        { title: "MetLife" },
        { title: "Bupa" },
        { title: "Dai-ichi Life" },
        { title: "Mutual of Omaha" },
        { title: "Tawuniya" },
        { title: "Guardrisk" },
        { title: "Aviva" },
      ],
    },
    {
      heading: "Reward programme",
      body: "Customisable to members/proposition; ESG-linked, everyday, and high-value reward tiers at different price points.",
    },
    {
      heading: "Branded employer portal",
      body: "Branded portal for employers (burnout risk, absenteeism, surveys, engagement) that also feeds the carrier's population-health/risk view.",
    },
    {
      heading: "A clearer view of population health",
      bullets: [
        "Ongoing engagement data",
        "Earlier, more predictable intervention",
        "Outcomes-based value (renewal, activation, risk improvement)",
      ],
    },
    {
      heading: "What the partnership looks like",
      bullets: [
        "Co-branded experience",
        "One experience for health, rewards and cover",
        "A team that works with yours (incl. reinsurer partnerships)",
        "Integration that fits (light engagement layer → deeper admin/data/underwriting)",
      ],
    },
  ],
};

export const advisers: AudiencePageData = {
  pageTitle: "Advisers",
  flags: ["No CTA defined in source — recommend Become a partner / Talk to us"],
  primaryCta: { label: "Become a partner", href: "/contact" },
  hero: {
    heading: "A win-win partnership",
    body: "Meet the needs of your clients and grow your business with an insurance and wellbeing offering employees love and use every day.",
  },
  sections: [
    {
      eyebrow: "YuLife's proven impact",
      heading: "Proven impact",
      stats: [
        { value: "17x", label: "growth vs traditional insurance" },
        { value: "86", label: "NPS" },
        { value: "72%", label: "engage regularly" },
        { value: "300%", label: "greater close rate" },
        { value: "4.8", label: "on Capterra & Trustpilot" },
      ],
    },
    {
      heading: "About YuLife for advisers",
      body: "All-in-one wellbeing: group insurance, rewards and benefits in a gamified app.",
      bullets: [
        "Revenue growth",
        "Enhanced customer satisfaction",
        "Risk mitigation (behavioural science, AI, game mechanics)",
      ],
    },
    {
      heading: "The value of working with YuLife",
      bullets: [
        "Win new business",
        'Five-star customer experience (118+ years insurance experience in ops)',
        'Post-launch support ("Best Value Provider" on Capterra)',
        "Positive ESG impact",
      ],
    },
    {
      heading: "Key resources for advisers",
      cards: [
        { title: "Intro presentation", description: "Adaptable slides" },
        { title: "Value overview PDF", description: "Download" },
        { title: "Recommendation guide", description: "Suitability-letter wording" },
        { title: "Adviser Support Hub", description: "Online resources" },
      ],
    },
    {
      heading: "Insurance products offered",
      body: "Group Life · Group Income Protection · Group Dental (Bupa) · Group Health.",
    },
  ],
  testimonial: {
    text: "As a broker, I've seen how YuLife's app builds community in companies. Our clients love it, and so do we… They're leading the pack in making insurance easy, engaging and team-friendly.",
    author: "Leighton Churchill",
    role: "Development Director, Partners&",
  },
  partnerLogos: ["Bupa", "MetLife", "Zurich"],
};

export const individuals: AudiencePageData = {
  pageTitle: "Individuals",
  market: "US member page",
  primaryCta: { label: "Download the app", href: "/contact" },
  hero: {
    heading: "The app that rewards you for living well",
    body: "Download the YuLife app to improve your wellbeing, earn rewards and connect with your community.",
  },
  sections: [
    {
      heading: "Core benefits",
      bullets: [
        "Incentives & Rewards — YuCoin for walking, meditation",
        "Engagement — community of 1M+ protected globally",
        "Wellbeing tools — 24/7 Virtual GP, mental health support, fitness challenges",
      ],
    },
    {
      heading: "How it works",
      bullets: [
        "Download the app — sync steps & mindful minutes from your wearable/health app.",
        "Complete daily challenges — walking, cycling, meditation quests earn YuCoin.",
        "Spend your rewards — vouchers from favourite brands, or social impact (plant trees, donate).",
      ],
    },
    {
      heading: "Key features",
      bullets: ["Leaderboards", "YuMojis (3D avatar)", "Social Impact"],
    },
  ],
  testimonial: {
    text: "YuLife has completely changed my relationship with my health. I feel motivated to move more every day knowing that I'm earning rewards while taking care of myself.",
    author: "YuLife Member",
    role: "",
  },
};

export const audiencePages: Record<string, AudiencePageData> = {
  "/who-we-help/carriers": carriers,
  "/who-we-help/advisers": advisers,
  "/who-we-help/individuals": individuals,
};
