import { prisma } from "@/lib/db";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { slugify } from "@/lib/utils";
import type { BookstoreBook } from "@/components/marketing/bookstore-book-card";
import type { BookstoreCourse } from "@/components/marketing/bookstore-course-card";

export type GenreCount = { name: string; slug: string; count: number };

export type Spotlight = {
  name: string;
  url: string;
  image: string;
  bio: string;
  bookCount: number;
  sampleCovers: string[];
  badges: import("@/lib/badges").EarnedBadge[];
} | null;

export type BookstoreData = {
  books: BookstoreBook[];
  genres: GenreCount[];
  stats: { books: number; authors: number; genres: number };
  spotlight: Spotlight;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/** Strip HTML tags + decode common entities so rich-text fields render as clean plain text. */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "’")
    .replace(/&lsquo;/gi, "‘")
    .replace(/&ldquo;/gi, "“")
    .replace(/&rdquo;/gi, "”")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Single source of truth for the public bookstore.
 * Returns enriched, serializable book data plus derived genres, stats and a
 * rotating author spotlight. Cached by the page's `revalidate`.
 */
export async function getBookstoreData(): Promise<BookstoreData> {
  const rows = await prisma.book
    .findMany({
      where: {
        listInBookstore: true,
        isPublished: true,
        author: {
          isActive: true,
          plan: { bookstoreListingEnabled: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        subtitle: true,
        coverImageUrl: true,
        description: true,
        availableFormats: true,
        priceCents: true,
        releaseDate: true,
        createdAt: true,
        views: true,
        isPreOrder: true,
        author: {
          select: {
            id: true,
            slug: true,
            customDomain: true,
            displayName: true,
            name: true,
            profileImageUrl: true,
            shortBio: true,
            bio: true,
            showBadges: true,
            plan: { select: { tier: true } },
          },
        },
        genres: { select: { genre: { select: { name: true } } } },
        directSaleItems: { where: { isActive: true }, select: { priceCents: true } },
        bookFeedback: { where: { status: "APPROVED" }, select: { rating: true } },
      },
    })
    .catch(() => []);

  const now = Date.now();
  const genreCounts = new Map<string, { name: string; count: number }>(); // slug -> {name,count}
  const authorBookCount = new Map<string, number>(); // author slug -> count

  // First pass: author book counts
  for (const b of rows) {
    authorBookCount.set(b.author.slug, (authorBookCount.get(b.author.slug) ?? 0) + 1);
  }

  const books: BookstoreBook[] = rows.map((b) => {
    const salePrices = b.directSaleItems.map((d) => d.priceCents).filter((p) => p >= 0);
    const lowestSale = salePrices.length > 0 ? Math.min(...salePrices) : null;
    const priceCents = lowestSale !== null ? lowestSale : b.priceCents > 0 ? b.priceCents : null;

    const ratings = b.bookFeedback.map((f) => f.rating).filter((r) => r >= 1 && r <= 5);
    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0
        ? Math.round((ratings.reduce((a, c) => a + c, 0) / ratingCount) * 10) / 10
        : null;

    const genreNames = b.genres.map((g) => g.genre.name);
    for (const name of genreNames) {
      const trimmed = name.trim();
      const slug = slugify(trimmed);
      if (!slug) continue;
      const existing = genreCounts.get(slug);
      if (existing) existing.count += 1;
      else genreCounts.set(slug, { name: trimmed, count: 1 });
    }

    const releaseMs = b.releaseDate ? new Date(b.releaseDate).getTime() : null;
    const isNew = releaseMs !== null && now - releaseMs <= THIRTY_DAYS_MS && releaseMs <= now;
    const sortTimestamp = releaseMs ?? new Date(b.createdAt).getTime();

    return {
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      coverImageUrl: b.coverImageUrl,
      authorName: b.author.displayName || b.author.name,
      authorUrl: getAuthorBaseUrl(b.author),
      bookUrl: `${getAuthorBaseUrl(b.author)}/books/${b.slug}`,
      description: b.description ? stripHtml(b.description) : null,
      genres: genreNames,
      formats: b.availableFormats ?? [],
      priceCents,
      averageRating,
      ratingCount,
      isNew,
      isPreOrder: b.isPreOrder,
      featured: b.author.plan?.tier === "PREMIUM",
      views: b.views ?? 0,
      authorBookCount: authorBookCount.get(b.author.slug) ?? 1,
      sortTimestamp,
    };
  });

  const genres: GenreCount[] = Array.from(genreCounts.entries())
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const uniqueAuthors = new Set(rows.map((b) => b.author.slug));

  // ── Rotating author spotlight: authors with a photo + bio, picked by day ──
  const spotlightCandidates = new Map<
    string,
    { authorId: string; showBadges: boolean; name: string; url: string; image: string; bio: string; bookCount: number; sampleCovers: string[] }
  >();
  for (const b of rows) {
    const a = b.author;
    const image = a.profileImageUrl;
    const bio = stripHtml(a.shortBio || a.bio || "");
    if (!image || !bio) continue;
    const key = a.slug;
    const entry = spotlightCandidates.get(key);
    if (entry) {
      entry.bookCount += 1;
      if (b.coverImageUrl && entry.sampleCovers.length < 4) entry.sampleCovers.push(b.coverImageUrl);
    } else {
      spotlightCandidates.set(key, {
        authorId: a.id,
        showBadges: a.showBadges,
        name: a.displayName || a.name,
        url: getAuthorBaseUrl(a),
        image,
        bio: bio.length > 280 ? bio.slice(0, 277) + "…" : bio,
        bookCount: 1,
        sampleCovers: b.coverImageUrl ? [b.coverImageUrl] : [],
      });
    }
  }
  const candidateList = Array.from(spotlightCandidates.values());
  let spotlight: Spotlight = null;
  if (candidateList.length > 0) {
    const dayOfYear = Math.floor((now - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const picked = candidateList[dayOfYear % candidateList.length];
    const { getAuthorBadges } = await import("@/lib/badges");
    const badges = picked.showBadges ? await getAuthorBadges(picked.authorId) : [];
    spotlight = { ...picked, badges };
  }

  return {
    books,
    genres,
    stats: { books: books.length, authors: uniqueAuthors.size, genres: genres.length },
    spotlight,
  };
}

export type CategoryCount = { name: string; slug: string; count: number };

export type BookstoreCoursesData = {
  courses: BookstoreCourse[];
  categories: CategoryCount[];
};

/**
 * Public bookstore courses — parallel to getBookstoreData() but for the
 * Course model. Courses now have their own category taxonomy (CourseCategory,
 * separate from book Genre — see prisma/schema.prisma), kept as a separate
 * facet/section rather than merged into the book grid.
 */
export async function getBookstoreCourses(): Promise<BookstoreCoursesData> {
  const rows = await prisma.course
    .findMany({
      where: {
        listInBookstore: true,
        isPublished: true,
        author: {
          isActive: true,
          plan: { bookstoreListingEnabled: true },
        },
      },
      orderBy: [{ createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        coverImageUrl: true,
        description: true,
        priceCents: true,
        createdAt: true,
        author: {
          select: {
            slug: true,
            customDomain: true,
            displayName: true,
            name: true,
          },
        },
        categories: { select: { category: { select: { name: true } } } },
        feedback: { where: { status: "APPROVED" }, select: { rating: true } },
      },
    })
    .catch(() => []);

  const categoryCounts = new Map<string, { name: string; count: number }>();

  const courses: BookstoreCourse[] = rows.map((c) => {
    const categoryNames = c.categories.map((cat) => cat.category.name);
    for (const name of categoryNames) {
      const trimmed = name.trim();
      const slug = slugify(trimmed);
      if (!slug) continue;
      const existing = categoryCounts.get(slug);
      if (existing) existing.count += 1;
      else categoryCounts.set(slug, { name: trimmed, count: 1 });
    }

    const ratings = c.feedback.map((f) => f.rating).filter((r) => r >= 1 && r <= 5);
    const ratingCount = ratings.length;
    const averageRating =
      ratingCount > 0
        ? Math.round((ratings.reduce((a, r) => a + r, 0) / ratingCount) * 10) / 10
        : null;

    return {
      id: c.id,
      title: c.title,
      coverImageUrl: c.coverImageUrl,
      authorName: c.author.displayName || c.author.name,
      authorUrl: getAuthorBaseUrl(c.author),
      courseUrl: `${getAuthorBaseUrl(c.author)}/courses/${c.slug}`,
      description: c.description ? stripHtml(c.description) : null,
      priceCents: c.priceCents > 0 ? c.priceCents : null,
      categories: categoryNames,
      sortTimestamp: new Date(c.createdAt).getTime(),
      averageRating,
      ratingCount,
    };
  });

  const categories: CategoryCount[] = Array.from(categoryCounts.entries())
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return { courses, categories };
}
