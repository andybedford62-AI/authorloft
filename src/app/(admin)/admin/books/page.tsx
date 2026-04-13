import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { BooksListClient } from "./books-list-client";

export default async function AdminBooksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const books = await prisma.book.findMany({
    where: { authorId },
    select: {
      id: true,
      title: true,
      subtitle: true,
      coverImageUrl: true,
      isFeatured: true,
      isPublished: true,
      caption: true,
      series: { select: { name: true } },
      _count: { select: { directSaleItems: true, retailerLinks: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Books</h1>
          <p className="text-sm text-gray-500 mt-1">
            {books.length} title{books.length !== 1 ? "s" : ""} in your catalog
          </p>
        </div>
        <Link href="/admin/books/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Book
          </Button>
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <BookOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No books yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Add your first book to get started.</p>
          <Link href="/admin/books/new">
            <Button>Add Your First Book</Button>
          </Link>
        </div>
      ) : (
        <BooksListClient initialBooks={books} />
      )}
    </div>
  );
}
