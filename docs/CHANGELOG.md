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

## June 25, 2026

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
_(on staging — not yet promoted to prod)_
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
_(on staging — not yet promoted to prod)_
- **Sticky book title** — the accent-colored book title now stays pinned to the top of the edit screen while you scroll, so it's always clear which book you're working on.
- **Accurate first-book guidance** — the green "what to do next" banner now references the real tab names (**Direct Sales**, **Buy Links**) and correctly explains that Details/Organisation use Save Changes while other tabs save as you go (removed the inaccurate "everything auto-saves" line).
- **Unsaved-changes guard** — editing fields on Details/Organisation and then closing the tab or hitting Cancel now prompts "You have unsaved changes" instead of silently discarding them.
- **Ctrl/Cmd+S to save** the book form from anywhere on the page.
- **"Readers captured" count** — each Reader Magnet edition now shows how many readers have claimed it, right in the Direct Sales editor (powered by a `magnetLeads` count on the list API).
- **Consistent "Saved" feedback** — Direct Sales actions (add format, file upload, toggle magnet/active, edit, remove) now show a success toast, matching the "Saved ✓" confirmation on the main form.

## June 16, 2026 — Book edit UX: stay on tab after save + prominent title
_(on staging — not yet promoted to prod)_
- **Saving a book no longer kicks you back to the book list.** On the Details/Organisation tabs, "Save Changes" now keeps you exactly where you are (same tab) and shows a brief "Saved ✓" confirmation, instead of navigating away to `/admin/books`. First save of a brand-new book still opens the edit screen as before.
- **Book title is now prominent on the edit page** — the book's name is the large, accent-colored heading (with a small "Editing book" eyebrow) so it's always clear which book you're working on.

## June 16, 2026 — Reader Magnets decoupled from Stripe + available on all plans
_(on staging — not yet promoted to prod)_
- **Reader Magnets reworked to be simple and Stripe-independent.** A Reader Magnet is now understood as "give this edition away free in exchange for a reader's email" — it never touches Stripe, since no money changes hands. Changes:
  - **Available on every plan** (FREE/STANDARD/PREMIUM), not just paid plans. Free-plan authors see a "Free Reader Magnets" mode in the Direct Sales tab: add a downloadable format, upload a file, and it's automatically offered free (no price field, no Stripe).
  - **The full-screen "Connect Stripe" wall is gone.** The Direct Sales tab always shows the editions list + Add Format. Stripe is now a non-blocking banner that only matters for *paid* editions.
  - **Reader Magnet is a non-destructive override** (paid plans): toggling "Give it away free" on a paid edition gives it away for an email while *preserving the price* — toggle off to sell it again. Great for launch-week giveaways.
  - **Stripe enforced only where money is involved:** a paid edition can only go live (activate) and appear publicly with a paid plan **and** a connected Stripe account — so a "Buy" button never shows when the author can't receive payment. Magnets are unaffected.
  - **Public book page**: free gift button shows whenever a magnet edition with a file exists, independent of plan/Stripe/the "Enable Direct Sales" switch.
  - Files touched: public book page, `direct-sales` create/activate APIs, `DirectSalesItems` admin component, `BookForm` copy. Billing link from the Enable Direct Sales toggle (earlier today) retained.

## June 16, 2026 — QR Code Generator + Reader Magnet + US Privacy
_(on staging — not yet promoted to prod)_
- **Book QR Code** — the Organisation tab of every book in admin now includes a **QR Code card** showing a scannable QR code that links directly to the book's public URL. One click downloads the code as an SVG file, ready to drop into bookmarks, event table cards, author swag, newsletters, or printed materials. No plan restriction — available on all tiers. *(zero schema changes; `react-qr-code` SVG component)*
- **Reader Magnet** — authors can now mark any direct sale file as a free reader magnet (toggle appears on items with a file uploaded). On the public book page, magnet items show a **"[Format] — Free"** gift button instead of a buy button. Readers click it, enter their name and email, and instantly receive a **time-limited download link** by email (7-day expiry, up to 3 downloads). The reader is simultaneously added to the author's newsletter subscriber list. Replaces the need for BookFunnel for list-building. New DB table `BookMagnetLead`; new API routes `POST /api/author/reader-magnet` and `GET /api/reader-magnet/download/[token]`; rate-limited at 5 requests/IP:email/hour. *(STANDARD and PREMIUM plans)*
- **US State Privacy page** — `/us-privacy` now live; California, Virginia, Colorado, and other state privacy rights (opt-out of sale/sharing, deletion, correction requests). Linked from the Privacy Policy and GDPR pages.

## June 16, 2026 — Sales Revenue Charts + Book Launch Mode
_(on staging — not yet promoted to prod)_
- **Sales Revenue Charts** — three new data panels on the `/admin/sales` dashboard sitting between the stat cards and the orders table. A period selector (30 days / 90 days / 12 months) controls all three simultaneously: an **Area Chart** traces revenue day by day over the selected window, a **Horizontal Bar Chart** ranks your top 10 books by revenue earned, and a **Format Breakdown** shows the percentage split across eBook, Audio, Flip Book, and Print with progress bars. All data comes from your real completed orders — no estimates. Powered by Recharts; live-reloads on period change without a page refresh. (STANDARD and PREMIUM plans)
- **Book Launch Mode — Countdown Timer** — a new "Launch Countdown" toggle in each book's Organisation tab (Visibility & Publishing section). Enable it, set a launch date and time, save — and a live days/hours/minutes/seconds countdown appears on your public book page in your site's accent color. It counts down to the second and disappears the moment the date passes, automatically, with no further action needed. Use it alongside the existing Pre-order Coming Soon feature, or standalone for a relaunch, paperback drop, or limited-time event. (All plans)
- **Launch Toolkit panel** — a new card appears on the Organisation tab every time you edit a book. It shows a 5-point **readiness checklist** (cover uploaded, description added, genre assigned, sales or buy links configured, published or pre-order active) with a live done count so you can spot what's still missing before launch day. Below that, a pre-written **social announcement** ("🚀 My new book [Title] is live — [URL]") is ready to copy with one click for Instagram, X/Twitter, Facebook, or LinkedIn. No formatting needed.

## June 16, 2026 — Admin Books: rich Status column
_(on staging — not yet promoted to prod)_
- **Books list Status column** — the single Published / Draft badge on the `/admin/books` list is replaced by a richer set of badges showing all five Visibility & Publishing flags at once. The primary badge reflects the real state — **Pre-order** (blue clock), **Published** (green), or **Draft** (amber). Up to three secondary badges then appear inline: **Featured** (amber star, appears when the book is the homepage hero), **Direct Sales** (blue cart, appears when direct selling is enabled), and **Bookstore** (purple store, appears when listed in the AuthorLoft Bookstore). At a glance you can see exactly how each book is configured without clicking into it.

## June 16, 2026 — Feature Matrix updated + code quality pass
_(on staging — not yet promoted to prod)_
- **Feature Matrix** (`docs/FEATURE_MATRIX.md`) overhauled as the canonical "what's built" reference — expanded Super Admin section with 15+ previously undocumented features (Resources CMS, FAQ Manager, Content Categories, Social Poster, ARC Management, Bookstore Management, etc.); Analytics section split into stat cards vs. revenue charts; Book Launch Mode, Per-Author Social Posting, and Shareable Promo Graphics added to Upcoming; quick-reference note added at top so future sessions check the matrix first and skip the code dive
- **Code quality / security review** — all findings from a full codebase review addressed: coupon validation (allowlist for currency/duration/discount-type; percent cap at 100; name non-empty check); OG image URL validation (must be `https://` + image extension); OG upload 5 MB file-size cap before reading to memory; Stripe subscribe route merged a duplicate Prisma query; trial days display guarded against negative values; author coupon assignment API wrapped in try/catch with correct 404 vs 500 responses

## June 15, 2026 — Bookstore card cleanup: price in body, modern vertical card
_(not yet promoted to prod)_
- **Price moved off the cover into the card body** on every card (vertical New/Trending cards + All Books list cards), shown alongside the title/author/rating data (green for "Free"). No more price chip overlapping the cover art
- **Modernized the vertical card** (New on the Shelf + Trending): a single priority badge instead of a stack, removed the "Buy on Author's Site" CTA (the whole card already links to the book), and a hairline divider + standalone "Quick view" action. Card is now a client component that self-manages its Quick View modal, so it works inside the server-rendered showcase rows
- Trending cards now expose Quick View; the All Books list cards are unchanged except for the added price

## June 15, 2026 — Bookstore "All Books" layout redesign
_(not yet promoted to prod)_
- **Compact horizontal list cards** — the All Books catalog moved from a 4-up vertical-cover grid to a denser 3-up grid of horizontal cards (cover left; title, author, rating, genres right). Drops price + the "Buy" CTA from the card — those live in Quick View and on the book page. New `bookstore-list-card.tsx`; the curated New/Trending rows keep their vertical covers so the two zones read differently
- **Whole card + cover** still open the book (stretched link); the **author name** links to the author's site; **Quick view** fades in on hover (always visible on touch, keyboard-focusable) and opens the existing modal
- **Per-page selector** — All Books defaults to 24/page with a "Show 24 / 48 / 96" dropdown (only appears once there are more than 24 results); numbered pagination retained for SEO/deep-linking

## June 15, 2026 — Backlog batch: 5 small features
_(not yet promoted to prod)_
- **Clickable author name on bookstore cards** — the card was a single wrapping link, so the author name couldn't be its own link. Restructured `bookstore-book-card.tsx` with a stretched-link pattern: the whole card still opens the book, while the author name links separately to the author's site. Added `authorUrl` to the bookstore data. Applies to grid + New/Trending rows
- **Bookstore quick-view modal** — a "Quick view" button on each catalog card opens a modal (cover, blurb, rating, formats, price, genres, author link, "Buy on Author's Site" CTA) without leaving the store. New `bookstore-quick-view.tsx`; state lifted into the (already client) `BookstoreGrid`; closes on backdrop/Esc with body-scroll lock. Added a stripped `description` to the bookstore data
- **Email the gated download** — unlocking an email-gated resource now also emails the lead a copy of the download link (`sendResourceDownloadEmail`), in addition to the instant link. Best-effort — never blocks the unlock
- **Saved CSV column-mapping presets** — the Book import wizard's Map step can now save/load/delete named column mappings for re-use on another CSV from the same source. Browser-local (`localStorage`, `src/lib/csv-import-presets.ts`) — no account binding, no migration
- **Publish News post → email subscribers (one-click)** — a checkbox on published News posts emails the issue (headline, excerpt, cover, read link) to confirmed `PlatformSubscriber`s, reusing the broadcast batch infra. New `POST /api/super-admin/blog/posts/[id]/email`, a platform-subscriber unsubscribe route (`/api/newsletter/unsubscribe/platform`), and a `PlatformPost.newsEmailedAt` timestamp that guards against double-sends. **DB:** additive nullable column `PlatformPost.newsEmailedAt` (apply to Supabase before promoting)

## June 15, 2026 — GEO: comparison pages (BookFunnel, StoryOrigin, Tertulia)
_(not yet promoted to prod)_
- **Three "vs" comparison landing pages** (GEO/SEO assets from the AI-visibility plan): `/compare/bookfunnel`, `/compare/storyorigin`, `/compare/tertulia`. Each has the shared brand-band header, "choose which" cards, a feature comparison table, core-difference prose, and an FAQ section with `FAQPage` structured data (high-value for AI extraction)
- **Refactored to a single dynamic route** `/compare/[competitor]` + a `comparison-data.tsx` source of truth and a shared `ComparisonPage` component (the original static bookfunnel page was folded in). Adding a competitor is now a data-only change; `sitemap.ts` generates entries from the same list
- **Accuracy checked** against each product's real positioning (web-verified): BookFunnel = delivery/reader-magnets; StoryOrigin = author marketing toolkit (newsletter swaps — credited as its win); Tertulia = reader discovery app with a basic author site that links out to retailers. Comparisons are fair, not hit pieces
- **Meta descriptions trimmed to ≤155 chars** (the BookFunnel one was 174); brandless titles (template brands once), canonicals, OG images; pricing page links to all three
- **Cross-linking** — the pricing comparison grid's column headers (Tertulia/StoryOrigin/BookFunnel) now link to their `/compare/*` page, and each comparison page has a "← Back to pricing & comparisons" link at the top (previously only the bottom-CTA "See pricing" existed)

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
