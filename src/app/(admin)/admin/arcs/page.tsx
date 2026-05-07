import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { ArcsListClient } from "./arcs-list-client";

export default async function ArcsPage() {
  const authorId = await getAdminAuthorId();

  const arcCopies = await prisma.arcCopy.findMany({
    where: { book: { authorId } },
    include: {
      book: { select: { id: true, title: true, coverImageUrl: true } },
      readers: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = arcCopies.map((arc) => ({
    id: arc.id,
    bookId: arc.book.id,
    bookTitle: arc.book.title,
    bookCover: arc.book.coverImageUrl,
    fileName: arc.fileName,
    isActive: arc.isActive,
    expiresAt: arc.expiresAt?.toISOString() ?? null,
    createdAt: arc.createdAt.toISOString(),
    counts: {
      total: arc.readers.length,
      invited: arc.readers.filter((r) => r.status === "INVITED").length,
      downloaded: arc.readers.filter((r) => r.status === "DOWNLOADED").length,
      reviewed: arc.readers.filter((r) => r.status === "REVIEWED").length,
      pending: arc.readers.filter((r) => r.status === "PENDING").length,
    },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ARCs</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your advance reader copies across all books.
        </p>
      </div>
      <ArcsListClient arcs={data} />
    </div>
  );
}
