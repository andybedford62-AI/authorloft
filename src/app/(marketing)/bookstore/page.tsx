import type { Metadata } from "next";
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

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
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

      {/* ── Grid + filters ───────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <BookstoreGrid books={books} allGenres={genres} />
      </div>
    </div>
  );
}
