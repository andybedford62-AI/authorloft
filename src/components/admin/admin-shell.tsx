"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, Zap } from "lucide-react";
import Link from "next/link";
import { AdminSidebar } from "@/components/admin/sidebar";
import { LogoutButton } from "@/components/admin/logout-button";

interface AdminShellProps {
  authorName:    string;
  authorSlug:    string;
  isSuperAdmin?: boolean;
  isFoundingMember?: boolean;
  planTier?:     string;
  featureGates?: Record<string, string>;
  adminTheme:    "dark" | "light";
  bg: { header: string; headerBorder: string };
  headerBadge?:  React.ReactNode;
  children:      React.ReactNode;
}

export function AdminShell({
  authorName,
  authorSlug,
  isSuperAdmin,
  isFoundingMember,
  planTier,
  featureGates,
  adminTheme,
  bg,
  headerBadge,
  children,
}: AdminShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer whenever the route changes
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="flex flex-1 min-h-0">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — slides in from left on mobile, always visible on lg+ */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 transition-transform duration-200 ease-in-out
          lg:relative lg:z-auto lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <AdminSidebar
          authorName={authorName}
          authorSlug={authorSlug}
          isSuperAdmin={isSuperAdmin}
          isFoundingMember={isFoundingMember}
          planTier={planTier}
          featureGates={featureGates}
          adminTheme={adminTheme}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="h-16 border-b flex items-center px-4 sm:px-6 flex-shrink-0"
          style={{ background: bg.header, borderColor: bg.headerBorder }}
        >
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setOpen(true)}
            className="lg:hidden p-2 -ml-1 mr-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-black/5 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {headerBadge}

          <div className="flex-1" />

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Upgrade CTA — only for free plan users */}
            {planTier === "FREE" && (
              <Link
                href="/admin/settings?tab=billing"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex-shrink-0"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upgrade Plan</span>
                <span className="sm:hidden">Upgrade</span>
              </Link>
            )}
            <span className="hidden sm:block text-sm text-gray-500 truncate max-w-[140px]">
              {authorName}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 flex-shrink-0">
              {authorName[0]}
            </div>
            <LogoutButton />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
