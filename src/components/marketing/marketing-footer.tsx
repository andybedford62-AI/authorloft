import Link from "next/link";
import { Linkedin, Facebook, Twitter, Instagram, Youtube, Globe, type LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/lib/social-links";
import { getDemoSiteUrl } from "@/lib/demo-site";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";

const NAV_LINKS: [string, string][] = [
  ["Features", "/features"],
  ["Bookstore", "/bookstore"],
  ["Pricing", "/pricing"],
  ["Blog", "/blog"],
  ["News", "/news"],
  ["Learn", "/guides"],
  ["Resources", "/resources"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["GDPR", "/gdpr"],
];

const ICON_MAP: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

export async function MarketingFooter() {
  const [socialLinks, demoSiteUrl] = await Promise.all([getSocialLinks(), getDemoSiteUrl()]);
  const navLinks: [string, string][] = [...NAV_LINKS, ["Demo", demoSiteUrl]];

  return (
    <footer className="bg-vault-cream border-t border-vault-cream-border" style={{ padding: "28px 24px" }}>
      <div className="max-w-6xl mx-auto">
        {/* Newsletter signup row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-vault-cream-border">
          <div>
            <p className="text-sm font-semibold text-vault-cream-ink font-vault-display">
              Get AuthorLoft News in your inbox
            </p>
            <p className="text-xs text-vault-cream-mute">Updates, new features, specials &amp; events.</p>
          </div>
          <NewsSubscribeForm source="footer" variant="compact" />
        </div>

        {/* Top row: logo + inline links */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <Link
            href="/"
            className="text-lg font-bold italic text-vault-cream-ink hover:text-vault-gold-muted transition-colors font-vault-display"
          >
            AuthorLoft
          </Link>
          <div className="flex flex-wrap items-center gap-y-1.5">
            {navLinks.map(([label, href], i) => (
              <span key={label} className="inline-flex items-center">
                <Link
                  href={href}
                  className="text-[13px] text-vault-cream-mute hover:text-vault-cream-ink transition-colors px-2.5 font-vault-display"
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {label}
                </Link>
                {i < navLinks.length - 1 && <span className="text-vault-cream-border">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row: copyright + social icons */}
        <div className="border-t border-vault-cream-border pt-3.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-vault-cream-mute/80 m-0 font-vault-display">
            © {new Date().getFullYear()} AuthorLoft. Built for authors, by someone who actually loves books.
          </p>

          {socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {socialLinks.map((link) => {
                const Icon = ICON_MAP[link.icon.toLowerCase()] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={link.platform}
                    aria-label={link.platform}
                    className="text-vault-cream-mute opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}

          <p className="text-xs text-vault-cream-mute/60 italic m-0 font-vault-display">
            —— your books · your readers · your business ——
          </p>
        </div>
      </div>
    </footer>
  );
}
