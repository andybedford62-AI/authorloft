import Link from "next/link";
import { NewsletterModalButton } from "./newsletter-modal";
import { SiteQrCode } from "./site-qr-code";
import { getAuthorBaseUrl } from "@/lib/site-url";

// ── Types ────────────────────────────────────────────────────────────────────

interface NavConfig {
  navShowAbout:     boolean;
  navShowBooks:     boolean;
  navShowSpecials:  boolean;
  navShowFlipBooks: boolean;
  navShowBlog:      boolean;
  navShowContact:   boolean;
  navShowMediaKit:  boolean;
  navShowBundles?:  boolean;
  navShowCourses?:  boolean;
}

interface CustomPage {
  slug:     string;
  title:    string;
  navTitle: string | null;
}

interface FooterProps {
  author: {
    id:             string;
    slug:           string;
    customDomain?:  string | null;
    displayName?:   string | null;
    name:           string;
    linkedinUrl?:   string | null;
    youtubeUrl?:    string | null;
    facebookUrl?:   string | null;
    twitterUrl?:    string | null;
    instagramUrl?:  string | null;
    supportUrl?:    string | null;
    accentColor:    string;
    plan?:          { flipBooksLimit: number; tier?: string } | null;
  };
  navConfig?:    NavConfig;
  customPages?:  CustomPage[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildQuickLinks(
  config?: NavConfig,
  customPages?: CustomPage[],
  showFlipBooks?: boolean,
): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];

  // Bundles and Media Kit don't get their own quick links -- they're tabs
  // on Books and About respectively now (see books-bundles-tabs.tsx and
  // about-media-kit-tabs.tsx), matching the main nav (nav.tsx).
  if (!config || config.navShowBooks)    links.push({ label: "Books",      href: "/books" });
  if (config?.navShowCourses)           links.push({ label: "Courses",    href: "/courses" });
  if (!config || config.navShowSpecials) links.push({ label: "Specials",   href: "/specials" });
  if (showFlipBooks && (!config || config.navShowFlipBooks))
                                         links.push({ label: "Flip Books", href: "/flip-books" });
  if (config?.navShowBlog)               links.push({ label: "News",       href: "/blog" });

  for (const page of customPages ?? []) {
    links.push({ label: page.navTitle || page.title, href: `/${page.slug}` });
  }

  if (!config || config.navShowAbout)    links.push({ label: "About",     href: "/about" });
  if (!config || config.navShowContact)  links.push({ label: "Contact",   href: "/contact" });

  return links;
}

// ── Component ────────────────────────────────────────────────────────────────

export function AuthorFooter({ author, navConfig, customPages }: FooterProps) {
  const displayName  = author.displayName || author.name;
  const firstName    = displayName.split(" ")[0];
  const year         = new Date().getFullYear();
  const showFlipBooks = (author.plan?.flipBooksLimit ?? 0) !== 0;
  const showPoweredBy = (author.plan?.tier ?? "FREE") === "FREE";
  const quickLinks   = buildQuickLinks(navConfig, customPages, showFlipBooks);
  const siteUrl      = getAuthorBaseUrl(author);
  // Env-var based, matching nav.tsx -- a hardcoded authorloft.com here would
  // send an author signing in from staging to the production login instead.
  const platformBase = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`;

  const socialLinks = [
    { href: author.linkedinUrl,  label: "LinkedIn" },
    { href: author.youtubeUrl,   label: "YouTube" },
    { href: author.facebookUrl,  label: "Facebook" },
    { href: author.twitterUrl,   label: "X / Twitter" },
    { href: author.instagramUrl, label: "Instagram" },
    { href: author.supportUrl,  label: "Support" },
  ].filter((s) => !!s.href);

  return (
    <footer
      className="border-t border-gray-800 mt-16"
      style={{ "--accent": author.accentColor } as React.CSSProperties}
    >
      {/* ── Dark panel ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          {/* QR takes only the width it needs; the two text columns share the rest.
              The author's newsletter leads -- this footer belongs to them, so the
              first and loudest thing in it is their own call to action, not the
              platform's. AuthorLoft attribution lives in the bottom bar below. */}
          <div className="grid gap-8 sm:gap-12 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">

            {/* Col 1 — Stay Updated */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: author.accentColor }}>
                Stay Updated
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                New releases and news, straight from {firstName}.
              </p>
              <NewsletterModalButton
                authorId={author.id}
                authorName={displayName}
                accentColor={author.accentColor}
              />
            </div>

            {/* Col 2 — Quick Links */}
            {quickLinks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Quick Links
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-gray-400 text-sm hover:text-[var(--accent)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Col 3 — Scan to open on a phone */}
            <SiteQrCode url={siteUrl} authorName={displayName} />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

            {/* Copyright */}
            <p className="text-xs text-gray-500">
              © {year} {displayName}. All rights reserved.
            </p>

            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {socialLinks.map(({ href, label }) => (
                  <a
                    key={label}
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-[var(--accent)] transition-colors text-xs"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}

            {/* Legal + Powered by */}
            <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
              <Link href="/legal" className="text-xs text-gray-600 hover:text-[var(--accent)] transition-colors">
                Legal Notice
              </Link>
              <a
                href="https://www.authorloft.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-[var(--accent)] transition-colors"
              >
                Privacy
              </a>
              <a
                href="https://www.authorloft.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-600 hover:text-[var(--accent)] transition-colors"
              >
                Terms
              </a>
              {showPoweredBy && (
                <p className="text-xs text-gray-600">
                  Powered by{" "}
                  <a
                    href="https://www.authorloft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    AuthorLoft
                  </a>
                </p>
              )}
              {/* Relocated out of primary nav -- the author's own way back in,
                  without spending reader-facing nav space on it. */}
              <a
                href={`${platformBase}/login`}
                className="text-xs text-gray-600 hover:text-[var(--accent)] transition-colors"
              >
                Author login
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
