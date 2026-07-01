"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { MarketingFilterToolbar } from "./marketing-filter-toolbar";

type Guide = { id: string; title: string; slug: string; excerpt: string; coverImageUrl: string | null; category: string };

const SORT_OPTIONS = [
  { id: "default", label: "Recommended order" },
  { id: "az", label: "Title A–Z" },
];

export function GuidesIndexClient({ guides, pillars }: { guides: Guide[]; pillars: string[] }) {
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("default");

  const filtered = useMemo(() => {
    let list = guides.filter((g) => !category || g.category === category);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((g) =>
        [g.title, g.excerpt, g.category].join(" ").toLowerCase().includes(q)
      );
    }

    if (sort === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [guides, category, query, sort]);

  const isFiltering = !!category || !!query.trim();

  const grouped = useMemo(() => {
    if (!isFiltering) return null;
    const sections = pillars
      .map((pillar) => ({ pillar, items: filtered.filter((g) => g.category === pillar) }))
      .filter((g) => g.items.length > 0);
    const rest = filtered.filter((g) => !g.category);
    if (rest.length > 0) sections.push({ pillar: "More Guides", items: rest });
    return sections;
  }, [filtered, pillars, isFiltering]);

  const defaultGrouped = useMemo(() => {
    const sections = pillars.map((pillar) => ({ pillar, items: guides.filter((g) => g.category === pillar) }));
    const rest = guides.filter((g) => !g.category);
    if (rest.length > 0) sections.push({ pillar: "More Guides", items: rest });
    return sections;
  }, [guides, pillars]);

  const reset = () => { setCategory(""); setQuery(""); };

  return (
    <div>
      <MarketingFilterToolbar
        categories={pillars}
        activeCategory={category}
        onCategoryChange={setCategory}
        search={query}
        onSearchChange={setQuery}
        searchPlaceholder="Search guides"
        sortOptions={SORT_OPTIONS}
        sortValue={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        totalCount={guides.length}
        itemLabel="guides"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-18">
          <Search className="h-10 w-10 text-[#D4AE6A]/40 mx-auto mb-4" />
          <h3 className="font-serif text-2xl text-[#1B2B47] mb-2">No guides found</h3>
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
        <div className="space-y-16">
          {(grouped ?? defaultGrouped).map(({ pillar, items }) => (
            <div key={pillar}>
              <h2 className="font-serif text-2xl text-[#1B2B47] font-normal mb-6 pb-3 border-b border-[#DCDBD3]">
                {pillar}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((guide) => (
                  <GuideCard key={guide.id} guide={guide} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-lg hover:border-[#C26A4A]/40 transition-all"
    >
      {guide.coverImageUrl && (
        <div className="h-44 bg-[#F0EDE4] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={guide.coverImageUrl} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-5">
        {guide.category && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C26A4A] mb-2 block">{guide.category}</span>
        )}
        <h3 className="font-serif text-xl text-[#1B2B47] font-normal mb-2 group-hover:text-[#C26A4A] transition-colors leading-snug">
          {guide.title}
        </h3>
        {guide.excerpt && (
          <p className="text-sm text-[#5C6E89] leading-relaxed line-clamp-3">{guide.excerpt}</p>
        )}
        <span className="inline-flex items-center gap-1 text-sm text-[#C26A4A] font-medium mt-3">
          Read guide <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
