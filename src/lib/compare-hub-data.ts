// Data for the /compare hub page — one tabbed page with a feature-comparison
// table per creator type (Books, Courses, Music), each against the competitors
// most relevant to that category. Distinct from src/lib/comparison-data.tsx,
// which powers the deep-dive per-competitor /compare/[competitor] pages
// (currently book-competitors only) — this hub is a single page with three
// simple side-by-side tables, not individual "vs X" landing pages.
//
// Rows are curated marketing copy, not an exhaustive feature-flag mirror —
// same convention as the pricing page's own comparison table. Every claim
// here should be checked against docs/FEATURE_MATRIX.md before editing.

export type Cell = "yes" | "no" | "limited";
export type Row = { label: string; authorloft: Cell; competitors: Cell[] };

export type CompareCategory = {
  id: "books" | "courses" | "music";
  label: string;
  intro: string;
  competitorNames: string[];
  rows: Row[];
};

export const COMPARE_CATEGORIES: CompareCategory[] = [
  {
    id: "books",
    label: "Books",
    intro:
      "Compared against the platforms indie authors already use to build a reader-facing site, sell direct, and capture an email list.",
    competitorNames: ["Tertulia", "Quilltips", "StoryOrigin", "BookFunnel"],
    rows: [
      { label: "Your own author website",        authorloft: "yes", competitors: ["yes", "yes", "yes", "no"] },
      { label: "Unlimited books & series",        authorloft: "yes", competitors: ["yes", "yes", "yes", "limited"] },
      { label: "Direct eBook & audiobook sales",  authorloft: "yes", competitors: ["no",  "no",  "yes", "yes"] },
      { label: "Zero platform fee on sales",      authorloft: "yes", competitors: ["no",  "no",  "no",  "no"] },
      { label: "Custom domain",                   authorloft: "yes", competitors: ["yes", "no",  "yes", "no"] },
      { label: "Newsletter & email campaigns",    authorloft: "yes", competitors: ["yes", "no",  "yes", "no"] },
      { label: "Reader magnets / ARC management", authorloft: "yes", competitors: ["no",  "limited", "yes", "yes"] },
      { label: "Also host online courses",        authorloft: "yes", competitors: ["no",  "no",  "no",  "no"] },
      { label: "Also host music playlists",       authorloft: "yes", competitors: ["no",  "no",  "no",  "no"] },
      { label: "Free plan available",             authorloft: "yes", competitors: ["yes", "yes", "yes", "limited"] },
    ],
  },
  {
    id: "courses",
    label: "Courses",
    intro:
      "Compared against the course platforms independent teachers and creators use — a different market than the full-blown corporate LMS tools.",
    competitorNames: ["Teachable", "Thinkific", "Podia", "Kajabi"],
    rows: [
      { label: "Free plan available",                  authorloft: "yes", competitors: ["no", "no", "no", "no"] },
      { label: "Zero / near-zero transaction fees",     authorloft: "yes", competitors: ["limited", "yes", "limited", "yes"] },
      { label: "Custom domain",                         authorloft: "yes", competitors: ["yes", "yes", "yes", "yes"] },
      { label: "Import a course from a YouTube playlist or CSV", authorloft: "yes", competitors: ["no", "no", "no", "no"] },
      { label: "Also sell books directly",              authorloft: "yes", competitors: ["no", "no", "no", "no"] },
      { label: "Also host music playlists",             authorloft: "yes", competitors: ["no", "no", "no", "no"] },
      { label: "Newsletter & email campaigns included", authorloft: "yes", competitors: ["limited", "limited", "yes", "yes"] },
      { label: "Discount codes",                        authorloft: "yes", competitors: ["yes", "yes", "yes", "yes"] },
    ],
  },
  {
    id: "music",
    label: "Music",
    intro:
      "AuthorLoft's music tools are link-only: you build albums, EPs and playlists on your own website that point to music hosted anywhere (Spotify, YouTube, Suno and more). Nothing is uploaded or streamed here. The others are different jobs: AI song makers (Suno, Udio, Donna), a streaming service (Spotify) and an artist storefront (Bandcamp), so many artists use one of them alongside AuthorLoft.",
    competitorNames: ["Suno", "Udio", "Donna", "Spotify", "Bandcamp"],
    rows: [
      { label: "Your own website on your own domain, not just a profile page", authorloft: "yes", competitors: ["no", "no", "no", "no", "limited"] },
      { label: "Albums, EPs and playlists with a tracklist player",             authorloft: "yes", competitors: ["limited", "yes", "no", "yes", "limited"] },
      { label: "Links to music hosted anywhere (Spotify, YouTube, Suno...)",   authorloft: "yes", competitors: ["limited", "no", "no", "no", "no"] },
      { label: "Hosts and streams your audio files",                            authorloft: "no",  competitors: ["yes", "yes", "limited", "limited", "yes"] },
      { label: "Makes music for you with AI",                                   authorloft: "no",  competitors: ["yes", "yes", "yes", "no", "no"] },
      { label: "Share links, QR codes and share-to-social buttons",             authorloft: "yes", competitors: ["limited", "yes", "limited", "yes", "limited"] },
      { label: "AI-written promo posts (Standard and up)",                     authorloft: "yes", competitors: ["no", "no", "no", "no", "no"] },
      { label: "Posts to your social accounts for you",                         authorloft: "no",  competitors: ["no", "limited", "no", "no", "no"] },
      { label: "Also sell books and courses",                                   authorloft: "yes", competitors: ["no", "no", "no", "no", "no"] },
      { label: "Free plan (not just a trial)",                                  authorloft: "yes", competitors: ["yes", "yes", "no", "yes", "yes"] },
    ],
  },
];
