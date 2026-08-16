"use client";

import Link from "next/link";
import { Clock, ArrowRight, Megaphone } from "lucide-react";
import { usePostFilters, type FilterablePost } from "./use-post-filters";
import { PostFilterControls } from "./post-filter-controls";

function NewsCard({ post }: { post: FilterablePost }) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)] overflow-hidden hover:shadow-md transition-shadow p-5"
    >
      {post.coverImageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="w-full sm:w-48 h-40 sm:h-32 object-cover rounded-xl flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {post.category && (
            <span className="text-xs font-mono uppercase tracking-wider text-[#d6a94a] bg-[#d6a94a]/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          )}
          <span className="text-xs text-[#93a0bc]">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : ""}
          </span>
          <span className="flex items-center gap-1 text-xs text-[#93a0bc]">
            <Clock className="h-3 w-3" /> {post.readTimeMinutes} min
          </span>
        </div>
        <h3 className="font-serif text-xl text-[#f3ecdb] leading-snug mb-1 group-hover:text-[#d6a94a] transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-[#93a0bc] leading-relaxed line-clamp-2">{post.excerpt}</p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#d6a94a] group-hover:gap-2 transition-all">
          Read more <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

export function NewsList({ posts }: { posts: FilterablePost[] }) {
  const f = usePostFilters(posts);

  // Default (no filters): group by year for an archive feel.
  // Filtering active: flat results list.
  const groups = new Map<string, FilterablePost[]>();
  if (!f.isFiltering) {
    for (const p of f.filtered) {
      const y = p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : "Earlier";
      const bucket = groups.get(y) ?? [];
      bucket.push(p);
      groups.set(y, bucket);
    }
  }

  return (
    <div>
      <PostFilterControls
        search={f.search} onSearch={f.setSearch}
        categories={f.categories} category={f.category} onCategory={f.setCategory}
        sort={f.sort} onSort={f.setSort}
        years={f.years} year={f.year} onYear={f.setYear}
        resultCount={f.filtered.length} total={posts.length}
        isFiltering={f.isFiltering} onReset={f.reset}
        searchPlaceholder="Search news by title, summary, or category…"
      />

      {f.filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)]">
          <Megaphone className="h-10 w-10 text-[#93a0bc] mx-auto mb-4" />
          <p className="text-[#93a0bc]">No news matches your filters.</p>
        </div>
      ) : f.isFiltering ? (
        <div className="space-y-4">
          {f.filtered.map((p) => <NewsCard key={p.id} post={p} />)}
        </div>
      ) : (
        <div className="space-y-12">
          {Array.from(groups.keys()).map((year) => (
            <section key={year}>
              <h2 className="font-serif text-2xl text-[#f3ecdb] mb-5 pb-2 border-b border-[rgba(243,236,219,0.12)]">{year}</h2>
              <div className="space-y-4">
                {groups.get(year)!.map((p) => <NewsCard key={p.id} post={p} />)}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
