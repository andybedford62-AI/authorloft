"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink, Search, ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

type Post = {
  id:              string;
  title:           string;
  slug:            string;
  category:        string;
  isNews:          boolean;
  isPublished:     boolean;
  publishedAt:     string | null;
  displayOrder:    number;
  readTimeMinutes: number;
  createdAt:       string;
};

type TypeFilter = "all" | "blog" | "news";
type SortCol = "title" | "type" | "category" | "status" | "date";
type SortDir = "asc" | "desc";

function postTime(p: Post): number {
  const d = p.publishedAt ?? p.createdAt;
  return d ? new Date(d).getTime() : 0;
}

export function BlogPostsClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts]   = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TypeFilter>("all");
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc"); // newest first by default
  const router = useRouter();

  function toggleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(col);
      setSortDir(col === "date" ? "desc" : "asc"); // dates default newest-first
    }
  }

  const visiblePosts = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = posts.filter((p) => {
      if (filter !== "all" && (filter === "news" ? !p.isNews : p.isNews)) return false;
      if (q) {
        const hay = [p.title, p.slug, p.category].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      let cmp = 0;
      switch (sortCol) {
        case "title":    cmp = a.title.localeCompare(b.title); break;
        case "type":     cmp = Number(a.isNews) - Number(b.isNews); break;
        case "category": cmp = (a.category || "").localeCompare(b.category || ""); break;
        case "status":   cmp = Number(a.isPublished) - Number(b.isPublished); break;
        case "date":     cmp = postTime(a) - postTime(b); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [posts, search, filter, sortCol, sortDir]);

  const handleDelete = useCallback(async (id: string) => {
    const post = posts.find((p) => p.id === id);
    if (!confirm(`Delete "${post?.title}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/super-admin/blog/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== id));
      router.refresh();
    } catch {
      alert("Failed to delete post. Please try again.");
    }
  }, [posts, router]);

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
        <p className="text-gray-500 text-sm mb-3">No posts yet.</p>
        <Link href="/super-admin/blog/new" className="text-sm font-medium text-purple-600 hover:text-purple-800">
          Create your first post →
        </Link>
      </div>
    );
  }

  function SortHeader({ col, label, align = "left" }: { col: SortCol; label: string; align?: "left" | "center" }) {
    const active = sortCol === col;
    return (
      <th className={`py-2.5 px-3 text-${align}`}>
        <button
          onClick={() => toggleSort(col)}
          className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
            active ? "text-purple-700" : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {label}
          {active ? (
            sortDir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ChevronsUpDown className="h-3 w-3 text-gray-300" />
          )}
        </button>
      </th>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search + type filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, or category…"
            className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
          {([
            ["all",  `All (${posts.length})`],
            ["blog", `Blog (${posts.filter((p) => !p.isNews).length})`],
            ["news", `News (${posts.filter((p) => p.isNews).length})`],
          ] as [TypeFilter, string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400">
        {visiblePosts.length} shown · {visiblePosts.filter((p) => p.isPublished).length} published · {visiblePosts.filter((p) => !p.isPublished).length} drafts
      </p>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <SortHeader col="title" label="Title" />
              <SortHeader col="type" label="Type" />
              <SortHeader col="category" label="Category" />
              <SortHeader col="status" label="Status" />
              <SortHeader col="date" label="Date" />
              <th className="py-2.5 px-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visiblePosts.map((post) => {
              const dateLabel = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 max-w-xs">
                    <span className="block text-sm font-medium text-gray-900 truncate">{post.title}</span>
                    <span className="text-xs text-gray-400 font-mono">/{post.isNews ? "news" : "blog"}/{post.slug}</span>
                  </td>
                  <td className="py-3 px-3">
                    {post.isNews ? (
                      <span className="inline-flex items-center text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded-full">News</span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded-full">Blog</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-500">{post.category || "—"}</td>
                  <td className="py-3 px-3">
                    {post.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap">{dateLabel}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {post.isPublished && (
                        <a
                          href={`/${post.isNews ? "news" : "blog"}/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View live"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                      <Link
                        href={`/super-admin/blog/${post.id}/edit`}
                        className="p-1.5 rounded text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {visiblePosts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-400">No posts match your search/filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400 px-1">
        Click a column header to sort. Public pages always show most recently published first.
      </p>
    </div>
  );
}
