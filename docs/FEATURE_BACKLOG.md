# AuthorLoft — Feature Backlog

Running list of ideas and enhancements to consider for future builds. Not committed work — a parking lot for "next features." Pull items from here when planning a session; move shipped items to the bottom (or delete).

**How to use:** add new ideas under the right area with a one-line rationale and a rough effort/impact note. Keep it scannable.

_Last cleaned: June 8, 2026._

---

## Bookstore (`/bookstore`)

Shipped June 6, 2026 (discovery catalog, opt-in per book, STANDARD+). Hero/header redesigned June 8. Open ideas:

- [ ] **Author Spotlight curation** — currently auto-rotates daily among authors with a photo + bio. Options: super-admin hand-pick, or make it **Premium-only** as an upgrade incentive. *(small–medium)*
- [ ] **Verify "Trending Now" view data** — relies on `Book.views`; confirm views increment on author book pages so the row populates. *(verify)*
- [ ] **Reader accounts + favorites/wishlists** — let readers save books. Powerful but heavy (no reader auth today). *(large)*
- [ ] **Curated "Staff Picks" / collections** — super-admin curation UI for themed shelves. *(medium)*
- [ ] **Quick-view modal** — peek at a book without leaving the bookstore. *(small)*
- [ ] **Bookstore listing limits by tier** — e.g., STANDARD limited number of listings, PREMIUM unlimited + featured (pricing lever). *(small)*
- [ ] **Clickable author name on book cards** — whole card currently links to the book (can't nest links); restructure so the author name links to their site separately. *(small)*
- [ ] **Unify genre-page headers** — `/bookstore/genre/[slug]` still uses its own older header; give it the shared brand band for consistency. *(small)*
- [ ] **Post-launch QA pass** — log in as a FREE author (confirm locked toggle) and approve a reader rating (confirm stars render on a card). *(verify)*

---

## AuthorLoft News (`/news`) — Phase 2 (email)

Shipped Phase 1 June 8, 2026 (public news archive, Blog/News CMS toggle, subscriber capture, search/filter). Deferred — see `docs/NEWSLETTER_PHASE2_PLAN.md`:

- [ ] **Email a news issue to subscribers** — compose + send to `PlatformSubscriber`s, reusing the broadcast/mass-email infra. *(medium)*
- [ ] **Double opt-in confirmation emails** + public unsubscribe page (`unsubscribeToken` already stored). *(small–medium)*
- [ ] **"Publish News post → also email subscribers"** one-click option. *(small)*
- [ ] **RSS feed** for the news archive. *(small)*
- [ ] **"New books this week" digest** — reader newsletter from the bookstore catalog; reuses the same email infra once Phase 2 lands. *(medium)*

---

## Content Import (authors migrating in)

- [ ] **Books CSV import** with downloadable template (title, subtitle, description, cover URL, ISBN, price, genres, series, release date) + preview/confirm step. *(~3 days)* — see `docs/BOOKSTORE_TODO.md`
- [ ] **WordPress XML import** for blog posts + books. *(~5 days)*

---

## Auth / Account

- [ ] **"Remember me" / login persistence** — login is a persistent ~30-day cookie, so closing the browser doesn't sign out (standard, not a security bug). Add a "Remember me" checkbox (checked = ~30d persistent; unchecked = session cookie). Optionally shorten default 30d → 7d. *(small–medium, touches NextAuth session/cookie config)*

---

## Marketing & SEO

- [ ] **Feature landing pages** — deferred until PostHog traffic data (~2026-07-01).
- [ ] **Marketing blog** content build-out — CMS exists; expand published content. *(~16 hrs content)*

---

## Shipped (for reference)

- ✅ **Mobile nav menus** — hamburger menu on the shared MarketingNav + a dark one on the homepage hero; homepage hero made mobile-responsive; "Features" link → /features page (June 8, 2026)
- ✅ **Unified marketing chrome** — shared nav, footer, and brand-band page headers (banner images on Bookstore/Blog/News) across all marketing pages; dead-code cleanup (June 8, 2026)
- ✅ **Blog/News search & filter** + searchable/sortable admin list + category datalist (June 8, 2026)
- ✅ **Changelog, build stamp, monthly News recap routine** (June 8, 2026)
- ✅ **AuthorLoft News** Phase 1 — public /news archive, Blog/News CMS toggle, subscriber capture (no sending yet), sitemap (June 8, 2026)
- ✅ **Company Social Links** — Super Admin CRUD, shared marketing footer, bookstore hero (June 7, 2026)
- ✅ **Bookstore** discovery catalog with showcase sections, genre pages, SEO, branding (June 6, 2026)
- ✅ **Reader Feedback & Ratings** (book-level, moderated) (June 5, 2026)
