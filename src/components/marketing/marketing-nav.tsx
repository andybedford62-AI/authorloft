import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarketingMobileMenu } from "@/components/marketing/marketing-mobile-menu";
import { MarketingNavDropdown } from "@/components/marketing/marketing-nav-dropdown";
import { MarketingNavSolutions } from "@/components/marketing/marketing-nav-solutions";


export async function MarketingNav({ activePage }: { activePage?: "features" | "pricing" | "faq" }) {
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
    <header className="sticky top-0 z-50 bg-[#1e2f4d] border-b border-[rgba(243,236,219,0.12)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Left: Logo + author name if logged in */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 260 38" width={200} height={34} aria-label="AuthorLoft" role="img">
              <text x="0" y="30" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
                <tspan fill="#d6a94a">Author</tspan><tspan fill="#f3ecdb">Loft</tspan>
              </text>
            </svg>
          </Link>

          {author && (
            <>
              <span className="hidden sm:block text-[rgba(243,236,219,0.2)] select-none">|</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-[#93a0bc]">{displayName}</span>
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#d6a94a] hover:text-[#e2bc6e] bg-[rgba(214,169,74,0.1)] hover:bg-[rgba(214,169,74,0.18)] px-3 py-1.5 rounded-[6px] transition-colors"
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
          <Link
            href="/bookstore"
            className="text-sm font-medium text-[#d6a94a] hover:text-[#e2bc6e] transition-colors"
          >
            Bookstore
          </Link>
          <Link
            href="/features"
            className={`text-sm transition-colors ${
              activePage === "features"
                ? "font-medium text-[#d6a94a]"
                : "text-[#93a0bc] hover:text-[#f3ecdb]"
            }`}
          >
            Features
          </Link>
          <MarketingNavSolutions />
          <Link
            href="/faq"
            className={`text-sm transition-colors ${
              activePage === "faq"
                ? "font-medium text-[#d6a94a]"
                : "text-[#93a0bc] hover:text-[#f3ecdb]"
            }`}
          >
            FAQ
          </Link>
          <MarketingNavDropdown />
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${
              activePage === "pricing"
                ? "font-medium text-[#d6a94a]"
                : "text-[#93a0bc] hover:text-[#f3ecdb]"
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right CTA + mobile menu */}
        <div className="flex items-center gap-2">
          {author ? (
            /* Mobile: show Dashboard button on the right when logo area is too small */
            <Link
              href="/admin/dashboard"
              className="flex sm:hidden items-center gap-1.5 text-sm font-medium text-[#d6a94a] bg-[rgba(214,169,74,0.1)] hover:bg-[rgba(214,169,74,0.18)] px-3 py-1.5 rounded-[6px] transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center border border-[rgba(243,236,219,0.25)] text-[#f3ecdb] text-sm font-semibold px-4 py-2 rounded-[6px] hover:border-[rgba(243,236,219,0.4)] hover:bg-[rgba(243,236,219,0.05)] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="hidden sm:inline-flex bg-[#d6a94a] text-[#16233d] text-sm font-semibold px-4 py-2 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
              >
                Start free →
              </Link>
            </>
          )}
          <MarketingMobileMenu isAuthor={!!author} />
        </div>
      </div>
    </header>
  );
}
