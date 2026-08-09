/**
 * AuthorLoft — Feature & Functionality Reference (DOCX generator)
 *
 * Usage:
 *   node scripts/build-feature-reference.js
 *   node scripts/build-feature-reference.js --out C:\path\to\output.docx
 *
 * Requires: npm install -g docx
 *
 * HOW TO UPDATE:
 *   1. Change LAST_UPDATED to today's date.
 *   2. Check docs/CHANGELOG.md for everything shipped since the previous date.
 *   3. Add/edit rows in the relevant section data arrays below.
 *   4. Run the script to regenerate the DOCX.
 *   No full rewrite needed — just append or update rows in the affected sections.
 */

// ── Last updated ──────────────────────────────────────────────────────────────
const LAST_UPDATED = "2026-06-16";

const path = require("path");
const os   = require("os");
const fs   = require("fs");

// Resolve docx: prefer global npm install, fall back to local node_modules
let docx;
try {
  docx = require("docx");
} catch {
  const globalPath = path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "docx");
  docx = require(globalPath);
}
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, BorderStyle, WidthType,
  ShadingType, HeadingLevel, PageNumber, PageBreak, TableOfContents,
} = docx;

// Output path — use --out flag or default to ~/Downloads/
const outFlag = process.argv.indexOf("--out");
const dateStamp = LAST_UPDATED.replace(/-/g, "");
const outPath = outFlag !== -1
  ? process.argv[outFlag + 1]
  : path.join(os.homedir(), "Downloads", `AuthorLoft_Feature_Reference_${dateStamp}.docx`);

// Cover/header display date e.g. "June 16, 2026"
const displayDate = new Date(LAST_UPDATED + "T12:00:00Z").toLocaleDateString("en-US", {
  year: "numeric", month: "long", day: "numeric", timeZone: "UTC",
});
const monthYear = new Date(LAST_UPDATED + "T12:00:00Z").toLocaleDateString("en-US", {
  year: "numeric", month: "long", timeZone: "UTC",
});

// ── Colours ───────────────────────────────────────────────────────────────────
const NAVY  = "1E3A5F";
const GOLD  = "C49A22";
const LGRAY = "F3F4F6";
const MGRAY = "E5E7EB";
const DGRAY = "6B7280";
const WHITE = "FFFFFF";

// ── Helpers ───────────────────────────────────────────────────────────────────
const border   = (c = "CCCCCC") => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const borders  = (c) => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });
const noBorder = () => ({ style: BorderStyle.NONE, size: 0, color: "FFFFFF" });
const noBorders = () => ({ top: noBorder(), bottom: noBorder(), left: noBorder(), right: noBorder() });

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial" })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
    spacing: { before: 400, after: 200 },
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial" })],
    spacing: { before: 300, after: 160 },
  });
}
function p(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, color: "374151" })],
    spacing: { after: 100 },
  });
}
function spacer(sz = 160) {
  return new Paragraph({ children: [new TextRun("")], spacing: { after: sz } });
}
function cell(text, w, { bold = false, shade = null, center = false, color = "374151", size = 20 } = {}) {
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: borders(MGRAY),
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    ...(shade ? { shading: { fill: shade, type: ShadingType.CLEAR } } : {}),
    children: [new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text, bold, font: "Arial", size, color })],
    })],
  });
}
function headerRow(cols, widths) {
  return new TableRow({
    tableHeader: true,
    children: cols.map((c, i) => cell(c, widths[i], { bold: true, shade: NAVY, color: WHITE, size: 20 })),
  });
}
function featureTable(rows, widths = [3200, 6160]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      headerRow(["Feature / Page", "Description"], widths),
      ...rows.map(([feat, desc]) => new TableRow({
        children: [
          cell(feat, widths[0], { bold: true, size: 20 }),
          cell(desc, widths[1], { size: 20 }),
        ],
      })),
    ],
  });
}
function threeColTable(rows, widths = [2800, 2000, 4560]) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      headerRow(["Feature", "Plans", "Details"], widths),
      ...rows.map(([feat, plan, desc]) => new TableRow({
        children: [
          cell(feat, widths[0], { bold: true, size: 20 }),
          cell(plan, widths[1], { center: true, size: 20, color: NAVY }),
          cell(desc, widths[2], { size: 20 }),
        ],
      })),
    ],
  });
}
function infoBox(text, shade = LGRAY, textColor = "374151") {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({ children: [
      new TableCell({
        width: { size: 9360, type: WidthType.DXA },
        borders: borders(MGRAY),
        shading: { fill: shade, type: ShadingType.CLEAR },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [new Paragraph({
          children: [new TextRun({ text, font: "Arial", size: 20, color: textColor, italics: true })],
        })],
      }),
    ] })],
  });
}

// ── Cover page ────────────────────────────────────────────────────────────────
function coverPage() {
  return [
    spacer(1800),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "AuthorLoft", font: "Arial", size: 72, bold: true, color: NAVY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Complete Feature & Functionality Reference", font: "Arial", size: 36, color: GOLD })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 4 } },
      children: [new TextRun("")],
      spacing: { after: 300 },
    }),
    spacer(400),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `${displayDate}  |  Internal Reference`, font: "Arial", size: 22, color: DGRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "www.authorloft.com", font: "Arial", size: 22, color: DGRAY })],
      spacing: { after: 200 },
    }),
    spacer(600),
    new Table({
      width: { size: 7200, type: WidthType.DXA },
      columnWidths: [3600, 3600],
      rows: [new TableRow({ children: [
        new TableCell({
          width: { size: 3600, type: WidthType.DXA },
          borders: noBorders(),
          shading: { fill: NAVY, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 200, right: 200 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sections Covered", font: "Arial", size: 20, bold: true, color: WHITE })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "7 major areas", font: "Arial", size: 18, color: "D1D5DB" })] }),
          ],
        }),
        new TableCell({
          width: { size: 3600, type: WidthType.DXA },
          borders: noBorders(),
          shading: { fill: LGRAY, type: ShadingType.CLEAR },
          margins: { top: 160, bottom: 160, left: 200, right: 200 },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Status", font: "Arial", size: 20, bold: true, color: NAVY })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `Production + Staging (${monthYear})`, font: "Arial", size: 18, color: DGRAY })] }),
          ],
        }),
      ] })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 1: Platform Overview ──────────────────────────────────────────────
function sectionOverview() {
  return [
    h1("1. Platform Overview"),
    p("AuthorLoft is a full-stack author platform enabling independent authors to build their own branded website, sell books directly to readers, grow their audience, and manage their author business — all in one place. The platform is live at www.authorloft.com."),
    spacer(),
    infoBox("Architecture: Next.js 14 App Router  |  Prisma ORM  |  Supabase (PostgreSQL)  |  Stripe (subscriptions + direct sales)  |  Google Gemini AI  |  Vercel deployment  |  S3-compatible file storage"),
    spacer(200),
    h2("Plan Tiers"),
    // UPDATE HERE when plan features or pricing change
    threeColTable([
      ["Free",     "FREE",     "Forever free. Up to 5 books, 10 blog posts. Core site, newsletter capture, bookstore listing, reader feedback, and discount codes included."],
      ["Standard", "STANDARD", "$19.99/month or $199.99/year. Up to 20 books, 100 blog posts. Direct sales, pre-orders, affiliate program, sales dashboard, shopping cart."],
      ["Premium",  "PREMIUM",  "$59.99/month or $599.99/year. Unlimited books and posts. Audio books, flip books, AI assistant, SEO audit, custom colours, OG images."],
    ], [1800, 1800, 5760]),
    spacer(200),
    h2("User Roles"),
    featureTable([
      ["Public / Reader",     "Unauthenticated visitors browsing the marketing site, the public bookstore, or individual author sites. Can purchase books, leave feedback, sign up for newsletters, and claim ARCs."],
      ["Author (Admin)",      "Registered author with their own dashboard to manage books, blog, sales, newsletter, appearance, and billing. Subject to plan-tier feature gates."],
      ["Super Administrator", "Platform operators with access to all author data, platform settings, CMS, social posting, email broadcasts, coupon management, and feature-flag control."],
    ]),
    spacer(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 2: Public Marketing Site ─────────────────────────────────────────
function sectionMarketing() {
  return [
    h1("2. Public Marketing Site  (authorloft.com)"),
    p("The marketing site is the public-facing brand and acquisition surface for AuthorLoft. It is entirely server-rendered with full SEO metadata, Open Graph images, and canonical URLs."),
    spacer(),
    h2("2.1  Core Marketing Pages"),
    // UPDATE HERE when new public routes are added
    featureTable([
      ["Homepage  /",                                   "Hero section with animated headline, feature showcase, pricing overview, testimonials carousel, FAQ accordion, latest blog posts, author showcase, and final CTA. Fully responsive with mobile hamburger nav."],
      ["Pricing  /pricing",                             "Detailed plan comparison — feature matrix table across FREE / STANDARD / PREMIUM, FAQ, and upgrade CTAs. Early-bird discount messaging shown to eligible users."],
      ["Features  /features",                           "Full feature listing organised by capability category — publishing, sales, marketing, AI, analytics."],
      ["Blog  /blog",                                   "Editorial hub (The Loft Journal) — 3-column card grid with category tabs, search, and sort. Blog posts are managed by Super Admin."],
      ["Blog Post  /blog/[slug]",                       "Individual blog post with cover image, rich content, author attribution, tags, SEO metadata, and related-posts section."],
      ["News  /news",                                   "Platform news and announcements archive, grouped by year. Separate from the blog. Includes RSS feed at /news/rss.xml."],
      ["News Post  /news/[slug]",                       "Individual news article with full content and structured metadata."],
      ["Resources  /resources",                         "Curated directory of partner tools, communities, and organisations for indie authors. Email-gated downloadable resources (guides, templates) captured as leads."],
      ["FAQ  /faq",                                     "Dynamic FAQ page grouped by category with FAQ structured data (JSON-LD). Questions managed via Super Admin CMS. Up to 10 shown on homepage with See all link."],
      ["Contact  /contact",                             "Contact form with support-email dropdown (managed by Super Admin). Submissions routed to platform inbox."],
      ["Bookstore  /bookstore",                         "Public discovery catalog showing books from all opted-in authors. Sections: New on the Shelf, Trending Now, All Books (compact list cards). Genre filter pages, search, quick-view modal, author links."],
      ["Bookstore Genre  /bookstore/genre/[slug]",      "Genre-filtered book listing using the shared brand-band header, breadcrumb, and All Books grid."],
      ["Compare  /compare/[competitor]",                "SEO/GEO comparison landing pages vs BookFunnel, StoryOrigin, Tertulia. Feature table, prose, FAQ with FAQPage structured data. Dynamic route from a single data file."],
      ["Privacy  /privacy",                             "Platform privacy policy page (managed content)."],
      ["Terms  /terms",                                 "Terms of service page (managed content)."],
      ["GDPR  /gdpr",                                   "GDPR compliance information page."],
    ]),
    spacer(),
    h2("2.2  Marketing Site Features"),
    featureTable([
      ["Dynamic OG Images",     "Per-page Open Graph image override for homepage, blog, features, pricing, contact, and resources — managed by Super Admin in Platform Settings > SEO."],
      ["IndexNow",              "Instant Bing/Yandex notification when a Blog or News post is published. No manual sitemap submission needed."],
      ["Sitemap",               "Auto-generated XML sitemap covering all marketing, bookstore, and author-site public pages. Excludes admin and auth routes."],
      ["Testimonials",          "Up to 3 active testimonials displayed on the homepage. Section is hidden until at least one active testimonial exists. Managed by Super Admin."],
      ["Company Social Links",  "Dynamic social media icons in the shared marketing footer. Platforms and URLs managed by Super Admin."],
      ["Author Showcase",       "3-display-style showcase of live author sites on the homepage hero. Rotates daily or is super-admin curated."],
      ["Comparison Pages",      "Three vs-competitor landing pages (BookFunnel, StoryOrigin, Tertulia) with fair feature tables, FAQPage schema, and cross-links from the pricing page."],
      ["Newsletter Subscribe",  "News subscriber capture on the homepage, /news page, and footer. Subscribers stored in PlatformSubscriber table with unsubscribe token."],
    ]),
    spacer(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 3: Public Author Sites ───────────────────────────────────────────
function sectionAuthorSite() {
  return [
    h1("3. Public Author Sites  ([author].authorloft.com or custom domain)"),
    p("Every author gets a fully branded public website hosted on a subdomain (e.g. janesmith.authorloft.com) or their own custom domain. Each site is a separate Next.js dynamic route group resolved by the domain/subdomain parameter."),
    spacer(),
    h2("3.1  Site Pages"),
    // UPDATE HERE when new author-site pages are added
    featureTable([
      ["Homepage  /",                           "Author primary landing page. Hero banner, bio, featured book, book grid/carousel, and newsletter signup. Supports 4 templates: Classic, Minimal, Bold, and Cinematic (PREMIUM)."],
      ["Books  /books",                         "Full book catalog with filtering by series, genre, format, and price. Layout adapts to the author chosen theme."],
      ["Book Detail  /books/[slug]",            "Individual book page: full-size cover, description, excerpt modal, audio sample player, format badges, pre-order signup or buy buttons, retailer links, cart add buttons, reader reviews, reader feedback form, and launch countdown timer (if enabled)."],
      ["Book Buy  /books/[slug]/buy",           "Direct checkout page for purchasing a digital book format via Stripe. Discount code field, order summary."],
      ["Order Success  /books/[slug]/success",  "Post-purchase confirmation showing order details and download link."],
      ["Flip Books  /flip-books",               "Gallery of all flip-book (interactive page-turn) previews available for this author."],
      ["Flip Book Viewer  /flip-books/[slug]",  "Individual flip-book viewer page with an embedded interactive reader."],
      ["Series  /series/[slug]",                "Series landing page listing all books in that series in reading order with descriptions."],
      ["Specials  /specials",                   "Active limited-time promotions, sales, and bundle deals for this author."],
      ["Blog  /blog",                           "Author blog post listing. Searchable and filterable."],
      ["Blog Post  /blog/[slug]",               "Individual author blog post with full rich-text content."],
      ["About  /about",                         "Author biography, profile photo, credentials, reader stats, social links, and By the Numbers section."],
      ["Contact  /contact",                     "Reader contact form that sends messages to the author inbox in the admin dashboard."],
      ["Media Kit  /media-kit",                 "Public press kit with author stats (books published, subscribers, avg rating, books sold, top genres), featured covers, and PDF/bio download buttons."],
      ["Legal  /legal",                         "Author own terms and privacy page (customisable content per author)."],
      ["Custom Pages  /[slug]",                 "Author-created custom pages (e.g. Events, Speaking, Newsletter). Built with the Page Builder."],
    ]),
    spacer(),
    h2("3.2  Reader-Facing Features"),
    // UPDATE HERE when new reader features are added
    featureTable([
      ["Shopping Cart",             "Persistent cart drawer allowing readers to add multiple books before checking out. Supports direct-sale items and discount codes. Cart state persisted in localStorage."],
      ["Discount Code Entry",       "Readers can enter an author-issued discount code at checkout. Validates against the DiscountCode table (PERCENT or FIXED, expiry, usage cap, per-book restrictions)."],
      ["Direct Checkout",           "Stripe-powered checkout for digital books (eBook, Print, Audio, Flip Book). Payment goes directly to the author Stripe Connect account. Readers receive an email with a download token."],
      ["File Download",             "Secure download link with a time-limited token. Readers can re-download within the order window."],
      ["Pre-order / Notify Me",     "On books marked Coming Soon, a Notify Me signup form replaces the buy buttons. Author receives subscriber list and can send a one-click launch email."],
      ["Reader Feedback & Ratings", "Star rating (1-5) plus optional comment submitted per book. Author-moderated (PENDING / APPROVED / REJECTED). Approved feedback visible on the book page. Rate-limited per session."],
      ["Author Reviews Display",    "Author-curated pull-quote reviews (e.g. from trade publications) with optional star rating, displayed in a What Readers Are Saying section."],
      ["Launch Countdown Timer",    "Live days/hours/minutes/seconds countdown displayed on any book page when the author enables Launch Mode and sets a future launch date. Hides automatically after launch. All plans."],
      ["Affiliate / Referral Links","?ref=CODE query parameter tracked when a reader clicks through a referral link. Stripe purchase attributed to the referrer."],
      ["ARC Downloads",             "Advance Reader Copy claim page at /arc/[token]. Unique token per copy. Reader downloads the file; token becomes single-use after download."],
      ["Audio Sample Player",       "In-browser HTML5 audio player for listening to audio track samples directly on the book detail page (PREMIUM authors with Audio enabled)."],
      ["Book Preview Gallery",      "Multi-image or video gallery for interior book previews, cover reveals, or promotional assets."],
      ["Newsletter Signup",         "Email capture forms on the homepage and blog. Subscribers stored per-author; author can send campaigns from the admin."],
      ["Flip Book Viewer",          "Interactive page-turn book preview embedded inline (external flipbook URL integration, PREMIUM)."],
      ["SEO & OG Metadata",         "Every author-site page has dynamic title, meta description (HTML-stripped), canonical URL, Open Graph and Twitter card tags with the book cover image."],
    ]),
    spacer(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 4: Author Admin Dashboard ────────────────────────────────────────
function sectionAdmin() {
  return [
    h1("4. Author Admin Dashboard  (/admin)"),
    p("The author admin is a full-featured dashboard for managing every aspect of an author AuthorLoft presence. Access is gated by email verification and plan-tier feature flags."),
    spacer(),

    h2("4.1  Dashboard & Overview"),
    featureTable([
      ["Dashboard  /admin/dashboard",  "Summary cards: total books, newsletter subscribers, orders this month, revenue this month. Onboarding checklist with progress tracker. Your Site Pages card with clickable links to all live public pages. Upgrade CTA for FREE/STANDARD plans. Trial countdown banner."],
      ["Analytics  /admin/analytics",  "Site traffic dashboard powered by PostHog — page views, referrers, countries, device breakdown. Time windows: 7d / 30d / 90d. STANDARD and PREMIUM only."],
    ]),
    spacer(),

    h2("4.2  Catalog — Books, Series, Genres"),
    // UPDATE HERE when new book editor tabs or catalog features are added
    featureTable([
      ["Books List  /admin/books",          "All books in a sortable, filterable list. Status column shows up to 4 badges per book: primary state (Pre-order / Published / Draft) plus secondary flags (Featured, Direct Sales, Bookstore). Bulk actions. CSV import shortcut."],
      ["New Book  /admin/books/new",         "Create a new book: title, slug (auto-generated), subtitle, cover image upload, description (rich text), genres, series, page count, ISBN, retail price, release date."],
      ["Edit Book  /admin/books/[id]/edit",  "Tabbed editor with 9 tabs. Changes auto-save on tab switch."],
      ["  Tab: Details",                     "Title, slug, subtitle, short description, rich-text full description, cover image, ISBN lookup (Google Books + Open Library enrichment), page count, retail price, release date, caption/badge, sample content, series, genres, formats, flipbook URL."],
      ["  Tab: Organisation",                "Visibility & Publishing toggles: Published, Featured on Hero, Direct Sales, Bookstore listing, Pre-order / Coming Soon (+ date), Launch Countdown (+ datetime). Launch Toolkit: 5-point readiness checklist and one-click social announcement copy."],
      ["  Tab: Buy Links",                   "Retailer links (Amazon, Apple Books, Kobo, Barnes & Noble, custom). Each link: retailer name, label, URL, sort order, active toggle."],
      ["  Tab: Direct Sales",                "Sale items per format (eBook, Print, Audio, Flip Book). Each item: format, label, price, file upload (chunked S3), active toggle, sort order."],
      ["  Tab: Affiliate",                   "Enable/disable affiliate program per book. Set commission percentage (1-50%). View referral stats (clicks, sales, earnings). Generate labelled referral links. STANDARD+ with Direct Sales."],
      ["  Tab: Media",                       "Book preview media gallery (images, video, audio clips) with drag-reorder. Audio tracks for the in-page sample player (PREMIUM audio feature)."],
      ["  Tab: Reviews",                     "Author-curated pull-quote reviews. Add/edit/delete/reorder quote, reviewer name, source, and optional star rating."],
      ["  Tab: Excerpt",                     "Rich-text excerpt editor. Content displayed behind a modal Read Excerpt button on the public book page."],
      ["  Tab: ARC",                         "Advance Reader Copy management. Upload ARC file, generate download tokens, track claimed tokens. STANDARD+."],
      ["Book Import  /admin/books/import",   "4-step wizard: Upload CSV / Map Columns / Preview / Done. Accepts Goodreads export or AuthorLoft template. Column mapper with saved presets (browser-local). Optional ISBN enrichment. Genres/Series auto-created. Imports land as drafts. Respects plan book limits."],
      ["Flip Books  /admin/flip-books",      "Manage flip-book previews. Add/edit/delete. Each flip book links to an external interactive URL. PREMIUM."],
      ["Series  /admin/series",              "Create and manage series (name, description, cover). Books assigned to series from the book editor."],
      ["Genres  /admin/genres",              "Create and manage a two-level genre hierarchy (parent + child genres). Used for filtering on the author book catalog and the bookstore."],
    ]),
    spacer(),

    h2("4.3  Website — Pages, Blog, Appearance"),
    featureTable([
      ["Custom Pages  /admin/pages",    "Create, publish, and delete custom landing pages (e.g. Events, Speaking). Full-page builder with rich text and section controls."],
      ["Blog  /admin/blog",             "CRUD for author blog posts. Rich-text editor, cover image, SEO meta fields, category dropdown, publish/draft toggle, publish date."],
      ["Appearance  /admin/appearance", "Full theme control: 15 colour palettes (3 on FREE; 15 on STANDARD+; PREMIUM adds custom colour pickers and Cinematic layout). Logo upload, hero banner, favicon."],
      ["Branding  /admin/branding",     "Author display name, tagline, short bio, full bio (rich text), profile photo, credentials, About page stats, social media links (Twitter/X, Instagram, Facebook, LinkedIn, YouTube, TikTok, website)."],
      ["Legal Pages  /admin/legal",     "Edit the author Privacy Policy and Terms of Service pages displayed at /legal on their public site."],
    ]),
    spacer(),

    h2("4.4  Audience — Messages, Feedback, Newsletter, Media Kit"),
    featureTable([
      ["Messages  /admin/messages",            "Inbox of reader contact form submissions. View, mark read, delete."],
      ["Reader Feedback  /admin/feedback",     "Moderate reader ratings and feedback. Approve shows on book page; Reject hides it. Rating breakdown per book."],
      ["Email & Newsletter  /admin/newsletter","Two tabs: Newsletter (subscriber list, compose & send campaigns, export to CSV) and Integrations (connect third-party email platforms: Resend, ConvertKit, Mailchimp). STANDARD+."],
      ["Media Kit  /admin/media-kit",          "View and edit the author press kit. Auto-populated stats. Download PDF generates a one-page press kit via React PDF. Download Biography (.txt) exports plain text. STANDARD+."],
    ]),
    spacer(),

    h2("4.5  Sales — Orders, Revenue, Discounts, Invoices"),
    // UPDATE HERE when new sales features are added
    featureTable([
      ["Sales  /admin/sales",                      "Four stat cards (Total Revenue, This Month, Total Orders, Orders This Month). Three revenue charts: Area chart (revenue over time, 30d/90d/12mo), Horizontal bar (top 10 books by revenue), Format breakdown (EBOOK/AUDIO/FLIPBOOK/PRINT). Orders table (last 50). STANDARD+."],
      ["Specials  /admin/specials",                "Create and manage limited-time promotions: sale price, start/end dates, promo image, description. Displayed on the public /specials page."],
      ["Discount Codes  /admin/discount-codes",    "Create and manage reader discount codes. PERCENT or FIXED type. Optional per-book restriction, usage cap, expiry date, enable/disable toggle. Codes validated at checkout. All plans (when Direct Sales enabled)."],
      ["Invoices  /admin/invoices",                "View all completed orders filterable by year. Export to CSV for tax reporting. STANDARD+."],
    ]),
    spacer(),

    h2("4.6  Tools — AI Assistant, SEO Audit"),
    featureTable([
      ["AI Assistant  /admin/ai-assistant", "Seven AI-powered tools using Google Gemini (or author own API key). Tabs: Blog Ideas, Book Description, Marketing Copy, Reader Feedback Analysis, SEO Meta Tags, Keyword Density, Internal Links. 20 calls/month on PREMIUM; unlimited with own Gemini API key (all plans)."],
      ["SEO Audit  /admin/seo-audit",       "Four-tab audit of the author site: Meta Tags, Keyword Density, Internal Links, and actionable improvement suggestions. PREMIUM."],
    ]),
    spacer(),

    h2("4.7  Account — Settings, Billing, GDPR, Help"),
    featureTable([
      ["Settings  /admin/settings",         "Tabbed settings page: Profile (display name, email, photo), Password, Billing (current plan, upgrade/downgrade, trial status, Stripe Customer Portal link), AI Key (custom Gemini key), Theme toggle, Showcase opt-in."],
      ["Stripe Connect",                     "Authors connect their own Stripe account to receive direct payments from readers. Onboarding flow via Stripe Connect Express."],
      ["Reader Privacy (GDPR)  /admin/compliance", "GDPR tools: export all reader data (newsletter subscribers, feedback, orders) as JSON/CSV. Submit account deletion request."],
      ["Help & Support  /admin/help",        "Two tabs: Help Centre (searchable knowledge base articles managed by Super Admin) and Contact Support (form to reach the AuthorLoft team)."],
    ]),
    spacer(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 5: Super Admin ────────────────────────────────────────────────────
function sectionSuperAdmin() {
  return [
    h1("5. Super Admin  (/super-admin)"),
    p("Super Admin is an internal platform management console accessible only to AuthorLoft operators. It controls all authors, content, billing configuration, feature flags, email, and marketing."),
    spacer(),
    infoBox("Super Admin access is role-gated. The mobile-responsive layout uses the same sidebar/drawer shell as the author admin, with a purple Super Admin badge in the top bar."),
    spacer(200),

    h2("5.1  Authors"),
    featureTable([
      ["Authors  /super-admin/authors",                  "Paginated list of all registered authors with search and filter. Columns: name, email, plan, status, joined date."],
      ["Author Detail  /super-admin/authors/[id]",       "Full author profile: account info, current plan, Stripe subscription details, AI usage meter, trial configuration, coupon assignment, suspend/unsuspend, and impersonation (log in as this author without their password)."],
      ["Coupon Assignment",                               "Assign a Stripe coupon code to any author subscription (e.g. loyalty discounts, support credits). Managed per author from their detail page."],
      ["Trial Management",                               "Set trial start/end dates and the trial plan tier for any author. Trial reminder banner shown in the author admin when trial nears expiry."],
      ["Access Requests  /super-admin/access-requests",  "Manage author requests for beta features or early access programs. Approve or deny from a queue."],
    ]),
    spacer(),

    h2("5.2  Billing & Plans"),
    featureTable([
      ["Plans  /super-admin/plans",                      "Create, edit, and delete subscription plan tiers. Fields: name, price (monthly/annual), Stripe price IDs, book limit, blog post limit, storage limit, and JSON feature flags blob."],
      ["Coupons  /super-admin/coupons",                  "Create Stripe coupon codes for subscription discounts. Fields: name, discount type (PERCENT or FIXED), value, duration (once / repeating / forever), currency."],
      ["Feature Gates  /super-admin/feature-config",     "Toggle any feature on or off per plan tier (FREE / STANDARD / PREMIUM / DISABLED) from a UI without a code deploy. Gates control: direct sales, pre-orders, audio, flipbooks, AI assistant, SEO audit, analytics, affiliate, bookstore listing, newsletter, and more."],
    ]),
    spacer(),

    h2("5.3  Content — Blog & News"),
    featureTable([
      ["Blog & News CMS  /super-admin/blog",  "CRUD for all platform blog posts and news articles. One editor with a Blog/News toggle routing the post to /blog or /news. Fields: title, slug, cover image, rich-text body, category, SEO fields, published toggle, publish date, author attribution."],
      ["News Email to Subscribers",           "Published News posts have a Send to subscribers checkbox. Sends the headline, excerpt, cover, and read link to all confirmed PlatformSubscribers. One-time guard (newsEmailedAt timestamp) prevents double-sends."],
      ["Content Categories  /super-admin/categories", "Platform-wide category management used by blog, news, resources, and FAQ. Four tabs: Blog, News, Resources, FAQ. Active/inactive toggle, sort order."],
    ]),
    spacer(),

    h2("5.4  Resources & Downloads"),
    featureTable([
      ["Resources  /super-admin/resources",           "Curate the partner tools and communities shown on the public /resources page. Fields: name, description, URL, logo, category, sort order, active toggle."],
      ["Resource Downloads  /super-admin/resource-downloads", "Manage downloadable resources (guides, templates, checklists). Fields: title, cover image, rich-text description, category, file upload, publish toggle, email-gate toggle. When gated, reader enters email to unlock download; lead captured. Download link emailed to reader."],
    ]),
    spacer(),

    h2("5.5  Marketing — Social, SEO, Email"),
    featureTable([
      ["Social Media Poster  /super-admin/social",  "Platform-level social posting to LinkedIn, Facebook, Instagram, and X/Twitter. Compose a post with image upload, schedule a publish date/time, and publish to connected platform accounts. A cron job processes scheduled posts."],
      ["SEO / OG Images  /super-admin/seo",         "Per-page Open Graph image management for the marketing site pages: homepage, blog, features, pricing, contact, resources. Upload a custom image or set a URL."],
      ["News Subscribers  /super-admin/subscribers", "View all PlatformSubscribers (captured via the /news subscribe form and footer). CSV export. Unsubscribe management."],
      ["Mass Email Broadcasts",                      "Compose and send email announcements to all authors segmented by plan tier (FREE / STANDARD / PREMIUM). Reusable broadcast templates. Opt-out compliance."],
      ["Email Templates",                            "Save and manage reusable broadcast email templates."],
      ["Welcome Email Editor",                       "Customise the welcome email sent to new authors on registration."],
    ]),
    spacer(),

    h2("5.6  Platform Settings"),
    featureTable([
      ["Platform Settings  /super-admin/settings",  "Multi-tab settings hub. Tabs: Logo & Branding (platform logo, description, accent colour), Support Emails (CRUD for contact addresses), Testimonials (add/edit/reorder/activate), AI Cap (global monthly AI call limit), Maintenance Mode (enable/disable with custom message)."],
      ["FAQ Manager  /super-admin/faqs",            "Dynamic FAQ content management: add/edit/delete/reorder questions, assign to categories, rich-text answers, active toggle."],
      ["Genres  /super-admin/genres",               "Platform-wide genre taxonomy management used by the bookstore genre pages and bookstore filtering."],
      ["Platform Legal",                             "Edit the platform Privacy Policy, Terms of Service, and GDPR information pages."],
    ]),
    spacer(),

    h2("5.7  Help Centre CMS"),
    featureTable([
      ["Help Articles  /super-admin/help",  "Hierarchical help content management. Structure: Topics > Subtopics > Articles. CRUD for each level with sort order and active toggle."],
      ["Tooltips",                           "Manage in-app tooltip text that appears in the author admin interface. Key/value store edited from Super Admin."],
    ]),
    spacer(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 6: Authentication ─────────────────────────────────────────────────
function sectionAuth() {
  return [
    h1("6. Authentication & Account Management"),
    featureTable([
      ["Register  /register",      "Author registration form: display name, email, password, plan selection, terms acceptance. Sends verification email on submit."],
      ["Email Verification",       "Verification link sent on registration. Unverified authors see a persistent banner in the admin. Resend link available. Unverified accounts auto-cleaned by cron after a configurable window."],
      ["Login  /login",            "Email + password login. Forgot password link. Redirects to /admin/dashboard on success."],
      ["Password Reset",           "Request reset at /forgot-password, then email link, then /reset-password/[token] form."],
      ["Guided Onboarding",        "3-step wizard for new authors: set up profile, upload cover, connect Stripe or skip. Next Steps checklist on dashboard tracks completion milestones."],
      ["Trial System",             "Super Admin can grant any author a time-limited trial at a higher plan tier. Trial countdown banner in the admin; plan reverts automatically when trial expires (cron job)."],
      ["Accept Terms",             "/accept-terms page shown when policy updates require re-acknowledgement. Timestamp stored per author."],
      ["Session / Security",       "NextAuth.js session management with HTTP-only cookies. Vercel Pro Firewall (Bot Protection + rate-limit rules) on auth, lead-capture, and public API endpoints."],
    ]),
    spacer(),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── SECTION 7: Platform Infrastructure ───────────────────────────────────────
function sectionInfra() {
  return [
    h1("7. Platform Infrastructure & Integrations"),
    // UPDATE HERE when new integrations or infra changes are made
    featureTable([
      ["Deployment",                   "Vercel (Next.js). dev branch to staging.authorloft.com for QA; promote to prod via Vercel dashboard. Build runs prisma generate only; migrations applied manually to Supabase via MCP."],
      ["Database",                     "Supabase-hosted PostgreSQL managed via Prisma ORM. 41+ tables with full GRANT statements for anon, authenticated, postgres, and service_role."],
      ["Authentication",               "NextAuth.js with custom credential provider (email + password). Sessions in HTTP-only cookies."],
      ["Payments — Subscriptions",     "Stripe subscriptions for plan billing (FREE/STANDARD/PREMIUM monthly and annual). Stripe webhook handler processes subscription events, trial expirations, and payment failures."],
      ["Payments — Direct Sales",      "Stripe Connect Express for author direct sales. Each author connects their own Stripe account. Readers pay the author directly."],
      ["File Storage",                 "S3-compatible storage for book files, covers, audio, and images. Chunked upload via presigned URLs. Secure proxy for download tokens."],
      ["Email / Transactional",        "Resend (or configured SMTP) for transactional emails: verification, password reset, order confirmations, pre-order launch, ARC notifications, newsletter campaigns, broadcast emails."],
      ["AI — Google Gemini",           "Gemini API used by the AI Assistant (7 tools). Authors can supply their own Gemini API key for unlimited calls. Platform enforces a monthly cap per author (configurable by Super Admin)."],
      ["Analytics",                    "PostHog for platform-level product analytics and per-author site traffic (STANDARD/PREMIUM). Sentry for error tracking. Both live since May 15, 2026."],
      ["SEO",                          "Dynamic metadata (title, description, OG, Twitter cards, canonical) on every public page. JSON-LD structured data (Product, FAQPage, Article). XML sitemap auto-generated. IndexNow for instant blog/news indexing."],
      ["Cron Jobs",                    "6 scheduled tasks: cleanup unverified accounts, expire trials, onboarding cleanup, process scheduled social posts, reset monthly AI usage, and a general maintenance cron."],
      ["CDN / Security",               "Vercel Pro Firewall with Bot Protection enabled. Custom rate-limit rules on /api/auth/*, lead-capture, and public API endpoints."],
      ["Vercel KV / Redis",            "Vercel KV (rebranded Redis in storage dashboard) used for rate limiting and session caching. Env vars: KV_REST_API_URL and KV_REST_API_TOKEN."],
    ]),
    spacer(),
  ];
}

// ── Build ─────────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "-",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: NAVY },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "374151" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1080, bottom: 1080, left: 1080 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: MGRAY, space: 4 } },
          children: [
            new TextRun({ text: "AuthorLoft — Feature & Functionality Reference", font: "Arial", size: 18, color: DGRAY }),
            new TextRun({ text: `\t${monthYear}`, font: "Arial", size: 18, color: DGRAY }),
          ],
          tabStops: [{ type: "right", position: 10080 }],
          spacing: { after: 120 },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: MGRAY, space: 4 } },
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 18, color: DGRAY }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: DGRAY }),
            new TextRun({ text: " of ", font: "Arial", size: 18, color: DGRAY }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: DGRAY }),
            new TextRun({ text: "  |  Confidential — Internal Use Only", font: "Arial", size: 18, color: DGRAY }),
          ],
          spacing: { before: 120 },
        })],
      }),
    },
    children: [
      ...coverPage(),

      // TOC
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "Table of Contents", font: "Arial" })],
        border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: NAVY, space: 4 } },
        spacing: { before: 200, after: 200 },
      }),
      new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-2" }),
      new Paragraph({ children: [new PageBreak()] }),

      ...sectionOverview(),
      ...sectionMarketing(),
      ...sectionAuthorSite(),
      ...sectionAdmin(),
      ...sectionSuperAdmin(),
      ...sectionAuth(),
      ...sectionInfra(),

      spacer(400),
      infoBox(`This document was generated on ${displayDate}. For the latest feature status see docs/CHANGELOG.md (shipped log), docs/FEATURE_BACKLOG.md (planned), and docs/FEATURE_MATRIX.md (plan-tier matrix).`, NAVY, WHITE),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outPath, buf);
  console.log("Written:", outPath);
}).catch(e => { console.error(e); process.exit(1); });
