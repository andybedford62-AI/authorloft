import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { FlipBookForm } from "@/components/admin/flip-book-form";
import { getAdminAuthorId } from "@/lib/admin-auth";

type Props = { params: Promise<{ id: string }> };

export default async function EditFlipBookPage({ params }: Props) {
  const authorId = await getAdminAuthorId();
  const { id } = await params;

  const flipBook = await prisma.flipBook.findFirst({
    where: { id, authorId },
  });
  if (!flipBook) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link
          href="/admin/flip-books"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Flip Books
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate">{flipBook.title}</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Flip Book</h1>
        <p className="text-sm text-gray-500 mt-1">Update the details for this flip book.</p>
      </div>

      <FlipBookForm
        mode="edit"
        initial={{
          id:             flipBook.id,
          title:          flipBook.title,
          subtitle:       flipBook.subtitle,
          description:    flipBook.description,
          slug:           flipBook.slug,
          flipBookUrl:    flipBook.flipBookUrl,
          coverImageUrl:  flipBook.coverImageUrl,
          coverImageKey:  flipBook.coverImageKey,
          isActive:       flipBook.isActive,
          sortOrder:      flipBook.sortOrder,
        }}
      />
    </div>
  );
}
