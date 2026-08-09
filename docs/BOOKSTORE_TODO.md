# AuthorLoft Bookstore — Build Todo

**Status:** ✅ SHIPPED June 6, 2026 — live at `www.authorloft.com/bookstore`
**Full Plan:** `.claude/plans/authorloft-bookstore.md`
**Follow-ups:** tracked in `docs/FEATURE_BACKLOG.md`

> All build sections (1–8) complete, plus showcase extras (stat bar, author spotlight,
> New/Trending rows, genre landing pages, share buttons, JSON-LD/sitemap SEO, branding).
> Deviations from original plan: format filter uses real `availableFormats`
> (eBook/Paperback/Hardback/Audiobook); "Featured" sort replaced by a dedicated Premium
> ribbon; author name on cards is not a separate link (whole card links to the book);
> hero uses a CSS gradient instead of a bookshelf image. Content Import remains a future
> item (see backlog).

---

## Decisions Already Made

- STANDARD+ authors only (FREE sees locked/upgrade prompt)
- Per-book opt-in toggle: `Book.listInBookstore`
- No payments — links go only to author's own AuthorLoft site
- No external links (no Amazon/retailer links on bookstore page)
- Star ratings from approved BookFeedback shown on cards
- "NEW" badge for books released within 30 days
- Pagination — 24 books per page
- Search by title, author name, and genre
- Visual: warm library/bookshelf background, semi-transparent overlay, book covers are the hero

---

## Build Checklist

### 1. Database (30 min)
- [ ] Add `listInBookstore Boolean @default(false)` to `Book` model in `prisma/schema.prisma`
- [ ] Create `prisma/migrations/20260606_add_book_list_in_bookstore/migration.sql`
- [ ] Apply migration to Supabase via MCP

### 2. Public Bookstore Page (2 hrs)
- [ ] Create `src/app/(marketing)/bookstore/page.tsx` (server component)
- [ ] Query: books where `listInBookstore:true`, `isPublished:true`, author `isActive:true`, plan STANDARD+
- [ ] Include: author (slug, customDomain, displayName), genres, directSaleItems, approved BookFeedback ratings
- [ ] Compute `averageRating` + `ratingCount` per book server-side
- [ ] Aggregate unique genre names for filter chips
- [ ] Add `generateMetadata` for SEO
- [ ] Set `revalidate = 1800`

### 3. Bookstore Grid Component (4 hrs)
- [ ] Create `src/components/marketing/bookstore-grid.tsx` (client component)
- [ ] Combined search bar (title + author name + genre)
- [ ] Genre chips (multi-select)
- [ ] Format filter (All / eBook / Audio / Flipbook / Print)
- [ ] Price filter (All / Free / Under $5 / Under $10 / Under $20)
- [ ] Sort (Featured / Newest / A–Z / Highest Rated)
- [ ] Pagination — 24 per page, prev/next + page numbers
- [ ] Results count display ("Showing 24 of 142 books")
- [ ] Empty state with reset button

### 4. Book Card Component (3 hrs)
- [ ] Create `src/components/marketing/bookstore-book-card.tsx`
- [ ] Cover image (portrait 2:3 aspect ratio, placeholder if none)
- [ ] "NEW" amber badge (releaseDate within 30 days)
- [ ] Title + "by [Author]" (author name links to their homepage)
- [ ] Star rating display (hidden if no approved ratings yet)
- [ ] Format badges (eBook, Audio, Print, Flipbook)
- [ ] Price (lowest directSaleItem; "Free" if $0; "See Book" if retailer-only)
- [ ] "View Book →" button → author's own site book page only

### 5. Visual Styling (1 hr)
- [ ] Library/bookshelf background (warm CSS gradient or `/public/bookstore-bg.jpg`)
- [ ] Semi-transparent overlay (`bg-white/80` or `bg-amber-50/85`) so covers pop
- [ ] Warm amber/brown palette for headings and accents
- [ ] "AuthorLoft Bookstore" hero heading + tagline

### 6. Admin Toggle UI (1.5 hrs)
- [ ] Find book edit form/tab component
- [ ] Add "AuthorLoft Bookstore" section with `listInBookstore` toggle
- [ ] Show toggle only for STANDARD+ authors
- [ ] FREE plan: locked state with "Upgrade to Standard" prompt
- [ ] Update `src/app/api/admin/books/[id]/route.ts` to accept `listInBookstore` in PATCH

### 7. Navigation + Cleanup (1 hr)
- [ ] Add "Bookstore" link to marketing footer (`src/app/(marketing)/page.tsx`)
- [ ] Add "Bookstore" link to marketing header (find component)
- [ ] Update `docs/FEATURE_MATRIX.md` — add bookstore row
- [ ] Update memory: `project_bookstore_plan.md` → mark as complete

### 8. Deploy & Verify (1.5 hrs)
- [ ] Commit + push to dev
- [ ] Confirm staging build passes
- [ ] Test: opt-in a STANDARD book → appears in /bookstore
- [ ] Test: FREE book shows locked toggle
- [ ] Test: search by title, author, genre all work
- [ ] Test: "NEW" badge shows on recent books
- [ ] Test: star ratings show (requires approved BookFeedback records)
- [ ] Test: "View Book" links to author's own site — no external links
- [ ] Test: pagination works (24 per page)
- [ ] Test: unpublished / inactive author books do NOT appear
- [ ] Promote to production when happy

---

---

## Future: Content Import Tool (Placeholder)

**Status:** Discussion needed — not planned yet  
**Concept:** Allow authors to upload a CSV/Excel file to bulk-import books from their previous site  

- Phase 1: Books CSV import with downloadable template (~3 days)
- Phase 2: WordPress XML import for blog posts + books (~5 days, future)
- Columns to support: title, subtitle, description, cover image URL, ISBN, price, genres, series, release date
- Preview/confirmation step before import commits to DB
- Discuss: where are most incoming authors migrating FROM? (WordPress, Squarespace, Wix, fresh start?)

---

## Notes

- Genres are author-scoped in DB — collect unique genre *names* across all listed books for the filter chips (deduplicated, case-insensitive, sorted A–Z)
- `getAuthorBaseUrl(author)` in `src/lib/site-url.ts` handles custom domain vs subdomain URL construction
- `BookFeedback` (reader ratings) was built June 5, 2026 — approved records have `status: "APPROVED"`
- Author showcase pattern on marketing homepage (`src/app/(marketing)/page.tsx` lines ~119–144) is a useful reference for the server-side query pattern
