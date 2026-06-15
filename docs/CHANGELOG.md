# AuthorLoft — Changelog

Internal record of features shipped, newest first. This is the engineering/product
log; the **customer-facing** version lives on the public News page (`/news`).

AuthorLoft is continuously deployed (dev → staging → prod), so there are no formal
version numbers — entries are grouped by date. Dates from May 20, 2026 onward are
sourced from git commit history; earlier milestones come from project records.

**How to maintain:** when you ship something noteworthy, add a bullet under today's
date (create a new date heading if needed). Roll big efforts up into one feature
line rather than listing every commit.

---

## June 15, 2026 — GEO: AuthorLoft vs BookFunnel comparison page
_(not yet promoted to prod)_
- **New `/compare/bookfunnel` comparison page** — first Generative Engine Optimization (GEO) / SEO asset from the AI-visibility plan. Shared brand-band header, "choose which" cards, feature comparison table (from the pricing matrix), core-difference prose, and an FAQ section with `FAQPage` structured data (high-value for AI extraction). Brandless title (template-branded once), canonical, OG image; added to `sitemap.ts`; linked from the pricing page's competitor table. Scalable pattern for future `vs storyorigin` / `vs tertulia` pages

## June 15, 2026 — Genre page SEO title fix
_(not yet promoted to prod)_
- **Bookstore genre `<title>` fixed** — genre pages were the only page hardcoding the brand in the top-level title, so the root `%s | AuthorLoft` template produced a doubled brand ("… | AuthorLoft Bookstore | AuthorLoft") plus a "Books Books" redundancy and dropped the apostrophe (slug-derived "Childrens" vs "Children's"). `generateMetadata` now uses the real genre name, avoids the duplicate "Books", and sets a brandless title so the template brands it once. (SEO audit also confirmed: sitemap covers all public pages incl. blog/news/genre, no admin URLs leak, robots disallows private areas, all 15 marketing pages carry canonicals)

## June 15, 2026 — Unify bookstore genre-page header
_(not yet promoted to prod)_
- **Super Admin nav: Content Categories moved Platform → Marketing** — it powers the blog/news/resource/FAQ category dropdowns, so it sits more naturally under Marketing alongside Blog & News and Resources
- **Genre pages use the shared brand band** — `/bookstore/genre/[slug]` had its own older brown-gradient hero; it now uses the shared `MarketingPageHeader` (same navy band + `/bookstore-header.png` banner as the main Bookstore/Blog/News pages), with the genre name as the title and an "All books" breadcrumb above the grid

## June 14, 2026 — Quick wins: dashboard/nav fixes, book views, News RSS
_(not yet promoted to prod)_
- **Dashboard "Upgrade" no longer shows on Premium** — the Current Plan card always rendered an "Upgrade" button; it now shows "Manage" on PREMIUM (and links to `?tab=billing`), "Upgrade" on FREE/STANDARD
- **Admin sidebar: Light mode + Sign Out flow with the menu** — moved them out of the pinned bottom bar into the nav flow, directly after the last menu item, so they shift up/down dynamically as groups open/close (no more fixed gap)
- **Bookstore "Trending Now" now has data** — `Book.views` was never incremented anywhere, so the views-sorted Trending row never appeared. Added a fire-and-forget view increment on author book-page visits
- **News RSS feed** — new `/news/rss.xml` (RSS 2.0, latest 50 published news posts); the `/news` page now advertises it via an `application/rss+xml` alternate link for feed-reader discovery

## June 14, 2026 — Mobile Support for Super Admin + Settings
_(not yet promoted to prod)_
- **Feature Gates rows stack on mobile** — each gate row showed the label plus four tier buttons (FREE/STANDARD/PREMIUM/DISABLED) on one line, clipping the right-most buttons on phones. The row now stacks (`flex-col sm:flex-row`) with the buttons wrapping (`flex-wrap`), so all tiers are reachable. Verified on staging (overflow offenders 58 → 0). Desktop unchanged
- **Sidebar drawer now scrolls on mobile** — the sidebar `aside` used `min-h-screen`, so inside the fixed mobile drawer it grew taller than the viewport and the inner nav's `overflow-y-auto` never engaged, leaving the lower nav items (Super Admin section, Sign Out) unreachable. Changed to `h-full` so the aside is capped to the fixed drawer height (verified on staging: nav `scrollHeight > clientHeight`, bottom items reachable). Desktop unchanged (wrapper is content-height there, so `h-full` matches the prior `min-h-screen` behavior)
- **Super Admin is now mobile-capable** — the `/super-admin/*` layout previously rendered the 256px sidebar permanently with no hamburger, making it unusable on phones. It now reuses the author-side `AdminShell` (slide-in drawer + overlay + hamburger, responsive header/padding). Added an optional `headerBadge` slot to `AdminShell` so super-admin keeps its purple "Super Admin" badge in the top bar
- **Platform Settings sub-nav stacks on mobile** — the settings mega-page used a fixed `w-52` side rail in a row layout that squeezed content to ~140px on phones; it now stacks (`flex-col lg:flex-row`, full-width rail on mobile)
- Audit note: the author admin shell was already mobile-ready (drawer/hamburger since earlier work); most admin/super-admin data tables already use `overflow-x-auto` so they scroll horizontally on small screens. A device-width visual pass on staging is still recommended for dense tables and forms

## June 14, 2026 — Super Admin Menu Reorganization
_(not yet promoted to prod)_
- **Super Admin nav grouped** — the flat 15-item "Super Admin" list in the sidebar is now four collapsible groups: **Authors** (All Authors, Access Requests), **Billing & Plans** (Plans, Coupons, Feature Gates), **Marketing** (Blog & News, News Subscribers, Resources, Resource Downloads, Social Media), and **Platform** (Content Categories, Genres, Help Articles, Platform Legal, Platform Settings)
- **Platform Dashboard link added** — the super-admin sidebar now has a pinned link to `/super-admin` (the platform dashboard), which previously had no nav entry
- **Renames for clarity** — "Legal" → "Platform Legal", "Help Centre" → "Help Articles" (distinguishes the super-admin content-management pages from the author-side Help & Support); "Feature Gates" given a sliders icon
- Implemented in the shared `AdminSidebar` via a new `SuperNavGroupSection` (collapsible, per-group persisted open state, no feature-gating — super admins see everything). The `/super-admin/settings` mega-page (already internally tabbed) was left as-is
- Navigation/IA only; no routes, APIs, or permissions changed

## June 14, 2026 — Admin Menu Reorganization (author side)
_(not yet promoted to prod)_
- **Sidebar regrouped by job-to-be-done** — replaced the old Content / Marketing / Sales / Customize / Account groups with six clearer groups: **Catalog** (Books, Series, Flip Books), **Website** (Pages, Blog/News, Appearance, Branding, Legal Pages), **Audience** (Messages, Reader Feedback, Email & Newsletter, Media Kit), **Sales** (Sales, Specials, Discount Codes, Invoices & Tax), **Tools** (AI Assistant, SEO Audit), and **Account** (Settings, Reader Privacy (GDPR), Help & Support)
- **Analytics pinned** — promoted out of the (collapsed) Marketing group to a top-level pinned link next to Dashboard, since it's high-frequency
- **Renames for findability** — "My Site Legal" → "Legal Pages" (moved into Website, distinct Scale icon vs the GDPR shield), "Privacy & GDPR" → "Reader Privacy (GDPR)"
- **Help + Contact Support merged** — `/admin/help` is now a tabbed page ("Help centre" / "Contact support"); `/admin/contact-support` redirects to `/admin/help?tab=contact`. Two top-level links become one
- **Newsletter + Email Integration merged** — `/admin/newsletter` is now a tabbed page ("Newsletter" / "Integrations"); `/admin/newsletter-integration` redirects to `/admin/newsletter?tab=integrations`. Two top-level links become one
- API routes (`/api/admin/contact-support`, `/api/admin/newsletter-integration`) and feature gates unchanged — this is navigation/IA only, no behavior changes to the underlying features

## June 12, 2026 — Mobile Layout Fixes
_(promoted to prod June 12, 2026)_
- **Homepage mobile overflow fix** — the desktop nav-links pill on the homepage hero had an inline `display: flex` that overrode its `hidden md:flex` class, forcing it to render on mobile and pushing the page ~106px past the viewport edge (hiding the mobile menu button off-screen). Removed the inline override so it's hidden below the `md` breakpoint as intended
- **Resources page mobile overflow fix** — the partner-resource card grid's `minmax(320px, 1fr)` columns overflowed narrow viewports; changed to `minmax(min(320px, 100%), 1fr)` so cards never exceed the available width
- **Homepage FAQ section mobile fix** — the FAQ section's two-column grid (`1fr 1.4fr`, intro + accordion) didn't collapse on mobile, cutting off the entire accordion column off-screen; added a `max-width: 860px` media query that stacks it to a single column, reduces section padding, and un-stickies the intro
- **Homepage testimonials mobile fix** — the secondary-testimonial-card grid (`repeat(n, 1fr)`, n≥2) didn't collapse on mobile, pushing cards past the viewport edge; added a media query collapsing it to a single column, reducing section padding, and tightening the lead-testimonial card padding
- **Sitewide grid-overflow fix** — every `minmax(Npx, 1fr)` card/feature grid on the homepage (author showcase, problem/steps/features/genres/blog sections), the pricing section, and the resources page (partner tools + free downloads) had a fixed minimum column width wider than the available space inside a `60px`-padded section on a 375px screen, causing horizontal overflow; changed all of them to `minmax(min(Npx, 100%), 1fr)` so columns never exceed the viewport
- Also restyled blog/news thumbnails to 16:9, hid the bookstore hero social row, and restyled the News filter toolbar to match the Blog page (small follow-ups from the Blog redesign work below)

## June 12, 2026 — Blog Redesign, Content Categories Cleanup
_(promoted to prod June 12, 2026)_
- **Blog index redesign** ("The Loft Journal") — `/blog` now uses an editorial 3-column card grid with category tabs, search + sort toolbar (newest/oldest/quickest/longest/A-Z), and navy/gold placeholder plates for posts without a cover image; replaces the old uneven featured-post layout (`/news` is unaffected)
- **Content Categories: News type + strict dropdowns** — added a 4th "News" tab to Content Categories so News posts get their own managed, A-Z category list separate from Blog; the Blog/News post editor's Category field is now a strict dropdown (sourced from active Content Categories, A-Z, switches list when toggling Blog/News) instead of free-text + hardcoded suggestions; FAQ admin category dropdown now only shows active categories in A-Z order; Resources and Resource Downloads admin category dropdowns now A-Z ordered too

## June 12, 2026 — Author Empowerment Sprint 1: Pre-orders, Affiliate Program, Media Kit PDF
_(promoted to prod June 12, 2026)_
- **Pre-orders / "Coming Soon"** (STANDARD+, new `pre-orders` feature gate, default ON for Standard/Premium) — books can be marked "Coming Soon" with an optional launch date (Book edit → Organisation). The public book page shows a "Notify Me" signup form instead of buy buttons until launch. Author sees signup count under Organisation and can send a one-click "Send Launch Email" to everyone who signed up (`PreOrderSignup` table, `sendPreOrderLaunchEmail`)
- **Affiliate / Referral Program** (Direct Sales required) — new "Affiliate" tab on each book lets authors enable referral links with a configurable commission (1–50%). Authors generate labeled `?ref=CODE` links; clicks are tracked automatically (`AffiliateReferral` table), and a completed Stripe sale through a referral link credits the referrer's click/sale/earnings counters via the checkout cookie + webhook attribution
- **Media Kit PDF** — `/admin/media-kit` now has a "Download PDF" button that generates a one-page press kit (bio, photo, key stats: published books, newsletter subscribers, avg rating, books sold, top genres, featured book covers) via `@react-pdf/renderer` (serverless-safe, no headless browser)
- **Public Media Kit downloads** — the author site's `/media-kit` page now has a "Download Full Media Kit (PDF)" button (public version of the admin PDF, `/api/author-site/media-kit/pdf`) and a "Download Biography (.txt)" button next to the press bio (`/api/author-site/media-kit/bio`)
- **"Coming Soon" badge fix + extension** — the caption/badge ("New Release!", "Coming Soon!", etc.) was missing from the Bold template's "More Books" grid and from the Grid/Shelf books-page layouts; now shown consistently everywhere. Pre-order books (`isPreOrder`) without a custom caption now automatically show a "Coming Soon" badge across the author site (home, books page, carousels) and on `/bookstore` cards
- **FAQ nav link** — added a direct "FAQ" link to the marketing site's top nav and mobile menu (previously only inside the "Resources ▾" dropdown)
- **"Your Site Pages" dashboard card** — admin dashboard now shows a visual list of the author's live public pages (Home, Books, About, Contact, custom pages, etc., based on nav settings) as clickable links to the live site

## June 11, 2026 — FAQ, Content Categories, Downloadable Resources, Security, Feature Gates, CSV Import
_(promoted to prod June 12, 2026)_
- **Public FAQ page** (`/faq`) grouped by category with FAQ structured data; homepage FAQ capped at 10 with a "See all FAQs" link; added to sitemap
- **Content Categories** — shared category system (blog / resource / faq) with a Super-Admin CRUD panel; dynamic category dropdowns wired into the Blog, Resources, and FAQ editors (replaces hardcoded lists)
- **Email-gated downloadable resources** — Super-Admin "Resource Downloads" CRUD (cover, RTE detail body, category, publish/email-gate toggles); public "Free Downloads" section on `/resources` grouped by category; secure proxy (`/api/downloads/[id]`) hides the raw file URL + counts downloads; one-time email gate (`al_download_unlock` cookie) captures a lead; recent-leads list in admin
- **FREE plan upgrades** — Newsletter (capture + send) and AuthorLoft Bookstore listing moved to FREE via Feature Gates (super-admin can re-tier either at any time); new `bookstore-listing` gate replaces the hardcoded STANDARD+ check
- **CSV Book Import** (`/admin/books/import`) — 4-step wizard (Upload → Map Columns → Preview → Done) for migrating authors. Auto-detects a Goodreads "Export Library" CSV or our downloadable template; column mapper for anything else. Optional "Fill missing details from ISBN" enrichment (Google Books → Open Library). Genres/Series auto-created on match; imports land as drafts for review; respects plan book limits (imports up to the remaining slots, reports the rest as skipped with an upgrade prompt)
- **"Resources ▾" nav dropdown** — groups Blog, News, FAQ, and the relabeled "Tools & Communities" directory (hero + marketing nav, desktop + mobile); declutters the top nav
- **Rich-text FAQ answers** (Tiptap) + scrollable FAQ admin modal
- **Full-image covers** — blog headers, bookstore cards, and the Cinematic featured cover now use `object-contain` (whole image shows, no edge cropping)
- **Cinematic template** — featured release cover is now a link to the book detail page with a hover zoom + accent glow
- Marketing hero subhead copy refresh
- **Security** — chose Vercel Pro Firewall over Cloudflare (DNS stays on Vercel, no migration risk): Bot Protection on + custom rate-limit rules on auth/lead/API endpoints; Cloudflare deferred unless bots persist

## June 8, 2026 — SEO
- Fixed duplicated/over-long page titles (root template was doubling "AuthorLoft")
- noindex on auth/utility pages (login, register, etc.) to clear thin-content flags
- IndexNow: instant Bing/Yandex notification when a Blog or News post is published

## June 8, 2026 — Marketing site polish
- Unified the top nav, footer, and brand-band page headers across all marketing pages (banner images on Bookstore/Blog/News; navy gradient elsewhere)
- Added mobile hamburger menus to both the shared nav and the homepage hero; made the homepage hero responsive on phones
- "Features" nav link now points to the real /features page
- Search/filter on the public Blog & News pages; searchable/sortable admin Blog & News list; category datalist in the editor
- Removed dead code from the refactors

## June 8, 2026 — AuthorLoft News
- Public `/news` page: company news/announcements archive, separate from the blog (grouped by year)
- Blog ⇄ News CMS toggle — one editor routes a post to `/blog` or `/news`
- Subscriber capture — signup forms on News page, footer, and homepage → platform subscriber list + CSV export (email sending deferred to Phase 2)
- Search/filter on News and Blog pages (keyword search, category chips, sort, year)
- Searchable + sortable Super Admin "Blog & News" list (replaced manual drag ordering)
- Category datalist in the editor (suggested + existing categories)
- "News" link added to homepage hero menu; header logos on Blog & News pages

## June 7, 2026 — Company Social Links + Bookstore polish
- Flexible company social-links system — Super Admin CRUD for any platform
- Shared marketing footer with dynamic social icons across all marketing pages
- Social Media admin reorganized into tabs (Post Content + Company Links)
- Bookstore: mission-statement hero, prominent search, "Buy on Author's Site" CTA, Premium tier features, onboarding callout

## June 6, 2026 — AuthorLoft Bookstore
- Public discovery catalog (`/bookstore`), per-book opt-in (Standard+), genre landing pages, showcase sections, full SEO, homepage hero link

## June 5, 2026 — Reader Feedback & Ratings
- Book-level, author-moderated reader ratings & feedback

## June 3, 2026 — Dynamic OG Images
- Per-page social-share image management for marketing pages

## June 1, 2026 — Coupons & Billing
- Coupon manager + author coupon assignment; early-bird coupon fixes; trial-user billing fix

## May 30, 2026 — Resources, Showcase & Blog SEO
- `/resources` page (author tools & partner directory) + Super Admin CRUD
- Author showcase promoted to hero with 3 display styles
- Blog editor SEO fields, downloadable-resource attachments + print button

## May 29, 2026 — Onboarding & Plans
- Guided 3-step onboarding wizard
- Admin-assigned trial upgrade system + trial reminder banner
- Premium custom accent-colour picker; genre palettes opened to Standard+
- "Next Steps" checklist gating

## May 25–26, 2026 — Platform Blog & Social Poster
- Platform blog: full CRUD CMS, drag-reorder, public pages, SEO integration
- Super Admin social-media poster (LinkedIn, Facebook, Instagram)
- SEO fields on author blog posts; canonical URLs + OG images sitewide

## May 24, 2026 — Onboarding Emails & Analytics
- Day-3 onboarding email, welcome modal; PostHog funnel tracking; internal-linking improvements

## May 20, 2026 — ARC Gating
- ARC (advance reader copy) management gated to Standard/Premium

## May 16, 2026 — Mass Email & Communications *(project records)*
- Broadcasts, reusable templates, compliance opt-out, welcome-email editor

## May 15, 2026 — Launch / Go-Live *(project records)*
- Production launch on live Stripe keys; Sentry + PostHog live; security audit complete; staging environment set up

> **Pre-launch baseline:** author websites, book catalog, direct sales via Stripe Connect, newsletter capture, flip books, themes, shopping cart, and audio format predate this dated window.
