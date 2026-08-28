import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { MarketingMobileMenu } from "@/components/marketing/marketing-mobile-menu";
import { MarketingNavDropdown } from "@/components/marketing/marketing-nav-dropdown";
import { MarketingNavSolutions } from "@/components/marketing/marketing-nav-solutions";
import { VaultButton } from "@/components/marketing/vault";


export async function MarketingNav({ activePage }: { activePage?: "pricing" }) {
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
    <header className="sticky top-0 z-50 bg-vault-surf border-b border-vault-ink/12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

        {/* Left: Logo + author name if logged in */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <svg viewBox="0 0 260 38" width={200} height={34} aria-label="AuthorLoft" role="img">
              <text x="0" y="30" style={{ fontFamily: 'var(--font-vault-display)', fontStyle: 'italic', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
                <tspan className="fill-vault-gold">Author</tspan><tspan className="fill-vault-ink">Loft</tspan>
              </text>
            </svg>
          </Link>

          {author && (
            <>
              <span className="hidden sm:block text-vault-ink/20 select-none">|</span>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm text-vault-mute">{displayName}</span>
                <VaultButton href="/admin/dashboard" variant="subtle" size="sm">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </VaultButton>
              </div>
            </>
          )}
        </div>

        {/* Middle nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/bookstore"
            className="text-sm font-medium text-vault-gold hover:text-vault-gold-light transition-colors"
          >
            Bookstore
          </Link>
          <MarketingNavSolutions />
          <MarketingNavDropdown />
          <Link
            href="/pricing"
            className={`text-sm transition-colors ${
              activePage === "pricing"
                ? "font-medium text-vault-gold"
                : "text-vault-mute hover:text-vault-ink"
            }`}
          >
            Pricing
          </Link>
        </nav>

        {/* Right CTA + mobile menu */}
        <div className="flex items-center gap-2">
          {author ? (
            /* Mobile: show Dashboard button on the right when logo area is too small */
            <VaultButton href="/admin/dashboard" variant="subtle" size="sm" className="flex sm:hidden">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </VaultButton>
          ) : (
            <>
              <VaultButton href="/login" variant="secondary" className="hidden sm:inline-flex">
                Sign in
              </VaultButton>
              <VaultButton href="/register" variant="primary" className="hidden sm:inline-flex">
                Start free →
              </VaultButton>
            </>
          )}
          <MarketingMobileMenu isAuthor={!!author} />
        </div>
      </div>
    </header>
  );
}
