"use client";

import { useState } from "react";
import Link from "next/link";
import { Linkedin, Youtube, Facebook, Twitter, Instagram, Mail, type LucideIcon } from "lucide-react";

type SocialItem = {
  href: string;
  icon: string;
  label: string;
};

const ICON_MAP: Record<string, LucideIcon> = {
  linkedin:  Linkedin,
  youtube:   Youtube,
  facebook:  Facebook,
  twitter:   Twitter,
  instagram: Instagram,
  mail:      Mail,
};

function SocialButton({ href, icon, label, accentColor }: SocialItem & { accentColor: string }) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[icon] ?? Mail;

  const buttonStyle = {
    backgroundColor: hovered ? accentColor : "transparent",
    borderColor:     hovered ? accentColor : "#e5e7eb",
    color:           hovered ? "#ffffff"   : "#9ca3af",
  };

  const sharedProps = {
    title: label,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    className: "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-200",
    style: buttonStyle,
  };

  // Internal links (e.g. /contact) use Next.js Link; external use <a>
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...sharedProps}>
        <Icon className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
      <Icon className="h-4 w-4" />
    </a>
  );
}

export function SocialLinks({
  links,
  accentColor,
}: {
  links: SocialItem[];
  accentColor: string;
}) {
  if (!links.length) return null;
  return (
    <div className="flex items-center gap-3">
      {links.map((link) => (
        <SocialButton key={link.icon} {...link} accentColor={accentColor} />
      ))}
    </div>
  );
}
