// =============================================================================
// Nav mega-menu content model
// -----------------------------------------------------------------------------
// Derives the desktop mega-menu structure from the sitemap (single source of
// truth). Each primary nav group becomes a NavMenu; its pages are grouped into
// MenuDropColumns that map 1:1 to the Figma "MenuDropCol" component.
// Shape follows the build spec (§7): MenuItem / MenuColumn / NavEntry.
// =============================================================================

import { navGroups, type NavGroup, type Page } from "@/data/sitemap";

export type MenuItem = {
  title: string;
  description?: string;
  href: string;
};

export type MenuDropColumn = {
  /** Category label, e.g. "INSURANCE" (rendered as-is). */
  label: string;
  /** Figma variant: Default = link column, Variant2 = highlighted CTA panel. */
  variant: "Default" | "Variant2";
  /** One entry per inner column (Figma InnerGrid → InnerCol). */
  groups: MenuItem[][];
  /** Optional CTA button, only used by Variant2 columns. */
  cta?: { label: string; href: string };
};

export type NavMenu = {
  id: string;
  label: string;
  columns: MenuDropColumn[];
};

/** Short descriptions shown under each menu item title. */
export const descriptions: Record<string, string> = {
  "/products/health": "Complete health cover that goes beyond the basics",
  "/products/cash-plan": "Money back on everyday health costs",
  "/products/income-protection": "Income security when it matters most",
  "/products/life-insurance": "Group life cover with real engagement",
  "/products/dental-insurance": "High-visibility benefit employees use",
  "/products/wellbeing-platform": "Gamified wellbeing that drives daily engagement",
  "/who-we-help/businesses": "For HR leaders, People teams and business owners",
  "/who-we-help/carriers": "Commercial partnerships for insurance carriers",
  "/who-we-help/advisers": "Tools, support and differentiation for EB consultants",
  "/who-we-help/individuals": "For members who joined through work",
  "/resources/case-studies": "Real results from real companies",
  "/resources/blog": "Insights on health, benefits and culture",
  "/resources/news-events": "Latest from YuLife",
  "/resources/ebooks": "Deeper dives for decision-makers",
  "/about/about-us": "Our story, mission and values",
  "/about/careers": "Join the YuLife team",
  "/about/press": "Media resources and coverage",
  "/contact": "Get in touch with our team",
};

/** Category label per non-Products group (Products is handled specially). */
const CATEGORY_LABELS: Record<string, string> = {
  "who-we-help": "AUDIENCES",
  resources: "RESOURCES",
  about: "COMPANY",
};

function toItem(page: Page): MenuItem {
  return {
    title: page.label,
    description: descriptions[page.route],
    href: page.route,
  };
}

/** Map a sitemap page to a shared menu item (desktop + mobile). */
export function pageToMenuItem(page: Page): MenuItem {
  return toItem(page);
}

/** Split items into `parts` near-even inner columns, preserving IA order. */
function chunk<T>(items: T[], parts: number): T[][] {
  if (items.length === 0) return [];
  const per = Math.ceil(items.length / parts);
  const out: T[][] = Array.from({ length: parts }, () => []);
  items.forEach((item, i) => {
    out[Math.min(Math.floor(i / per), parts - 1)].push(item);
  });
  return out.filter((col) => col.length > 0);
}

function buildProducts(group: NavGroup): NavMenu {
  const insurance = group.pages.filter(
    (p) => p.route !== "/products/wellbeing-platform",
  );
  const platform = group.pages.filter(
    (p) => p.route === "/products/wellbeing-platform",
  );

  return {
    id: group.id,
    label: group.label,
    columns: [
      {
        label: "INSURANCE",
        variant: "Default",
        groups: chunk(insurance.map(toItem), 2),
      },
      {
        label: "PLATFORM",
        variant: "Variant2",
        groups: [
          [
            ...platform.map(toItem),
            {
              title: "Not sure which product?",
              description:
                "Our team can help match the right cover for your business.",
              href: "/contact",
            },
          ],
        ],
        cta: { label: "Speak to our team", href: "/contact" },
      },
    ],
  };
}

function buildStandard(group: NavGroup): NavMenu {
  return {
    id: group.id,
    label: group.label,
    columns: [
      {
        label: CATEGORY_LABELS[group.id] ?? group.label.toUpperCase(),
        variant: "Default",
        groups: chunk(group.pages.map(toItem), 2),
      },
    ],
  };
}

/** Ordered mega-menus for the primary nav triggers. */
export const navMenus: NavMenu[] = navGroups
  .filter((g) => g.tier === "primary")
  .map((g) => (g.id === "products" ? buildProducts(g) : buildStandard(g)));

export const LOGIN_MENU_ID = "login";

/** Log in utility dropdown (HR + Member portals). */
export const loginMenu: NavMenu = {
  id: LOGIN_MENU_ID,
  label: "Log in",
  columns: [
    {
      label: "LOG IN",
      variant: "Default",
      groups: [
        [
          {
            title: "Employers",
            description:
              "Log in to the HR Portal to manage your company on YuLife",
            href: "https://team.yulife.com",
          },
          {
            title: "Employees",
            description:
              "Log in to the Member Portal to access your YuLife products",
            href: "https://members.yulife.com",
          },
        ],
      ],
    },
  ],
};

/** All desktop dropdown menus, in left-to-right trigger order. */
export const megaMenus: NavMenu[] = [...navMenus, loginMenu];

/** Flat login links for mobile nav. */
export const loginMenuItems: MenuItem[] = loginMenu.columns[0].groups[0];
