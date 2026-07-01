/** Filename stem under `/public/logos/marquee/` for each approved marquee brand. */
export const MARQUEE_LOGO_SLUGS = {
  Novartis: "novartis",
  Fujitsu: "fujitsu",
  Sodexo: "sodexo",
  "Severn Trent": "severn-trent",
  Paramount: "paramount",
  Havas: "havas",
  Qinetiq: "qinetiq",
  Wolseley: "wolseley",
  "Del Monte UK": "del-monte",
  Mintel: "mintel",
  Bruntwood: "bruntwood",
  XMA: "xma",
  "Nice-Pak": "nice-pak",
  what3words: "what3words",
  ManyPets: "manypets",
  Curve: "curve",
  "ITRS Group": "itrs-group",
  Paymentology: "paymentology",
  Moneyhub: "moneyhub",
  "Wolf & Badger": "wolf-and-badger",
  "Abel & Cole": "abel-and-cole",
  Oddbox: "oddbox",
  "Chilly's": "chillis",
} as const satisfies Record<string, string>;

export type MarqueeBrandName = keyof typeof MARQUEE_LOGO_SLUGS;

export function marqueeLogoSrc(slug: string): string {
  return `/logos/marquee/${slug}.svg`;
}
