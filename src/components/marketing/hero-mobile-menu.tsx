"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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

/** Dark-themed hamburger + dropdown for the homepage hero nav (below md). */
export function HeroMobileMenu({ isAuthor = false }: { isAuthor?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden" style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 40, height: 40, borderRadius: 10,
          background: "rgba(232,229,221,0.08)", border: "1px solid rgba(232,229,221,0.18)",
          color: "#E8E5DD", cursor: "pointer",
        }}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div
          style={{
            position: "absolute", right: 0, top: "calc(100% + 10px)", zIndex: 50, minWidth: 240,
            background: "#0F1A2D", border: "1px solid rgba(232,229,221,0.18)", borderRadius: 14,
            padding: 8, boxShadow: "0 20px 44px -12px rgba(0,0,0,0.6)",
            maxHeight: "70vh", overflowY: "auto",
          }}
        >
          {LINKS_TOP.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 14px", fontSize: 14, color: "#E8E5DD", textDecoration: "none", borderRadius: 8 }}
            >
              {label}
            </Link>
          ))}

          <p style={{ padding: "10px 14px 4px", margin: 0, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,229,221,0.45)" }}>Solutions</p>
          {SOLUTIONS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 14px 10px 24px", fontSize: 14, color: "#E8E5DD", textDecoration: "none", borderRadius: 8 }}
            >
              {label}
            </Link>
          ))}

          <p style={{ padding: "10px 14px 4px", margin: 0, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(232,229,221,0.45)" }}>Resources</p>
          {RESOURCES.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 14px 10px 24px", fontSize: 14, color: "#E8E5DD", textDecoration: "none", borderRadius: 8 }}
            >
              {label}
            </Link>
          ))}

          {LINKS_BOTTOM.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              style={{ display: "block", padding: "10px 14px", fontSize: 14, color: "#E8E5DD", textDecoration: "none", borderRadius: 8 }}
            >
              {label}
            </Link>
          ))}
          <div style={{ height: 1, background: "rgba(232,229,221,0.12)", margin: "8px 6px" }} />
          {isAuthor ? (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              style={{ display: "block", margin: 6, padding: "10px 14px", fontSize: 14, fontWeight: 600, textAlign: "center", background: "#B8893D", color: "#0F1A2D", borderRadius: 999, textDecoration: "none" }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                style={{ display: "block", margin: 6, padding: "10px 14px", fontSize: 14, fontWeight: 600, textAlign: "center", color: "#E8E5DD", background: "transparent", border: "1px solid rgba(232,229,221,0.35)", borderRadius: 999, textDecoration: "none" }}
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                style={{ display: "block", margin: 6, padding: "10px 14px", fontSize: 14, fontWeight: 600, textAlign: "center", background: "#B8893D", color: "#0F1A2D", borderRadius: 999, textDecoration: "none" }}
              >
                Start free →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
