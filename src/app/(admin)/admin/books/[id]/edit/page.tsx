import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { BookEditTabsClient } from "@/components/admin/book-edit-tabs-client";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { AlertCircle } from "lucide-react";
import { getBookCompletionSummary } from "@/lib/book-completeness";

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
      include: {
        genres: { select: { genreId: true } },
        _count:  { select: { retailerLinks: true, directSaleItems: true } },
      },
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
    autoSendLaunchEmail: book.autoSendLaunchEmail,
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

  const completion = getBookCompletionSummary({
    coverImageUrl:        book.coverImageUrl,
    description:          book.description,
    shortDescription:     book.shortDescription,
    retailerLinksCount:   book._count.retailerLinks,
    directSaleItemsCount: book._count.directSaleItems,
    isPreOrder:           book.isPreOrder,
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="sticky top-0 z-20 bg-white border border-gray-200 rounded-xl shadow-sm px-5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Editing book</p>
        <h1
          className="text-2xl font-extrabold leading-tight"
          style={{ color: "var(--accent)" }}
        >
          {book.title}
        </h1>
      </div>

      {/* Setup guidance — persists until the book actually has a cover, description, and a
          buy link / direct-sale file, not just on the first visit right after creation. */}
      {!completion.isComplete && (
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-blue-900 text-sm">
                {isNew === "1" ? "Book created — here's what to do next" : "Finish setting up this book"}
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-blue-800">
                {completion.steps.map((step) => (
                  <li key={step.key} className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      step.done ? "bg-green-500 border-green-500" : "border-blue-300"
                    }`}>
                      {step.done && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className={step.done ? "line-through text-blue-400" : ""}>{step.label}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-blue-600">
                Use <strong>Save Changes</strong> on the Details and Organisation tabs; the other tabs save as you go. Skip any step and come back later.
              </p>
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
        planTier={(author?.plan?.tier ?? "FREE") as "FREE" | "STANDARD" | "PREMIUM"}
        bookstoreEnabled={(author?.plan?.tier ?? "FREE") !== "FREE"}
        preOrdersEnabled={author?.plan?.preOrdersEnabled ?? false}
        arcEnabled={(author?.plan?.tier ?? "FREE") !== "FREE"}
        stripeConnectOnboarded={author?.stripeConnectOnboarded ?? false}
        previewMedia={previewMedia}
        retailerLinksCount={book._count.retailerLinks}
        directSaleItemsCount={book._count.directSaleItems}
        publicBaseUrl={author ? getAuthorBaseUrl(author) : ""}
      />
    </div>
  );
}
