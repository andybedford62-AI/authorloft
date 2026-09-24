import { toMetaDescription } from "@/lib/meta-text";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { sanitize } from "@/lib/sanitize";
import { ArrowLeft, BookOpen, ExternalLink, Star } from "lucide-react";
import { BookOverview } from "@/components/author-site/book-overview";
import { BookExcerptModal } from "@/components/author-site/book-excerpt-modal";
import { FormatBadges } from "@/components/author-site/format-badges";
import { AudioPlayer } from "@/components/author-site/audio-player";
import { BookPreviewGallery } from "@/components/author-site/book-preview-gallery";
import { BookBuySection } from "@/components/author-site/book-buy-section";
import { BookReviews, type ReviewCard } from "@/components/author-site/book-reviews";
import { PreOrderSignupForm } from "@/components/author-site/preorder-signup-form";
import { LaunchCountdown } from "@/components/author-site/launch-countdown";
import { AffiliateRefTracker } from "@/components/author-site/affiliate-ref-tracker";
import { ShareBar } from "@/components/author-site/share-bar";
import { BookFormatBuy } from "@/components/author-site/book-format-buy";
import { buildFormatOptions, listingPrice } from "@/lib/book-formats";
import { accentAsSurface } from "@/lib/color-contrast";
import { prisma } from "@/lib/db";
import { getAuthorByDomain } from "@/lib/author-queries";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { getRetailer } from "@/lib/retailers";
import { formatCents } from "@/lib/utils";
import { AddToCartButtons } from "@/components/author-site/add-to-cart-buttons";
import { ReaderMagnetButton } from "@/components/author-site/reader-magnet-button";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;

  const book = await prisma.book.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    select: {
      title: true,
      shortDescription: true,
      description: true,
      coverImageUrl: true,
      genres: { include: { genre: { select: { name: true } } } },
    },
  });

  if (!book) return { title: "Book Not Found" };

  const base        = getAuthorBaseUrl(author);
  const canonicalUrl = `${base}/books/${slug}`;
  const description = toMetaDescription([book.shortDescription, book.description], `${book.title} by ${authorName}. See the description and available formats, and find where to buy.`);

  // Cover first; a coverless book falls back to the author's own photo rather
  // than unfurling with no image (page-level openGraph replaces the layout's).
  const ogImages = book.coverImageUrl
    ? [{ url: book.coverImageUrl, alt: book.title, width: 600, height: 900 }]
    : author.profileImageUrl
      ? [{ url: author.profileImageUrl, alt: authorName }]
      : [];

  return {
    title: book.title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "book",
      title: `${book.title} by ${authorName}`,
      description,
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      title: `${book.title} by ${authorName}`,
      description,
      ...(ogImages.length > 0 && { images: [ogImages[0].url] }),
    },
  };
}

/** One heading style for every section below the hero. */
const SECTION_HEADING = "text-xl font-bold text-gray-900 mb-3";

// ── Format display helpers ────────────────────────────────────────────────────
const FORMAT_COLORS: Record<string, { color: string; bg: string }> = {
  EBOOK:    { color: "#2563eb", bg: "#eff6ff" },
  AUDIO:    { color: "#d97706", bg: "#fffbeb" },
  FLIPBOOK: { color: "#7c3aed", bg: "#f5f3ff" },
  PRINT:    { color: "#059669", bg: "#ecfdf5" },
};

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const book = await prisma.book.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    include: {
      series: { select: { id: true, name: true, slug: true } },
      genres: {
        include: { genre: { select: { id: true, name: true } } },
      },
      retailerLinks: {
        where: { isActive: true },
        select: { id: true, retailer: true, label: true, url: true, formats: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      directSaleItems: {
        where: { isActive: true },
        select: { id: true, format: true, label: true, description: true, priceCents: true, isReaderMagnet: true, fileKey: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      audioTracks: {
        where: { isActive: true },
        select: { id: true, title: true, description: true, url: true, durationSeconds: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      previewMedia: {
        where: { fileUrl: { not: "" } },
        select: { id: true, position: true, mediaType: true, fileUrl: true, thumbnailUrl: true },
        orderBy: { position: "asc" },
      },
      reviews: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: { id: true, quote: true, reviewerName: true, source: true, rating: true },
      },
      bookFeedback: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" },
        select: { id: true, comment: true, reviewerName: true, rating: true },
      },
    },
  });

  if (!book) notFound();

  // Increment view count (fire-and-forget) so the bookstore "Trending Now"
  // row — which sorts by Book.views — has data to populate.
  prisma.book
    .update({ where: { id: book.id }, data: { views: { increment: 1 } } })
    .catch(() => {});

  const salesEnabled        = author.plan?.salesEnabled ?? false;
  const audioEnabled        = author.plan?.audioEnabled ?? false;
  const stripeReady         = author.stripeConnectOnboarded ?? false;
  // Reader Magnets are free (file in exchange for an email) → available on every
  // plan, no Stripe, and independent of the paid "Enable Direct Sales" switch.
  const magnetItems         = book.directSaleItems.filter((i) => i.isReaderMagnet && i.fileKey);
  // Paid editions only appear when the author can actually take money:
  // paid plan + the book's Direct Sales switch + a connected Stripe account.
  const canSellPaid         = salesEnabled && book.directSalesEnabled && stripeReady;
  const paidSaleItems       = canSellPaid
    ? book.directSaleItems.filter((i) => !i.isReaderMagnet)
    : [];
  const hasDirectSaleItems  = paidSaleItems.length > 0;
  const hasRetailerLinks    = book.retailerLinks.length > 0;
  const hasBuyOptions       = hasDirectSaleItems || hasRetailerLinks || magnetItems.length > 0;
  const hasAudioTracks      = audioEnabled && book.audioTracks.length > 0;

  const isPreOrderActive = book.isPreOrder && (!book.preOrderDate || book.preOrderDate > new Date());

  // Format-first buy area: one card per format with its price and the ways to
  // buy it. Books with no formats and no direct items keep the plain button row.
  const formatOptions = buildFormatOptions({
    availableFormats: book.availableFormats,
    formatPrices:     book.formatPrices,
    retailerLinks:    book.retailerLinks,
    paidItems:        paidSaleItems,
    magnetItems,
  });
  const showFormatCards = !isPreOrderActive && hasBuyOptions && formatOptions.length > 0;
  const formatCardsPriced = showFormatCards && formatOptions.some((o) => o.priceCents !== null);
  // Goodreads is a review site — with format cards it sits with the book details.
  const goodreadsLink = showFormatCards ? book.retailerLinks.find((l) => l.retailer === "goodreads") : undefined;
  const showLaunchCountdown = book.showCountdown && !!book.launchDate && book.launchDate > new Date();
  const preOrderLaunchLabel = book.preOrderDate
    ? new Date(book.preOrderDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const releaseDateFormatted = book.releaseDate
    ? new Date(book.releaseDate).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  const authorName = author.displayName || author.name;

  const base = getAuthorBaseUrl(author);
  const bookUrl = `${base}/books/${book.slug}`;

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type":    "Book",
    name:       book.title,
    url:        bookUrl,
    author:     { "@type": "Person", name: authorName, url: `${base}/about`, sameAs: base, ...(author.profileImageUrl && { image: author.profileImageUrl }) },
    description: toMetaDescription([book.shortDescription, book.description], "", 300) || undefined,
    ...(book.coverImageUrl && { image: book.coverImageUrl }),
    ...(book.isbn          && { isbn: book.isbn }),
    ...(book.pageCount     && { numberOfPages: book.pageCount }),
    ...(book.language      && { inLanguage: book.language }),
    ...(book.releaseDate   && { datePublished: new Date(book.releaseDate).toISOString().split("T")[0] }),
    ...(book.genres.length > 0 && { genre: book.genres.map((g) => g.genre.name) }),
    ...(formatCardsPriced ? {
      offers: formatOptions.filter((o) => o.priceCents !== null).map((o) => ({
        "@type":       "Offer",
        name:          o.name,
        price:         (o.priceCents! / 100).toFixed(2),
        priceCurrency: "USD",
        availability:  "https://schema.org/InStock",
        url:           bookUrl,
      })),
    } : book.priceCents > 0 && {
      offers: {
        "@type":       "Offer",
        price:         (book.priceCents / 100).toFixed(2),
        priceCurrency: "USD",
        availability:  "https://schema.org/InStock",
        url:           bookUrl,
      },
    }),
  };

  // Aggregate rating across editorial pull-quotes (optional star) and approved
  // reader feedback (star required). This was already being computed for the
  // JSON-LD below -- i.e. handed to search engines -- but never shown to the
  // reader on the page itself. Rounded to one decimal to match the same
  // aggregation in lib/bookstore.ts, which drives the catalogue cards.
  const allRatings = [
    ...book.reviews.filter((r) => r.rating).map((r) => r.rating!),
    ...book.bookFeedback.map((fb) => fb.rating),
  ];
  const ratingCount = allRatings.length;
  const averageRating =
    ratingCount > 0
      ? Math.round((allRatings.reduce((sum, r) => sum + r, 0) / ratingCount) * 10) / 10
      : null;
  if (averageRating !== null) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: averageRating.toFixed(1),
      bestRating: 5,
      ratingCount,
    };
  }

  // Review cards: editorial pull-quotes, then approved reader reviews that say
  // something (star-only ratings still count toward the average above).
  const reviewCards: ReviewCard[] = [
    ...book.reviews.map((r) => ({ id: r.id, quote: r.quote, reviewerName: r.reviewerName, source: r.source, rating: r.rating })),
    ...book.bookFeedback
      .filter((fb) => fb.comment?.trim())
      .map((fb) => ({ id: fb.id, quote: fb.comment!, reviewerName: fb.reviewerName, source: null, rating: fb.rating })),
  ];

  const hasBookDetails =
    !!book.series || book.genres.length > 0 || !!releaseDateFormatted || !!book.pageCount || !!book.isbn || !!book.asin;

  // "More by" row: same-series books first, then featured, then the author's order.
  const otherBooks = await prisma.book.findMany({
    where: { authorId: author.id, isPublished: true, id: { not: book.id } },
    select: { id: true, title: true, slug: true, coverImageUrl: true, priceCents: true, formatPrices: true, seriesId: true, isFeatured: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 24,
  });
  const moreBooks = otherBooks
    .map((b, i) => ({ b, rank: (book.seriesId && b.seriesId === book.seriesId ? 0 : b.isFeatured ? 1 : 2) * 1000 + i }))
    .sort((x, y) => x.rank - y.rank)
    .slice(0, 4)
    .map((x) => x.b);

  const isbn = book.isbn;
  const asin = book.asin;

  // Book facts + "try before you buy" cards. Desktop: stacked under the cover.
  // Phones: after "About this book", so the title and buy area always come first.
  const sideCards = hasBookDetails || book.sampleContent || hasAudioTracks ? (
    <div className="space-y-4">
      {hasBookDetails && (
        <aside className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Book details</h3>
          <dl className="divide-y divide-gray-200 text-[13px]">
            {book.series && (
              <div className="flex justify-between gap-3 py-1.5">
                <dt className="text-gray-500">Series</dt>
                <dd className="text-right">
                  <Link href={`/series/${book.series.slug}`} className="font-medium text-gray-900 hover:text-[var(--accent)]">
                    {book.series.name}
                  </Link>
                </dd>
              </div>
            )}
            {book.genres.length > 0 && (
              <div className="flex justify-between gap-3 py-1.5">
                <dt className="text-gray-500">Genre</dt>
                <dd className="text-right text-gray-900">{book.genres.map(({ genre }) => genre.name).join(", ")}</dd>
              </div>
            )}
            {releaseDateFormatted && (
              <div className="flex justify-between gap-3 py-1.5">
                <dt className="text-gray-500">Published</dt>
                <dd className="text-right text-gray-900">{releaseDateFormatted}</dd>
              </div>
            )}
            {book.pageCount && (
              <div className="flex justify-between gap-3 py-1.5">
                <dt className="text-gray-500">Pages</dt>
                <dd className="text-right text-gray-900">{book.pageCount}</dd>
              </div>
            )}
            {isbn && (
              <div className="flex justify-between gap-3 py-1.5">
                <dt className="text-gray-500">ISBN</dt>
                <dd className="text-right text-gray-900 break-all">{isbn}</dd>
              </div>
            )}
            {asin && (
              <div className="flex justify-between gap-3 py-1.5">
                <dt className="text-gray-500">ASIN</dt>
                <dd className="text-right text-gray-900 break-all">{asin}</dd>
              </div>
            )}
          </dl>
        </aside>
      )}
      {book.sampleContent && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <BookExcerptModal
            sampleContent={sanitize(book.sampleContent)}
            bookTitle={book.title}
            bookSlug={book.slug}
            hasBuyOptions={hasBuyOptions}
            accentColor={accentColor}
          />
        </div>
      )}
      {hasAudioTracks && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Listen to a clip</h3>
            <p className="text-xs text-gray-500">
              {book.audioTracks.length === 1 ? "An audio clip from this book" : `${book.audioTracks.length} audio clips from this book`}
            </p>
          </div>
          <AudioPlayer tracks={book.audioTracks} accentColor={accentColor} />
        </div>
      )}
    </div>
  ) : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Books", item: `${base}/books` },
      { "@type": "ListItem", position: 3, name: book.title, item: bookUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {book.affiliateEnabled && (
        <AffiliateRefTracker bookId={book.id} bookSlug={book.slug} domain={domain} />
      )}
    <div
      className="min-h-screen bg-white"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      {/* ── Accent hero strip ──────────────────────────────────────────────── */}
      <div className="w-full py-3 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-5xl mx-auto">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All Books
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Main book layout ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-12 py-12">

          {/* ── Cover column ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4 w-full md:w-72">

            {/* Cover image */}
            <div className="w-full aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden relative shadow-lg">
              {book.coverImageUrl ? (
                <Image
                  src={book.coverImageUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-gray-300" />
                </div>
              )}
            </div>

            {/* Preview media thumbnails */}
            {book.previewMedia.length > 0 && (
              <div className="w-full overflow-visible">
                <BookPreviewGallery items={book.previewMedia} accentColor={accentColor} bookTitle={book.title} />
              </div>
            )}

            {/* Format badges under cover */}
            {book.availableFormats.length > 0 && !showFormatCards && (
              <div className="w-full">
                <FormatBadges formats={book.availableFormats} size="sm" />
              </div>
            )}

            {sideCards && <div className="hidden md:block w-full">{sideCards}</div>}
          </div>

          {/* ── Details column ────────────────────────────────────────────── */}
          <div className="flex-1 space-y-5">

            {/* Caption */}
            {book.caption && (
              <p
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {book.caption}
              </p>
            )}

            {/* Series breadcrumb */}
            {book.series && (
              <p className="text-sm text-gray-500">
                Part of{" "}
                <Link
                  href={`/series/${book.series.slug}`}
                  className="font-medium hover:text-[var(--accent)] transition-colors"
                >
                  {book.series.name}
                </Link>
              </p>
            )}

            {/* Title + subtitle */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="mt-2 text-xl text-gray-500 leading-snug">{book.subtitle}</p>
              )}
              <p className="mt-2 text-sm text-gray-400">by {authorName}</p>

              {/* Aggregate rating — only rendered once real ratings exist, so a
                  book with none shows nothing rather than an empty five stars. */}
              {averageRating !== null && (
                <div
                  className="mt-3 flex items-center gap-2"
                  aria-label={`Rated ${averageRating.toFixed(1)} out of 5 from ${ratingCount} ${ratingCount === 1 ? "rating" : "ratings"}`}
                >
                  <div className="flex" aria-hidden="true">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-4 w-4 ${
                          n <= Math.round(averageRating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-900 tabular-nums">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
                  </span>
                </div>
              )}

              {book.priceCents > 0 && !formatCardsPriced && (
                <p className="mt-3 text-2xl font-bold text-gray-900">{formatCents(book.priceCents)}</p>
              )}

              {goodreadsLink && (
                <a
                  href={goodreadsLink.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#553B08] hover:underline"
                >
                  ★ Reviews on Goodreads <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}

              <div className="mt-4">
                <ShareBar
                  url={bookUrl}
                  title={book.title}
                  text={`Check out "${book.title}" by ${authorName}`}
                  campaign={book.slug}
                  accentSurface={accentAsSurface(accentColor)}
                />
              </div>
            </div>

            {/* Short description */}
            {book.shortDescription && (
              <div
                className="text-base text-gray-600 leading-relaxed border-l-4 pl-4 rich-content"
                style={{ borderColor: accentColor }}
                dangerouslySetInnerHTML={{ __html: sanitize(book.shortDescription) }}
              />
            )}

            {/* Launch countdown */}
            {showLaunchCountdown && (
              <LaunchCountdown
                launchDate={book.launchDate!.toISOString()}
                accentColor={accentColor}
              />
            )}

            {/* Pre-order / Coming Soon — replaces buy options until launch */}
            {isPreOrderActive && (
              <PreOrderSignupForm
                bookSlug={book.slug}
                domain={domain}
                accentColor={accentColor}
                launchLabel={preOrderLaunchLabel}
              />
            )}

            {/* Buy area — format cards when the book has formats */}
            {showFormatCards && (
              <BookBuySection>
                <BookFormatBuy
                  options={formatOptions}
                  book={{ id: book.id, slug: book.slug, title: book.title, coverImageUrl: book.coverImageUrl }}
                  authorId={author.id}
                  authorFirstName={authorName.split(" ")[0]}
                  accentColor={accentColor}
                  accentSurface={accentAsSurface(accentColor)}
                />
              </BookBuySection>
            )}

            {/* Buy / Retailer buttons — books with no formats listed */}
            {!isPreOrderActive && hasBuyOptions && !showFormatCards && (
              <BookBuySection>
                <div id="buy" className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Get this book</p>
                  <div className="flex flex-wrap gap-2">

                    {/* Retailer links — shown first */}
                    {hasRetailerLinks && book.retailerLinks.map((link) => {
                      const info = getRetailer(link.retailer);
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            borderColor: info.color,
                            color: info.color,
                            backgroundColor: info.badgeBg,
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-sm font-medium transition-opacity hover:opacity-80"
                        >
                          {link.label}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      );
                    })}

                    {/* Per-format direct sale items — Add to Cart */}
                    {hasDirectSaleItems && (
                      <AddToCartButtons
                        items={paidSaleItems}
                        bookId={book.id}
                        bookSlug={book.slug}
                        bookTitle={book.title}
                        coverImageUrl={book.coverImageUrl}
                        accentColor={accentColor}
                        formatColors={FORMAT_COLORS}
                      />
                    )}

                    {/* Reader magnet items — free in exchange for email */}
                    {magnetItems.map((item) => {
                      const colors = FORMAT_COLORS[item.format] ?? FORMAT_COLORS.EBOOK;
                      return (
                        <ReaderMagnetButton
                          key={item.id}
                          bookId={book.id}
                          saleItemId={item.id}
                          authorId={author.id}
                          bookTitle={book.title}
                          format={item.format}
                          label={item.label}
                          coverImageUrl={book.coverImageUrl}
                          accentColor={accentColor}
                          formatColor={colors.color}
                          formatBg={colors.bg}
                        />
                      );
                    })}

                  </div>
                </div>
              </BookBuySection>
            )}

            {/* About this book */}
            {book.description && (
              <section aria-labelledby="about-heading" className="pt-6 border-t border-gray-100">
                <h2 id="about-heading" className={SECTION_HEADING}>About this book</h2>
                <BookOverview text={book.description} accentColor={accentColor} />
              </section>
            )}

            {/* Phones: book details + previews come after About, never before the title */}
            {sideCards && <div className="md:hidden pt-6 border-t border-gray-100">{sideCards}</div>}

            {/* Reviews — summary, cards, and a pop-up form */}
            <section aria-labelledby="reviews-heading" className="pt-6 border-t border-gray-100">
              <h2 id="reviews-heading" className={SECTION_HEADING}>Reviews</h2>
              <BookReviews
                reviews={reviewCards}
                averageRating={averageRating}
                ratingCount={ratingCount}
                bookTitle={book.title}
                bookSlug={book.slug}
                domain={domain}
                accentColor={accentColor}
              />
            </section>
          </div>
        </div>

        {/* ── More by the author — full width under both columns ─────────────── */}
        <div className="border-t border-gray-100 pt-8 pb-16">
          {/* More by the author — keeps readers browsing instead of a back button */}
          {moreBooks.length > 0 && (
            <section aria-labelledby="more-heading">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="more-heading" className={SECTION_HEADING}>More by {authorName}</h2>
                <Link href="/books" className="text-sm font-semibold whitespace-nowrap hover:opacity-80" style={{ color: accentColor }}>
                  View all books →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                {moreBooks.map((b) => {
                  const listed = listingPrice({ priceCents: b.priceCents, formatPrices: b.formatPrices });
                  return (
                    <Link key={b.id} href={`/books/${b.slug}`} className="group">
                      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-gray-100 shadow-md transition-transform group-hover:-translate-y-0.5">
                        {b.coverImageUrl ? (
                          <Image src={b.coverImageUrl} alt={b.title} fill sizes="(min-width: 640px) 25vw, 50vw" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[var(--accent)]">{b.title}</p>
                      {listed && (
                        <p className="text-sm text-gray-500">{listed.from ? "From " : ""}{formatCents(listed.cents)}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
