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
  /** Optional headshot for the person quoted; path under /public. */
  avatar?: string;
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

/** One highlight in the scroll-driven "everyday value" section. */
export type EverydayValueBlock = {
  title: string;
  body: string;
  /** Spot illustration shown in the card while this block is active; path under /public. */
  image: string;
  alt: string;
};

/**
 * Bespoke engagement section (Health product page). The blocks are stepped
 * through on scroll: the active one is highlighted and its illustration
 * crossfades into the card. See EverydayValueSection.
 */
export type EverydayValueSection = {
  eyebrow: string;
  heading: string;
  /** Bold lead line above the supporting paragraph. */
  lead: string;
  body: string;
  blocks: EverydayValueBlock[];
};

/** One clinical-benefit callout: a spot illustration, a title and a paragraph. */
export type ClinicalExcellenceCard = {
  /** Spot illustration path under /public. */
  icon: string;
  alt: string;
  title: string;
  /** May contain unicode superscripts (¹²³*) tying into the section footnote. */
  body: string;
};

/**
 * Bespoke clinical-benefits section (Health product page, Figma 2357:1512).
 * A raised dark-purple panel with a serif headline and a grid of illustrated
 * benefit callouts. Replaces the "Bupa clinical excellence" grey-box value
 * section, the same way `everydayValue` replaces its grey-box equivalent.
 */
export type ClinicalExcellenceSection = {
  eyebrow: string;
  heading: string;
  body: string;
  cards: ClinicalExcellenceCard[];
  footnote?: string;
};

/** One stat in the "Proven ROI" section: a big number, a short label, the copy
 * revealed on hover, and its source citation. */
export type ProvenRoiStat = {
  value: string;
  label: string;
  note: string;
  source?: string;
};

/**
 * Bespoke "Proven ROI" section (Health product page, Figma 2357:1635). A raised
 * dark-purple band with an eyebrow, serif headline, lead paragraph and a row of
 * animated stat columns (the shared StatsColumns block). Replaces the "Proven
 * ROI" grey-box value section, the same way `clinicalExcellence` replaces its.
 */
export type ProvenRoiSection = {
  eyebrow: string;
  heading: string;
  body: string;
  stats: ProvenRoiStat[];
};

/** One Sense/Interpret/Guide step in the "business pulse" (Yunity) section. */
export type BusinessPulseStep = {
  title: string;
  /** Lowercase, trailing full stop — the card capitalises and trims it. */
  description: string;
};

/**
 * Bespoke "business pulse" section (Health product page, Figma 2357:1700). The
 * same Yunity block as the homepage — framed lockup card, live star and the
 * three Sense/Interpret/Guide cards joined by animated connecting roots — with
 * health-specific heading and body. Replaces the "Smarter protection" grey-box
 * value section (number 3).
 */
export type BusinessPulseSection = {
  heading: string;
  body: string;
  steps: BusinessPulseStep[];
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
  everydayValue?: EverydayValueSection;
  clinicalExcellence?: ClinicalExcellenceSection;
  provenRoi?: ProvenRoiSection;
  businessPulse?: BusinessPulseSection;
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
  faqs: FaqEntry[];
  legalFooter?: string;
};

/** A FAQ entry: a bare question (answer to follow) or a question with its
 * answer copy wired in. Consumed by `FaqSection`. */
export type FaqEntry = string | { question: string; answer: string };

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
