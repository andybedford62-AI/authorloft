import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Plus, BookMarked, ExternalLink, Pencil, Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { canAddFlipBook } from "@/lib/plan-limits";
import { FlipBookToggle } from "@/components/admin/flip-book-toggle";

export default async function AdminFlipBooksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;

  const [flipBooks, planInfo] = await Promise.all([
    prisma.flipBook.findMany({
      where: { authorId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    canAddFlipBook(authorId),
  ]);

  const { limit, current } = planInfo as { limit: number; current: number };
  const isUnlimited = limit === -1;
  const planBlocked = limit === 0;
  const atLimit = !isUnlimited && !planBlocked && current >= limit;

  return (
    <div className="space-y-6 max-w-5xl">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Flip Books</h1>
          <p className="text-sm text-gray-500 mt-1">
            {planBlocked ? (
              "Premium plan required"
            ) : (
              <>
                {flipBooks.length} flip book{flipBooks.length !== 1 ? "s" : ""}
                <span className="ml-2 text-gray-400">
                  ({isUnlimited ? "unlimited on your plan" : `${current} of ${limit} on your plan`})
                </span>
              </>
            )}
          </p>
        </div>

        {planBlocked ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg text-sm text-purple-700 font-medium">
            <Lock className="h-4 w-4 flex-shrink-0" />
            Premium plan required
          </div>
        ) : atLimit ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <Lock className="h-4 w-4 flex-shrink-0" />
            Limit reached — upgrade for unlimited
          </div>
        ) : (
          <Link
            href="/admin/flip-books/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Flip Book
          </Link>
        )}
      </div>

      {/* Plan locked banner */}
      {planBlocked && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 flex gap-4 items-start">
          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Lock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-purple-900">Flip Books — Premium feature</p>
            <p className="text-sm text-purple-700 mt-1">
              Flip Books are available on the Premium plan. Upgrade to add interactive flip book
              reading experiences to your author site.
            </p>
            <Link
              href="/admin/settings"
              className="inline-block mt-3 text-sm font-medium text-purple-800 underline hover:text-purple-900 cursor-pointer"
            >
              View plan options →
            </Link>
          </div>
        </div>
      )}

      {/* Empty state */}
      {flipBooks.length === 0 && !planBlocked && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <BookMarked className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500">No flip books yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Add your first flip book to embed interactive reading experiences on your site.
          </p>
          <Link
            href="/admin/flip-books/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Your First Flip Book
          </Link>
        </div>
      )}

      {/* Flip books grid */}
      {flipBooks.length > 0 && !planBlocked && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {flipBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:border-gray-300 transition-colors"
            >
              {/* Cover — clickable to edit */}
              <Link href={`/admin/flip-books/${book.id}/edit`} className="block cursor-pointer">
                <div className="aspect-[2/3] bg-gray-100 relative overflow-hidden">
                  {book.coverImageUrl ? (
                    <Image
                      src={book.coverImageUrl}
                      alt={book.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookMarked className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-4 flex flex-col gap-3 flex-1">
                <Link href={`/admin/flip-books/${book.id}/edit`} className="cursor-pointer">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                    {book.title}
                  </h3>
                  {book.subtitle && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{book.subtitle}</p>
                  )}
                </Link>

                {book.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 flex-1">{book.description}</p>
                )}

                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100">
                  {/* Active/Hidden toggle */}
                  <FlipBookToggle id={book.id} initialActive={book.isActive} />

                  <div className="flex items-center gap-2 ml-auto">
                    <Link
                      href={`/admin/flip-books/${book.id}/edit`}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                    {book.flipBookUrl && (
                      <a
                        href={book.flipBookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Preview
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
