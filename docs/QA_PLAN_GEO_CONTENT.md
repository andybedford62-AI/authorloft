# QA Plan — GEO Content Strategy (Phases 2–5)

**Date:** June 22, 2026
**Environment:** staging.authorloft.com
**Branch:** `claude/authorloft-geo-search-ready-lcmz0w`

---

## Phase 2 — Commercial Landing Pages (11 pages)

### Page Load & Layout

For each URL below, verify:
- [ ] Page loads without errors
- [ ] MarketingNav renders at top (with Solutions dropdown)
- [ ] MarketingPageHeader hero band displays (eyebrow, title, subtitle)
- [ ] Breadcrumb row shows: Home > page name
- [ ] Intro paragraph renders below hero
- [ ] 3 feature sections display with heading, description, and check-icon bullet list
- [ ] FAQ accordion cards render and expand/collapse on click
- [ ] CTA block at bottom with "Get Started Free" and "View Pricing" buttons
- [ ] Footer renders correctly
- [ ] Page is mobile-responsive (test at 375px, 768px, 1024px)

### URLs to test

1. [ ] `/author-website-builder`
2. [ ] `/sell-books-directly`
3. [ ] `/book-marketing-platform`
4. [ ] `/author-newsletter-platform`
5. [ ] `/arc-management`
6. [ ] `/author-media-kit`
7. [ ] `/ai-tools-for-authors`
8. [ ] `/indie-author-bookstore`
9. [ ] `/book-pre-orders`
10. [ ] `/author-affiliate-program`
11. [ ] `/reader-analytics-for-authors`

### Related Guide Link Cards

These pages should show a "Related Guide" card linking to their pillar guide:

- [ ] `/author-website-builder` → guide: What Is an Author Website?
- [ ] `/sell-books-directly` → guide: What Is Direct Book Selling?
- [ ] `/arc-management` → guide: What Is an ARC Program?
- [ ] `/author-newsletter-platform` → guide: What Is an Author Newsletter?
- [ ] `/author-media-kit` → guide: What Is an Author Media Kit?
- [ ] `/ai-tools-for-authors` → guide (cross-topic, may not have one)
- [ ] `/book-marketing-platform` → guide: What Is Book Launch Marketing?
- [ ] `/indie-author-bookstore` → guide (cross-topic, may not have one)
- [ ] `/book-pre-orders` → guide: What Is Book Launch Marketing?
- [ ] `/author-affiliate-program` → guide: What Is an Author Affiliate Program?
- [ ] `/reader-analytics-for-authors` → guide: What Is Reader Analytics for Authors?

### Structured Data (JSON-LD)

For each landing page, open DevTools → Elements → search `application/ld+json`:
- [ ] FAQPage schema with correct questions/answers
- [ ] WebPage schema with name, description, breadcrumb
- [ ] BreadcrumbList schema with Home + page name

### SEO Meta Tags

For each page, check `<head>`:
- [ ] `<title>` tag is unique and descriptive
- [ ] `<meta name="description">` is present
- [ ] `<link rel="canonical">` points to correct URL
- [ ] OpenGraph tags (og:title, og:description, og:image)
- [ ] Twitter card tags

---

## Navigation — Solutions Dropdown

### Desktop Nav

- [ ] "Solutions" label appears in the top nav between "Features" and "FAQ"
- [ ] Hovering over "Solutions" opens a dropdown
- [ ] Dropdown shows 4 groups in 2-column layout:
  - **Your Platform:** Author Website Builder, Sell Books Directly
  - **Sell & Grow:** Book Pre-Orders, Author Affiliate Program, Indie Author Bookstore
  - **Marketing & Tools:** Book Marketing Platform, Author Newsletter Platform, AI Tools for Authors, Author Media Kit
  - **Readers & Analytics:** ARC Management, Reader Analytics for Authors
- [ ] Each link navigates to the correct landing page
- [ ] Dropdown closes when mouse leaves
- [ ] Dropdown closes when a link is clicked

### Mobile Nav

- [ ] Hamburger menu opens on mobile
- [ ] "Solutions" section appears with all 11 links
- [ ] Each link navigates correctly and closes the menu

### Features Page — "Explore each feature" Cards

- [ ] `/features` page shows "Explore each feature in depth" section
- [ ] 11 cards display in 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- [ ] Each card shows: eyebrow label, description, "Learn more →" link
- [ ] Each card links to the correct landing page

---

## Phase 3 — Pillar Guides (10 guides)

### Guide Pages

For each guide URL, verify:
- [ ] Page loads at `/guides/[slug]`
- [ ] Title, hero image, and body content render
- [ ] FAQ section renders with expand/collapse
- [ ] Related blog links section shows at bottom (if configured)
- [ ] FAQPage JSON-LD schema is present
- [ ] Page is mobile-responsive

### Guide URLs

1. [ ] `/guides/what-is-an-author-website`
2. [ ] `/guides/what-is-direct-book-selling`
3. [ ] `/guides/what-is-an-arc-program`
4. [ ] `/guides/what-is-an-author-newsletter`
5. [ ] `/guides/what-is-author-branding`
6. [ ] `/guides/what-is-an-author-media-kit`
7. [ ] `/guides/what-is-book-launch-marketing`
8. [ ] `/guides/what-is-self-publishing`
9. [ ] `/guides/what-is-an-author-affiliate-program`
10. [ ] `/guides/what-is-reader-analytics-for-authors`

### Guide Index Page

- [ ] `/guides` lists all 10 guides
- [ ] Cards show title, excerpt, and link
- [ ] Sorted by sort order (1–10)

---

## Phase 4 — Blog Articles (15 articles)

### Blog Posts

For each article, verify:
- [ ] Page loads at `/blog/[slug]`
- [ ] Title, cover image, date, and body render
- [ ] Content includes internal links to guides and/or landing pages
- [ ] Page is mobile-responsive

### Blog Slugs

1. [ ] `/blog/why-every-author-needs-a-website`
2. [ ] `/blog/sell-ebooks-from-your-own-website`
3. [ ] `/blog/arc-strategies-for-indie-authors`
4. [ ] `/blog/grow-your-author-newsletter`
5. [ ] `/blog/build-your-author-brand`
6. [ ] `/blog/create-an-author-media-kit`
7. [ ] `/blog/book-launch-checklist`
8. [ ] `/blog/self-publishing-first-steps`
9. [ ] `/blog/start-an-author-affiliate-program`
10. [ ] `/blog/track-reader-analytics`
11. [ ] `/blog/direct-sales-vs-amazon`
12. [ ] `/blog/pre-order-campaign-tips`
13. [ ] `/blog/ai-tools-for-book-marketing`
14. [ ] `/blog/indie-bookstore-discovery`
15. [ ] `/blog/reader-magnets-that-convert`

### Blog Index

- [ ] `/blog` page lists the new articles (may need to scroll/filter)
- [ ] Articles show title, excerpt, cover image, date

---

## Phase 5 — Cross-Linking

### Guide → Blog Links

Verify each guide's "Related Articles" section links to relevant blog posts:
- [ ] what-is-an-author-website → why-every-author-needs-a-website
- [ ] what-is-direct-book-selling → sell-ebooks-from-your-own-website, direct-sales-vs-amazon
- [ ] what-is-an-arc-program → arc-strategies-for-indie-authors
- [ ] what-is-an-author-newsletter → grow-your-author-newsletter, reader-magnets-that-convert
- [ ] what-is-author-branding → build-your-author-brand
- [ ] what-is-an-author-media-kit → create-an-author-media-kit
- [ ] what-is-book-launch-marketing → book-launch-checklist, pre-order-campaign-tips
- [ ] what-is-self-publishing → self-publishing-first-steps
- [ ] what-is-an-author-affiliate-program → start-an-author-affiliate-program
- [ ] what-is-reader-analytics-for-authors → track-reader-analytics

### Landing Page → Guide Links

Verify the "Related Guide" card on each landing page links to the correct guide (see Phase 2 checklist above).

### Blog → Landing Page / Guide Links

Spot-check 3–5 blog articles to confirm in-body links point to the correct landing pages and/or guides.

---

## Global Checks

### Sitemap

- [ ] Visit `/sitemap.xml`
- [ ] All 11 landing page URLs are present
- [ ] Guide URLs are present
- [ ] Blog article URLs are present

### llms.txt / llms-full.txt

- [ ] `/llms.txt` includes "Feature Pages" section with 11 URLs
- [ ] `/llms-full.txt` includes "Feature Landing Pages" section with descriptions
- [ ] `/llms-full.txt` includes all 10 guide URLs under Author Guides

### Performance

- [ ] Spot-check 2–3 landing pages load in under 3 seconds
- [ ] No console errors on any tested page

### 404 Handling

- [ ] Visiting a non-existent landing page slug (e.g., `/fake-page`) shows the 404 page

---

## Sign-Off

| Area | Status | Tested By | Date |
|------|--------|-----------|------|
| Landing Pages (11) | | | |
| Navigation (desktop + mobile) | | | |
| Features Page Cards | | | |
| Guides (10) | | | |
| Blog Articles (15) | | | |
| Cross-Linking | | | |
| Sitemap & SEO | | | |
| llms.txt files | | | |
| Mobile Responsive | | | |
