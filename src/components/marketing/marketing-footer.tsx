import Link from "next/link";
import { Linkedin, Facebook, Twitter, Instagram, Youtube, Globe, type LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/lib/social-links";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";

const NAV_LINKS: [string, string][] = [
  ["Features", "/features"],
  ["Bookstore", "/bookstore"],
  ["Pricing", "/pricing"],
  ["Blog", "/blog"],
  ["News", "/news"],
  ["Guides", "/guides"],
  ["Resources", "/resources"],
  ["FAQ", "/faq"],
  ["Contact", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["GDPR", "/gdpr"],
  ["Demo", "https://demo.authorloft.com"],
];

const ICON_MAP: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

export async function MarketingFooter() {
  const socialLinks = await getSocialLinks();

  return (
    <footer className="bg-[#E8E5DD] border-t border-[#DCDBD3]" style={{ padding: "28px 24px" }}>
      <div className="max-w-6xl mx-auto">
        {/* Newsletter signup row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-[#DCDBD3]">
          <div>
            <p className="text-sm font-semibold text-[#1B2B47]" style={{ fontFamily: "Georgia, serif" }}>
              Get AuthorLoft News in your inbox
            </p>
            <p className="text-xs text-[#5C6E89]">Updates, new features, specials &amp; events.</p>
          </div>
          <NewsSubscribeForm source="footer" variant="compact" />
        </div>

        {/* Top row: logo + inline links */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <Link
            href="/"
            className="text-lg font-bold text-[#1B2B47] hover:text-[#C26A4A] transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            AuthorLoft
          </Link>
          <div className="flex flex-wrap items-center gap-y-1.5">
            {NAV_LINKS.map(([label, href], i) => (
              <span key={label} className="inline-flex items-center">
                <Link
                  href={href}
                  className="text-[13px] text-[#5C6E89] hover:text-[#1B2B47] transition-colors px-2.5"
                  style={{ fontFamily: "Georgia, serif" }}
                  {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {label}
                </Link>
                {i < NAV_LINKS.length - 1 && <span className="text-[#DCDBD3]">·</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom row: copyright + social icons */}
        <div className="border-t border-[#DCDBD3] pt-3.5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#5C6E89]/80 m-0" style={{ fontFamily: "Georgia, serif" }}>
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
                    className="text-[#5C6E89] opacity-60 hover:opacity-100 transition-opacity"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          )}

          <p className="text-xs text-[#5C6E89]/60 italic m-0" style={{ fontFamily: "Georgia, serif" }}>
            —— your name, your shelf ——
          </p>
        </div>
      </div>
    </footer>
  );
}
