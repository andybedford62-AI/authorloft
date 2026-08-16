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

## August 16, 2026 — Homepage copy + structure pass: consolidated redundant sections, honest founder-note treatment

Follow-up to the marketing-site audit below: reviewed the homepage as a UX/conversion pass and made two structural changes plus a copy rewrite.

- **Consolidated three sections making the same point into one.** Problem Strip (3 pain-point cards), Pillars ("One platform. Everything you own."), and the old-vs-new Comparison table were three separate sections in a row all restating the same "you don't own your readers/revenue today, you will with us" claim before any proof appeared. Merged into one `WhatChangesSection` — a single before/after table with three concrete rows (who gets paid, who owns your readers, how many tabs you need open) that folds in the strongest lines from all three.
- **Replaced the showcase/testimonial grid with a founder-note treatment.** After the audit removed the two seed-account testimonials, the "Real sites. Real authors." showcase grid and testimonial carousel were both rendering exactly one card in a layout built for several (the showcase eyebrow literally read "1 live author site"). Built a new `FounderNoteSection` — a single intentional block, sourced from Anthony's existing (unedited) DB testimonial and showcase entry, so it's honest about being early instead of a sparse-looking grid. Left `AuthorShowcaseSection`/`MidnightTestimonialsSection` components untouched (only unused on the homepage now) with a code comment to swap back once there are 2+ real independent customer testimonials. Andy later rewrote the founder-note testimonial himself with a more personal founder-story version — live immediately since the section reads straight from the DB.
- **Added a product-screenshot section** (`ProductPreviewSection`) — real screenshots (Andy's actual dashboard, theme picker, and his live author site), not mockups, sourced by having him upload them via the blog editor's cover-image field and pulling the resulting Supabase storage URLs. Placed between the "what changes" section and the founder note: rational case → visual proof it's a real product → proof a real person uses it daily.
- **Copy pass for a warmer, more direct voice**: hero headline/subheadline (`PlatformSettings`), hero primary CTA ("Start your business" → "Start free"), and the footer CTA. Also fixed a leftover "own everything you build — books, courses, or both" line in the footer CTA that had survived the earlier author-only positioning decision.

**Follow-up (same day) — de-AI'd the homepage copy.** Ran the actual copy through a structured audit and found a real pattern cluster: every section heading used the identical "Short fragment. Short fragment." template five times in a row down the page ("You wrote the book. They keep the reader." / "Not a mockup. This is the actual product." / "Grow your readership. Keep every reader." / "Start free. Scale when you're ready."), plus em dashes on nearly every subheading, the same "no X, no Y" tailing-negation construction reused three times, and "your X, your Y, your Z" anaphora repeated across four different spots. Rewrote the hero subheadline, `WhatChangesSection` copy, `ProductPreviewSection` heading/captions, the newsletter section, the pricing intro, the footer CTA, and the founding-offer fallback copy (`founding-offer.ts`) to vary sentence rhythm and cut the repeated constructions, without touching Anthony's own founder-note quote (his real words, left as-is) or the visual system (fonts/rounded corners/centered headers are a bigger site-wide decision, not folded into this pass).

## August 16, 2026 — Marketing-site audit: fixed pricing/feature contradictions, ToS typo, founder testimonial disclosure

Ran a manual audit of the homepage, pricing, features, and bookstore pages and fixed the confirmed issues:

- **Stale $79.99 Premium price** — the real price is $59.99/mo (confirmed against the live `Plan` table), but `$79.99` was still hardcoded in the pricing page's meta/OG/Twitter descriptions, the features page's JSON-LD `Offer`, four FAQ answers in `landing-page-data.tsx`, `llms-full.txt`, and the welcome-email default template (`welcome-email-panel.tsx` + `mailer.ts`, which also wrongly said "Unlimited books" under the Standard plan instead of Premium). All now read $59.99 for Premium, and the welcome-email template correctly attributes unlimited books to Premium and "up to 20" to Standard.
- **Standard book-limit fallback mismatch** — `pricing/page.tsx`'s comparison table used a dormant fallback of 25 vs. the features page's 20; corrected to 20 to match the live plan limit and the features page.
- **Reader Analytics row always showed ✓ for every tier**, contradicting the FAQ ("Standard and Premium only, not Free"). Traced this to the underlying `Plan.analyticsEnabled` flag being inverted in the DB (FREE=true, STANDARD=false) — corrected to FREE=false/STANDARD=true/PREMIUM=true, and made the Features page row conditional on it like every other differentiated row.
- **Terms of Service misspelled "ArthorLoft"** (10 occurrences) in the DB-stored `PlatformSettings.termsContent` — corrected via direct update.
- **Founder testimonial not visually disclosed** — Anthony Bedford's testimonial ("I am the Owner of AuthorLoft") discloses this in the quote body but sat identically styled to two other "real author" testimonials. His `authorRole` byline (rendered directly under his name in the carousel) now reads "Thriller Author · AuthorLoft Founder" so it's visible without reading the full quote.
- **Split books/courses positioning** — the homepage H1 and hero subheadline (DB-stored in `PlatformSettings`) pitched "Your Books. Your Courses. Your Career." while every other page (title/meta, footer, testimonials, bookstore) was 100% author-focused with no course-creator proof. Per decision, committed the whole homepage to the author-only framing: updated the hero headline/subheadline to match, and removed the unsupported "For Course Creators" pain/solution card from the rotating hero carousel (`rebrand-hero.tsx`).

**Follow-up (same day) — deeper pass found two more serious issues:**

- **A "real author" showcase card and testimonial were demo/seed content.** The `Author` record behind "Victoria Chase — NYT Bestselling Author" had id `demo_author_victoria`, email `demo@authorloft.com`, and a fabricated bestseller bio — it's the platform's own `demo.authorloft.com` template account, not a customer, but had `showInShowcase: true` and a matching `Testimonial` row, so it sat in the "Real sites. Real authors." section indistinguishable from genuine customers. Set `showInShowcase = false` and deactivated the testimonial. (Combined with the founder-testimonial finding above, only one of the original three homepage "real author" proof points — Tina Williams — was an unaffiliated, verifiable customer; now the showcase only shows real ones.)
- **Direct sales were actually charged a 10% platform fee, contradicting "Zero platform fees" / "you keep 100%" claims sitewide.** `checkout/route.ts` computed `application_fee_amount` from `PLATFORM_FEE_PERCENT`, defaulting to `"10"` when unset — a real, live Stripe Connect fee on every book/course sale, not a copy bug. Confirmed with Andy that 0% is the intended model; changed the default to `"0"` in both checkout code paths and updated `scripts/required-env.json`'s description accordingly. **Note:** if `PLATFORM_FEE_PERCENT` is explicitly set to a nonzero value in Vercel's environment variables (as opposed to relying on the code default), that override still needs to be cleared/zeroed in the dashboard for this to take effect in production — not something checkable or fixable from a code change alone.
- Also fixed while in the FAQ data: a badly-punctuated question ("Is AuthorLoft Free" → "Is AuthorLoft free?"), an awkwardly-worded AI-ethics question, a stale "up to 25 books" Standard-plan answer (→ 20) with typos ("upto", "tarting"), a leftover placeholder-style "*limitation may apply*" note, a "delete your plan, or e can do that" typo, and a missing excerpt on the "SEO vs. GEO vs. AEO" blog post.
- **"No 'powered by' badges" claim didn't match the product** — `author-site/footer.tsx` rendered a "Powered by AuthorLoft" badge unconditionally on every site regardless of plan. Per decision, gated it: now shown only on Free-plan sites, removed on Standard/Premium (`showPoweredBy` derived from `plan.tier`). Reworded the Features-page claim to describe this correctly and added an explicit "Powered by AuthorLoft" Footer Badge row to the feature-comparison table so the claim is directly checkable.

**Second follow-up (same day) — verification pass turned up a third seed account in the "real authors" proof:**

- **"Tina Williams" was also a seed/test account, not a real customer.** Her `Author` record uses `andybedford62+tw@gmail.com` — a Gmail alias of the founder's own address, and the only other account in the database tied to that address besides `apbedford`. Confirmed with Andy this is a seed account, not a real author. Set `showInShowcase = false` and deactivated her testimonial, same treatment as Victoria Chase. **Net effect: the homepage "Real sites. Real authors." section and testimonial carousel now show only Anthony Bedford (the disclosed founder) — there is currently no independent, third-party social proof on the homepage.** Getting real customer testimonials/showcase sites is now a real (non-copy) gap worth prioritizing separately.
- Confirmed via Vercel deployment history that production (`authorloft.com`) is still serving the pre-audit commit (`83c6e84`) — none of this session's code fixes (pricing/feature-matrix text, footer badge gating, the checkout platform-fee default) are live yet, only the direct DB writes (testimonials, showcase, ToS, FAQ, hero copy) are, since those apply immediately regardless of deploy state. **The checkout code still defaults to charging a 10% fee in production right now** until the `dev` branch is promoted (or Vercel's `PLATFORM_FEE_PERCENT` is confirmed/set to 0 directly).
- Read `/compare/[bookfunnel|storyorigin|tertulia|quilltips]` source (`src/lib/comparison-data.tsx`) directly — no sourcing, dates, or citations on any competitor claim (worse than the pricing-page table, which at least has an "as of June 2026" line), though the comparisons are less one-sided than that table (each competitor gets several honest "them: yes" rows for their real specialty). Flagged, not changed — verifying competitor claims (e.g. "Quilltips Plus at $4.99/mo") requires external fetches this session's egress policy blocks.
- Confirmed production caught up: Andy promoted `dev` to prod (deploy `dpl_HisABUJmT1Zny8PWdmirgHcvfAS8`, commit `2ab341a`) and added `PLATFORM_FEE_PERCENT=0` to Vercel — checkout fee is now genuinely 0% live, not just in code.

**Third follow-up (same day) — backlink audit of blog/news/guide content:**

Extracted every `href` from `PlatformPost` (blog + news), `Guide`, and `HomepageFaq` content via SQL and cross-referenced internal links against real slugs/routes. All `/guides/...` and `/blog/...` links (relative and absolute) check out clean. One real broken backlink found: `Guide.relatedSlugsJson` for `what-is-an-author-affiliate-program` referenced a nonexistent slug `book-affiliate-programs-let-fans-sell` — the related-posts query silently drops unmatched slugs (no dead link rendered, just one missing "related article" card), so low severity, but corrected to the actual post `set-up-an-affiliate-program-for-your-books`.

Also surfaced a cluster of low-quality external links concentrated in the same content already flagged as AI-generated filler (the Nook FAQ / blog post): a Bing *search-results* URL used in place of a direct link, and three domains written with unusual capitalization + `http://` instead of `https://` (`WordPress.org`, `Schema.org`, `Send.j.se`) — `Send.j.se` in particular reads as a possibly fabricated/unreliable citation. Reachability can't be verified from this session (outbound web access is blocked entirely), so left the three "check these yourself" links (`Send.j.se`, the Barnes & Noble help-center deep link, the Amazon help-center deep link — all in the Nook blog post + its duplicate FAQ answer) for Andy to verify in a browser. Fixed everything not requiring live verification: `author-needs-a-website-in-2026`'s `WordPress.org` link → `https://wordpress.org` (and its own `http://www.authorloft.com` link → `https://www.authorloft.com`), `author-website-seo-quick-wins`'s `Schema.org` link → `https://schema.org`, and the Bing-search-results link in `how-to-download-an-epub-file-and-upload-it-to-your-kindle` replaced with a direct link to `https://www.amazon.com/sendtokindle`.

## August 11, 2026 — Discount codes now work on Bundles and Courses (and a real bundle-checkout bug fix)

Extended `DiscountCode` past books: new `DiscountCodeBundle`/`DiscountCodeCourse` join tables mirror the existing `DiscountCodeBook` pattern (empty list = applies to all of that type — same semantics as books, so every existing code now also applies to all of an author's bundles/courses by default). `/admin/discount-codes` gained bundle/course checkbox sections alongside the book one, and the list table's "Books" column became a single "Applies to" summary across all three.

**Bug fix in the same pass:** bundle checkout already accepted a `discountCode` and resolved it, but then silently discarded the result — `itemDiscount` was hardcoded to `0` and the charged total came straight from the bundle's list price, so a discount code could be "applied" with zero effect and no error. Fixed in `src/app/api/checkout/route.ts`. Course checkout had no discount-code handling at all before this (net-new). Both webhook blocks (`bundle_purchase`, `course_purchase`) now increment `DiscountCode.usesCount` on completion, matching `book_purchase`; the bundle buyer-confirmation email now shows the real discount instead of a hardcoded `$0`, and the course purchase emails (buyer + author) now reflect the actual charged price instead of always showing the course's sticker price.

New shared `DiscountCodeInput` component (`src/components/author-site/discount-code-input.tsx`) replaces duplicated code-entry logic in `buy-section.tsx`/`cart-drawer.tsx` and is now also wired into the bundle and course buy buttons.

**Follow-up (same day):** Andy reviewed and flagged the admin create/edit form and list table as not intuitive — adding bundle/course support had stacked three near-identical "restrict to specific X" checkbox lists on top of each other, and the table's "Applies to" column had become a comma-joined sentence. Redesigned `/admin/discount-codes`: the create form is now a 3-step wizard (Basics → Applies to → Review & create) using a new shared `WizardSteps` component (extracted from the existing CSV import wizards' step-indicator pattern, now used a 3rd time); the three checkbox lists were replaced everywhere (create + edit modal) by one shared `DiscountScopePicker` — a clear "Applies to everything" vs. "Restrict to specific items" choice, with book/bundle/course tabs only appearing once restricting is chosen. The list table's "Applies to" column now renders scannable pills (a single green "Everything" pill when unrestricted, or just the restricted-type pills otherwise) instead of a text sentence. Added plain-language intro copy and two new step-level `HelpTip` tooltips (`discount-codes-basics`, `discount-codes-applies-to`).

Promoted to production August 11, 2026 (same day).

## August 10, 2026 — Media Kit merged into the About page as a tab

Andy asked to move Media Kit off its own nav item and onto the About page as a tab, following the same pattern as the earlier Books/Bundles merge. `MediaKitContent` extracted from the old standalone `/media-kit` page (unchanged markup, just parameterized instead of reading `author` directly); `AboutMediaKitTabs` is a new client tab switcher (mirrors `BooksBundlesTabs`) that renders About plainly with no tab UI when Media Kit isn't available — same "no dead tab" rule as Bundles. `/about` now accepts `?tab=media-kit` for deep-linking; `/media-kit` redirects there instead of rendering its own page. Gating unchanged: still requires `mediaKitEnabled` (plan) *and* `navShowMediaKit` (owner's toggle), just gating a tab now instead of a nav link. Updated the admin nav-settings description, the "Your Site Pages" card (`site-pages.ts`), and the admin Media Kit editor's "View public page" link to point at the new location.

**Also fixed while in the area:** the footer's "Bundles" quick link was never cleaned up when Bundles moved into Books tabs during the earlier merge — `nav.tsx` (main nav) had the link fully removed, but `footer.tsx` still pushed a `Bundles` entry pointing at the old `/bundles` URL (harmless since that still redirects, but inconsistent with the main nav). Removed it from the footer too, and made sure Media Kit's footer entry was removed the same way from the start rather than repeating the gap.

## August 10, 2026 — Reuse a prior newsletter instead of rebuilding from scratch

Andy asked whether authors have to fully regenerate a newsletter every time — checked the composer and confirmed yes: `subject`/`htmlBody`/category targeting/block toggles all start blank every session, and `Campaign` only ever persisted the subject and delivery counts, not the actual content. Added `Campaign.body`/`categoryFilter`/`includeBooks`/`includeReview`/`specialId` (persisted on send) and a **Reuse** button on each History tab row that loads that exact past campaign back into the composer as an editable starting point. Campaigns sent before this shipped show `—` instead of a broken Reuse link, since they have nothing saved to load. Chose this over a separate named-template system since most authors reusing a newsletter are really just tweaking last month's version, not switching between distinct saved layouts.

**Follow-up fix (same day):** Andy verified on staging and reported the newest send still showed `—` instead of Reuse. Root cause: the History tab's local `campaigns` state is seeded once via `useState(initialCampaigns)` and never resyncs when `router.refresh()` re-fetches the server component, so the post-send optimistic row — which only carried `subject`/`sentAt`/delivery counts — stuck around all session with no `body`, even though the DB row was saved correctly. Fixed by including `body`/`categoryFilter`/`includeBooks`/`includeReview`/`specialId` in the optimistic entry too, sourced from the same compose-form state that was just sent.

## August 10, 2026 — Codebase-wide email-bombing audit, 3 more routes fixed

Andy asked for a full review of every email-sending path for DoS/email-bombing risk after the newsletter cooldown fix. Traced all 22 exported `mailer.ts` functions to their callers. Cron- and Stripe-webhook-triggered emails aren't attacker-triggerable (webhook requires a valid signature, cron isn't request-driven). Several public routes already rate-limited correctly **by email** (`orders/resend`, `courses/resend-access`, `auth/resend-verification-public`) — bypass-proof against IP rotation by design.

Found and fixed 3 that weren't: **`auth/forgot-password`** (rate-limited by IP only — a rotating-IP attacker could bomb one victim's inbox with password-reset emails, the most sensitive case since it's alarming and phishing-adjacent), **`downloads/unlock`** (same IP-only gap), and **`author/reader-magnet`** (keyed by `${ip}:${email}`, which looks per-email but isn't — a new IP resets the counter for the same target). All three now have an email-keyed cooldown (5 min) independent of IP: `Author.passwordResetLastSentAt` (new column) for forgot-password, and the existing `DownloadLead`/`BookMagnetLead` tables (already logging every attempt) reused for the other two rather than adding new columns. `forgot-password`'s response stays identical either way, preserving the existing anti-enumeration behavior.

## August 10, 2026 — Resend cooldown on both double opt-in confirmation emails

Andy flagged a real gap: confirmed subscribers already got "already subscribed" silently (no repeat email), but an *unconfirmed* email had no such protection — every resubmission (the same person retrying, or someone else entering that address maliciously) regenerated a token and fired a fresh confirmation email, with only a coarse 10-req/hour-per-IP rate limiter behind it. Added `PlatformSubscriber.lastConfirmationSentAt` / `Subscriber.lastConfirmationSentAt` and a 5-minute resend cooldown to both `/api/news/subscribe` and `/api/newsletter/subscribe` — within the cooldown window, the record still updates (name/prefs) but no email goes out.

## August 10, 2026 — Author-site newsletter signups now double opt-in too

Follow-up to the same-day AuthorLoft News double opt-in: Andy asked whether author-level newsletter signups (each author's own `Subscriber` list, via the `NewsletterModal` on author sites) needed the same treatment. Checked first — every author's newsletter send goes out from the same shared `noreply@authorloft.com` address (just a different display name per author), so an unconfirmed/dirty list on one author's site risks deliverability for every other author on the platform, not just that one. `POST /api/newsletter/subscribe` now issues a `confirmToken` and sends an author-branded confirmation email (`sendAuthorNewsletterConfirmationEmail`, from `"${authorName} via AuthorLoft"` to match what the real newsletter will look like later) instead of auto-setting `isConfirmed: true`; new `GET /api/newsletter/confirm` flips it and links back to the author's own site. The newsletter send route already filtered `isConfirmed: true` before this — it was just always true, so this is a real behavioral change, not cosmetic. Deliberately scoped to the direct opt-in modal only: purchase-triggered and reader-magnet `Subscriber` captures stay auto-confirmed since those already carry implicit verification (a paid transaction, or a click-to-download link).

## August 10, 2026 — Backlog Tier 2 batch: dashboard catalog tabs, double opt-in, unified bookstore, newsletter analytics, course ratings

Five items from the ranked backlog pass, done in order, staged together (not pushed to prod individually):

- **Admin dashboard: Courses/Bundles alongside Books** — `CatalogTabsCard` (`src/components/admin/catalog-tabs-card.tsx`), a Books | Courses | Bundles tab switcher controlling the whole content area (stat count in the tab label + list below), replacing an earlier same-day attempt that stacked three separate panels — reworked after feedback that stacking read as mixed together rather than distinct. Courses/Bundles tabs only appear when the plan enables them.
- **AuthorLoft News double opt-in** — `POST /api/news/subscribe` now sends a confirmation email (`sendNewsSubscriptionConfirmationEmail`); new `GET /api/news/confirm` flips `PlatformSubscriber.isConfirmed`. Also unblocks the existing "email subscribers on News post publish" feature, which filters `isConfirmed: true` and had nothing to send to since it shipped.
- **Bookstore: unified Books/Courses tabs** — `BookstoreCatalogTabs` wraps the existing `BookstoreGrid`/`BookstoreCourseGrid` under one Books | Courses type switcher; each keeps its own facet filters (genre/format/price for books, category for courses).
- **Newsletter open/click analytics** — new `CampaignSendLog` table (one row per successfully-sent recipient, keyed by Resend's email id) populated via a new `POST /api/webhooks/resend` consuming Resend's native `email.opened`/`email.clicked` webhooks (Svix-signed, verified manually via `crypto` rather than adding the `svix` package). History tab gained Opened/Clicked columns. Requires manual Resend dashboard setup — enable Open+Click Tracking on the sending domain, subscribe a webhook to those two events, set `RESEND_WEBHOOK_SECRET` — before it records anything; sending itself is unaffected either way.
- **Course ratings** — new `CourseFeedback` model (reuses `BookFeedbackStatus`), public submission route, admin moderation merged into the existing `/admin/feedback` page (now shows books and courses in one queue), "What Students Are Saying" + a rating form on the course detail page, and star display on bookstore course cards once a course has at least one approved rating.

## August 9, 2026 — Bundle purchases now capture the buyer as a subscriber

`bundle_purchase` Stripe webhook block never upserted a `Subscriber` for the buyer, unlike `book_purchase` and `course_purchase` — flagged during today's backlog verification pass. Fixed by mirroring the existing pattern (`src/app/api/stripe/webhook/route.ts`); also had to add `author.id` to the `fullItems` select, which the existing bundle query was missing.

## August 9, 2026 — `main`/`dev` sync (PR #138) confirms months of backlog already live in prod

Audit triggered by "did Course Creator actually make it to prod?" turned up a much bigger finding: `main` had drifted 26 commits behind `dev` (stale scaffolding, one real fix already present in `dev`), so `main` no longer reflected reality. Vercel's **Production** environment tracks `main` (confirmed in Settings → Environments), while `dev`-branch builds have been getting to production the whole time via manual **Promote to Production** in the Vercel dashboard — a legitimate, intentional part of the documented dev → staging → prod workflow, not a misconfiguration. The result: production has actually been current with `dev` all along, but `main` itself (and this changelog) didn't reflect it.

- Merged `dev` into `main` via [PR #138](https://github.com/andybedford62-AI/authorloft/pull/138) (merge commit `1f479768`) instead of a force-push, so no history was rewritten.
- Verified via Vercel deployment history: the current production deployment is built from that exact merge commit, and prior `dev` commits going back months all show `action: "promote"` to production.
- **Consequence:** every changelog entry previously marked "not yet promoted to prod" (18 entries, June 14 – Aug 8) is now confirmed live in production, including all of the Course Creator work (CSV import, categories, onboarding fork, FREE-tier enablement, bookstore listing) and self-serve custom domains. Tags updated below to reflect this.

## August 9, 2026 — Founding Member designation

Manual (non-metric) status for early authors, distinct from the existing achievement-badge system (`BadgeDefinition`, auto-calculated from books/revenue/reviews thresholds) — this is Super-Admin-awarded, not earned.

- Schema: `Author.isFoundingMember` (boolean) + `Author.foundingMemberSince` (timestamp, set/cleared automatically when the flag toggles).
- **Super Admin → All Authors** — star icon in the row actions toggles status instantly; a gold "Founding" pill shows next to the author's name when active.
- **Super Admin → author detail → Account Flags** — same toggle, instant PATCH (no Save needed), matching the existing `hideNextStepsChecklist` pattern.
- **Public badge** — gold "Founding Member" pill on the author's own About page (`/about`), shown near their name/tagline, separate from the achievements row.
- **Dashboard badge** — small gold pill under "Your Site" in the author's own admin sidebar.
- Also added the 6-email onboarding sequence (Day 0/1/3A/3B/7/14) as `BroadcastTemplate` rows, selectable from Super Admin → Mass Email.
- Showcase/directory page for founding members held for later — this ships the flag + both badges only.

## August 8, 2026 — Self-serve custom domains (bring your own)

Repo audit found `Author.customDomain` and hostname-based routing already existed, but the only way to actually set it was a super-admin manually editing the field *and* separately adding the domain in the Vercel dashboard by hand — no author-facing UI, no Vercel API integration, no verification flow. Built the missing half:

- **`src/lib/vercel-domains.ts`** — thin client over Vercel's Domains API (`addDomain`, `getDomainStatus`, `removeDomain`), scoped to `VERCEL_PROJECT_ID` (+ optional `VERCEL_TEAM_ID`).
- **`/api/admin/settings/custom-domain`** (GET/POST/DELETE) — plan-gated (Standard/Premium, via the existing `canUseFeature`), rate-limited, validates domain format, registers with Vercel, and stores status (`PENDING`/`VERIFIED`/`ERROR`) + the DNS record to show. A `?refresh=1` GET re-polls Vercel for both ownership verification and live DNS configuration.
- **Admin → Settings → Custom Domain card** — self-serve: type a domain, get the exact DNS record to add, check status on demand, and **unlink** at any time — unlinking just clears `Author.customDomain`, which every author-lookup query and the routing middleware already fall back to `slug` for, so reverting to the subdomain needed no extra code.
- Schema: added `customDomainStatus`, `customDomainVerification` (cached DNS records), `customDomainAddedAt` to `Author`.
- Scope: bring-your-own-domain only — no domain purchasing/registrar integration (author still buys the domain themselves elsewhere, e.g. Namecheap/GoDaddy).
- `VERCEL_API_TOKEN`, `VERCEL_PROJECT_ID`, and `VERCEL_TEAM_ID` (this project is team-scoped) are all configured in Vercel across Production, Preview, and Development — confirmed via build `[required-env]` logs rather than ever viewing the values directly. Took three rounds to get right: the token/project ID landed first, then team ID was set on Production only (missed on Preview, which is what staging actually runs), then corrected.
- **Verified working on staging** — linked a real test domain (`test-example-checkme.com`) through the live UI: came back "Pending DNS" with the correct DNS record (A → `76.76.21.21` for an apex domain), confirming the Vercel API round-trip actually works, not just that the UI renders.
- **Promoted to prod Aug 9, 2026** — confirmed live via the `main`/`dev` sync (PR #138) and current production deployment.

## August 8, 2026 — Security hardening sweep + branch cleanup

Repo audit surfaced a security-fix branch (`claude/authorloft-project-access-v6ufnd`, May 2026) that never got merged. Its diff was 3 months stale against current `dev` — a raw merge would have reverted since-added features (pre-order fields, bookstore listing limits, www-canonicalization/sitemap routing in `proxy.ts`). Re-applied the still-relevant fixes by hand instead of merging:

- **Stored XSS** — author media-kit "Press Biography" was rendered via `dangerouslySetInnerHTML` with zero sanitization; now runs through `sanitize()` like every other rich-text field in the app.
- **SSRF** — media-kit image download proxy checked `url.startsWith(allowedOrigin)`, which a lookalike host (`https://<ref>.supabase.co.evil.com`) can pass; now compares full parsed `URL.origin`.
- **Abuse/spam hardening** — added rate limiting + input validation (length caps, email/discount-code format checks) to `/api/auth/request-access` and `/api/checkout/validate-discount` (previously unlimited, discount codes were brute-forceable); added length caps to `/api/marketing/contact` and `/api/newsletter/subscribe`.
- **DoS** — `proxy.ts` now rejects JSON bodies over 2MB before they reach route handlers.
- Also audited: `feature/arc-management` (May 2026, unmerged) turned out to be an abandoned early prototype of ARC — the feature actually shipped later through a different, more complete implementation already live on `dev`/staging (see May 20 entry below), but had never been promoted to prod. Promoted today — ARC is now live in production. Branch deleted as obsolete. Pruned 20 other stale branches (mix of already-merged session branches and one deliberately-abandoned rebrand attempt) to get every branch back in sync with `dev`.

## August 8, 2026 — Author-site nav: Login for visitors, Join moved to footer

The top nav's "Join AuthorLoft" CTA only made sense for logged-out marketing traffic, but it showed to any non-owner — including the author themselves before they'd logged in, with no way to reach their own site's admin without going through the main authorloft.com landing page first. Swapped it: nav now shows a **Login** link (→ platform `/login`) whenever nobody's signed in; "Join AuthorLoft" moved to the footer's brand column instead, next to the AuthorLoft.com logo/description where it's a better fit as a passive CTA rather than a nav-level action.

## August 7, 2026 — Course CSV bulk import (Phase 1, admin only)

One-row-per-lesson CSV import at `/admin/courses/import`, mirroring the Books importer's shape (papaparse, alias-based column auto-detect, downloadable template):

- `src/lib/csv-import-courses.ts` — field defs, alias detection, and `groupRowsIntoCourses()` (flat lesson rows → nested Course → Module → Lesson tree, since a course is a 3-level structure unlike a flat book row).
- `CourseImportWizard` — same 4-step upload/map/preview/results flow as books, with a nested tree preview instead of a flat table.
- `POST /api/admin/courses/import` — plan-limit slicing (via `maxCourses`), duplicate-title dedup with a `(2)`/`(3)` suffix (courses always import as drafts, so re-importing a CSV creates a reviewable copy rather than erroring), and mirrors the `navShowCourses`/`onboardingCompletedAt` first-course side effects from the single-course create route.
- Content only for now — no pricing, no PDF/file import (schema requires an actual upload, not a CSV URL), no onboarding-modal entry point yet (admin page only).
- Verified live on staging with two hand-built sample CSVs (exact template headers, and a deliberately-aliased-header file to exercise auto-detection): happy path, duplicate-title renaming, empty-lesson flagging, and the plan-limit skip path all confirmed correct. Found and fixed two small bugs in the process — a grammar slip and a raw `[object Object]` render when an API error body isn't the route's own `{error: string}` shape (e.g. a platform firewall block).

## August 6, 2026 — Courses now discoverable in the AuthorLoft Bookstore

Third step of the dual book-author / course-creator promotion strategy. Scoped as a first pass, not full parity with books — Course has no genre or rating tables yet, so this is a separate section, not merged into the book catalog/filter grid (unified filtering deferred, see `docs/FEATURE_BACKLOG.md`):

- New `Course.listInBookstore` field (mirrors `Book.listInBookstore`), with the same "List in AuthorLoft Bookstore" toggle in the course editor (edit mode only, STANDARD+ gated the same way the book toggle already is) and the same `bookstoreListingLimit` enforcement on `PUT /api/admin/courses/[id]`.
- New `getBookstoreCourses()` in `lib/bookstore.ts` and a lightweight `BookstoreCourseCard` component (cover, title, author, price — no genre/rating UI since those don't exist for courses).
- `/bookstore` now shows a "Courses from Independent Creators" section (only rendered once at least one course opts in) ahead of the existing "Browse All Books" catalog.
- Logged follow-up work in the backlog: course categories/taxonomy (needed before unified genre browsing or Books/Courses filter tabs make sense), course ratings, and adding courses to the page's JSON-LD structured data.

## August 6, 2026 — Courses and Bundles now show in the dashboard's "Your Site Pages" card

`getAuthorSitePages()` (`lib/site-pages.ts`), which builds the pill list in the dashboard's "Your Site Pages" card, only knew about Home/Books/Specials/Flip Books/News/custom pages/About/Contact/Media Kit — Courses and Bundles were never added even though both have real public routes (`/courses`, `/bundles`) and their own nav toggles. A course creator turning on the Courses nav (from Admin -> Pages, or automatically via the onboarding fix from earlier today) had no quick link to their live course page from the dashboard. Added both, gated the same way Media Kit already was (`plan.coursesEnabled`/`bundlesEnabled` AND the nav toggle both true), so the pill only appears once the page is actually reachable on the live site.

## August 6, 2026 — Super Admin Feature Gates page was missing 4 real gates

`feature-config-form.tsx` has its own manually-maintained `FEATURES` list for display, separate from the actual source of truth (`DEFAULT_GATES` in `lib/feature-gates.ts`) that the sidebar/command-palette/cascade logic all read from. The two lists had drifted: Courses, Bundles, Promote, and Reader Feedback all had real, functioning gates but weren't in the UI list, so a super admin had no way to see or change their tier from Super Admin → Feature Gates — the exact reason yesterday's `/admin/courses` STANDARD-lock was hard to spot and fix from the UI. Added all four to the display list with matching icons; no logic changed, this was a display-only gap.

## August 6, 2026 — Two more course-creator onboarding bugs: stale dismiss flag, third gating layer

Found testing a fresh signup through the course-creator onboarding path:

- **Onboarding modal silently skipped on new accounts**: `onboarding-controller.tsx` stored its "already dismissed" flag under one global `localStorage` key (`al_onboarding_dismissed`) shared by every account in the browser, instead of scoping it per author. Dismissing/completing onboarding on one test account silently suppressed the modal for every other account signed into afterward in the same browser — a real bug for anyone managing or testing multiple accounts, not just a test artifact. Now scoped to `al_onboarding_dismissed_{authorSlug}`.
- **Courses still locked for FREE despite the earlier fix**: the admin sidebar/command-palette has its own independent gating layer (`lib/feature-gates.ts` `DEFAULT_GATES`, overridable via a saved `PlanFeatureConfig.gates` JSON config edited in Super Admin → Feature Gates) that's separate from `Plan.coursesEnabled`. It still had `/admin/courses` set to `"STANDARD"` in both the code default and the saved DB override, so the "Allow Courses on FREE" decision from earlier today wasn't actually visible in the sidebar — Courses rendered as a locked, unclickable nav item for FREE accounts. Fixed both layers: `DEFAULT_GATES["/admin/courses"]` → `"FREE"`, and the saved `PlanFeatureConfig` singleton updated to match via Supabase. Worth noting for future gate changes: this saved config cascades back to `Plan.coursesEnabled` on every tier whenever a super admin re-saves Feature Gates, so leaving it out of sync would have silently reverted the FREE-tier enablement the next time someone touched that settings page.

## August 6, 2026 — Courses now available on FREE plan (capped at 5), enforcement gap closed

Follow-up to the course-creator onboarding work: `Plan.coursesEnabled`/`maxCourses` existed on the schema but `/api/admin/courses` never checked them, so courses were silently creatable on every plan tier while `docs/FEATURE_MATRIX.md` documented them as STANDARD+ only and the Pages & Navigation settings UI correctly hid the Courses toggle for FREE accounts — a course-creator signing up on FREE (the onboarding default) could create a course but then couldn't find where to manage its nav visibility. Resolved by making the actual policy match the course-creator acquisition strategy rather than closing the door: FREE plan now has `coursesEnabled = true` with `maxCourses = 5` (mirrors the existing 5-book FREE cap). Added `canAddCourse()` to `plan-limits.ts` (mirrors `canAddBook()`) and wired it into `POST /api/admin/courses`, so the cap is now actually enforced for every tier, not just documented. `FEATURE_MATRIX.md` updated to show "Up to 5" for FREE instead of ❌.

## August 6, 2026 — Homepage messaging broadened to books + courses; onboarding forks by creator type

First two steps of the dual book-author / course-creator promotion strategy:

- **Homepage**: hero, pain/solution cards, problem strip, pillars, and footer CTA rewritten to speak to both book authors and course creators instead of assuming every visitor is a book author. Two new cycling hero cards ("Amazon owns your readers" / "Udemy owns your students") speak directly to each audience. Nav, `/bookstore` link, and SEO title deliberately left unchanged for now.
- **Onboarding**: new `Author.creatorType` field (`"book" | "course" | "both"`, default `"book"` — informational only, doesn't gate any feature). The guided onboarding modal now opens with a "What will you create first?" choice and branches: book-only keeps the existing 2-step flow, course-only walks through a lightweight course setup (title, description, first module, first lesson) via `/api/admin/courses`, and "both" does book then course (skippable). Fixed a real gap in the process: `/api/admin/courses` POST never stamped `onboardingCompletedAt`, so a course-first signup would have seen the onboarding modal forever — it now mirrors the same stamp the books route already had. The dashboard's fallback checklist (`onboarding-controller.tsx`) also adapts its nudge based on `creatorType`. Both content types stay fully available in admin regardless of the initial choice — nothing is gated by it.
- Note for follow-up: `Plan.coursesEnabled` / `Plan.maxCourses` exist on the schema but `/api/admin/courses` doesn't check them — courses are currently creatable on every plan tier including FREE, despite `docs/FEATURE_MATRIX.md` listing them as STANDARD+. Pre-existing gap, not introduced here — flagged for a decision on whether to wire up the gate or update the docs. **Resolved same day, see below.**

## August 6, 2026 — Fixed course lesson formatting; full-course print/download export

Two fixes to the SDLC course content and rendering, then the deferred PDF-export feature:

- The `/learn` page rendered lesson HTML with `prose prose-gray` classes, but the Tailwind Typography plugin was never installed, so paragraph/heading/list spacing silently collapsed under Preflight's reset. Switched to the site's existing `.rich-content` class (already used by blog/news/guides/etc.) and added the `sanitize()` call every other rich-text render site already applies.
- Two of the SDLC course's 24 lessons ("What Is the SDLC and Why It Matters", "SDLC Models and Methodologies") had leftover LLM-assistant preamble text (`"Here's the enhanced version..."` + a stray `---`) saved directly into `contentHtml`, plus dash/number "lists" typed as plain paragraphs instead of real `<ul>`/`<ol>` markup. Cleaned both in place via Supabase — content preserved, just the artifacts removed and lists properly structured. The other 22 lessons were already solid and left untouched.
- Shipped the course-lesson-PDF-export item from the backlog: a new `Course.allowDownload` toggle (admin course editor, default on) controls whether a "Print / Download full course" action appears on the course detail page and the `/learn` sidebar. It links to a new `/courses/[slug]/print` view that assembles every module/lesson the visitor has access to (same preview/enrollment-token check as `/learn`) into one document with a table of contents, then lets the browser's native Print/Save-as-PDF handle the export — reusing the print-button + `@media print` pattern already live on blog posts. Video lessons show as a reference link rather than an embedded/downloadable video (no legitimate way to bundle someone else's YouTube/Vimeo video). A true server-rendered branded `.pdf` (via the `@react-pdf/renderer` dependency already used for the media-kit PDF) remains a possible follow-up, not built yet.

## August 6, 2026 — Course lessons can now have a downloadable attachment

Fixed the free-preview eyeball, dashboard onboarding false-positives, and pre-order book completeness bugs from earlier today, then added the actual feature request behind them: authors can attach an optional downloadable file (worksheet, slide deck, cheat sheet) to any course lesson. Uses the `CourseLesson.fileKey`/`fileName` fields that already existed in the schema but were never wired up. New `/api/admin/upload/course-file` endpoint (private `course-files` Supabase bucket, 50MB cap, PDF/Office/ZIP/text) plugs into the course editor's lesson rows; a new gated `/api/courses/lesson-resource/[lessonId]` route delivers it via a short-lived signed URL, using the exact same preview-lesson/enrollment-token access check the `/learn` page already enforces. Deferred: exporting lesson text to PDF (video lessons would show the source URL as a link, not an embedded/downloadable video) — logged in `docs/FEATURE_BACKLOG.md`, no PDF library in the codebase yet.

## August 6, 2026 — Seeded Anthony Bedford's first Author Course: "The Software Development Lifecycle: A Practical Guide"

Content-only change (no schema/code changes — the `Course`/`CourseModule`/`CourseLesson` tables already existed). Authored and inserted a full free, published course for `apbedford` (Anthony Bedford) covering the SDLC end to end: 7 modules (Introduction to the SDLC; Requirements Gathering & Planning; System Design & Architecture; Development & Code Quality; Testing & Quality Assurance; Deployment & CI/CD; Maintenance & Continuous Improvement) with 24 lessons total, each with full written `contentHtml`. `navShowCourses` was left off for his site pending his own launch decision — course is reachable directly at `/courses/the-software-development-lifecycle-a-practical-guide` once nav is enabled.

## August 5, 2026 — Founding Member Offer is now a real admin control, with a saved-offer library

The dashboard's "Founding member offer — 20% off for your first 3 months" banner was fully hardcoded, and the actual checkout discount was a separate Stripe coupon ID living in an env var — the two could silently drift out of sync, and changing either required a code deploy. Added a **Founding Member Offers** panel to Super Admin → Coupons, backed by a new `EarlyBirdOffer` table (migrations `20260805_early_bird_offer_settings` → `20260805_early_bird_offers_table`, the latter superseding a same-day singleton-config first pass once multi-offer support was requested):

- Save any number of offer presets (name, percent off, duration, eligibility window in days since signup, optional custom headline/subtext override) and pick which existing Stripe coupon applies at checkout for monthly vs. annual — with a live preview of the exact banner copy.
- Exactly one offer is ever "live" at a time — turning one on automatically turns off whichever was previously active, so the dashboard banner slot is never ambiguous.
- Edit any saved offer in place, or duplicate one as a starting point for a new one (e.g. clone "Founding Member" into "Black Friday 2026" without retyping terms).
- Coupon fields fall back to `STRIPE_EARLY_BIRD_COUPON_MONTHLY`/`ANNUAL` env vars when left blank, so nothing changed for existing authors until an offer is actually edited.

Dashboard banner ([dashboard/page.tsx](../src/app/(admin)/admin/dashboard/page.tsx)) and checkout coupon selection ([stripe/subscribe/route.ts](../src/app/api/admin/stripe/subscribe/route.ts)) both read from whichever `EarlyBirdOffer` row has `enabled = true`.

## August 5, 2026 — Fixed dead "Dashboard" link on marketing site, gave "Sign in" real visual weight

The marketing header's "Dashboard" button (shown to logged-in authors on the homepage hero and other marketing pages, desktop + mobile) linked to bare `/admin`, which has no page — confirmed live that it was resolving to the author-site 404 ("Author Not Found"), not a normal 404. Every real admin page lives under `/admin/dashboard`; fixed all 5 occurrences across `rebrand-hero.tsx`, `hero-mobile-menu.tsx`, `marketing-nav.tsx` (×2), and `marketing-mobile-menu.tsx`. Also restyled "Sign in" (logged-out state) from low-opacity plain text into an outlined pill button matching "Start Free"'s shape, in both header variants, desktop and mobile — it existed but was easy to miss.

## August 5, 2026 — Guided catalog completion for returning authors

Addressed a new-user-experience gap: onboarding guidance previously vanished the moment an author created one book, even a title-only draft, and the only fallback ("Next Steps" card) was hidden from FREE-tier authors entirely. Added `src/lib/book-completeness.ts` as a shared "is this book reader-ready" signal (cover, description, buy link/direct-sale file) used consistently across three surfaces: the Dashboard's Next Steps card (now un-gated from plan tier, driven by real completeness instead of "a book row exists"), a "Needs: cover, description, buy link" note under any unfinished book on the Books list (plus a summary banner when any book is incomplete), and the book editor, where the 10 tabs are now grouped into Essentials / Sell / Advanced with live completion dots, and the old one-shot "book created" banner is replaced by a persistent guidance banner that only disappears once the book is actually done. Verified end-to-end on staging with a disposable test account.

## August 5, 2026 — FREE tier gets full newsletter sending; new authors get a default reply-to

Fixed a live drift: the platform-newsletter feature gate (Super Admin → Feature Gates) had `/admin/newsletter` set to `STANDARD`, so FREE-tier authors could collect subscribers via the site signup form but got a 403 trying to actually send a campaign — contradicting the pricing page and features page, which have always advertised "Newsletter campaigns ✓" for every tier. Reset the gate to `FREE` and cascaded `Plan.newsletter = true` to all three tiers in prod. Also: new authors (email/password and Google signup) now get `contactEmail` defaulted to their account email at creation, so the "new message" notification for reader contact-form submissions fires out of the box instead of silently landing only in the admin inbox until they opt in via Settings.

## August 3, 2026 — Author-site footer QR code

Every author site footer now shows a QR code linking to that author's own site, as a fourth column to the right of Quick Links. A desktop visitor can scan to carry the site to their phone, and — the case that isn't redundant on mobile — an author can hold their screen out at a signing or conference for a reader to scan. Built on `getAuthorBaseUrl()`, so it resolves to a custom domain when one is configured and otherwise the `slug.authorloft.com` subdomain, and it follows a site-URL change automatically. Rendered on a white plate because a QR needs a light quiet zone to scan reliably against the near-black footer panel. Shown at every breakpoint; no per-author toggle.

## August 1, 2026 — `{{token}}` substitution is case/whitespace-insensitive everywhere

`{{FirstName}}` (or any casing other than the exact lowercase `{{firstName}}`) silently failed to resolve in Mass Email and individual author emails — the regex only matched the literal lowercase token, so anything else sent with the raw `{{...}}` still in it. Audited every `{{token}}` substitution point in the app and fixed all three the same way: lowercase the lookup, tolerate stray whitespace inside the braces, leave the text alone if the token genuinely isn't known. Covers `mailer.ts`'s `buildBroadcastMailPayload` (Mass Email + individual author email — `{{firstName}}`), `substituteVars` (Welcome Email template — `{{firstName}}`, `{{siteUrl}}`, `{{dashboardUrl}}`), and Social Promote's `substituteTokens` (AI prompt templates — `{{book.title}}` and the rest of the dotted tokens).

## July 31, 2026 — Rich text editor for mass/individual author emails

Mass Email and the per-author send modal only had a plain textarea, so every email went out as flat, unstyled paragraphs — no bold, no links, no color. `EmailComposer`'s Body field now uses the same rich text editor already used for newsletters, book pages, and author bios (bold/italic/underline, links, text color, highlight, alignment, headings, lists). `mailer.ts` now treats the body as sanitized HTML and embeds it directly (same pattern as author newsletters) instead of escaping it as plain text split on newlines, with a plain-text fallback derived from the HTML. Also fixed a latent bug in the shared rich text editor component: it only applied its initial content on mount, so loading a saved template or clearing the body after a successful send (both set the value from outside the editor) never visibly updated the screen — added a sync effect plus a new `editable` prop so the composer can still lock editing mid-send.

## July 31, 2026 — Direct "Email {author}" CTAs + contact form reason dropdown

Readers had to already be on the Contact page to email an author — nothing on the homepage or About page pointed there directly.

- **"Email {firstName}" link added next to each homepage template's About-the-Author CTA** (classic: next to "Meet the Author"; cinematic: next to "The full story"; bold/minimal: next to "Full biography") — all four templates, since any author could be on any one of them. Links straight to `/contact`, not a `mailto:` — keeps the reader on-site and routes through the author's configured contact form.
- **Same "Email {firstName}" button added to the About page**, under the author photo.
- **Contact form's Subject field is now a dropdown** (Reader Question / Newsletter / Blog Information / Book Discussion / Media & Press Inquiry / Speaking Engagement / Collaboration & Partnership / Rights & Permissions / Website & Technical Issue / Other) instead of free text, defaulting to Reader Question — gives authors a scannable reason instead of guessing from a blank field. The optional Website field moved below Message to match.
- **Footer newsletter button relabeled** "Subscribe to Newsletter" → "Subscribe to AuthorLoft".

## July 31, 2026 — Admin search now finds sub-page tabs, not just top-level pages

The command palette (below) initially only indexed the sidebar's top-level links, so searching "billing" found nothing more specific than the Settings page — you still had to know which tab it was under. New `src/lib/admin-search-extras.ts` catalogs every named tab across Settings, Branding, Newsletter, Help & Support, Legal Pages, and Super Admin Platform Settings, each deep-linking straight to that tab via `?tab=`. Added mount-time `?tab=` support to the three tabbed components that didn't have it yet (Branding, Legal Pages, Super Admin Settings) — matching the pattern already used by `/admin/settings`, book edit, Newsletter, and Help & Support. Also added a guidance-only "Affiliate Links / Affiliations" result, since per-book functionality (Books → a book → Affiliate tab) has no single URL to deep-link to — it explains where to go instead of 404ing.

## July 31, 2026 — Admin search (Cmd/Ctrl+K command palette)

Sidebar nav had grown to 6 admin groups + 5 super-admin groups of nested collapsibles — finding a page meant knowing which group it lived under and expanding it first. Added a search trigger at the top of the sidebar (and a global Cmd/Ctrl+K shortcut) that opens an overlay listing every reachable Admin + Super Admin destination, filterable by page or group name, with arrow-key navigation and Enter to jump. Locked (plan-gated) results show a lock icon and route to the upgrade page instead of 404ing, matching the sidebar's own gating; results are tagged by section so it's clear which zone (Admin vs. purple Super Admin) a result lives in. `NAV_GROUPS`/`SUPER_ADMIN_GROUPS` moved out of `sidebar.tsx` into `src/lib/admin-nav-groups.ts` as a shared source of truth so the sidebar and the palette can't drift apart.

## July 31, 2026 — Super Admin sidebar gets its own visual zone

The Super Admin nav block sits stacked directly under the regular Admin nav in the same sidebar (there's no separate view to switch into) — previously only the *active* link turned purple, so at rest the two sections were hard to tell apart while scanning. The whole Super Admin block (Platform Dashboard + all its groups) now sits in a persistent purple-tinted panel (background + border, both themes), its idle nav-item/group-label text is purple-toned instead of the neutral admin color, and a Shield icon sits next to the "Super Admin" heading so the cue doesn't rely on color alone.

## July 31, 2026 — Individual author emails + reusable follow-up templates

Super Admin could only email authors two ways: the system Welcome Email (auto-sent on signup) or a Mass Email broadcast to a whole plan-tier segment. There was no way to send one author a personal note. Extended the existing mass-email infrastructure instead of building a new page:

- **"Send email" action on each author row** (`/super-admin/authors`) — opens a modal to compose a one-to-one email to that author. Reuses the same compose/template UI as Mass Email.
- **Individual sends skip the "unsubscribe from announcements" footer** — since it's a personal note, not a broadcast — while still logging to Broadcast History (shown by recipient email instead of a plan badge).
- **Templates are now reusable and editable in place.** Previously "Save as template" always created a new row; templates can now be updated in place ("Update ‹name›") after loading and editing one, in addition to saving as new. Templates also carry a `category` (Welcome / Offer Help / Promotion / Re-engagement / General) shown as a badge in the picker.
- **Seeded 4 starter templates** (Personal Welcome, Offering a Hand, Special Offer, Just Checking In) so there's a usable library on day one — editable/deletable like any other template.
- **Configurable Reply-To address** (Settings → Mass Email) — both individual and mass author emails previously replied to whichever Super Admin was logged in (a personal login email). Now routes to a real AuthorLoft address set once in Settings (e.g. `authorloft@gmail.com`, optionally with `+alias` tagging to filter replies by topic); falls back to the sending admin's email if unset. `From:` stays on the Resend-verified domain — only Reply-To changes.
- Extracted the compose+template UI into a shared `EmailComposer` component (`src/components/super-admin/email-composer.tsx`) used by both Mass Email and the new per-author modal, so there's one place to extend template behavior going forward.
- **Reply-To is a dropdown of active Support Emails, not free text.** Both Mass Email's Reply-To setting and the per-author send modal now pick from Settings → Email Addresses (inactive ones excluded) instead of typing an address by hand. The per-author modal defaults to the global setting, can be overridden per send, and has its own "Save as default" action to persist that override as the new global default — matching Mass Email's save behavior.
- Schema: added nullable `recipientAuthorId`/`recipientEmail` to `PlatformBroadcast`, `category` to `BroadcastTemplate`, and `authorReplyToEmail` to `SystemConfig` (all additive, applied directly to Supabase). Also fixed `{{firstName}}` not substituting in the email **subject** line (only the body was resolved).

## July 31, 2026 — SEO crawl-report cleanup + Bing indexing block

Worked through a batch of Bing/SEO crawler reports (noindex, 404, 3xx-redirect, broken-outlink, no-outlink CSVs) and fixed what was real:

- **Vercel Firewall was blocking Bingbot.** "Bot Protection" was set to Challenge, which issues a JS challenge to any non-browser request — including verified search crawlers, since Vercel's bot verification wasn't reliably passing them through. Confirmed via curl with Bingbot's user agent (429 + `X-Vercel-Mitigated: challenge` before, clean 200 after). Switched to Log (records bot traffic, blocks nothing) in the Vercel dashboard — this was almost certainly also affecting Googlebot and social link-unfurlers, not just Bing.
- **Buy button 404 on 2 legacy books** (`build-a-solid-saas-app`, `build-vibe-scale`, both on `apbedford2`) — Direct Sales enabled + a price, but no `BookDirectSaleItem` row (pre-dates the per-format items system), so `/buy` always 404'd. It now provisions the missing item from the book's own price/format instead of 404ing.
- **`/register` served an empty page to crawlers** — the whole first render blocked on a client-side beta-status fetch, so the real HTML (logo, Terms/Privacy links, sign-in link) never shipped until JS hydrated. Now renders the real form immediately; flips to the invite-code step if beta mode turns out to be on.
- **Broken content links fixed directly in the DB**: a Guide and a News post linked to pages that were never created (`/guides/author-branding-colors-fonts-genre`, public `/help`); 8 blog posts linked to the 2 retired blog URLs (and one to a bare `http://` homepage link) that 308-redirect instead of linking straight to the canonical destination.

## July 27, 2026 — Brand-align the auth flow (de-generic pass)

Audited the codebase with the [vibecoded-design-tells](https://github.com/JCarterJohnson/vibecoded-design-tells) scanner, which ranks the visual patterns people cite when they call a site AI-generated. Fixed the findings that a real visitor actually sees:

- **The entire auth flow used stock Tailwind, not AuthorLoft's brand.** All 7 pages (login, register, forgot/reset password, verify email, accept terms) shipped with `bg-gray-50` + `bg-white rounded-2xl border-gray-200` + `#2563EB` Tailwind blue as the primary action — so signing in looked like a different product than the navy/brass/cream marketing site that sent you there, in the most generic default a generator produces. New `src/app/(auth)/auth-theme.ts` anchors the flow to the real brand: warm page field, deliberate 10px card radius (instead of the blanket `rounded-2xl`), brass primary buttons with dark-navy text, brass links and focus rings. `--accent` is now set once on the page wrapper, which the shared `Input` already consumes — so inputs, buttons, and focus states all resolve from one place instead of each hardcoding blue.
- **Emoji-as-icons replaced with real icons** — the integration strip on both marketing variants used 💳 ✉️ 📬 📊 ✨ ⚡ as UI icons; now Lucide icons in brand brass.
- **Testimonials eyebrow badge** moved off Tailwind's stock `amber-50/600` swatch onto brand brass.
- Kept deliberately: the FLIPBOOK `#7c3aed` (a real per-format colour system, not an unchosen default), the Playfair heading face (a genuine choice for a literary brand), and all admin/super-admin internals (never seen by prospects; changing them is risk without payoff).

Presentational only — no logic changed. Verified with `tsc --noEmit` and a full `next build` (239/239 pages).

## July 27, 2026 — Signup friction + author-changeable site URL

- **Removed the site-URL step from signup.** Registration was two steps: account details, then picking a permanent `slug.authorloft.com` address (with live availability checking) *before* seeing any of the product. PostHog showed tagged social traffic reaching `/register` without completing, and this was the most likely culprit — a permanent commitment asked of someone who'd just clicked a link out of curiosity. Signup is now a single step (name, email, password, terms); the API derives a slug from the author's name and de-duplicates collisions automatically.
- **Authors can now change their site URL** — Settings → Account → Site URL. This capability did **not previously exist anywhere in the product**: whatever slug you got at signup was permanent. New `GET`/`PATCH /api/admin/settings/slug` with validation, reserved-word and uniqueness checks, rate limiting (5/hour), and an audit-log entry. The UI warns that changing it breaks previously shared links, and notes that a configured custom domain is unaffected.
- **Changing your site URL no longer costs you your Google ranking.** The old address used to hard-404 after a change — every backlink dead, all accumulated search signal lost, printed QR codes broken. Retired slugs are now recorded in a new `AuthorSlugHistory` table and 308-redirect to the same path on the author's current address (`oldname.authorloft.com/books/x` → `newname.authorloft.com/books/x`), which Google honours by transferring ranking automatically. Retired slugs stay globally claimed so nobody else can take one and inherit someone's traffic. `proxy.ts` passes the pre-rewrite path via an `x-original-path` header so deep links survive. The Settings warning is now reassuring rather than alarming, with a note to add the new address in Search Console to speed propagation.
- **Fixed: reserved slugs weren't actually enforced on registration.** The `RESERVED` list (`www`, `admin`, `api`, …) lived only inside the availability-check endpoint the form calls — the register API itself never checked it, so a direct POST could claim a reserved subdomain. Extracted to `src/lib/reserved-slugs.ts` and now enforced on every path that assigns a slug. Also expanded the list, which was missing live marketing routes (`news`, `guides`, `features`, `bookstore`, `pricing`, `compare`, `demo`, `ingest`, …).

## July 17, 2026

- **Fixed: Site Traffic Analytics was silently broken since launch** — the `/admin/analytics` dashboard (PostHog page-view data) always showed 0 visitors for every author, because the site never actually sent PostHog's `$pageview` event — only 7 backend lifecycle events (signup, login, etc.) existed, no browser-side tracking snippet at all. Root-caused and fixed as a chain of issues:
  - Installed `posthog-js` client-side, consent-gated on the existing `analytics-consent` localStorage flag (honors the `/gdpr` page's no-tracking-without-consent promise); manual `$pageview` capture on route change via `usePathname()` (Next.js App Router client-side navigations don't trigger PostHog's autocapture listener)
  - CSP (`next.config.ts`) was blocking the actual network calls even after install — `connect-src`/`script-src` had no entry for PostHog's ingest or asset hosts
  - **Also found and fixed the same bug for Google Ads conversion tracking** (`AW-1803958972`) — CSP was blocking `googletagmanager.com` and `googleads.g.doubleclick.net` too, so ad conversion tracking has likely never worked either
  - Found and fixed a banner-collision bug: `ConsentBanner` (analytics opt-in) and `LegalBanner` (ToS/Privacy update notice) were both fixed to the bottom of the screen, so the consent banner was rendering invisibly underneath the legal notice — moved `ConsentBanner` to a bottom-right floating card so the two can't collide
  - Reverse-proxied PostHog through `/ingest/*` on the platform's own domain (Next.js rewrites) instead of calling `*.i.posthog.com` directly — PostHog's documented pattern for ad-blocker resilience; simplified CSP accordingly since the browser no longer talks to PostHog's domains directly
  - Fixed `capture_pageleave` silently disabling itself (defaults to tracking only if `capture_pageview` autocapture is also on, which we intentionally disabled in favor of manual capture)
  - Fixed `LegalBanner`'s invisible full-width click area (spanned the whole viewport at a higher z-index than the analytics banner, silently blocking clicks meant for it) — `pointer-events-none` on the wrapper, `pointer-events-auto` on the visible card
  - Fixed `LegalBanner` showing "we've updated our policies" to brand-new visitors who have nothing to compare against — a new `bs_seen` cookie distinguishes first-time from returning visitors; first-timers are silently acknowledged instead, reducing homepage banner clutter on the exact page whose job is converting a cold visitor

## July 5, 2026

- **Homepage hero copy — Super Admin editable** — Platform Settings → Marketing tab now has a "Homepage Hero Copy" panel to edit the hero's H1 headline (2 lines) and subheadline paragraph without a code deploy.
  - **Schema:** `PlatformSettings.heroHeadlineLine1` / `heroHeadlineLine2` / `heroSubheadline` (nullable text, singleton row).
  - **API:** `GET/PATCH /api/super-admin/marketing/hero-copy` — blank field reverts to the default AuthorLoft copy.
  - **Homepage:** `RebelHero` (`components/marketing/rebrand-hero.tsx`) accepts optional overrides, falling back to the existing hardcoded copy.
- **Homepage font consistency** — homepage section headings referenced `'Cormorant Garamond'`, which was never loaded (only Inter + Playfair Display are), so they silently fell back to Georgia while hero/pricing/testimonials rendered in Playfair. Repointed all 7 references to `var(--font-heading)` so every heading uses the same loaded serif.
- **Cleanup** — removed dead/unused files: `redesign-hero.tsx` (orphaned component), `page.backup.tsx` (stale homepage backup); untracked `tsconfig.tsbuildinfo` (build artifact, already in `.gitignore`); deleted scratch files `newHomePage06292026/` and `pricing_page_snapshot.md`.

## July 1, 2026

- **Achievement Badges** — auto-calculated badges recognizing author milestones, included on all plans:
  - **Schema:** `BadgeDefinition` (Super Admin-managed tiers per metric: books, revenue, reviews, subscribers, ARC reviews, affiliate sales, formats, bundles, courses, preorders) + `Author.showBadges` opt-out toggle. No manual/editorial badges — everything is computed live from real activity.
  - **`lib/badges.ts`** — `getAuthorBadgeMetrics()` / `getAuthorBadges()` compute an author's metrics and resolve only their highest earned tier per metric (no clutter from lower tiers).
  - **Super Admin** (`/super-admin/badges`) — enable/disable each badge tier and edit its threshold without a deploy. 16 starter badges seeded across 10 metrics.
  - **Author Settings** — single "Show badges publicly" toggle (`/api/admin/settings/badges`), on by default.
  - **Public display:** author-site About page (Achievements section) and the Bookstore's rotating Author Spotlight.
  - **Marketing:** added "Achievement Badges" to the Features page comparison matrix and all three Plan `featuresJson` records, plus the Pricing page comparison table — included on Free, Standard, and Premium.

## June 28, 2026

- **FREE plan eBook sales** — free-tier authors can now sell eBooks directly via Stripe (previously STANDARD+ only):
  - **Direct Sales gate** moved from STANDARD to FREE in feature gates; `salesEnabled = true` on the FREE plan record.
  - **Format enforcement by tier** — FREE: eBook only; STANDARD: eBook + Print; PREMIUM: all formats (eBook, Audio, Flipbook, Print). Server-side enforcement in the direct-sales POST route; admin UI format picker filtered by tier.
  - **Admin UI updated** — FREE authors see "Sell eBooks & offer Reader Magnets" banner with upgrade prompt for Print/Audio/Flipbook/Bundles/Cart. Price field and Stripe Connect setup now shown for all plans.
  - **Feature matrix & pricing page** updated — Direct Digital Sales shows "✓ eBook (Stripe)" for FREE; Sales Formats shows "eBook" for FREE; Reader Magnets and Discount Codes rows added to feature matrix.
  - **Shopping Cart** remains STANDARD+ (FREE = single-item checkout).
- **Bundles & Courses feature flags fixed** — `bundlesEnabled` and `coursesEnabled` set to `true` on STANDARD and PREMIUM plan records (were still `false` after June 27 ship, causing missing checkmarks on the features page).

## June 27, 2026

- **Author Courses — full feature** — authors can now create and sell courses (writing craft, subject expertise):
  - **Schema:** Course → CourseModule → CourseLesson hierarchy with CourseEnrollment for access control. Reuses polymorphic OrderItem (itemType: COURSE).
  - **Admin CRUD:** `/admin/courses` list, create, and edit pages with inline module/lesson editor (collapsible modules, per-lesson video URL + HTML content + free preview toggle). Sidebar entry under Sales group, gated to STANDARD tier.
  - **Checkout:** Stripe checkout extended to accept `courseId` — creates a single line item. Free courses use a separate enrollment endpoint (email collection → instant access). Webhook creates CourseEnrollment on payment.
  - **Author site display:** `/courses` listing page with cover images, module/lesson counts, and price. `/courses/[slug]` detail page with full curriculum outline, free preview badges, and buy/enroll button. `/courses/[slug]/learn` token-gated lesson viewer with sidebar navigation, YouTube/Vimeo embeds, and previous/next navigation.
  - **Feature gates:** `/admin/courses` → STANDARD, maps to `Plan.coursesEnabled`. Nav controlled by `navShowCourses` toggle.
- **Shared cover image upload** — extracted reusable `CoverUpload` component (drag-and-drop + click-to-browse + paste URL) used by book, bundle, and course admin forms.
- **Book Bundles — full feature** — authors can now package multiple book formats into discounted bundles:
  - **Schema:** 6 new models (Bundle, BundleItem, Course, CourseModule, CourseLesson, CourseEnrollment), polymorphic OrderItem with OrderItemType enum (BOOK/BUNDLE/COURSE), Plan feature flags (bundlesEnabled, coursesEnabled), Author nav toggles.
  - **Admin CRUD:** `/admin/bundles` list, create, and edit pages with interactive book format picker, savings calculator, and publish toggle. Sidebar entry under Sales group, gated to STANDARD tier.
  - **Checkout:** Stripe checkout extended to accept `bundleId` — creates a single line item at bundle price, then individual OrderItems per included format for per-book downloads.
  - **Author site display:** `/bundles` listing page with stacked cover art and savings badges, `/bundles/[slug]` detail page with included items list and direct buy button. Nav + footer updated with Bundles link (controlled by navShowBundles toggle).
  - **Feature gates:** `/admin/bundles` → STANDARD, maps to `Plan.bundlesEnabled`.
- **SEO & discoverability overhaul** — comprehensive improvements to help AuthorLoft surface in search engines and AI tool searches:
  - **Dynamic XML sitemap** (`src/app/sitemap.ts`) — covers 13 static pages, 11 solution landing pages, 4 comparison pages, and all dynamic blog/news/guide/genre content from the database.
  - **robots.txt** (`src/app/robots.ts`) — proper crawl directives allowing all public pages, blocking admin/API/auth routes.
  - **SoftwareApplication structured data** — homepage JSON-LD now includes `offers`, `featureList` (13 features), making AuthorLoft discoverable in AI tool searches and rich results.
  - **SEO config expanded** — `seo-config.ts` now covers all 11 solution landing pages (was only 6 core pages), enabling per-page OG image overrides.
  - **llms.txt updated** — tagline aligned to "Your Books. Your Readers. Your Business." positioning; added missing Quilltips comparison link.
- **Homepage & features page repositioning** — messaging changes to reinforce "complete author business platform" positioning:
  - **"Replaces" comparison strip** — new homepage section showing what AuthorLoft replaces (WordPress, Shopify, Mailchimp, Google Analytics, separate landing pages) with animated reveal cards.
  - **Problem-first feature descriptions** — features page categories now have persuasive subtitles explaining the problem each feature solves.
  - **Features page hero** — title updated to "Everything you need to own your business" with styled italic accent.
  - **Tagline refresh** — meta titles, OG tags, footer, and structured data updated to "Your Books. Your Readers. Your Business."
- **Nav unification** — hero desktop and mobile menus now match the main marketing nav structure:
  - **Hero desktop nav** — added Solutions dropdown (11 solution pages), moved FAQ to top level, restructured Resources dropdown (added Author Guides), removed anchor-only links (#how-it-works, #genres).
  - **Hero mobile menu** — unified with MarketingMobileMenu: now shows full Solutions (11 items), Resources (4 items), and proper page links instead of anchor links.
- **CTA text update** — hero CTA changed from "Take back control →" to "Start your business →".
- **Code review fixes** — corrected Standard plan price from $39.99 to $19.99 across all hardcoded references (llms.txt, llms-full.txt, mailer, landing pages, pricing meta, features JSON-LD, welcome email panel, dynamic llms-full.txt route). Made hero nav auth-aware so logged-in authors see "Dashboard" instead of "Sign in / Start free" on both desktop and mobile hero menus. Deleted orphaned `cycling-hero.tsx` and `midnight-hero.tsx` components.

## June 25, 2026

- **Newsletter polish — formatting + book tag fixes** — Follow-up fixes to the WOW template:
  - **Consistent rich-text rendering** — the email body and the compose preview now use the same sanitizer (`@/lib/sanitize`, with `<mark>` highlight support added), so paragraphs, highlighting, alignment, and colors render identically in preview and inbox.
  - **Featured book blurb** — `shortDescription` is now stripped to plain text before display (was rendering literal `<p>` tags in the email).
  - **Correct availability tag** — the featured book eyebrow + CTA now derive from book status: pre-orders show "Coming soon / Pre-order", books with a seller link show "Out now / Get the book", and books with no way to buy show a neutral "Featured / View the book" instead of implying a purchase.
  - **Uniform shelf covers** — "More on the shelf" covers now render at a fixed size (object-fit cover) instead of varying by each book's aspect ratio.
- **Newsletter "WOW" template — smart content blocks** — Extended the branded newsletter into a richer, magazine-style layout where every section auto-populates from existing data and hides when empty (no manual upkeep, no empty placeholders):
  - **Centered masthead** with brand mark + "Author newsletter" eyebrow + name + tagline, making it explicit the email is from an author the reader subscribed to (reinforced in the footer + hidden preheader).
  - **Featured book showcase** — newest published book (cover, short description, CTA), with a "More on the shelf" strip of up to 3 more books.
  - **Smart review quote** — pulls the author's curated `BookReview` for the featured book, falling back to a highly-rated APPROVED reader `BookFeedback`; hidden when no review exists.
  - **Smart special block** — reuses the author's active `Special` (respects `isActive` + `startsAt`/`endsAt` window). When multiple are live, the author picks which to feature from a dropdown on the compose screen; hidden when none are active.
  - Compose screen shows per-send toggles only for blocks that currently have content (feature books, include review, choose special). Preview mirrors exactly what will send.
- **Newsletter email redesign — branded, not generic** — Author newsletters now ship with real branding instead of a color block + floating text:
  - **Branded header** — author logo (`logoUrl`), falling back to profile photo, then initials, alongside name + `tagline`.
  - **Issue eyebrow** ("Newsletter · Month Year") and a structured body so short emails no longer float in an empty void.
  - **"Read on my site" CTA button** — the previously-missing call to action driving readers back to the author site.
  - **Latest-release strip** — optional cover + title + link to the author's newest published book, toggled per-send via a new "Include my latest book" checkbox on the compose screen (default on; hidden when the author has no books).
  - **Social row** in the footer from the author's configured social URLs.
  - **Color consistency fix** — both the sent email and the compose preview now resolve the accent via `resolveAccentColor` (theme accent + Premium custom override). Previously the send route used the legacy `accentColor` field while the preview used the theme accent, so test emails could differ from the preview.
  - Removed the unused "Email Frequency"-style dead end; the preview now mirrors the real email structure.
- **Newsletter genre targeting — fix interest segmentation** — The author newsletter Compose & Send screen filters recipients by the author's genres, but the public sign-up form was collecting interests as four hardcoded strings (`new_releases`, `specials`, `blog`), so genre-based targeting matched zero interested subscribers and the Subscribers tab showed "None" for everyone. Unified both ends on genre IDs:
  - New public `GET /api/newsletter/genres?authorId=` endpoint returns an author's genres (id + name).
  - Sign-up modal now fetches and renders the author's genres as interest checkboxes (plus an "All" option = no preference); falls back to no picker when the author has no genres. Removed the dead "Email Frequency" field (collected but never sent; no frequency-respecting scheduler exists).
  - "Empty prefs = send to everyone" behavior unchanged; selecting genres now correctly targets subscribers who chose those genres.
- **Author platform repositioning + nav clarity** — Homepage/meta now leads with platform breadth ("Your All-in-One Author Platform") instead of the narrower "own your business" framing. Author sidebar labels clarified: "Blog / News" → "Blog" (authors don't write platform News), "Email & Newsletter" → "Newsletter". Newsletter screen now defaults to the Compose & Send tab so authors land on the writing screen.
- **Search Engine Submission Tools** — New `/admin/search-engines` page under the Website sidebar group gives all authors (FREE+) a guided workflow to submit their sitemaps to Google Search Console and Bing Webmaster Tools:
  - **Site Verification** — Authors can paste Google/Bing verification meta tag codes (or the full HTML tag); the platform extracts the content value and injects `google-site-verification` / `msvalidate.01` meta tags into their author site's `<head>` via Next.js `generateMetadata`.
  - **Step-by-step guides** — Numbered walkthroughs for Google and Bing with inline copy buttons for the author's site URL and sitemap URL, plus direct links to the relevant console pages.
  - **Automatic submissions info** — Explains IndexNow auto-pings on blog publish (Bing/Yandex) and Google sitemap crawling.
  - **Dashboard link** — Site Pages card footer now links to the new Search Engines page instead of bare external links.
  - DB: `googleSiteVerification` and `bingSiteVerification` nullable columns on Author.
- **User blog SEO readiness — close all gaps** — Comprehensive SEO/GEO/AEO hardening for individual author blog sites and platform content:
  - **IndexNow for user blogs** — author blog create/update API routes now ping Bing/Yandex IndexNow on publish (previously only platform posts triggered this).
  - **Auto-generate metaDescription** — when authors leave SEO meta description blank, it auto-generates from excerpt or content (plain-text, 160-char cap on word boundary) via new `src/lib/seo-utils.ts`.
  - **Author blog listing CollectionPage JSON-LD** — added `CollectionPage` + `BreadcrumbList` structured data schemas to `[domain]/blog` index page (matching platform blog/news indexes). Also added canonical URL and OpenGraph metadata.
  - **Guides RSS feed** — new `/guides/rss.xml` endpoint with category support and RSS alternate link in guides index metadata.
  - **News RSS enrichment** — added `category`, `dc:creator`, `lastBuildDate`, and Dublin Core namespace to news RSS feed (matching blog RSS parity).
  - **Guides in platform sitemap** — `/api/internal/sitemap` now includes published guides with proper `lastmod` and priority.
  - **robots.txt + sitemap.xml rewrites** — added `next.config.ts` rewrites so `/robots.txt` → `/api/internal/robots` and `/sitemap.xml` → `/api/internal/sitemap` work reliably on all hosts.

## June 24, 2026

- **SEO/AEO structured data enrichment** — Enhanced JSON-LD schemas across all three content templates (blog, news, guides) for stronger Google/Bing rich results and AI search engine compatibility. Blog `Article` → `BlogPosting` with `wordCount`, `keywords`, `articleSection`, `inLanguage`, `isAccessibleForFree`, and `name` fields. News `NewsArticle` schema enriched with the same fields plus `seoTitle`/`metaDescription` fallbacks for `headline`/`description`. Guides `Article` schema enriched similarly. Publisher objects now include `url`. All schemas now prefer `seoTitle` over raw `title` for `headline` and `metaDescription` over `excerpt` for `description`.
- **CMS SEO field audit** — Backfilled missing `seoTitle` and `metaDescription` on 2 blog posts (epub-kindle, epub-nook), fixed "Social Medial" → "Social Media" typo in category field, tightened 3 overlong meta descriptions (arc-programs, sitemap, pre-orders), improved 3 weak SEO titles (chatgpt, direct-sales, self-publishing-vs-kdp).
- **Mobile admin table scroll fix** — Changed `overflow-hidden` to `overflow-x-auto` on 18 admin/super-admin table wrappers so tables scroll horizontally on mobile instead of clipping edit/delete buttons.
- **UI fixes** — FAQ "have more questions" email link replaced with brass contact button. Hero text "every tool" → "many tools". Feature matrix table made scrollable on mobile.

## June 23, 2026

- **SEO routing fix — `/sitemap.xml` and `/robots.txt` intermittently 404'd on the platform host.** Root cause: Next 16's metadata file routes (`app/sitemap.ts`, `app/robots.ts`) at the app root were losing the route-precedence race against the `(author-site)/[domain]` dynamic catch-all, with `[domain]` winning most of the time and returning the "Author Not Found" 404 page. Runtime logs showed one 200 in ~20 requests. Robots was hidden by a 5-hour CDN cache from an earlier deployment — once that expired, the platform robots would have started returning `Disallow: /` (the internal handler's fallback for unknown hosts), de-indexing the entire platform.
  - Collapsed both files into the existing `/api/internal/sitemap` and `/api/internal/robots` route handlers and taught them to detect platform host vs author host. Middleware now rewrites `/sitemap.xml` and `/robots.txt` for **every** host (moved above the platform-host pass-through), eliminating the routing ambiguity entirely.
  - `app/sitemap.ts` and `app/robots.ts` deleted as unreachable. Platform sitemap content (blog, news, resources, bookstore genres, comparison pages, legal) ported into the internal handler; platform robots content (full allow/disallow + Googlebot rule + sitemap pointer) likewise.
  - Vercel Firewall: a custom **Bypass** rule was added on the **www.authorloft.com** project for `/sitemap.xml` and `/robots.txt` so Bot Protection no longer challenges crawlers, IndexNow pings, or unverified SEO clients hitting these files.

- **Stripe Connect onboarding — novice-friendly guidance batch** — new authors said Stripe setup felt intimidating, so the whole flow got a calm, hand-holding pass:
  - **Help Centre — Payments & Stripe topic** rewritten and expanded. Flagship `ha06` ("How do I connect Stripe to receive payments?") rewritten as a 5-step plain-English walkthrough. Three new articles added: `ha_stripe_what` ("What is Stripe and why do I need it?" — explains the two-Stripe concept so authors stop confusing their subscription with Connect), `ha_stripe_info` ("What information will Stripe ask me for?" — previews every field so nothing feels sudden), `ha_stripe_fee` ("How does AuthorLoft's 10% platform fee work?"). Sort order reshuffled so the conceptual articles come before the how-to.
  - **Help Centre deep-linking** — `/admin/help?article=<id>` now auto-opens and scrolls to a specific article and auto-selects its parent topic. Powers the tooltip "Learn more" links and every help link on the settings page.
  - **`stripe-connect` tooltip refreshed** — content rewritten to set expectations ("about 5–10 minutes", separate from subscription); broken `learnMoreUrl` (`/admin/help#stripe-connect` — no anchor support existed) replaced with the new deep-link.
  - **Settings → Stripe Payouts copy overhaul** — "How payouts work" card rewritten in reassuring novice tone with the two-Stripe distinction up front and a "Read the full beginner's guide" link. Added a collapsible **What you'll need before you click Connect** checklist (personal details, bank, tax ID, sometimes ID photo) so authors can gather everything before starting. Added reassurance under the Connect button about progress being saved if they stop partway. Onboarding-incomplete state now links to the Stripe dashboard + the dedicated help article.
  - **Dashboard nudge banner** — new `<StripeConnectNudge />` appears on `/admin/dashboard` when an author has direct sales enabled on any book but hasn't onboarded Stripe yet. Dismissible (localStorage), links to Settings + the "What Stripe will ask for" article.

---

## June 22, 2026

- **Bookstore link in author nav (toggleable)** — author sites get a new "Bookstore" entry in the main nav (desktop + mobile) that cross-links to the AuthorLoft Bookstore on the platform, opens in a new tab with an external-link icon. New `Author.navShowBookstore` Boolean (default true, migration applied to Supabase) lets authors hide it from Pages & Navigation if they don't want to send visitors off-site.
- **Session ends when browser closes** — new client-side `SessionExpiryGuard` mounted in the shared session provider uses `sessionStorage` (auto-cleared on browser close) to detect a fresh browser open. When a leftover 24h NextAuth cookie is found, the user is silently signed out so the next interaction lands them on `/login` fresh — eliminates the stale-state errors on browser reopen. Safe in private/incognito mode and no-ops if storage is unavailable.
- **Theme polish on light palettes** — Classic + Minimal templates: section tint bumped from `accentColor + "0c"` (~5% opacity) to `"1f"` (~12%) so About/Series bands are visibly defined regardless of accent. Compact bio band on Minimal goes `"08"` → `"14"`. Four 96%-lightness theme backgrounds (nautical, aviation, scuba-diving, mountain-adventure) deepened to 93% with a touch more saturation so the base isn't stark white either.
- **Per-book QR code surfaced + features matrix** — admin Book edit: QR Code panel moved from Organisation tab to Details tab so authors find it without hunting. Public book detail page now shows a compact "Scan to share" QR in the desktop sidebar (under ISBN/pages) and the mobile meta block. New row added to `/features` matrix under Marketing & Communications: "Per-Book QR Code (download as SVG)" — all tiers.
- **Bookstore Quick View flicker fix** — modal now renders through a React portal to `document.body` so it escapes the `hover:-translate-y-0.5` transform on the Trending row's card. Previously a transformed ancestor turned `position: fixed` into "fixed within that ancestor," clipping the modal to the card bounds and producing flicker as hover toggled. Portal escapes every ancestor's containing block.
- **Pricing comparison — Quilltips column + paid-vs-paid framing** — `/pricing#comparison` now compares AuthorLoft **Standard ($19.99/mo)** against each competitor's entry paid tier (was Free vs paid). Quilltips column added between Tertulia and StoryOrigin at $4.99/mo (Plus tier). New dedicated `/compare/quilltips` SEO landing page (meta/OG, TL;DR, choose-us / choose-them, 17-row feature matrix with notes, core difference narrative, 5 FAQs) — picked up automatically by the dynamic `[competitor]` route and root sitemap.
- **Super Admin ordering controls** — up/down arrows on three admin tables that previously had a `displayOrder` / `sortOrder` column but no UI: Resources (controls homepage "Featured Resources" strip), Resource Downloads (controls public `/resources` page), and Content Categories (per type tab). Each move POSTs to a new `/reorder` endpoint that renumbers the affected list `0..n-1` in a single Prisma transaction — eliminates the duplicate-`displayOrder` no-op bug from the original swap-PATCH approach. Resources reorder also calls `revalidatePath("/")` so the homepage strip updates immediately instead of waiting up to 60s for ISR. Reorder failures now surface a visible alert so silent 401/404s aren't hidden.
- **Per-author sitemap.xml and robots.txt** — `/sitemap.xml` and `/robots.txt` now work on every author subdomain and custom domain. Middleware rewrites these paths on non-platform hosts to dedicated `/api/internal/sitemap` and `/api/internal/robots` handlers (bypassing the `(author-site)/[domain]` catch-all that was swallowing them and returning the author 404 page). The handlers read the request host header, look up the author by slug or custom domain, and emit URLs at the actual request host — works for `apbedford.authorloft.com`, `apbedford.staging.authorloft.com`, and custom domains alike. Author sitemap respects nav-visibility toggles (home, about, books + each published book, contact, blog + each published post, flip-books, custom pages). Robots disallows `/api/` and points crawlers at the sitemap. Platform `/sitemap.xml` and `/robots.txt` continue to be served by the root metadata files (unchanged).
- **Dashboard sitemap copy button** — added a one-click Copy button next to the sitemap URL pill on the "Your Site Pages" card, plus reworded the helper text to "Copy this sitemap URL and submit it to Google Search Console / Bing Webmaster Tools."
- **Cleanup — archived June 18 rebrand backups** — moved `page-original-jun18.tsx` and the `homepage-preview` route under `docs/archive/rebrand-jun18/` (with a README explaining how to restore) so the exploratory rebrand work is preserved out of the live build path.
- **UML PlantUML variants** — added `.puml` variants for the 4 architecture diagrams alongside the existing Mermaid versions in `docs/uml/`.
- **Supporting blog articles + cross-linking (Phases 4 & 5 — GEO hub-and-spoke)** — 15 new blog articles published to support pillar guides: 2 for media kits, 2 for affiliate programs, 2 for reader analytics, 2 for newsletters, 2 for ARC programs, 2 for branding/websites, 2 for self-publishing, 1 for direct sales. Each article links back to its pillar guide and relevant landing pages. All 10 guides updated with `relatedSlugsJson` cross-linking the new articles. 3 additional landing pages (book-pre-orders, author-affiliate-program, reader-analytics-for-authors) now link to their matching guides via `relatedGuideSlug`. Complete hub-and-spoke content architecture: landing pages ↔ guides ↔ blog articles.
- **Guide content published (Phase 3 — GEO pillar pages)** — 10 evergreen pillar guides published via CMS: What Is an Author Website?, What Is Direct Book Selling?, What Is an ARC Program?, What Is an Author Newsletter?, What Is Author Branding?, What Is an Author Media Kit?, What Is Book Launch Marketing?, What Is Self-Publishing?, What Is an Author Affiliate Program?, What Is Reader Analytics for Authors?. Each guide has rich HTML content with comparison tables, step-by-step instructions, 5 FAQs (generates FAQPage JSON-LD), cross-linked related blog posts, customized CTA blocks, SEO titles/descriptions/focus keywords, and category tags. Listed in llms-full.txt.
- **Solutions nav dropdown + Features page deep-dive links** — Added "Solutions" mega-dropdown to the main marketing nav (desktop: 4-group 2-column layout; mobile: full list under Solutions heading) linking all 11 commercial landing pages. Added "Explore each feature in depth" card grid to the Features page with 11 cards linking to landing pages. Cross-links landing pages from the main navigation so visitors and search engines can discover them.
- **Commercial landing pages (Phase 2 — GEO high-intent keywords)** — 11 static commercial landing pages targeting high-intent search queries: `/author-website-builder`, `/sell-books-directly`, `/book-marketing-platform`, `/author-newsletter-platform`, `/arc-management`, `/author-media-kit`, `/ai-tools-for-authors`, `/indie-author-bookstore`, `/book-pre-orders`, `/author-affiliate-program`, `/reader-analytics-for-authors`. Data-driven architecture: shared `LandingPageData` type + `LANDING_PAGES` record in `src/lib/landing-page-data.tsx`, shared `LandingPage` rendering component with brand-consistent styling (navy/bone/brass palette, MarketingPageHeader hero, check-mark bullet sections, FAQ accordion, CTA block). Each page includes WebPage + FAQPage JSON-LD with BreadcrumbList and SpeakableSpecification, full OG/Twitter meta, canonical URLs, and related guide cross-links where applicable. Added to sitemap (priority 0.8) and `llms.txt`/`llms-full.txt`. Zero new dependencies.
- **Guides infrastructure (Phase 1 — GEO content hub)** — New CMS-managed Guide content type for evergreen pillar pages that build topical authority for AI search engines. Full stack: `Guide` Prisma model + Supabase migration with GRANTs, Super Admin CRUD (list/create/edit at `/super-admin/guides`), public pages at `/guides` (index) and `/guides/[slug]` (detail). Each guide supports rich HTML content, inline FAQ section (generates FAQPage JSON-LD), related blog post slugs (auto-fetches and links published posts), customizable CTA block, cover image, SEO fields (title/description/focus keyword), and publish/draft toggle. Guide detail pages include Article + BreadcrumbList + FAQPage structured data with SpeakableSpecification. Added "Guides" to Super Admin sidebar (Marketing group), main nav Resources dropdown, mobile menu, footer, sitemap (priority 0.85), and llms.txt/llms-full.txt. IndexNow ping on publish. Zero new dependencies.
- **Codebase cleanup — dead code removal + broken link fixes** — Removed 11 orphaned/unused files: archived homepage backup (`page-original-jun18.tsx`), 3 unused lib files (`error-handler.ts`, `placeholder-data.ts`, `templates.ts`), 7 unused components (`onboarding-modal`, `action-icons`, `book-carousel`, `buy-button`, `newsletter-form`, `bookstore-hero-social`, `browser-mockup`). Fixed 2 broken links: register page "resend email" link now correctly points to `/verify-email/invalid` (was `/resend-verification` — no such route); accept-terms "sign out" link now uses NextAuth `signOut()` instead of non-existent `/api/auth/signout` route. Cleaned up 5 commented-out `@/lib/prisma` import lines in super-admin files left over from a DB module rename.
- **GEO search readiness — full structured data + AI crawler optimization** — Comprehensive Generative Engine Optimization pass to make AuthorLoft fully discoverable by AI-powered search engines (Google AI Overviews, Perplexity, ChatGPT, Claude). Changes: (1) Enhanced `llms.txt` + new `llms-full.txt` for AI crawlers with full platform description, features, pricing, and page index. (2) `WebSite` + `SearchAction` JSON-LD schema on root layout so search engines understand site-wide navigation. (3) `SoftwareApplication` schema on `/features` with tiered pricing offers. (4) `Person` JSON-LD on author about pages (`/[domain]/about`) with bio, image, social `sameAs` links, and credentials. (5) `BreadcrumbList` schema on 10+ page types: blog posts, news posts, FAQ, bookstore, bookstore genres, resources, features, pricing, and comparison pages. (6) Explicit AI bot rules in `robots.txt` for GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Amazonbot, and Google-Extended — all allowed on public content. (7) Blog RSS feed (`/blog/rss.xml`) matching the existing news RSS. (8) Blog index metadata updated with RSS alternate link. (9) Homepage `WebPage` + `HowTo` + `FAQPage` schemas with `SpeakableSpecification`. (10) Author site `WebSite` JSON-LD on every author page layout (publisher as Person). (11) OG `article:author`, `article:section`, `article:tag` meta on blog + news posts. (12) `SpeakableSpecification` on blog Article, news NewsArticle, and FAQ page schemas. (13) Enhanced author cross-reference on book pages (Person links to about page with `sameAs` + profile image). (14) `AggregateRating` on book detail pages computed from editorial reviews + approved reader feedback.

## June 20, 2026

- **Social Promote — back-burner items shipped (Sentry + News + Abuse + Prompt tuning) + cost-ceiling precision fix** — Wired Sentry `captureException` into every FAILED generation with `feature:social-promote` + `phase:ai-generate` tags + extras (authorId, platform, model, tokens). News context now selectable in the author UI — author-context loads the 20 latest published news posts and the Step 1 card gets a third tile (📰 AuthorLoft News) with a dropdown. New hourly cron `/api/cron/social-promote-abuse-check` (schedule `15 * * * *`): groups last-24h gens by author + IP, flags any author ≥ max(20, 5×avg) and any IP ≥ 100, digests via one email to `adminAlertEmails`. Prompt tuning: SYSTEM_PROMPT now includes 6 writing rules (lead with a hook, no "delve into" / "tapestry" AI-tells, first-person when voice set, platform-native style notes) + 4 new template tokens (`book.shortDescription`, `book.description`, `news.excerpt` plus existing). Cost-ceiling fields migrated to microcents — `costWarnCentsPerDay`/`costDisableCentsPerDay` → `costWarnMicroCentsPerDay`/`costDisableMicroCentsPerDay` so admins can set test values as small as $0.0001/day; defaults preserved ($50 warn / $200 disable). Settings form accepts 4-decimal input with min=0.
- **Marketing — Features page + Roadmap cleanup + hero pacing** — Features page gets a new Social Promote section under AI & Automation (STANDARD = 6 platforms, PREMIUM = +LinkedIn/TikTok, plus sub-bullets for 14 promo types and custom voice). Roadmap pruned: removed Affiliate Payouts (shipped Jun 12) and Reader Tiers / Patreon (promoted to feature inventory); moved Dynamic OG Images out of features into roadmap. Added Author Mobile App. Hero pain-card rotation tightened from 6s → 4s.
- **UML docs** — New `docs/uml/` directory with 4 Mermaid diagrams for documentation/onboarding: architecture (Vercel + Supabase + externals + cron table), ERD (core domain + Social Promote tables), user-flow (visitor → author → reader), social-promote-sequence (generation + abuse-check + kill-switch precedence). README explains export options (mermaid.live, mermaid-cli).
- **Social Promote MVP — Session 1: data model (dev only, gated off)** — Added Prisma schema + Supabase migration for AI social post generator (Phase 1). 4 new tables (`SocialPromotePlatform`, `SocialPromoType`, `GeneratedSocialPost`, `SocialPromoteSettings`), 2 extensions (`Author.socialVoiceDescription`, `Plan.socialDailyLimit`/`socialMonthlyLimit`). RLS enabled (deny via PostgREST, Prisma bypasses), GRANTs to all 4 roles. Seeded 5 platforms (FB, IG, X, LinkedIn, TikTok) + 14 promo types + singleton settings row (feature gated off by default via `SocialPromoteSettings.enabled = false`). Plan limits set: STD 30/day 300/mo, PREM 100/day 1000/mo, FREE excluded.
- **Social Promote — hashtag chips + cost-ceiling alerts + dropdown context** — Result card now extracts every `#tag` from the generated post and shows them as removable chips. Click to strike through and remove from the copy; click again to restore. Char counter recalculates from the modified text. Cost-ceiling triggers are wired: after every successful generation, if today's spend just crossed the warn ceiling → admin alert email; if it crossed the auto-disable ceiling → `SocialPromoteSettings.enabled` flips to false (authors instantly see the unavailable card) plus a separate "auto-disabled" alert email. Stateless (uses "just crossed" math), best-effort (never blocks the gen). Recipients pulled from `SocialPromoteSettings.adminAlertEmails` or `SOCIAL_PROMOTE_ADMIN_EMAILS` env fallback. Plus: promo type dropdown on the Promote page now shows description inline (e.g. "Sale / Discount — Promote a limited-time price drop") so authors get context while picking.
- **Social Promote — UX revamp + 3 more platforms** — Promote page rebuilt for clarity: no pre-selected defaults (forces deliberate choices to prevent accidental token burn), each step is its own visually distinct card (active = purple 2px border, complete = green, pending = collapsed dim header), step gating (step 2 hidden until step 1 done, step 3 hidden until step 2 done), inline selection summaries, compact layout (platforms 4-per-row, promo type as dropdown with description below). Generate card spells out exactly what's still missing. Added "Start over" button. Reddit, Threads, Bluesky platforms added to the live DB (8 platforms total now) with platform-specific prompt addenda. Bundled polish: "Edit full promo type" link in Super Admin Prompts editor now auto-opens the edit modal for that promo via `?edit=<slug>` deep link.
- **Social Promote MVP — Session 5: Author UI live** — Authors on Standard or Premium now see a **"Promote"** entry under the Tools sidebar group, leading to `/admin/promote`. Three-step main flow: 1) pick what the post is about (one of their published books or a free-text topic), 2) pick platform (FB/IG/X/LinkedIn/TikTok — LinkedIn + TikTok shown locked with a Premium badge for Standard plans), 3) pick promo type (auto-filtered to the eligible ones for the chosen context + platform). Plus a collapsible "Your voice" card at top with a 500-char description that flavors every generation (auto-saves via new `/api/admin/social-voice` PATCH endpoint, opens by default if blank). Usage chip shows daily + monthly counts vs plan limits. Generate streams to the result card with a Copy button (hits `/api/social-promote/copied/[id]` on click — drives the copy-rate success metric) and a "Try another angle" button to regenerate same-inputs. Friendly empty states for FREE (upgrade card linking to plans), platform kill switch, and daily cost-ceiling-reached. Plus the small "Manage in Promo Types →" link added to the Super Admin Prompts editor (jumps to the matching row with a highlight ring). Feature gate added: `/admin/promote: STANDARD`. tsc clean. **Settings.enabled still defaults false — flip it in Super Admin → Social Promote → Settings to expose the feature in prod.**
- **Social Promote MVP — Session 4: AI generation backend + Prompts page (dev only, gated off)** — Core generator landed. New utility lib at `src/lib/social-promote/`: `pricing.ts` (Gemini Flash / Flash Lite / Pro pricing, cost in micro-cents), `prompt-assembly.ts` (system prompt with prompt-injection defense via `<author_data>` delimiters, token substitution for `{{book.title}}` etc., per-platform addendum, output constraints), `limits.ts` (env + DB kill switches, daily cost-ceiling check, plan-tier daily/monthly limits), `generate.ts` (orchestrator with 30s server-side timeout, full logging on success AND failure). Author endpoint at `/api/social-promote/generate` (enforces rate-limit + kill switches + entitlement + Premium-only gating + context/platform restrictions, returns post text + maxChars). Mark-copied endpoint at `/api/social-promote/copied/[id]` (drives the copy-rate success metric). Super Admin **Prompts & Test** page at `/super-admin/social-promote/prompts` — pick a promo type, edit template + description inline, "Test live" runs against any platform/book/topic with the unsaved draft, shows output + token count + cost + assembled prompt (debugging fold-out). Plus settings page now has a "How are costs calculated?" reference modal with per-gen math, daily-spend table, and recommended ceilings by stage. Cost ceiling still platform-only — auto-disable + alert emails arrive in Session 7. tsc clean. Settings.enabled still defaults `false` so this is dormant in prod; flip it after Session 5 (author UI) ships.
- **Social Promote MVP — Session 3: Settings + Generation Log (dev only)** — Two new Super Admin pages. `/super-admin/social-promote/settings` edits the singleton: kill switch (with prominent green/amber status card), model picker (Gemini Flash / Flash Lite / Pro), generation timeout, max output tokens, per-day cost ceilings (warn email + auto-disable, edited in USD), admin alert emails. `/super-admin/social-promote/log` lists `GeneratedSocialPost` rows with filters (status, platform, promo type, date range), 4 stat cards (total, success, failed, total cost), 50/page pagination, and a side-drawer preview showing the exact prompt sent to the model, output, tokens, cost, IP, and copied-state. Empty until author UI ships in Session 5. Prompts page deferred to Session 4 so "test live" can ride on top of the AI backend.
- **Social Promote MVP — Session 2: Super Admin Platforms + Promo Types CRUD (dev only)** — New "Social Promote" sidebar group with two pages: `/super-admin/social-promote/platforms` (CRUD for platform configs — name, max chars, hashtag style, prompt addendum, Premium-only flag) and `/super-admin/social-promote/promo-types` (CRUD for promo templates — prompt template with token guidance, applicable contexts, applicable platforms). Both follow the locked admin button standard (Check=Save, Plus=Add, Trash2=Delete, ghost=Cancel). Delete is blocked when any `GeneratedSocialPost` references the row — admins are told to deactivate instead. All routes guarded by `requireSuperAdminId`.
- **Homepage messaging rewrite — pain-first framing** — Rewrote all homepage copy from feature-first ("Build your author business") to pain-first ("You wrote the book. Own the business."). Hero book stack replaced with cycling pain→solution image cards (5 cards, background photos, 6s rotation). Genre section, journey, stats bar, and final CTA all rewritten. Removed "rent/renting" language in favor of "someone else's" / "middleman" framing.
- **SVG logo sitewide** — Replaced PNG logo with SVG text logo (gold "Author" + ink/bone "Loft") across homepage hero, marketing nav, midnight hero, and all legal pages (terms, privacy, GDPR, US privacy). Consistent on both light and dark backgrounds.
- **Subpage copy alignment** — Updated CTAs on blog, news, comparison pages, demo banner, and all legal pages from "Build your author site" to "Own your author business." Global layout meta description updated to pain-first framing.
- **Hero layout refinements** — Removed eyebrow pill badge, reduced hero height (92vh → 72vh), increased stats bar sizing, updated "5 minutes" to "15 minutes" throughout.

## June 18, 2026

- **Super Admin FAQ moved to Marketing** — FAQs has its own dedicated page at `/super-admin/faqs` under the Marketing sidebar group (was buried in Platform Settings → Content tab). Settings page no longer fetches or renders FAQs.
- **FAQ reorder UX** — up/down arrow buttons on each FAQ row in `FaqsPanel`; clicking swaps `sortOrder` with the adjacent item and updates the list in-place. No more opening the edit modal to change a sort number.
- **Homepage rebrand live** — Promoted `/homepage-rebrand` to the live homepage at `/`. New positioning: "author growth platform" instead of "website builder." Features: 4-step journey (Go Live → Sell → Grow → Track), integrated tools section (Stripe, Mailchimp, PostHog, Gemini), elevated AI features (6-card Premium suite). Updated metadata: OG image, Twitter card, canonical, structured data. Old homepage archived as `page-original-jun18.tsx`. Rebrand components moved to `src/components/marketing/` for reuse.

## June 17, 2026

- **FAQ category filter** — pill-chip row ("All" + each category) above the accordion on `/faq`; clicking a chip shows only that category's questions. Client-side only, no page reload.
- **Bookstore listing limit by plan tier** — new `bookstoreListingLimit` field on `Plan` (-1 = unlimited, 0 = none, n = max). Enforced server-side in the book save API; configurable per-plan via Super Admin Plan form with presets + custom input.
- **Resource download detail pages** — `/resources/[slug]` SEO landing pages for each published `ResourceDownload`, rendering the RTE `body` field with cover, description, and download button. Cards on `/resources` now link to each detail page. Added to sitemap.
- **Auto pre-order launch email** — new `autoSendLaunchEmail` opt-in toggle on the book pre-order section. A new daily cron (`/api/cron/launch-preorders`, 08:00 UTC) fires when `preOrderDate` has passed; passes a readiness gate (published + cover + buy option) before sending; flips `isPreOrder` off automatically. Manual override button unchanged.

## June 16, 2026 — Admin CRUD UI standardization (rolling)
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
Locked and applied a consistent button/icon standard across the entire admin section. Standard: **Check icon = Save/Update**, **Plus icon = Create/Add**, **Trash2 icon = Delete**, **ghost variant = Cancel** (no fill), **danger variant = muted-to-red delete** (not solid red). Rolling out in 7 commits:
- **Foundation:** reconciled `IconButton` variants; updated `ICON_BUTTON_GUIDE.md`; converted Direct Sales and Audio Previews row actions.
- **Page-level Add buttons** swept across all admin list pages (affiliate, pre-orders, resources, specials, ARC, etc.) — now consistently use accent `Button` with Plus icon.
- **Book edit tabs** fully standardized: Buy Links (retailer-links), Audio Tracks, Reviews, Direct Sales inline forms — Check on Save, ghost Cancel, Trash2+danger on Delete.
- **`button.tsx` danger variant** updated from solid red fill to muted-to-red (`text-slate-500 hover:text-red-600 hover:bg-red-50`) per CRUD style guide.
- **Special, Flip Book, Blog/News Post, Custom Pages, Media Kit, Legal Notice, Legal Editor** — all Save/Create/Delete/Cancel buttons updated to match locked standard.
- **ARC tab** — "Create ARC" gets Plus icon. **Book Excerpt** — "Save Excerpt" gets Check icon.
- **Discount Codes, Newsletter** — Cancel buttons in edit modal and send confirmation corrected from outline to ghost.
- **Settings page** — "Remove Key" buttons use `danger` variant (was outline+manual red className); "Delete Account" gets Trash2 icon; Save Key/Save New Key buttons get Check icon.
- **Super-admin Categories** — all 3 hand-rolled purple buttons converted to `Button` component: Add (Plus), Save (Check), Cancel (ghost).
- **Super-admin Coupons** — all 3 hand-rolled purple buttons converted to `Button` component: New Coupon (Plus), Create Coupon (Plus), Cancel (ghost).
- **Super-admin Author edit form** — 5 hand-rolled blue/indigo/purple buttons converted to `Button` component: Grant/Update Trial (Check), Assign Coupon (Tag), Save AI Cap (Check), Reset AI Counter (outline), Save Changes (Check).
- **Appearance page** — 2 "Apply Colour" buttons + 2 revert/reset buttons converted from hand-rolled purple to `Button` component.
- **Super-admin Resources + Resource Downloads** — Add/Save/Cancel buttons in both clients converted from hand-rolled purple to `Button` component.
- **Super-admin Blog + Plans list pages** — header "New Post" / "New Plan" nav links converted from purple to `bg-[var(--accent)]` primary button styling with Plus icon.
- **Super-admin Authors table** — confirm-delete dialog: Cancel → ghost, "Yes, delete" → danger + Trash2 + loading state.
- **`/admin-buttons` skill** added at `.claude/commands/admin-buttons.md` — run `/admin-buttons` to audit any file/directory for non-standard buttons, `/admin-buttons --fix` to auto-apply the locked standard.
- **`src/components/super-admin/` full sweep** (21 files) — the entire shared super-admin component directory (FAQs, Testimonials, Support Emails, Feature Config, Platform Post, Social Post, Welcome Email, Help Article, Help Centre Admin, Plan Form, SEO Panel, Subscribers, Social Links, Social Platform Connect, Beta Mode, AI Cap Control, Marketing Hero Image, Maintenance Toggle, Signup Notifications, Plans Table, Mass Email) — all hand-rolled purple/blue/red/gray-900 buttons converted to the locked `Button`/`IconButton` standard.

## June 16, 2026 — Book edit UX polish batch
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Sticky book title** — the accent-colored book title now stays pinned to the top of the edit screen while you scroll, so it's always clear which book you're working on.
- **Accurate first-book guidance** — the green "what to do next" banner now references the real tab names (**Direct Sales**, **Buy Links**) and correctly explains that Details/Organisation use Save Changes while other tabs save as you go (removed the inaccurate "everything auto-saves" line).
- **Unsaved-changes guard** — editing fields on Details/Organisation and then closing the tab or hitting Cancel now prompts "You have unsaved changes" instead of silently discarding them.
- **Ctrl/Cmd+S to save** the book form from anywhere on the page.
- **"Readers captured" count** — each Reader Magnet edition now shows how many readers have claimed it, right in the Direct Sales editor (powered by a `magnetLeads` count on the list API).
- **Consistent "Saved" feedback** — Direct Sales actions (add format, file upload, toggle magnet/active, edit, remove) now show a success toast, matching the "Saved ✓" confirmation on the main form.

## June 16, 2026 — Book edit UX: stay on tab after save + prominent title
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Saving a book no longer kicks you back to the book list.** On the Details/Organisation tabs, "Save Changes" now keeps you exactly where you are (same tab) and shows a brief "Saved ✓" confirmation, instead of navigating away to `/admin/books`. First save of a brand-new book still opens the edit screen as before.
- **Book title is now prominent on the edit page** — the book's name is the large, accent-colored heading (with a small "Editing book" eyebrow) so it's always clear which book you're working on.

## June 16, 2026 — Reader Magnets decoupled from Stripe + available on all plans
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Reader Magnets reworked to be simple and Stripe-independent.** A Reader Magnet is now understood as "give this edition away free in exchange for a reader's email" — it never touches Stripe, since no money changes hands. Changes:
  - **Available on every plan** (FREE/STANDARD/PREMIUM), not just paid plans. Free-plan authors see a "Free Reader Magnets" mode in the Direct Sales tab: add a downloadable format, upload a file, and it's automatically offered free (no price field, no Stripe).
  - **The full-screen "Connect Stripe" wall is gone.** The Direct Sales tab always shows the editions list + Add Format. Stripe is now a non-blocking banner that only matters for *paid* editions.
  - **Reader Magnet is a non-destructive override** (paid plans): toggling "Give it away free" on a paid edition gives it away for an email while *preserving the price* — toggle off to sell it again. Great for launch-week giveaways.
  - **Stripe enforced only where money is involved:** a paid edition can only go live (activate) and appear publicly with a paid plan **and** a connected Stripe account — so a "Buy" button never shows when the author can't receive payment. Magnets are unaffected.
  - **Public book page**: free gift button shows whenever a magnet edition with a file exists, independent of plan/Stripe/the "Enable Direct Sales" switch.
  - Files touched: public book page, `direct-sales` create/activate APIs, `DirectSalesItems` admin component, `BookForm` copy. Billing link from the Enable Direct Sales toggle (earlier today) retained.

## June 16, 2026 — QR Code Generator + Reader Magnet + US Privacy
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Book QR Code** — the Organisation tab of every book in admin now includes a **QR Code card** showing a scannable QR code that links directly to the book's public URL. One click downloads the code as an SVG file, ready to drop into bookmarks, event table cards, author swag, newsletters, or printed materials. No plan restriction — available on all tiers. *(zero schema changes; `react-qr-code` SVG component)*
- **Reader Magnet** — authors can now mark any direct sale file as a free reader magnet (toggle appears on items with a file uploaded). On the public book page, magnet items show a **"[Format] — Free"** gift button instead of a buy button. Readers click it, enter their name and email, and instantly receive a **time-limited download link** by email (7-day expiry, up to 3 downloads). The reader is simultaneously added to the author's newsletter subscriber list. Replaces the need for BookFunnel for list-building. New DB table `BookMagnetLead`; new API routes `POST /api/author/reader-magnet` and `GET /api/reader-magnet/download/[token]`; rate-limited at 5 requests/IP:email/hour. *(STANDARD and PREMIUM plans)*
- **US State Privacy page** — `/us-privacy` now live; California, Virginia, Colorado, and other state privacy rights (opt-out of sale/sharing, deletion, correction requests). Linked from the Privacy Policy and GDPR pages.

## June 16, 2026 — Sales Revenue Charts + Book Launch Mode
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Sales Revenue Charts** — three new data panels on the `/admin/sales` dashboard sitting between the stat cards and the orders table. A period selector (30 days / 90 days / 12 months) controls all three simultaneously: an **Area Chart** traces revenue day by day over the selected window, a **Horizontal Bar Chart** ranks your top 10 books by revenue earned, and a **Format Breakdown** shows the percentage split across eBook, Audio, Flip Book, and Print with progress bars. All data comes from your real completed orders — no estimates. Powered by Recharts; live-reloads on period change without a page refresh. (STANDARD and PREMIUM plans)
- **Book Launch Mode — Countdown Timer** — a new "Launch Countdown" toggle in each book's Organisation tab (Visibility & Publishing section). Enable it, set a launch date and time, save — and a live days/hours/minutes/seconds countdown appears on your public book page in your site's accent color. It counts down to the second and disappears the moment the date passes, automatically, with no further action needed. Use it alongside the existing Pre-order Coming Soon feature, or standalone for a relaunch, paperback drop, or limited-time event. (All plans)
- **Launch Toolkit panel** — a new card appears on the Organisation tab every time you edit a book. It shows a 5-point **readiness checklist** (cover uploaded, description added, genre assigned, sales or buy links configured, published or pre-order active) with a live done count so you can spot what's still missing before launch day. Below that, a pre-written **social announcement** ("🚀 My new book [Title] is live — [URL]") is ready to copy with one click for Instagram, X/Twitter, Facebook, or LinkedIn. No formatting needed.

## June 16, 2026 — Admin Books: rich Status column
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Books list Status column** — the single Published / Draft badge on the `/admin/books` list is replaced by a richer set of badges showing all five Visibility & Publishing flags at once. The primary badge reflects the real state — **Pre-order** (blue clock), **Published** (green), or **Draft** (amber). Up to three secondary badges then appear inline: **Featured** (amber star, appears when the book is the homepage hero), **Direct Sales** (blue cart, appears when direct selling is enabled), and **Bookstore** (purple store, appears when listed in the AuthorLoft Bookstore). At a glance you can see exactly how each book is configured without clicking into it.

## June 16, 2026 — Feature Matrix updated + code quality pass
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Feature Matrix** (`docs/FEATURE_MATRIX.md`) overhauled as the canonical "what's built" reference — expanded Super Admin section with 15+ previously undocumented features (Resources CMS, FAQ Manager, Content Categories, Social Poster, ARC Management, Bookstore Management, etc.); Analytics section split into stat cards vs. revenue charts; Book Launch Mode, Per-Author Social Posting, and Shareable Promo Graphics added to Upcoming; quick-reference note added at top so future sessions check the matrix first and skip the code dive
- **Code quality / security review** — all findings from a full codebase review addressed: coupon validation (allowlist for currency/duration/discount-type; percent cap at 100; name non-empty check); OG image URL validation (must be `https://` + image extension); OG upload 5 MB file-size cap before reading to memory; Stripe subscribe route merged a duplicate Prisma query; trial days display guarded against negative values; author coupon assignment API wrapped in try/catch with correct 404 vs 500 responses

## June 15, 2026 — Bookstore card cleanup: price in body, modern vertical card
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Price moved off the cover into the card body** on every card (vertical New/Trending cards + All Books list cards), shown alongside the title/author/rating data (green for "Free"). No more price chip overlapping the cover art
- **Modernized the vertical card** (New on the Shelf + Trending): a single priority badge instead of a stack, removed the "Buy on Author's Site" CTA (the whole card already links to the book), and a hairline divider + standalone "Quick view" action. Card is now a client component that self-manages its Quick View modal, so it works inside the server-rendered showcase rows
- Trending cards now expose Quick View; the All Books list cards are unchanged except for the added price

## June 15, 2026 — Bookstore "All Books" layout redesign
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Compact horizontal list cards** — the All Books catalog moved from a 4-up vertical-cover grid to a denser 3-up grid of horizontal cards (cover left; title, author, rating, genres right). Drops price + the "Buy" CTA from the card — those live in Quick View and on the book page. New `bookstore-list-card.tsx`; the curated New/Trending rows keep their vertical covers so the two zones read differently
- **Whole card + cover** still open the book (stretched link); the **author name** links to the author's site; **Quick view** fades in on hover (always visible on touch, keyboard-focusable) and opens the existing modal
- **Per-page selector** — All Books defaults to 24/page with a "Show 24 / 48 / 96" dropdown (only appears once there are more than 24 results); numbered pagination retained for SEO/deep-linking

## June 15, 2026 — Backlog batch: 5 small features
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Clickable author name on bookstore cards** — the card was a single wrapping link, so the author name couldn't be its own link. Restructured `bookstore-book-card.tsx` with a stretched-link pattern: the whole card still opens the book, while the author name links separately to the author's site. Added `authorUrl` to the bookstore data. Applies to grid + New/Trending rows
- **Bookstore quick-view modal** — a "Quick view" button on each catalog card opens a modal (cover, blurb, rating, formats, price, genres, author link, "Buy on Author's Site" CTA) without leaving the store. New `bookstore-quick-view.tsx`; state lifted into the (already client) `BookstoreGrid`; closes on backdrop/Esc with body-scroll lock. Added a stripped `description` to the bookstore data
- **Email the gated download** — unlocking an email-gated resource now also emails the lead a copy of the download link (`sendResourceDownloadEmail`), in addition to the instant link. Best-effort — never blocks the unlock
- **Saved CSV column-mapping presets** — the Book import wizard's Map step can now save/load/delete named column mappings for re-use on another CSV from the same source. Browser-local (`localStorage`, `src/lib/csv-import-presets.ts`) — no account binding, no migration
- **Publish News post → email subscribers (one-click)** — a checkbox on published News posts emails the issue (headline, excerpt, cover, read link) to confirmed `PlatformSubscriber`s, reusing the broadcast batch infra. New `POST /api/super-admin/blog/posts/[id]/email`, a platform-subscriber unsubscribe route (`/api/newsletter/unsubscribe/platform`), and a `PlatformPost.newsEmailedAt` timestamp that guards against double-sends. **DB:** additive nullable column `PlatformPost.newsEmailedAt` (apply to Supabase before promoting)

## June 15, 2026 — GEO: comparison pages (BookFunnel, StoryOrigin, Tertulia)
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Three "vs" comparison landing pages** (GEO/SEO assets from the AI-visibility plan): `/compare/bookfunnel`, `/compare/storyorigin`, `/compare/tertulia`. Each has the shared brand-band header, "choose which" cards, a feature comparison table, core-difference prose, and an FAQ section with `FAQPage` structured data (high-value for AI extraction)
- **Refactored to a single dynamic route** `/compare/[competitor]` + a `comparison-data.tsx` source of truth and a shared `ComparisonPage` component (the original static bookfunnel page was folded in). Adding a competitor is now a data-only change; `sitemap.ts` generates entries from the same list
- **Accuracy checked** against each product's real positioning (web-verified): BookFunnel = delivery/reader-magnets; StoryOrigin = author marketing toolkit (newsletter swaps — credited as its win); Tertulia = reader discovery app with a basic author site that links out to retailers. Comparisons are fair, not hit pieces
- **Meta descriptions trimmed to ≤155 chars** (the BookFunnel one was 174); brandless titles (template brands once), canonicals, OG images; pricing page links to all three
- **Cross-linking** — the pricing comparison grid's column headers (Tertulia/StoryOrigin/BookFunnel) now link to their `/compare/*` page, and each comparison page has a "← Back to pricing & comparisons" link at the top (previously only the bottom-CTA "See pricing" existed)

## June 15, 2026 — Genre page SEO title fix
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Bookstore genre `<title>` fixed** — genre pages were the only page hardcoding the brand in the top-level title, so the root `%s | AuthorLoft` template produced a doubled brand ("… | AuthorLoft Bookstore | AuthorLoft") plus a "Books Books" redundancy and dropped the apostrophe (slug-derived "Childrens" vs "Children's"). `generateMetadata` now uses the real genre name, avoids the duplicate "Books", and sets a brandless title so the template brands it once. (SEO audit also confirmed: sitemap covers all public pages incl. blog/news/genre, no admin URLs leak, robots disallows private areas, all 15 marketing pages carry canonicals)

## June 15, 2026 — Unify bookstore genre-page header
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Super Admin nav: Content Categories moved Platform → Marketing** — it powers the blog/news/resource/FAQ category dropdowns, so it sits more naturally under Marketing alongside Blog & News and Resources
- **Genre pages use the shared brand band** — `/bookstore/genre/[slug]` had its own older brown-gradient hero; it now uses the shared `MarketingPageHeader` (same navy band + `/bookstore-header.png` banner as the main Bookstore/Blog/News pages), with the genre name as the title and an "All books" breadcrumb above the grid

## June 14, 2026 — Quick wins: dashboard/nav fixes, book views, News RSS
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Dashboard "Upgrade" no longer shows on Premium** — the Current Plan card always rendered an "Upgrade" button; it now shows "Manage" on PREMIUM (and links to `?tab=billing`), "Upgrade" on FREE/STANDARD
- **Admin sidebar: Light mode + Sign Out flow with the menu** — moved them out of the pinned bottom bar into the nav flow, directly after the last menu item, so they shift up/down dynamically as groups open/close (no more fixed gap)
- **Bookstore "Trending Now" now has data** — `Book.views` was never incremented anywhere, so the views-sorted Trending row never appeared. Added a fire-and-forget view increment on author book-page visits
- **News RSS feed** — new `/news/rss.xml` (RSS 2.0, latest 50 published news posts); the `/news` page now advertises it via an `application/rss+xml` alternate link for feed-reader discovery

## June 14, 2026 — Mobile Support for Super Admin + Settings
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Feature Gates rows stack on mobile** — each gate row showed the label plus four tier buttons (FREE/STANDARD/PREMIUM/DISABLED) on one line, clipping the right-most buttons on phones. The row now stacks (`flex-col sm:flex-row`) with the buttons wrapping (`flex-wrap`), so all tiers are reachable. Verified on staging (overflow offenders 58 → 0). Desktop unchanged
- **Sidebar drawer now scrolls on mobile** — the sidebar `aside` used `min-h-screen`, so inside the fixed mobile drawer it grew taller than the viewport and the inner nav's `overflow-y-auto` never engaged, leaving the lower nav items (Super Admin section, Sign Out) unreachable. Changed to `h-full` so the aside is capped to the fixed drawer height (verified on staging: nav `scrollHeight > clientHeight`, bottom items reachable). Desktop unchanged (wrapper is content-height there, so `h-full` matches the prior `min-h-screen` behavior)
- **Super Admin is now mobile-capable** — the `/super-admin/*` layout previously rendered the 256px sidebar permanently with no hamburger, making it unusable on phones. It now reuses the author-side `AdminShell` (slide-in drawer + overlay + hamburger, responsive header/padding). Added an optional `headerBadge` slot to `AdminShell` so super-admin keeps its purple "Super Admin" badge in the top bar
- **Platform Settings sub-nav stacks on mobile** — the settings mega-page used a fixed `w-52` side rail in a row layout that squeezed content to ~140px on phones; it now stacks (`flex-col lg:flex-row`, full-width rail on mobile)
- Audit note: the author admin shell was already mobile-ready (drawer/hamburger since earlier work); most admin/super-admin data tables already use `overflow-x-auto` so they scroll horizontally on small screens. A device-width visual pass on staging is still recommended for dense tables and forms

## June 14, 2026 — Super Admin Menu Reorganization
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
- **Super Admin nav grouped** — the flat 15-item "Super Admin" list in the sidebar is now four collapsible groups: **Authors** (All Authors, Access Requests), **Billing & Plans** (Plans, Coupons, Feature Gates), **Marketing** (Blog & News, News Subscribers, Resources, Resource Downloads, Social Media), and **Platform** (Content Categories, Genres, Help Articles, Platform Legal, Platform Settings)
- **Platform Dashboard link added** — the super-admin sidebar now has a pinned link to `/super-admin` (the platform dashboard), which previously had no nav entry
- **Renames for clarity** — "Legal" → "Platform Legal", "Help Centre" → "Help Articles" (distinguishes the super-admin content-management pages from the author-side Help & Support); "Feature Gates" given a sliders icon
- Implemented in the shared `AdminSidebar` via a new `SuperNavGroupSection` (collapsible, per-group persisted open state, no feature-gating — super admins see everything). The `/super-admin/settings` mega-page (already internally tabbed) was left as-is
- Navigation/IA only; no routes, APIs, or permissions changed

## June 14, 2026 — Admin Menu Reorganization (author side)
_(confirmed live in prod Aug 9, 2026 — via `main`/`dev` sync, PR #138)_
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
