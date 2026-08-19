# Conversion Audit — Insurance Product Page (Group Life Insurance, representative)

**Audited:** 1 August 2026 · **Page type:** Product page (B2B) · **Primary goal:** "Speak to our team" (demo / contact) · **Primary audience:** Employer / HR buyer (champion first, board later)
**Conversion Audit Score: 68/100**

> Coverage note: this audit scores the shared insurance product-page template, using **Group Life** as the representative. **Group Income Protection** and **Group Health** use the same spine; page-specific deltas are called out at the end. Scope is the desktop mid-fi wireframe: mobile is not yet designed and page-speed/technical health are not yet buildable, so those two areas are scored provisionally and flagged, not failed.

> Verdict: the structure is sound and the CTA is now clean and consistent, but the page **over-weights the motives buyers don't actually buy on** (predictive analytics, boardroom ROI, ESG/admin get three high bands between them) while the single strongest converting asset for the HR champion, the daily-engagement app story, gets one band below the fold and never appears in the hero. Rebalancing toward engagement is the biggest available lever.

## Score breakdown
| Area | Score | Notes |
|------|-------|-------|
| Headline | 7/10 | "Group life insurance that inspires life" is clear and on-brand, but abstract. The concrete converting hook (the app, YuCoin, daily rewards) is absent from the hero. |
| Subheadline | 4/5 | Expands with a credible benefit and names the underwriter (MetLife) for institutional trust. Slightly abstract ("everyday value meets market-leading protection"). |
| Hero / above the fold | 11/15 | Desktop: one clear primary CTA + secondary + review-score trust bar + hero visual, uncluttered. Hero visual is a placeholder; it should show the app (see issue 2). Mobile above-the-fold CTA unverified (not built). |
| Social proof | 11/15 | Review scores above the fold, a carrier endorsement quote (MetLife) in band 2, and sourced ROI stats (Forrester, Essex). Missing: a recognisable-client logo marquee, one of the strongest B2B signals. |
| CTA quality & consistency | 12/15 | Now consistent ("Speak to our team" in hero and closing CTA), single primary action, sensible lower-commitment secondary ("Download the guide"). Label is safe rather than benefit-led; worth testing. |
| Conversion path / form | 8/10 | No on-page form; a single click to contact. Path is short and obvious. Destination not assessable in wireframe. |
| Message-match & routing | 8/15 | The main deduction. Three bands (Smarter Protection, Proven ROI, Streamline) serve board/analytics motives that YuLife's own JTBD research found **no buyer cited as a reason to buy**. Engagement, the #1 cited differentiator, is under-weighted and below the fold. |
| Mobile experience | 4/10 | Provisional. Not yet designed. Auto-layout bands should stack, but above-the-fold CTA, tap-target sizes, and reflow of multi-column bands are unverified. Top open risk. |
| Speed & technical health | 3/5 | Provisional. Not buildable yet. The static-export Next.js architecture is sound in principle; not measurable at wireframe stage. |

## Top 5 issues (ranked by impact on conversion)

1. **The page leads with the motives buyers don't buy on.** — Smarter Protection (eNPS, predictive risk), Proven ROI (boardroom stats), and Streamline (ESG, board reporting) occupy three of the roughly nine content bands, high in the page. YuLife's "Understanding Why People Buy" research (n=8) found analytics/ROI/dashboards were **not named as a buying reason by a single interviewed buyer**, while the app's daily engagement was named by 7 of 8. · **Why it costs conversions:** the HR champion, usually first on the page, has to scroll past board-oriented material to reach the thing that actually converts them. · **Fix:** promote Everyday value (ENGAGE) to directly below the hero, and reframe Smarter Protection / Proven ROI / Streamline as supporting substance for the board later in the page. · **Lens:** user need (champion wants engagement) vs business goal (finance wants ROI proof) — a real audience conflict; resolve by *sequence*, engagement first, ROI as depth, rather than by cutting either.

2. **The hero never shows the product.** — The hero visual is a placeholder and the copy leads with an abstraction ("inspires life" / "everyday value"). The research shows prior personal experience of the app is the strongest acquisition signal, and champions convert by seeing and sharing the product. · **Why it costs conversions:** the most persuasive asset is invisible at the exact moment attention is highest. · **Fix:** make the hero visual a real app view (challenges, YuCoin, rewards) and work a concrete engagement benefit into the subhead. · **Lens:** user need + business goal aligned; no conflict.

3. **No recognisable-client social proof anywhere.** — Present proof is review scores, a carrier quote, and sourced stats. There is no client/employer logo marquee and no named-customer testimonial on the insurance pages. · **Why it costs conversions:** B2B buyers de-risk by seeing peers who already bought; carrier logos prove the underwriter, not that employers like them chose YuLife. · **Fix:** add a client logo strip (ideally above or just below the fold) and one named-customer quote. · **Lens:** business goal; needs real client permission (technical/legal constraint on which logos can be shown).

4. **Mobile is undesigned, and the page can't clear ~70 until it exists.** — Desktop-only wireframe. The rubric treats an unverified above-the-fold mobile CTA as load-bearing. · **Why it costs conversions:** a large share of first touches are mobile; a buried or crowded mobile CTA silently caps conversion. · **Fix:** design the mobile template next; keep the primary CTA in the first viewport and ensure ≥44px tap targets. · **Lens:** technical constraint; sequencing decision.

5. **The primary CTA label is safe, not benefit-led.** — "Speak to our team" is clear and consistent but generic. · **Why it costs conversions:** a lower-friction or more valuable-sounding action can lift click-through, especially for a champion not ready for a sales conversation. · **Fix:** test "Speak to our team" against a lower-commitment or value-named alternative (see A/B tests). · **Lens:** user need; test rather than assume.

## Quick wins (fixable in under 1 hour)
- Move the Everyday value (ENGAGE) band to sit directly under the hero on all three insurance pages, ahead of Smarter Protection.
- Swap the hero placeholder for a real app screen (or annotate the slot as "app UI, must show YuCoin/challenges") so visual design briefs it correctly.
- Add a client-logo-marquee slot to the template (a thin band under the hero) so it exists to be filled.
- Strip **em dashes** from all drafted copy: YuLife tone of voice does not permit them, and the current hero/section copy uses them throughout (for example "Everyday value meets market-leading protection —" should become a colon or a full stop). Same pass should confirm curly quotes and UK spelling.
- Give the ROI stat band a one-line source caption in view (it currently relies on the stat component's hidden description); unsourced stats read as weaker.

## A/B test recommendations
Ordered by expected impact × ease.

1. **Section order: engagement-first vs current.** Hypothesis: moving Everyday value directly below the hero raises demo-CTA click-through for the HR-champion segment. Metric: hero-to-"Speak to our team" click rate and scroll-depth to the engagement band.
2. **Hero CTA label.** Hypothesis: a lower-commitment label ("Download the guide" as primary) or a value-named one converts more first-touch champions than "Speak to our team". Metric: primary-CTA click-through and downstream contact rate (guard against lower-quality leads).
3. **Client logo strip present vs absent.** Hypothesis: a recognisable-employer marquee below the hero lifts overall CTA rate. Metric: page-level CTA conversion.
4. **Hero visual: app UI vs abstract illustration.** Hypothesis: showing the app raises engagement-band scroll and CTA. Metric: scroll-past-hero rate and CTA click.

## Competitor comparison
Not provided. Recommend benchmarking against **Vitality** (YuLife's closest model-level competitor, engagement-plus-insurance) and **Reward Gateway** (the recognition/comms platform that recurs in buyer deals). Happy to render and score either on the same rubric.

---

## Page-specific deltas

**Group Income Protection** — same spine plus a second Core-protection band (prevention + recovery), which is justified: income protection has more mechanism to explain, and leading the ROI band with "96% positive outcomes" is an outcome-led improvement over a raw percentage. Same message-match issue as Group Life (engagement under-weighted). Estimated score: **68/100**.

**Group Health** — drops the Streamline band, which slightly improves focus, and its Everyday value band carries the strongest reward hook of the set (the "over £700 of value, Garmin" card). But it adds an "AI-powered check-in" framing to Smarter Protection and foregrounds four board-oriented stats (including "181% ROI"), so the analytics over-index persists. The £700 reward card should be pulled up toward the hero. Estimated score: **69/100**.
