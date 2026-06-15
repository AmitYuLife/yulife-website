// =============================================================================
// YuLife Website 2026 — Sitemap (single source of truth)
// =============================================================================
// Derived from the agreed "Revised" frame in the Kickoff Workshop FigJam board.
// This file drives: the header/footer navigation, every page stub, the in-site
// /sitemap overview, and the page generator (scripts/generate-pages.mjs).
//
// Edit this file to add/remove/rename pages — then run `npm run gen:pages`.
//
// Nav group labels (Products, Who we help, etc.) are dropdown triggers only —
// they do not have their own routes.
//
// copyStatus:
//   "approved" — approved copy exists in the 2026 content doc
//   "none"     — no copy yet (stub only)
//
// flag (optional):
//   "under-consideration" — in the agreed IA but not yet confirmed as its own page
//   "orphan"              — copy exists but no agreed home in the IA (decision needed)
// =============================================================================

export type Page = {
  label: string;
  route: string;
  purpose: string;
  copyStatus: "approved" | "none";
  copySource?: string;
  flag?: "under-consideration" | "orphan";
};

export type NavGroup = {
  id: string;
  label: string;
  tier: "primary" | "secondary";
  purpose: string;
  pages: Page[];
};

export const home: Page = {
  label: "Home",
  route: "/",
  purpose:
    "Orient every audience, communicate the core proposition (insurance that inspires life), and route visitors to the most relevant product, audience or solution.",
  copyStatus: "approved",
  copySource: "Home",
};

export const navGroups: NavGroup[] = [
  {
    id: "products",
    label: "Products",
    tier: "primary",
    purpose:
      "Routes economic buyers to the specific product most relevant to them. Each product page sits beneath here and must stand alone.",
    pages: [
      {
        label: "Health",
        route: "/products/health",
        purpose:
          "Plain-language overview of YuLife's health insurance: what's covered, who it protects, and why the approach differs from a standard policy. Moves visitors towards a commercial conversation.",
        copyStatus: "approved",
        copySource: "Group Health Insurance",
      },
      {
        label: "Cash Plan",
        route: "/products/cash-plan",
        purpose:
          "Makes cash plan value tangible — employees get money back on everyday health costs. Positions it as a high-usage benefit that complements other cover.",
        copyStatus: "approved",
        copySource: "Cash Plan",
      },
      {
        label: "Income Protection",
        route: "/products/income-protection",
        purpose:
          "Builds confidence in income protection by explaining what it does and why it matters — answering the 'why does this matter to my business' question.",
        copyStatus: "approved",
        copySource: "Group Income Protection",
      },
      {
        label: "Life Insurance",
        route: "/products/life-insurance",
        purpose:
          "Presents life insurance in a human (not heavy) way, as part of a complete benefits package, and articulates what makes YuLife different from a standard group life policy.",
        copyStatus: "approved",
        copySource: "Group Life Insurance",
      },
      {
        label: "Dental Insurance",
        route: "/products/dental-insurance",
        purpose:
          "Makes the case for dental as a visible, high-engagement benefit employees actually claim on — strengthening the overall package.",
        copyStatus: "none",
      },
      {
        label: "Wellbeing Platform (SaaS)",
        route: "/products/wellbeing-platform",
        purpose:
          "Explains the YuLife wellbeing product (standalone or alongside insurance): how the gamified experience works, what employees get, and what engagement means for employer health outcomes and ROI.",
        copyStatus: "none",
      },
    ],
  },
  {
    id: "who-we-help",
    label: "Who we help",
    tier: "primary",
    purpose:
      "Routes buyer audiences to content built for their context. The job is self-identification: a visitor should immediately see themselves and land on a page that feels built for them.",
    pages: [
      {
        label: "Businesses",
        route: "/who-we-help/businesses",
        purpose:
          "Speaks to HR leaders, People teams and business owners. Connects YuLife to the outcomes they care about (health, engagement, retention, ROI) and moves them towards a demo or adviser conversation.",
        copyStatus: "approved",
        copySource: "Businesses",
      },
      {
        label: "Carriers",
        route: "/who-we-help/carriers",
        purpose:
          "Presents YuLife to insurance carriers as a commercial partnership — how YuLife drives daily engagement with otherwise-invisible insurance products, and what that means for loyalty, risk data and product value.",
        copyStatus: "approved",
        copySource: "Carriers",
      },
      {
        label: "Advisers",
        route: "/who-we-help/advisers",
        purpose:
          "Gives advisers and EB consultants a clear picture of why YuLife is worth recommending — credibility, product differentiation, adviser support — and an easy next step.",
        copyStatus: "approved",
        copySource: "Advisers",
      },
      {
        label: "Individuals",
        route: "/who-we-help/individuals",
        purpose:
          "Members who joined through work. NOTE (FigJam): until YuLife is more D2C, consider folding this into the other audiences through the lens of 'your people' rather than a standalone page.",
        copyStatus: "approved",
        copySource: "Individuals",
        flag: "under-consideration",
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    tier: "primary",
    purpose:
      "Supports the consideration and decision-making stages. Content should educate, build trust and demonstrate YuLife's thinking on wellbeing and benefits — not just sell.",
    pages: [
      {
        label: "Case Studies",
        route: "/resources/case-studies",
        purpose:
          "Proof YuLife works in practice — evidence for businesses, advisers and carriers to build an internal case. Should reflect a range of company sizes and sectors.",
        copyStatus: "none",
      },
      {
        label: "Blog",
        route: "/resources/blog",
        purpose:
          "Ongoing relationship with HR leaders, advisers and decision-makers through useful content on health, benefits strategy and workplace culture. Also serves organic search.",
        copyStatus: "none",
      },
      {
        label: "News & Events",
        route: "/resources/news-events",
        purpose:
          "Keeps press, partners, advisers and customers informed about YuLife's market activity, and surfaces events where people can engage directly.",
        copyStatus: "none",
      },
      {
        label: "Ebooks",
        route: "/resources/ebooks",
        purpose:
          "Deeper downloadable content for decision-makers tackling specific challenges. Dual purpose: lead generation and trust-building.",
        copyStatus: "none",
      },
    ],
  },
  {
    id: "about",
    label: "About",
    tier: "primary",
    purpose:
      "Covers YuLife as a company rather than a product. Serves prospective customers doing due diligence, journalists, potential hires and partners.",
    pages: [
      {
        label: "About Us",
        route: "/about/about-us",
        purpose:
          "A clear, human account of who YuLife is, why it exists and what it stands for — connecting visitors to purpose before they engage commercially.",
        copyStatus: "approved",
        copySource: "About Us",
      },
      {
        label: "Careers",
        route: "/about/careers",
        purpose:
          "Attracts people who want to work at the intersection of insurance, technology and wellbeing. Communicates what it's like to work at YuLife and makes roles easy to find and apply for.",
        copyStatus: "approved",
        copySource: "Careers",
      },
      {
        label: "Press",
        route: "/about/press",
        purpose:
          "Serves journalists and media with releases, coverage, company facts and a clear press contact, so they can cover YuLife accurately.",
        copyStatus: "none",
        flag: "under-consideration",
      },
      {
        label: "Contact",
        route: "/contact",
        purpose:
          "Routes audiences (businesses, advisers, existing customers, press) to the right contact point and reduces friction in starting a conversation.",
        copyStatus: "none",
        flag: "under-consideration",
      },
    ],
  },
  {
    id: "solutions",
    label: "Solutions",
    tier: "secondary",
    purpose:
      "Gives YuLife's individual features and services their own space. Underpins the audience and product pages, and serves buyers who want to understand how YuLife works before committing to a conversation. Also rehouses existing primary links and solution-led content.",
    pages: [
      {
        label: "Employee Engagement",
        route: "/solutions/employee-engagement",
        purpose:
          "How YuLife drives genuine engagement through gamification and daily habits — challenges, duels, leaderboards, team events — and why this reaches engagement levels typical benefits programmes don't.",
        copyStatus: "approved",
        copySource: "Employee Engagement",
      },
      {
        label: "Rewards",
        route: "/solutions/rewards",
        purpose:
          "How the rewards model works and why it motivates: what YuCoin is, how employees earn it, what they spend it on — connecting rewards back to health outcomes and employer value.",
        copyStatus: "approved",
        copySource: "Incentives & Rewards",
      },
      {
        label: "Benefit Consolidation",
        route: "/solutions/benefit-consolidation",
        purpose:
          "How YuLife brings an employee's benefits together in one place rather than scattered across providers — driving higher engagement across every benefit. Addresses an HR pain point and gives advisers a simplicity story.",
        copyStatus: "none",
      },
      {
        label: "Mental Health & EAP",
        route: "/solutions/mental-health-eap",
        purpose:
          "A clear picture of the mental health and EAP offering. Makes the case for proactive, everyday support (not a crisis service) and explains what's included.",
        copyStatus: "approved",
        copySource: "Mental Health (EAP)",
      },
      {
        label: "Virtual GP",
        route: "/solutions/virtual-gp",
        purpose:
          "Communicates fast, accessible GP access as both a health and productivity benefit — practical and frictionless, reducing absence and barriers to getting medical help quickly.",
        copyStatus: "approved",
        copySource: "Virtual GP",
      },
      {
        label: "Wellbeing Insights & Reporting",
        route: "/solutions/wellbeing-insights-reporting",
        purpose:
          "How YuLife gives employers meaningful visibility into workforce health and engagement — what data is available, how it's used, why it matters for benefits strategy and risk — without feeling like surveillance.",
        copyStatus: "approved",
        copySource: "Reporting",
      },
      {
        label: "Employee Surveys",
        route: "/solutions/employee-surveys",
        purpose:
          "How the built-in survey tool gives employers a regular, reliable read on wellbeing — part of a joined-up listening approach that helps HR act on what they hear.",
        copyStatus: "approved",
        copySource: "Employee Surveys",
      },
      {
        label: "Reward & Recognition",
        route: "/solutions/reward-and-recognition",
        purpose:
          "Connects recognition to the wellbeing journey rather than a standalone tool. NOTE: approved copy exists in the content doc but this page has no agreed home in the 'Revised' IA — confirm whether it belongs under Solutions.",
        copyStatus: "approved",
        copySource: "Reward & Recognition",
        flag: "orphan",
      },
    ],
  },
];

/** Flat list of every routable page (home + nav children), in IA order. */
export const allPages: Page[] = [home, ...navGroups.flatMap((g) => g.pages)];

export function getPageByRoute(route: string): Page {
  const page = allPages.find((p) => p.route === route);
  if (!page) throw new Error(`Sitemap page not found for route: ${route}`);
  return page;
}

export function getNavGroupForPage(route: string): NavGroup | undefined {
  return navGroups.find((g) => g.pages.some((p) => p.route === route));
}

export function isNavGroupActive(group: NavGroup, pathname: string): boolean {
  return group.pages.some(
    (p) => pathname === p.route || pathname.startsWith(`${p.route}/`)
  );
}
