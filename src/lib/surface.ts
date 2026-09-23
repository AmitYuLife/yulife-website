/**
 * A section's dark background surface. The product pages alternate these two
 * down the page so neighbouring sections always read as distinct bands, and the
 * raised cards/panels inside an inverse section (and vice-versa) stay legible.
 */
export type Surface = "inverse" | "inverse-raised";

/**
 * Prod-safe stamp naming a section's surface. Spread onto a section root next to
 * the (dev-only) `domSrc()` stamp:
 *
 *   <section {...domSrc("FooSection")} {...surfaceData(surface)} className={…}>
 *
 * Unlike `domSrc()`, this ships in production — it's the machine-readable signal
 * both the dev-time `SectionSurfaceAuditor` and the CI
 * `scripts/check-section-alternation.mjs` read to prove adjacent sections never
 * share a background. Stamp every top-level section that participates in the
 * dark alternation; unstamped siblings are treated as boundaries.
 */
export function surfaceData(surface: Surface): { "data-surface": Surface } {
  return { "data-surface": surface };
}
