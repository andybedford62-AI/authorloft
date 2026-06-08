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
