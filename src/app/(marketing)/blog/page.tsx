import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { BlogList } from "@/components/marketing/blog-list";
import { BookOpen, ArrowRight } from "lucide-react";

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
  const rows = await getPosts();
  const posts = rows.map((p) => ({ ...p, publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null }));

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <MarketingNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between gap-6">
          <div className="min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-[#C26A4A] mb-3">· From the team ·</p>
            <h1 className="text-4xl sm:text-5xl font-serif text-[#1B2B47] font-normal leading-tight">
              The AuthorLoft <span className="italic text-[#C26A4A]">Blog</span>
            </h1>
            <p className="mt-4 text-base text-[#5C6E89] max-w-xl">
              Guides, strategies, and insights for independent authors building a direct connection with readers.
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/blog-page-logo.png"
            alt="The AuthorLoft Blog"
            className="hidden md:block max-h-44 w-auto rounded-xl flex-shrink-0"
          />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#DCDBD3]">
            <BookOpen className="h-10 w-10 text-[#D4DDEB] mx-auto mb-4" />
            <p className="text-[#5C6E89]">Posts coming soon. Check back shortly.</p>
          </div>
        ) : (
          <BlogList posts={posts} />
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
