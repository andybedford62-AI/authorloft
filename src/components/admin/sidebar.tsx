"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  BookMarked,
  Tag,
  Sparkles,
  Library,
  Palette,
  Paintbrush,
  Mail,
  Inbox,
  ShoppingBag,
  Settings,
  ExternalLink,
  ChevronRight,
  LogOut,
  Users,
  CreditCard,
  FileText,
  Newspaper,
  Shield,
  Bot,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessFeature } from "@/lib/feature-gates";

const authorNavItems = [
  { href: "/admin/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
  { href: "/admin/books",       label: "Books",        icon: BookOpen },
  { href: "/admin/flip-books",  label: "Flip Books",   icon: BookMarked },
  { href: "/admin/specials",    label: "Specials",     icon: Sparkles },
  { href: "/admin/series",      label: "Series",       icon: Library },
  { href: "/admin/genres",      label: "Genres",       icon: Tag },
  { href: "/admin/pages",       label: "Pages",        icon: FileText },
  { href: "/admin/blog",        label: "Blog / News",  icon: Newspaper },
  { href: "/admin/messages",    label: "Messages",     icon: Inbox },
  { href: "/admin/newsletter",  label: "Newsletter",   icon: Mail },
  { href: "/admin/sales",       label: "Sales",        icon: ShoppingBag },
  { href: "/admin/appearance",  label: "Appearance",   icon: Paintbrush },
  { href: "/admin/branding",    label: "Branding",     icon: Palette },
  { href: "/admin/legal",        label: "My Site Legal", icon: Shield },
  { href: "/admin/ai-assistant", label: "AI Assistant",  icon: Bot    },
  { href: "/admin/seo-audit",    label: "SEO Audit",     icon: Search },
  { href: "/admin/settings",     label: "Settings",      icon: Settings },
];

const superAdminItems = [
  { href: "/super-admin/authors",        label: "All Authors",   icon: Users      },
  { href: "/super-admin/plans",          label: "Plans",         icon: CreditCard },
  { href: "/super-admin/feature-config", label: "Feature Gates", icon: Bot        },
  { href: "/super-admin/legal",          label: "Legal",         icon: Shield     },
  { href: "/super-admin/settings",       label: "Platform",      icon: Settings   },
];

interface SidebarProps {
  authorName:    string;
  authorSlug:    string;
  isSuperAdmin?: boolean;
  planTier?:     string;
  featureGates?: Record<string, string>;
}

export function AdminSidebar({ authorName, authorSlug, isSuperAdmin, planTier = "FREE", featureGates = {} }: SidebarProps) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    fetch("/api/admin/messages?filter=inbox")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.unreadCount === "number") setUnreadMessages(d.unreadCount);
      })
      .catch(() => {});
  }, [pathname]); // re-fetch when navigating (e.g. after reading a message)

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-800 gap-2">
        <div className="bg-white rounded-lg p-0.5 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-10 w-auto" />
        </div>
        <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium flex-shrink-0">
          Admin
        </span>
      </div>

      {/* Author info */}
      <div className="px-5 py-4 border-b border-gray-800">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Your Site</p>
        <p className="text-sm text-white font-medium truncate">{authorName}</p>
        <a
          href={`https://${authorSlug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1 transition-colors"
        >
          View live site <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {authorNavItems.map(({ href, label, icon: Icon }) => {
          // Super-admins see all items regardless of plan.
          if (!isSuperAdmin && !canAccessFeature(href, planTier, featureGates)) return null;

          const active = pathname.startsWith(href);
          const badge =
            href === "/admin/messages" && unreadMessages > 0
              ? unreadMessages
              : null;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
              {badge && (
                <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-xs font-bold bg-blue-500 text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Super Admin Section */}
        {isSuperAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs text-gray-600 uppercase tracking-widest px-3">
                Super Admin
              </p>
            </div>
            {superAdminItems.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                    active
                      ? "bg-purple-700 text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {label}
                  <ChevronRight className="h-3 w-3 ml-auto opacity-40" />
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
          onClick={() => signOut({ callbackUrl: "https://www.authorloft.com/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
