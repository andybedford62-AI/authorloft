import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookMarked, ArrowLeft, ExternalLink, Lock } from "lucide-react";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

interface Props {
  params: Promise<{ domain: string; slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { domain, slug } = await params;
  try {
    const author = await getAuthorByDomain(domain);
    const flipBook = await prisma.flipBook.findFirst({
      where: { authorId: author.id, slug, isActive: true },
      select: { title: true, description: true, coverImageUrl: true },
    });
    if (!flipBook) return {};
    return {
      title: `${flipBook.title} | ${author.displayName ?? author.name}`,
      description: flipBook.description ?? `Read ${flipBook.title} — interactive flip book edition`,
      openGraph: {
        images: flipBook.coverImageUrl ? [flipBook.coverImageUrl] : [],
      },
    };
  } catch {
    return {};
  }
}

export default async function FlipBookViewerPage({ params }: Props) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  // Check plan
  const flipBooksLimit = (author.plan as any)?.flipBooksLimit ?? 0;
  const flipBooksEnabled = flipBooksLimit !== 0;

  // Fetch the flip book
  const flipBook = await prisma.flipBook.findFirst({
    where: { authorId: author.id, slug, isActive: true },
  });

  if (!flipBook) notFound();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/20"
        style={{ backgroundColor: accentColor }}
      >
        <Link
          href="/flip-books"
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Flip Books
        </Link>

        <div className="text-center hidden sm:block">
          <p className="text-white font-semibold text-sm leading-tight line-clamp-1 max-w-xs">
            {flipBook.title}
          </p>
          {flipBook.subtitle && (
            <p className="text-white/60 text-xs line-clamp-1 max-w-xs">{flipBook.subtitle}</p>
          )}
        </div>

        {/* Spacer to keep title centered */}
        <div className="w-28 hidden sm:block" />
      </div>

      {/* ── Feature gate ─────────────────────────────────────────────────────── */}
      {!flipBooksEnabled && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <Lock className="h-7 w-7 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Preview not available</h2>
            <p className="text-gray-400 text-sm">
              Flip book previews are not currently available on this author site.
            </p>
            <Link href="/books">
              <Button style={{ backgroundColor: accentColor }}>Browse Books</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── No embed URL set yet ──────────────────────────────────────────────── */}
      {flipBooksEnabled && !flipBook.flipBookUrl && (
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center mx-auto">
              <BookMarked className="h-7 w-7 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700">Coming soon</h2>
            <p className="text-gray-400 text-sm">
              The flip book for <em>{flipBook.title}</em> hasn't been published yet.
              Check back soon!
            </p>
            <Link href="/flip-books">
              <Button style={{ backgroundColor: accentColor }}>View All Flip Books</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ── Viewer ───────────────────────────────────────────────────────────── */}
      {flipBooksEnabled && flipBook.flipBookUrl && (
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">

          {/* Flip book iframe — takes most of the space */}
          <div className="flex-1 bg-gray-900 flex flex-col" style={{ minHeight: "70vh" }}>
            <iframe
              src={flipBook.flipBookUrl}
              className="w-full flex-1"
              allowFullScreen
              allow="fullscreen"
              title={`${flipBook.title} — Flip Book`}
              style={{ minHeight: "60vh", border: "none" }}
            />

            {/* Bottom hint bar */}
            <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Use the controls inside the viewer to navigate pages.
              </p>
              <a
                href={flipBook.flipBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open in new tab
              </a>
            </div>
          </div>

          {/* Sidebar — flip book info */}
          <aside className="lg:w-72 xl:w-80 bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">

            {/* Book info */}
            <div className="p-6 space-y-5 flex-1">

              {/* Cover + title */}
              <div className="flex gap-4 items-start">
                <div className="relative w-20 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-md">
                  {flipBook.coverImageUrl ? (
                    <Image
                      src={flipBook.coverImageUrl}
                      alt={flipBook.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookMarked className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-gray-900 leading-snug">{flipBook.title}</h1>
                  {flipBook.subtitle && (
                    <p className="text-sm text-gray-500 mt-1 leading-tight">{flipBook.subtitle}</p>
                  )}
                </div>
              </div>

              {/* Description */}
              {flipBook.description && (
                <p className="text-sm text-gray-600 leading-relaxed">
                  {flipBook.description}
                </p>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-100 space-y-3">
              <Link href="/flip-books">
                <Button variant="outline" className="w-full">
                  ← All Flip Books
                </Button>
              </Link>
              <Link href="/books">
                <Button
                  className="w-full"
                  style={{ backgroundColor: accentColor }}
                >
                  Browse Full Catalog
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
