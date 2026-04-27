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
  ChevronDown,
  LogOut,
  Users,
  CreditCard,
  FileText,
  Newspaper,
  Shield,
  Bot,
  Search,
  Sun,
  Moon,
  Lock,
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessFeature, DEFAULT_GATES } from "@/lib/feature-gates";

// ── Types ───────────────────────────────────────────────────────────────────

interface NavItem {
  href:     string;
  label:    string;
  icon:     React.ElementType;
  external?: boolean;
}

interface NavGroup {
  key:         string;
  label:       string;
  defaultOpen: boolean;
  items:       NavItem[];
}

interface SidebarProps {
  authorName:    string;
  authorSlug:    string;
  isSuperAdmin?: boolean;
  planTier?:     string;
  featureGates?: Record<string, string>;
  adminTheme?:   "dark" | "light";
}

// ── Nav structure ────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    key: "content", label: "Content", defaultOpen: true,
    items: [
      { href: "/admin/books",      label: "Books",       icon: BookOpen   },
      { href: "/admin/flip-books", label: "Flip Books",  icon: BookMarked },
      { href: "/admin/specials",   label: "Specials",    icon: Sparkles   },
      { href: "/admin/series",     label: "Series",      icon: Library    },
      { href: "/admin/pages",      label: "Pages",       icon: FileText   },
      { href: "/admin/blog",       label: "Blog / News", icon: Newspaper  },
    ],
  },
  {
    key: "marketing", label: "Marketing", defaultOpen: true,
    items: [
      { href: "/admin/newsletter",   label: "Newsletter",   icon: Mail       },
      { href: "/admin/sales",        label: "Sales",        icon: ShoppingBag},
      { href: "/admin/ai-assistant", label: "AI Assistant", icon: Bot        },
      { href: "/admin/seo-audit",    label: "SEO Audit",    icon: Search     },
    ],
  },
  {
    key: "customize", label: "Customize", defaultOpen: false,
    items: [
      { href: "/admin/appearance", label: "Appearance", icon: Paintbrush },
      { href: "/admin/branding",   label: "Branding",   icon: Palette    },
    ],
  },
  {
    key: "account", label: "Account", defaultOpen: false,
    items: [
      { href: "/admin/messages",  label: "Messages",      icon: Inbox    },
      { href: "/admin/legal",     label: "My Site Legal", icon: Shield   },
      { href: "/admin/settings",  label: "Settings",      icon: Settings },
    ],
  },
];

const SUPER_ADMIN_ITEMS: NavItem[] = [
  { href: "/super-admin/authors",        label: "All Authors",   icon: Users      },
  { href: "/super-admin/plans",          label: "Plans",         icon: CreditCard },
  { href: "/super-admin/feature-config", label: "Feature Gates", icon: Bot        },
  { href: "/admin/genres",               label: "Genres",        icon: Tag        },
  { href: "/super-admin/legal",          label: "Legal",         icon: Shield     },
  { href: "/super-admin/settings",       label: "Platform",      icon: Settings   },
  { href: "https://us.posthog.com/shared/PJJkxbjMkF2F5sJe-XCSQ6Cx0gYM6g", label: "Analytics", icon: BarChart2, external: true },
];

// ── Theme token helper ───────────────────────────────────────────────────────
// Returns a set of class strings based on the active theme so that the
// rest of the component stays readable with plain string references.

function tokens(theme: "dark" | "light") {
  const dark = theme === "dark";
  return {
    sidebar:      dark ? "bg-gray-900 border-gray-800"   : "bg-[#f2ede4] border-[#ddd6c8]",
    logoBorder:   dark ? "border-gray-800"               : "border-[#ddd6c8]",
    authorBorder: dark ? "border-gray-800"               : "border-[#ddd6c8]",
    authorLabel:  dark ? "text-gray-500"                 : "text-[#9b8e7e]",
    authorName:   dark ? "text-white"                    : "text-gray-900",
    authorLink:   dark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700",
    groupBtn:     dark ? "text-gray-400 hover:text-gray-200"      : "text-[#7a6e62] hover:text-[#3d3328]",
    groupLabel:   dark ? "text-gray-500"                 : "text-[#9b8e7e]",
    navItem:      dark
      ? "text-gray-400 hover:text-white hover:bg-gray-800"
      : "text-[#6b5f53] hover:text-[#3d3328] hover:bg-[#e8e0d4]",
    navActive:    "bg-blue-600 text-white",
    superActive:  dark ? "bg-purple-700 text-white" : "bg-purple-600 text-white",
    superItem:    dark
      ? "text-gray-400 hover:text-white hover:bg-gray-800"
      : "text-[#6b5f53] hover:text-[#3d3328] hover:bg-[#e8e0d4]",
    superLabel:   dark ? "text-gray-500"  : "text-[#9b8e7e]",
    divider:      dark ? "bg-gray-800"    : "bg-[#ddd6c8]",
    signout:      dark
      ? "text-gray-400 hover:text-white hover:bg-gray-800"
      : "text-[#6b5f53] hover:text-[#3d3328] hover:bg-[#e8e0d4]",
    bottomBorder: dark ? "border-gray-800" : "border-[#ddd6c8]",
    badge:        dark ? "bg-gray-700 text-gray-300" : "bg-[#ddd6c8] text-[#6b5f53]",
  };
}

// ── Locked nav item ──────────────────────────────────────────────────────────

function LockedNavItem({
  label, icon: Icon, requiredTier, t,
}: {
  label:        string;
  icon:         React.ElementType;
  requiredTier: string;
  t:            ReturnType<typeof tokens>;
}) {
  const tierLabel = requiredTier === "PREMIUM" ? "Premium" : "Standard";
  return (
    <div className="relative group">
      <Link
        href="/admin/settings#billing"
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors opacity-50",
          t.navItem,
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{label}</span>
        <Lock className="h-3.5 w-3.5 flex-shrink-0" />
      </Link>
      {/* Tooltip — drops below the item, stays within scroll container */}
      <div className="absolute left-3 right-3 top-full mt-1 z-50 hidden group-hover:block pointer-events-none">
        <div className="bg-gray-900 text-white text-xs rounded-md px-2.5 py-2 shadow-xl">
          <span className="font-medium">{tierLabel} plan required</span>
          <span className="block text-gray-400 mt-0.5">Click to upgrade your plan</span>
        </div>
      </div>
    </div>
  );
}

// ── Collapsible group ────────────────────────────────────────────────────────

function NavGroupSection({
  group, pathname, unreadMessages, isSuperAdmin, planTier, featureGates, t,
}: {
  group: NavGroup;
  pathname: string;
  unreadMessages: number;
  isSuperAdmin: boolean;
  planTier: string;
  featureGates: Record<string, string>;
  t: ReturnType<typeof tokens>;
}) {
  const storageKey = `admin-nav-${group.key}`;
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return group.defaultOpen;
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved === "true" : group.defaultOpen;
  });

  // Persist state
  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(storageKey, String(next));
  };

  // Auto-open the group if a child is active
  const hasActive = group.items.some((it) => pathname.startsWith(it.href));
  useEffect(() => {
    if (hasActive) {
      setOpen(true);
      localStorage.setItem(storageKey, "true");
    }
  }, [hasActive, storageKey]);

  // Hide items marked DISABLED; show everything else (locked or unlocked)
  const visibleItems = group.items.filter((it) => {
    const required = featureGates[it.href] ?? DEFAULT_GATES[it.href] ?? "FREE";
    return required !== "DISABLED";
  });
  if (visibleItems.length === 0) return null;

  return (
    <div>
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors",
          t.groupBtn
        )}
      >
        <span className={t.groupLabel}>{group.label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", t.groupLabel, open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const accessible = isSuperAdmin || canAccessFeature(href, planTier, featureGates);
            const requiredTier = featureGates[href] ?? DEFAULT_GATES[href] ?? "FREE";

            if (!accessible) {
              return (
                <LockedNavItem
                  key={href}
                  label={label}
                  icon={Icon}
                  requiredTier={requiredTier}
                  t={t}
                />
              );
            }

            const active = pathname.startsWith(href);
            const badge  = href === "/admin/messages" && unreadMessages > 0 ? unreadMessages : null;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? t.navActive : t.navItem
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
        </div>
      )}
    </div>
  );
}

// ── Main sidebar ─────────────────────────────────────────────────────────────

export function AdminSidebar({
  authorName,
  authorSlug,
  isSuperAdmin = false,
  planTier = "FREE",
  featureGates = {},
  adminTheme = "light",
}: SidebarProps) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [superOpen, setSuperOpen] = useState(false);
  const t = tokens(adminTheme);

  // Load super-admin group open state from localStorage
  useEffect(() => {
    if (!isSuperAdmin) return;
    const saved = localStorage.getItem("admin-nav-superadmin");
    if (saved !== null) setSuperOpen(saved === "true");
    else {
      const hasActive = SUPER_ADMIN_ITEMS.some((it) => pathname.startsWith(it.href));
      if (hasActive) setSuperOpen(true);
    }
  }, [isSuperAdmin, pathname]);

  const toggleSuper = () => {
    const next = !superOpen;
    setSuperOpen(next);
    localStorage.setItem("admin-nav-superadmin", String(next));
  };

  useEffect(() => {
    fetch("/api/admin/messages?filter=inbox")
      .then((r) => r.json())
      .then((d) => { if (typeof d.unreadCount === "number") setUnreadMessages(d.unreadCount); })
      .catch(() => {});
  }, [pathname]);

  return (
    <aside className={cn("w-64 flex-shrink-0 min-h-screen flex flex-col border-r", t.sidebar)}>

      {/* Logo */}
      <div className={cn("h-16 flex items-center px-4 gap-2 border-b", t.logoBorder)}>
        <div className="bg-white rounded-lg p-0.5 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/authorloft-logo.png" alt="AuthorLoft" className="h-10 w-auto" />
        </div>
        <div className="flex flex-col gap-0.5 flex-shrink-0">
          <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded font-medium leading-none">
            Admin
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold leading-none text-center ${
            planTier === "PREMIUM"  ? "bg-purple-600 text-white" :
            planTier === "STANDARD" ? "bg-blue-500 text-white"   :
                                      "bg-gray-400 text-white"
          }`}>
            {planTier === "PREMIUM" ? "Premium" : planTier === "STANDARD" ? "Standard" : "Free"}
          </span>
        </div>
      </div>

      {/* Author info */}
      <div className={cn("px-5 py-4 border-b", t.authorBorder)}>
        <p className={cn("text-xs uppercase tracking-widest mb-1", t.authorLabel)}>Your Site</p>
        <p className={cn("text-sm font-medium truncate", t.authorName)}>{authorName}</p>
        <a
          href={`https://${authorSlug}.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "authorloft.com"}`}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("text-xs flex items-center gap-1 mt-1 transition-colors", t.authorLink)}
        >
          View live site <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">

        {/* Dashboard — always visible, no group */}
        <Link
          href="/admin/dashboard"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
            pathname.startsWith("/admin/dashboard") ? t.navActive : t.navItem
          )}
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0" />
          Dashboard
        </Link>

        <div className={cn("h-px mx-1", t.divider)} />

        {/* Collapsible groups */}
        {NAV_GROUPS.map((group) => (
          <NavGroupSection
            key={group.key}
            group={group}
            pathname={pathname}
            unreadMessages={unreadMessages}
            isSuperAdmin={isSuperAdmin}
            planTier={planTier}
            featureGates={featureGates}
            t={t}
          />
        ))}

        {/* Super Admin collapsible section */}
        {isSuperAdmin && (
          <>
            <div className={cn("h-px mx-1", t.divider)} />
            <div>
              <button
                onClick={toggleSuper}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors",
                  t.groupBtn
                )}
              >
                <span className={t.superLabel}>Super Admin</span>
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform duration-200", t.superLabel, superOpen && "rotate-180")}
                />
              </button>

              {superOpen && (
                <div className="mt-0.5 space-y-0.5">
                  {SUPER_ADMIN_ITEMS.map(({ href, label, icon: Icon, external }) => {
                    const active = !external && pathname.startsWith(href) &&
                      (href !== "/admin/dashboard");
                    const cls = cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active ? t.superActive : t.superItem
                    );
                    return external ? (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cls}
                      >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {label}
                      </a>
                    ) : (
                      <Link key={href} href={href} className={cls}>
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      {/* Bottom: theme indicator + sign out */}
      <div className={cn("px-3 py-4 border-t space-y-1", t.bottomBorder)}>
        {/* Subtle theme indicator */}
        <div className={cn("flex items-center gap-2 px-3 py-1.5 text-xs", t.authorLabel)}>
          {adminTheme === "dark"
            ? <><Moon className="h-3.5 w-3.5" /> Dark mode</>
            : <><Sun  className="h-3.5 w-3.5" /> Light mode</>}
          <Link href="/admin/settings" className="ml-auto underline underline-offset-2 hover:opacity-80">
            Change
          </Link>
        </div>
        <button
          className={cn("flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full", t.signout)}
          onClick={() => signOut({ callbackUrl: "https://www.authorloft.com/login" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
