import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BookForm } from "@/components/admin/book-form";
import { RetailerLinks } from "@/components/admin/retailer-links";
import { DirectSalesItems } from "@/components/admin/direct-sales-items";
import { BookAudioTracks } from "@/components/admin/book-audio-tracks";

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;
  const { id } = await params;

  const [book, seriesList, genreTree, author] = await Promise.all([
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
      select: { plan: { select: { flipBooksLimit: true, audioEnabled: true } } },
    }),
  ]);

  if (!book) notFound();

  // Flatten genre tree into a labeled list for the form
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
    priceCents: book.priceCents,   // kept for legacy order compatibility
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
      ? book.releaseDate.toISOString().split("T")[0]   // YYYY-MM-DD
      : null,
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Book</h1>
        <p className="text-sm text-gray-500 mt-1">{book.title}</p>
      </div>
      <BookForm
        mode="edit"
        book={bookData}
        series={series}
        genres={genres}
      />
      {/* Direct sale items — per-format pricing for eBook, Flip Book, Print */}
      <DirectSalesItems bookId={book.id} />
      {/* Audio previews — narrations, excerpts, author notes */}
      <BookAudioTracks bookId={book.id} audioEnabled={author?.plan?.audioEnabled ?? false} />
      {/* Retailer links are managed separately so changes take effect immediately */}
      <RetailerLinks bookId={book.id} />
    </div>
  );
}
