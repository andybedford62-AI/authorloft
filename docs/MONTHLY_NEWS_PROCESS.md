# Monthly "What's New" — News recap process

A simple, repeatable rhythm for publishing a monthly product recap on the public
News page (`/news`). Keeps customers informed and feeds the SEO/news archive.

## Cadence & ownership
- **When:** end of each month (or start of the next).
- **Where it goes:** Super Admin → **Blog & News** → New Post, Post Type = **News**,
  Category = **Product Updates**.
- **Source of truth:** `docs/CHANGELOG.md` — keep it updated as you ship, so the
  recap is a 10-minute summarize job, not archaeology.

> Note: the first recaps (May/June 2026) were seeded directly into the database.
> Going forward, **publish through the CMS editor** — it's the right tool now and
> handles slug, SEO fields, and the Blog/News toggle for you.

## Step-by-step
1. **Skim the month in `CHANGELOG.md`.** Pull out the items a *customer* cares about.
2. **Filter to author-facing wins.** Include: new features, branding/design options,
   SEO/discovery, selling tools, onboarding. **Exclude internal-only work**
   (analytics tracking, refactors, admin tooling, bug fixes) — it dilutes the message.
3. **Draft the post** in the CMS using the template below. 4–6 highlights is the
   sweet spot. Lead each with a benefit, not a feature name.
4. **Fill the fields:**
   - Title: `What's New at AuthorLoft — {Month} {Year}`
   - Slug: `whats-new-{month}-{year}` (e.g. `whats-new-july-2026`)
   - Category: `Product Updates`
   - Excerpt: 1–2 sentence teaser
   - SEO Title / Meta Description: keep ≤60 / ≤160 chars
   - Post Type: **News**
5. **Publish.** It appears at `/news/{slug}`, heads the archive, and lands in the
   sitemap automatically.
6. **(Later, Phase 2)** When email sending is built, the same recap becomes the
   monthly email to subscribers — see `docs/NEWSLETTER_PHASE2_PLAN.md`.

## Tone
- Warm, plain-English, author-benefit framed ("Your site looks better" not
  "Added accentColor field").
- Light emoji section headers are on-brand (see the May/June posts).
- Always end with a CTA to `/register` and a short "— The AuthorLoft Team" sign-off.

## Copy-paste content template (rich-text / HTML)
```html
<p>Here's what we shipped in {Month} to help you {one-line theme of the month}.</p>

<h2>🎯 {Benefit headline #1}</h2>
<p>{What it is + why an author cares. Link relevant pages, e.g. <a href="/bookstore">the Bookstore</a>.}</p>

<h2>✨ {Benefit headline #2}</h2>
<p>{…}</p>

<h2>🔧 {Benefit headline #3}</h2>
<p>{…}</p>

<h2>📣 Behind the scenes</h2>
<p>{Optional: one line bundling smaller polish/improvements.}</p>

<p>Thanks for building with us — more soon.</p>
<p><a href="/register">New here? Create your author site free →</a></p>
<p>— The AuthorLoft Team</p>
```

## Naming reference (so slugs stay consistent)
`whats-new-january-2026`, `whats-new-february-2026`, … one per month.
Category is always `Product Updates`; reserve `Announcements` for bigger one-off news
(launches, major features, events).
