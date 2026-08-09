"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Lock, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccessFeature, DEFAULT_GATES } from "@/lib/feature-gates";
import {
  ADMIN_PINNED_ITEMS,
  NAV_GROUPS,
  SUPER_ADMIN_PINNED_ITEMS,
  SUPER_ADMIN_GROUPS,
  type NavItem,
  type NavGroup,
} from "@/lib/admin-nav-groups";
import { ADMIN_SEARCH_EXTRAS } from "@/lib/admin-search-extras";

interface SearchResult extends NavItem {
  groupLabel:   string;
  section:      "admin" | "super-admin";
  locked:       boolean;
  description?: string;
}

function flatten(groups: NavGroup[], pinned: NavItem[], pinnedLabel: string, section: SearchResult["section"]) {
  return [
    ...pinned.map(it => ({ ...it, groupLabel: pinnedLabel, section })),
    ...groups.flatMap(g => g.items.map(it => ({ ...it, groupLabel: g.label, section }))),
  ];
}

interface CommandPaletteProps {
  isSuperAdmin: boolean;
  planTier:     string;
  featureGates: Record<string, string>;
  adminTheme:   "dark" | "light";
}

export function CommandPalette({ isSuperAdmin, planTier, featureGates, adminTheme }: CommandPaletteProps) {
  const router = useRouter();
  const dark = adminTheme === "dark";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K opens from anywhere; Escape closes
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      const id = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(id);
    }
  }, [open]);

  const allItems: SearchResult[] = useMemo(() => {
    const adminItems = flatten(NAV_GROUPS, ADMIN_PINNED_ITEMS, "Admin", "admin")
      .filter(it => (featureGates[it.href] ?? DEFAULT_GATES[it.href] ?? "FREE") !== "DISABLED")
      .map(it => ({
        ...it,
        locked: !isSuperAdmin && !canAccessFeature(it.href, planTier, featureGates),
      }));

    const superItems = isSuperAdmin
      ? flatten(SUPER_ADMIN_GROUPS, SUPER_ADMIN_PINNED_ITEMS, "Super Admin", "super-admin")
          .map(it => ({ ...it, locked: false }))
      : [];

    // Sub-page tabs (e.g. Settings > Billing, Branding > About Page) — gated
    // by their parent page's plan requirement, same as the top-level link.
    const extraItems: SearchResult[] = ADMIN_SEARCH_EXTRAS
      .filter(it => it.section === "admin" || isSuperAdmin)
      .map(it => {
        const basePath = it.href.split("?")[0];
        return {
          href:        it.href,
          label:       it.label,
          icon:        it.icon,
          groupLabel:  it.parentLabel,
          section:     it.section,
          description: it.description,
          locked:      it.section === "admin" && !isSuperAdmin && !canAccessFeature(basePath, planTier, featureGates),
        };
      });

    return [...adminItems, ...superItems, ...extraItems];
  }, [isSuperAdmin, planTier, featureGates]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(it =>
      it.label.toLowerCase().includes(q) || it.groupLabel.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  useEffect(() => { setActiveIndex(0); }, [query]);

  function go(item: SearchResult) {
    setOpen(false);
    router.push(item.locked ? "/admin/settings#billing" : item.href);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) go(item);
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm border transition-colors",
          dark
            ? "bg-gray-800/60 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
            : "bg-white/70 border-[#ddd6c8] text-[#6b5f53] hover:text-[#3d3328] hover:border-[#c9beac]"
        )}
      >
        <Search className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className={cn(
          "text-[10px] px-1.5 py-0.5 rounded border font-mono flex-shrink-0",
          dark ? "border-gray-600 text-gray-500" : "border-[#ddd6c8] text-[#9b8e7e]"
        )}>
          ⌘K
        </kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
          onClick={() => setOpen(false)}
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className={cn(
              "relative w-full max-w-lg rounded-xl shadow-2xl overflow-hidden",
              dark ? "bg-gray-900 border border-gray-700" : "bg-white border border-gray-200"
            )}
            onClick={e => e.stopPropagation()}
          >
            <div className={cn("flex items-center gap-2.5 px-4 py-3 border-b", dark ? "border-gray-800" : "border-gray-100")}>
              <Search className={cn("h-4 w-4 flex-shrink-0", dark ? "text-gray-500" : "text-gray-400")} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search admin pages…"
                className={cn(
                  "flex-1 bg-transparent text-sm focus:outline-none",
                  dark ? "text-white placeholder-gray-500" : "text-gray-900 placeholder-gray-400"
                )}
              />
              <button
                onClick={() => setOpen(false)}
                className={dark ? "text-gray-500 hover:text-gray-300" : "text-gray-400 hover:text-gray-600"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2">
              {results.length === 0 ? (
                <p className={cn("px-4 py-6 text-sm text-center", dark ? "text-gray-500" : "text-gray-400")}>
                  No matches for &ldquo;{query}&rdquo;.
                </p>
              ) : (
                results.map((item, i) => {
                  const active = i === activeIndex;
                  const Icon = item.icon;
                  const isSuper = item.section === "super-admin";
                  return (
                    <button
                      key={`${item.section}-${item.href}`}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                        active
                          ? isSuper
                            ? (dark ? "bg-purple-900/50 text-white" : "bg-purple-50 text-purple-900")
                            : (dark ? "bg-gray-800 text-white" : "bg-blue-50 text-blue-900")
                          : (dark ? "text-gray-300" : "text-gray-700")
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block truncate">{item.label}</span>
                        {item.description && (
                          <span className={cn("block text-xs truncate", dark ? "text-gray-500" : "text-gray-400")}>
                            {item.description}
                          </span>
                        )}
                      </span>
                      <span className={cn(
                        "text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded flex-shrink-0",
                        isSuper
                          ? (dark ? "bg-purple-900/60 text-purple-300" : "bg-purple-100 text-purple-700")
                          : (dark ? "bg-gray-800 text-gray-400" : "bg-gray-100 text-gray-500")
                      )}>
                        {isSuper ? "Super Admin" : item.groupLabel}
                      </span>
                      {item.locked && <Lock className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />}
                    </button>
                  );
                })
              )}
            </div>

            <div className={cn(
              "flex items-center gap-4 px-4 py-2 text-[11px] border-t",
              dark ? "border-gray-800 text-gray-500" : "border-gray-100 text-gray-400"
            )}>
              <span className="flex items-center gap-1"><CornerDownLeft className="h-3 w-3" /> to select</span>
              <span>↑↓ to navigate</span>
              <span>esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
