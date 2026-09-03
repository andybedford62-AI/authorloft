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
      "AuthorLoft's music tools are link-only playlists (nothing uploaded or streamed) — compared here against the link-in-bio and music-marketing tools that fill the same job, not full streaming hosts like SoundCloud or Bandcamp.",
    competitorNames: ["Linktree", "Feature.fm", "Bandzoogle", "Beacons"],
    rows: [
      { label: "A real website — not just a link page", authorloft: "yes", competitors: ["no", "no", "yes", "no"] },
      { label: "Also sell books directly",               authorloft: "yes", competitors: ["no", "no", "no", "no"] },
      { label: "Also host online courses",                authorloft: "yes", competitors: ["no", "no", "no", "no"] },
      { label: "Free plan (not just a trial)",            authorloft: "yes", competitors: ["yes", "yes", "no", "yes"] },
      { label: "Pre-save campaigns & smart streaming links", authorloft: "no", competitors: ["no", "yes", "no", "no"] },
    ],
  },
];
