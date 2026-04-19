import Link from "next/link";
import { BookOpen } from "lucide-react";
import { NewsletterModalButton } from "./newsletter-modal";

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

interface FooterProps {
  author: {
    id:             string;
    slug:           string;
    displayName?:   string | null;
    name:           string;
    linkedinUrl?:   string | null;
    youtubeUrl?:    string | null;
    facebookUrl?:   string | null;
    twitterUrl?:    string | null;
    instagramUrl?:  string | null;
    accentColor:    string;
    plan?:          { flipBooksLimit: number } | null;
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

export function AuthorFooter({ author, navConfig, customPages }: FooterProps) {
  const displayName  = author.displayName || author.name;
  const year         = new Date().getFullYear();
  const showFlipBooks = (author.plan?.flipBooksLimit ?? 0) !== 0;
  const quickLinks   = buildQuickLinks(navConfig, customPages, showFlipBooks);

  const socialLinks = [
    { href: author.linkedinUrl,  label: "LinkedIn" },
    { href: author.youtubeUrl,   label: "YouTube" },
    { href: author.facebookUrl,  label: "Facebook" },
    { href: author.twitterUrl,   label: "X / Twitter" },
    { href: author.instagramUrl, label: "Instagram" },
  ].filter((s) => !!s.href);

  return (
    <footer
      className="border-t border-gray-800 mt-16"
      style={{ "--accent": author.accentColor } as React.CSSProperties}
    >
      {/* ── Dark panel ─────────────────────────────────────────────────────── */}
      <div className="bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">

            {/* Col 1 — Brand */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" style={{ color: author.accentColor }} />
                <span className="font-bold text-white text-sm">{displayName}</span>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed">
                A platform for authors to establish their web presence, showcase their work,
                and connect with readers worldwide.
              </p>
            </div>

            {/* Col 2 — Stay Updated */}
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: author.accentColor }}>
                Stay Updated
              </p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Subscribe to get news and updates from the author.
              </p>
              <NewsletterModalButton
                authorId={author.id}
                accentColor={author.accentColor}
              />
            </div>

            {/* Col 3 — Quick Links */}
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
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
