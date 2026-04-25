import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { BooksListClient } from "./books-list-client";
import { BookShelfPicker } from "./book-shelf-picker";

export default async function AdminBooksPage() {
  const authorId = await getAdminAuthorId();

  const [books, author] = await Promise.all([
    prisma.book.findMany({
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
    }),
    prisma.author.findUnique({
      where: { id: authorId },
      select: { booksLayout: true, plan: { select: { tier: true } } },
    }),
  ]);

  const booksLayout = author?.booksLayout ?? "list";
  const planTier    = author?.plan?.tier ?? "FREE";

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

      {/* Tabs + content */}
      <AdminBooksTabs
        books={books}
        booksLayout={booksLayout}
        planTier={planTier}
      />
    </div>
  );
}

// ── Inline tab wrapper (client component) ──────────────────────────────────────
import { AdminBooksTabsClient } from "./admin-books-tabs-client";

function AdminBooksTabs({
  books,
  booksLayout,
  planTier,
}: {
  books: any[];
  booksLayout: string;
  planTier: string;
}) {
  return (
    <AdminBooksTabsClient
      books={books}
      booksLayout={booksLayout}
      planTier={planTier}
    />
  );
}
