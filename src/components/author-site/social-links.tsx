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

// ── Icon-only circular button (default, used on nav/profile etc.) ─────────────
function SocialIconButton({ href, icon, label, accentColor }: SocialItem & { accentColor: string }) {
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

// ── Text pill button (used on About page) ────────────────────────────────────
function SocialPillButton({ href, icon, label }: SocialItem) {
  const Icon = ICON_MAP[icon] ?? Mail;

  const sharedProps = {
    className:
      "inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors duration-200",
  };

  if (href.startsWith("/")) {
    return (
      <Link href={href} {...sharedProps}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...sharedProps}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export function SocialLinks({
  links,
  accentColor,
  variant = "icon",
}: {
  links: SocialItem[];
  accentColor: string;
  variant?: "icon" | "pill";
}) {
  if (!links.length) return null;

  if (variant === "pill") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {links.map((link) => (
          <SocialPillButton key={link.icon} {...link} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {links.map((link) => (
        <SocialIconButton key={link.icon} {...link} accentColor={accentColor} />
      ))}
    </div>
  );
}
