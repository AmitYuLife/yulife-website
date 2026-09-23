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
/**
 * One exported foreground asset inside the windowed visual (see
 * `EverydayValueWindow`). Positions are in the design's window coordinates
 * (px within the square window, e.g. 400×400), so they scale with the window.
 */
export type EverydayValueLayer = {
  /** Path under /public. */
  src: string;
  alt?: string;
  /** Intrinsic pixel size of the exported image (e.g. its 4x export). */
  width: number;
  height: number;
  /** Top-left position and rendered width in window px. */
  x: number;
  y: number;
  w: number;
  /** Add the Shadow/Card offset shadow in CSS (for exports without it baked in). */
  shadow?: boolean;
};

export type EverydayValueBlock = {
  title: string;
  /** One paragraph, or several rendered as stacked <p>s. */
  body: string | readonly string[];
  /**
   * Spot illustration shown in the card while this block is active; path under
   * /public. Unused when the section has a `window` visual.
   */
  image?: string;
  alt?: string;
  /** Windowed visual only: the exported assets shown while this block is active. */
  layers?: readonly EverydayValueLayer[];
};

/**
 * Windowed visual for `EverydayValueSection`: a sticky rounded window holding a
 * tall background that pans with scroll (parallax) behind each block's
 * exported foreground `layers`, which fade in from the scroll direction.
 */
export type EverydayValueWindow = {
  /** Window edge in design px (it's square). */
  size: number;
  background: { src: string; width: number; height: number };
  /** Background height in window px (e.g. 868 in a 400 window). */
  backgroundHeight: number;
};

/**
 * Bespoke engagement section (Health product page). The blocks are stepped
 * through on scroll: the active one is highlighted and its illustration
 * crossfades into the card. See EverydayValueSection.
 */
export type EverydayValueSection = {
  eyebrow: string;
  heading: string;
  /**
   * Trailing fragment of `heading` set in italic serif. Defaults to "every day"
   * (the Health page's accent) when omitted.
   */
  accent?: string;
  /** Bold lead line above the supporting paragraph. */
  lead: string;
  /** Supporting paragraph. Omit when the header has a single paragraph. */
  body?: string;
  blocks: EverydayValueBlock[];
  /** Replace the flipping spot illustration with the windowed parallax visual. */
  window?: EverydayValueWindow;
};

/**
 * Optional closing panel for `EverydayValueSection` — a heading + body card in
 * place of the testimonial QuoteBlock, carrying the same gradient-border trace.
 */
export type EverydayValuePanel = {
  heading: string;
  /** Fragment of `heading` set in italic serif. */
  accent?: string;
  /** "center" = the narrower, centred card (Wellbeing Hub). Defaults to left. */
  align?: "left" | "center";
  paragraphs: readonly string[];
  /** Optional button rendered beneath the paragraphs. */
  cta?: Cta;
};

/** One clinical-benefit callout: a spot illustration, a title and a paragraph. */
export type ClinicalExcellenceCard = {
  /** Spot illustration path under /public. */
  icon: string;
  alt: string;
  title: string;
  /**
   * May contain unicode superscripts (¹²³*) tying into the section footnote.
   * Omit for an icon+title-only card with no hover reveal (the Cash Plan grid).
   */
  body?: string;
};

/**
 * Bespoke clinical-benefits section (Health product page, Figma 2357:1512).
 * A raised dark-purple panel with a serif headline and a grid of illustrated
 * benefit callouts. Replaces the "Bupa clinical excellence" grey-box value
 * section, the same way `everydayValue` replaces its grey-box equivalent.
 */
export type ClinicalExcellenceSection = {
  /** Optional overline; omit for a heading-only header (the Cash Plan grid). */
  eyebrow?: string;
  heading: string;
  /** Fragment of `heading` set in italic serif (trailing or mid-phrase). */
  accent?: string;
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
 * animated stat columns (the shared StatBlock block). Replaces the "Proven
 * ROI" grey-box value section, the same way `clinicalExcellence` replaces its.
 */
export type ProvenRoiSection = {
  eyebrow: string;
  heading: string;
  /** Word(s) within `heading` to italicise (e.g. "wellbeing"). Optional. */
  emphasis?: string | readonly string[];
  body: string;
  stats: ProvenRoiStat[];
};

/** One Sense/Interpret/Guide step in the Yunity section. */
export type YunityStep = {
  title: string;
  /** Lowercase, trailing full stop — the card capitalises and trims it. */
  description: string;
};

/**
 * Standalone Yunity section (Figma 1731:2441). The same Yunity block as the
 * homepage — the framed card with wordmark lockup, heading, body and the three
 * Sense/Interpret/Guide stat cards joined by the animated connecting roots — but
 * self-contained, so pages can reuse it with their own copy.
 */
export type YunitySection = {
  heading: string;
  /**
   * Word(s) within `heading` to italicise (e.g. "smarter", or
   * ["more", "smarter"]). Matches `YunityContent`'s emphasis. Optional.
   */
  emphasis?: string | readonly string[];
  body: string;
  steps: YunityStep[];
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
  yunitySection?: YunitySection;
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
