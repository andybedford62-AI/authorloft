"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink, Search } from "lucide-react";

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

export function GuidesClient({ initialGuides }: { initialGuides: Guide[] }) {
  const [guides, setGuides] = useState(initialGuides);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guides;
    return guides.filter((g) => g.title.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q) || g.category.toLowerCase().includes(q));
  }, [guides, search]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this guide permanently?")) return;
    const res = await fetch(`/api/super-admin/guides/${id}`, { method: "DELETE" });
    if (res.ok) {
      setGuides((prev) => prev.filter((g) => g.id !== id));
    }
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search guides..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 hidden md:table-cell">Status</th>
              <th className="px-4 py-3 hidden md:table-cell">Order</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {guides.length === 0 ? "No guides yet. Create your first one!" : "No guides match your search."}
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
