"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

interface NavConfig {
  navShowAbout:     boolean;
  navShowBooks:     boolean;
  navShowSpecials:  boolean;
  navShowFlipBooks: boolean;
  navShowBlog:      boolean;
  navShowContact:   boolean;
}

interface CustomPage {
  slug:     string;
  title:    string;
  navTitle: string | null;
}

interface NavProps {
  author: {
    id:           string;
    displayName?: string | null;
    name:         string;
    slug:         string;
    accentColor:  string;
    linkedinUrl?: string | null;
    youtubeUrl?:  string | null;
    facebookUrl?: string | null;
    plan?:        { flipBooksLimit: number } | null;
  };
  navConfig?:   NavConfig;
  customPages?: CustomPage[];
}

// ── Nav link builder ─────────────────────────────────────────────────────────

function buildNavLinks(
  showFlipBooks: boolean,
  config?: NavConfig,
  customPages?: CustomPage[]
) {
  const links: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (!config || config.navShowBooks)    links.push({ label: "Books",      href: "/books" });
  if (!config || config.navShowSpecials) links.push({ label: "Specials",   href: "/specials" });
  if (showFlipBooks && (!config || config.navShowFlipBooks))
                                         links.push({ label: "Flip Books", href: "/flip-books" });
  if (config?.navShowBlog)               links.push({ label: "Blog",       href: "/blog" });

  for (const page of customPages ?? []) {
    links.push({ label: page.navTitle || page.title, href: `/${page.slug}` });
  }

  if (!config || config.navShowAbout)   links.push({ label: "About",   href: "/about" });
  if (!config || config.navShowContact) links.push({ label: "Contact", href: "/contact" });

  return links;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AuthorNav({ author, navConfig, customPages }: NavProps) {
  const [open, setOpen]     = useState(false);
  const { data: session }   = useSession();
  const pathname            = usePathname();
  const isOwner             = !!(session?.user && (session.user as any).id === author.id);
  const showFlipBooks       = (author.plan?.flipBooksLimit ?? 0) !== 0;
  const links               = buildNavLinks(showFlipBooks, navConfig, customPages);
  const accentColor         = author.accentColor;

  const platformBase  = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`;
  const dashboardUrl  = `${platformBase}/admin/dashboard`;
  const signOutUrl    = `${platformBase}/login`;

  // Determine active link — match pathname prefix (/ is exact only)
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 bg-[var(--navy)] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen
              className="h-5 w-5 flex-shrink-0 transition-opacity group-hover:opacity-80"
              style={{ color: accentColor }}
            />
            <span className="font-heading font-semibold text-white text-sm group-hover:opacity-80 transition-opacity">
              {author.displayName || author.name}
            </span>
          </Link>

          {/* Owner-only Dashboard badge */}
          {isOwner && (
            <a
              href={dashboardUrl}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors hover:opacity-90"
              style={{ color: accentColor, borderColor: accentColor + "60" }}
              title="Go to your admin dashboard"
            >
              <LayoutDashboard className="h-3 w-3" />
              Dashboard
            </a>
          )}
        </div>

        {/* ── Desktop Nav links ─────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-body font-medium transition-colors",
                isActive(link.href)
                  ? "text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              style={isActive(link.href) ? { color: accentColor } : {}}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── Desktop right side ────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          {/* Sign out — only shown to owner */}
          {isOwner && (
            <button
              onClick={() => signOut({ callbackUrl: signOutUrl })}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          )}

          {/* Get Started CTA — shown to non-owners */}
          {!isOwner && (
            <a
              href={platformBase}
              className="text-xs font-semibold px-4 py-2 rounded-md border transition-colors hover:opacity-90"
              style={{ color: accentColor, borderColor: accentColor }}
            >
              Get Started
            </a>
          )}
        </div>

        {/* ── Mobile hamburger ──────────────────────────────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t bg-[var(--navy)]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-body font-medium transition-colors",
                  isActive(link.href)
                    ? "text-white bg-white/10"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
                style={isActive(link.href) ? { color: accentColor } : {}}
              >
                {link.label}
              </Link>
            ))}

            {/* Divider */}
            <div className="border-t my-2" style={{ borderColor: "rgba(255,255,255,0.08)" }} />

            {isOwner && (
              <>
                <a
                  href={dashboardUrl}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{ color: accentColor }}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </a>
                <button
                  onClick={() => { setOpen(false); signOut({ callbackUrl: signOutUrl }); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-white/40 hover:text-white/80 transition-colors text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            )}

            {!isOwner && (
              <a
                href={platformBase}
                className="mt-1 text-center text-sm font-semibold px-4 py-2 rounded-md border transition-colors"
                style={{ color: accentColor, borderColor: accentColor }}
              >
                Get Started
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
