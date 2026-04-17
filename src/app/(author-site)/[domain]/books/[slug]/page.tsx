import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, ShoppingCart, Tag, CalendarDays, FileText, Hash } from "lucide-react";
import { BookOverview } from "@/components/author-site/book-overview";
import { FormatBadges } from "@/components/author-site/format-badges";
import { AudioPlayer } from "@/components/author-site/audio-player";
import { BookPreviewGallery } from "@/components/author-site/book-preview-gallery";
import { prisma } from "@/lib/db";
import { getAuthorByDomain } from "@/lib/author-queries";
import { getRetailer } from "@/lib/retailers";
import { formatCents } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  const description =
    book.shortDescription ||
    (book.description ? book.description.replace(/<[^>]+>/g, "").slice(0, 160) : null) ||
    `${book.title} by ${authorName}.`;

  const ogImages = book.coverImageUrl
    ? [{ url: book.coverImageUrl, alt: book.title, width: 600, height: 900 }]
    : [];

  return {
    title: book.title,
    description,
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

// ── Format display helpers ────────────────────────────────────────────────────
const FORMAT_COLORS: Record<string, { color: string; bg: string }> = {
  EBOOK:    { color: "#2563eb", bg: "#eff6ff" },
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
        select: { id: true, retailer: true, label: true, url: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      },
      directSaleItems: {
        where: { isActive: true },
        select: { id: true, format: true, label: true, description: true, priceCents: true },
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
    },
  });

  if (!book) notFound();

  const salesEnabled        = author.plan?.salesEnabled ?? false;
  const audioEnabled        = author.plan?.audioEnabled ?? false;
  const hasDirectSaleItems  = salesEnabled && book.directSalesEnabled && book.directSaleItems.length > 0;
  const showLegacyDirectBuy = !hasDirectSaleItems && salesEnabled && book.directSalesEnabled && book.priceCents > 0;
  const hasRetailerLinks    = book.retailerLinks.length > 0;
  const hasBuyOptions       = hasDirectSaleItems || showLegacyDirectBuy || hasRetailerLinks;
  const hasAudioTracks      = audioEnabled && book.audioTracks.length > 0;

  const releaseDateFormatted = book.releaseDate
    ? new Date(book.releaseDate).toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric",
      })
    : null;

  const authorName = author.displayName || author.name;

  return (
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* ── Main book layout ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-10 py-12">

          {/* ── Cover column ──────────────────────────────────────────────── */}
          <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-4">

            {/* Cover image */}
            <div className="w-52 md:w-56 aspect-[2/3] bg-gray-100 rounded-xl overflow-hidden relative shadow-lg">
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
                <BookPreviewGallery items={book.previewMedia} accentColor={accentColor} />
              </div>
            )}

            {/* Format badges under cover */}
            {book.availableFormats.length > 0 && (
              <div className="w-full">
                <FormatBadges formats={book.availableFormats} size="sm" />
              </div>
            )}

            {/* Book meta — ISBN, pages, release date (sidebar on desktop) */}
            {(book.isbn || book.pageCount || releaseDateFormatted) && (
              <div className="hidden md:flex flex-col gap-2.5 w-full pt-2 border-t border-gray-100">
                {releaseDateFormatted && (
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{releaseDateFormatted}</span>
                  </div>
                )}
                {book.pageCount && (
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <FileText className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>{book.pageCount} pages</span>
                  </div>
                )}
                {book.isbn && (
                  <div className="flex items-start gap-2 text-xs text-gray-500">
                    <Hash className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-gray-400" />
                    <span>ISBN {book.isbn}</span>
                  </div>
                )}
              </div>
            )}
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
            </div>

            {/* Short description */}
            {book.shortDescription && (
              <p className="text-base text-gray-600 leading-relaxed border-l-4 pl-4"
                style={{ borderColor: accentColor }}>
                {book.shortDescription}
              </p>
            )}

            {/* Buy / Retailer buttons */}
            {hasBuyOptions && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3">
                <p className="text-sm font-semibold text-gray-700">Get this book</p>

                {/* Per-format direct sale items */}
                {hasDirectSaleItems && (
                  <div className="flex flex-wrap gap-2">
                    {book.directSaleItems.map((item) => {
                      const fmtStyle = FORMAT_COLORS[item.format] ?? FORMAT_COLORS.EBOOK;
                      return (
                        <Link
                          key={item.id}
                          href={`/books/${book.slug}/buy?item=${item.id}`}
                          title={item.description ?? undefined}
                          style={{ backgroundColor: accentColor }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 shadow-sm"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          <span>
                            {item.label}
                            {item.priceCents > 0
                              ? ` — ${formatCents(item.priceCents)}`
                              : " — Free"}
                          </span>
                          {item.description && (
                            <span
                              className="ml-1 text-xs px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: fmtStyle.bg, color: fmtStyle.color }}
                            >
                              {item.description}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Legacy single direct-buy button */}
                {showLegacyDirectBuy && (
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/books/${book.slug}/buy`}>
                      <Button variant="primary" size="sm">
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                        Buy — {formatCents(book.priceCents)}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Retailer links */}
                {hasRetailerLinks && (
                  <div className="flex flex-wrap gap-2">
                    {book.retailerLinks.map((link) => {
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
                  </div>
                )}
              </div>
            )}

            {/* Book Overview — collapsible */}
            {book.description && (
              <BookOverview text={book.description} accentColor={accentColor} />
            )}

            {/* Genres */}
            {book.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center pt-1">
                <Tag className="h-3.5 w-3.5 text-gray-300" />
                {book.genres.map(({ genre }) => (
                  <span
                    key={genre.id}
                    className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-500 bg-gray-50"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {/* Book meta — mobile only (shown below content, not in sidebar) */}
            {(book.isbn || book.pageCount || releaseDateFormatted) && (
              <div className="md:hidden flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 pt-3 border-t border-gray-100">
                {releaseDateFormatted && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                    {releaseDateFormatted}
                  </span>
                )}
                {book.pageCount && (
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-gray-400" />
                    {book.pageCount} pages
                  </span>
                )}
                {book.isbn && (
                  <span className="flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-gray-400" />
                    ISBN {book.isbn}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Audio Previews ───────────────────────────────────────────────── */}
        {hasAudioTracks && (
          <div className="pb-12 border-t border-gray-100 pt-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: accentColor + "20" }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    style={{ color: accentColor }}
                    fill="currentColor"
                  >
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">Listen to a Preview</h2>
                  <p className="text-sm text-gray-500">
                    {book.audioTracks.length === 1
                      ? "Audio clip from this book"
                      : `${book.audioTracks.length} audio clips from this book`}
                  </p>
                </div>
              </div>
              <AudioPlayer tracks={book.audioTracks} accentColor={accentColor} />
            </div>
          </div>
        )}

        {/* ── Back link ────────────────────────────────────────────────────── */}
        <div className="pb-16 border-t border-gray-100 pt-8">
          <Link href="/books">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to all books
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
