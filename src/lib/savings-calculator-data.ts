/**
 * Data behind the public Cost Savings Calculator (/pricing/calculator).
 *
 * Two kinds of numbers live here:
 *  1. Tool prices — current published prices for the products a creator would
 *     otherwise stitch together. They go stale: refresh them, then bump
 *     PRICES_CHECKED. Where a vendor offers annual billing we use the monthly
 *     equivalent of the annual price (the cheapest real way to buy it), so the
 *     "do it yourself" side is never overstated.
 *  2. Hours — our own estimates of the work involved. They are estimates, and the
 *     page says so.
 *
 * AuthorLoft plan PRICES and LIMITS are NOT stored here — the page reads them
 * from the Plan table so a price change in Super Admin flows through. The
 * fallbacks below are only used if that query fails.
 */

export const PRICES_CHECKED = "September 21, 2026";

export type TierKey = "FREE" | "STANDARD" | "PREMIUM";
export const TIER_RANK: Record<TierKey, number> = { FREE: 0, STANDARD: 1, PREMIUM: 2 };
export const TIER_BY_RANK: TierKey[] = ["FREE", "STANDARD", "PREMIUM"];

export type Product = "books" | "courses" | "music";
export const PRODUCT_LABEL: Record<Product, [string, string]> = {
  books: ["book", "books"],
  courses: ["course", "courses"],
  music: ["music list", "music lists"],
};

export type CalcPlan = {
  tier: TierKey;
  name: string;
  monthlyPriceCents: number;
  maxBooks: number | null;
  maxCourses: number | null;
  maxMusicLists: number | null;
  coursesEnabled: boolean;
  musicEnabled: boolean;
};

/** Used only if the Plan query fails. Mirrors docs/FEATURE_MATRIX.md. */
export const FALLBACK_PLANS: CalcPlan[] = [
  { tier: "FREE",     name: "Free",     monthlyPriceCents: 0,    maxBooks: 5,    maxCourses: 5,    maxMusicLists: 5,    coursesEnabled: true, musicEnabled: true },
  { tier: "STANDARD", name: "Standard", monthlyPriceCents: 999,  maxBooks: 20,   maxCourses: 25,   maxMusicLists: 20,   coursesEnabled: true, musicEnabled: true },
  { tier: "PREMIUM",  name: "Premium",  monthlyPriceCents: 3999, maxBooks: null, maxCourses: null, maxMusicLists: null, coursesEnabled: true, musicEnabled: true },
];

/** Time on AuthorLoft — three steps, then the site is live. Estimates. */
export const AL_SETUP_HOURS = 2;
export const AL_MONTHLY_HOURS = 1;

export type Source = { vendor: string; detail: string; url: string; official: boolean };

export const SOURCES: Record<string, Source> = {
  squarespace: { vendor: "Squarespace", detail: "Core plan, $29 a month when paid yearly", url: "https://costbench.com/software/cms/squarespace/", official: false },
  thinkific:   { vendor: "Thinkific",   detail: "Basic plan, $40 a month when paid yearly ($54 month to month)", url: "https://www.thinkific.com/pricing/", official: true },
  kit:         { vendor: "Kit",         detail: "Free plan, $0 (the Creator plan with automations is about $33 a month)", url: "https://www.kit.com/pricing", official: true },
  namecheap:   { vendor: "Namecheap",   detail: ".com renewal, about $14 a year", url: "https://www.namecheap.com/domains/", official: false },
  leaddyno:    { vendor: "LeadDyno",    detail: "Lite plan, $49 a month (up to 50 active affiliates)", url: "https://toollers.com/blog/leaddyno-pricing/", official: false },
  heyzine:     { vendor: "Heyzine",     detail: "Standard plan, about $5 a month when paid yearly", url: "https://zenflip.io/en/blog/heyzine-pricing-2026", official: false },
  ubersuggest: { vendor: "Ubersuggest", detail: "Individual plan, $29 a month", url: "https://www.stackscored.com/pricing/seo-tools/ubersuggest/", official: false },
  claude:      { vendor: "Claude Pro",  detail: "$17 a month when paid yearly (ChatGPT Plus is $20 a month)", url: "https://www.aipricing.guru/compare/chatgpt-plus-vs-claude-pro/", official: false },
  canva:       { vendor: "Canva",       detail: "Pro plan, $12 a month when paid yearly ($18 month to month); the Free plan is $0", url: "https://designrr.io/canva-pricing/", official: false },
};

export type DiyItem = {
  id: string;
  /** Plain-language name of the thing the creator wants. */
  label: string;
  /** One or two plain sentences: what it is and what doing it yourself means. */
  help: string;
  /** Lowest AuthorLoft plan that includes it. */
  tier: TierKey;
  /** Only shown when the creator makes this kind of product. */
  needs?: Product;
  /** DIY cost per month, USD. */
  cost: number;
  /** DIY hours to set up once. */
  setupHours: number;
  /** DIY hours per month to keep running. */
  monthlyHours: number;
  defaultOn?: boolean;
  /** Cost is paid on AuthorLoft too (a custom domain is bought either way). */
  paidEitherWay?: boolean;
  /** Which tool the DIY price is based on (key of SOURCES). */
  source: keyof typeof SOURCES;
};

export const DIY_ITEMS: DiyItem[] = [
  // ── On every plan, including Free ──────────────────────────────────────────
  { id: "site", tier: "FREE", label: "A website that is live on the internet", defaultOn: true, source: "squarespace", cost: 29, setupHours: 15, monthlyHours: 2,
    help: "You would pick a website builder, choose a design and pay for hosting (the always-on computer that keeps your site online). Includes the security padlock and automatic backups." },
  { id: "store", tier: "FREE", label: "Sell books and downloads directly to readers", defaultOn: true, source: "squarespace", cost: 0, setupHours: 6, monthlyHours: 1,
    help: "Set up a checkout so people can pay you and get their file right away. The website builder takes an extra 5% of digital sales on this plan." },
  { id: "courses", tier: "FREE", needs: "courses", label: "Host and sell your online courses", defaultOn: true, source: "thinkific", cost: 40, setupHours: 10, monthlyHours: 1,
    help: "Lessons, videos and student logins usually need a separate course website that you connect to yours." },
  { id: "music", tier: "FREE", needs: "music", label: "Share your playlists and albums", defaultOn: true, source: "squarespace", cost: 0, setupHours: 3, monthlyHours: 0.5,
    help: "Design pages that link out to YouTube, Spotify, Suno and other places your music lives." },
  { id: "email", tier: "FREE", label: "Collect emails and send newsletters", defaultOn: true, source: "kit", cost: 0, setupHours: 4, monthlyHours: 1,
    help: "Sign-up forms, updates to your readers, and a free book offered in exchange for an email address." },
  { id: "reviews", tier: "FREE", label: "Reader reviews and a contact form", defaultOn: true, source: "squarespace", cost: 0, setupHours: 3, monthlyHours: 0.5,
    help: "Contact forms are built into most website builders. Collecting and approving reader reviews is mostly manual work." },
  { id: "analytics", tier: "FREE", label: "See how many people visit your site", defaultOn: true, source: "squarespace", cost: 0, setupHours: 1, monthlyHours: 0.5,
    help: "Visitor counts, where they came from and which countries they are in." },
  // ── Added with Standard ────────────────────────────────────────────────────
  { id: "domain", tier: "STANDARD", label: "Your own web address (like yourname.com)", paidEitherWay: true, source: "namecheap", cost: 1.18, setupHours: 1, monthlyHours: 0,
    help: "You buy and renew the name yearly. You pay this on AuthorLoft too, since custom domains start on Standard." },
  { id: "bundles", tier: "STANDARD", label: "Discount codes, book bundles and a shopping cart", source: "squarespace", cost: 0, setupHours: 3, monthlyHours: 0.5,
    help: "Coupons, buying several items at once, and selling books together at a lower price." },
  { id: "preorders", tier: "STANDARD", label: "Pre-orders and “notify me” sign-ups", source: "squarespace", cost: 0, setupHours: 5, monthlyHours: 0.5,
    help: "A coming-soon page with a sign-up form, plus an email to readers on launch day. Done by hand." },
  { id: "affiliate", tier: "STANDARD", label: "Let others earn a commission for sharing your books", source: "leaddyno", cost: 49, setupHours: 4, monthlyHours: 0.5,
    help: "Special links that track who sent a sale, so you can pay a share to the person who shared it." },
  { id: "sales", tier: "STANDARD", label: "Sales reports and invoices", source: "squarespace", cost: 0, setupHours: 2, monthlyHours: 0.5,
    help: "See income by month, book and format. Year-end invoices and spreadsheets stay manual." },
  { id: "pages", tier: "STANDARD", label: "Extra pages for launches and promotions", source: "squarespace", cost: 0, setupHours: 3, monthlyHours: 0.5,
    help: "Design your own landing pages for a new release or a sale." },
  { id: "mediakit", tier: "STANDARD", label: "A press kit for interviews", source: "canva", cost: 0, setupHours: 4, monthlyHours: 0.25,
    help: "A page and a downloadable PDF with your bio, photos and numbers for podcasts and reporters." },
  // ── Added with Premium ─────────────────────────────────────────────────────
  { id: "audio", tier: "PREMIUM", needs: "books", label: "Sell audiobooks and flip-through books", source: "heyzine", cost: 4.92, setupHours: 5, monthlyHours: 0.5,
    help: "A tool that turns a PDF into a page-turning book, plus a way to deliver audio files." },
  { id: "seo", tier: "PREMIUM", label: "Tools to help your site show up in search", source: "ubersuggest", cost: 29, setupHours: 2, monthlyHours: 1,
    help: "Checks your page titles, keywords and links between pages." },
  { id: "ai", tier: "PREMIUM", label: "An AI helper for descriptions, posts and marketing copy", source: "claude", cost: 17, setupHours: 0.5, monthlyHours: 0,
    help: "A paid AI assistant you would use on the side." },
  { id: "og", tier: "PREMIUM", label: "Eye-catching preview pictures when your pages are shared", source: "canva", cost: 12, setupHours: 1, monthlyHours: 1,
    help: "The image people see when your link is posted on social media. You would design one for every page." },
];

export const GROUPS: { tier: TierKey; title: string; blurb: string }[] = [
  { tier: "FREE", title: "The basics", blurb: "Included on every AuthorLoft plan, even Free." },
  { tier: "STANDARD", title: "Grow your sales", blurb: "Added when you choose the Standard plan." },
  { tier: "PREMIUM", title: "Extra tools", blurb: "Added when you choose the Premium plan." },
];
