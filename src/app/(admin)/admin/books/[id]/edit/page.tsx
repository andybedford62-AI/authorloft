import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { BookEditTabsClient } from "@/components/admin/book-edit-tabs-client";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { CheckCircle2 } from "lucide-react";

export default async function EditBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { new: isNew } = await searchParams;
  const authorId = await getAdminAuthorId();
  const { id } = await params;

  const [book, seriesList, genreTree, author, previewMedia] = await Promise.all([
    prisma.book.findFirst({
      where: { id, authorId },
      include: { genres: { select: { genreId: true } } },
    }),
    prisma.series.findMany({
      where: { authorId },
      orderBy: { name: "asc" },
    }),
    prisma.genre.findMany({
      where: { authorId, parentId: null },
      include: { children: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.author.findUnique({
      where: { id: authorId },
      select: {
        slug: true,
        customDomain: true,
        stripeConnectOnboarded: true,
        plan: { select: { flipBooksLimit: true, audioEnabled: true, salesEnabled: true, tier: true, preOrdersEnabled: true } },
      },
    }),
    prisma.bookPreviewMedia.findMany({
      where: { bookId: id },
      orderBy: { position: "asc" },
    }),
  ]);

  if (!book) notFound();

  const genres = genreTree.flatMap((g) => [
    { id: g.id, name: g.name, parentName: undefined },
    ...g.children.map((c) => ({ id: c.id, name: c.name, parentName: g.name })),
  ]);

  const series = seriesList.map((s) => ({ id: s.id, name: s.name }));

  const bookData = {
    id: book.id,
    title: book.title,
    slug: book.slug,
    subtitle: book.subtitle,
    shortDescription: book.shortDescription,
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    priceCents: book.priceCents,
    seriesId: book.seriesId,
    isbn: book.isbn,
    pageCount: book.pageCount,
    isFeatured: book.isFeatured,
    isPublished: book.isPublished,
    directSalesEnabled: book.directSalesEnabled,
    listInBookstore: book.listInBookstore,
    isPreOrder: book.isPreOrder,
    preOrderDate: book.preOrderDate
      ? book.preOrderDate.toISOString().split("T")[0]
      : null,
    showCountdown: book.showCountdown,
    launchDate: book.launchDate
      ? book.launchDate.toISOString().slice(0, 16)
      : null,
    genreIds: book.genres.map((g) => g.genreId),
    availableFormats: book.availableFormats ?? [],
    caption: book.caption ?? null,
    releaseDate: book.releaseDate
      ? book.releaseDate.toISOString().split("T")[0]
      : null,
    sampleContent: book.sampleContent ?? null,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
        <p className="text-sm text-gray-500 mt-1">{book.title}</p>
      </div>

      {/* First-time guidance banner */}
      {isNew === "1" && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-green-900 text-sm">Book created — here's what to do next</p>
              <ul className="mt-2 space-y-1 text-sm text-green-800">
                <li>1. <strong>Details tab</strong> — add a cover image and description so readers know what your book is about</li>
                <li>2. <strong>Sales tab</strong> — upload your eBook or PDF and set a price to start selling directly</li>
                <li>3. <strong>Distribution tab</strong> — add buy links for Amazon, Apple Books, or other retailers</li>
              </ul>
              <p className="mt-2 text-xs text-green-700">Everything auto-saves. Skip any step and come back later.</p>
            </div>
          </div>
        </div>
      )}

      <BookEditTabsClient
        book={bookData}
        series={series}
        genres={genres}
        audioEnabled={author?.plan?.audioEnabled ?? false}
        salesEnabled={author?.plan?.salesEnabled ?? false}
        bookstoreEnabled={(author?.plan?.tier ?? "FREE") !== "FREE"}
        preOrdersEnabled={author?.plan?.preOrdersEnabled ?? false}
        arcEnabled={(author?.plan?.tier ?? "FREE") !== "FREE"}
        stripeConnectOnboarded={author?.stripeConnectOnboarded ?? false}
        previewMedia={previewMedia}
        publicBaseUrl={author ? getAuthorBaseUrl(author) : ""}
      />
    </div>
  );
}
