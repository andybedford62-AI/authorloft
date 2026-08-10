# AuthorLoft — Feature Backlog

Running list of ideas and enhancements to consider for future builds. Not committed work — a parking lot for "next features." Pull items from here when planning a session; move shipped items to the bottom (or delete).

**How to use:** add new ideas under the right area with a one-line rationale and a rough effort/impact note. Keep it scannable.

_Last cleaned: August 9, 2026 — full verification pass against actual codebase state, not just doc cross-checks._

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
- [x] **Courses in the Bookstore** — shipped Aug 6, 2026; `Course.listInBookstore` opt-in toggle (mirrors Book), separate "Courses from Independent Creators" section on `/bookstore` with a simple card (no genres/ratings — Course has neither yet). *(done)*
- [x] **Course categories / taxonomy** — shipped Aug 7, 2026 as `CourseCategory`/`CourseCategoryAssignment` (self-referential tree, mirrors `Genre`). Admin CRUD at `/admin/course-categories`, chip picker on the course editor, category-chip filter bar on the Bookstore's Courses section. *(done — see full entry under Bundles & Courses below; this line was a stale duplicate, corrected Aug 9 2026)*
- [x] **Unified Books/Courses filter tabs on `/bookstore`** — shipped Aug 10, 2026; `BookstoreCatalogTabs` wraps the existing grids under a Books | Courses type switcher, each keeping its own facet filters. *(done)*
- [x] **Course ratings on the Bookstore** — shipped Aug 10, 2026; new `CourseFeedback` model mirrors `BookFeedback`, course cards show stars once a course has at least one approved rating. *(done)*
- [ ] **Course entries in Bookstore structured data (JSON-LD)** — the `/bookstore` `CollectionPage`/`ItemList` schema only lists `@type: Book` items today; courses aren't included in search-engine structured data yet. *(small)*

---

## Author Newsletter — rich email (WOW v2)

Shipped June 25, 2026: branded email + smart content blocks (featured book showcase, "more on the shelf" strip, smart review quote from `BookReview`/approved `BookFeedback`, smart special block from active `Special`, genre targeting, compose preview that mirrors the send). Next "WOW" ideas:

- [ ] **Hero banner image** — optional full-width header image (`heroImageUrl` or a per-send upload) behind the masthead, with a readable scrim + image-off fallback. *(medium — email image hosting + Outlook fallbacks)*
- [ ] **Drag-drop content blocks** — let authors add/reorder optional promo panels (text + image + CTA) in the composer instead of the fixed block order. Biggest lift; needs a block editor + storage. *(large)*
- [ ] **Multiple featured books / pick the featured title** — currently auto-picks newest published; let the author choose which book headlines, and optionally feature 2–3. *(small–medium)*
- [ ] **Per-send saved layouts / templates** — save a block configuration ("monthly update", "launch announcement") to reuse. *(medium)*
- [ ] **Subscriber preference center** — a real "update preferences" page (re-pick genres, pause) so the footer link is more than unsubscribe. Unlocks the "Update preferences" footer link we deferred. *(medium)*
- [x] **Open/click analytics** — shipped Aug 10, 2026; new `CampaignSendLog` table + `/api/webhooks/resend` consuming Resend's native email.opened/email.clicked events (not a custom pixel/redirect system); History tab shows Opened/Clicked rate + count. Requires manual Resend dashboard setup (enable Open+Click Tracking on the domain, add the webhook, set `RESEND_WEBHOOK_SECRET`) before it actually records anything. *(done — pending dashboard config)*
- [ ] **Scheduled / recurring sends** — "send later" + optional auto-digest cadence. *(medium–large)*
- [ ] **Featured quote field on the campaign** — let authors type a one-off pull-quote per send instead of only pulling from `BookReview`/`BookFeedback`. *(small)*
- [x] **Reuse a prior newsletter** — shipped Aug 10, 2026; a "Reuse" button on each History tab row loads that campaign's exact subject/body/block config back into the composer. `Campaign` now persists this on send. *(done)*
- [ ] **AI-assisted newsletter drafting** *(investigate — may not build)* — explore an "AI assist" button in the composer (reuse the existing Gemini/`GEMINI_API_KEY` + AI-usage-cap infra from other admin AI tools) to draft or polish newsletter copy from a short prompt or from the author's latest book/blog/special. Evaluate value vs. abuse/cost (counts against AI usage cap) before committing. *(medium — spike first)*

---

## AuthorLoft News (`/news`) — Phase 2 (email)

Shipped Phase 1 June 8, 2026 (public news archive, Blog/News CMS toggle, subscriber capture, search/filter). Deferred — see `docs/NEWSLETTER_PHASE2_PLAN.md`:

- [x] **Email a news issue to subscribers** — this was a stale duplicate (corrected Aug 9, 2026): `POST /api/super-admin/blog/posts/[id]/email` already sends to confirmed `PlatformSubscriber`s via Resend batch send with the `newsEmailedAt` guard — same mechanism as the June 15 line below, just independently reachable, not a separate feature. *(done — see June 15 entry above)*
- [x] **Double opt-in confirmation emails** + public unsubscribe page — shipped Aug 10, 2026; `POST /api/news/subscribe` now sends a confirmation email, `GET /api/news/confirm` flips `isConfirmed`. Also unblocks the existing "email subscribers on News post publish" feature, which filters `isConfirmed: true` and had nothing to send to before this. *(done)*
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

## Product Expansion — Bundles & Courses

Shipped Bundles June 27, 2026 (admin CRUD, author site listing/detail, direct Stripe checkout, nav/footer toggles, feature gating). Open ideas:

- [x] **Book Bundles** — bundle multiple books/formats at a discounted price; admin CRUD at `/admin/bundles`; author site at `/bundles` + `/bundles/[slug]`; polymorphic OrderItem with `itemType: BUNDLE`; `navShowBundles` toggle; `bundlesEnabled` plan gate. *(done June 27, 2026)*
- [x] **Author Courses / Workshops** — authors teach writing craft or subject expertise; Course → Module → Lesson structure; rich text + external video embeds; one-time purchase; token-gated access via CourseEnrollment.accessToken. Admin CRUD at `/admin/courses`; author site at `/courses` + `/courses/[slug]` + `/courses/[slug]/learn` (lesson viewer). Free course enrollment + paid Stripe checkout. `coursesEnabled` plan gate, `navShowCourses` toggle. *(done June 27, 2026)*
- [ ] **Merchandise** — physical items (bookmarks, signed bookplates); self-fulfilled first, print-on-demand later. *(deferred — requires shipping/fulfillment)*
- [x] **Course lesson downloadable attachment** — optional per-lesson file (worksheet, slides, cheat sheet) using the existing `CourseLesson.fileKey`/`fileName` fields; admin upload at `/api/admin/upload/course-file` (private `course-files` bucket); gated download at `/api/courses/lesson-resource/[lessonId]` (same preview/enrollment-token access check as `/learn`). *(done August 6, 2026)*
- [x] **Course lesson print/download export (Phase 1 — browser print)** — `Course.allowDownload` toggle (admin editor, default on) gates a "Print / Download full course" action on the course detail page and `/learn` sidebar, linking to `/courses/[slug]/print`: a single document assembling every module/lesson the visitor has access to (same preview/enrollment-token check as `/learn`), with a table of contents, using the browser's native Print/Save-as-PDF (reuses the print-button + `@media print` pattern already live on blog posts). Video lessons show as a reference link, not embedded. *(done August 6, 2026)*
- [ ] **Course lesson PDF export (Phase 2 — branded server-rendered .pdf)** — a real downloadable `.pdf` file (cover page, consistent branding) instead of relying on the visitor's browser print dialog, generated server-side via `@react-pdf/renderer` (already a dependency, used today for the media-kit PDF — see `src/lib/media-kit-pdf.tsx`). Needs a small HTML→React-PDF content mapper; bounded in scope since lesson HTML is restricted to `sanitize.ts`'s fixed allow-list (headings, paragraphs, bold/italic, lists, links, images). Same enrollment gating as Phase 1. Not urgent — revisit if readers actually want a real file over Print-to-PDF. *(medium)*
- [x] **Bulk course upload (CSV template, Phase 1)** — one-row-per-lesson CSV import at `/admin/courses/import`, mirroring the Books importer's shape: `src/lib/csv-import-courses.ts` (field defs, alias-based column auto-detect, `groupRowsIntoCourses` flat-rows-to-nested-tree grouping), `CourseImportWizard` (4-step upload/map/preview/results, nested course→module→lesson tree preview), `POST /api/admin/courses/import` (plan-limit slicing via `canAddCourse`/`maxCourses`, duplicate-title dedup via `(2)`/`(3)` suffixing, transactional nested create, mirrors the `navShowCourses`/`onboardingCompletedAt` first-course side effects). Imports always land as drafts (`Course.isPublished` defaults `false`). Scope: content only — no pricing, no onboarding-modal entry point yet (admin page only), no PDF/file import (schema requires an actual upload via `fileKey`, not a CSV URL). *(done August 7, 2026)*
- [ ] **Bulk course upload — onboarding entry point (Phase 2)** — surface the same importer inside the onboarding modal's course-setup phase, for course-creators migrating an existing curriculum during signup instead of building from scratch. Reuses `CourseImportWizard`/`/api/admin/courses/import` as-is. *(small — mostly wiring, once Phase 1 usage validates demand)*
- [ ] **Course platform-specific import presets (e.g. Teachable/Thinkific export auto-detect)** — extend `src/lib/csv-import-courses.ts`'s `detectMapping` with a source-specific preset (mirrors the Books importer's Goodreads preset in `csv-import.ts`), once we have a real sample export to build the column-alias map against. *(small, blocked on a sample file)*
- [x] **Course Categories (taxonomy)** — author-scoped course subject-matter tagging, structurally identical to the book `Genre` model (self-referential tree, same slug-uniqueness pattern) but a separate `CourseCategory`/`CourseCategoryAssignment` table — deliberately not shared with book Genres (course topics like "Watercolor Painting" don't belong in the same list as fiction genres like "Romance"). Admin CRUD at `/admin/course-categories` (mirrors `/admin/genres` exactly — tree UI, inline rename, delete-blocked-if-in-use), chip picker on the course editor, `/bookstore`'s Courses section gains its own category-chip filter bar (`BookstoreCourseGrid`, same interaction pattern as the Books genre chips, kept as a separate facet — no merge into one grid). *(done August 7, 2026)*
- [ ] **Course CSV import — category column** — extend `csv-import-courses.ts` to resolve a `Category` column the same match-or-create way the Books importer resolves `genreNames` (see `POST /api/admin/books/import`'s `genreByName`/`uniqueSlug` pattern). Not built in the Course Categories pass — deliberately deferred. *(small)*
- [ ] **Bookstore Books/Courses full unification** — merge into one grid with type + facet tabs (genre chips for Books, category chips for Courses) under a unified visual shell, instead of today's two separate sections each with their own filter. Deliberately deferred when Course Categories shipped — bigger redesign of a page already polished this week. *(medium)*
- [x] **Course enrollment — author notification + subscriber capture (free and paid)** — `sendCourseSaleNotificationEmail()` (mirrors `sendSaleNotificationEmail`, branches copy for free vs. paid) fires on both `/api/courses/enroll` (free) and the Stripe `course_purchase` webhook block (paid); both paths also now upsert a `Subscriber` for the student. Found and fixed the same gap for paid book purchases in the process — `book_purchase` webhook block previously only sent the author notification, never captured the buyer as a subscriber (only free reader-magnet downloads did). *(done August 7, 2026)*
- [x] **Bundle purchase — subscriber capture** — `bundle_purchase` Stripe webhook block now upserts a `Subscriber` for the buyer, mirroring `book_purchase`/`course_purchase`. *(done Aug 9, 2026)*
- [ ] **Bundle discount codes** — extend DiscountCode to optionally apply to bundles (new join table). *(small–medium)*
- [ ] **Course discount codes** — extend DiscountCode to optionally apply to courses. *(small–medium)*
- [ ] **Bundle marketing page** — `/book-bundles` solution landing page. *(small)*
- [ ] **Course marketing page** — `/author-courses` solution landing page. *(small)*
- [x] **Admin dashboard doesn't surface Courses or Bundles like it does Books** — shipped Aug 10, 2026 as `CatalogTabsCard`: a Books | Courses | Bundles tab switcher (not three stacked panels — Andy's explicit feedback was that stacking read as "mixed together, not distinct") controls the whole content area, gated on `plan.coursesEnabled`/`bundlesEnabled`. *(done)*

---

## Custom Domains

Self-serve "bring your own domain" shipped Aug 8, 2026 (Admin → Settings → Custom Domain; link/check-status/unlink against Vercel's Domains API). Verified working end-to-end on staging (linked a test domain, got back the correct DNS record, status showed Pending). Confirmed live in production Aug 9, 2026 (via `main`/`dev` sync, PR #138). Scoped to BYOD only — deliberately excluded from that build:

- [ ] **Domain purchase through AuthorLoft** — let an author search + buy a brand-new domain right in the admin instead of bringing their own. Needs a registrar decision (Vercel-as-registrar charged via Stripe vs. a third-party reseller API with the author as registrant of record) — see project chat from Aug 8, 2026 for the tradeoffs discussed. Explicitly deferred, not started. *(large — registrar integration + billing)*
- [ ] **Automated verification polling** — today an author must click "Check status" manually; no cron/webhook auto-detects when DNS finishes propagating or notifies the author by email when their domain goes live. *(small–medium)*
- [ ] **www ↔ apex handling** — current DNS instructions only cover one record (A for apex, CNAME for a subdomain like `www`); doesn't yet offer to set up both apex + www together or redirect one to the other. *(small)*

---

## Founding Members

Manual (non-metric) status flag shipped Aug 9, 2026 — `Author.isFoundingMember`, Super Admin toggle, public badge on the author's About page, dashboard badge in the admin sidebar. See `docs/CHANGELOG.md` (Aug 9, 2026) for the full list of what shipped. Deliberately held back from that build:

- [ ] **Public "Founding Members" showcase page** — a wall-of-fame directory on authorloft.com linking out to each founding author's site. Doubles as social proof for new visitors and extra visibility/backlinks for the founders. Note: `Author.showInShowcase` already exists for a *different* marketing-page showcase (photo/book/text card) — decide whether to extend that mechanism or build a dedicated founding-members page before starting. *(medium)*
- [ ] **Automated eligibility (optional)** — today the flag is 100% manual (by design, per Aug 9 2026 decision); if a hard cutoff by signup date/order is ever wanted instead of admin discretion, that's a separate enforcement layer, not a change to the existing flag. *(small, only if requested)*

---

## Auth / Account

- [ ] **"Remember me" / login persistence** — corrected Aug 9, 2026: actual session is `maxAge: 8h` in `src/lib/auth.ts`, refreshed on activity — not the ~30-day cookie this item originally described. Feature (a "Remember me" checkbox to opt into a longer persistent session) is still genuinely unbuilt; only the rationale text was wrong. *(small–medium, touches NextAuth session/cookie config)*
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
- [x] **Book schema on author site book pages** — already built (corrected Aug 9, 2026): `/[domain]/books/[slug]/page.tsx` emits full `@type: "Book"` JSON-LD. Stale entry — the line here predates it or was never checked off. *(done)*
- [ ] **OG image optimization** — resize/crop uploaded OG images to recommended 1200×630 via CDN transform or build-time processing. *(medium)*
- [ ] **Author expertise/credentials schema** — PARTIALLY BUILT (checked Aug 9, 2026): Person schema already exists on author about pages (`about/page.tsx`), but `knowsAbout` is a hardcoded generic string ("Writing, Publishing, Independent Author") rather than real per-author credentials/expertise fields. Remaining work is the data model + UI to make it per-author, not the schema itself. *(small–medium)*
- [ ] **Bing URL Submission API** — note (Aug 9, 2026): `src/lib/indexnow.ts` already auto-pushes blog/guide URLs to Bing/Yandex via IndexNow on publish — a narrower, different automation than what this item describes (one-click full-sitemap submission via Bing's own API from `/admin/search-engines`, which today only shows manual instructions). Still open as literally scoped. *(small)*
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

- ✅ **Author Courses** — admin CRUD (`/admin/courses`), author site listing + detail + lesson viewer (`/courses`, `/courses/[slug]`, `/courses/[slug]/learn`), free enrollment + paid Stripe checkout, token-gated access, `coursesEnabled` plan gate, `navShowCourses` toggle. STANDARD/PREMIUM. (June 27, 2026)
- ✅ **Book Bundles** — admin CRUD (`/admin/bundles`), author site listing + detail (`/bundles`, `/bundles/[slug]`), Stripe checkout, polymorphic OrderItem, nav/footer toggles, `bundlesEnabled` plan gate. STANDARD/PREMIUM. (June 27, 2026)
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
