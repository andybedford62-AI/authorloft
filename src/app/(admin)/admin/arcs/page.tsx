import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import Link from "next/link";

export default async function ArcsPage() {
  const authorId = await getAdminAuthorId();
  if (!authorId) redirect("/login");

  const author = await prisma.author.findUnique({
    where: { id: authorId },
    select: { plan: { select: { tier: true } } },
  });

  const tier = author?.plan?.tier ?? "FREE";
  if (tier === "FREE") redirect("/admin/settings#billing");

  // Get all books with their ARCs
  const books = await prisma.book.findMany({
    where: { authorId },
    select: {
      id: true,
      title: true,
      coverImageUrl: true,
      arcCopies: {
        select: {
          id: true,
          isActive: true,
          expiresAt: true,
          files: { select: { id: true, format: true } },
          readers: { select: { status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const booksWithArcs = books
    .map((book) => {
      const arc = book.arcCopies[0]; // One ARC per book
      if (!arc) return null;

      return {
        bookId: book.id,
        bookTitle: book.title,
        bookCover: book.coverImageUrl,
        arcId: arc.id,
        isActive: arc.isActive,
        expiresAt: arc.expiresAt?.toISOString() ?? null,
        fileCount: arc.files.length,
        readerCounts: {
          total: arc.readers.length,
          invited: arc.readers.filter((r) => r.status === "INVITED").length,
          downloaded: arc.readers.filter((r) => r.status === "DOWNLOADED").length,
          reviewed: arc.readers.filter((r) => r.status === "REVIEWED").length,
        },
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advance Reader Copies</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage ARCs and invite readers to pre-release copies of your books.
        </p>
      </div>

      {booksWithArcs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No ARCs created yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Edit a book to create an ARC and start inviting readers.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {booksWithArcs.map((arc) => (
            <Link
              key={arc.arcId}
              href={`/admin/books/${arc.bookId}/edit#arcs`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex gap-4">
                {arc.bookCover && (
                  <img
                    src={arc.bookCover}
                    alt={arc.bookTitle}
                    className="w-16 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{arc.bookTitle}</h3>
                  <div className="text-sm text-gray-500 mt-2 space-y-1">
                    <p>📁 {arc.fileCount} format{arc.fileCount !== 1 ? "s" : ""}</p>
                    <p>
                      👥 {arc.readerCounts.total} reader{arc.readerCounts.total !== 1 ? "s" : ""} (
                      {arc.readerCounts.invited} invited, {arc.readerCounts.downloaded} downloaded,{" "}
                      {arc.readerCounts.reviewed} reviewed)
                    </p>
                    {arc.expiresAt && <p>📅 Expires: {new Date(arc.expiresAt).toLocaleDateString()}</p>}
                  </div>
                </div>
                <div className="text-right">
                  {arc.isActive ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Active
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
