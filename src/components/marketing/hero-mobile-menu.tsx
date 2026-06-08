"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const LINKS: [string, string][] = [
  ["/bookstore", "Bookstore"],
  ["/features", "Features"],
  ["/blog", "Blog"],
  ["/news", "News"],
  ["#how-it-works", "How it works"],
  ["/pricing", "Pricing"],
  ["#genres", "For authors"],
];

/** Dark-themed hamburger + dropdown for the homepage hero nav (below md). */
export function HeroMobileMenu() {
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
            position: "absolute", right: 0, top: "calc(100% + 10px)", zIndex: 50, minWidth: 210,
            background: "#0F1A2D", border: "1px solid rgba(232,229,221,0.18)", borderRadius: 14,
            padding: 8, boxShadow: "0 20px 44px -12px rgba(0,0,0,0.6)",
          }}
        >
          {LINKS.map(([href, label]) => (
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
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            style={{ display: "block", padding: "10px 14px", fontSize: 14, color: "#E8E5DD", opacity: 0.85, textDecoration: "none" }}
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
        </div>
      )}
    </div>
  );
}
