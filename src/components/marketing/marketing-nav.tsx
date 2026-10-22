import Link from "next/link";
import { MarketingMobileMenu } from "@/components/marketing/marketing-mobile-menu";
import { MarketingNavDropdown } from "@/components/marketing/marketing-nav-dropdown";
import { MarketingNavSolutions } from "@/components/marketing/marketing-nav-solutions";
import { MarketingNavAuthLeft, MarketingNavAuthRight } from "@/components/marketing/marketing-nav-auth";

/** `pricingHref` lets a page point "Pricing" at its own plans (e.g. /for-musicians#plans). */
// No session or cookie reads here: that made every marketing page dynamic (~2 s). The signed-in
// bits (name, Dashboard button) render in the browser via MarketingNavAuthLeft/Right.
export function MarketingNav({ activePage, pricingHref = "/pricing" }: { activePage?: "pricing"; pricingHref?: string }) {
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

          <MarketingNavAuthLeft />
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
            href={pricingHref}
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
          <MarketingNavAuthRight />
          <MarketingMobileMenu pricingHref={pricingHref} />
        </div>
      </div>
    </header>
  );
}
