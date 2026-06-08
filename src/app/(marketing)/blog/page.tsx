import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Clock, ArrowRight, BookOpen } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("blog");
  return {
    title: "Blog — AuthorLoft",
    description: "Tips, guides, and insights for independent authors on selling books, building an audience, and publishing direct.",
    alternates: { canonical: "/blog" },
    openGraph: {
      type:        "website",
      title:       "Blog — AuthorLoft",
      description: "Tips, guides, and insights for independent authors on selling books, building an audience, and publishing direct.",
      images:      [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft Blog" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Blog — AuthorLoft",
      description: "Tips, guides, and insights for independent authors on selling books, building an audience, and publishing direct.",
      images:      [ogImage],
    },
  };
}

async function getPosts() {
  return prisma.platformPost.findMany({
    where:   { isPublished: true, isNews: false },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, title: true, slug: true, excerpt: true, coverImageUrl: true,
      category: true, authorName: true, readTimeMinutes: true, publishedAt: true,
    },
  }).catch(() => []);
}

export default async function BlogIndexPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <MarketingNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#C26A4A] mb-3">· From the team ·</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#1B2B47] font-normal leading-tight">
            The AuthorLoft <span className="italic text-[#C26A4A]">Blog</span>
          </h1>
          <p className="mt-4 text-base text-[#5C6E89] max-w-xl">
            Guides, strategies, and insights for independent authors building a direct connection with readers.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#DCDBD3]">
            <BookOpen className="h-10 w-10 text-[#D4DDEB] mx-auto mb-4" />
            <p className="text-[#5C6E89]">Posts coming soon. Check back shortly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`group block bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-md transition-shadow ${
                  i === 0 ? "md:col-span-2" : ""
                }`}
              >
                {post.coverImageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={post.coverImageUrl}
                    alt={post.title}
                    className={`w-full object-cover ${i === 0 ? "h-64 sm:h-80" : "h-44"}`}
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
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
                    i === 0 ? "text-2xl sm:text-3xl" : "text-xl"
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
            ))}
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-[#1B2B47] py-16 px-4 text-center mt-16">
        <p className="text-sm font-mono uppercase tracking-widest text-[#D4AE6A] mb-4">· Ready to start? ·</p>
        <h2 className="font-serif text-3xl text-[#E8E5DD] font-normal mb-6">
          Build your author site <span className="italic text-[#D4AE6A]">in minutes</span>
        </h2>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
