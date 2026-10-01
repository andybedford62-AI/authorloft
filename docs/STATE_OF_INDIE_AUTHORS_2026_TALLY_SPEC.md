# Tally Build Spec — State of Indie Authors 2026 (v3: 15 questions)

Decisions (Sept 30, 2026): **Tally** · **15 questions** · **survey Mon Oct 5 – Sun Nov 1 (4 weeks)** · **3 winners, prize = 1 year of the Standard plan free, granted by Andy in Super Admin after the winner signs up** · **prizes awarded Dec 1** · entrants identified by **name + email only**. Strategy context: `STATE_OF_INDIE_AUTHORS_2026_PLAN.md` (its 20-question list and dates are superseded by this file).

## Tally setup
- Title: **State of Indie Authors 2026 — 6-minute survey**
- Description: "Help us build the most honest picture of indie author income and tools. Results published free. Enter the prize draw to win a free year of AuthorLoft's Standard plan. Run by AuthorLoft."
- Settings: progress bar on, partial submissions **on**, no login, closes automatically **Nov 1, 11:59 PM ET** (use Tally's close-on-date setting).
- **Identity = name + email only.** Collect nothing else about the person: no phone, address, social handles or pen name. Do not add a hidden field that captures IP, and turn off any Tally analytics add-ons that do.
- **One hidden field: `src`** (reddit, fb, email, newsletter, partner, app, linkedin, social, other). It tags the *channel*, not the person. Use `?src=...` on every shared link. **Kept.** Tally saves hidden-field values into each response, so each row in the export is: name, email, `src`, answers. Checks so contact info is always captured:
  - **Name and email are OPTIONAL (changed Sept 30 2026).** Leaving both blank = anonymous response; it counts in the data but is not in the draw and gets no report. Only responses with a valid email are draw-eligible.
  - Tally's "partial submissions" setting stores unfinished answers with **no** contact info. Keep them out of the draw and out of the published counts, or turn partials off.
  - A link shared without `?src=` records a blank source; treat blank as "unknown/direct" in analysis. Always test each link before posting.
- **Duplicate entries:** dedupe on lowercase email in the export. Keep the first complete response.
- **Bot/junk filtering:** Tally has no true honeypot field (its "hidden fields" come from the URL, not the page), so rely on email dedupe, eyeballing the export for gibberish names/emails, and dropping completes that were submitted implausibly fast (compare the Submitted-at times with when the respondent started, if your Tally view shows both).
- **Data handling:** the Tally export contains names + emails linked to answers. Keep it in one private place; for analysis, strip name/email into a separate entrants list and analyze answers with only a response ID. Publish aggregates only.

## Consent page (required checkbox)
> This survey is run by **AuthorLoft** (authorloft.com), an author platform. It takes about 6 minutes. Your name and email are used to enter you in the prize draw and to send you the report. Your answers are only ever published in aggregate and are never tied to your name. See our [Privacy Policy](https://www.authorloft.com/privacy).
>
> ☐ I'm 18 or older and agree to take part. *(required)*

## The 15 questions

**Screener**
1. **Which best describes you?** — Self-published only / Hybrid (self + traditional) / Traditionally published only → *traditional-only jumps straight to the single thank-you page (page 9)*. There is ONE thank-you page for everyone, with neutral wording ("If you entered the draw…") and a link to https://www.authorloft.com/pricing/calculator. Redirect-on-completion is OFF (it hides the thank-you page).
2. **Is writing your main income source?** — Full-time / Part-time alongside other work / Hobby
3. **How many books have you published?** — 1 / 2–3 / 4–10 / 11+

**Income**
4. **Gross income from your books in the last 12 months** — <$100 / $100–$999 / $1,000–$4,999 / $5,000–$19,999 / $20,000–$49,999 / $50,000+ / Prefer not to say
5. **Compared with 12 months ago, your book income is…** — Up a lot / Up a little / About the same / Down a little / Down a lot / Too new to say
6. **Roughly how much of that came from Amazon?** — Nearly all (90%+) / Most (60–89%) / About half / Less than half / None
7. **Do you sell books directly to readers (your own site or store)?** — Yes, currently / I tried and stopped / Not yet, but I want to / No, not interested

**Tools & data**
8. **How many separate tools or logins do you use to run your author business?** (site, email, checkout, analytics, etc.) — 1–2 / 3–5 / 6–9 / 10+
9. **Monthly spend on those tools and subscriptions** (not ads, editing or covers) — $0 / $1–$24 / $25–$49 / $50–$99 / $100–$199 / $200+
10. **Do you know where your readers and sales come from?** — Clearly / Roughly / Not at all

**Marketing & audience**
11. **How big is your email list?** — I don't have one / Under 100 / 100–999 / 1,000–4,999 / 5,000+
12. **What share of your working time goes to marketing and admin instead of writing?** — Under 20% / 20–40% / 41–60% / 61–80% / Over 80%
13. **Which marketing activity gives you your best return?** (pick one) — Email newsletter / Social media / Paid ads / Newsletter swaps and promos / Events and in-person / Reader groups / Other / Nothing works yet

**Frustrations**
14. **Pick your top 3 frustrations** (choose up to 3) — Platform fees and royalty cuts / Dependence on Amazon / Getting discovered / Too many tools / Cost of tools / No reader data / Time spent on admin / Technical difficulty / Running launches and pre-orders / Other
15. **If you could fix one thing about running your author business this year, what would it be?** — long text, *optional*

**Final page (name and email optional):** intro says leave blank to stay anonymous (no draw entry, no report) · First name · Email · optional ☐ "Send me the report when it's published" · optional ☐ "You may quote my answer to the last question anonymously". Name + email are needed to enter the draw; stated on the page: "Used only for the draw, the report, and what you tick above."

### What is still cut from v1, and what it costs
| Cut | Loses |
|---|---|
| Genre, years publishing | Segmentation by genre or years of experience |
| Channel % split (replaced by the single Amazon-share question) | Full channel mix |
| Tool names, wishlist ranking | Competitor landscape chart; feature-priority ranking |

Each question feeds a report finding: Q2+Q4 (earnings), Q5 (income trend), Q6+Q7 (Amazon dependence, direct sales), Q8+Q9 (tool sprawl and cost), Q10 (reader-data gap), Q11 × Q4 (list size vs. income), Q12+Q13 (time and what works), Q14+Q15 (pain points and quotes). Survey length is now about 6 minutes.

## Prize: one year of the Standard plan
- **Winners:** 3 (cash cost $0; about $300 of forgone revenue at $99.99/yr).
- **Prize:** one year of the Standard plan (value $99.99, current pricing).
- **Process (decided):** winner is notified Dec 1 → they **sign up for a free AuthorLoft account** with the email they entered → Andy upgrades that account to Standard for 12 months in Super Admin. Tell winners to sign up using the same email they gave in the survey so you can match them.
- **If a winner already pays for a plan:** this prize is for new accounts; redraw. State this in the rules ("not open to current paid subscribers"). Confirm this is what you want.
- **Verify before Dec 1:** whether Super Admin can set a plan for a fixed 12-month period with an automatic end date (as opposed to an open-ended plan change you'd need to remember to reverse). I haven't checked the code. If not, set a calendar reminder for **Dec 1, 2027**, or we build a small expiry.
- **No cash alternative.**

## Prize draw rules (publish on a live page before launch)
**Live wording is the page, not this file:** `src/app/(marketing)/research/state-of-indie-authors-2026/rules/page.tsx` (`/research/state-of-indie-authors-2026/rules`). If anything below differs from the page, the page wins.

**Decisions confirmed by Andy, Oct 1 2026:**
- Prize open to **authors aged 18+ in any country, except where the law prohibits it** (changed Oct 1 2026 from US-only; Andy: "willing to let any new author have a subscription"). Current paid subscribers remain ineligible.
- Self-published **and hybrid** authors can enter (the survey screens out traditionally-published-only authors).
- Current **paid** subscribers are ineligible; an existing **free** account can receive the prize (applied to a free account registered with the entry email).
- Sponsor details: Anthony P Bedford LLC, address as published on `/dmca`.
- No governing-law clause (not a legal review; add one if a lawyer advises).

**Tally form text:** the rules link is published. The "US residents" wording on the Tally form (3 blocks) must be changed to worldwide AFTER the updated rules page is live in production, so the form never contradicts the public rules.

*Template, not legal advice.*

## Pilot checklist (before any public post; do by Sun Oct 4)
1. Send to 5–10 friendly authors, time them (target ≤6 min), ask what confused them.
2. Test on a phone (most Reddit/FB traffic is mobile).
3. Test the traditional-only exit (must land on the thank-you page, NOT page 1) and the full path with blank and filled name/email.
4. Export CSV; confirm columns are analyzable and no IP/device columns appear.
5. Confirm the Privacy link and the rules page work; confirm the auto-close date.
6. Create per-channel links: `https://tally.so/r/2EQ1qj?src=reddit`, `?src=fb`, `?src=email`, `?src=linkedin`, etc. Submit one test response per link and confirm the `src` value appears in the export.

## Calendar
| Date | Milestone |
|---|---|
| Now – Oct 4 | Build + pilot in Tally; publish rules page; draft recruiting posts |
| **Mon Oct 5** | **Survey live.** Own list + first community posts on day 1 |
| Oct 5 – Nov 1 | Recruit in waves: launch Oct 5, reminder ~Oct 19, final "last week" push Oct 26–30 (responses typically bunch at launch and just before close) |
| Oct 12 | Checkpoint: count responses; adjust channels |
| **Sun Nov 1** | Survey auto-closes |
| Nov 2 – 11 | Clean data, analyze, start building `/research/state-of-indie-authors-2026` page |
| Nov 12 – 22 | Draft report, charts, CSV, PDF; early access to respondents |
| Nov 23 – 29 | Final review (Thanksgiving Nov 26: no sends) |
| **Mon Nov 30** | Draw winners |
| **Tue Dec 1** | **Announce winners + grant prizes + public report launch + outreach batch 1** |
| Dec 2 – 13 | Outreach batch 2, follow-ups, spin-off blog posts |

**Four-week window:** plenty of room for 300+, but only if the first wave is lined up *before* Oct 5 (your list, Facebook groups, partner shares). Nov 2 – 22 leaves three weeks for analysis and the report, which is enough but not loose; don't extend past Nov 1 without moving Dec 1. Report what you get: with fewer than 200, say "respondents", show n everywhere and drop segment cross-tabs under n=30.

## Open questions
1. ~~**Current paid subscribers:**~~ Resolved Oct 1 2026: ineligible (see Prize draw rules).
2. **Super Admin grant:** want me to check the code for whether a plan can be set with a 12-month end date?

## Tally gotchas learned (Sept 30 2026)
- **Never edit in the Tally editor while Claude edits via the connector.** An open editor tab autosaves its older copy over connector changes (this silently reverted the thank-you page twice).
- Deleting a page can silently re-point logic rules (a jump rule became "jump to page 1"). After any page delete, re-check logic.
- "Redirect on completion" replaces the thank-you page entirely; keep it off.
- Live form = last **published** version. Edits are not live until Publish/Update.
