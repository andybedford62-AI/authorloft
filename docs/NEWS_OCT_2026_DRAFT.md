# Draft: "What's New at AuthorLoft — October 2026"

Not published. Two pieces below: the **News/blog post** (paste into Super Admin → News → New post)
and the **email** (paste into Mass Email). Written in the same format as the existing "What's New" posts.

Window covered: Sept 22 – Oct 22, 2026. The Sept 24 music-sharing post is not repeated.

**Before publishing, check the bracketed items:**
- `[SURVEY LINK]` — the live State of Indie Authors 2026 survey URL (not in the repo; I did not guess it).
- Section "Selling print copies" has two versions: use **A** if the shipping-fee/mark-as-shipped release is NOT yet promoted to production, **B** once it is.
- Dates for the survey (Oct 5 – Nov 1, winners drawn Nov 30) come from `docs/CHANGELOG.md`; confirm them.

---

## POST

**Title:** What's New at AuthorLoft — October 2026
**Slug:** whats-new-at-authorloft-october-2026
**Category:** What's New
**SEO title:** AuthorLoft Updates: October 2026
**Meta description (110–160 chars):** New book pages with a price per format, share tools for books and courses, payouts in any Stripe country, and a track organizer for music.
**Excerpt:** A month of changes for authors, course creators and musicians: book pages with a price for each format, share tools for books and courses, payouts in more countries, and a way to move tracks between albums.

### Body

This is a summary of what we shipped over the last month. Some of it is new features, some is fixes to things that were slowing you down, and some is groundwork you won't see but that makes the platform safer to run a business on.

If you only read one section, read "Getting paid". It affects every author who sells direct.

## Getting paid

**Connect your own Stripe account, in your own country.** You now choose the country of your bank account when you connect Stripe. Payments go straight to your Stripe account, so AuthorLoft never holds your money. Any country Stripe supports for businesses works.

**AuthorLoft takes 0% of your sales on every plan.** Stripe's normal processing fee still applies, and in the US that is typically 2.9% + 30¢ per card payment. Rates differ by country.

**The Free plan can sell eBooks.** Print, audio and flipbook sales need Standard or Premium.

**You are the seller of record.** Sales tax or VAT is added at checkout only if you have turned on Stripe Tax in your own Stripe account. If you have not, no tax is collected, and you are responsible for any tax you owe. Settings and the Terms now say this in plain words.

## Selling print copies

**VERSION A (use if the next release is not yet live):**
When a reader buys a Print edition, checkout now asks for their shipping address. You get it in the sale email, and it is saved on the order under Sales. You print and ship the copy yourself. AuthorLoft does not print or ship books. We are adding shipping fees and a "mark as shipped" button next.

**VERSION B (use once the next release is live):**
When a reader buys a Print edition, checkout asks for their shipping address. You print and ship the copy yourself. AuthorLoft does not print or ship books. Three things now help you do it:
- **A flat shipping fee.** Set it once in Settings, and it is added to any order that includes a print copy. Leave it empty for free shipping.
- **Mark as shipped.** In Sales, each print order shows "Needs shipping". Click "Mark as shipped", add a carrier and tracking number if you have one, and the reader gets an email.
- **Correct tax categories.** eBooks, audiobooks and print books are now sent to Stripe Tax as what they are. Before, they were all labelled as audio downloads. This matters if you have Stripe Tax turned on.

Abandoned checkouts (a reader who reached payment but did not finish) no longer fill your Sales list. They sit in their own tab and are removed after 30 days.

## Book pages and your book editor

**A price for each format.** Each book page now shows a card for every format you sell (eBook, print, audio), each with its own price and its own retailer links. The "from" price on your catalog follows your formats automatically.

**A cleaner page layout.** The lower half of the book page uses two columns, and ASIN now has its own field, separate from ISBN.

**Sections that fold.** The book, course and music editors now collapse into sections. The Save button stays visible as you scroll, and an "Unsaved changes" marker shows when something has not been saved.

**Cover check.** If you paste a web page address where a cover image should be, the save is refused with a message, and CSV imports skip that cover and tell you which book it was.

## Share and promote: now for books and courses too

The share tools we added for music are now on book and course pages as well. Visitors get share buttons and a QR code. You get a share box in the editor with tracked links, a suggested caption and a QR code you can download.

Social Promote (Standard and Premium) now writes posts about your courses, with seven course-specific post types, including New Course Launch and Lesson Spotlight.

Visitors who arrive through a tagged link are now credited to the right network under Traffic Sources, instead of showing as "Direct".

Link previews also improved. You can set a **Social Share Image** under Branding → Profile. If you leave it empty, your profile photo is used.

## Music

- **Organize tracks.** On the Music page, "Organize tracks" shows all your albums and playlists side by side. Drag a track to another list, or use its "Move to…" menu. Plays and likes move with the song.
- **Play counts and likes.** Every play on your public page is counted. Visitors see a track's listener count once it reaches 10, and they can like a track. Only you see dislikes, and your own plays are not counted.
- **New badges.** Music badges: First Release, Growing Discography, Ten Tracks and Deep Catalog. Listener badges: Tuned In (50 listeners), Crowd Favorite (500) and Chart Climber (5,000).
- **Clearer play button.** On a list that mixes YouTube or Spotify with link-outs like Suno, the button says "Play videos", "Play songs" or "Play tracks" with a count, and link-out tracks carry a small label showing where they open.
- **A page for musicians.** [authorloft.com/for-musicians](https://www.authorloft.com/for-musicians) explains the music tools and plans in one place.
- **Published dates** now show on courses as well as music.

## Your site's navigation

The Books, Courses and Music links on your site now appear only when you have something published in that area, and only on plans and settings that include it. No more menu links to empty pages. The same rule applies to your footer.

## Plans, downgrades and refunds

If you cancel or move to a lower plan, nothing is deleted. You get 30 days, with email reminders, to upgrade or choose what stays live. After that, content beyond the new plan's limits is hidden, never deleted, and comes back if you upgrade again.

The refund policy is the same everywhere it appears: a 30-day money-back guarantee on your first paid payment. After 30 days, payments are non-refundable. You can cancel at any time and your site stays live on the Free plan.

## Legal and privacy

- AuthorLoft now has a registered DMCA agent and a [Copyright and DMCA policy](https://www.authorloft.com/dmca).
- The [Privacy Policy](https://www.authorloft.com/privacy), Terms of Service and the GDPR and US state privacy pages were rewritten and now agree with each other. They name the operator, explain how reader data and author data are handled, and list the services we use.
- Cookie consent now defaults to "denied" until a visitor accepts.

## Around the site

- Public pages are now cached, so they are no longer rebuilt for every visitor.
- Cover images on public pages are resized before they are sent, which reduces what each page has to download.
- The [Compare page](https://www.authorloft.com/compare) has a rebuilt Music tab, with Suno, Udio, Donna, Spotify and Bandcamp side by side.
- Pricing, features and mobile layouts got a round of fixes. On a phone, the pricing comparison no longer cuts off the Premium column.

## State of Indie Authors 2026

We are running a short survey of independent authors, open from October 5 to November 1. Three respondents win a year of the Standard plan, with the draw on November 30. It takes a few minutes. [Take the survey → [SURVEY LINK]] The [prize rules](https://www.authorloft.com/research/state-of-indie-authors-2026/rules) are public.

## Tell us how it's going

If AuthorLoft has helped you, a few sentences about what you did with it help other authors decide. You can [leave a testimonial here](https://www.authorloft.com/share-your-story). Nothing is published without our review.

Thanks for building with us. More next month.

[New here? Create your site free →](https://www.authorloft.com/register)

— Andy

---

## EMAIL (Mass Email, plain, uses only {{firstName}})

**Subject options:**
1. What's new at AuthorLoft: October 2026
2. Payouts in your country, print shipping, and a track organizer
3. A month of AuthorLoft updates, in five minutes

**Preview text:** Payouts in more countries, a price per book format, and tools to share books, courses and music.

**Body:**

Hi {{firstName}},

Here is what changed at AuthorLoft over the last month. The full write-up is on the News page. These are the parts most people will use.

**Getting paid.** You can now connect your own Stripe account in your own country, and payments go straight to you. AuthorLoft takes 0% on every plan. The Free plan can sell eBooks.

**Print copies.** Checkout now collects a shipping address when a reader buys a Print edition, and you get it in your sale email and under Sales. [VERSION B: You can also set a flat shipping fee and mark orders as shipped with tracking.]

**Book pages.** Each format (eBook, print, audio) now has its own card, price and retailer links.

**Share and promote.** Books and courses now have the same share buttons, tracked links and QR codes music already had. Social Promote writes posts about your courses too (Standard and Premium).

**Music.** Move tracks between albums and playlists with "Organize tracks", see plays and likes per song, and earn new badges.

**Your plan.** If you downgrade or cancel, nothing is deleted. You get 30 days to choose what stays live.

Read the full update: https://www.authorloft.com/news/whats-new-at-authorloft-october-2026

If you have a few minutes, the State of Indie Authors 2026 survey is open until November 1. Three respondents win a year of Standard. [SURVEY LINK]

And if AuthorLoft has helped you, I would appreciate a few sentences for the testimonial page: https://www.authorloft.com/share-your-story

Reply to this email with questions or ideas. I read every one.

Andy
AuthorLoft
