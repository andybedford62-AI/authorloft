import Link from "next/link";
import { Linkedin, Facebook, Twitter, Instagram, Youtube, Globe, type LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/lib/social-links";
import { getDemoSiteUrl } from "@/lib/demo-site";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Product",
    links: [
      ["Features", "/features"],
      ["Bookstore", "/bookstore"],
      ["Pricing", "/pricing"],
      ["Cost Calculator", "/pricing/calculator"],
    ],
  },
  {
    title: "Learn",
    links: [
      ["Blog", "/blog"],
      ["News", "/news"],
      ["Guides", "/guides"],
      ["Resources", "/resources"],
      ["FAQ", "/faq"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Privacy", "/privacy"],
      ["Terms", "/terms"],
      ["GDPR", "/gdpr"],
      ["DMCA", "/dmca"],
    ],
  },
];

const COMPANY_LINKS: [string, string][] = [
  ["About", "/about"],
  ["Contact", "/contact"],
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
  const columns = COLUMNS.map((c) =>
    c.title === "Product" ? { ...c, links: [...c.links, ["Demo", demoSiteUrl] as [string, string]] } : c,
  );

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

        {/* Top row: logo + company links */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <Link
            href="/"
            className="inline-flex items-center min-h-11 text-lg font-bold italic text-vault-cream-ink hover:text-vault-gold-muted transition-colors font-vault-display"
          >
            AuthorLoft
          </Link>
          <div className="flex flex-wrap items-center">
            {COMPANY_LINKS.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="text-[13px] text-vault-cream-mute hover:text-vault-cream-ink transition-colors px-2.5 py-3 sm:py-0 font-vault-display"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Grouped link columns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wider text-vault-cream-ink mb-1 font-vault-display">{col.title}</p>
              <ul className="list-none m-0 p-0">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="inline-block text-[13px] text-vault-cream-mute hover:text-vault-cream-ink transition-colors py-3 sm:py-1 font-vault-display"
                      {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
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
                    className="text-vault-cream-mute opacity-60 hover:opacity-100 transition-opacity p-3.5 -m-3.5 sm:p-0 sm:m-0"
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
