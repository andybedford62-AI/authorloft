# Handoff: Fix Supabase Cached Egress overage (AuthorLoft)

> Paste this whole file into Claude Code at the start of the session, or save it as
> `docs/supabase-egress-handoff.md` in the repo and say: "Read docs/supabase-egress-handoff.md and follow it."
>
> Follow CLAUDE.md as usual: verify before changing anything, confirm before each step,
> push to `dev` and test on staging, and confirm before promoting to prod.

## Context (investigated Oct 24–25, 2026)

- Supabase project: **BookStage Project** (`fweccazwdlrdbcrdbbev`), Free plan, which is AuthorLoft's backend.
- Repo: `andybedford62-AI/authorloft`, branch `dev`. Vercel project: `abedford-repo` (authorloft.com).
- Usage email: **Cached egress 6.42 GB of 5.5 GB**.
- **Supabase is already blocking image reads.** Storage requests have returned **HTTP 402** since
  about 2026-10-24 22:12 UTC, so public images on authorloft.com are probably broken until this is fixed.
  This was the planned risk recorded in `docs/FEATURE_BACKLOG.md` → "Supabase Pro upgrade decision".
  **Andy needs to decide (in the dashboard): upgrade to Pro now, or wait for the cycle reset.**
  Steps 2–4 below need working downloads, so they're blocked until reads succeed.

## Root cause (from the edge logs, last ~24 h)

- **Facebook's link-preview crawler** (`facebookexternalhit`) made 159 requests for about **175 MB**,
  roughly 80% of all storage egress.
- Most of it is one file: `book-covers/seo/og-home-1787314825357.png` (**2.3 MB**, `no-cache`),
  the homepage share image (`SeoConfig.id = 'home'`). It was fetched 58 times.
- The rest of the `SeoConfig` share images are also legacy PNGs of 500 KB to 1.2 MB, almost all `no-cache`.
- Across all public buckets, **271 legacy PNG/JPEG files (about 250 MB) are not on a 1-year cache**,
  and 150 of them are over 500 KB.

## What already exists (don't rebuild it)

- `src/lib/image-processing.ts` → `optimizeImageForWeb()` (sharp: resize + WebP) has been live since
  **Sep 10, 2026** (commit `ed70c569`). All 12 image upload routes call it with `ONE_YEAR_CACHE`.
  **New uploads are already compressed.** The problem is the files uploaded before Sep 10.
- The SEO and social upload routes use `convertFormat: false` on purpose: share images stay PNG or JPEG
  for social crawlers. The SEO route caps the size at 2400 px, which is still large for a share image.
- `docs/FEATURE_BACKLOG.md` → "Infrastructure & Costs" already has the backlog items
  "Re-save the legacy covers" and "Move public images off Supabase Storage (conditional)".

## Plan (confirm with Andy before each step)

### Step 1: Code change (small; can be done now, even while blocked)
In `src/app/api/super-admin/seo/[page]/upload/route.ts`, make share images social-sized:
resize to fit **1200×630**, encode as **JPEG at quality ~80** (mozjpeg), keep `ONE_YEAR_CACHE`.
Target: under 200 KB. Facebook, X and LinkedIn all accept JPEG.
Apply the same idea to author share images (`Author.socialShareImageUrl`, set from the branding form)
if they go through a route with a large `maxDimension`. Check first.
Push to `dev`, test on staging, and confirm before prod.

### Step 2: Re-save the legacy share images (highest impact; needs reads working)
For each `SeoConfig` row whose image is over 200 KB or `no-cache`:
1. Download the original (it stays in place, untouched. **Andy wants originals kept.**)
2. Make a 1200×630 JPEG, about 80 quality.
3. Upload it to a **new path** (e.g. `seo/og-<page>-<timestamp>.jpg`) with `cache-control: max-age=31536000`.
   Never overwrite the old path.
4. Update `SeoConfig.ogImageUrl` to the new URL.
5. Afterwards, re-scrape the homepage in the Facebook Sharing Debugger so Facebook picks up the new image.

### Step 3: Re-save the legacy covers and other public images (needs reads working)
Write a one-off script (e.g. `scripts/resave-legacy-images.mjs`, run locally with the service role key)
that reuses `optimizeImageForWeb()` settings:
- Scope: public buckets (`book-covers`, `book-previews`, `specials`, `flip-book-covers`, `author-assets`),
  PNG and JPEG files that are not already on `max-age=31536000`.
- For each file: download it, convert to WebP (max 2000 px; covers could go to 1200–1600 px), and upload as a
  **new object next to the original** (same name, `.webp`) with a 1-year cache. **Keep the originals.**
- Exclude share images (handled in Step 2) and anything a third-party API needs as PNG or JPEG
  (social post media). Check `SocialPost.mediaUrl` usage before including it.
- **Dry-run mode first:** list the files, show the before and after sizes for 5 samples, and get approval.

### Step 4: Point the database at the new files (writes to production tables)
1. **Back up first:** create a backup table of every (table, id, column, old_url) that will change, or export it to CSV.
2. Update the URL columns that reference converted files. Columns found:
   `Book.coverImageUrl`, `Author.profileImageUrl / heroImageUrl / logoUrl / socialShareImageUrl`,
   `Bundle.coverImageUrl`, `Course.coverImageUrl`, `CourseLesson.thumbnailUrl`, `FlipBook.coverImageUrl`
   (+ `coverImageKey`), `Guide.coverImageUrl`, `Post.coverImageUrl`, `PlatformPost.coverImageUrl`,
   `PlatformResource.logoUrl`, `PlatformSettings.marketingHeroImageUrl`, `ResourceDownload.coverImageUrl`,
   `Series.coverUrl`, `Special.imageUrl`, `Testimonial.image`, `BookPreviewMedia.thumbnailUrl`
   (+ `thumbnailFileKey`).
   **Also check for image URLs embedded in rich-text HTML** (blog and post bodies from the TipTap editor),
   since a column-only rewrite would miss them.
3. Only rewrite a URL if its WebP copy exists. Spot-check pages on staging and prod afterwards.
4. Rollback = restore from the backup table.

### Step 5: Watch, then decide
- Watch Supabase → Usage → Cached Egress for about a week.
- If it's still high, do the backlog item "Move public images off Supabase Storage" (Cloudflare R2 preferred).
- Optional: convert the remaining raw `<img>` uses on public pages to `next/image`
  (most remaining raw `<img>` uses are admin screens, which are low priority).

## Decisions still needed from Andy
1. Upgrade to Supabase Pro now (lifts the 402 block immediately; can downgrade after the reset), or wait?
2. OK to run Steps 2–4 in that order, with a dry run and a URL backup before any writes?
3. Is a 1200 px max width OK for book covers (vs the current 2000 px)?

## Verification queries (Supabase MCP)
- Status of storage requests: `edge_logs`, grouped by `response.status_code` where the path is like `/storage/v1/%`.
- Top files by bytes served: `edge_logs`, sum of `response.headers.content_length` grouped by `request.path`.
- Legacy files left: `storage.objects` where the mimetype is PNG or JPEG and `cacheControl` is not `max-age=31536000`.
