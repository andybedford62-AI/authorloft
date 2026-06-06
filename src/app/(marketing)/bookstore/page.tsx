import type { Metadata } from "next";
import Link from "next/link";
import { BookMarked, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import type { BookstoreBook } from "@/components/marketing/bookstore-book-card";

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

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

async function getBookstoreBooks(): Promise<{ books: BookstoreBook[]; genres: string[] }> {
  const rows = await prisma.book
    .findMany({
      where: {
        listInBookstore: true,
        isPublished: true,
        author: {
          isActive: true,
          plan: { tier: { in: ["STANDARD", "PREMIUM"] } },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        coverImageUrl: true,
        availableFormats: true,
        priceCents: true,
        releaseDate: true,
        createdAt: true,
        author: {
          select: { slug: true, customDomain: true, displayName: true, name: true },
        },
        genres: { select: { genre: { select: { name: true } } } },
        directSaleItems: {
          where: { isActive: true },
          select: { priceCents: true },
        },
        bookFeedback: {
          where: { status: "APPROVED" },
          select: { rating: true },
        },
      },
    })
    .catch(() => []);

  const now = Date.now();
  const genreSet = new Map<string, string>(); // lowercased -> display name

  const books: BookstoreBook[] = rows.map((b) => {
    // Lowest active direct-sale price; fall back to the retail/display price.
    const salefPrices = b.directSaleItems.map((d) => d.priceCents).filter((p) => p >= 0);
    const lowestSale = salefPrices.length > 0 ? Math.min(...salefPrices) : null;
    const priceCents = lowestSale !== null ? lowestSale : b.priceCents > 0 ? b.priceCents : null;

    // Approved ratings → average + count
    const ratings = b.bookFeedback.map((f) => f.rating).filter((r) => r >= 1 && r <= 5);
    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0 ? Math.round((ratings.reduce((a, c) => a + c, 0) / ratingCount) * 10) / 10 : null;

    const genreNames = b.genres.map((g) => g.genre.name);
    for (const name of genreNames) {
      const key = name.trim().toLowerCase();
      if (key && !genreSet.has(key)) genreSet.set(key, name.trim());
    }

    const releaseMs = b.releaseDate ? new Date(b.releaseDate).getTime() : null;
    const isNew = releaseMs !== null && now - releaseMs <= THIRTY_DAYS_MS && releaseMs <= now;
    const sortTimestamp = releaseMs ?? new Date(b.createdAt).getTime();

    const authorName = b.author.displayName || b.author.name;
    const bookUrl = `${getAuthorBaseUrl(b.author)}/books/${b.slug}`;

    return {
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      coverImageUrl: b.coverImageUrl,
      authorName,
      bookUrl,
      genres: genreNames,
      formats: b.availableFormats ?? [],
      priceCents,
      averageRating,
      ratingCount,
      isNew,
      sortTimestamp,
    };
  });

  const genres = Array.from(genreSet.values()).sort((a, b) => a.localeCompare(b));

  return { books, genres };
}

export default async function BookstorePage() {
  const { books, genres } = await getBookstoreBooks();

  // ── Structured data: a CollectionPage wrapping an ItemList of books ──
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AuthorLoft Bookstore",
    description:
      "Browse books from independent authors on AuthorLoft across every genre.",
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

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#DCDBD3]">
        {/* Warm "library shelf" gradient backdrop */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #3a2417 0%, #5c3a22 35%, #7a4f2e 60%, #9c6a3d 100%)",
          }}
        />
        {/* Subtle vertical "spines" texture + parchment veil */}
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
          {/* AuthorLoft logo badge */}
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
        </div>
      </section>

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

      {/* ── Grid + filters ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <BookstoreGrid books={books} allGenres={genres} />
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
