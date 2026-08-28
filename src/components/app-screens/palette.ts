/**
 * App-brand illustration colours for the fake live app screens.
 *
 * These are YuLife *app* colours transcribed from the Figma app-screen designs,
 * not website design tokens — the screens are illustrations of the product, the
 * same way the 3D coin's gold values live in `three/yucoin/assets.ts`. Each
 * screen root surfaces the values it needs as `--app-*` custom properties so
 * markup never carries a raw hex.
 */
export const APP_PALETTE = {
  /** Behind the scene layer while it loads / outside the gradient. */
  screenBase: "#290163",
  /** Underwater gradient (ChallengeSuccess background). */
  oceanTop: "#55baff",
  oceanBottom: "#0056ec",
  /** Glass stats card. */
  glass: "rgba(0, 39, 138, 0.4)",
  glassBorder: "#ffffff",
  /** Primary CTA (Primary/P600 in the app palette). */
  cta: "#e30d76",
  ctaEdge: "#900860",
  /** CollectButton pressed fill (Primary/Pink 800). */
  ctaPressed: "#cc0d6e",
  /** Text on dark app surfaces. */
  textOnDark: "#ffffff",
  /** Status bar ink. */
  statusInk: "#000000",
} as const;
