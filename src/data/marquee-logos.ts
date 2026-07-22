/** Filename stem under `/public/logos/marquee/` for each approved marquee brand. */
export const MARQUEE_LOGO_SLUGS = {
  Novartis: "novartis",
  Fujitsu: "fujitsu",
  Sodexo: "sodexo",
  Paramount: "paramount",
  Havas: "havas",
  Qinetiq: "qinetiq",
  Mintel: "mintel",
  Bruntwood: "bruntwood",
  "Kiko Milano": "kiko-milano",
  "Old Mutual": "old-mutual",
  Aviva: "aviva",
  Dishoom: "dishoom",
  XMA: "xma",
  what3words: "what3words",
  ManyPets: "manypets",
  Curve: "curve",
  Paymentology: "paymentology",
  Moneyhub: "moneyhub",
  Oddbox: "oddbox",
  "CreateFuture (xDesign)": "create-future",
} as const satisfies Record<string, string>;

export type MarqueeBrandName = keyof typeof MARQUEE_LOGO_SLUGS;

export function marqueeLogoSrc(slug: string): string {
  return `/logos/marquee/${slug}.svg`;
}
