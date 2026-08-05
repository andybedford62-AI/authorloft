import Link from "next/link";
import { Plus, BookOpen, ArrowRight, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { BooksListClient } from "./books-list-client";
import { BookShelfPicker } from "./book-shelf-picker";
import { getBookCompletionSummary } from "@/lib/book-completeness";

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
        description: true,
        shortDescription: true,
        isFeatured: true,
        isPublished: true,
        directSalesEnabled: true,
        listInBookstore: true,
        isPreOrder: true,
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

  const incompleteBooks = books.filter((b) => !getBookCompletionSummary({
    coverImageUrl:        b.coverImageUrl,
    description:          b.description,
    shortDescription:     b.shortDescription,
    retailerLinksCount:   b._count.retailerLinks,
    directSaleItemsCount: b._count.directSaleItems,
  }).isComplete);

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
        <div className="flex items-center gap-2">
          <Link href="/admin/books/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </Link>
          <Link href="/admin/books/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Book
            </Button>
          </Link>
        </div>
      </div>

      {/* Finish-your-catalog nudge — visible whenever a book is missing a cover,
          description, or a way for a reader to buy/download it. Disappears on its own
          once every book clears those, so it doesn't need a dismiss control. */}
      {incompleteBooks.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>{incompleteBooks.length} book{incompleteBooks.length !== 1 ? "s" : ""}</strong> still{" "}
            {incompleteBooks.length !== 1 ? "need" : "needs"} a cover, description, or buy link before it looks
            complete to a reader — look for the <span className="font-medium">"Needs…"</span> note under the title below.
          </p>
        </div>
      )}

      {/* Empty state — first time author */}
      {books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 px-8 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 mb-5">
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Add your first book</h2>
          <p className="text-sm text-gray-500 max-w-sm mb-8">
            Your catalog is empty. Add a book to bring your author site to life — it only takes a few minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <Link href="/admin/books/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Add Your First Book
              </Button>
            </Link>
            <Link href="/admin/books/import">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" /> Import from CSV
              </Button>
            </Link>
            <Link href="/admin/branding" className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Set up your profile first <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <AdminBooksTabs
          books={books}
          booksLayout={booksLayout}
          planTier={planTier}
        />
      )}
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
