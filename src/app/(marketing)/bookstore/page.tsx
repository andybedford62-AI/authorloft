import type { Metadata } from "next";
import Link from "next/link";
import {
  BookMarked,
  ArrowRight,
  Sparkles,
  Clock,
  TrendingUp,
  PenLine,
  Eye,
  Store,
  Library,
  Tag,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import { BookstoreRow } from "@/components/marketing/bookstore-row";
import { BookstoreShare } from "@/components/marketing/bookstore-share";
import { BookstoreBookCard } from "@/components/marketing/bookstore-book-card";
import { getBookstoreData } from "@/lib/bookstore";

export const revalidate = 1800;

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com";
const BASE = `https://www.${PLATFORM}`;

export const metadata: Metadata = {
  title: "Bookstore — Discover Books by Independent Authors | AuthorLoft",
  description:
    "Browse books from independent authors on AuthorLoft. Discover your next read across every genre — then buy directly from each author's own site.",
  alternates: { canonical: `${BASE}/bookstore` },
  openGraph: {
    type: "website",
    title: "AuthorLoft Bookstore — Discover Independent Authors",
    description:
      "Browse books from independent authors across every genre. Discover your next read and support authors directly.",
    url: `${BASE}/bookstore`,
    images: [{ url: `${BASE}/og-home.png`, width: 1200, height: 630, alt: "AuthorLoft Bookstore" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AuthorLoft Bookstore — Discover Independent Authors",
    description:
      "Browse books from independent authors across every genre. Discover your next read and support authors directly.",
    images: [`${BASE}/og-home.png`],
  },
};

export default async function BookstorePage() {
  const { books, genres, stats, spotlight } = await getBookstoreData();

  // Derived rows — capped at 6 so each stays on a single clean line
  const newBooks = [...books].sort((a, b) => b.sortTimestamp - a.sortTimestamp).slice(0, 6);
  const anyViews = books.some((b) => b.views > 0);
  const trending = anyViews
    ? [...books].sort((a, b) => b.views - a.views).slice(0, 6)
    : [];
  const topGenres = genres.slice(0, 14);

  // Featured = Premium authors' books, best-rated first
  const featuredBooks = books
    .filter((b) => b.featured)
    .sort((a, b) => {
      const ar = a.averageRating ?? -1;
      const br = b.averageRating ?? -1;
      if (br !== ar) return br - ar;
      return b.sortTimestamp - a.sortTimestamp;
    })
    .slice(0, 6);

  // Structured data
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AuthorLoft Bookstore",
    description: "Browse books from independent authors on AuthorLoft across every genre.",
    url: `${BASE}/bookstore`,
    isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: BASE },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: books.length,
      itemListElement: books.slice(0, 100).map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          name: b.title,
          url: b.bookUrl,
          author: { "@type": "Person", name: b.authorName },
          ...(b.coverImageUrl ? { image: b.coverImageUrl } : {}),
          ...(b.averageRating !== null && b.ratingCount > 0
            ? {
                aggregateRating: {
                  "@type": "AggregateRating",
                  ratingValue: b.averageRating,
                  ratingCount: b.ratingCount,
                  bestRating: 5,
                  worstRating: 1,
                },
              }
            : {}),
        },
      })),
    },
  };

  const steps = [
    { icon: PenLine, title: "List your book", text: "Flip one toggle to add any published book to the shared catalog." },
    { icon: Eye, title: "Get discovered", text: "Readers browse by genre, rating, and price across every author." },
    { icon: Store, title: "Sell on your site", text: "Every link sends readers to your own AuthorLoft site to buy." },
  ];

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#DCDBD3]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #3a2417 0%, #5c3a22 35%, #7a4f2e 60%, #9c6a3d 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 2px, transparent 2px, transparent 22px)",
          }}
        />
        <div aria-hidden className="absolute inset-0 bg-[#1B2B47]/30" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center bg-white rounded-2xl px-5 py-3 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-12 w-auto" />
            </span>
          </div>
          <p className="text-xs font-mono uppercase tracking-widest text-[#F0D9B5] mb-3">
            · Discover independent authors ·
          </p>
          <h1 className="text-4xl sm:text-6xl font-serif text-white font-normal leading-tight drop-shadow-sm">
            The AuthorLoft <span className="italic text-[#F0D9B5]">Bookstore</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#F5ECDD] max-w-2xl mx-auto leading-relaxed">
            A shared shelf of books from independent authors across every genre. Find your
            next read, then buy directly from each author&apos;s own site.
          </p>

          <BookstoreShare url={`${BASE}/bookstore`} text="Discover books by independent authors on the AuthorLoft Bookstore" />
        </div>
      </section>

      {/* ── Stat bar ─────────────────────────────────────────────────────── */}
      <div className="bg-[#1B2B47]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-3 divide-x divide-white/10 text-center">
          {[
            { icon: Library, value: stats.books, label: stats.books === 1 ? "Book" : "Books" },
            { icon: PenLine, value: stats.authors, label: stats.authors === 1 ? "Author" : "Authors" },
            { icon: Tag, value: stats.genres, label: stats.genres === 1 ? "Genre" : "Genres" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-2">
              <Icon className="h-4 w-4 text-[#D4AE6A]" />
              <span className="text-2xl sm:text-3xl font-serif text-white leading-none">{value}</span>
              <span className="text-[11px] uppercase tracking-widest text-[#9fb0c9]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust line ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#DCDBD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-2 text-center">
          <BookMarked className="h-4 w-4 text-[#C26A4A] flex-shrink-0" />
          <p className="text-xs sm:text-sm text-[#5C6E89]">
            Every book here is published by an independent author on{" "}
            <span className="font-semibold text-[#1B2B47]">AuthorLoft</span>.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* ── Author spotlight ───────────────────────────────────────────── */}
        {spotlight && (
          <section className="mb-12">
            <div className="relative overflow-hidden rounded-3xl bg-[#27406B] text-white p-6 sm:p-8">
              <p className="text-xs font-mono uppercase tracking-widest text-[#D4AE6A] mb-4">
                · Author Spotlight ·
              </p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spotlight.image}
                  alt={spotlight.name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-4 border-white/15 shadow-lg flex-shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-serif text-2xl sm:text-3xl mb-1">{spotlight.name}</h2>
                  <p className="text-xs text-[#9fb0c9] mb-3">
                    {spotlight.bookCount} book{spotlight.bookCount !== 1 ? "s" : ""} in the bookstore
                  </p>
                  <p className="text-sm text-[#D4DDEB] leading-relaxed max-w-2xl">{spotlight.bio}</p>
                  <a
                    href={spotlight.url}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AE6A] hover:gap-2.5 transition-all"
                  >
                    Visit {spotlight.name}&apos;s site <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
                {spotlight.sampleCovers.length > 0 && (
                  <div className="hidden lg:flex gap-2 flex-shrink-0">
                    {spotlight.sampleCovers.slice(0, 3).map((c, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={i}
                        src={c}
                        alt=""
                        className="h-32 w-auto rounded-lg shadow-md object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── Featured Books (Premium) — distinct gold band ──────────────── */}
        {featuredBooks.length > 0 && (
          <section className="mb-12">
            <div className="rounded-3xl border border-[#E8C77E] bg-gradient-to-br from-[#FBF3E0] to-[#F2DFB4] p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#B8893D]" />
                <h2 className="font-serif text-2xl text-[#1B2B47]">Featured Books</h2>
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider text-[#7a5e2e] bg-[#E8C77E]/50 px-2 py-0.5 rounded-full">
                  Premium authors
                </span>
              </div>
              <p className="text-sm text-[#8a6d33] mt-1 mb-5">
                Hand-picked standout titles from authors on our Premium plan.
              </p>
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x scroll-smooth">
                {featuredBooks.map((b) => (
                  <div key={b.id} className="w-40 sm:w-44 shrink-0 snap-start">
                    <BookstoreBookCard book={b} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── New + Trending rows ────────────────────────────────────────── */}
        <BookstoreRow
          title="New on the Shelf"
          icon={<Clock className="h-5 w-5 text-[#C26A4A]" />}
          books={newBooks}
        />
        <BookstoreRow
          title="Trending Now"
          icon={<TrendingUp className="h-5 w-5 text-[#C26A4A]" />}
          books={trending}
        />

        {/* ── Browse by genre ────────────────────────────────────────────── */}
        {topGenres.length > 0 && (
          <section className="mb-12">
            <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47] mb-4">
              <Tag className="h-5 w-5 text-[#C26A4A]" />
              Browse by Genre
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {topGenres.map((g) => (
                <Link
                  key={g.slug}
                  href={`/bookstore/genre/${g.slug}`}
                  className="group inline-flex items-center gap-2 bg-white border border-[#DCDBD3] rounded-xl px-4 py-2.5 hover:border-[#C26A4A] hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-[#1B2B47] group-hover:text-[#C26A4A] transition-colors">
                    {g.name}
                  </span>
                  <span className="text-xs text-[#9b8e7e] bg-[#F0EDE4] rounded-full px-2 py-0.5">
                    {g.count}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── Full catalog ───────────────────────────────────────────────── */}
        <section>
          <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47] mb-5">
            <Library className="h-5 w-5 text-[#C26A4A]" />
            Browse All Books
          </h2>
          <BookstoreGrid books={books} allGenres={genres.map((g) => g.name)} />
        </section>
      </div>

      {/* ── How it works (author signup nudge) ───────────────────────────── */}
      <div className="bg-white border-y border-[#DCDBD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <p className="text-center text-xs font-mono uppercase tracking-widest text-[#C26A4A] mb-2">
            · For authors ·
          </p>
          <h2 className="text-center font-serif text-3xl text-[#1B2B47] mb-10">
            How the Bookstore works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="text-center">
                <div className="relative inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#F0EDE4] mb-4">
                  <Icon className="h-6 w-6 text-[#C26A4A]" />
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#1B2B47] text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-serif text-lg text-[#1B2B47] mb-1">{title}</h3>
                <p className="text-sm text-[#5C6E89] leading-relaxed max-w-xs mx-auto">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Author CTA band ──────────────────────────────────────────────── */}
      <div className="bg-[#1B2B47] py-16 px-4 text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-[#D4AE6A] mb-3">
          · Are you an author? ·
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#E8E5DD] font-normal mb-4">
          List your books in the <span className="italic text-[#D4AE6A]">AuthorLoft Bookstore</span>
        </h2>
        <p className="text-sm text-[#D4DDEB] mb-6 max-w-md mx-auto leading-relaxed">
          Reach new readers through our shared catalog — then sell directly from your own
          author site. Available on the Standard and Premium plans.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
