"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, GraduationCap, Package, Plus, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCents } from "@/lib/utils";

interface CatalogItem {
  id: string;
  title: string;
  priceCents: number;
  isPublished: boolean;
  isFeatured?: boolean;
}

interface CatalogTabsCardProps {
  books: CatalogItem[];
  courses: CatalogItem[];
  bundles: CatalogItem[];
  coursesEnabled: boolean;
  bundlesEnabled: boolean;
}

const ALL_TABS = [
  { key: "books" as const,   label: "Books",   singular: "book",   icon: BookOpen,      href: "/admin/books",   newHref: "/admin/books/new" },
  { key: "courses" as const, label: "Courses", singular: "course", icon: GraduationCap, href: "/admin/courses", newHref: "/admin/courses/new" },
  { key: "bundles" as const, label: "Bundles", singular: "bundle", icon: Package,       href: "/admin/bundles", newHref: "/admin/bundles/new" },
];

type TabKey = (typeof ALL_TABS)[number]["key"];

// Books/Courses/Bundles live in one tabbed card instead of three stacked
// panels — only one content type's stats + list show at a time.
export function CatalogTabsCard({ books, courses, bundles, coursesEnabled, bundlesEnabled }: CatalogTabsCardProps) {
  const [active, setActive] = useState<TabKey>("books");

  const dataByTab: Record<TabKey, CatalogItem[]> = { books, courses, bundles };
  const tabs = ALL_TABS.filter(t => t.key === "books" || (t.key === "courses" && coursesEnabled) || (t.key === "bundles" && bundlesEnabled));
  const activeTab = tabs.find(t => t.key === active) ?? tabs[0];
  const items = dataByTab[activeTab.key];
  const Icon = activeTab.icon;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab.key === t.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {t.label} ({dataByTab[t.key].length})
            </button>
          ))}
        </div>
        <Link href={activeTab.href} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2">
          Manage <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-gray-400 text-sm mb-3">No {activeTab.label.toLowerCase()} yet.</p>
          <Link href={activeTab.newHref}>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Add your first {activeTab.singular}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <Icon className="h-4 w-4 text-gray-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{item.title}</p>
                {!item.isPublished && (
                  <span className="text-xs text-amber-500">Draft</span>
                )}
              </div>
              {item.isFeatured && (
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 flex-shrink-0" />
              )}
              <p className="text-xs text-gray-400 flex-shrink-0">
                {formatCents(item.priceCents)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
