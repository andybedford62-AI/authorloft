# State of Indie Authors 2026 — Survey + Backlink Strategy

**Goal:** a linkable research asset that earns 20–50+ *dofollow* backlinks. This matters because the Sept 2026 SEO diagnosis found the real blocker is zero dofollow backlinks (Reddit, Product Hunt and directory links are all nofollow). Technical SEO is done; links are the gap.

**Update Oct 1, 2026: the survey tool is Typeform (https://form.typeform.com/to/wVDW5jT9), not Tally or Google Forms; wherever this plan says Tally, read Typeform.** **Update Sept 30, 2026:** survey narrowed to 10 questions, runs Oct 5 – Nov 1, prize = 1 year Standard plan, winners awarded Dec 1 with the report launch. The build spec, final questions and calendar are in `STATE_OF_INDIE_AUTHORS_2026_SURVEY_SPEC.md`; where they differ from Sections 1 and 5 below, the spec wins.

**Status:** plan only. Nothing built. Every number in Section 4 is a *placeholder or hypothesis*, never a finding. Real data comes only from real respondents.

---

## 0. Decisions to make before starting

| # | Decision | Recommendation |
|---|---|---|
| 1 | Survey tool | **Tally or Google Forms** (free, exportable CSV). Skip building in-app: no new schema, no migration, ships in a day. Host the *report* in-app at `/research/state-of-indie-authors-2026`. |
| 2 | Who the audience is | Indie authors **broadly**, not just AuthorLoft users. A survey of only your own users is worthless for links and biased. |
| 3 | Incentive | Prize draw (e.g. 3 × $100 gift cards, or a year of Premium) + **free early copy of the report**. Check local sweepstakes rules; "no purchase necessary" wording. |
| 4 | Disclosure | State "Conducted by AuthorLoft" up front. Journalists and mods trust disclosed sponsors more than hidden ones. |
| 5 | Landing URL | One canonical page (`/research/state-of-indie-authors-2026`) so every link points to the same URL and stacks authority. |

---

## 1. Survey questions (20)

**Design rules:** ≤8 minutes, mostly multiple choice, earnings as **bands** (people skip exact numbers), one open-text question, no AuthorLoft pitch inside the survey. Put demographics/earnings *after* easy questions to cut drop-off. Question IDs (Q1…) are used in the report framework below.

### A. Profile (screeners + segmentation)
1. **Q1.** How many books have you published? *(0 / 1 / 2–3 / 4–10 / 11+)*
2. **Q2.** How long have you been publishing? *(<1 yr / 1–2 / 3–5 / 6–10 / 10+)*
3. **Q3.** Primary genre. *(Romance, Fantasy/SciFi, Mystery/Thriller, Nonfiction, Children's, Other)*
4. **Q4.** Which describes you? *(Self-published only / Hybrid / Traditional w/ self-pub on the side)* — screen out trad-only.
5. **Q5.** Is writing your full-time income source? *(Full-time / Part-time alongside job / Hobby)*

### B. Earnings
6. **Q6.** Approximate **gross** book income in the last 12 months. *(<$100 / $100–$999 / $1k–$4,999 / $5k–$19,999 / $20k–$49,999 / $50k+ / Prefer not to say)*
7. **Q7.** Income split by channel (approx. %). *(Amazon KDP / Other retailers / Direct sales from own site / Audiobook / Patreon-Substack-subscriptions / Courses-coaching / Other)*
8. **Q8.** Has your income gone up, down or stayed flat vs. 12 months ago?
9. **Q9.** Do you sell books **directly** to readers (own store, Payhip, Shopify, etc.)? *(Yes now / Tried and stopped / Want to / No)*  ← key AuthorLoft question

### C. Tools & costs
10. **Q10.** Which tools do you **currently pay for**? *(multi-select: website/hosting, newsletter platform, direct-sales/checkout, formatting, cover design, ads, analytics, editing, AI tools, other)*
11. **Q11.** Approx. monthly spend on tools and subscriptions (excluding ads, editing, covers). *(bands)*
12. **Q12.** How many separate tools/logins do you use to run your author business? *(1–2 / 3–5 / 6–9 / 10+)*  ← "tool sprawl" stat
13. **Q13.** Which specific platforms do you use for website / newsletter / direct sales? *(open list of common names + Other; used for the tool-landscape chart and to avoid vendor-bias claims)*

### D. Marketing & audience
14. **Q14.** Do you have an email list? Size? *(None / <100 / 100–999 / 1k–4,999 / 5k+)*
15. **Q15.** How much time per week on marketing/admin vs. writing? *(% marketing/admin)*
16. **Q16.** Which marketing activity gives you your best return? *(single-select)*
17. **Q17.** Do you know where your readers/sales come from? *(Clearly / Roughly / Not at all)*  ← analytics gap stat

### E. Pain points & wishlist
18. **Q18.** Rank your top 3 frustrations. *(platform fees/royalty cuts, dependence on Amazon, discoverability, too many tools, cost of tools, no reader data, time spent on admin, tech difficulty, launch/pre-order complexity, other)*
19. **Q19.** If you could fix one thing about running your author business in the next year, what would it be? *(open text — source of quotable material)*
20. **Q20.** Which would you most want in one platform? *(rank: author website, direct sales, newsletter, reader analytics, media kit, pre-orders/ARCs, bookstore/discovery)*

**Closing:** optional email (for report + prize), consent checkbox for one follow-up email, permission to quote open-text answers anonymously.

**Mapping to AuthorLoft** (for the report's "what this means" notes, never inside the survey): Q9 → direct sales; Q12/Q11 → all-in-one pricing ($9.99 Standard); Q17 → reader analytics; Q18 → fees/Amazon dependence; Q20 → feature prioritization.

---

## 2. Report structure

**Format:** one HTML page (canonical URL) + a downloadable PDF + an embeddable chart kit. A page earns links; a PDF alone doesn't.

| Section | Content | Link purpose |
|---|---|---|
| **Headline bar** | 3–5 standout stats as big numbers | What journalists quote |
| **1. Key findings** | 8–10 one-line findings, each with a chart | Skimmers |
| **2. Methodology** | Sample size, dates, recruitment channels, margin of error, caveats, AuthorLoft disclosure | Credibility; required for press/academics to cite |
| **3. Who responded** | Profile breakdown (Q1–Q5) | Context |
| **4. Earnings** | Income bands, channel mix, full-time vs. part-time, trend | Most-cited section |
| **5. Tools & costs** | Stack size, monthly spend, sprawl | Bridges to AuthorLoft |
| **6. Marketing & audience** | List size vs. income, time split, what works | Practical |
| **7. Pain points** | Ranked frustrations + quotes from Q19 | Emotive, shareable |
| **8. By segment** | Earnings × direct-sales, list size × income, etc. | Gives different reasons for different sites to cover it |
| **9. What this means** | 5 takeaways for authors (not sales copy) | Useful, not promotional |
| **10. Cite / embed / press kit** | Copy-paste citation, embed code, CSV of aggregate tables, press contact | Makes linking frictionless |

**Rules:**
- Charts are real data charts only (per the no-computer-generated-imagery rule: no AI art, no decorative SVG). Simple, labeled, each with a "Share / embed this chart" button and an alt text that states the stat.
- Every chart has a **standalone, stable URL** and a caption with source + "AuthorLoft State of Indie Authors 2026".
- Show **n** under every chart. Never report a segment with n < 30.
- Publish the aggregate tables as CSV. Researchers and bloggers link to data.
- The AuthorLoft mention is one disclosed section (#9) and a footer CTA, not threaded through every finding. Over-promotion kills press pickup.
- Anonymize everything; don't publish emails or identifiable quotes without the consent checkbox.

---

## 3. Promotion and backlink strategy

**Principle:** nofollow social posts drive *respondents and visibility*; the **dofollow links come from outreach to people who write about it.** Plan both phases.

### Phase A — Recruit respondents (weeks 2–4)

| Channel | How | Notes |
|---|---|---|
| r/selfpublish, r/indiepublishing, r/writing (weekly threads), r/KDP, r/romancewriters | Read each sub's self-promo rules **first**; use stickied survey/promo threads; ask mods for permission | Don't drop and leave; answer comments. Account age/karma matter. |
| Facebook groups (20BooksTo50K, Self-Publishing Formula, genre-specific) | Post per group rules, ask admin | Largest indie reach. Admins often share surveys. |
| Discord/Slack author communities | Same | |
| Mastodon / Bluesky / X / Threads #amwriting #indieauthor | Short thread + one-line hook | Low conversion; good for signal boosting. |
| Author newsletters | Email the author-newsletter writers (Section B below) asking them to share the survey with their list, **offering early data access** | Highest-quality responses. |
| Your own list + AuthorLoft users | Email + in-app banner | Expect bias. Tag source in a hidden field and analyze separately or disclose the mix. |
| Partner orgs: ALLi, local writers' guilds, NaNoWriMo-adjacent groups | Pitch as free community research | ALLi members' blog links are valuable. |

**Target:** 300+ valid responses minimum (±5.6% at 95% confidence for a large population); 500+ is comfortable. Tag each response with `utm_source` so you can report the recruitment mix in Methodology.

### Phase B — Link outreach after publishing (weeks 6–8) — **where the backlinks come from**

**Targets (aim for ~100 personalized emails → 20–50 links at a 20–40% hit rate, which is optimistic; plan for 15–30 as the realistic baseline):**
1. **Respondent-first**: everyone who left an email gets the report first, plus a pre-written tweet and embed snippet. Some will blog or newsletter about it.
2. **Indie-publishing blogs/podcasts**: Jane Friedman, The Creative Penn, Self-Publishing Formula, Written Word Media, Reedsy blog, Draft2Digital blog, BookBub partners blog, Kindlepreneur, Alliance of Independent Authors.
3. **Author-tool competitors' blogs**: lower hit rate, skip unless there is a mutual-benefit angle.
4. **Newsletters**: Publishers Weekly, The Hot Sheet, Publishing Perspectives, Writer Unboxed, "Indie Author Fringe" type digests.
5. **Journalists/reporters** covering creator economy or publishing; send a 3-line pitch with the headline stat.
6. **Resource pages**: search `"self-publishing statistics" + "resources"` and ask to be added. Statistics roundups (link building gold: "self-publishing statistics 2026" posts) want fresh data.
7. **Educators/librarians/writing programs**: creative-writing departments' resource lists.
8. **HARO-successors / Qwoted / Featured / Help a B2B Writer** and similar: respond to journalist queries citing the report.

**Outreach email (3-line template):**
> Subject: New data: [headline stat] of indie authors [finding]
> Hi [Name] — we surveyed [n] indie authors about earnings, tools and what's holding them back. [One surprising stat.] Full report + charts + CSV (free to cite): [URL]. Happy to share a custom cut for your audience.

**Rules:** personalize the first line; one follow-up after 7 days, then stop; never pay for links; don't mass-blast; never send an email on AuthorLoft's behalf without the user reviewing the batch first.

### Amplify (weeks 6–10)
- Post per-stat chart images (one per day) on social, each linking to the canonical page.
- Publish 3–5 **spin-off blog posts** on authorloft.com that each expand one finding and link to the report (builds internal links + fresh content).
- Email respondents + your list on release day.
- Product Hunt / Indie Hackers / Hacker News posts (nofollow, but referral and some ranking signal; HN only if a genuinely interesting finding).
- **Monthly data drip**: "Finding of the month" for 6 months keeps the link asset fresh and gives repeated reasons to re-contact outlets.
- Update IndexNow + sitemap on publish (already automated for blog/guides; add `/research/*` to `src/app/api/internal/sitemap/route.ts`).

### Measuring
- Ahrefs/GSC: referring domains, dofollow vs. nofollow, DR of linkers. Track in a sheet: target → sent → replied → linked → URL → dofollow?
- Goal tiers: **success** = 15+ referring domains; **strong** = 30+; **stretch** = 50+ with 3+ from DR 50+ sites.
- PostHog: report page views, chart embeds, CSV downloads, CTA click-through.

---

## 4. Findings framework (what to track and how to present)

**Everything below is a template. Replace with real data only.** The "hypothesis" column is what to *test*, not what to claim. If the data disagrees, publish the data.

### Metrics to compute
| Metric | Source | Presentation |
|---|---|---|
| Income distribution (median band, % under $1k, % over $20k) | Q6 | Horizontal bar; call out the median band, not the mean |
| % earning majority income from Amazon | Q7 | Single big number |
| % selling direct + their share of income | Q9, Q7 | Comparison: direct sellers vs. non-direct |
| Median monthly tool spend; avg tools used | Q11, Q12 | Big number + histogram |
| % who can't say where sales come from | Q17 | Big number |
| Email list size vs. income | Q14 × Q6 | Grouped bars (cross-tab) |
| Marketing/admin share of time | Q15 | Median + range |
| Top 3 frustrations | Q18 | Ranked bars (% ranking in top 3) |
| Wishlist priority | Q20 | Ranked list |
| Income trend | Q8 | Stacked bar: up / flat / down |

### Headline stat templates (fill in only if data supports it)
- "**[X]%** of indie authors earn less than $1,000 a year from their books."
- "Authors with an email list of 1,000+ report **[X]×** the median income of those without." *(correlation, say so)*
- "The typical indie author juggles **[X]** tools and spends **$[X]/month** on them."
- "**[X]%** depend on Amazon for over [X]% of income; only **[X]%** sell direct."
- "**[X]%** can't say where their sales come from."

### Hypotheses worth testing (AuthorLoft-relevant)
1. Most authors earn little; direct sellers and list-builders earn disproportionately more. *(Beware causation; say "associated with".)*
2. Tool sprawl is high and self-reported cost is significant.
3. Amazon dependence is high, and dissatisfaction with it is high.
4. A majority lack clear attribution data.
5. "One platform" interest is strong (Q20).

### Analysis and honesty rules
- Self-selected online sample → **not representative of all indie authors.** State it in Methodology; say "respondents", not "indie authors" in headlines where you can (e.g. "Of 412 indie authors surveyed…").
- Clean data: drop speed-runners (< 2 min), duplicates (email/IP hash), bots (honeypot field), and Q4 trad-only respondents. Report how many were dropped.
- Cross-tabs: report only n ≥ 30. Use medians for income.
- Report **the AuthorLoft-source share of respondents** and show results with and without them if they're more than ~20%.
- If a finding is unflattering to AuthorLoft's narrative, publish it anyway; credibility is the asset.
- Never fabricate, round up, or "illustrate" with invented numbers. Outlets fact-check.

---

## 5. Timeline and resource plan (~10 weeks, ~60–80 hours)

| Week | Work | Owner | Hours |
|---|---|---|---|
| **1** | Finalize questions; build survey; pilot with 5–10 friendly authors; fix confusing questions; set up UTM sources; write consent/privacy text | Andy + Claude | 6–8 |
| **2** | Launch. Email own list; Reddit/FB/Discord posts (check rules); reach out to ALLi, newsletters for sharing | Andy | 6–8 |
| **3–4** | Keep recruiting; reply to comments; mid-survey nudge; build a **report-page skeleton** (`/research/…`), chart components | Andy + Claude | 10–12 |
| **5** | Close survey (target 300+). Pick winner(s), clean data, compute stats, run segment analysis | Claude (analysis) + Andy (review) | 8–10 |
| **6** | Draft report + charts + CSV + PDF; write 10 key findings; methodology; press kit; shareable chart pages | Claude + Andy | 12–15 |
| **7** | Private early access to respondents and ~20 key contacts; fix errors they find; finalize | Andy | 4–6 |
| **8** | **Public launch.** Publish page, sitemap/IndexNow, email list, social, Indie Hackers, start outreach batch 1 (50 emails) | Andy | 8–10 |
| **9–10** | Outreach batch 2 (50 emails) + follow-ups; stats-roundup pitches; spin-off blog posts; log links | Andy | 8–10 |
| **Ongoing** | Monthly "finding of the month"; quarterly link audit; repeat survey annually (**State of Indie Authors 2027** compounds authority) | | 2–3/mo |

### Build scope (code, all in dev → staging → prod per CLAUDE.md)
- **Needed:** `/research/state-of-indie-authors-2026` page + chart components + downloadable CSV/PDF assets in `public/`; sitemap entry; `Article`/`Dataset` JSON-LD (Dataset markup helps data-search discovery); OG image (**real chart screenshot, not generated art**); `docs/CHANGELOG.md` entry.
- **Not needed:** database tables, migrations, or env vars if the survey lives in Tally/Google Forms. Only add in-app collection later if you want it gated behind login.
- After shipping: check `/features` only if a product feature changes (none here).

### Budget
- **Survey tool:** $0 (Tally/Google Forms).
- **Incentive:** ~$300 in prizes (or Premium-year giveaways at near-zero cash cost).
- **Optional paid respondent panel** (Prolific-style): ~$3–6 per complete response for targeted authors; generally avoid since panel "authors" are often not real indie authors. Only consider a small boost (~50) if recruitment stalls.
- **Optional:** Ahrefs/Semrush for link tracking (you can use GSC free).

### Risks
| Risk | Mitigation |
|---|---|
| Too few respondents | Recruit from communities, not just own list; extend window; offer early report access |
| Reddit/FB bans for self-promo | Read rules, ask mods, participate genuinely beforehand |
| Sample bias called out by press | Transparent methodology; "respondents" language |
| Findings don't favor AuthorLoft | Publish honestly; credibility is the asset |
| Low link yield | Outreach to stats-roundup pages and newsletter authors is the highest-yield tactic; repeat yearly |
| Privacy/compliance | Consent checkbox, aggregate-only publication, no sale of data, link to Privacy page |

---

## 6. Open questions for Andy

1. **Survey tool:** external form (Tally/Google Forms) as recommended, or built into AuthorLoft?
2. **Incentive:** prize draw, free Premium, or none?
3. **Start date:** when do you want week 1 to start? (If launching in Q4, NaNoWriMo season in November is both a recruiting boost and competition for attention.)
4. **Outreach approval:** confirm you want to review every outreach batch before it goes out (nothing gets sent on your behalf without your yes).
5. **Headline naming:** "State of Indie Authors 2026" is assumed. It is a search-friendly but generic title; confirm or choose an alternative.
