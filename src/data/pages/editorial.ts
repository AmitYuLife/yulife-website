import type { EditorialPageData } from "./types";

export const aboutUs: EditorialPageData = {
  pageTitle: "About Us",
  flags: ["Two overlapping drafts merged — pick one source of truth before build"],
  hero: {
    heading: "Insurance that inspires life.",
    body: "What if insurance didn't just protect you when things go wrong, but helped you live better, every single day? Together with our insurer partners, we've created an experience that's changing what insurance means for millions.",
    ctas: [
      { label: "See how it works", href: "/products" },
      { label: "Talk to us", href: "/contact" },
    ],
  },
  sections: [
    {
      heading: "Insurance was built to react. We built it to inspire.",
      body: "80% of chronic disease is linked to lifestyle, yet <2% regularly use the health tools their insurance provides. Founded 2016 to change that. Goal: improve 100M lives by 2030.",
      stats: [
        { value: "80%", label: "chronic disease linked to lifestyle" },
        { value: "<2%", label: "regularly use health tools" },
        { value: "100M", label: "lives by 2030" },
      ],
    },
    {
      heading: "The insurtech redefining what insurance can do.",
      body: "AI-forward insurtech; the customer-facing platform, engagement layer and intelligence on top of insurer-partner infrastructure (underwriting/admin/financial strength sits with partners — Bupa, MetLife, Old Mutual). Behind it: Yunity™ AI intelligence layer.",
    },
    {
      heading: "What we do",
      bullets: [
        "Daily engagement — gamified wellbeing, YuCoin, 100+ rewards partners",
        "Deep protection — Group Life, Income Protection, Health, Cash Plan via Bupa/MetLife",
        "Insight at scale — health/behavioural data for employers, insurers, advisers",
      ],
    },
    {
      heading: "Who we serve",
      cards: [
        { title: "Employers", description: "Benefits that drive engagement and ROI" },
        { title: "Employees (Individuals)", description: "Rewards and wellbeing every day" },
        { title: "Insurers", description: "Engagement layer on existing products" },
        { title: "Advisers and brokers", description: "Differentiated offering clients love" },
      ],
    },
    {
      heading: "Bringing colour to a black and white world.",
      body: "Founder Sammy Rubin (founding CEO of PruProtect, the UK's first life insurer to reward healthy behaviour); burnout → sabbatical → the question \"why do people dread their insurance?\". Founded 2016. HQ London; operating UK, South Africa, Japan, USA. Backed by Creandum, LocalGlobe, Dai-ichi Holdings. B-Corp certified.",
    },
  ],
  values: [
    { name: "Love", description: "give more than you take" },
    { name: "Being", description: "be present, vulnerable, open" },
    { name: "Yu", description: "unlock your potential; Yugi the mascot" },
  ],
  stats: [
    { value: "2016", label: "founded" },
    { value: "1.5M+", label: "members" },
    { value: "1,100+", label: "employer partners" },
    { value: "NPS 84/86", label: "⚠ reconcile" },
    { value: "80%/93%", label: "app engagement ⚠" },
    { value: "B-Corp", label: "certified" },
  ],
  awards: [
    "#1 employee benefit on Trustpilot",
    "Best Financial Wellbeing Provider — British Insurance Awards",
    "Insurtech of the Year — Cover Excellence",
    "Fastest Growing Startup in Europe — Deloitte",
  ],
  faqs: [
    "What is YuLife?",
    "Is YuLife an insurance company?",
    "How is it different from an employee benefits platform?",
    "What products are available?",
    "Who are the insurer partners?",
    "Where does YuLife operate?",
  ],
};

export const careers: EditorialPageData = {
  pageTitle: "Careers",
  flags: ["Marked NEEDS EDITING in source — treat copy as draft"],
  hero: {
    heading: "Come join the YuCrew.",
    body: "YuLife is on a mission to inspire people to live their best lives every day. Building an AI-forward insurtech that brings health and insurance together; looking for smart, humble, driven people.",
  },
  sections: [
    {
      heading: "Work with purpose and great people",
      bullets: [
        "Work with the brightest",
        "Training & learning",
        "Mission-driven (B-Corp)",
        'Bring your whole self ("Love Being Yu")',
        "Benefits that matter",
      ],
    },
    {
      heading: "YuCrew in numbers",
      stats: [
        { value: "150+", label: "YuCrew members" },
        { value: "19+", label: "countries" },
        { value: "★★★★★", label: "Strong employee reviews" },
      ],
    },
    {
      heading: "Benefits that match our philosophy",
      bullets: [
        "Insurance protection wherever based",
        "Wellbeing rewards",
        "Mental health support",
        "Family-friendly & flexible working",
        "Learning & development",
        "Time off for real rest",
      ],
    },
  ],
  testimonial: {
    text: "It feels like the future of insurance… YuLife is revolutionising insurance.",
    author: "Team member",
    role: "YuLife",
  },
  closingCta: {
    body: "Closing line invites speculative applications.",
    note: "Recommend a clear CTA to a roles/ATS listing — none specified in source",
  },
};

export const editorialPages: Record<string, EditorialPageData> = {
  "/about/about-us": aboutUs,
  "/about/careers": careers,
};
