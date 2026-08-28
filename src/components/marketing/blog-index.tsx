"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search, ArrowRight, BookOpen, Feather, Mail, Home, PenLine,
  ShoppingBag, User, Library, BookMarked, Bell, type LucideIcon,
} from "lucide-react";
import type { FilterablePost } from "./use-post-filters";
import { MarketingFilterToolbar } from "./marketing-filter-toolbar";

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
      <div className="relative w-full aspect-[16/9] overflow-hidden rounded-br-[36px] shadow-[8px_12px_26px_rgba(0,0,0,0.35)] bg-vault-bg">
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
                "radial-gradient(ellipse 80% 70% at 50% 12%, rgba(214,169,74,0.22) 0%, rgba(214,169,74,0.05) 38%, rgba(22,35,61,0) 72%), linear-gradient(160deg, var(--color-vault-surf-2) 0%, var(--color-vault-bg) 70%)",
            }}
          >
            <Icon className="h-[88px] w-[88px] text-vault-gold/60" strokeWidth={1.2} />
            <span className="absolute left-4 bottom-3 text-[0.62rem] tracking-[0.22em] uppercase font-bold text-vault-ink/45">
              AuthorLoft
            </span>
            <div className="absolute inset-3 rounded border border-vault-gold/20 pointer-events-none" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-vault-bg/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.14em]">
        {post.category && <span className="text-vault-gold">{post.category}</span>}
        {post.category && <span className="w-1 h-1 rounded-full bg-vault-gold/40 flex-none" />}
        <span className="text-vault-mute font-semibold whitespace-nowrap">{post.readTimeMinutes} min</span>
      </div>

      <h3 className="font-vault-display text-2xl leading-tight text-vault-ink font-semibold tracking-tight transition-colors group-hover:text-vault-gold">
        {post.title}
      </h3>

      {post.excerpt && (
        <p className="text-sm leading-relaxed text-vault-mute line-clamp-2">{post.excerpt}</p>
      )}

      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-vault-gold">
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
      <MarketingFilterToolbar
        categories={categories}
        activeCategory={category}
        onCategoryChange={setCategory}
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search articles"
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={(v) => setSort(v as SortKey)}
        resultCount={filtered.length}
        totalCount={posts.length}
        itemLabel="articles"
        variant="dark"
      />

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-9 gap-y-11 mt-8">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-18">
            <Search className="h-10 w-10 text-vault-gold/40 mx-auto mb-4" />
            <h3 className="font-vault-display text-2xl text-vault-ink mb-2">No articles found</h3>
            <p className="text-sm text-vault-mute mb-4">Try a different category or clear your search.</p>
            <button
              type="button"
              onClick={reset}
              className="border border-vault-gold text-vault-gold text-sm font-semibold px-5 py-2 rounded-full hover:bg-vault-gold/10 transition-colors"
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
