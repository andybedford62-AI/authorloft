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
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import { BookstoreRow } from "@/components/marketing/bookstore-row";
import { BookstoreHero } from "@/components/marketing/bookstore-hero";
import { BookstoreCourseCard } from "@/components/marketing/bookstore-course-card";
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
  const [{ books, genres, stats, spotlight }, courses] = await Promise.all([
    getBookstoreData(),
    getBookstoreCourses(),
  ]);

  // Derived rows — capped at 6 so each stays on a single clean line
  const newBooks = [...books].sort((a, b) => b.sortTimestamp - a.sortTimestamp).slice(0, 6);
  const anyViews = books.some((b) => b.views > 0);
  const trending = anyViews
    ? [...books].sort((a, b) => b.views - a.views).slice(0, 6)
    : [];
  const topGenres = genres.slice(0, 14);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Bookstore", item: `${BASE}/bookstore` },
    ],
  };

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <MarketingNav />

      {/* ── Hero (unified brand band + banner) ───────────────────────────── */}
      <MarketingPageHeader
        eyebrow="Discover independent authors"
        title={<>The AuthorLoft <span className="italic text-[#D4AE6A]">Bookstore</span></>}
        subtitle="A shared shelf of books from independent authors across every genre. Find your next read, then buy directly from each author's own site."
        backgroundImage="/bookstore-header.png"
      />

      {/* ── Stat bar + social ────────────────────────────────────────────── */}
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
        {/* ── Mission statement hero ────────────────────────────────────── */}
        <BookstoreHero />

        {/* ── Author spotlight ───────────────────────────────────────────── */}
        {spotlight && (
          <section className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-[#27406B] text-white p-4 sm:p-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#1B2B47] bg-[#D4AE6A] px-3 py-1 rounded-full mb-3">
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
                  <h2 className="font-serif text-lg sm:text-xl mb-0.5">{spotlight.name}</h2>
                  <p className="text-xs text-[#9fb0c9] mb-1.5">
                    {spotlight.bookCount} book{spotlight.bookCount !== 1 ? "s" : ""} in the bookstore
                  </p>
                  <p className="text-sm text-[#D4DDEB] leading-relaxed max-w-2xl line-clamp-2">{spotlight.bio}</p>
                  {spotlight.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                      {spotlight.badges.map((badge) => (
                        <span
                          key={badge.key}
                          title={badge.description ?? badge.label}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D4AE6A]/40 bg-[#D4AE6A]/10 text-[#D4AE6A]"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={spotlight.url}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#D4AE6A] hover:gap-2.5 transition-all"
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
          subtitle="The latest titles added to the bookstore."
          icon={<Clock className="h-5 w-5 text-[#B8893D]" />}
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
            icon={<TrendingUp className="h-5 w-5 text-[#C26A4A]" />}
            books={trending}
            variant="slate"
            quickView
          />
        )}

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
        <section className="mb-12">
          <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47] mb-5">
            <Library className="h-5 w-5 text-[#C26A4A]" />
            Browse All Books
          </h2>
          <BookstoreGrid books={books} allGenres={genres.map((g) => g.name)} />
        </section>

        {/* ── Courses ───────────────────────────────────────────────────── */}
        {courses.length > 0 && (
          <section>
            <h2 className="flex items-center gap-2 font-serif text-2xl text-[#1B2B47] mb-5">
              <GraduationCap className="h-5 w-5 text-[#C26A4A]" />
              Courses from Independent Creators
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {courses.map((course) => (
                <BookstoreCourseCard key={course.id} course={course} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── How it works (author signup nudge) ───────────────────────────── */}
      <div className="bg-white border-y border-[#DCDBD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <p className="text-xs font-mono uppercase tracking-widest text-[#C26A4A]">· For authors ·</p>
            <h2 className="font-serif text-lg sm:text-xl text-[#1B2B47]">How the Bookstore works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="flex items-center gap-3 text-left sm:flex-col sm:text-center">
                <div className="relative inline-flex items-center justify-center h-10 w-10 rounded-xl bg-[#F0EDE4] flex-shrink-0">
                  <Icon className="h-4.5 w-4.5 text-[#C26A4A]" />
                  <span className="absolute -top-1.5 -right-1.5 h-4.5 w-4.5 rounded-full bg-[#1B2B47] text-white text-[10px] font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-sm text-[#1B2B47]">{title}</h3>
                  <p className="text-xs text-[#5C6E89] leading-snug sm:max-w-[200px] sm:mx-auto">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Author CTA band ──────────────────────────────────────────────── */}
      <div className="bg-[#1B2B47] py-6 px-4 text-center">
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-4 flex-wrap">
          <p className="font-serif text-base sm:text-lg text-[#E8E5DD] font-normal">
            List your books in the <span className="italic text-[#D4AE6A]">AuthorLoft Bookstore</span> — available on Standard and Premium.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 bg-[#B8893D] text-[#1B2B47] font-semibold px-4 py-2 rounded-full hover:bg-[#D4AE6A] transition-colors text-sm flex-shrink-0"
          >
            Get Started Free <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
