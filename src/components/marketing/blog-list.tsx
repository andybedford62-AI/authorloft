"use client";

import Link from "next/link";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { usePostFilters, type FilterablePost } from "./use-post-filters";
import { PostFilterControls } from "./post-filter-controls";

function BlogCard({ post, featured }: { post: FilterablePost; featured: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group block bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-md transition-shadow ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {post.coverImageUrl && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className={`w-full object-cover ${featured ? "h-64 sm:h-80" : "h-44"}`}
        />
      )}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          {post.category && (
            <span className="text-xs font-mono uppercase tracking-wider text-[#C26A4A] bg-[#C26A4A]/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-[#9b8e7e]">
            <Clock className="h-3 w-3" /> {post.readTimeMinutes} min read
          </span>
        </div>
        <h2 className={`font-serif font-normal text-[#1B2B47] leading-snug mb-2 group-hover:text-[#C26A4A] transition-colors ${
          featured ? "text-2xl sm:text-3xl" : "text-xl"
        }`}>
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-[#5C6E89] leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#9b8e7e]">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
              : ""}
          </span>
          <span className="text-xs font-medium text-[#C26A4A] flex items-center gap-1 group-hover:gap-2 transition-all">
            Read more <ArrowRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export function BlogList({ posts }: { posts: FilterablePost[] }) {
  const f = usePostFilters(posts);

  return (
    <div>
      <PostFilterControls
        search={f.search} onSearch={f.setSearch}
        categories={f.categories} category={f.category} onCategory={f.setCategory}
        sort={f.sort} onSort={f.setSort}
        resultCount={f.filtered.length} total={posts.length}
        isFiltering={f.isFiltering} onReset={f.reset}
        searchPlaceholder="Search articles by title, summary, or category…"
      />

      {f.filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-[#DCDBD3]">
          <BookOpen className="h-10 w-10 text-[#D4DDEB] mx-auto mb-4" />
          <p className="text-[#5C6E89]">No articles match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {f.filtered.map((post, i) => (
            <BlogCard key={post.id} post={post} featured={!f.isFiltering && i === 0} />
          ))}
        </div>
      )}
    </div>
  );
}
