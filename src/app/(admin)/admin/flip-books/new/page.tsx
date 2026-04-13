import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { canAddFlipBook } from "@/lib/plan-limits";
import { FlipBookForm } from "@/components/admin/flip-book-form";

export default async function NewFlipBookPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const authorId = (session.user as any).id as string;
  const planCheck = await canAddFlipBook(authorId);

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
        <span className="text-sm text-gray-900 font-medium">New Flip Book</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Flip Book</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add an interactive flip book to your author site.
        </p>
      </div>

      {!planCheck.allowed ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex gap-3">
            <Lock className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">Plan limit reached</p>
              <p className="text-sm text-amber-700 mt-1">{planCheck.reason}</p>
              <Link
                href="/admin/flip-books"
                className="inline-block mt-3 text-sm text-amber-800 underline hover:text-amber-900"
              >
                ← Back to flip books
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <FlipBookForm mode="create" />
      )}
    </div>
  );
}
