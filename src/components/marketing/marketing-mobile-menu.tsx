"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { VaultButton } from "@/components/marketing/vault";

const LINKS_TOP: [string, string][] = [
  ["/bookstore", "Bookstore"],
  ["/features", "Features"],
  ["/faq", "FAQ"],
];

const SOLUTIONS: [string, string][] = [
  ["/author-website-builder", "Author Website Builder"],
  ["/sell-books-directly", "Sell Books Directly"],
  ["/book-marketing-platform", "Book Marketing"],
  ["/author-newsletter-platform", "Newsletter Platform"],
  ["/arc-management", "ARC Management"],
  ["/author-media-kit", "Author Media Kit"],
  ["/ai-tools-for-authors", "AI Tools for Authors"],
  ["/indie-author-bookstore", "Indie Author Bookstore"],
  ["/author-courses", "Sell Online Courses"],
  ["/book-pre-orders", "Book Pre-Orders"],
  ["/author-affiliate-program", "Affiliate Program"],
  ["/reader-analytics-for-authors", "Reader Analytics"],
];

const RESOURCES: [string, string][] = [
  ["/guides", "Learn"],
  ["/blog", "Blog"],
  ["/news", "News"],
  ["/resources", "Tools & Communities"],
];

const LINKS_BOTTOM: [string, string][] = [
  ["/pricing", "Pricing"],
];

/**
 * Hamburger + dropdown for the shared MarketingNav on screens below md.
 * Receives auth state from the (server) MarketingNav so the CTA matches.
 */
export function MarketingMobileMenu({ isAuthor }: { isAuthor: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="p-2 -mr-1 rounded-md text-vault-mute hover:text-vault-ink hover:bg-vault-ink/6 transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <>
          {/* Click-away layer (below the dropdown, under the header) */}
          <button
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-x-0 bottom-0 top-20 z-40 cursor-default bg-black/10"
          />
          <div className="absolute left-0 right-0 top-full z-50 bg-vault-surf border-b border-vault-ink/12 shadow-md">
            <nav className="flex flex-col px-4 sm:px-6 py-2">
              {LINKS_TOP.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm text-vault-ink hover:text-vault-gold border-b border-vault-ink/8 transition-colors"
                >
                  {label}
                </Link>
              ))}

              {/* Solutions group */}
              <p className="pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-vault-mute">Solutions</p>
              {SOLUTIONS.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 pl-3 text-sm text-vault-ink hover:text-vault-gold border-b border-vault-ink/8 transition-colors"
                >
                  {label}
                </Link>
              ))}

              {/* Resources group */}
              <p className="pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-vault-mute">Resources</p>
              {RESOURCES.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 pl-3 text-sm text-vault-ink hover:text-vault-gold border-b border-vault-ink/8 transition-colors"
                >
                  {label}
                </Link>
              ))}

              {LINKS_BOTTOM.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm text-vault-ink hover:text-vault-gold border-b border-vault-ink/8 last:border-0 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-3 mb-2 flex flex-col gap-2">
                {isAuthor ? (
                  <VaultButton href="/admin/dashboard" variant="subtle" onClick={() => setOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </VaultButton>
                ) : (
                  <>
                    <VaultButton
                      href="/login"
                      variant="secondary"
                      className="text-center"
                      onClick={() => setOpen(false)}
                    >
                      Sign in
                    </VaultButton>
                    <VaultButton
                      href="/register"
                      variant="primary"
                      className="text-center"
                      onClick={() => setOpen(false)}
                    >
                      Start free →
                    </VaultButton>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
