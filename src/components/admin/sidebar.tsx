"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  ChevronDown,
  LogOut,
  Shield,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessFeature, DEFAULT_GATES } from "@/lib/feature-gates";
import { CommandPalette } from "@/components/admin/command-palette";
import {
  ADMIN_PINNED_ITEMS,
  NAV_GROUPS,
  SUPER_ADMIN_PINNED_ITEMS,
  SUPER_ADMIN_GROUPS,
  type NavGroup,
} from "@/lib/admin-nav-groups";

// ── Types ───────────────────────────────────────────────────────────────────

interface SidebarProps {
  authorName:    string;
  authorSlug:    string;
  isSuperAdmin?: boolean;
  planTier?:     string;
  featureGates?: Record<string, string>;
  adminTheme?:   "dark" | "light";
}

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
    // Super Admin zone gets its own persistent purple wash + idle-state tint
    // (not just an active-state color) so the whole block reads as a
    // distinct area at a glance, not just when a link inside it is active.
    superSectionBg: dark
      ? "bg-purple-950/40 border border-purple-900/60"
      : "bg-purple-50 border border-purple-200",
    superItem:    dark
      ? "text-purple-300 hover:text-white hover:bg-purple-900/50"
      : "text-purple-700 hover:text-purple-950 hover:bg-purple-100",
    superLabel:   dark ? "text-purple-400"  : "text-purple-500",
    superHeader:  dark ? "text-purple-300"  : "text-purple-800",
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

            const active = pathname === href || pathname.startsWith(href + "/");
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

// ── Super-admin collapsible group ────────────────────────────────────────────
// Like NavGroupSection but with no feature-gating (super admins see everything)
// and purple active styling to set the elevated section apart.

function SuperNavGroupSection({
  group, pathname, t,
}: {
  group: NavGroup;
  pathname: string;
  t: ReturnType<typeof tokens>;
}) {
  const storageKey = `admin-nav-${group.key}`;
  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return group.defaultOpen;
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved === "true" : group.defaultOpen;
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    localStorage.setItem(storageKey, String(next));
  };

  const hasActive = group.items.some((it) => pathname.startsWith(it.href));
  useEffect(() => {
    if (hasActive) {
      setOpen(true);
      localStorage.setItem(storageKey, "true");
    }
  }, [hasActive, storageKey]);

  return (
    <div>
      <button
        onClick={toggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-widest transition-colors",
          t.groupBtn
        )}
      >
        <span className={t.superLabel}>{group.label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 transition-transform duration-200", t.superLabel, open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {group.items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  active ? t.superActive : t.superItem
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {label}
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
  const t = tokens(adminTheme);

  useEffect(() => {
    fetch("/api/admin/messages?filter=inbox")
      .then((r) => r.json())
      .then((d) => { if (typeof d.unreadCount === "number") setUnreadMessages(d.unreadCount); })
      .catch(() => {});
  }, [pathname]);

  return (
    <aside className={cn("w-64 flex-shrink-0 h-full flex flex-col border-r", t.sidebar)}>

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

        {/* Search — Cmd/Ctrl+K opens a searchable list of every Admin + Super Admin page */}
        <CommandPalette
          isSuperAdmin={isSuperAdmin}
          planTier={planTier}
          featureGates={featureGates}
          adminTheme={adminTheme}
        />

        {/* Dashboard & Analytics — always visible, pinned, no group */}
        {ADMIN_PINNED_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
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
            </Link>
          );
        })}

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

        {/* Super Admin section — visually walled off in its own purple-tinted
            zone (persistent background + border, not just active-state color)
            so it reads as a distinct area even when nothing in it is active. */}
        {isSuperAdmin && (
          <>
            <div className={cn("h-px mx-1", t.divider)} />
            <div className={cn("rounded-lg p-2 space-y-1", t.superSectionBg)}>
              <p className={cn("flex items-center gap-1.5 px-1 pt-0.5 pb-1 text-[10px] font-bold uppercase tracking-widest", t.superHeader)}>
                <Shield className="h-3 w-3 flex-shrink-0" />
                Super Admin
              </p>

              {/* Platform Dashboard — pinned, exact-match active */}
              {SUPER_ADMIN_PINNED_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      active ? t.superActive : t.superItem
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </Link>
                );
              })}

              {SUPER_ADMIN_GROUPS.map((group) => (
                <SuperNavGroupSection
                  key={group.key}
                  group={group}
                  pathname={pathname}
                  t={t}
                />
              ))}
            </div>
          </>
        )}

        {/* Theme indicator + sign out — flow directly after the menu items
            (not pinned to the bottom) so they shift as groups open/close */}
        <div className={cn("h-px mx-1 mt-1", t.divider)} />
        <div className="space-y-1 pt-1">
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
      </nav>
    </aside>
  );
}
