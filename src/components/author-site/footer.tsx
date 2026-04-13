import Link from "next/link";
import { NewsletterForm } from "./newsletter-form";

interface FooterProps {
  author: {
    id: string;
    slug: string;
    displayName?: string | null;
    name: string;
    linkedinUrl?: string | null;
    youtubeUrl?: string | null;
    facebookUrl?: string | null;
    twitterUrl?: string | null;
    instagramUrl?: string | null;
    accentColor: string;
  };
}

export function AuthorFooter({ author }: FooterProps) {
  const displayName = author.displayName || author.name;
  const year = new Date().getFullYear();

  const socialLinks = [
    { href: author.linkedinUrl,  label: "LinkedIn" },
    { href: author.youtubeUrl,   label: "YouTube" },
    { href: author.facebookUrl,  label: "Facebook" },
    { href: author.twitterUrl,   label: "X / Twitter" },
    { href: author.instagramUrl, label: "Instagram" },
  ].filter((s) => !!s.href);

  return (
    <footer
      className="border-t border-gray-200 bg-white mt-16"
      style={{ "--accent": author.accentColor } as React.CSSProperties}
    >
      {/* Newsletter strip */}
      <div style={{ backgroundColor: author.accentColor }} className="py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-white font-bold text-lg mb-1">
            Never miss a new release
          </h3>
          <p className="text-white/70 text-sm mb-6">
            Join the mailing list for updates, exclusives, and more.
          </p>
          <div className="max-w-md mx-auto">
            <NewsletterForm
              authorId={author.id}
              authorSlug={author.slug}
              accentColor={author.accentColor}
              compact
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-gray-500">
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
                  className="text-gray-400 hover:text-[var(--accent)] transition-colors text-sm"
                >
                  {label}
                </a>
              ))}
            </div>
          )}

          {/* Legal + Powered by */}
          <div className="flex items-center gap-4">
            <Link
              href="/legal"
              className="text-xs text-gray-400 hover:text-[var(--accent)] transition-colors"
            >
              Legal Notice
            </Link>
            <p className="text-xs text-gray-400">
              Powered by{" "}
              <a
                href="https://authorloft.com"
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
    </footer>
  );
}
