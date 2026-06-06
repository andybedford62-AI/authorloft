# AuthorLoft — Feature Backlog

Running list of ideas and enhancements to consider for future builds. Not committed work — a parking lot for "next features." Pull items from here when planning a session; move shipped items to the bottom (or delete).

**How to use:** add new ideas under the right area with a one-line rationale and a rough effort/impact note. Keep it scannable.

---

## Bookstore (`/bookstore`)

Shipped first version June 6, 2026 (discovery catalog, opt-in per book, STANDARD+). Follow-ups to consider:

- [ ] **Remove or keep the gold "Featured" ribbon** on Premium authors' books in the main catalog grid — decide if the subtle Premium perk stays. *(trivial)*
- [ ] **Match "Trending Now" to the gold band treatment** (currently plain style; auto-hidden until books have views). *(trivial)*
- [ ] **Author Spotlight curation** — currently auto-rotates daily among authors with a photo + bio. Options: super-admin hand-pick, or make it **Premium-only** as another upgrade incentive. *(small–medium)*
- [ ] **"Trending Now" needs view data** — relies on `Book.views`; confirm views are being tracked/incremented on author book pages so the row populates. *(verify)*
- [ ] **Reader accounts + favorites/wishlists** — let readers save books. Powerful but heavy (no reader auth today). *(large)*
- [ ] **Curated "Staff Picks" / collections** — super-admin curation UI for themed shelves. *(medium)*
- [ ] **"New books this week" email digest** — opt-in reader newsletter from the catalog. *(medium, needs job + template)*
- [ ] **Quick-view modal** — peek at a book without leaving the bookstore. *(small)*
- [ ] **Bookstore listing limits by tier** — e.g., STANDARD limited number of listings, PREMIUM unlimited + featured (pricing lever). *(small)*
- [ ] **Clickable author name on book cards** — currently the whole card links to the book (can't nest links); consider restructuring so the author name links to their site separately. *(small)*
- [ ] **Bookstore link in mobile nav** — the homepage hero nav is desktop-only (`hidden md:flex`), so the Bookstore link isn't visible on mobile there. Broader nav/mobile-menu consideration. *(small)*
- [ ] **Post-launch QA pass** — log in as a FREE author (confirm locked toggle) and approve a reader rating (confirm stars render on a card). *(verify)*
- [ ] **"See Book" price wording** — cards currently omit price when none is set; original plan suggested a "See Book" label for retailer-only titles. Decide if wanted. *(trivial)*

---

## Content Import (authors migrating in)

- [ ] **Books CSV import** with downloadable template (title, subtitle, description, cover URL, ISBN, price, genres, series, release date) + preview/confirm step. *(~3 days)* — see `docs/BOOKSTORE_TODO.md`
- [ ] **WordPress XML import** for blog posts + books. *(~5 days)*

---

## Auth / Account

- [ ] **"Remember me" checkbox on login** — checked = persistent (~30d, current default); unchecked = session cookie (log out on browser close). Optional: also shorten default session from 30d → 7d. *(small–medium, touches NextAuth)*. Deferred June 6, 2026 — current persistent login is working as intended; not a bug.

## Marketing & SEO

- [ ] **Feature landing pages** — deferred until PostHog traffic data (~2026-07-01).
- [ ] **Marketing blog** build-out — PlatformPost CMS already exists; expand content. (~16 hrs of content/work)

---

## Housekeeping / tech debt

- [ ] Update `docs/FEATURE_MATRIX.md` + memory to mark the Bookstore as shipped.
- [ ] (See `docs/BUGFIX_TODO.md` — all currently resolved as of June 6, 2026.)

---

## Shipped (for reference)

- ✅ **Bookstore** discovery catalog with showcase sections, genre pages, SEO, branding (June 6, 2026)
- ✅ **Reader Feedback & Ratings** (book-level, moderated) (June 5, 2026)
