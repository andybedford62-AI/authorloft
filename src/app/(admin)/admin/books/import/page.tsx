import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAdminAuthorId } from "@/lib/admin-auth";
import { getAuthorPlanLimits } from "@/lib/plan-limits";
import { BookImportWizard } from "@/components/admin/book-import-wizard";

export const dynamic = "force-dynamic";

export default async function BookImportPage() {
  const authorId = await getAdminAuthorId();

  const [genres, series, bookCount, author] = await Promise.all([
    prisma.genre.findMany({ where: { authorId }, select: { name: true } }),
    prisma.series.findMany({ where: { authorId }, select: { name: true } }),
    prisma.book.count({ where: { authorId } }),
    prisma.author.findUnique({ where: { id: authorId }, select: { plan: { select: { tier: true } } } }),
  ]);

  const limits   = await getAuthorPlanLimits(authorId);
  const maxBooks = limits.maxBooks;
  const remainingSlots = maxBooks === null ? null : Math.max(0, maxBooks - bookCount);
  const planTier = author?.plan?.tier ?? "FREE";

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link href="/admin/books" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Books
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Import Books</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bulk-add your catalog from a Goodreads export or a CSV file. Imported books are saved as drafts so you can
          review them before publishing.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <BookImportWizard
          existingGenres={genres.map((g) => g.name)}
          existingSeries={series.map((s) => s.name)}
          remainingSlots={remainingSlots}
          maxBooks={maxBooks}
          planTier={planTier}
        />
      </div>
    </div>
  );
}
