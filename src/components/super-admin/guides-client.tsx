"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink, Search, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type Guide = {
  id:          string;
  title:       string;
  slug:        string;
  category:    string;
  isPublished: boolean;
  publishedAt: string | null;
  sortOrder:   number;
  createdAt:   string;
};

type SortKey = "title" | "category" | "status" | "sortOrder";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "published" | "draft";

export function GuidesClient({ initialGuides }: { initialGuides: Guide[] }) {
  const [guides, setGuides] = useState(initialGuides);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("sortOrder");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const router = useRouter();

  const categories = useMemo(
    () => [...new Set(guides.map((g) => g.category).filter(Boolean))].sort(),
    [guides]
  );

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 text-gray-300" />;
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 text-purple-600" /> : <ArrowDown className="h-3 w-3 text-purple-600" />;
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = guides.filter((g) => {
      if (q && !(g.title.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q) || g.category.toLowerCase().includes(q))) return false;
      if (category !== "all" && g.category !== category) return false;
      if (status === "published" && !g.isPublished) return false;
      if (status === "draft" && g.isPublished) return false;
      return true;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "category") cmp = a.category.localeCompare(b.category);
      else if (sortKey === "status") cmp = Number(a.isPublished) - Number(b.isPublished);
      else if (sortKey === "sortOrder") cmp = a.sortOrder - b.sortOrder;
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [guides, search, category, status, sortKey, sortDir]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this guide permanently?")) return;
    const res = await fetch(`/api/super-admin/guides/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGuides((prev) => prev.filter((g) => g.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guides..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        {(search || category !== "all" || status !== "all") && (
          <button
            onClick={() => { setSearch(""); setCategory("all"); setStatus("all"); }}
            className="text-sm text-purple-600 hover:text-purple-800 transition-colors"
          >
            Clear filters
          </button>
        )}
        <span className="text-xs text-gray-400 ml-auto">
          {visible.length} of {guides.length} guide{guides.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("title")} className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
                  Title <SortIcon column="title" />
                </button>
              </th>
              <th className="px-4 py-3 hidden sm:table-cell">
                <button onClick={() => toggleSort("category")} className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
                  Category <SortIcon column="category" />
                </button>
              </th>
              <th className="px-4 py-3 hidden md:table-cell">
                <button onClick={() => toggleSort("status")} className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
                  Status <SortIcon column="status" />
                </button>
              </th>
              <th className="px-4 py-3 hidden md:table-cell">
                <button onClick={() => toggleSort("sortOrder")} className="inline-flex items-center gap-1 hover:text-gray-700 transition-colors">
                  Order <SortIcon column="sortOrder" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {guides.length === 0 ? "No guides yet. Create your first one!" : "No guides match your filters."}
                </td>
              </tr>
            )}
            {visible.map((g) => (
              <tr key={g.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/super-admin/guides/${g.id}/edit`} className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
                    {g.title}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">/guides/{g.slug}</p>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell text-gray-500">{g.category || "—"}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {g.isPublished ? (
                    <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                      <Eye className="h-3 w-3" /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      <EyeOff className="h-3 w-3" /> Draft
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">{g.sortOrder}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {g.isPublished && (
                      <a href={`/guides/${g.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="View live">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link href={`/super-admin/guides/${g.id}/edit`} className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button onClick={() => handleDelete(g.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
