import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { BookEditTabsClient } from "@/components/admin/book-edit-tabs-client";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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
      select: { plan: { select: { flipBooksLimit: true, audioEnabled: true, salesEnabled: true } } },
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
    genreIds: book.genres.map((g) => g.genreId),
    availableFormats: book.availableFormats ?? [],
    caption: book.caption ?? null,
    releaseDate: book.releaseDate
      ? book.releaseDate.toISOString().split("T")[0]
      : null,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
        <p className="text-sm text-gray-500 mt-1">{book.title}</p>
      </div>
      <BookEditTabsClient
        book={bookData}
        series={series}
        genres={genres}
        audioEnabled={author?.plan?.audioEnabled ?? false}
        salesEnabled={author?.plan?.salesEnabled ?? false}
        previewMedia={previewMedia}
      />
    </div>
  );
}
