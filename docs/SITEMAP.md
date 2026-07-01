# YuLife 2026 Website — Sitemap & Page Inventory

Skeleton IA for the redesign, taken from the **"Revised"** frame in the Kickoff
Workshop FigJam. This document is the bridge between the agreed IA and the
wireframing phase. The same structure drives the live scaffold
(`src/data/sitemap.js`) and the diagram (`docs/sitemap-diagram.svg`).

**Copy status key:** 🟢 approved copy exists in the 2026 content doc · ⚪ no copy yet · ⚠ open decision.

---

## Page inventory

| Nav group | Page | Route | Copy | Source (content doc) | Notes |
|---|---|---|---|---|---|
| — | Home | `/` | 🟢 | Home | |
| **Products** (primary) | Products (landing) | `/products` | ⚪ | — | Section hub |
| | Health | `/products/health` | 🟢 | Group Health Insurance | |
| | Cash Plan | `/products/cash-plan` | 🟢 | Cash Plan | |
| | Income Protection | `/products/income-protection` | 🟢 | Group Income Protection | |
| | Life Insurance | `/products/life-insurance` | 🟢 | Group Life Insurance | |
| | Dental Insurance | `/products/dental-insurance` | ⚪ | — | No copy yet |
| | Wellbeing Platform (SaaS) | `/products/wellbeing-platform` | ⚪ | — | No copy yet; needs a clearer public label than "SaaS" |
| **Who we help** (primary) | Who we help (landing) | `/who-we-help` | ⚪ | — | Section hub |
| | Businesses | `/who-we-help/businesses` | 🟢 | Businesses | |
| | Carriers | `/who-we-help/carriers` | 🟢 | Carriers | |
| | Advisers | `/who-we-help/advisers` | 🟢 | Advisers | |
| | Individuals | `/who-we-help/individuals` | 🟢 ⚠ | Individuals | FigJam: consider folding into other audiences via "your people" until more D2C |
| **Resources** (primary) | Resources Hub (landing) | `/resources` | ⚪ | — | Section hub |
| | Case Studies | `/resources/case-studies` | ⚪ | — | No copy yet |
| | Blog | `/resources/blog` | ⚪ | — | No copy yet |
| | News & Events | `/resources/news-events` | ⚪ | — | No copy yet |
| | Ebooks | `/resources/ebooks` | ⚪ | — | No copy yet |
| **About** (primary) | About Us (landing) | `/about` | 🟢 | About Us | Section hub |
| | Careers | `/about/careers` | 🟢 | Careers | Doc flagged "NEEDS EDITING" |
| | Press | `/about/press` | ⚪ ⚠ | — | No copy; shown dashed in FigJam (TBC) |
| | Contact | `/contact` | ⚪ ⚠ | Contact Us (link only) | No copy; shown dashed in FigJam (TBC) |
| **Solutions** (secondary) | Solutions (landing) | `/solutions` | ⚪ | — | Section hub |
| | Employee Engagement | `/solutions/employee-engagement` | 🟢 | Employee Engagement | |
| | Rewards | `/solutions/rewards` | 🟢 | Incentives & Rewards | |
| | Benefit Consolidation | `/solutions/benefit-consolidation` | ⚪ | — | In IA, no copy yet |
| | Mental Health & EAP | `/solutions/mental-health-eap` | 🟢 | Mental Health (EAP) | |
| | Virtual GP | `/solutions/virtual-gp` | 🟢 | Virtual GP | |
| | Wellbeing Insights & Reporting | `/solutions/wellbeing-insights-reporting` | 🟢 | Reporting | |
| | Employee Surveys | `/solutions/employee-surveys` | 🟢 | Employee Surveys | |
| | Reward & Recognition | `/solutions/reward-and-recognition` | 🟢 ⚠ | Reward & Recognition | **Orphan** — copy exists but no agreed home in IA |

**Totals:** 31 pages (1 home, 5 section hubs, 25 content pages). 17 have approved copy; 14 are stubs only.

---

## IA reconciliation — facts, gaps & decisions

These are the points where the agreed IA and the content doc don't line up. Flagged in the scaffold and diagram so nothing gets lost.

### Gaps — pages in the IA with no copy (FACT)
`Dental Insurance` and `Wellbeing Platform (SaaS)` (Products), `Benefit Consolidation` (Solutions), and the whole Resources section (`Case Studies`, `Blog`, `News & Events`, `Ebooks`) have no copy in the doc. These are real, agreed pages — they need copy commissioned before they can be built beyond placeholder.

### Orphan — copy with no home (DECISION NEEDED)
**Reward & Recognition** has full approved copy in the content doc but does not appear in the "Revised" frame. I've parked it under `/solutions/reward-and-recognition` and flagged it. *Decision:* confirm it belongs in Solutions, or remove it from scope.

### Under consideration (shown dashed in FigJam)
- **Individuals** — FigJam note suggests folding into the other audiences through a "your people" lens until YuLife is more D2C. Copy exists, so the cost of keeping it is low; recommend keeping the page but de-emphasising it in nav.
- **Press** and **Contact** — dashed in the frame. Both are conventional, expected pages; recommend keeping. Contact has no body copy yet (the doc only has a link).

### Naming differences to settle (RISK — affects nav labels, URLs, SEO)
- IA says **"Who we help"**; content doc says **"Who We Serve"**. Scaffold uses the IA term.
- IA section is **"Solutions"** (secondary); content doc and the current live site use **"Features"** (`/features/...`). Scaffold uses `/solutions/...`. *Decision:* pick one before any URLs are indexed, and plan redirects from the current `/features/` paths.
- **"SaaS"** is an internal label, not customer-facing. Needs a public name (used "Wellbeing Platform" as a placeholder).

---

## Recommendations

1. **Commission copy for the 8 stub-only content pages** (Dental, Wellbeing Platform, Benefit Consolidation, and the four Resources pages) — these block wireframing.
2. **Resolve the three naming decisions** (Who we help / Solutions vs Features / public name for SaaS) early — they set URLs and redirects.
3. **Make a call on Reward & Recognition** (keep under Solutions or drop) and on **Individuals** (standalone vs folded).
4. Treat each page as a stack of **sections ("bricks")**, not a monolith — see `README.md`. This maps cleanly onto React Bricks and lets copy land section-by-section as it's approved.

### User / business / tech lens
- **User need:** self-identification (Who we help) and findability (clear Products vs Solutions split) are well served by this IA. Risk: Products vs Solutions overlap (e.g. is "Virtual GP" a product or a solution?) could confuse — worth a quick card-sort to validate.
- **Business goal:** every primary path routes toward a commercial conversation; the orphan/under-consideration flags protect the conversion narrative from half-built pages.
- **Tech constraint:** `/features/` → `/solutions/` rename needs redirects to preserve existing SEO equity. Flagged as a risk above.
