"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Pencil, Trash2, Globe, EyeOff as NavHidden,
  Loader2, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/admin/icon-button";

interface PageItem {
  id: string;
  slug: string;
  title: string;
  navTitle: string | null;
  isVisible: boolean;
  showInNav: boolean;
  sortOrder: number;
  updatedAt: string | Date;
}

interface PagesListClientProps {
  pages: PageItem[];
}

export function PagesListClient({ pages: initial }: PagesListClientProps) {
  const router = useRouter();
  const [pages, setPages] = useState<PageItem[]>(initial);
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [deleting, setDeleting] = useState<string | null>(null);

  async function toggleField(id: string, field: "isVisible" | "showInNav", current: boolean) {
    setPending((p) => ({ ...p, [`${id}-${field}`]: true }));
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !current }),
      });
      if (!res.ok) throw new Error("Failed");
      setPages((prev) =>
        prev.map((p) => (p.id === id ? { ...p, [field]: !current } : p))
      );
    } finally {
      setPending((p) => ({ ...p, [`${id}-${field}`]: false }));
    }
  }

  async function deletePage(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setPages((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Page</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center">Published</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center">In Nav</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center hidden sm:block">URL</span>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide text-center">Actions</span>
      </div>

      {pages.map((page, i) => (
        <div
          key={page.id}
          className={cn(
            "grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-4 py-3 items-center",
            i < pages.length - 1 && "border-b border-gray-100",
            !page.isVisible && "bg-gray-50"
          )}
        >
          {/* Title */}
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{page.title}</p>
            {page.navTitle && (
              <p className="text-xs text-gray-400 truncate">Nav: {page.navTitle}</p>
            )}
          </div>

          {/* Published toggle */}
          <div className="flex justify-center">
            {pending[`${page.id}-isVisible`] ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <button
                onClick={() => toggleField(page.id, "isVisible", page.isVisible)}
                title={page.isVisible ? "Published — click to unpublish" : "Draft — click to publish"}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  page.isVisible ? "bg-green-500" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                    page.isVisible ? "translate-x-[18px]" : "translate-x-[2px]"
                  )}
                />
              </button>
            )}
          </div>

          {/* Show in nav toggle */}
          <div className="flex justify-center">
            {pending[`${page.id}-showInNav`] ? (
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
            ) : (
              <button
                onClick={() => toggleField(page.id, "showInNav", page.showInNav)}
                title={page.showInNav ? "Visible in nav — click to hide" : "Hidden from nav — click to show"}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                  page.showInNav ? "bg-blue-500" : "bg-gray-300"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform",
                    page.showInNav ? "translate-x-[18px]" : "translate-x-[2px]"
                  )}
                />
              </button>
            )}
          </div>

          {/* Slug */}
          <div className="hidden sm:flex justify-center">
            <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
              /{page.slug}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 justify-end">
            <Link
              href={`/admin/pages/${page.id}/edit`}
              title="Edit page"
              aria-label="Edit page"
              className="relative group/tip p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 group-hover/tip:opacity-100 transition-opacity z-50">
                Edit page
              </span>
            </Link>
            <IconButton
              icon={<Trash2 className="h-4 w-4" />}
              title="Delete page"
              variant="danger"
              onClick={() => deletePage(page.id, page.title)}
              disabled={deleting === page.id}
              loading={deleting === page.id}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
