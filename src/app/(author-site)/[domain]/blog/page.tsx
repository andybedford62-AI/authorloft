import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { PageBanner } from "@/components/author-site/page-banner";
import { prisma } from "@/lib/db";
import { getAuthorByDomain } from "@/lib/author-queries";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;
  return {
    title: "Blog",
    description: `News and updates from ${authorName}.`,
  };
}

export default async function BlogListPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const posts = await prisma.post.findMany({
    where: { authorId: author.id, isPublished: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImageUrl: true,
      publishedAt: true,
    },
  });

  const authorName = author.displayName || author.name;

  return (
    <div className="min-h-screen">

      <PageBanner
        label={authorName}
        title="Blog & News"
        subtitle="Announcements, behind-the-scenes updates, and stories from the author."
        accentColor={accentColor}
      />

      {/* ── Posts ────────────────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden"
              >
                {/* Cover image */}
                {post.coverImageUrl ? (
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={post.coverImageUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div
                    className="h-44 w-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}12` }}
                  >
                    <Newspaper className="h-10 w-10" style={{ color: `${accentColor}60` }} />
                  </div>
                )}

                {/* Text */}
                <div className="flex flex-col flex-1 p-5 space-y-2">
                  {post.publishedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  )}
                  <h2 className="font-bold text-gray-900 leading-snug group-hover:text-[var(--accent)] transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">{post.excerpt}</p>
                  )}
                  <div className="pt-2 mt-auto">
                    <span
                      className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                      style={{ color: accentColor }}
                    >
                      Read more <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
