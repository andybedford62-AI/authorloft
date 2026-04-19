import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BookMarked, ArrowLeft, ExternalLink, Lock, Play } from "lucide-react";
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
        <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gray-50">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Cover image */}
            {flipBook.coverImageUrl && (
              <div className="relative w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                <Image
                  src={flipBook.coverImageUrl}
                  alt={flipBook.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h1 className="text-xl font-bold text-white leading-snug">{flipBook.title}</h1>
                  {flipBook.subtitle && (
                    <p className="text-sm text-white/70 mt-1">{flipBook.subtitle}</p>
                  )}
                </div>
              </div>
            )}

            {/* No cover fallback */}
            {!flipBook.coverImageUrl && (
              <div className="p-8 pb-0">
                <h1 className="text-2xl font-bold text-gray-900">{flipBook.title}</h1>
                {flipBook.subtitle && (
                  <p className="text-sm text-gray-500 mt-1">{flipBook.subtitle}</p>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-6 space-y-5">
              {flipBook.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{flipBook.description}</p>
              )}

              {/* Primary CTA */}
              <a
                href={flipBook.flipBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Play className="h-5 w-5 fill-white" />
                Open Flip Book
                <ExternalLink className="h-4 w-4 opacity-70" />
              </a>

              {/* Secondary nav */}
              <div className="flex gap-3">
                <Link href="/flip-books" className="flex-1">
                  <Button variant="outline" className="w-full text-sm">
                    ← All Flip Books
                  </Button>
                </Link>
                <Link href="/books" className="flex-1">
                  <Button variant="outline" className="w-full text-sm">
                    Browse Books
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
