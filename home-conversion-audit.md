# Conversion Audit — Home (draft) · amityulife.github.io/yulife-website

**Audited:** 16 June 2026 · **Page type:** Homepage (draft) · **Primary goal:** Demo / sales-conversation request · **Primary audience:** Employer / HR buyer (with secondary routing to individuals, carriers, advisers)
**Conversion Audit Score: 73/100**

> The page is fundamentally sound and close to conversion-ready. Above-the-fold does the hard work well: a clear hero, one primary CTA, and three review scores visible without scrolling. The single biggest opportunity is fixing the split conversion intent — the header and final CTA say "Speak to our team" while the hero says "Request a demo" — and pulling the audience router much higher up the page. A secondary risk is that the page gives roughly equal billing to predictive analytics / boardroom ROI, which YuLife's own buyer research says no interviewed buyer cited as a reason to buy, while the engagement story that 7 of 8 buyers named as the deciding factor competes for attention instead of leading.
>
> Annotations (BLOCK labels, ⚠ notes, spec references, placeholders) were treated as scaffolding and excluded from scoring. Several of them flag real issues, which I reached independently from the live page.

## Score breakdown


| Area                      | Score | Notes                                                                                                                                                                                                                                                                 |
| ------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Headline                  | 7/10  | "Insurance that inspires life" is brand-led, not outcome-led, but a concrete benefit lands immediately in the subhead, so it grasps in ~5s.                                                                                                                           |
| Subheadline               | 4/5   | Specific and credible ("all-in-one insurance and health benefit"), but leans on "world-class" and "AI-driven engagement" — buzzwords TOV flags unless backed by proof.                                                                                                |
| Hero / above the fold     | 13/15 | Primary CTA above the fold on both desktop (top 401px) and mobile (top 437px), one obvious action, three review scores visible. Minor: the sticky header CTA introduces a competing label in the same viewport.                                                       |
| Social proof              | 13/15 | Very strong plan: review scores above the fold, client logo marquee, carrier logos (Bupa, MetLife, Dai-ichi, Mutual of Omaha), sourced stats, case studies, awards. Docked only because key elements (Trustpilot widget, case-study carousel) are still placeholders. |
| CTA quality & consistency | 9/15  | Labels are individually fine but inconsistent for the same conversion: header + final CTA "Speak to our team", hero "Request a demo". Splits intent and reads unfinished.                                                                                             |
| Conversion path / form    | 7/10  | No on-page form (correct for a homepage); conversion is a CTA route. Path is short but the two competing labels imply two different destinations/commitment levels. Destinations not yet wired.                                                                       |
| Message-match & routing   | 9/15  | Engagement story is present but the EMPOWER pillar + Yunity band give heavy weight to predictive analytics / eNPS / boardroom ROI — a motive YuLife's JTBD research says no buyer bought on. Audience router sits near the bottom (~78% down the page).               |
| Mobile experience         | 7/10  | No horizontal overflow at 390px, hero CTA above the fold, viewport meta correct. Docked for 10px smallest font and sub-44px tap targets on the audience-router links and header CTA.                                                                                  |
| Speed & technical health  | 4/5   | Static page, no overflow, no obvious layout shift or errors observed. Light asset load. Not formally profiled.                                                                                                                                                        |


## Top 4 issues (ranked by impact on conversion)

**1. Split conversion intent across CTAs**
What's wrong: the header and final CTA say "Speak to our team"; the hero says "Request a demo". Two labels for one goal.
Why it costs conversions: inconsistent labels fragment the mental model of "what happens if I click", dilute the primary action, and signal an unfinished page, which erodes trust on a considered B2B purchase.
Fix: pick one primary action and use it everywhere a primary conversion is intended. "Request a demo" is the stronger, more concrete label; keep "Speak to our team" only as a deliberately lower-commitment secondary option if you want a two-tier CTA, and style it as secondary.
Lens: user need (clarity) + business goal (lead capture) aligned; no real conflict, just execution.

**2. Audience router is too low for a multi-audience page**
What's wrong: the Solutions router (Employers / Individuals / Carriers / Advisers) sits near the bottom, after six content blocks.
Why it costs conversions: carriers, advisers, and existing members must scroll through employer-pitched content to find their path, or bounce. Non-employer audiences are effectively unserved above the fold.
Fix: surface the four audiences high up — a slim router band directly under the hero. They're currently reachable only via the "Who we help" header dropdown (one click deep) or this low in-page block, so scanners who don't use the nav meet employer-pitched content first. Keep the richer Solutions block lower as reinforcement.
Lens: user need (findability for non-primary audiences) vs business goal (employer is the priority audience). Conflict: leading the page for employers is right, but the other three need a visible doorway. A compact router resolves both.

**3. Over-indexing on analytics / boardroom ROI**
What's wrong: the EMPOWER pillar (predictive insights, live eNPS, "boardroom outcomes") and the Yunity Intelligence band give analytics roughly equal billing with engagement.
Why it costs conversions: YuLife's own buyer research (n=8 HR buyers) found the app's daily engagement was the deciding factor for 7 of 8, and that analytics/ROI was cited by none as a reason to buy. The page spends prime real estate on a weak purchase motive for the champion who lands first.
Fix: lead the body with the engagement/rewards story (ENGAGE), and reframe analytics/ROI as supporting substance for the finance/board reader later in the journey, not a co-headline.
Lens: business goal (the data story feels impressive internally) vs user need (champions buy on engagement). Conflict named: trust the buyer evidence over the internal instinct.

**4. Mobile legibility and tap-target sizing**
What's wrong: smallest rendered font is 10px; the audience-router links and header CTA render under the 44px tap-target minimum at 390px.
Why it costs conversions: small text and cramped targets raise friction and mis-taps on the exact links meant to route and convert mobile visitors.
Fix: enforce a ~16px body minimum (12px floor for footnotes only), and give router items and the header CTA ≥44px height with adequate spacing. The Four Pillars block also needs its planned accordion below the lg breakpoint.
Lens: user need + technical constraint, no conflict — straightforward responsive hygiene.

## Quick wins (fixable in under 1 hour)

- Standardise the primary CTA label to "Request a demo" in the header, hero, and final CTA. Demote "Speak to our team" to a styled secondary action or drop it.
- Hyphenate "high-performance teams" in the subhead; consider replacing "world-class protection" with a concrete, provable claim per TOV (avoid hollow superlatives).
- Add a one-line audience router band (4 links) directly beneath the hero, reusing the Solutions copy.
- Raise the smallest font from 10px; reserve sub-12px for the source footnotes only.
- Wire the placeholder social proof (Trustpilot widget, case-study carousel) — credible proof that doesn't load is worse than none.
- Make sure every on-page stat keeps its source visible near the claim (the ¹ ² footnotes to Essex and Forrester are good — keep that pattern).

## A/B test recommendations

Ordered by expected impact × ease.

1. **CTA label consistency** — Hypothesis: a single consistent "Request a demo" across all primary slots lifts demo-form starts vs the current mixed labelling. Metric: demo CTA click-through → form-start rate. (High impact, trivial effort.)
2. **Audience router placement** — Hypothesis: a router band directly under the hero increases engaged sessions and conversions from carriers/advisers/individuals vs the current low placement. Metric: router click-through by audience + scroll-depth-to-router. (High impact, low effort.)
3. **Engagement-led vs analytics-led body order** — Hypothesis: leading the body with ENGAGE (rewards, gamification, app) over EMPOWER (analytics/ROI) raises demo requests from HR-champion traffic. Metric: demo request rate, segmented to employer landing traffic. (High impact, medium effort.)
4. **Hero subhead specificity** — Hypothesis: a concrete, proof-backed benefit line outperforms "world-class protection with AI-driven engagement". Metric: hero CTA click-through. (Medium impact, low effort.)

## Competitor comparison

Not provided — recommend benchmarking against Vitality (YuLife's closest model-level competitor on the insurance-plus-engagement proposition) and Reward Gateway (the comms/rewards-and-recognition rival that recurs in YuLife's buyer research). I can render and compare either on the same rubric if useful.