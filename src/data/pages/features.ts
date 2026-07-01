import type { FeaturePageData } from "./types";

const defaultCta = { label: "Speak to our team", href: "/contact" };

export const rewards: FeaturePageData = {
  pageTitle: "Incentives & Rewards",
  hero: {
    eyebrow: "Global Employee Rewards",
    h1: "Rewards your people will actually use — and love",
    body: "Every healthy habit earns YuCoin, converted into real rewards from 50+ major brands (groceries, gym kit, wellbeing products, charitable donations).",
    cta: defaultCta,
  },
  statsBar: {
    stats: [
      { value: "£120", label: "avg YuCoin earned/year per engaged member*" },
      { value: "£1,000+", label: "in rewards & wellbeing discounts/year*" },
      { value: "50+", label: "retail brands" },
    ],
    footnote: "*T&Cs required",
  },
  zigzagBlocks: [
    {
      heading: "Earn real rewards for everyday healthy habits",
      link: { label: "Explore our rewards store", href: "/solutions/rewards" },
    },
    {
      heading: "Go further with Wellbeing and Prevention Passes",
      body: "Up to £1,400/employee/year; Wellbeing Pass = Garmin, Thriva, Living DNA; Prevention Pass = Scan.com, BetterHelp, Meditopia, Fiit",
      link: { label: "Find out more", href: "/contact" },
    },
    {
      heading: "Turn healthy habits into a force for good",
      body: "Impact Pass: convert YuCoin to donations; ESG leaderboard",
      link: { label: "Social impact benefits", href: "/solutions/rewards" },
    },
  ],
  extraBlocks: [
    { label: "Global rewards map", description: "Existing component — reuse" },
    { label: "Rewards list", description: "Existing component — reuse" },
  ],
  testimonials: [
    {
      text: "Testimonial placeholder",
      author: "Clare Jones",
      role: "Fladgate",
    },
    { text: "Testimonial placeholder", author: "Gemma McCall", role: "Culture Shift" },
    { text: "Testimonial placeholder", author: "Sol Zygadlo", role: "Vodafone" },
  ],
  closingCta: {
    heading: "Ready to hear how we can help?",
    cta: { label: "Find out more", href: "/contact" },
  },
};

export const mentalHealthEap: FeaturePageData = {
  pageTitle: "Mental Health (EAP)",
  hero: {
    eyebrow: "Mental Health & Wellbeing",
    h1: "Build mental resilience before crisis strikes",
    body: "Comprehensive EAP + daily self-care tools + a personalised Wellbeing Hub.",
    cta: defaultCta,
  },
  statsBar: {
    heading: "The impact of YuLife on mental health & wellbeing",
    stats: [
      { value: "4x", label: "increase in EAP use" },
      { value: "53%", label: "reduction in reported stress" },
      { value: "55%", label: "practise mindfulness monthly" },
    ],
  },
  explainer: { heading: "Mental wellbeing that goes beyond a helpline" },
  zigzagBlocks: [
    {
      eyebrow: "Employee Assistance Programme",
      heading: "The EAP your employees will actually use",
      body: "YuMatter; 24/7 counselling, bereavement, financial/legal, crisis; 4x utilisation",
      bullets: [
        "24/7 counselling and crisis support",
        "Bereavement, financial and legal assistance",
        "Add-on services available",
      ],
    },
    {
      eyebrow: "Daily self-care",
      heading: "Daily self-care that builds resilience every day",
      body: "Daily Reflections, YuCoin; 53% less stress, 55% mindfulness",
    },
    {
      eyebrow: "Wellbeing Hub",
      heading: "One Wellbeing Hub for everything your people need",
      body: "EAP, Virtual GP, perks, benefits in one configurable place.",
    },
  ],
  ctaBanner: {
    heading: "Support that shows up before your people have to ask for it",
  },
  testimonials: [
    { text: "Testimonial placeholder", author: "Louise Millson", role: "BBOWT" },
    { text: "Testimonial placeholder", author: "Melanie Taylor", role: "FYXR" },
    { text: "Testimonial placeholder", author: "Shelly Webb", role: "Del Monte" },
  ],
  closingCta: { heading: "Speak to our team", cta: defaultCta },
};

export const virtualGp: FeaturePageData = {
  pageTitle: "Virtual GP",
  flags: ["Provider updated CareFirst → HealthHero — no stale references"],
  hero: {
    eyebrow: "Virtual GP Services",
    h1: "Healthcare your employees will actually use",
    body: "YuDoctor, powered by HealthHero — 24/7 GP access by video, phone or message inside the app, for employees and family.",
    cta: defaultCta,
  },
  statsBar: {
    stats: [
      { value: "2.4x", label: "virtual GP usage increase" },
      { value: "3x", label: "increase in healthy habits" },
      { value: "15%", label: "reduction in long-term health conditions" },
    ],
  },
  explainer: { heading: "More than a GP — a complete picture of physical health" },
  zigzagBlocks: [
    {
      eyebrow: "Virtual GP | powered by HealthHero",
      heading: "YuDoctor: a GP in their pocket",
      bullets: [
        "24/7 GPs by video, phone or message",
        "Private prescriptions and fit notes",
        "Open referrals to specialists",
      ],
    },
    {
      eyebrow: "Prevention & healthy habits",
      heading: "Build the habits that keep people well",
    },
    {
      eyebrow: "Wellbeing Hub",
      heading: "One Wellbeing Hub for their complete health",
    },
  ],
  ctaBanner: { heading: "Give your people the full picture of their health" },
  testimonials: [
    {
      text: "Testimonial placeholder",
      author: "Dan Katri & Tom Silk",
      role: "Vanti",
    },
    { text: "Testimonial placeholder", author: "Ewen MacPherson", role: "Havas Group" },
  ],
  closingCta: { heading: "Speak to our team", cta: defaultCta },
};

export const employeeSurveys: FeaturePageData = {
  pageTitle: "Employee Surveys",
  flags: ["Stats bar figures are placeholders — confirm before publishing"],
  hero: {
    eyebrow: "Employee Surveys",
    h1: "Hear from your people — and actually know what to do next",
    body: "Customisable surveys combine direct feedback with real-time wellbeing data.",
    cta: defaultCta,
  },
  statsBar: {
    stats: [
      { value: "2x", label: "richer insight when combined with wellbeing data" },
      { value: "Minutes", label: "eNPS + sentiment in minutes" },
      { value: "100%", label: "anonymised" },
    ],
    footnote: "Placeholder stats — confirm with data/product team",
  },
  explainer: { heading: "More than a pulse check" },
  zigzagBlocks: [
    {
      heading: "Ask the questions that matter",
      body: "Customisable, in-app, YuCoin-incentivised surveys.",
    },
    {
      heading: "Wellbeing data that gives context to every answer",
      body: "Employer Portal trends by team/region/segment.",
    },
    {
      heading: "Insight that turns into action — without adding HR admin",
      body: "Auto-routes employees to support; anonymised/aggregated.",
    },
  ],
  ctaBanner: { heading: "Ready to understand your workforce like never before?" },
  testimonials: [
    { text: "Testimonial placeholder", author: "Clare Jones", role: "Fladgate" },
    { text: "Testimonial placeholder", author: "Gemma McCall", role: "Culture Shift" },
    { text: "Testimonial placeholder", author: "Sol Zygadlo", role: "Vodafone" },
  ],
  closingCta: { heading: "Speak to our team", cta: defaultCta },
};

export const rewardAndRecognition: FeaturePageData = {
  pageTitle: "Reward & Recognition",
  hero: {
    eyebrow: "Reward & Recognition",
    h1: "Build a culture where people feel valued — every single day",
    body: "Wellbeing + recognition in one place.",
    cta: defaultCta,
  },
  statsBar: {
    stats: [
      { value: "18%", label: "increase in employee satisfaction (YuLife 2024)" },
      { value: "2.75%", label: "avg reduction in turnover (Forrester TEI 2022)" },
      { value: "1", label: "platform (no set-up fees)" },
    ],
  },
  explainer: {
    heading: "Recognition that's part of your wellbeing culture — not separate from it",
    body: "Managers reward with YuCoin; peer-to-peer gifting.",
  },
  zigzagBlocks: [
    {
      heading: "Celebrate every win, big or small",
      body: "Send YuCoin from HR Portal; scheduled gifts; instant notifications.",
    },
    {
      heading: "Reward that means something to everyone",
      body: "YuCoin across 50+ brands.",
    },
    {
      heading: "Bring wellbeing and recognition together in one culture",
      body: "Closes the engagement→health→lower-risk loop; one dashboard.",
    },
  ],
  ctaBanner: {
    heading: "Great culture starts with celebrating the people who make it",
  },
  testimonials: [
    { text: "Testimonial placeholder", author: "Cloud International", role: "" },
    { text: "Testimonial placeholder", author: "xDesign", role: "" },
    { text: "Testimonial placeholder", author: "Sol Zygadlo", role: "Vodafone" },
  ],
  closingCta: { heading: "Speak to our team", cta: defaultCta },
};

export const hrInsights: FeaturePageData = {
  pageTitle: "Reporting (HR Insights)",
  hero: {
    eyebrow: "HR Insights & Reporting",
    h1: "The clearest view of your workforce you've ever had",
    body: "Employer Portal unites wellbeing engagement data, dynamic health insights and direct feedback.",
    cta: defaultCta,
  },
  statsBar: {
    stats: [
      { value: "NPS 86", label: "vs industry 39 life / 27 health" },
      { value: "4.9", label: "#1 on Trustpilot" },
      { value: "4.8", label: "on Capterra (109 reviews)" },
    ],
    footnote: "Sources approved in killer-stats sheet",
  },
  zigzagBlocks: [
    {
      heading: "Demonstrate behaviour change",
      body: "Employee Insights dashboard; leadership-ready ROI reports",
      link: { label: "Learn more about the HR Portal", href: "/contact" },
    },
    {
      heading: "Understand wellbeing risks",
      body: "Daily Reflections → aggregated, anonymised trends; early burnout/stress signals by team/region/segment",
    },
    {
      heading: "Hear from your employees",
      body: "Customisable surveys; eNPS, sentiment, themes",
    },
  ],
  tabSwitcher: { tabs: ["Insights (at-a-glance)", "Patterns (behavioural trends)", "Reporting (ROI reports)"] },
  testimonials: [
    { text: "Testimonial placeholder", author: "Nice-Pak", role: "" },
    { text: "Testimonial placeholder", author: "xDesign", role: "" },
    { text: "Testimonial placeholder", author: "Cloud International", role: "" },
  ],
  closingCta: { heading: "Speak to our team", cta: defaultCta },
  disclaimer: "Forrester TEI disclaimer (retain)",
};

export const featurePages: Record<string, FeaturePageData> = {
  "/solutions/rewards": rewards,
  "/solutions/mental-health-eap": mentalHealthEap,
  "/solutions/virtual-gp": virtualGp,
  "/solutions/employee-surveys": employeeSurveys,
  "/solutions/reward-and-recognition": rewardAndRecognition,
  "/solutions/wellbeing-insights-reporting": hrInsights,
};
