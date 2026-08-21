import type { Metadata } from "next";
import Link from "next/link";
import {
  BookMarked,
  ArrowRight,
  Clock,
  TrendingUp,
  PenLine,
  Eye,
  Store,
  Library,
  Tag,
  Sparkles,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import { BookstoreRow } from "@/components/marketing/bookstore-row";
import { BookstoreHero } from "@/components/marketing/bookstore-hero";
import { BookstoreCatalogTabs } from "@/components/marketing/bookstore-catalog-tabs";
import { getBookstoreData, getBookstoreCourses } from "@/lib/bookstore";

export const revalidate = 1800;

// Toggle to bring back the "Trending Now" row — hidden because it read too
// similar to "New on the Shelf" right above it. Data/component untouched.
const SHOW_TRENDING = false;

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com";
const BASE = `https://www.${PLATFORM}`;

export const metadata: Metadata = {
  title: "Bookstore — Discover Books by Independent Authors",
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
  const [{ books, genres, stats, spotlight }, { courses, categories: courseCategories }] = await Promise.all([
    getBookstoreData(),
    getBookstoreCourses(),
  ]);

  // "New on the Shelf" — genuinely new (released within the last 30 days,
  // same window as the per-card "New" badge) when there's enough volume;
  // falls back to the most recent handful (honestly relabeled, not claimed
  // as new) during sparse periods so the section is never empty-looking.
  // Capped at 6 either way so it stays small as more authors join.
  const genuinelyNewBooks = books
    .filter((b) => b.isNew)
    .sort((a, b) => b.sortTimestamp - a.sortTimestamp)
    .slice(0, 6);
  const newBooks = genuinelyNewBooks.length > 0
    ? genuinelyNewBooks
    : [...books].sort((a, b) => b.sortTimestamp - a.sortTimestamp).slice(0, 6);
  const newBooksSubtitle = genuinelyNewBooks.length > 0
    ? "Sorted by release date, most recent first — across every author in the bookstore."
    : "No new releases in the last 30 days — here are the latest additions.";
  const anyViews = books.some((b) => b.views > 0);
  const trending = anyViews
    ? [...books].sort((a, b) => b.views - a.views).slice(0, 6)
    : [];
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Bookstore", item: `${BASE}/bookstore` },
    ],
  };

  // Structured data
  const bookListItems = books.slice(0, 100).map((b, i) => ({
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
  }));

  // Courses continue the same ItemList numbering after the books.
  // schema.org Course requires name/description/provider, so description falls
  // back rather than emitting an incomplete entity.
  const courseListItems = courses.slice(0, 100).map((c, i) => ({
    "@type": "ListItem",
    position: bookListItems.length + i + 1,
    item: {
      "@type": "Course",
      name: c.title,
      url: c.courseUrl,
      description: c.description || `An online course by ${c.authorName}.`,
      provider: { "@type": "Person", name: c.authorName, url: c.authorUrl },
      ...(c.coverImageUrl ? { image: c.coverImageUrl } : {}),
      ...(c.averageRating !== null && c.ratingCount > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: c.averageRating,
              ratingCount: c.ratingCount,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
    },
  }));

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AuthorLoft Bookstore",
    description: "Browse books and courses from independent authors on AuthorLoft across every genre.",
    url: `${BASE}/bookstore`,
    isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: BASE },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: bookListItems.length + courseListItems.length,
      itemListElement: [...bookListItems, ...courseListItems],
    },
  };

  const steps = [
    { icon: PenLine, title: "List your book", text: "Flip one toggle to add any published book to the shared catalog." },
    { icon: Eye, title: "Get discovered", text: "Readers browse by genre, rating, and price across every author." },
    { icon: Store, title: "Sell on your site", text: "Every link sends readers to your own AuthorLoft site to buy." },
  ];

  return (
    <div className="min-h-screen bg-[#16233d]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <MarketingNav />

      {/* ── Hero (unified brand band + banner) ───────────────────────────── */}
      <MarketingPageHeader
        eyebrow="Discover independent authors"
        title={<>The AuthorLoft <span className="italic text-[#d6a94a]">Bookstore</span></>}
        subtitle="A shared shelf of books from independent authors across every genre. Find your next read, then buy directly from each author's own site."
        backgroundImage="/bookstore-header.png"
      />

      {/* ── Stat bar + social ────────────────────────────────────────────── */}
      <div className="bg-[#1e2f4d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 grid grid-cols-3 divide-x divide-white/10 text-center">
          {[
            { icon: Library, value: stats.books, label: stats.books === 1 ? "Book" : "Books" },
            { icon: PenLine, value: stats.authors, label: stats.authors === 1 ? "Author" : "Authors" },
            { icon: Tag, value: stats.genres, label: stats.genres === 1 ? "Genre" : "Genres" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-2">
              <Icon className="h-4 w-4 text-[#d6a94a]" />
              <span className="text-2xl sm:text-3xl font-serif text-[#f3ecdb] leading-none">{value}</span>
              <span className="text-[11px] uppercase tracking-widest text-[#93a0bc]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Trust line ───────────────────────────────────────────────────── */}
      <div className="bg-[#16233d] border-b border-[rgba(243,236,219,0.12)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-2 text-center">
          <BookMarked className="h-4 w-4 text-[#d6a94a] flex-shrink-0" />
          <p className="text-xs sm:text-sm text-[#93a0bc]">
            Every book here is published by an independent author on{" "}
            <span className="font-semibold text-[#f3ecdb]">AuthorLoft</span>.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* ── Mission statement hero ────────────────────────────────────── */}
        <BookstoreHero />

        {/* ── Author spotlight ───────────────────────────────────────────── */}
        {spotlight && (
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#243756] text-[#f3ecdb] p-4 sm:p-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#16233d] bg-[#d6a94a] px-3 py-1 rounded-full mb-3">
                <Sparkles className="h-3 w-3" /> Author Spotlight
              </div>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spotlight.image}
                  alt={spotlight.name}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-full object-cover border-2 border-white/15 shadow-lg flex-shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="font-serif italic text-lg sm:text-xl mb-0.5">{spotlight.name}</h2>
                  <p className="text-xs text-[#93a0bc] mb-1.5">
                    {spotlight.bookCount} book{spotlight.bookCount !== 1 ? "s" : ""} in the bookstore
                  </p>
                  <p className="text-sm text-[#c7cede] leading-relaxed max-w-2xl line-clamp-2">{spotlight.bio}</p>
                  {spotlight.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      {spotlight.badges.map((badge) => (
                        <span
                          key={badge.key}
                          title={badge.description ?? badge.label}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#d6a94a]/40 bg-[#d6a94a]/10 text-[#d6a94a]"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={spotlight.url}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#d6a94a] hover:gap-2.5 transition-all"
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
                        className="h-20 w-auto rounded-lg shadow-md object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* ── New on the Shelf — highlighted gold band, simplified cards ──── */}
        <BookstoreRow
          title="New on the Shelf"
          subtitle={newBooksSubtitle}
          icon={<Clock className="h-5 w-5 text-[#d6a94a]" />}
          books={newBooks}
          variant="gold"
          compact
        />

        {/* ── Trending ───────────────────────────────────────────────────── */}
        {/* Hidden for now — too similar to "New on the Shelf" right above it.
            Kept in code (not deleted) in case it's wanted again later. */}
        {SHOW_TRENDING && (
          <BookstoreRow
            title="Trending Now"
            icon={<TrendingUp className="h-5 w-5 text-[#d6a94a]" />}
            books={trending}
            variant="slate"
            quickView
          />
        )}

        {/* ── Full catalog — one dark panel, consistent with the rest of the
             site now that the search bar and book cards inside it are dark
             too (previously a light-blue panel to contrast against white
             cards). Books and Courses share one Type tab switcher instead of
             two always-visible sections — each keeps its own facet filters
             (genre chips for books, category chips for courses) since the
             two catalogs don't share a taxonomy. Courses tab only shows once
             there's at least one to browse. ─────────────────────────────── */}
        <section className="mb-12 rounded-2xl border border-[rgba(243,236,219,0.12)] bg-[#16233d] p-4 sm:p-6">
          {courses.length > 0 ? (
            <BookstoreCatalogTabs
              books={books}
              allGenres={genres.map((g) => g.name)}
              courses={courses}
              allCategories={courseCategories.map((c) => c.name)}
            />
          ) : (
            <>
              <h2 className="flex items-center gap-2 font-serif italic text-2xl text-[#f3ecdb] mb-5">
                <Library className="h-5 w-5 text-[#d6a94a]" />
                Browse All Books
              </h2>
              <BookstoreGrid books={books} allGenres={genres.map((g) => g.name)} />
            </>
          )}
        </section>
      </div>

      {/* ── How it works (author signup nudge) ───────────────────────────── */}
      <div className="bg-[#1e2f4d] border-y border-[rgba(243,236,219,0.12)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-[#d6a94a]">· For authors ·</p>
            <h2 className="font-serif italic text-lg sm:text-xl text-[#f3ecdb]">How the Bookstore works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex items-center gap-3 text-left sm:flex-col sm:text-center">
                <div className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#243756] flex-shrink-0">
                  <Icon className="h-4.5 w-4.5 text-[#d6a94a]" />
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-[#d6a94a] text-[#16233d] text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-sm text-[#f3ecdb]">{title}</h3>
                  <p className="text-xs text-[#93a0bc] leading-snug sm:max-w-[200px] sm:mx-auto">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Author CTA band ──────────────────────────────────────────────── */}
      <div className="bg-[#243756] py-6 px-4 text-center">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <p className="font-serif text-base sm:text-lg text-[#f3ecdb] font-normal">
            List your books in the <span className="italic text-[#d6a94a]">AuthorLoft Bookstore</span> — available on Standard and Premium.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 bg-[#d6a94a] text-[#16233d] font-semibold px-4 py-2 rounded-[6px] hover:bg-[#e2bc6e] transition-colors text-sm flex-shrink-0"
          >
            Get Started Free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
