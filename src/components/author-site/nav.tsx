"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, BookOpen, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";

interface NavConfig {
  navShowAbout: boolean;
  navShowBooks: boolean;
  navShowSpecials: boolean;
  navShowFlipBooks: boolean;
  navShowBlog: boolean;
  navShowContact: boolean;
}

interface CustomPage {
  slug: string;
  title: string;
  navTitle: string | null;
}

interface NavProps {
  author: {
    id: string;
    displayName?: string | null;
    name: string;
    slug: string;
    accentColor: string;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    facebookUrl?: string | null;
    plan?: { flipBooksLimit: number } | null;
  };
  navConfig?: NavConfig;
  customPages?: CustomPage[];
}

function buildNavLinks(
  showFlipBooks: boolean,
  config?: NavConfig,
  customPages?: CustomPage[]
) {
  const links: { label: string; href: string }[] = [
    { label: "Home", href: "/" },
  ];

  if (!config || config.navShowBooks) {
    links.push({ label: "Books", href: "/books" });
  }
  if (!config || config.navShowSpecials) {
    links.push({ label: "Specials", href: "/specials" });
  }
  if (showFlipBooks && (!config || config.navShowFlipBooks)) {
    links.push({ label: "Flip Books", href: "/flip-books" });
  }

  // Blog — shown only when explicitly enabled
  if (config?.navShowBlog) {
    links.push({ label: "Blog", href: "/blog" });
  }

  // Custom pages inserted before About and Contact
  if (customPages?.length) {
    for (const page of customPages) {
      links.push({
        label: page.navTitle || page.title,
        href: `/${page.slug}`,
      });
    }
  }

  // About moved to second-to-last position (between Blog/custom pages and Contact)
  if (!config || config.navShowAbout) {
    links.push({ label: "About", href: "/about" });
  }

  if (!config || config.navShowContact) {
    links.push({ label: "Contact", href: "/contact" });
  }

  return links;
}

export function AuthorNav({ author, navConfig, customPages }: NavProps) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isOwner = !!(session?.user && (session.user as any).id === author.id);
  const showFlipBooks = (author.plan?.flipBooksLimit ?? 0) !== 0;
  const links = buildNavLinks(showFlipBooks, navConfig, customPages);

  const platformBase = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`;
  const dashboardUrl = `${platformBase}/admin/dashboard`;
  const signOutUrl   = `${platformBase}/login`;

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm"
      style={{ "--accent": author.accentColor } as React.CSSProperties}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Name */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="h-5 w-5" style={{ color: author.accentColor }} />
            <span className="font-semibold text-gray-900 text-sm group-hover:opacity-80 transition-opacity">
              {author.displayName || author.name}
            </span>
          </Link>
          {isOwner && (
            <a
              href={dashboardUrl}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-white px-2.5 py-1 rounded-md transition-colors"
              style={{ backgroundColor: author.accentColor }}
              title="Go to your admin dashboard"
            >
              <LayoutDashboard className="h-3 w-3" />
              Dashboard
            </a>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-[var(--accent)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social icons + logout */}
        <div className="hidden md:flex items-center gap-3">
          {author.linkedinUrl && (
            <a href={author.linkedinUrl} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-[var(--accent)] transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
          )}
          {author.youtubeUrl && (
            <a href={author.youtubeUrl} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-[var(--accent)] transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          )}
          {author.facebookUrl && (
            <a href={author.facebookUrl} target="_blank" rel="noopener noreferrer"
              className="text-gray-400 hover:text-[var(--accent)] transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
          )}
          <button
            onClick={() => signOut({ callbackUrl: signOutUrl })}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors ml-2 border-l border-gray-200 pl-3"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-gray-600 hover:text-[var(--accent)] transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-gray-700 hover:text-[var(--accent)] transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
            {isOwner && (
              <a
                href={dashboardUrl}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 text-sm font-medium py-1 border-t border-gray-100 mt-1 pt-3"
                style={{ color: author.accentColor }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </a>
            )}
            <button
              onClick={() => signOut({ callbackUrl: signOutUrl })}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors py-1"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
