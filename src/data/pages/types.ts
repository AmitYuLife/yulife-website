export type Cta = { label: string; href: string };

export type Rating = { platform: string; score: string };

export type Stat = {
  value: string;
  label: string;
  description?: string;
  footnote?: string;
};

export type NumberedSection = {
  number: number;
  eyebrow: string;
  heading: string;
  body?: string;
  bullets: string[];
  footnote?: string;
};

export type Quote = {
  text: string;
  author: string;
  role: string;
};

export type Testimonial = Quote;

export type ZigzagBlock = {
  eyebrow?: string;
  heading: string;
  body?: string;
  bullets?: string[];
  link?: Cta;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type CoverageGroup = {
  label: string;
  items: string[];
  footnote?: string;
};

export type ContentSection = {
  eyebrow?: string;
  heading: string;
  body?: string;
  bullets?: string[];
  stats?: Stat[];
  cards?: { title: string; description?: string }[];
  quote?: Quote;
};

export type ProductPageData = {
  pageTitle: string;
  carrier: string;
  primaryCta: Cta;
  meta?: { title: string; description: string };
  flags?: string[];
  hero: {
    eyebrow?: string;
    h1: string;
    body: string;
    ctas?: Cta[];
    partnerLockup?: string;
  };
  ratings?: Rating[];
  statChips?: Stat[];
  carrierQuote?: Quote;
  valueSections?: NumberedSection[];
  explainer?: { heading: string; body: string };
  coverage?: {
    heading: string;
    subheading?: string;
    groups: CoverageGroup[];
  };
  processSteps?: {
    heading: string;
    subheading?: string;
    steps: ProcessStep[];
  };
  employeeSection?: ContentSection;
  faqs: string[];
  legalFooter?: string;
};

export type FeaturePageData = {
  pageTitle: string;
  flags?: string[];
  hero: {
    eyebrow: string;
    h1: string;
    body: string;
    cta: Cta;
  };
  statsBar: {
    heading?: string;
    stats: Stat[];
    footnote?: string;
  };
  explainer?: { heading: string; body?: string };
  zigzagBlocks: ZigzagBlock[];
  ctaBanner?: { heading: string; cta?: Cta };
  tabSwitcher?: { tabs: string[] };
  extraBlocks?: { label: string; description: string }[];
  testimonials: Testimonial[];
  closingCta?: { heading: string; body?: string; cta: Cta };
  disclaimer?: string;
};

export type AudiencePageData = {
  pageTitle: string;
  market?: string;
  flags?: string[];
  primaryCta: Cta;
  hero: { h1?: string; heading?: string; body: string };
  sections: ContentSection[];
  partnerLogos?: string[];
  testimonial?: Quote;
};

export type EditorialPageData = {
  pageTitle: string;
  flags?: string[];
  hero: { heading: string; body: string; ctas?: Cta[] };
  sections: ContentSection[];
  values?: { name: string; description: string }[];
  stats?: Stat[];
  awards?: string[];
  faqs?: string[];
  testimonial?: Quote;
  closingCta?: { body: string; note?: string };
};
