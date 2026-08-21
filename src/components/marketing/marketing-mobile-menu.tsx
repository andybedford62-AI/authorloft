"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, LayoutDashboard } from "lucide-react";

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
        className="p-2 -mr-1 rounded-md text-[#93a0bc] hover:text-[#f3ecdb] hover:bg-[rgba(243,236,219,0.06)] transition-colors"
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
          <div className="absolute left-0 right-0 top-full z-50 bg-[#1e2f4d] border-b border-[rgba(243,236,219,0.12)] shadow-md">
            <nav className="flex flex-col px-4 sm:px-6 py-2">
              {LINKS_TOP.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm text-[#f3ecdb] hover:text-[#d6a94a] border-b border-[rgba(243,236,219,0.08)] transition-colors"
                >
                  {label}
                </Link>
              ))}

              {/* Solutions group */}
              <p className="pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-[#93a0bc]">Solutions</p>
              {SOLUTIONS.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 pl-3 text-sm text-[#f3ecdb] hover:text-[#d6a94a] border-b border-[rgba(243,236,219,0.08)] transition-colors"
                >
                  {label}
                </Link>
              ))}

              {/* Resources group */}
              <p className="pt-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-[#93a0bc]">Resources</p>
              {RESOURCES.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 pl-3 text-sm text-[#f3ecdb] hover:text-[#d6a94a] border-b border-[rgba(243,236,219,0.08)] transition-colors"
                >
                  {label}
                </Link>
              ))}

              {LINKS_BOTTOM.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="py-2.5 text-sm text-[#f3ecdb] hover:text-[#d6a94a] border-b border-[rgba(243,236,219,0.08)] last:border-0 transition-colors"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-3 mb-2 flex flex-col gap-2">
                {isAuthor ? (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center gap-1.5 bg-[rgba(214,169,74,0.1)] text-[#d6a94a] text-sm font-medium px-4 py-2.5 rounded-[6px]"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpen(false)}
                      className="border border-[rgba(243,236,219,0.25)] text-[#f3ecdb] text-sm font-semibold px-4 py-2.5 rounded-[6px] text-center hover:border-[rgba(243,236,219,0.4)] hover:bg-[rgba(243,236,219,0.05)] transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpen(false)}
                      className="bg-[#d6a94a] text-[#16233d] text-sm font-semibold px-4 py-2.5 rounded-[6px] text-center hover:bg-[#e2bc6e] transition-colors"
                    >
                      Start free →
                    </Link>
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
