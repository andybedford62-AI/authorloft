import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { BlogIndex } from "@/components/marketing/blog-index";
import { BookOpen, ArrowRight } from "lucide-react";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("blog");
  return {
    title: "Blog — Tips & Guides for Authors",
    description: "Tips, guides, and insights for independent authors on selling books, building an audience, and publishing direct.",
    alternates: {
      canonical: "/blog",
      types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: "AuthorLoft Blog" }] },
    },
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
    <div className="min-h-screen bg-vault-bg">
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="From the team"
        title={<>The AuthorLoft <span className="italic text-vault-gold">Blog</span></>}
        subtitle="Guides, strategies, and insights for independent authors building a direct connection with readers."
        backgroundImage="/blog-header.png"
      />

      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12 sm:py-16">

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-vault-surf rounded-2xl border border-vault-ink/12">
            <BookOpen className="h-10 w-10 text-vault-mute mx-auto mb-4" />
            <p className="text-vault-mute">Posts coming soon. Check back shortly.</p>
          </div>
        ) : (
          <BlogIndex posts={posts} />
        )}
      </div>

      {/* Footer CTA */}
      <div className="bg-vault-surf-2 py-16 px-4 text-center mt-16">
        <p className="text-sm font-mono uppercase tracking-widest text-vault-gold mb-4">· Ready to start your business? ·</p>
        <h2 className="font-vault-display italic text-3xl text-vault-ink font-normal mb-6">
          Own your author business <span className="italic text-vault-gold">starting today</span>
        </h2>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-vault-gold text-vault-bg font-semibold px-6 py-3 rounded-vault hover:bg-vault-gold-light transition-colors"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
