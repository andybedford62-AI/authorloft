# LinkedIn Content Plan — State of Indie Authors 2026

**Status:** DRAFT for Andy's review. Nothing is queued or published.
**Posting account:** Andy's personal profile (via the Super Admin social poster).
**Rules for every post:** only facts we can back up; no invented numbers; real images only (no generated art); disclose "conducted by AuthorLoft"; Andy approves each post before it is queued.

## Before anything is queued

| # | Item | Status |
|---|---|---|
| 1 | **Reconnect LinkedIn** in Super Admin → Social. The stored token was saved May 26 with no expiry recorded; LinkedIn member tokens normally last ~60 days. Not verified against LinkedIn. | Open |
| 2 | **Survey link**: posts use `https://tally.so/r/2EQ1qj?src=linkedin`. Submit one test response through that exact link and confirm `linkedin` appears in the `src` column of the export. | Test before Oct 5 |
| 3 | **Prize rules page** live and linked before the first post (per the survey spec, `STATE_OF_INDIE_AUTHORS_2026_TALLY_SPEC.md`). | Open |
| 4 | Hourly cron (`5 * * * *`) live in prod. First run Oct 1, 15:05 UTC: 200, 0 posts found, 0 failed. | Done |


## Survey series (survey spec calendar: live Oct 5, closes Nov 1)

Times are suggestions in ET. LinkedIn engagement is generally best on weekday mornings; confirm against your own post analytics once you have some.

### Post 1 — Launch (Mon Oct 5, ~9:00 AM ET)
> I'm running a survey of indie authors, and I'd like your input.
>
> It covers what authors earn from their books, which tools they pay for, and what gets in the way of running the business side. It is 15 questions and takes about 6 minutes.
>
> Aggregate results will be published as a free report on Dec 1. No individual answers are shared.
>
> Three respondents, drawn at random, win a free year of the AuthorLoft Standard plan. No purchase is necessary. Full rules are on the survey page.
>
> Conducted by AuthorLoft. Survey closes Nov 1.
>
> https://tally.so/r/2EQ1qj?src=linkedin

### Post 2 — Reminder (Mon Oct 19, ~9:00 AM ET)
> Two weeks into the State of Indie Authors survey.
>
> I'm at [N] responses so far. I'd like a wider mix of genres and career stages before it closes on Nov 1.
>
> If you publish your own books, the survey takes about 6 minutes: https://tally.so/r/2EQ1qj?src=linkedin
>
> If you know an indie author who isn't on LinkedIn, please pass it along.

*Fill `[N]` with the real count from Tally on the day. If it is low, say so plainly instead of rounding up.*

### Post 3 — Final week (Mon Oct 26, ~9:00 AM ET)
> One week left on the State of Indie Authors survey. It closes Sunday, Nov 1.
>
> The report publishes Dec 1 and will be free to read and cite. Respondents who share an email get it first.
>
> 15 questions, about 6 minutes: https://tally.so/r/2EQ1qj?src=linkedin

### Post 4 — Last day (Sun Nov 1, ~9:00 AM ET)
> Last day to take the State of Indie Authors survey. It closes tonight at 11:59 PM ET.
>
> https://tally.so/r/2EQ1qj?src=linkedin
>
> Thank you to everyone who has responded. I'll start working through the data next week.

### Post 5 — Methodology note (Wed Nov 11, optional)
> Update on the survey: it closed with [N] responses. Before the report goes out, I'm removing duplicate and implausibly fast submissions and will publish how many were dropped.
>
> The sample is self-selected, so the report will describe the authors who responded, not all indie authors. Methodology will be a section of its own.

### Post 6 — Report launch (Tue Dec 1, ~9:00 AM ET)
Drafted after the data exists. Lead with one real finding and `n`, link to `/research/state-of-indie-authors-2026`. Do not pre-write findings; every number in the report comes from the data.

## Notes on the poster

- The poster publishes text plus one image. It cannot add a first comment, so the link goes in the post body.
- Image options: none needed for posts 1–5. For post 6, use a real chart screenshot from the report.
- After publishing, the Super Admin social page shows a result per post. Failures show an error string; check it after the Oct 5 post.

## Blog series (8 posts, Oct 8 – Nov 3)

**How these were chosen:** 8 of the 35 published posts, picked for fit with what the survey asks about (direct sales, costs, email lists, knowing where sales come from). Every claim below is taken from the post it links to; nothing is added from outside. Where a post quotes a figure, the figure is marked so you can check it is still current before it goes out.

**Cadence:** Tuesdays and Thursdays, ~8:30 AM ET, so they never land on a survey-post Monday. If two a week is too much alongside the survey posts, drop the Thursdays and the series runs to Oct 27.

**Links:** `https://www.authorloft.com/blog/<slug>?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series`. This is the same tagging `src/lib/share.ts` uses, and Traffic Sources already shows `linkedin` as "LinkedIn".

### B1 — Thu Oct 8 · Direct sales vs. going wide
> Exclusive to Amazon, wide across retailers, or selling direct from your own site? Each has a cost.
>
> I compared the three in a short guide. The retailer routes carry royalties of 35–70% and do not give you customer data. It also covers a hybrid approach for authors who want to keep a foot in each.
>
> The right answer depends on where you are in your career.
>
> https://www.authorloft.com/blog/direct-sales-vs-going-wide-strategy?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series
>
> #IndieAuthors #SelfPublishing

*Figure to confirm: 35–70% royalty range (stated in the post).*

### B2 — Tue Oct 13 · 7 launch mistakes
> A book launch announced to an audience of zero sells to an audience of zero.
>
> That is the first of seven launch mistakes I wrote up. The post recommends starting email capture with a pre-order page 4–8 weeks before launch, and sending advance copies 3–4 weeks out so reviews are ready on day one.
>
> The other five cover social-only promotion, one-and-done posting, missing urgency, skipping the launch email, and no follow-up.
>
> https://www.authorloft.com/blog/7-book-launch-mistakes-first-week-sales?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series

### B3 — Thu Oct 15 · 3 reader magnets
> A reader magnet is something free you offer in exchange for an email address.
>
> The post describes three types: a free first book in a series, a bonus content download, and a resource relevant to your genre. It also covers where to place the magnet on your site.
>
> If you write a series, the first type is the one the post calls the standard.
>
> https://www.authorloft.com/blog/3-reader-magnets-that-grow-email-list?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series
>
> #AuthorEmailList #IndieAuthors

### B4 — Tue Oct 20 · 5 metrics to track
> Many authors watch their Amazon rank closely and never open their own website analytics.
>
> The post lists five numbers worth checking: book page views, traffic sources, newsletter conversion rate, device breakdown, and referral performance. Each tells you where to spend your marketing time.
>
> It also says how often to check, so this does not become another daily chore.
>
> https://www.authorloft.com/blog/5-metrics-every-author-should-track?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series

### B5 — Thu Oct 22 · Pricing an ebook for direct sales
> Amazon's royalty tiers push many authors to price between $2.99 and $9.99. The post puts the tiers at 70% inside that range and 35% outside it.
>
> Selling direct removes that constraint. The guide covers price points by length and format, launch pricing, newsletter-exclusive pricing, and backlist pricing.
>
> https://www.authorloft.com/blog/how-to-price-your-ebook-direct-sales?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series
>
> #SelfPublishing #DirectSales

*Figure to confirm: Amazon's 70% / 35% tiers and the $2.99–$9.99 range. Check against current KDP terms before this goes out.*

### B6 — Tue Oct 27 · Which social platform drives sales
> Which platform is best for selling books? The post argues that is the wrong question.
>
> The useful question is which platform sends visitors to your own site, and whether those visitors do anything once they arrive. A platform with millions of users is no use to you if none of them click through.
>
> The post shows where to find that in your analytics.
>
> https://www.authorloft.com/blog/which-social-media-drives-book-sales?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series

### B7 — Thu Oct 29 · Cost of self-publishing
> What does it cost to self-publish a book in 2026? The post gives ranges.
>
> It lists professional editing at $500–$3,000 and cover design at $200–$1,500, and separates what it calls non-negotiables from optional spending. It ends with a realistic budget and a publishing checklist.
>
> These are estimates for one-time production costs. The survey that closes Nov 1 asks about something different: what authors spend each month on tools and subscriptions. Both numbers matter to the total.
>
> https://www.authorloft.com/blog/how-much-cost-self-publish-book-2026?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series

*Figures to confirm: editing and cover ranges (stated in the post). The last paragraph matches the survey spec (Q9 is monthly tools and subscriptions spend, excluding ads, editing and covers).*

### B8 — Tue Nov 3 · First ARC campaign
> Never run an advance-reader campaign before? The post walks through it in six steps.
>
> It recommends starting your ARC list 4–6 weeks before launch and aiming for 20–50 readers. The remaining steps cover setting expectations, distributing the copy, following up, and collecting reviews.
>
> https://www.authorloft.com/blog/running-first-arc-campaign-walkthrough?utm_source=linkedin&utm_medium=social&utm_campaign=blog-series
>
> #IndieAuthors #BookMarketing

### Not used, and why
- **What's New / news posts:** product announcements, better suited to the product-feature posts than this series.
- **Reader Tips (EPUB / Kindle / Nook):** aimed at readers, not authors.
- **SEO vs. GEO vs. AEO, Author Website SEO:** broad and 14–19k characters; I have not read them in full, so I have not drafted from them.
- **Direct Sales for Authors, Self-Publishing vs. KDP, Why Authors Are Leaving KDP:** good candidates for a second round; I have only read their excerpts.

## Review checklist before queuing
1. Edit the copy until it sounds like you. Tell me what to change.
2. Confirm the three flagged figures (B1, B5, B7).
3. Survey length ("about 6 minutes") and question count (15) match the final Tally form.
4. LinkedIn reconnected and the survey link in place.
5. Then I queue each approved post as SCHEDULED in Super Admin, one batch at a time.
