# AuthorLoft — Feature Backlog

Running list of ideas and enhancements to consider for future builds. Not committed work — a parking lot for "next features." Pull items from here when planning a session; move shipped items to the bottom (or delete).

**How to use:** add new ideas under the right area with a one-line rationale and a rough effort/impact note. Keep it scannable.

_Last cleaned: June 11, 2026._

---

## Bookstore (`/bookstore`)

Shipped June 6, 2026 (discovery catalog, opt-in per book, STANDARD+). Hero/header redesigned June 8. Open ideas:

- [ ] **Author Spotlight curation** — currently auto-rotates daily among authors with a photo + bio. Options: super-admin hand-pick, or make it **Premium-only** as an upgrade incentive. *(small–medium)*
- [x] **Verify "Trending Now" view data** — was broken: `Book.views` was never incremented, so the row never showed. Fixed June 14, 2026 by adding a view increment on author book-page visits. *(done)*
- [ ] **Reader accounts + favorites/wishlists** — let readers save books. Powerful but heavy (no reader auth today). *(large)*
- [ ] **Curated "Staff Picks" / collections** — super-admin curation UI for themed shelves. *(medium)*
- [x] **Quick-view modal** — shipped June 15, 2026; a "Quick view" button on each catalog card opens a modal (cover, blurb, rating, formats, price, genres, author link, buy CTA) without leaving the bookstore. *(done)*
- [x] **Bookstore listing limits by tier** — `bookstoreListingLimit` on Plan; enforced server-side; configurable in Super Admin. *(done June 17, 2026)*
- [x] **Clickable author name on book cards** — shipped June 15, 2026; restructured the card with a stretched-link pattern so the whole card still opens the book while the author name links separately to their site. *(done)*
- [x] **Unify genre-page headers** — shipped June 15, 2026; `/bookstore/genre/[slug]` now uses the shared `MarketingPageHeader` brand band (same banner as the main Bookstore page) with an "All books" breadcrumb. *(done)*
- [ ] **Post-launch QA pass** — log in as a FREE author (confirm locked toggle) and approve a reader rating (confirm stars render on a card). *(verify)*

---

## Author Newsletter — rich email (WOW v2)

Shipped June 25, 2026: branded email + smart content blocks (featured book showcase, "more on the shelf" strip, smart review quote from `BookReview`/approved `BookFeedback`, smart special block from active `Special`, genre targeting, compose preview that mirrors the send). Next "WOW" ideas:

- [ ] **Hero banner image** — optional full-width header image (`heroImageUrl` or a per-send upload) behind the masthead, with a readable scrim + image-off fallback. *(medium — email image hosting + Outlook fallbacks)*
- [ ] **Drag-drop content blocks** — let authors add/reorder optional promo panels (text + image + CTA) in the composer instead of the fixed block order. Biggest lift; needs a block editor + storage. *(large)*
- [ ] **Multiple featured books / pick the featured title** — currently auto-picks newest published; let the author choose which book headlines, and optionally feature 2–3. *(small–medium)*
- [ ] **Per-send saved layouts / templates** — save a block configuration ("monthly update", "launch announcement") to reuse. *(medium)*
- [ ] **Subscriber preference center** — a real "update preferences" page (re-pick genres, pause) so the footer link is more than unsubscribe. Unlocks the "Update preferences" footer link we deferred. *(medium)*
- [ ] **Open/click analytics** — track opens + CTA clicks per campaign (Resend events or tracking pixel + redirect links); show on the History tab. *(medium)*
- [ ] **Scheduled / recurring sends** — "send later" + optional auto-digest cadence. *(medium–large)*
- [ ] **Featured quote field on the campaign** — let authors type a one-off pull-quote per send instead of only pulling from `BookReview`/`BookFeedback`. *(small)*
- [ ] **Reuse a prior newsletter** — "Duplicate" a past `Campaign` from the History tab to pre-fill the composer (subject, body, block selections) as a starting point for a new send. Requires storing the body/block config on `Campaign` (currently only subject + send stats are persisted). *(small–medium)*
- [ ] **AI-assisted newsletter drafting** *(investigate — may not build)* — explore an "AI assist" button in the composer (reuse the existing Gemini/`GEMINI_API_KEY` + AI-usage-cap infra from other admin AI tools) to draft or polish newsletter copy from a short prompt or from the author's latest book/blog/special. Evaluate value vs. abuse/cost (counts against AI usage cap) before committing. *(medium — spike first)*

---

## AuthorLoft News (`/news`) — Phase 2 (email)

Shipped Phase 1 June 8, 2026 (public news archive, Blog/News CMS toggle, subscriber capture, search/filter). Deferred — see `docs/NEWSLETTER_PHASE2_PLAN.md`:

- [ ] **Email a news issue to subscribers** — compose + send to `PlatformSubscriber`s, reusing the broadcast/mass-email infra. *(medium)*
- [ ] **Double opt-in confirmation emails** + public unsubscribe page (`unsubscribeToken` already stored). *(small–medium)*
- [x] **"Publish News post → also email subscribers"** — shipped June 15, 2026; a checkbox on published News posts emails the issue (headline, excerpt, cover, read link) to confirmed `PlatformSubscriber`s once, with a new platform unsubscribe route + `PlatformPost.newsEmailedAt` double-send guard. *(done)*
- [x] **RSS feed** for the news archive — shipped June 14, 2026 (`/news/rss.xml`, advertised via alternate link on `/news`). *(done)*
- [ ] **"New books this week" digest** — reader newsletter from the bookstore catalog; reuses the same email infra once Phase 2 lands. *(medium)*

---

## Author Empowerment — Pre-orders, Affiliate, Media Kit

Sprint 1 shipped June 12, 2026 (see Shipped section). Open follow-ons:

- [x] **Auto-send pre-order launch email** — opt-in toggle per book + daily cron with two-layer safety (toggle + readiness gate). *(done June 17, 2026)*
- [ ] **Reader-facing affiliate dashboard** — referral links/stats are currently author-only (no reader accounts exist). A magic-link or email-based portal for promoters to see their own clicks/earnings is a larger lift requiring reader auth. *(large)*
- [ ] **Affiliate payouts** — earnings accrue in `AffiliateReferral.earningsCents` but there's no payout mechanism yet (Stripe Connect transfer or manual "mark as paid"). *(medium)*
- [ ] **Media Kit PDF — sales trend chart** — current PDF shows point-in-time stats; a 6-month sales trend sparkline would need chart-to-image rendering compatible with `@react-pdf/renderer`. *(medium)*

---

## Content Import (authors migrating in)

Shipped June 11, 2026 (Books CSV import — see Shipped section). Open ideas:

- [ ] **WordPress XML import** for blog posts + books. *(~5 days)*
- [x] **Saved column-mapping presets** — shipped June 15, 2026; the import wizard's Map step can save/load/delete named column mappings (browser-local) for re-use on another CSV from the same source. *(done)*

---

## Auth / Account

- [ ] **"Remember me" / login persistence** — login is a persistent ~30-day cookie, so closing the browser doesn't sign out (standard, not a security bug). Add a "Remember me" checkbox (checked = ~30d persistent; unchecked = session cookie). Optionally shorten default 30d → 7d. *(small–medium, touches NextAuth session/cookie config)*
- [ ] **Captcha on public forms — add before exiting beta** — register, /api/contact, and /api/marketing/contact are currently protected by IP rate-limiting + (for register) the beta invite code. Once beta mode is off, /register becomes a realistic target for bot floods (Resend verification quota burn, fake author subdomains as link farms). Use **Cloudflare Turnstile** (free, no PII, invisible mode possible) — NOT reCAPTCHA. Implementation ~1 hr: `@marsidev/react-turnstile` widget client-side, verify token server-side in the API route. Trigger: flip on the same week beta mode is turned off. *(small)*

---

## Marketing & SEO

- [x] **GEO search readiness** — full structured data pass: llms.txt/llms-full.txt, WebSite+SearchAction schema, SoftwareApplication schema on features, Person schema on author about pages, BreadcrumbList on all marketing pages, AI bot rules in robots.txt, blog RSS feed. *(done June 22, 2026)*
- [x] **Guides infrastructure (Phase 1)** — CMS-managed evergreen pillar pages at `/guides/[slug]` with FAQ schema, related blog links, structured data, nav/footer/sitemap. *(done June 22, 2026)*
- [x] **Guide content (Phase 3)** — 10 pillar guides published: author websites, direct book selling, ARC programs, author newsletters, author branding, author media kits, book launch marketing, self-publishing, affiliate programs, reader analytics. *(done June 22, 2026)*
- [x] **Commercial landing pages (Phase 2)** — 11 static marketing pages for high-intent keywords: /author-website-builder, /sell-books-directly, /book-marketing-platform, /author-newsletter-platform, /arc-management, /author-media-kit, /ai-tools-for-authors, /indie-author-bookstore, /book-pre-orders, /author-affiliate-program, /reader-analytics-for-authors. *(done June 22, 2026)*
- [x] **Supporting blog articles + cross-linking (Phases 4 & 5)** — 15 new blog articles linking back to pillar guides + landing pages; all guides updated with related blog slugs; landing pages cross-linked to guides. Hub-and-spoke content architecture complete. *(done June 22, 2026)*
- [x] **User blog SEO readiness** — IndexNow on author blog publish, auto-generate metaDescription, CollectionPage JSON-LD on author blog listing, guides RSS feed, news RSS enrichment, guides in sitemap, robots.txt/sitemap.xml rewrites. *(done June 25, 2026)*
- [x] **Search engine submission tools** — `/admin/search-engines` page with step-by-step Google/Bing guides, site verification meta tag injection, sitemap URL copy, and IndexNow info. *(done June 25, 2026)*
- [ ] **Marketing blog** content build-out — CMS exists; expand published content. *(~16 hrs content)*
- [ ] **Book schema on author site book pages** — add schema.org/Book structured data to `/[domain]/books/[slug]` for richer search results. *(small)*
- [ ] **OG image optimization** — resize/crop uploaded OG images to recommended 1200×630 via CDN transform or build-time processing. *(medium)*
- [ ] **Author expertise/credentials schema** — add Person schema with author bios, credentials, and expertise fields for stronger E-E-A-T signals. *(small–medium)*
- [ ] **Bing URL Submission API** — one-click sitemap submission to Bing via their API (platform-level key or author's own key). *(small)*
- [ ] **SEO setup checklist** — trackable onboarding checklist for search engine verification + sitemap submission with persistent completion state. *(small–medium)*

---

## Resources & Downloads (`/resources`)

Shipped June 11, 2026 (email-gated downloadable resources alongside the affiliate directory). Open ideas:

- [x] **Individual download detail pages** (`/resources/[slug]`) — SEO landing pages with cover, body RTE, and download button; cards link to detail pages; sitemap updated. *(done June 17, 2026)*
- [x] **Email the download file** — shipped June 15, 2026; unlocking a gated resource now also emails the lead a copy of the download link (best-effort, never blocks the unlock). *(done)*
- [ ] **Move gated files to Supabase signed URLs** (like orders/ARC downloads) if stronger control than hidden Drive links is needed later. *(medium)*
- [x] **Resources dropdown child label** — confirmed "Tools & Communities" matches the page content (tools, communities, organisations); keeping as-is. *(June 12, 2026)*

---

## Shipped (for reference)

- ✅ **Book QR Code** — per-book QR code card on the Organisation tab; SVG download; links to the public book URL. All plans. (June 16, 2026)
- ✅ **Reader Magnet** — author marks a direct sale item as free; readers enter email on the public book page; receive a time-limited download link by email; added to the author's newsletter list automatically. Replaces BookFunnel for list-building. STANDARD/PREMIUM. New `BookMagnetLead` table + `isReaderMagnet` field. (June 16, 2026)
- ✅ **US State Privacy page** — `/us-privacy` covering CCPA/CPRA, Virginia CDPA, Colorado CPA, and other state rights. Linked from Privacy Policy and GDPR pages. (June 16, 2026)
- ✅ **Sales Revenue Charts** — three chart panels on the author Sales dashboard (area chart: revenue over time; horizontal bar: top 10 books by revenue; format breakdown: EBOOK/AUDIO/FLIPBOOK/PRINT split). 30d / 90d / 12mo period selector, live reload. STANDARD/PREMIUM. New API at `/api/admin/sales/stats`. (June 16, 2026)
- ✅ **Book Launch Mode** — Launch Countdown toggle + datetime picker in Visibility & Publishing; live days/hours/minutes/seconds timer on the public book page (auto-hides after launch). New `launchDate` + `showCountdown` fields on Book model; migration applied to Supabase. All plans. (June 16, 2026)
- ✅ **Launch Toolkit** — 5-point readiness checklist (cover, description, genre, sales config, published status) + pre-written social announcement with one-click copy, shown on every book's Organisation tab. (June 16, 2026)
- ✅ **Admin Books Status column** — replaced single Published/Draft badge with up to 4 badges per row: primary state (Pre-order / Published / Draft) + optional Featured / Direct Sales / Bookstore secondary flags. (June 16, 2026)
- ✅ **Author Empowerment Sprint 1** — Pre-orders/"Coming Soon" (STANDARD+, `pre-orders` gate, signup capture + manual launch email); Affiliate/Referral program (per-book toggle + commission %, `?ref=` link tracking, Stripe webhook attribution); Media Kit "Download PDF" (bio, photo, stats, featured covers via `@react-pdf/renderer`) (June 12, 2026)
- ✅ **CSV Book Import** — `/admin/books/import` 4-step wizard (Upload → Map Columns → Preview → Done); Goodreads export auto-detect + downloadable AuthorLoft template; column mapper; ISBN enrichment via Google Books/Open Library; genre/series auto-create; imports as drafts; respects plan book limits (June 11, 2026)
- ✅ **Newsletter & Bookstore listing → FREE** — both gates moved to FREE via Feature Gates; new `bookstore-listing` gate + `Plan.bookstoreListingEnabled` field replaces hardcoded STANDARD+ check (June 11, 2026)
- ✅ **FAQ, Content Categories, Downloadable Resources, Vercel Firewall** — public `/faq` page (grouped + structured data); shared blog/resource/faq category system + admin CRUD + dynamic dropdowns; email-gated downloadable resources with secure proxy + leads; "Resources ▾" nav dropdown; full-image covers (blog/bookstore/Cinematic) + clickable Cinematic cover; Tiptap FAQ answers; Vercel Pro Firewall over Cloudflare (June 11, 2026)
- ✅ **Mobile nav menus** — hamburger menu on the shared MarketingNav + a dark one on the homepage hero; homepage hero made mobile-responsive; "Features" link → /features page (June 8, 2026)
- ✅ **Unified marketing chrome** — shared nav, footer, and brand-band page headers (banner images on Bookstore/Blog/News) across all marketing pages; dead-code cleanup (June 8, 2026)
- ✅ **Blog/News search & filter** + searchable/sortable admin list + category datalist (June 8, 2026)
- ✅ **Changelog, build stamp, monthly News recap routine** (June 8, 2026)
- ✅ **AuthorLoft News** Phase 1 — public /news archive, Blog/News CMS toggle, subscriber capture (no sending yet), sitemap (June 8, 2026)
- ✅ **Company Social Links** — Super Admin CRUD, shared marketing footer, bookstore hero (June 7, 2026)
- ✅ **Bookstore** discovery catalog with showcase sections, genre pages, SEO, branding (June 6, 2026)
- ✅ **Reader Feedback & Ratings** (book-level, moderated) (June 5, 2026)
