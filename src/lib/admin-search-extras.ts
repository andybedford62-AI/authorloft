import {
  User,
  CreditCard,
  Bot,
  Paintbrush,
  Bell,
  Trash2,
  FileText,
  Sparkles,
  Share2,
  Mail,
  Globe,
  HelpCircle,
  Scale,
  Percent,
  Database,
  Zap,
  MessageSquare,
  Image,
  Star,
  WifiOff,
  UserX,
  Settings,
} from "lucide-react";

// Search entries for functionality that lives *inside* a page as a tab, not
// as its own sidebar link — e.g. "Billing" under Settings, "About Page"
// under Branding. The command palette flattens these in alongside the
// top-level nav so search finds the exact tab, not just the parent page.
//
// `href` should deep-link straight to the tab (?tab=...) wherever the host
// page supports it. Items with `description` but no real single destination
// (e.g. a per-book tab) link to the closest actionable list page instead and
// use the description to say where to go from there.

export interface SearchExtraItem {
  href:         string;
  label:        string;
  parentLabel:  string;
  icon:         React.ElementType;
  section:      "admin" | "super-admin";
  description?: string;
}

export const ADMIN_SEARCH_EXTRAS: SearchExtraItem[] = [
  // ── Settings tabs ──────────────────────────────────────────────────────
  { href: "/admin/settings?tab=account",       label: "Account & Password",  parentLabel: "Settings", icon: User,       section: "admin" },
  { href: "/admin/settings?tab=billing",       label: "Billing",             parentLabel: "Settings", icon: CreditCard, section: "admin" },
  { href: "/admin/settings?tab=integrations",  label: "AI Assistant Key",    parentLabel: "Settings", icon: Bot,        section: "admin" },
  { href: "/admin/settings?tab=appearance",    label: "Admin Theme",         parentLabel: "Settings", icon: Paintbrush, section: "admin" },
  { href: "/admin/settings?tab=communications",label: "Email Communications",parentLabel: "Settings", icon: Bell,       section: "admin" },
  { href: "/admin/settings?tab=danger",        label: "Danger Zone",         parentLabel: "Settings", icon: Trash2,     section: "admin" },

  // ── Branding tabs ──────────────────────────────────────────────────────
  { href: "/admin/branding?tab=profile", label: "Profile",          parentLabel: "Branding", icon: User,      section: "admin" },
  { href: "/admin/branding?tab=about",   label: "About Page",       parentLabel: "Branding", icon: FileText,  section: "admin" },
  { href: "/admin/branding?tab=hero",    label: "Hero",             parentLabel: "Branding", icon: Sparkles,  section: "admin" },
  { href: "/admin/branding?tab=social",  label: "Social & Contact", parentLabel: "Branding", icon: Share2,    section: "admin" },

  // ── Newsletter tabs ────────────────────────────────────────────────────
  { href: "/admin/newsletter?tab=newsletter",   label: "Newsletter Broadcasts", parentLabel: "Newsletter", icon: Mail,   section: "admin" },
  { href: "/admin/newsletter?tab=integrations", label: "Newsletter Integrations", parentLabel: "Newsletter", icon: Globe, section: "admin" },

  // ── Help & Support tabs ────────────────────────────────────────────────
  { href: "/admin/help?tab=help",    label: "Help Articles",   parentLabel: "Help & Support", icon: HelpCircle, section: "admin" },
  { href: "/admin/help?tab=contact", label: "Contact Support", parentLabel: "Help & Support", icon: Mail,       section: "admin" },

  // ── Legal Pages tabs ───────────────────────────────────────────────────
  { href: "/admin/legal?tab=privacy", label: "Privacy Policy",   parentLabel: "Legal Pages", icon: Scale, section: "admin" },
  { href: "/admin/legal?tab=terms",   label: "Terms of Service", parentLabel: "Legal Pages", icon: Scale, section: "admin" },
  { href: "/admin/legal?tab=contact", label: "Legal Contact Email", parentLabel: "Legal Pages", icon: Mail, section: "admin" },

  // ── Per-book functionality — no single URL, so this points at the list
  //    and explains where to go from there ──────────────────────────────
  {
    href: "/admin/books", label: "Affiliate Links / Affiliations", parentLabel: "Books", icon: Percent, section: "admin",
    description: "Per book — open a book, then its Affiliate tab (needs Direct Sales enabled)",
  },

  // ── Super Admin — Platform Settings tabs ───────────────────────────────
  { href: "/super-admin/settings?tab=overview",     label: "Platform Overview",     parentLabel: "Platform Settings", icon: Database,      section: "super-admin" },
  { href: "/super-admin/settings?tab=welcome-email",label: "Welcome Email",         parentLabel: "Platform Settings", icon: Zap,           section: "super-admin" },
  { href: "/super-admin/settings?tab=mass-email",   label: "Mass Email",            parentLabel: "Platform Settings", icon: MessageSquare, section: "super-admin" },
  { href: "/super-admin/settings?tab=emails",       label: "Email Addresses",       parentLabel: "Platform Settings", icon: Mail,          section: "super-admin" },
  { href: "/super-admin/settings?tab=marketing",    label: "Marketing Hero Image",  parentLabel: "Platform Settings", icon: Image,         section: "super-admin" },
  { href: "/super-admin/settings?tab=testimonials", label: "Testimonials",          parentLabel: "Platform Settings", icon: Star,          section: "super-admin" },
  { href: "/super-admin/settings?tab=seo",          label: "Social Images (OG/SEO)",parentLabel: "Platform Settings", icon: Globe,         section: "super-admin" },
  { href: "/super-admin/settings?tab=maintenance",  label: "Maintenance Mode",      parentLabel: "Platform Settings", icon: WifiOff,       section: "super-admin" },
  { href: "/super-admin/settings?tab=onboarding",   label: "Onboarding Reminders",  parentLabel: "Platform Settings", icon: UserX,         section: "super-admin" },
  { href: "/super-admin/settings?tab=configuration",label: "Build/Env Configuration", parentLabel: "Platform Settings", icon: Settings,    section: "super-admin" },
];
