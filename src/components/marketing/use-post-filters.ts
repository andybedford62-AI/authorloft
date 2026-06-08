"use client";

import { useMemo, useState } from "react";

export type FilterablePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  coverImageUrl: string | null;
  readTimeMinutes: number;
  publishedAt: string | null; // ISO string
};

export type SortKey = "newest" | "oldest" | "az";

/**
 * Shared client-side search/filter/sort for the public Blog and News lists.
 * Returns the filtered+sorted posts plus control state and derived options.
 */
export function usePostFilters(posts: FilterablePost[]) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(""); // "" = all
  const [year, setYear] = useState<string>(""); // "" = all
  const [sort, setSort] = useState<SortKey>("newest");

  // Distinct categories present (sorted alphabetically)
  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) if (p.category?.trim()) set.add(p.category.trim());
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [posts]);

  // Distinct years present (newest first)
  const years = useMemo(() => {
    const set = new Set<string>();
    for (const p of posts) if (p.publishedAt) set.add(new Date(p.publishedAt).getFullYear().toString());
    return Array.from(set).sort((a, b) => Number(b) - Number(a));
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = posts.filter((p) => {
      if (q) {
        const hay = [p.title, p.excerpt, p.category].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (category && p.category?.trim() !== category) return false;
      if (year) {
        const py = p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : "";
        if (py !== year) return false;
      }
      return true;
    });

    const ts = (p: FilterablePost) => (p.publishedAt ? new Date(p.publishedAt).getTime() : 0);
    const sorted = [...result];
    if (sort === "newest") sorted.sort((a, b) => ts(b) - ts(a));
    else if (sort === "oldest") sorted.sort((a, b) => ts(a) - ts(b));
    else if (sort === "az") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [posts, search, category, year, sort]);

  const isFiltering = search.trim() !== "" || category !== "" || year !== "" || sort !== "newest";

  function reset() {
    setSearch("");
    setCategory("");
    setYear("");
    setSort("newest");
  }

  return {
    // state
    search, setSearch,
    category, setCategory,
    year, setYear,
    sort, setSort,
    // derived
    categories, years, filtered, isFiltering,
    reset,
  };
}
