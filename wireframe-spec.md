# Website — Wireframe Spec

> Source: [Website content doc](https://docs.google.com/document/d/1fd3c4buivd3VktGoYOsU4ebDnI6wEa5KPpOcrU7GBwc/edit#heading=h.h5j72k1lbv5c)
> Purpose: section-by-section wireframe brief covering every **populated** page in the content doc. Copy is preserved verbatim (cleaned of doc formatting artefacts and internal editorial notes). Layout/component notes are wireframing recommendations, not final copy decisions.
> Structure: **Part 1 — Reference** (page inventory + shared component templates). **Part 2 — Home page** (full detail). **Part 3 — Remaining populated pages**. Empty/unpopulated pages are listed in the inventory and excluded.

## How to read this

- **Block** = one full-width horizontal section of the page, top to bottom.
- **Layout** = recommended structure (columns, grid, alignment) for the wireframe.
- **Components** = reusable UI elements to stub out (link to a component inventory later).
- **Copy** = verbatim content from the source doc.
- **CTA** = call-to-action and its intended destination/flow.
- 🟦 *Note* = wireframing rationale. ⚠️ *Flag* = risk, ambiguity, or open question to resolve.

Tags on recommendations: **[U]** user need · **[B]** business goal · **[T]** technical constraint.

---

# PART 1 — REFERENCE

## Page inventory & status

Pages in the content doc, in document order, with build readiness:

| Page | Status | Page type | Notes |
|---|---|---|---|
| Home | ✅ Populated | Home | Specced in Part 2 |
| Products | ⬜ Empty | Product hub | Hub/landing page — content gap |
| Group Income Protection | ✅ Populated | Product (MetLife) | Part 3 |
| Group Health Insurance | ✅ Populated | Product (Bupa) | Part 3 |
| Cash Plan | ✅ Populated | Product (Bupa) | Part 3 |
| Who We Serve | ⬜ Empty | Audience hub | Hub/landing page — content gap |
| Carriers | ✅ Populated | Audience | Part 3 · US page (/us/) |
| Advisers | ✅ Populated | Audience | Part 3 |
| Individuals | ✅ Populated | Audience | Part 3 · US member page |
| Resources | ⬜ Empty | Resource hub | Content gap |
| About Us | ✅ Populated | Editorial | Part 3 · two overlapping drafts in source |
| Careers | ✅ Populated | Editorial | Part 3 · marked "NEEDS EDITING" in source |
| Contact Us | 🔗 Link only | Utility | Points to existing yulife.com/contact-us/ |
| Press | ⬜ Empty | Editorial | Content gap |
| Features | ⬜ Empty | Feature hub | Hub/landing page — content gap |
| Incentives & Rewards | ✅ Populated | Feature | Part 3 |
| Mental Health (EAP) | ✅ Populated | Feature | Part 3 |
| Virtual GP | ✅ Populated | Feature | Part 3 |
| Employee Surveys | ✅ Populated | Feature | Part 3 |
| Reward & Recognition | ✅ Populated | Feature | Part 3 |
| Reporting (HR Insights) | ✅ Populated | Feature | Part 3 |

⚠️ *Flag — content gaps:* The empty pages (Products, Who We Serve, Resources, Features) are the **hub/landing pages that sit above the populated detail pages** in the IA. They're structurally the most important pages for navigation, yet have no content. Resolve before finalising the sitemap — the detail pages can't be reached coherently without them.

⚠️ *Flag — editorial artefacts in source:* Several pages contain internal production notes inside the copy (e.g. `⚠ H1 Headline`, `NEEDS EDITING`, `UPDATED`, `Placeholder stats — confirm`, T&C reminders). These are **not display copy** and have been stripped from the specs below. Don't render them.

⚠️ *Flag — inconsistent key stats:* Headline figures vary across pages — app engagement appears as 80%, 93% and "60% DAU"; NPS as 84 and 86; sickness-absence reduction as 11.5% and 12%. Establish a single **killer-stats source of truth** before build so the same metric reads identically site-wide. **[B]**

⚠️ *Flag — CTA fragmentation:* Primary CTAs vary — "Request a demo", "Speak to our team", "Get a quote", and "Speak to our team → /get-a-quote/". Canonicalise the primary conversion action and its destination. **[B]**

---

## Shared patterns & component templates

The product and feature pages are built from a small, repeating set of blocks. Build these once as reusable components; each page spec in Part 3 references them by name rather than redrawing them.

**Reusable components**

- **Social-proof bar** — horizontal strip of rating badges (Trustpilot 4.9 · Capterra 4.8 · App Store 4.9) or stat chips. Sits directly under most heroes.
- **Stats bar / stat block** — 3–4 metric tiles (big number + label + small source footnote). Used on every feature page and several product pages.
- **Zigzag content block** — alternating image/text rows. Each row: optional eyebrow label → heading → body → optional checklist/bullets → optional inline link. The core building block of product and feature pages.
- **Numbered value section** — large numeral (1–6) + eyebrow caps label + heading + body + bullet list. Product pages (GIP, GHI) use a stack of these.
- **Carrier/partner lockup** — insurer logo + attributed quote (e.g. MetLife/Bupa exec). Product-page hero support.
- **Logo cloud / marquee** — brand or insurer logos, static grid or auto-scroll.
- **Testimonial carousel** — quote + name/role/company. ⚠️ Prefer a static 2–3-up grid over an auto-rotating carousel for accessibility. **[U/T]**
- **Trustpilot strip** — "#1 rated employee benefits platform on Trustpilot".
- **Key Resources block** — auto-populated blog/resource cards.
- **Closing CTA banner** — heading + body + primary button. The recurring default is **"Speak to our team → /get-a-quote/"**.
- **FAQ accordion** — expandable Q/A list. ⚠️ Product-page FAQs are long; default to collapsed, ensure each Q is anchor-linkable for SEO. **[U/B]**

**Page templates**

- **Product page** (GIP, GHI, Cash Plan): Hero (headline + carrier + social-proof bar) → carrier quote → stack of numbered value sections → FAQ accordion → legal/disclaimer footer.
- **Feature page** (EAP, Virtual GP, Surveys, Reward & Recognition, Reporting, Rewards): Hero → stats bar → explainer → "How it works" (3 zigzag blocks) → CTA banner → testimonial carousel → Trustpilot strip → Key Resources → closing CTA banner.
- **Audience page** (Carriers, Advisers, Individuals): Hero → proof stats → value sections → partner logos → CTA. Lighter and more variable than the above.
- **Editorial page** (About, Careers): long-form sections, stat blocks, values, story, FAQ.

🟦 *Note:* The feature-page template is near-identical across six pages. This is the single biggest reuse opportunity in the build — one templated layout driven by content/config, not six bespoke pages. **[T]**

---

# PART 2 — HOME PAGE

## Global elements (persistent across all pages)

### Header / primary navigation
⚠️ *Flag:* Not specified in the source doc. The page sells to multiple audiences (employers, individuals, carriers, advisers) — the nav must reflect this. Confirm against the sitemap before building.

🟦 *Recommended stub for the wireframe:* Logo · Products · Who We Serve · Resources · About · **[Request a demo]** (primary button). Sticky on scroll. **[U/B]**

### Footer
Standard footer (nav columns, legal, social) **plus** the sources/citations block (see Block 9). Distinct from the "Final CTA" block, which sits above the footer.

---

## Block 1 — Hero

**Layout:** Single-column, centred or left-aligned. Headline → subheading → primary CTA → social-proof bar. Logo marquee directly beneath.

**Hierarchy:** H1 dominant; subheading supporting; one primary CTA only.

**Copy:**

- **H1:** Insurance that inspires life
- **Subheading:** The all-in-one insurance and health benefit for your team. We unify world-class protection with AI-driven engagement to build more resilient, high performance teams.
- **CTA (primary):** Request a demo
- **Social proof bar:** Trustpilot 4.9 · Capterra 4.8 · App Store 4.9

**Components:** Hero, primary button, rating badges (Trustpilot/Capterra/App Store), logo marquee.

**Logo marquee — "infinite scroll of cool brands":**
Novartis, Fujitsu, Sodexo, Severn Trent, Paramount, Havas, Financial Times (NA), Qinetiq, Wolseley, Del Monte UK, Kiko Milano (NA), Mintel, Bruntwood, XMA, Nice-Pak, what3words, ManyPets, Curve, ITRS Group, Paymentology, Moneyhub, CreateFuture (xDesign), Dishoom (NA), Wolf & Badger, Abel & Cole, Oddbox, Chilly's

🟦 *Note:* One CTA in the hero keeps the primary conversion path unambiguous. **[B]**
⚠️ *Flag:* "(NA)" beside some brands likely = "not approved / do not display". Confirm the cleared logo list before build.
⚠️ *Flag:* Auto-scrolling marquees raise accessibility concerns (motion, focus order). Provide a reduced-motion fallback and ensure logos aren't the only proof. **[U/T]**

---

## Block 2 — Complete health ecosystem (proof stats)

**Layout:** Section heading + supporting line, then a 3-up stat row. Insurer logo cloud below.

**Copy:**

- **Eyebrow:** COMPLETE HEALTH ECOSYSTEM
- **Heading:** Built for daily life, not just moments of need
- **Stats (3-up):**
  - **80% adoption** — a benefit your people actually use.
  - **25% lower claims risk** — healthier teams mean fewer claims and steadier costs.¹
  - **11.5% less sickness absence** — more workdays back, through earlier intervention.²
- **Logo cloud:** World-leading insurers including Bupa & MetLife, Dai-ichi, Mutual of Omaha

**Components:** Stat/metric tile (number + label + supporting line), logo cloud.

🟦 *Note:* Stats carry footnote markers (¹ ²) resolved in Block 9. Keep markers tappable/anchored to sources. **[U]**

---

## Block 3 — A new standard (product overview)

**Layout:** Eyebrow + heading, then a 4-up card grid (one card per product). Each card: product name, one-line description, carrier tag.

**Copy:**

- **Eyebrow:** A NEW STANDARD
- **Heading:** Protection for today's world
- **Cards:**
  - **Group Health Insurance** — Private medical cover with fast-track access to specialists and hospitals. *[Bupa]*
  - **Health Cash Plan** — Simple, digital reimbursements for everyday healthcare costs like dental and optical. *[Bupa]*
  - **Group Life Insurance** — Essential financial security for the people your employees love. *[MetLife]*
  - **Group Income Protection** — Income and expert rehabilitation support if an employee cannot work. *[MetLife]*

**Components:** Product card (title, body, carrier badge), responsive card grid (4→2→1).

🟦 *Note:* Cards should link through to the relevant product pages — this is a key discovery path. Confirm link targets. **[U]**

---

## Block 4 — The four pillars

**Layout:** 2×2 grid on desktop (stack to 1 column on mobile). Each quadrant = one pillar with an icon, label, sub-heading, and bullet list. Followed by a full-width "intelligence" sub-block.

🟦 *Note:* Source references League's 2×2 home-page treatment as a reference (https://league.com/). **[B]**

**Pillar 1 — ENGAGE · Daily Wellbeing Experience**
- **Daily Health Challenges:** Our gamified app transforms walking, meditation, and cycling into a rewarding daily quest.
- **Seamless Connectivity:** Integrates instantly with Garmin, Fitbit, Apple Health, and Google Fit to track every move.
- **Real-World Rewards:** Earn YuCoin for healthy habits to spend at Amazon, Nike, and Tesco, or fund global impact projects.
- **Team Challenges:** Spark healthy competition with company-wide leaderboards and 1-on-1 "Duels."

**Pillar 2 — PREVENT · Proactive Health Support**
- **Daily Reflections:** Short, daily check-ins that sense shifts in stress and energy and trigger support when patterns change.
- **24/7 Virtual GP:** Unlimited video calls and private prescriptions available at your team's fingertips.
- **Comprehensive EAP:** 24/7 mental health support and CBT tools triggered by real-life signals.
- **Centralised Employee Benefits Hub:** One digital home for all your company's insurance and wellness policies.

**Pillar 3 — PROTECT · Gold-Standard Insurance**
- **Market-Leading Cover:** Trusted policies integrated directly into the YuLife app.
- **Global Partnerships:** The institutional weight and clinical excellence of world-leading insurance brands.
- **Total Transparency:** 24/7 digital access ensures your team knows exactly how they are protected, anywhere in the world.

**Pillar 4 — EMPOWER · Actionable Data & Insights**
- **Aggregated Wellbeing Data:** Combine employee feedback with app activity for a clear, holistic view of workforce health.
- **Predictive Insights:** Spot rising burnout and absence risk earlier, so you can act before it costs you.
- **Live eNPS Tracking:** Monitor Employee Net Promoter Scores in real time to understand cultural health and retention risk.
- **Leadership-ready reporting** that turns wellbeing into boardroom outcomes and shows the ROI of your investment in people.

**Components:** Pillar card (icon, eyebrow label, heading, bullet list), 2×2 grid.

⚠️ *Flag:* Four pillars × four bullets = dense. On mobile this is a long scroll. Consider an accordion or tabbed pattern for the pillars on small screens. **[U]**

### Block 4b — "The more your people use it, the smarter it gets" (Yunity)

**Layout:** Full-width feature band. Heading + 2 intro lines, then a 3-step horizontal flow (Sense → Interpret → Guide). "Powered by Yunity" lockup.

**Copy:**
- **Heading:** The more your people use it the smarter it gets
- **Intro:** Most platforms tell you what happened last quarter. YuLife tells you what's about to happen next week. Every check-in, every challenge, every consultation adds to a continuously learning picture of your workforce's health: sensing what's changing, interpreting what it means, and guiding what to do next.
- **3-step flow:**
  - **Sense:** capture the real-time lifestyle data traditional models miss.
  - **Interpret:** spot the subtle shifts that signal rising stress or physical risk.
  - **Guide:** trigger support early, to protect health and prove ROI.
- **Lockup:** Powered by Yunity

**Components:** Stepper / 3-stage process flow, brand lockup.

---

## Block 5 — Solutions (audience router)

**Layout:** Eyebrow + heading + intro, then a 4-up card grid — one card per audience, each with its own CTA.

**Copy:**
- **Eyebrow:** SOLUTIONS
- **Heading:** Built for everyone in the benefits ecosystem
- **Intro:** Whether you're buying, selling, advising or receiving — YuLife has a path for you.
- **Cards:**
  - **Employers** — Attract and retain talent with benefits that go beyond a policy document. Real engagement, measurable ROI. → **CTA: For employers**
  - **Individuals** — Already a YuLife member through work? Manage your cover, earn rewards and access your benefits anywhere. → **CTA: For individuals**
  - **Insurance Carriers** — Become a partner with YuLife to offer health and wellness-led products that drive healthier, more engaged policyholders. → **CTA: For carriers**
  - **Advisers** — Access tools, resources and dedicated support to help your clients implement benefits they value. → **CTA: For advisers**

**Components:** Audience card with secondary CTA, 4-up grid.

🟦 *Note:* This is the page's main segmentation/router. It is the single most important IA element on the Home page — it sends each audience down the right journey. Position and labelling matter more than visual polish here. **[U/B]**
⚠️ *Flag:* This router is far down the page (Block 5). Test whether key audiences (esp. brokers/advisers and existing members) can find their path quickly enough, or whether an entry point belongs higher up / in the nav. **[U]**

---

## Block 6 — Trusted, proven, scalable (social proof)

**Layout:** Heading + body, then a proof strip: case-study carousel, awards, Trustpilot widget.

**Copy:**
- **Heading:** Trusted, proven, scalable
- **Body:** Trusted by millions worldwide, YuLife provides a clearer view of population health — enabling more predictable intervention and sustainable risk management.
- **Proof elements:** Case study carousel · Industry awards · Trustpilot widget

**Components:** Case-study carousel, awards strip, Trustpilot embed.

⚠️ *Flag:* Carousels often suppress engagement with all but the first slide and add accessibility overhead. Consider a static 2–3-up case-study grid instead. **[U]**

---

## Block 7 — Final CTA

**Layout:** Full-width conversion band. Heading + subheading + single primary CTA. Sits directly above the footer.

**Copy:**
- **Heading:** Join the mission to inspire life
- **Subheading:** Ready to turn employee benefits into a daily engine for healthier, higher-performing teams?
- **CTA:** Speak to our team

**Components:** Full-width CTA band, primary button.

⚠️ *Flag:* Hero CTA = "Request a demo"; final CTA = "Speak to our team". Decide whether these are the same action with different labels or two distinct flows. Inconsistent CTA language can confuse tracking and the user's mental model. **[B]**

---

## Block 8 — Footer

Standard global footer (see Global elements). Include the sources block below.

### Sources
¹ University of Essex (2025): Longitudinal study on gamified wellbeing and claim frequency.
² Forrester Consulting (2023): The Total Economic Impact™ of YuLife.

---

## Home — page-level flags & open questions

1. ⚠️ **Header/nav undefined** — the source doc has no navigation spec. Resolve against the sitemap before wireframing the full page.
2. ⚠️ **CTA strategy** — reconcile "Request a demo" (hero) vs "Speak to our team" (final) vs four audience CTAs. Define the canonical primary action and the secondary audience paths.
3. ⚠️ **Audience router placement** — Block 5 is the key IA decision but sits low on the page. Validate with users or consider surfacing it earlier.
4. ⚠️ **Logo clearances** — confirm which brand logos are approved for display ("(NA)" markers).
5. ⚠️ **Section labels** — source uses internal labels ("Section 3", "Section 6"). These are not display copy; omit from the wireframe.
6. ⚠️ **Mobile density** — Blocks 4 and 5 are content-heavy 4-up/2×2 grids. Plan the stack/accordion behaviour from the outset, not as an afterthought.

---

# PART 3 — REMAINING POPULATED PAGES

Each page below follows one of the templates in Part 1. Copy is verbatim (editorial notes stripped). Blocks are listed top-to-bottom.

---

## Group Income Protection

**Template:** Product page · **Carrier:** MetLife · **Primary CTA:** Speak to our team

### Block 1 — Hero
- **H1:** Group income protection that protects, rewards and inspires life
- **Body:** Prevention, protection and recovery in one place. A game-changing approach to protecting your people and your business. Gold-standard group income protection your people will value every day, not just the day they need it most. Underwritten by MetLife.
- **CTA:** Speak to our team
- **Social-proof bar:** Trustpilot 4.9 ★ · Capterra 4.8 ★ · App Store 4.9 ★

### Block 2 — Carrier quote (lockup)
> "Deepening our partnership with YuLife brings a unique dimension to our Group Income Protection enhancing employee wellbeing and empowering employers to keep work working." — **Dominic Grinstead, CEO, MetLife UK**

### Blocks 3–8 — Numbered value sections
*Component: numbered value section (numeral + caps eyebrow + heading + body + bullets). Stack vertically; alternate media side on desktop.*

**1 · VALUE THEY FEEL EVERY DAY — "Group income protection that prevents before the claim."**
Most people know what a healthy life looks like. Living it, consistently, is the harder part. YuLife makes that easier, turning everyday health choices into rewarding habits that stick.
- **Continuous engagement:** 1 in 2 members use the app daily for walking, meditation or cycling — as a habit that sticks.*
- **Tangible rewards:** Employees earn YuCoin for healthy actions and spend it at Amazon, Nike and Tesco, or donate to causes like Earthy, Charity: Water and Clean the Ocean.
- **On-demand care:** 24/7 virtual GP and mental health support at the touch of a button.
  *(*YuLife internal data across 1,200 companies.)*

**2 · SUPPORT BEFORE IT BECOMES A STRUGGLE — "The earlier the intervention, the better the outcome."**
Most absence management begins too late. By the time a claim is filed, weeks or months of opportunity to help have already passed. YuLife and MetLife identify risk early and trigger the right support before an employee reaches breaking point.
- **Fast access to care:** Unlimited 24/7 virtual GP appointments and private prescriptions to accelerate recovery from day one.
- **Mental health support:** A comprehensive EAP providing up to 10 structured counselling sessions, available the moment an employee needs it.
- **Proactive absence management:** Continuous monitoring of workforce health signals triggers MetLife's early-intervention protocols weeks ahead of a traditional insurer.

**3 · RECOVERY DONE PROACTIVELY — "More than a safety net. A route back."**
When the unexpected happens, financial security matters — so does clinical expertise. MetLife's rehabilitation programmes focus on capability, recovery and a safe return to work.
- **96% positive outcomes:** When MetLife is notified within the first four weeks, 96% of employees return to or remain in work. (MetLife UK Claims Data, April 2024.)
- **Specialist clinical pathways:** Dedicated rehabilitation for mental health, MSK and long-COVID.
- **Financial peace of mind:** Income replacement of up to 80% of salary during long-term illness.

**4 · SMARTER PROTECTION — "Your business has a pulse. We help you read it."**
An intelligence layer turns daily signals from across your workforce into a clear, human picture.
- **Sense — workplace health:** Real-time eNPS and engagement trends.
- **Interpret — proactive risk detection:** Subtle shifts in stress, energy and absence risk surfaced early.
- **Guide — early intervention:** Targeted HR support up to four weeks ahead.

**5 · PROVEN ROI — "Independently verified. Consistently delivered."**
- **80% employee adoption** *(across YuLife accounts)*
- **12% reduction in sickness absence** *(Forrester Consulting 2023)*
- **25% lower claims risk** *(University of Essex RCT 2025)*

**6 · STREAMLINE YOUR PEOPLE STRATEGY — "Built to fit inside your world."**
- **Automated onboarding:** Integrates with Workday, HiBob, Personio and Sage HR.
- **ESG reporting built in:** Ready-to-share health and wellbeing reports for board and investor audiences.
- **Dedicated support:** Implementation support from day one plus an ongoing customer success manager.

### Block 9 — FAQ accordion
What is group income protection and how does it work? · What makes YuLife and MetLife's approach different from a standard GIP policy? · What clinical support is available to absent employees? · How does early intervention affect premium costs? · How does YuLife protect employee data and privacy? · How does YuLife simplify administration while providing business insight? · What does YuLife's group income protection cover and how does it benefit employees? · How does YuLife's GIP support early intervention and absence management? · How do employees access support? · Is YuLife's GIP more cost-effective than traditional policies?

⚠️ *Flag:* The FAQ set contains **near-duplicate questions** (two variants each of the "data/privacy", "cost-effectiveness" and "administration" questions, plus overlapping cover questions). De-duplicate before build — likely two drafts merged. Full answers are in the source doc.

---

## Group Health Insurance

**Template:** Product page · **Carrier:** Bupa · **Primary CTA:** Speak to our team

### Block 1 — Hero
- **H1:** Group health insurance that inspires life
- **Body:** A game-changing approach to business health insurance. YuLife and Bupa combine daily engagement that rewards healthy living with fast access to clinical care when your people need it most. Underwritten by Bupa.
- **CTA:** Speak to our team
- **Social-proof bar:** Trustpilot 4.9 ★ · Capterra 4.8 ★ · App Store 4.9 ★

### Block 2 — Carrier quote (lockup)
> "Looking after the health and wellbeing of employees is fundamental to building a thriving and successful business. This partnership will help more people to take charge of their everyday health and wellbeing, while also offering reassurance that high-quality healthcare is there when it's needed." — **Richard Norris, GM for business & specialist products, Bupa UK Insurance**

### Blocks 3–6 — Numbered value sections

**1 · HEALTH AND WELLBEING EVERY DAY FOR EVERYONE — "Health insurance your people will value every day"**
Most group health insurance is invisible until something goes wrong. YuLife and Bupa unify private medical, dental, mental health and daily rewards into a single benefit your people use every day. 80% of illness is due to everyday lifestyle factors — so 80% is preventable.
- **Continuous engagement:** 1 in 2 members use the app daily.⁴
- **Tangible rewards:** YuCoin for healthy actions, spent at Amazon, Nike, Tesco or donated to causes.
- **Seamless connectivity:** Every wearable sync, step and mindful minute counted automatically.
- **Exclusive health rewards:** Over £700 of value unlocked in year one, including Boots vouchers, a free health assessment and a Garmin smartwatch.³

**2 · BUPA CLINICAL EXCELLENCE — "See a specialist sooner. Save weeks of worrying."**
With Bupa's Connected Care, the right specialist is accessible directly, at the moment it matters.
- **Direct access:** Contact Bupa directly about cancer, mental health or MSK problems without a GP referral first.¹
- **Cancer care:** Same-day all-clear or referral; eligible treatment covered in full.²
- **Mental health cover:** Bupa covers more mental health conditions than any other leading insurer.³
- **MSK support:** Direct access to muscle, bone and joint specialists.
- **24/7 virtual GP:** Digital appointments and private prescriptions via the My Bupa app.*
- **Dental cover:** Exams, scale & polish, fillings and emergency treatment via Bupa Dental.
  *(Footnotes ¹²³* and * regarding cover limits, network use and Defaqto comparison — see source/legal.)*

**3 · SMARTER PROTECTION — "Your business has a pulse. We help you read it."**
On the health plan the signal starts with a daily AI-powered check-in: a short health questionnaire, personalised tips, and automatic routing to the right Bupa service.
- **Sense — cultural health:** Real-time eNPS and engagement trends.
- **Interpret — proactive risk detection:** Early signals of stress, energy and absence risk.
- **Guide — early intervention:** Targeted HR support up to four weeks ahead.

**4 · PROVEN ROI — "Independently verified. Consistently delivered."**
- **93% highly engaged app users** *(YuLife internal data, 2025)*
- **181% return on investment** *(Forrester TEI of YuLife, 2023)*
- **85% of employees feel more productive** *(YuLife internal data, 2025)*
- **12% reduction in sickness absence** *(Forrester, 2023)*
- **25% lower claims risk** *(University of Essex, 2025)*

### Block 7 — FAQ accordion
What does YuLife's group health insurance cover? · How does it provide faster access to specialists? · What mental health cover is included? · How does YuLife protect employee data and privacy? · Is it more cost-effective than other private medical cover? · How does it simplify administration while providing business insight? *(Full answers in source.)*

⚠️ *Flag:* Engagement stat differs from GIP page (93% here vs 80% there) — see the killer-stats flag in Part 1.

---

## Cash Plan

**Template:** Product page · **Carrier:** Bupa · **Primary CTAs:** Get a quote · Download the guide

### Meta
- **Title:** Health Cash Plan for Employees | YuLife
- **Description:** Give your team a Health Cash Plan that rewards daily wellbeing and covers everyday health expenses. Backed by Bupa. Powered by YuLife.

### Block 1 — Hero
- **Eyebrow:** Health Cash Plan
- **H1:** Health Cash Plan that protects, rewards and inspires life.
- **Body:** The first everyday Health Cash Plan that pairs Bupa's trusted insurance expertise with YuLife's science-backed engagement platform. Your employees get cash back on everyday health costs and daily rewards for looking after themselves.
- **Partner lockup:** Bupa logo
- **CTAs:** Get a quote · Download the guide

### Block 2 — Social-proof bar (stat chips)
80% average workforce engagement · 1 in 2 members engage daily · 99.5% of claims paid in 5 days · 12% average reduction in sickness absence

### Block 3 — What is it? — "Cover for the bills. Rewards for the habits."
A Health Cash Plan gives employees money back on everyday health expenses (dental, optical, physio, therapies). The Bupa × YuLife plan goes further: through the app, employees are rewarded daily for small healthy choices and get 24/7 virtual GP and EAP access — building a healthier, more engaged workforce with measurable ROI.

### Block 4 — What's covered — "Comprehensive cover, from day one." *(provided by Bupa)*
**PROTECT** (cash back; 99.5% of claims paid within 5 days): Dental · Optical · Therapies (physio, osteopathy, chiropractic, acupuncture) · Consultations & diagnostics (incl. home visits) · Prescriptions, vaccinations & flu jabs · Hospital benefit (daily cash for inpatient/day-case nights) · Health Benefits allowance (Bupa Clinics, health assessments, menopause/period/sexual-function plans). *Three membership levels; full limits confirmed on quote.*
**PREVENT (get help early):** 24/7 EAP helpline (legal, financial, family + counselling for Premier members) · Anytime HealthLine · 24/7 Digital GP (unlimited) · SkinVision skin-cancer checks · Phio digital physiotherapy. *(Digital GP, SkinVision, Phio provided by YuLife partners; subject to change.)*
**ENGAGE (everyday wellbeing via the app):** Daily health challenges (earn YuCoin) · Rewards programme · Meditopia, HIIT & Body Coach classes · Mental health & CBT via Stresscoach · Discounted gym membership (Fitness First, F45) · In-app health surveys · Smoking-cessation programme.
**Dependants:** Earn YuCoin for adding partners/children; cover varies by membership.

### Block 5 — How it works — "From day one to daily habit." *(4-step process flow)*
1. **Set up your scheme** — light admin; employees get a welcome email and activate in minutes.
2. **Employees activate the YuLife app** — full plan, health tools and daily challenges.
3. **Submit claims instantly** — from the phone, no paper; 99.5% paid within 5 days.
4. **Insights for you, habits for them** — HR dashboard shows engagement, health trends and absence risk.

### Block 6 — For your employees — "Benefits your people will actually notice."
Average employer sees 80% workforce engagement (vs ~20% for traditional programmes). A package that feels relevant every day, with demonstrable ROI.
> "A benefits package designed for humans by humans — one we went out of our way to make genuinely enjoyable to use, every day." — Bupa × YuLife

### Block 7 — FAQ accordion
What does the plan cover? · Is it the same as private health insurance? (No.) · How do employees claim? · What wellbeing benefits come alongside it? · Can employees add family members? · How is data/privacy protected? · What employer insights are provided? · What size businesses is it suited to? *(Full answers in source.)*

### Block 8 — Legal footer
YuLife standard legal (FCA FRN 783352; company no. 10308260) · Bupa Health Cash Plan legal (Bupa Insurance Limited, reg. 3956433) · Third-party services legal. *(Full text in source — render in footer/legal styling.)*

🟦 *Note:* Cash Plan is the most complete and best-structured product page in the doc (clear meta, 4-step "how it works", legal block). Use it as the **reference build** for the other two product pages. **[T]**

---

## Feature pages (shared template)

The six feature pages below all use the **feature-page template** (Part 1): Hero → stats bar → explainer → "How it works" (3 zigzag blocks) → CTA banner → testimonial carousel → Trustpilot strip → Key Resources → closing CTA. Only the content differs. Build the template once; drive each page from content. Closing CTA on all = **Speak to our team → /get-a-quote/** unless noted.

⚠️ *Flag:* Most feature pages carried inline editorial notes (`⚠`, "UPDATED", "placeholder stats — confirm", T&C reminders) in the source — stripped here. Several stats are explicitly **unconfirmed placeholders** (Employee Surveys especially). Verify all figures before build.

### Incentives & Rewards — `/features/rewards/`

- **Hero:** Eyebrow *Global Employee Rewards* · **H1** "Rewards your people will actually use — and love" · Body: every healthy habit earns YuCoin, converted into real rewards from 50+ major brands (groceries, gym kit, wellbeing products, charitable donations). · **CTA** Speak to our team → /get-a-quote/
- **Stats bar:** £120 avg YuCoin earned/year per engaged member* · £1,000+ in rewards & wellbeing discounts/year* · 50+ retail brands *(*T&Cs required)*
- **Zigzag 1 — "Earn real rewards for everyday healthy habits"** → link: Explore our rewards store
- **Zigzag 2 — "Go further with Wellbeing and Prevention Passes"** (up to £1,400/employee/year; Wellbeing Pass = Garmin, Thriva, Living DNA; Prevention Pass = Scan.com, BetterHelp, Meditopia, Fiit) → link: Find out more
- **Zigzag 3 — "Turn healthy habits into a force for good"** (Impact Pass: convert YuCoin to donations; ESG leaderboard) → link: /features/social-impact-benefits/
- **Global rewards map** component → **Rewards list** component → **Testimonial carousel** (Clare Jones/Fladgate; Gemma McCall/Culture Shift; Sol Zygadlo/Vodafone) → **Trustpilot strip** → **Closing CTA** "Ready to hear how we can help?" → Find out more → /get-a-quote/

⚠️ *Flag:* Source marks everything below "Explore our global member rewards" as unchanged/existing — reuse existing components, don't rebuild.

### Mental Health (EAP) — `/features/employee-assistance-programme/`

- **Hero:** Eyebrow *Mental Health & Wellbeing* · **H1** "Build mental resilience before crisis strikes" · Body: comprehensive EAP + daily self-care tools + a personalised Wellbeing Hub. · **CTA** Speak to our team
- **Stats bar** ("The impact of YuLife on mental health & wellbeing"): 4x increase in EAP use · 53% reduction in reported stress · 55% practise mindfulness monthly
- **Explainer — "Mental wellbeing that goes beyond a helpline"**
- **How it works (3 zigzag blocks):** (1) *Employee Assistance Programme* — "The EAP your employees will actually use" (YuMatter; 24/7 counselling, bereavement, financial/legal, crisis; 4x utilisation; checklist of inclusions + add-ons). (2) *Daily self-care* — "Daily self-care that builds resilience every day" (Daily Reflections, YuCoin; 53% less stress, 55% mindfulness). (3) *Wellbeing Hub* — "One Wellbeing Hub for everything your people need" (EAP, Virtual GP, perks, benefits in one configurable place).
- **Testimonial carousel** (Louise Millson/BBOWT; Melanie Taylor/FYXR; Shelly Webb/Del Monte) → **CTA banner** "Support that shows up before your people have to ask for it" → **Trustpilot / Key Resources / footer unchanged**

### Virtual GP — `/features/virtual-gp-services/`

⚠️ *Flag:* Provider updated **CareFirst → HealthHero** throughout source — ensure no stale "CareFirst" references survive anywhere on the site.

- **Hero:** Eyebrow *Virtual GP Services* · **H1** "Healthcare your employees will actually use" · Body: YuDoctor, powered by HealthHero — 24/7 GP access by video, phone or message inside the app, for employees and family. · **CTA** Speak to our team
- **Stats bar:** 2.4x virtual GP usage increase · 3x increase in healthy habits · 15% reduction in long-term health conditions
- **Explainer — "More than a GP — a complete picture of physical health"**
- **How it works (3 zigzag blocks):** (1) *Virtual GP | powered by HealthHero* — "YuDoctor: a GP in their pocket" (24/7 GPs, private prescriptions, fit notes, open referrals — checklist). (2) *Prevention & healthy habits* (NEW) — "Build the habits that keep people well". (3) *Wellbeing Hub* — "One Wellbeing Hub for their complete health".
- **Testimonial carousel** (Dan Katri & Tom Silk/Vanti; Ewen MacPherson/Havas Group) → **CTA banner** "Give your people the full picture of their health" → **Trustpilot / Key Resources / footer unchanged**

### Employee Surveys — `/features/employee-surveys/`

⚠️ *Flag:* New page; **stats bar figures are placeholders** — confirm with data/product team before publishing.

- **Hero:** Eyebrow *Employee Surveys* · **H1** "Hear from your people — and actually know what to do next" · Body: customisable surveys combine direct feedback with real-time wellbeing data. · **CTA** Speak to our team
- **Stats bar (placeholder):** 2x richer insight when combined with wellbeing data · eNPS + sentiment in minutes · 100% anonymised
- **Explainer — "More than a pulse check"**
- **How it works (3 blocks):** (1) "Ask the questions that matter" (customisable, in-app, YuCoin-incentivised). (2) "Wellbeing data that gives context to every answer" (Employer Portal trends by team/region/segment). (3) "Insight that turns into action — without adding HR admin" (auto-routes employees to support; anonymised/aggregated).
- **CTA banner** "Ready to understand your workforce like never before?" → **Testimonial carousel** (Clare Jones/Fladgate; Gemma McCall/Culture Shift; Sol Zygadlo/Vodafone) → **Trustpilot → Key Resources → Closing CTA**

### Reward & Recognition — `/features/reward-and-recognition/`

🟦 *Key differentiator (per source):* YuLife uniquely connects recognition to the wellbeing journey, not a standalone tool.

- **Hero:** Eyebrow *Reward & Recognition* · **H1** "Build a culture where people feel valued — every single day" · Body: wellbeing + recognition in one place. · **CTA** Speak to our team
- **Stats bar:** 18% increase in employee satisfaction (YuLife 2024) · 2.75% avg reduction in turnover (Forrester TEI 2022) · 1 platform (no set-up fees)
- **Explainer — "Recognition that's part of your wellbeing culture — not separate from it"** (managers reward with YuCoin; peer-to-peer gifting)
- **How it works (3 blocks):** (1) "Celebrate every win, big or small" (send YuCoin from HR Portal; scheduled gifts; instant notifications). (2) "Reward that means something to everyone" (YuCoin across 50+ brands). (3) "Bring wellbeing and recognition together in one culture" (closes the engagement→health→lower-risk loop; one dashboard).
- **CTA banner** "Great culture starts with celebrating the people who make it" → **Testimonial carousel** (Cloud International; xDesign; Sol Zygadlo/Vodafone — flagged as fallbacks) → **Trustpilot → Key Resources → Closing CTA**

### Reporting / HR Insights — `/features/hr-insights/`

- **Hero:** Eyebrow *HR Insights & Reporting* · **H1** "The clearest view of your workforce you've ever had" · Body: Employer Portal unites wellbeing engagement data, dynamic health insights and direct feedback. · **CTA** Speak to our team
- **Stats bar (credibility/trust):** NPS 86 (vs industry 39 life / 27 health) · 4.9 #1 on Trustpilot · 4.8 on Capterra (109 reviews) *(sources approved in killer-stats sheet)*
- **Zigzag 1 — "Demonstrate behaviour change"** (Employee Insights dashboard; leadership-ready ROI reports) → link: Learn more about the HR Portal
- **Zigzag 2 — "Understand wellbeing risks"** (Daily Reflections → aggregated, anonymised trends; early burnout/stress signals by team/region/segment)
- **Zigzag 3 — "Hear from your employees"** (customisable surveys; eNPS, sentiment, themes)
- **Tab switcher:** Insights (at-a-glance) · Patterns (behavioural trends) · Reporting (ROI reports)
- **Testimonial carousel** (Nice-Pak; xDesign; Cloud International) → **Trustpilot → Key Resources → Closing CTA** → **Forrester TEI disclaimer (retain)**

⚠️ *Flag — overlap:* Employee Surveys, Reward & Recognition and Reporting all describe the Employer Portal, Daily Reflections, eNPS and YuCoin-incentivised surveys. Define clear boundaries so these three feature pages don't cannibalise each other in nav and SEO. **[U/B]**

---

## Carriers

**Template:** Audience page · **Market:** US (`/us/our-solutions/insurance-carriers/`) · **Primary CTA:** Tell us about your products

### Block 1 — Hero
- **H1/intro:** Turn protection into something people use every day. We partner as an engagement layer around your existing products, or go deeper with admin, member management and insight that feeds underwriting and pricing. Your products. Our engine for daily engagement and better risk visibility.

### Block 2 — Why partner with YuLife?
Carriers face low engagement, invisible lifestyle risk, and price-only competition. YuLife: members engage **30x more**/month than traditional insurer apps → **86 NPS** (industry avg 27) and **98% policy renewal** (vs 82% market avg); carriers have seen **8x growth**.

### Block 3 — Products we power
Group life · Group health · Income protection · Pension. *(Start with one line, expand over time.)*

### Block 4 — Customer fit
SME (simple differentiated packages) · Mid-size (deeper engagement + insight) · Corporate (multi-country/complex schemes).

### Block 5 — Current partners *(card set)*
MetLife · Bupa · Dai-ichi Life · Mutual of Omaha · Tawuniya · Guardrisk · Aviva

### Block 6 — Reward programme
Customisable to members/proposition; ESG-linked, everyday, and high-value reward tiers at different price points.

### Block 7 — Branded employer portal
Branded portal for employers (burnout risk, absenteeism, surveys, engagement) that also feeds the carrier's population-health/risk view.

### Block 8 — A clearer view of population health
Ongoing engagement data · Earlier, more predictable intervention · Outcomes-based value (renewal, activation, risk improvement).

### Block 9 — What the partnership looks like
Co-branded experience · One experience for health, rewards and cover · A team that works with yours (incl. reinsurer partnerships) · Integration that fits (light engagement layer → deeper admin/data/underwriting).

### Block 10 — Final CTA
**Next step:** Tell us about your core products and markets. We'll outline how a partnership could work for you.

⚠️ *Flag:* Stats here (30x engagement, 86 NPS, 98% renewal, 8x growth) differ from the figures used on employer-facing pages — confirm which apply to the carrier audience vs employer audience. Also confirm partner logos are cleared for display, and whether this is US-only or global. **[B]**

---

## Advisers

**Template:** Audience page · **Primary CTA:** *(not specified — recommend "Become a partner" / "Talk to us")*

### Block 1 — Hero — "A win-win partnership"
Meet the needs of your clients and grow your business with an insurance and wellbeing offering employees love and use every day.

### Block 2 — YuLife's proven impact *(stat block)*
17x growth vs traditional insurance · 86 NPS · 72% engage regularly · 300% greater close rate · 4.8 on Capterra & Trustpilot

### Block 3 — About YuLife for advisers
All-in-one wellbeing: group insurance, rewards and benefits in a gamified app. Themes: Revenue growth · Enhanced customer satisfaction · Risk mitigation (behavioural science, AI, game mechanics).

### Block 4 — The value of working with YuLife
Win new business · Five-star customer experience (118+ years insurance experience in ops) · Post-launch support ("Best Value Provider" on Capterra) · Positive ESG impact.

### Block 5 — Key resources for advisers *(card set / downloads)*
Intro presentation (adaptable slides) · Value overview PDF · Recommendation guide (suitability-letter wording) · Adviser Support Hub.

### Block 6 — Insurance products offered
Group Life · Group Income Protection · Group Dental (Bupa) · Group Health.

### Block 7 — Testimonial
> "As a broker, I've seen how YuLife's app builds community in companies. Our clients love it, and so do we… They're leading the pack in making insurance easy, engaging and team-friendly." — **Leighton Churchill, Development Director, Partners&**

### Block 8 — Insurance partners
Bupa · MetLife · Zurich

⚠️ *Flag:* Stats differ again (17x growth & 300% close rate here). Partner list (Bupa/MetLife/Zurich) differs from Carriers list — reconcile the canonical partner set. No CTA defined — add one. **[B]**

---

## Individuals

**Template:** Audience page (B2C / existing member) · **Market:** US member page · **Primary CTA:** Download the app

### Block 1 — Hero — "The app that rewards you for living well"
Download the YuLife app to improve your wellbeing, earn rewards and connect with your community.

### Block 2 — Core benefits
Incentives & Rewards (YuCoin for walking, meditation) · Engagement (community of 1M+ protected globally) · Wellbeing tools (24/7 Virtual GP, mental health support, fitness challenges).

### Block 3 — How it works *(3-step)*
1. Download the app — sync steps & mindful minutes from your wearable/health app.
2. Complete daily challenges — walking, cycling, meditation quests earn YuCoin.
3. Spend your rewards — vouchers from favourite brands, or social impact (plant trees, donate).

### Block 4 — Key features
Leaderboards · YuMojis (3D avatar) · Social Impact.

### Block 5 — Testimonial
> "YuLife has completely changed my relationship with my health. I feel motivated to move more every day knowing that I'm earning rewards while taking care of myself." — **YuLife Member**

🟦 *Note:* This is the only **B2C / consumer** page and the only one aimed at existing members rather than buyers. Its goal (app download + account management) is fundamentally different from every other page — give it a distinct entry point in the IA (and likely a member-login link in the global nav). **[U]**

---

## About Us

**Template:** Editorial · **Primary CTAs:** See how it works → Product overview · Talk to us → Contact/demo

⚠️ *Flag — two overlapping drafts in source:* The doc contains **two versions** of About Us with conflicting figures (app engagement 93% vs 80%; NPS 84 vs 86; DAU 60%), different audience framing ("employees/employers" vs "Businesses/Individuals"), and different founder/story emphasis (generic vs the Sammy Rubin / PruProtect narrative). The spec below merges them into one recommended structure — **pick one source of truth before build.**

### Block 1 — Hero — "Insurance that inspires life."
What if insurance didn't just protect you when things go wrong, but helped you live better, every single day? Together with our insurer partners, we've created an experience that's changing what insurance means for millions. · **CTAs:** See how it works · Talk to us

### Block 2 — The problem we're solving — "Insurance was built to react. We built it to inspire."
80% of chronic disease is linked to lifestyle, yet <2% regularly use the health tools their insurance provides. Founded 2016 to change that. Goal: improve **100M lives by 2030**. *(Stat block: 80% · <2% · 100M)*

### Block 3 — What YuLife is — "The insurtech redefining what insurance can do."
AI-forward insurtech; the customer-facing platform, engagement layer and intelligence on top of insurer-partner infrastructure (underwriting/admin/financial strength sits with partners — Bupa, MetLife, Old Mutual). Behind it: **Yunity™** AI intelligence layer.

### Block 4 — What we do *(3-column feature block)*
Daily engagement (gamified wellbeing, YuCoin, 100+ rewards partners) · Deep protection (Group Life, Income Protection, Health, Cash Plan via Bupa/MetLife) · Insight at scale (health/behavioural data for employers, insurers, advisers).

### Block 5 — Who we serve *(4-column / editorial cards)*
Employers · Employees (Individuals) · Insurers · Advisers and brokers. *(One value statement each.)*

### Block 6 — Our story — "Bringing colour to a black and white world."
Founder **Sammy Rubin** (founding CEO of PruProtect, the UK's first life insurer to reward healthy behaviour); burnout → sabbatical → the question "why do people dread their insurance?". Founded 2016. HQ London; operating UK, South Africa, Japan, USA. Backed by Creandum, LocalGlobe, Dai-ichi Holdings. B-Corp certified.

### Block 7 — Our values — "Love Being Yu."
**Love** (give more than you take) · **Being** (be present, vulnerable, open) · **Yu** (unlock your potential; Yugi the mascot).

### Block 8 — YuLife in numbers *(stat block)*
2016 founded · 1.5M+ members · 1,100+ employer partners · NPS 84/86⚠️ · 80%/93%⚠️ app engagement · B-Corp · Partners: Bupa, MetLife, Old Mutual · Investors: Creandum, LocalGlobe, Dai-ichi. *(Awards row: #1 employee benefit on Trustpilot; Best Financial Wellbeing Provider — British Insurance Awards; Insurtech of the Year — Cover Excellence; Fastest Growing Startup in Europe — Deloitte.)*

### Block 9 — Team & the YuCrew (optional) → Block 10 — FAQ
FAQ: What is YuLife? · Is YuLife an insurance company? · How is it different from an employee benefits platform? · What products are available? · Who are the insurer partners? · Where does YuLife operate?

---

## Careers

**Template:** Editorial · **Status:** ⚠️ Marked **"NEEDS EDITING"** in source — treat copy as draft.

### Block 1 — Hero — "Come join the YuCrew."
YuLife is on a mission to inspire people to live their best lives every day. Building an AI-forward insurtech that brings health and insurance together; looking for smart, humble, driven people. *(Existing page: yulife.com/careers/)*

### Block 2 — Work with purpose and great people
Work with the brightest · Training & learning · Mission-driven (B-Corp) · Bring your whole self ("Love Being Yu") · Benefits that matter.

### Block 3 — YuCrew in numbers
150+ YuCrew members · 19+ countries · Strong employee reviews.

### Block 4 — Benefits that match our philosophy
Insurance protection wherever based · Wellbeing rewards · Mental health support · Family-friendly & flexible working · Learning & development · Time off for real rest.

### Block 5 — Testimonial → Block 6 — Open-application CTA
> "It feels like the future of insurance… YuLife is revolutionising insurance."
Closing line invites speculative applications. ⚠️ *Recommend a clear CTA to a roles/ATS listing — none is specified, and a careers page needs a live jobs list as its primary component.* **[U]**

---

# SITE-WIDE FLAGS & RECOMMENDATIONS

1. ⚠️ **Hub pages are empty.** Products, Who We Serve, Resources and Features have no content but are the navigational parents of the populated detail pages. They're the top IA priority — the detail pages can't be reached coherently without them. **[U]**
2. ⚠️ **Single source of truth for stats.** Engagement (80/93%, 60% DAU), NPS (84/86), turnover, absence (11.5/12%) and growth multiples (8x/17x) vary by page and audience. Build a killer-stats table; reference it everywhere. **[B]**
3. ⚠️ **Canonical CTA + destination.** "Request a demo", "Speak to our team", "Get a quote", "/get-a-quote/" all coexist. Pick the primary action and route; keep audience-specific secondaries deliberate. **[B]**
4. ⚠️ **Reconcile the partner list.** Insurer/carrier partners differ across pages (e.g. Zurich on Advisers; Old Mutual on About; Tawuniya/Guardrisk/Aviva on Carriers). Define the canonical, market-segmented partner set. **[B]**
5. ⚠️ **Strip editorial annotations.** Source copy contains production notes (⚠, "UPDATED", "NEEDS EDITING", "placeholder — confirm", T&C reminders). None are display copy. **[T]**
6. ⚠️ **De-duplicate overlapping content.** About Us has two drafts; product FAQs repeat questions; three feature pages overlap on Employer Portal/Daily Reflections/surveys. Resolve before build to avoid SEO cannibalisation and maintenance debt. **[U/B]**
7. ⚠️ **Market/localisation.** Carriers and Individuals are US pages (`/us/`). Define the locale strategy (UK/US/SA/JP) and how it maps to nav and URL structure before templating. **[T]**
8. 🟦 **Reuse beats bespoke.** Six feature pages and three product pages each collapse to one template. Build two templates (feature, product) + the shared component set in Part 1 rather than 14 bespoke pages. **[T]**
9. 🟦 **B2C vs B2B split.** Individuals is the only consumer/member page; its job (app download, member login) differs from every buyer-facing page. Reflect this in nav and a distinct template. **[U]**
10. ⚠️ **Accessibility recurring themes.** Auto-scrolling logo marquees and rotating testimonial carousels appear on many pages — provide reduced-motion fallbacks and prefer static grids. **[U/T]**
