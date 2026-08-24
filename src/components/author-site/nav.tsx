"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, LogOut, LayoutDashboard, ShoppingCart, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cart-context";

// ── Types ────────────────────────────────────────────────────────────────────

interface NavConfig {
  navShowAbout:     boolean;
  navShowBooks:     boolean;
  navShowSpecials:  boolean;
  navShowFlipBooks: boolean;
  navShowBlog:      boolean;
  navShowContact:   boolean;
  navShowMediaKit:  boolean;
  navShowBookstore: boolean;
  navShowBundles:   boolean;
  navShowCourses:   boolean;
  navShowMusic:     boolean;
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
    logoUrl?:     string | null;
    linkedinUrl?: string | null;
    youtubeUrl?:  string | null;
    facebookUrl?: string | null;
    plan?:        { flipBooksLimit: number; musicEnabled?: boolean } | null;
    homeTemplate?: string | null;
  };
  navConfig?:   NavConfig;
  customPages?: CustomPage[];
}

// ── Template → nav variant ───────────────────────────────────────────────────
// Cinematic and Bold both open on a dark hero/strip, so the fixed dark
// --nav-bg reads as one continuous surface. Classic and Minimal (and any
// unknown/future template) run light page bodies almost everywhere below
// the hero, so the same dark bar reads as chrome bolted onto the wrong page
// once the reader scrolls past the top. Light-nav is the default/fallback.
function isDarkTemplate(homeTemplate?: string | null) {
  return homeTemplate === "cinematic" || homeTemplate === "bold";
}

function navTokens(dark: boolean) {
  return {
    header:       dark ? "bg-[var(--nav-bg)] shadow-lg" : "bg-white border-b border-gray-100 shadow-sm",
    logoText:     dark ? "text-white" : "text-gray-900",
    logoIcon:     dark ? "text-white/70" : "text-gray-400",
    dashboardBadge: dark
      ? "border-white/20 text-white/60 hover:text-white hover:border-white/40"
      : "border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400",
    linkActive:   dark ? "text-white" : "text-gray-900",
    linkInactive: dark
      ? "text-white/60 hover:text-white hover:bg-white/10"
      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
    signOut:      dark ? "text-white/40 hover:text-white/80" : "text-gray-400 hover:text-gray-700",
    cartIcon:     dark ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-900",
    hamburger:    dark ? "text-white/60 hover:text-white" : "text-gray-500 hover:text-gray-900",
    mobileBorder: dark ? "border-white/[0.08]" : "border-gray-100",
    mobilePanel:  dark ? "bg-[var(--nav-bg)]" : "bg-white",
    mobileLinkActive:   dark ? "text-white bg-white/10" : "text-gray-900 bg-gray-100",
    mobileLinkInactive: dark
      ? "text-white/60 hover:text-white hover:bg-white/10"
      : "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
  };
}

// ── Nav link builder ─────────────────────────────────────────────────────────

function buildNavLinks(
  showFlipBooks: boolean,
  showMusic: boolean,
  config?: NavConfig,
  customPages?: CustomPage[]
) {
  const links: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];

  // Bundles no longer gets its own nav link -- it's a tab on the Books page
  // (see books-bundles-tabs.tsx) now, still gated by navShowBundles there.
  // Courses stays fully independent of Books/Bundles so a course-only
  // creator who turns Books off entirely still has Courses reachable.
  if (!config || config.navShowBooks)    links.push({ label: "Books",      href: "/books" });
  if (config?.navShowCourses)           links.push({ label: "Courses",    href: "/courses" });
  if (showMusic && config?.navShowMusic) links.push({ label: "Music",      href: "/music" });
  if (!config || config.navShowSpecials) links.push({ label: "Specials",   href: "/specials" });
  if (showFlipBooks && (!config || config.navShowFlipBooks))
                                         links.push({ label: "Flip Books", href: "/flip-books" });
  if (config?.navShowBlog)               links.push({ label: "News",       href: "/blog" });

  for (const page of customPages ?? []) {
    links.push({ label: page.navTitle || page.title, href: `/${page.slug}` });
  }

  if (!config || config.navShowAbout)   links.push({ label: "About",     href: "/about" });
  if (!config || config.navShowContact) links.push({ label: "Contact",   href: "/contact" });
  // Media Kit no longer gets its own nav link either -- it's a tab on the
  // About page (see about-media-kit-tabs.tsx) now, still gated by
  // mediaKitEnabled + navShowMediaKit there.

  return links;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AuthorNav({ author, navConfig, customPages }: NavProps) {
  const [open, setOpen]     = useState(false);
  const { data: session }   = useSession();
  const pathname            = usePathname();
  const isOwner             = !!(session?.user && (session.user as any).id === author.id);
  const showFlipBooks       = (author.plan?.flipBooksLimit ?? 0) !== 0;
  const showMusic           = author.plan?.musicEnabled ?? false;
  const links               = buildNavLinks(showFlipBooks, showMusic, navConfig, customPages);
  const accentColor         = author.accentColor;
  const { itemCount, openCart } = useCart();
  const dark                = isDarkTemplate(author.homeTemplate);
  const t                   = navTokens(dark);

  const platformBase  = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`;
  const dashboardUrl  = `${platformBase}/admin/dashboard`;
  const signOutUrl    = `${platformBase}/login`;
  const bookstoreUrl  = `${platformBase}/bookstore`;

  // Determine active link — match pathname prefix (/ is exact only)
  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <header className={cn("sticky top-0 z-50", t.header)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            {author.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.logoUrl}
                alt={author.displayName || author.name}
                className="h-10 w-auto max-w-[160px] object-contain group-hover:opacity-80 transition-opacity"
              />
            ) : (
              <>
                <BookOpen className={cn("h-5 w-5 flex-shrink-0 transition-opacity group-hover:opacity-80", t.logoIcon)} />
                <span className={cn("font-heading font-semibold text-sm group-hover:opacity-80 transition-opacity", t.logoText)}>
                  {author.displayName || author.name}
                </span>
              </>
            )}
          </Link>

          {/* Owner-only Dashboard badge */}
          {isOwner && (
            <a
              href={dashboardUrl}
              className={cn("hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors", t.dashboardBadge)}
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
                "px-3 py-1.5 text-sm font-body font-medium transition-colors relative",
                isActive(link.href)
                  ? cn(t.linkActive, "after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-current")
                  : cn(t.linkInactive, "rounded-md")
              )}
            >
              {link.label}
            </Link>
          ))}
          {/* AuthorLoft Bookstore — cross-link to platform discovery catalog */}
          {(!navConfig || navConfig.navShowBookstore) && (
            <a
              href={bookstoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("px-3 py-1.5 text-sm font-body font-medium rounded-md transition-colors inline-flex items-center gap-1", t.linkInactive)}
              title="Discover more authors on the AuthorLoft Bookstore"
            >
              Bookstore
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          )}
        </nav>

        {/* ── Desktop right side — owner-only ───────────────────────────── */}
        {/* Login deliberately isn't here: primary nav is reader real estate,
            and readers have no account. The author's own way back in is the
            footer's "Author login" link. */}
        {isOwner && (
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => signOut({ callbackUrl: signOutUrl })}
              className={cn("flex items-center gap-1.5 text-xs transition-colors", t.signOut)}
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        )}

        {/* ── Cart icon (only visible when items in cart) ───────────────── */}
        {itemCount > 0 && (
          <button
            onClick={openCart}
            className={cn("relative p-2 transition-colors", t.cartIcon)}
            aria-label={`Open cart (${itemCount} item${itemCount === 1 ? "" : "s"})`}
          >
            <ShoppingCart className="h-5 w-5" />
            {/* Accent-coloured badge (not white) so it reads on both the dark
                and light nav variants without a separate light/dark swap. */}
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none"
              style={{ backgroundColor: accentColor }}>
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          </button>
        )}

        {/* ── Mobile hamburger ──────────────────────────────────────────── */}
        <button
          onClick={() => setOpen(!open)}
          className={cn("md:hidden p-2 transition-colors", t.hamburger)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* ── Mobile menu ───────────────────────────────────────────────────── */}
      {open && (
        <div className={cn("md:hidden border-t", t.mobilePanel, t.mobileBorder)}>
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-body font-medium transition-colors",
                  isActive(link.href) ? t.mobileLinkActive : t.mobileLinkInactive
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* AuthorLoft Bookstore — cross-link */}
            {(!navConfig || navConfig.navShowBookstore) && (
              <a
                href={bookstoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={cn("px-3 py-2 rounded-md text-sm font-body font-medium transition-colors inline-flex items-center gap-1.5", t.mobileLinkInactive)}
              >
                Bookstore
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            )}

            {/* Owner-only controls, behind a divider. Visitors see nothing
                here -- Login lives in the footer, not the reader's menu. */}
            {isOwner && (
              <>
                <div className={cn("border-t my-2", t.mobileBorder)} />
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
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left", t.signOut)}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
