"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, ChevronDown, ArrowRight, BookOpen, Feather, Mail, Home, PenLine,
  ShoppingBag, User, Library, BookMarked, Bell, type LucideIcon,
} from "lucide-react";
import type { FilterablePost } from "./use-post-filters";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "author tools": PenLine,
  "author websites": Home,
  "book marketing": Bell,
  "compliance": BookMarked,
  "direct sales": ShoppingBag,
  "for independent authors": User,
  "guides": Library,
  "marketing": Mail,
  "publishing": BookOpen,
  "reader tips": Feather,
};

function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category.trim().toLowerCase()] ?? BookOpen;
}

type SortKey = "newest" | "oldest" | "quick" | "long" | "az";

const SORT_OPTIONS: { id: SortKey; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "quick", label: "Quickest read" },
  { id: "long", label: "Longest read" },
  { id: "az", label: "Title A–Z" },
];

function BlogCard({ post }: { post: FilterablePost }) {
  const Icon = getCategoryIcon(post.category || "");

  return (
    <Link href={`/blog/${post.slug}`} className="group flex flex-col gap-4">
      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-br-[36px] shadow-[8px_12px_26px_rgba(10,25,47,0.14)] bg-[#1B2B47]">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(ellipse 80% 70% at 50% 12%, rgba(212,174,106,0.26) 0%, rgba(212,174,106,0.05) 38%, rgba(27,43,71,0) 72%), linear-gradient(160deg, #24395C 0%, #1B2B47 70%)",
            }}
          >
            <Icon className="h-[88px] w-[88px] text-[#D4AE6A]/60" strokeWidth={1.2} />
            <span className="absolute left-4 bottom-3 text-[0.62rem] tracking-[0.22em] uppercase font-bold text-[#F5EBD3]/45">
              AuthorLoft
            </span>
            <div className="absolute inset-3 rounded border border-[#D4AE6A]/20 pointer-events-none" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(27,43,71,0.32)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.14em]">
        {post.category && <span className="text-[#B8893D]">{post.category}</span>}
        {post.category && <span className="w-1 h-1 rounded-full bg-[#D4AE6A]/40 flex-none" />}
        <span className="text-[#5C6E89] font-semibold whitespace-nowrap">{post.readTimeMinutes} min</span>
      </div>

      <h3 className="font-serif text-2xl leading-tight text-[#1B2B47] font-semibold tracking-tight transition-colors group-hover:text-[#B8893D]">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-sm leading-relaxed text-[#5C6E89] line-clamp-2">{post.excerpt}</p>
      )}

      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-[#B8893D]">
        Read article
        <ArrowRight className="h-[15px] w-[15px] transition-transform duration-200 ease-out group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function BlogIndex({ posts }: { posts: FilterablePost[] }) {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) if (p.category?.trim()) set.add(p.category.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  const filtered = useMemo(() => {
    let list = posts.filter((p) => !category || p.category?.trim() === category);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.title, p.excerpt, p.category].join(" ").toLowerCase().includes(q)
      );
    }

    const ts = (p: FilterablePost) => (p.publishedAt ? new Date(p.publishedAt).getTime() : 0);
    const sorted = [...list];
    switch (sort) {
      case "newest": sorted.sort((a, b) => ts(b) - ts(a)); break;
      case "oldest": sorted.sort((a, b) => ts(a) - ts(b)); break;
      case "quick": sorted.sort((a, b) => a.readTimeMinutes - b.readTimeMinutes); break;
      case "long": sorted.sort((a, b) => b.readTimeMinutes - a.readTimeMinutes); break;
      case "az": sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
    }
    return sorted;
  }, [posts, category, query, sort]);

  const reset = () => {
    setCategory("");
    setQuery("");
  };

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-x-7 gap-y-1 border-b border-[#DCDBD3]">
        <button
          type="button"
          onClick={() => setCategory("")}
          className={`relative pb-3.5 text-sm font-semibold transition-colors ${
            category === "" ? "text-[#1B2B47]" : "text-[#5C6E89] hover:text-[#1B2B47]"
          }`}
        >
          All
          <span
            className={`absolute left-0 right-0 -bottom-px h-0.5 bg-[#D4AE6A] origin-left transition-transform duration-200 ${
              category === "" ? "scale-x-100" : "scale-x-0"
            }`}
          />
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`relative pb-3.5 text-sm font-semibold transition-colors ${
              category === c ? "text-[#1B2B47]" : "text-[#5C6E89] hover:text-[#1B2B47]"
            }`}
          >
            {c}
            <span
              className={`absolute left-0 right-0 -bottom-px h-0.5 bg-[#D4AE6A] origin-left transition-transform duration-200 ${
                category === c ? "scale-x-100" : "scale-x-0"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-5 mt-5">
        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-[#5C6E89]">
          Showing {filtered.length} of {posts.length}{category ? ` in ${category}` : ""}
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 border-b-[1.5px] border-[#DCDBD3] focus-within:border-[#D4AE6A] py-1.5 min-w-[220px] transition-colors">
            <Search className="h-4 w-4 text-[#5C6E89]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              aria-label="Search articles"
              className="border-none outline-none bg-transparent text-sm w-full placeholder:text-[#5C6E89]"
            />
          </label>
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort articles"
              className="appearance-none text-sm font-medium text-[#1B2B47] bg-white border border-[#DCDBD3] rounded-full pl-4 pr-9 py-2 cursor-pointer hover:border-[#D4AE6A] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#5C6E89] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-11 mt-8">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-18">
            <Search className="h-10 w-10 text-[#D4AE6A]/40 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-[#1B2B47] mb-2">No articles found</h3>
            <p className="text-sm text-[#5C6E89] mb-4">Try a different category or clear your search.</p>
            <button
              type="button"
              onClick={reset}
              className="border border-[#D4AE6A] text-[#B8893D] text-sm font-semibold px-5 py-2 rounded-full hover:bg-[#D4AE6A]/10 transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filtered.map((post) => <BlogCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
}
