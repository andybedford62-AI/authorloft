import Link from "next/link";
import { BookOpen, LayoutDashboard } from "lucide-react";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function MarketingNav({ activePage }: { activePage?: "features" | "pricing" }) {
  // Reading cookies opts this component into dynamic rendering so the session
  // is never served from a stale static cache.
  await cookies();

  const session = await getServerSession(authOptions);

  // Check if the logged-in user is a registered author (any plan)
  let author: { name: string | null; displayName: string | null } | null = null;
  if (session?.user) {
    const userId = (session.user as any).id as string;
    if (userId) {
      author = await prisma.author.findUnique({
        where: { id: userId },
        select: { name: true, displayName: true },
      }).catch(() => null);
    }
  }

  const displayName = author?.displayName || author?.name || session?.user?.name || "My Account";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Left: Logo + author name if logged in */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-lg text-gray-900">
              Author<span className="text-blue-600">Loft</span>
            </span>
          </Link>

          {author && (
            <>
              <span className="hidden sm:block text-gray-200 select-none">|</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-gray-500">{displayName}</span>
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Middle nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/#features"
            className={`text-sm transition-colors ${
              activePage === "features"
                ? "font-medium text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Features
          </a>
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${
              activePage === "pricing"
                ? "font-medium text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pricing
          </Link>
          {!author && (
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
          )}
        </nav>

        {/* Right CTA */}
        {author ? (
          /* Mobile: show Dashboard button on the right when logo area is too small */
          <Link
            href="/admin"
            className="flex sm:hidden items-center gap-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        ) : (
          <Link
            href="/register"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started Free
          </Link>
        )}
      </div>
    </header>
  );
}
