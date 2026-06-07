import { Linkedin, Facebook, Twitter, Instagram, Youtube, Globe, type LucideIcon } from "lucide-react";
import { getSocialLinks } from "@/lib/social-links";

const ICON_MAP: Record<string, LucideIcon> = {
  linkedin: Linkedin,
  facebook: Facebook,
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
};

/**
 * Company social links rendered in the bookstore hero (light-on-dark style).
 * Pulls dynamically from the Super Admin social links feature — any platform
 * added there appears here automatically. Renders nothing if none are set.
 */
export async function BookstoreHeroSocial() {
  const links = await getSocialLinks();
  if (links.length === 0) return null;

  const btn =
    "inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors backdrop-blur-sm";

  return (
    <div className="flex items-center justify-center gap-2 mt-7 flex-wrap">
      <span className="text-xs text-[#F5ECDD]/70 mr-1">Follow us:</span>
      {links.map((link) => {
        const Icon = ICON_MAP[link.icon.toLowerCase()] || Globe;
        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.platform}
            title={link.platform}
            className={btn}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
