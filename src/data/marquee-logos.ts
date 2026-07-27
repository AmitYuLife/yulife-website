import { assetPath } from "@/lib/assetPath";

/** Filename stem under `/public/logos/marquee/` for each approved marquee brand. */
export const MARQUEE_LOGO_SLUGS = {
  Fujitsu: "fujitsu",
  Sodexo: "sodexo",
  Paramount: "paramount",
  Havas: "havas",
  Qinetiq: "qinetiq",
  Mintel: "mintel",
  Bruntwood: "bruntwood",
  "Kiko Milano": "kiko-milano",
  Tesco: "tesco",
  Breathe: "breathe",
  Nicepak: "nicepak",
  "Wolf & Badger": "wolf-and-badger",
  "Dakota Hotels": "dakota-hotels",
  Distology: "distology",
  "Financial Times": "financial-times",
  Dishoom: "dishoom",
  XMA: "xma",
  what3words: "what3words",
  ManyPets: "manypets",
  Curve: "curve",
  Paymentology: "paymentology",
  Moneyhub: "moneyhub",
  Rightmove: "rightmove",
  "Brother Marcus": "brother-marcus",
  Castore: "castore",
  Wolseley: "wolseley",
  "Chilly's": "chillys",
  Thinkmoney: "thinkmoney",
  "Orange Business": "orange-business",
} as const satisfies Record<string, string>;

export type MarqueeBrandName = keyof typeof MARQUEE_LOGO_SLUGS;

export function marqueeLogoSrc(slug: string): string {
  return assetPath(`/logos/marquee/${slug}.svg`);
}
