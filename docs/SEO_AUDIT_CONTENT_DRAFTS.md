# SEO audit content drafts (review before applying)

Source: heycatch SEO audit of AuthorLoft, 21 Oct 2026. Nothing here has been written to the database.

## Step 1: `g_answer_first` (worth 0.8) — opening paragraph, 40–60 words, answer stated first

Each replaces the first `<p>` under the first `<h2>` of the guide. Only that paragraph changes.

| Guide slug | Proposed opening paragraph |
|---|---|
| `what-is-an-author-media-kit` | An author media kit, also called a press kit, is one page or file with your bio, headshot, book covers, genre and contact details. Podcast hosts, bloggers and journalists use it to feature you without emailing you for materials. Keep it current and link it from your author website. |
| `what-is-an-author-website` | An author website is a site on a domain you own that shows your books and bio, collects mailing-list signups, and lets readers buy from you. No platform algorithm decides who sees it, and no platform can remove it, unlike social profiles or retailer pages. |
| `what-is-author-branding` | Author branding is your visual identity, your voice, and the promise your name makes to readers. It is how readers recognize your books across platforms and pick them over other authors in your genre. A logo and a color scheme are only part of it. |
| `what-is-direct-book-selling` | Direct book selling means an author sells ebooks, print books or audiobooks to readers from the author's own website, not through a retailer such as Amazon, Kobo or Barnes & Noble. Payment goes to the author's Stripe account. The author keeps the sale price minus Stripe's fee, about 2.9% + 30¢. |
| `what-is-reader-analytics-for-authors` | Reader analytics is tracking how readers find and use your author website and books: which books get views, where visitors come from, and which posts bring traffic. It shows you which marketing works, so you stop guessing. |
| `what-is-self-publishing` | Self-publishing, also called indie publishing, means an author publishes a book without a traditional publisher. The author does or hires out the editing, cover design, formatting, distribution and marketing, and keeps creative control and a larger share of every sale. |

Not drafted yet: `blog/how-to-sell-your-book-directly-to-readers-without-amazon-taking-a-cut` (needs reading first).

## Still needs your input
- Who edits or reviews articles (for `a_author_diversity`).
- Which sources you trust for `a_external_sources`; I will propose and check links before any are added.
- Whether to retitle or 301 the ARC blog post (`c_duplicate_titles`).

## Applied 21 Oct 2026: previous first paragraphs (rollback)
- what-is-an-author-media-kit: An author media kit (also called a press kit) is a curated package of assets and information that makes it easy for media contacts to feature you. It includes your bio, professional headshot, book covers, genre information, and contact details — all in one place, ready to share.
- what-is-an-author-website: An author website is a dedicated online presence that showcases your books, your brand, and your story — all on a domain you own and control. Unlike social media profiles or retailer pages, your author website is <strong>yours</strong>. No algorithm decides who sees it. No platform can take it away.
- what-is-author-branding: Author branding is the combination of your visual identity, your voice, and the emotional promise your name makes to readers. It's how people recognize you across platforms, remember your books, and choose you over other authors in the same genre.
- what-is-direct-book-selling: Direct book selling is when an author sells books — ebooks, print, or audiobooks — directly to readers from their own website, rather than through a retailer like Amazon, Kobo, or Barnes &amp; Noble. The reader buys from <strong>you</strong>, payment goes to <strong>your</strong> Stripe account, and you keep 100% of the sale price (minus standard payment processing fees of ~2.9% + 30¢).
- what-is-reader-analytics-for-authors: Reader analytics is the practice of tracking and analyzing how readers interact with your author website and books. It answers questions like: Which books get the most views? Where do my readers come from? Which blog posts drive traffic? What marketing efforts actually work?
- what-is-self-publishing: Self-publishing (also called independent publishing or indie publishing) is when an author publishes their book without a traditional publishing house. You handle — or hire out — the editing, cover design, formatting, distribution, and marketing. In return, you keep creative control and a far larger share of every sale.

---

# Step 2 drafts (not applied)

## `g_self_contained` (worth 0.4): replace pronoun-led sentences with named subjects
These are in `PlatformPost`. Each row replaces the one paragraph or sentence quoted. Wording keeps the original meaning.

| Post slug | Current | Proposed |
|---|---|---|
| `pre-orders-101-build-buzz-before-launch-day` | This means your launch day announcement to your most interested readers is handled before launch day even arrives -- leaving you free to focus on the parts of launch day that do need your attention, like a broader newsletter send or social media posts. | The automatic "Notify Me" email sends your launch-day announcement to your most interested readers before launch day starts. You then have time for the work that needs you, such as a wider newsletter send or social media posts. |
| `why-authors-leaving-amazon-kdp-direct-sales` | This is not a fringe movement. It is a structural shift in how successful independent authors think about their businesses. Here is what is driving it. | Reducing Amazon dependency is not a fringe movement among indie authors. It is a structural shift in how successful independent authors run their businesses. Four things are driving it. *(check the count against the article before applying)* |
| `author-branding` | It's not just what you write — it's how you make readers feel. | Your author brand is not only what you write. It is how your books make readers feel. |
| `author-branding` | These pillars guide everything you create — from your website to your book covers. | Your brand pillars guide everything you create, from your author website to your book covers. |
| `7-things-every-author-website-needs` | That's it. That's the whole purpose. | A homepage has one purpose: turn a curious visitor into a subscriber or a buyer. |
| `7-things-every-author-website-needs` | These phrases sound poetic, but they don't communicate value. | Taglines like "Stories that inspire" sound poetic, but they do not tell a visitor what they get. |
| `7-things-every-author-website-needs` | It's not about you. It's about what your writing does for the reader. | A homepage headline is not about you. It is about what your writing does for the reader. |
| `7-things-every-author-website-needs` | That's not a sales page. That's a placeholder. | A row of retailer buttons is not a sales page. It is a placeholder. |
| `7-things-every-author-website-needs` | This creates cognitive overload. Visitors freeze, get confused, or leave. | A homepage with too many choices overloads the visitor. Visitors freeze, get confused, or leave. |
| `7-things-every-author-website-needs` | This is where most author sites break down — they leave readers to wander. | Navigation is where most author sites break down: they leave readers to wander. |

Notes:
- `authors-guide-to-gdpr-reader-data`: I found no pronoun-led paragraph in the opening. The audit may be reacting to a later paragraph; tell me if you want me to scan the full text.
- `7-things...` has more matches past the ninth; the list above is the ones I verified in context. The one after "Bonus content" is cut off and not drafted.
- The "Current" text for `author-branding` and `7-things` uses curly apostrophes in the database; my replace would match on the paragraph, not the exact string.

## `c_thin` (worth 1.2): triage of the 25 pages I could measure (words, not counting HTML)

| Group | Pages (words) | Recommendation |
|---|---|---|
| Monthly "what's new" and launch posts | whats-new-may-2026 (274), whats-new-june-2026 (284), social-promote intro (275), authorloft-is-live (358), whats-new-at-authorloft-september-2026 (429), whats-new-at-authorloft-august-2026 (663) | These are changelog posts, so short is normal. Cheapest fix: merge May, June and August/September into one "What's new in AuthorLoft, 2026" page with a 301 from each, or leave them. Your call. |
| Overlapping direct-sales content | direct-sales-vs-amazon guide (393), direct-sales-for-authors blog (542), what-is-direct-book-selling guide | Three pages target one topic. Merge the guide `direct-sales-vs-amazon` and blog `direct-sales-for-authors` into `what-is-direct-book-selling` with 301s. |
| Overlapping email-list content | building-your-first-author-email-list (333), reader-magnets-explained (354), welcome-email-sequence-for-authors (344), newsletter-ideas-for-authors (330), what-is-an-author-newsletter (489) | Extend `building-your-first-author-email-list` into the hub and link to the others, or merge reader-magnets and welcome-sequence into it. |
| Website guides | why-every-author-needs-a-website (358), author-website-mistakes (362), author-website-homepage-checklist (365), best-author-website-examples (437), getting-started-guide (311), what-is-authorloft (323) | Merge `why-every-author-needs-a-website` into `what-is-an-author-website`. Keep the others and extend each with an example, numbers or screenshots from you. |
| Standalone guides worth extending | accepting-payments-author-website-stripe (326), ebooks-vs-signed-print-copies (338), what-is-an-arc-program (470), what-is-book-launch-marketing (500), how-to-upload-epub-file-to-nook-readers (431), pitch-yourself-to-podcasts-author-media-kit (256) | Extend each toward 800 words with concrete steps, limits and edge cases. I can draft outlines, but real details (fees, screenshots, your own numbers) come from you. |

Merging and 301s change URLs and the sitemap, so I would not do any of it without your go-ahead on each group.

## Applied 21 Oct 2026: g_self_contained (PlatformPost). Old text for rollback
Applied wording differs slightly from the table above for two rows: the 7-things opener became "That one goal is the whole purpose of an author website." and the KDP post says "Four problems with Amazon are driving it." Rollback = replace the new text with the old text below, in the same post.

**author-branding**
- OLD: `It’s not just what you write — it’s <em>how</em> you make readers feel.`
- OLD: `These pillars guide everything you create — from your website to your book covers.`

**7-things-every-author-website-needs**
- OLD: `<p>That’s it. That’s the whole purpose.</p>`
- OLD: `These phrases sound poetic, but they don’t communicate value.`
- OLD: `<p>It’s not about you.<br>It’s about what your writing <em>does</em> for the reader.</p>`
- OLD: `<p>That’s not a sales page.<br>That’s a placeholder.</p>`
- OLD: `This creates cognitive overload.<br>Visitors freeze, get confused, or leave.`
- OLD: `This is where most author sites break down—they leave readers to wander.`

**pre-orders-101-build-buzz-before-launch-day**
- OLD: `This means your launch day announcement to your most interested readers is handled before launch day even arrives -- leaving you free to focus on the parts of launch day that do need your attention, like a broader newsletter send or social media posts.`

**why-authors-leaving-amazon-kdp-direct-sales**
- OLD: `This is not a fringe movement. It is a structural shift in how successful independent authors think about their businesses. Here is what is driving it.`

## Applied 21 Oct 2026: removed near-duplicates (rollback)
Unpublished (isPublished was true; set false), 308-redirected in next.config.ts:
- Guide: direct-sales-vs-amazon, why-every-author-needs-a-website, what-is-an-arc
- PlatformPost: author-branding, direct-sales-for-authors, whats-new-june-2026
Rollback: set isPublished back to true and delete the six redirects from next.config.ts.
Internal links repointed: 7-things-every-author-website-needs (/blog/author-branding -> /guides/what-is-author-branding), direct-sales-vs-going-wide-strategy (/guides/direct-sales-vs-amazon -> /guides/what-is-direct-book-selling), running-first-arc-campaign-walkthrough (/guides/what-is-an-arc -> /guides/what-is-an-arc-program).

---

# Step 3 drafts (not applied): `a_external_sources` (worth 3.8)

Audit wants at least 2 links to distinct independent primary sources per article, and 33 of 35 sampled pages fail. All URLs below returned HTTP 200 on 21 Oct 2026 (the FTC pages I tried returned 404 to my checker, so none are used; the Amazon help pages blocked a bot request, so only KDP pages that returned 200 are used).

## Verified source library
| Key | Title (as served) | URL |
|---|---|---|
| KDP-ROY | KDP: eBook Royalties | https://kdp.amazon.com/en_US/help/topic/G200644210 |
| KDP-PB | KDP: Paperback Royalty | https://kdp.amazon.com/en_US/help/topic/G201834330 |
| KDP-SEL | KDP: KDP Select | https://kdp.amazon.com/en_US/help/topic/G200798990 |
| KDP-CG | KDP: Content Guidelines | https://kdp.amazon.com/en_US/help/topic/G200672390 |
| STRIPE-P | Stripe: Pricing & Fees | https://stripe.com/pricing |
| STRIPE-TAX | Stripe Support: Taxes | https://support.stripe.com/topics/taxes |
| GDPR | EU General Data Protection Regulation (EUR-Lex) | https://eur-lex.europa.eu/eli/reg/2016/679/oj |
| ICO | ICO: UK GDPR guidance and resources | https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/ |
| EC-DP | European Commission: Data protection | https://commission.europa.eu/law/law-topic/data-protection_en |
| G-SEO | Google: SEO Starter Guide | https://developers.google.com/search/docs/fundamentals/seo-starter-guide |
| G-TITLE | Google: Influencing Title Links | https://developers.google.com/search/docs/appearance/title-link |
| G-HELP | Google: Creating Helpful, Reliable, People-First Content | https://developers.google.com/search/docs/fundamentals/creating-helpful-content |
| G-SPAM | Google: Spam Policies | https://developers.google.com/search/docs/essentials/spam-policies |
| G-AI | Google: Guidance on Generative AI Content | https://developers.google.com/search/docs/fundamentals/using-gen-ai-content |
| G-ART | Google: Article Schema Markup | https://developers.google.com/search/docs/appearance/structured-data/article |
| G-MAP | Google: What Is a Sitemap | https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview |
| SITEMAPS | sitemaps.org Protocol | https://www.sitemaps.org/protocol.html |
| WEBVIT | web.dev: Web Vitals | https://web.dev/articles/vitals |
| GA | Google Analytics Help: How Google Analytics works | https://support.google.com/analytics/answer/12159447 |
| CR-REG | U.S. Copyright Office: Register Your Work | https://www.copyright.gov/registration/ |
| CR-FEE | U.S. Copyright Office: Fees | https://www.copyright.gov/about/fees.html |
| CR-FAQ | U.S. Copyright Office: Copyright in General (FAQ) | https://www.copyright.gov/help/faq/faq-general.html |
| CR-AI | U.S. Copyright Office: Copyright and Artificial Intelligence | https://www.copyright.gov/ai/ |
| ISBN | International ISBN Agency | https://www.isbn-international.org/ |
| EPUB | W3C: EPUB 3.3 | https://www.w3.org/TR/epub-33/ |
| WCAG | W3C: Contrast (Minimum) | https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html |
| PEW-SM | Pew Research: Americans' Use of Social Media | https://www.pewresearch.org/internet/fact-sheet/social-media/ |
| PEW-MOB | Pew Research: Americans' Use of Mobile Devices | https://www.pewresearch.org/internet/fact-sheet/mobile/ |

## Proposed mapping (2 sources each; applied as a short "Sources" list at the end of the article, so no existing sentence changes)
| Flagged page | Sources | Fit |
|---|---|---|
| guides/what-is-direct-book-selling | KDP-ROY, STRIPE-P | Supports the royalty and ~2.9% + 30¢ claims. Check both figures against the live pages before adding. |
| guides/what-is-self-publishing | KDP-ROY, CR-REG | Royalties, copyright registration. |
| guides/what-is-an-author-website | G-SEO, WEBVIT | Search basics, page speed. |
| guides/what-is-author-branding | G-HELP, WCAG | Weak fit. Use only if the text mentions consistent naming or accessible colors; otherwise leave as is. |
| guides/what-is-an-author-media-kit | none found | No natural primary source. Leave, or add an interview/press-kit source you trust. |
| guides/what-is-reader-analytics-for-authors | GA, GDPR | Tracking and consent. |
| blog/direct-sales-vs-going-wide-strategy | KDP-SEL, KDP-ROY | Exclusivity and royalty claims. |
| blog/5-self-publishing-mistakes-amateur | KDP-CG, CR-REG | Content rules, copyright. |
| blog/how-much-cost-self-publish-book-2026 | ISBN, CR-FEE | ISBN and registration costs. Verify any dollar figures in the article against these pages. |
| blog/7-book-launch-mistakes-first-week-sales | KDP-SEL, KDP-ROY | Weak fit; confirm after reading. |
| blog/5-metrics-every-author-should-track | GA, WEBVIT | Metrics definitions. |
| blog/which-social-media-drives-book-sales | PEW-SM, GA | Platform usage, measurement. |
| blog/3-reader-magnets-that-grow-email-list | GDPR, ICO | Consent when collecting emails. |
| blog/pre-orders-101-build-buzz-before-launch-day | KDP-ROY, KDP-SEL | Weak fit; I could not verify a KDP pre-order page. |
| blog/why-your-author-website-needs-a-sitemap | G-MAP, SITEMAPS | Strong fit. |
| blog/seo-vs-geo-vs-aeo-the-new-visibility-trifecta | G-AI, G-SEO | Strong fit. |
| blog/can-you-write-a-book-using-chatgpt | CR-AI, KDP-CG, G-AI | Strong fit. |
| blog/author-branding-colors-fonts-genre | WCAG, PEW-MOB | Color contrast and mobile use. |
| blog/authorloft-not-just-an-author-website | STRIPE-P, G-SEO | Product post; sources only where it makes general claims. |
| blog/running-first-arc-campaign-walkthrough | KDP-CG | One source only; I could not verify a second. |
| blog/arc-programs-without-the-spreadsheet-chaos | KDP-CG | Same: one source. |
| blog/why-every-author-needs-a-media-kit | none found | Same as media-kit guide. |
| news/whats-new-at-authorloft-music-sharing-and-player, news/whats-new-at-authorloft-course-creation-is-here, news/june-mid-month-update-2026 | none | Product announcements; external sources do not fit. Consider whether the audit counts news posts. |
| guides/what-is-an-author-newsletter and other flagged guides not listed above | GDPR, ICO | Same pairing as reader magnets. Need confirmation after reading. |

Honest limits: 6 of the 25 pages have no good source to add, and 4 have only one verified source. Adding links only because the audit counts them would look like padding, so those need real references you pick, such as a study or an interview.

## Draft snippet (same on every page, per-page links)
```html
<h2>Sources</h2>
<ul>
  <li><a href="URL1" target="_blank" rel="noopener noreferrer">TITLE1</a></li>
  <li><a href="URL2" target="_blank" rel="noopener noreferrer">TITLE2</a></li>
</ul>
```
Note this adds one H2 titled "Sources" per article, which helps readers but is a repeated heading shape. The AI-slop finding looks at repeated heading shapes, so I suggest naming it for the topic, for example "Where these figures come from" on cost posts and "Official documentation" on SEO posts.

## Applied 21 Oct 2026: Sources lists (a_external_sources). Rollback = delete the appended block (from its H2 to the closing </ul>) at the end of `content`
Each block was appended to the end of the article; nothing else changed. Pages, headings and links:
- Guide `what-is-direct-book-selling` — "Where these figures come from": KDP eBook Royalties; Stripe Pricing & Fees
- PlatformPost `direct-sales-vs-going-wide-strategy` — "Where these figures come from": KDP Select; KDP eBook Royalties
- PlatformPost `why-your-author-website-needs-a-sitemap` — "Official documentation": Google What is a sitemap; sitemaps.org protocol
- PlatformPost `seo-vs-geo-vs-aeo-the-new-visibility-trifecta-every-brand-must-master-in-2026` — "Official documentation": Google generative AI content guidance; Google SEO Starter Guide
- Guide `what-is-an-author-website` — "Official documentation": Google SEO Starter Guide; Google structured data intro
- Guide `what-is-reader-analytics-for-authors` — "Sources for the privacy claims": PostHog GDPR docs; GDPR (EUR-Lex)
- Guide `what-is-self-publishing` — "Where these royalty figures come from": KDP eBook Royalties; Apple Books for Authors

Skipped after reading the text (the claims did not match the planned sources): how-much-cost-self-publish-book-2026 (no ISBN/copyright text), 5-self-publishing-mistakes-amateur, 5-metrics-every-author-should-track (uses PostHog, not Google Analytics), which-social-media-drives-book-sales (cites no platform statistics), 3-reader-magnets-that-grow-email-list (no GDPR claims), can-you-write-a-book-using-chatgpt (no copyright text), author-branding-colors-fonts-genre.
Unsourced claim noticed: the SEO/GEO/AEO post says Google processes "over 8.5 billion searches per day" with no source.

---

# Step 4 draft (not applied): `a_author_diversity` (worth 3.0)

Facts you gave me: you write every article, Claude drafts, you review all of it. You did not say who fact-checks, so the text below claims nothing about fact-checking beyond your own review.

## Disclosure text (for `/about`, new section after the founder block, heading "How we write and review articles")
> Anthony Bedford writes and reviews every article, guide and news post on AuthorLoft. An AI assistant (Claude, from Anthropic) produces first drafts, and Anthony reads and approves each one before it is published. No article goes live without that review.

## One-line version for article pages (under the byline)
> Written and reviewed by Anthony Bedford, with AI-assisted drafting. [How we write](/about#how-we-write)

## Code changes this needs (not made)
1. `src/app/(marketing)/about/page.tsx`: add the section with `id="how-we-write"`.
2. `src/app/(marketing)/blog/[slug]/page.tsx` and `guides/[slug]/page.tsx`: add the one-liner near the byline. Guides have no byline at all today (no author column on `Guide`), so for guides this is a text line only.
3. Optional: add `reviewedBy` to the Article JSON-LD pointing at the same Person.

## Honest limit
The audit measures how many distinct authors appear (1 of 35 pieces now). A disclosure addresses the "no editorial disclosure" half of the finding and the Google guidance on AI use. It does not create more authors. Full marks would need real second authors or reviewers, or fewer pieces published at a pace one person can review.

---

# Step 5 drafts (not applied): `c_thin` outlines (worth 1.2)

Read from the live database on 21 Oct 2026. Word counts exclude HTML.

## Finding behind the finding
The 11 thin guides below all use one fixed template: 2-Minute Summary, Why It Matters, Benefits, Step-by-Step, Common Mistakes, Examples, FAQ, How AuthorLoft Helps. That template is why they are all about 300-365 words, and it is also the template the audit's `a_ai_slop` finding describes ("the set number of H2s, the mandatory FAQ"). Padding each section would make it worse. Better: drop the template on these pages and add one or two sections that only you can write.

## Overlap to merge first (fewer, longer pages beat 11 padded ones)
| Merge | Into | Reason |
|---|---|---|
| `author-website-homepage-checklist` (365), `author-website-mistakes` (362), `best-author-website-examples` (437) | one page, keep `best-author-website-examples` or `author-website-homepage-checklist` | All three say the same things: hero, one call to action, newsletter signup, mobile, slow images. Together about 1,000 words after removing repeats. |
| `getting-started-guide` (311) | `what-is-authorloft` (323) | Both are "what you get on AuthorLoft"; a day-by-day first week fits inside one page. |
| `welcome-email-sequence-for-authors` (344), `reader-magnets-explained` (354) | `building-your-first-author-email-list` (333) | One email-list hub of about 1,000 words; `newsletter-ideas-for-authors` (330) stays separate and links to it. |

Each merge means a 301 in `next.config.ts` and unpublishing, the same steps as the six removals. I would not start without your OK on each row.

## Pages to extend (not merge), with what to add
Items marked **YOU** need facts, screenshots or numbers only you have. I will not invent them.

| Page (words) | Add | Needs |
|---|---|---|
| `accepting-payments-author-website-stripe` (326) | Screenshots of the connect flow; how payouts work in your account; a real example of a fee on a $9.99 sale (Stripe 2.9% + 30¢ is verified); what happens on refunds and disputes | **YOU**: screenshots, refund behavior |
| `ebooks-vs-signed-print-copies` (338) | Real shipping cost and time example; pricing example for a signed copy; a short case from your own sales | **YOU**: your numbers |
| `newsletter-ideas-for-authors` (330) | Three full example emails (subject line plus 80-word body); a 12-month send calendar | I can draft examples for you to edit |
| `what-is-an-arc-program` (470) | How to handle a late review; a sample ARC invitation email; how many readers is typical (needs a source) | **YOU**: your ARC results; sample email I can draft |
| `what-is-an-author-newsletter` (489) | Cite or cut the open-rate and conversion figures (40-60% open, 3-5x conversion are unsourced); add a sample first issue | **YOU**: sources or real stats |
| `what-is-book-launch-marketing` (500) | A real launch timeline from one of your books with results; a budget table | **YOU**: your launch data |
| `pitch-yourself-to-podcasts-author-media-kit` (256) | A full sample pitch email; follow-up timing; what to send after the interview | I can draft the sample |
| `how-to-upload-epub-file-to-nook-readers` (431) | Troubleshooting (file not showing, wrong format), supported models, a link to the W3C EPUB spec (verified) | **YOU**: test on your device |

## News posts (may, august, september, social-promote, authorloft-is-live)
Changelog posts are short by nature. Options: leave them, or roll May to September into one "What's new in AuthorLoft, 2026" page and 301 the monthly URLs. Your call.

## Suggested order
1. Approve or reject the three merges above.
2. I draft the sample emails and pitch (no facts needed).
3. You supply numbers and screenshots for the **YOU** rows; I place them.
