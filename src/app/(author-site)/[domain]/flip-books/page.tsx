import Image from "next/image";
import Link from "next/link";
import { BookMarked, Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAuthorByDomain } from "@/lib/author-queries";
import { prisma } from "@/lib/db";

export default async function FlipBooksPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  // Check plan — flipBooksLimit 0 = not enabled
  const flipBooksLimit = (author.plan as any)?.flipBooksLimit ?? 0;
  const flipBooksEnabled = flipBooksLimit !== 0;

  const flipBooks = flipBooksEnabled
    ? await prisma.flipBook.findMany({
        where: { authorId: author.id, isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      })
    : [];

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Page Header ─────────────────────────────────────────────── */}
      <section className="w-full py-12 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BookMarked className="h-6 w-6 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              Interactive Reading
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Flip Books</h1>
          <p className="text-white/75 mt-2 max-w-xl">
            Browse and read interactive flip book editions. Flip through pages, zoom in,
            and enjoy a fully immersive reading experience.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">

        {/* ── Feature not available on this plan ───────────────────── */}
        {!flipBooksEnabled && (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-7 w-7 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Flip books coming soon
            </h2>
            <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm">
              Interactive flip book editions will be available here.
              Browse the full catalog below in the meantime.
            </p>
            <Link href="/books">
              <Button>Browse All Books</Button>
            </Link>
          </div>
        )}

        {/* ── No flip books published yet ──────────────────────────── */}
        {flipBooksEnabled && flipBooks.length === 0 && (
          <div className="text-center py-20">
            <BookMarked className="h-10 w-10 text-gray-200 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-500">No flip books available yet</h2>
            <p className="text-gray-400 mt-2 mb-8 max-w-sm mx-auto">
              Flip book editions will appear here once they are published.
            </p>
            <Link href="/books">
              <Button variant="outline">Browse All Books</Button>
            </Link>
          </div>
        )}

        {/* ── Flip book grid ───────────────────────────────────────── */}
        {flipBooksEnabled && flipBooks.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {flipBooks.map((fb) => (
              <div
                key={fb.id}
                className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Cover */}
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  {fb.coverImageUrl ? (
                    <Image
                      src={fb.coverImageUrl}
                      alt={fb.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookMarked className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  {/* Play overlay */}
                  <Link href={`/flip-books/${fb.slug}`} className="absolute inset-0">
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                        <Play className="h-6 w-6 ml-1" style={{ color: accentColor }} />
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div>
                    <Link href={`/flip-books/${fb.slug}`}>
                      <h2 className="font-bold text-gray-900 leading-snug hover:underline">
                        {fb.title}
                      </h2>
                    </Link>
                    {fb.subtitle && (
                      <p className="text-sm text-gray-500 mt-0.5">{fb.subtitle}</p>
                    )}
                  </div>

                  {fb.description && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                      {fb.description}
                    </p>
                  )}

                  <Link href={`/flip-books/${fb.slug}`} className="mt-auto">
                    <Button className="w-full gap-2" style={{ backgroundColor: accentColor }}>
                      <Play className="h-4 w-4" />
                      Read Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
