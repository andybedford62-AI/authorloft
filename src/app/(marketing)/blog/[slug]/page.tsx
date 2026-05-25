import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.platformPost.findUnique({ where: { slug } }).catch(() => null);
  if (!post || !post.isPublished) return {};

  return {
    title:       `${post.title} — AuthorLoft Blog`,
    description: post.excerpt || undefined,
    alternates:  { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      type:        "article",
      title:       post.title,
      description: post.excerpt || undefined,
      images:      post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
    },
    twitter: {
      card:        "summary_large_image",
      title:       post.title,
      description: post.excerpt || undefined,
      images:      post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.platformPost.findUnique({ where: { slug } }).catch(() => null);

  if (!post || !post.isPublished) notFound();

  const safeContent = sanitize(post.content);

  const jsonLd = {
    "@context":         "https://schema.org",
    "@type":            "Article",
    headline:           post.title,
    description:        post.excerpt || undefined,
    image:              post.coverImageUrl || undefined,
    datePublished:      post.publishedAt?.toISOString(),
    dateModified:       post.updatedAt.toISOString(),
    author:             { "@type": "Organization", name: post.authorName },
    publisher:          { "@type": "Organization", name: "AuthorLoft", logo: { "@type": "ImageObject", url: `${BASE}/authorloft-logo.png` } },
    mainEntityOfPage:   { "@type": "WebPage", "@id": `${BASE}/blog/${post.slug}` },
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Breadcrumb */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#9b8e7e] hover:text-[#C26A4A] transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {post.category && (
            <span className="text-xs font-mono uppercase tracking-wider text-[#C26A4A] bg-[#C26A4A]/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-[#9b8e7e]">
            <Clock className="h-3 w-3" /> {post.readTimeMinutes} min read
          </span>
          {post.publishedAt && (
            <span className="text-xs text-[#9b8e7e]">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[#1B2B47] leading-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-[#5C6E89] leading-relaxed mb-8 border-l-4 border-[#C26A4A]/30 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full rounded-2xl object-cover h-64 sm:h-80 mb-10 border border-[#DCDBD3]"
          />
        )}

        {/* Author */}
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#DCDBD3]">
          <div className="w-8 h-8 rounded-full bg-[#1B2B47] flex items-center justify-center text-white text-sm font-serif font-normal">
            {post.authorName[0]}
          </div>
          <span className="text-sm text-[#5C6E89]">by <strong className="text-[#1B2B47] font-medium">{post.authorName}</strong></span>
        </div>

        {/* Content */}
        <div
          className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-[#1B2B47] prose-p:text-[#3d3328] prose-p:leading-relaxed prose-a:text-[#C26A4A] prose-a:no-underline hover:prose-a:underline prose-strong:text-[#1B2B47] prose-blockquote:border-l-[#C26A4A] prose-blockquote:text-[#5C6E89]"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* CTA */}
        <div className="mt-16 bg-[#1B2B47] rounded-2xl p-8 text-center">
          <p className="text-sm font-mono uppercase tracking-widest text-[#D4AE6A] mb-3">· Ready to start? ·</p>
          <h2 className="font-serif text-2xl text-[#E8E5DD] font-normal mb-4">
            Build your author site <span className="italic text-[#D4AE6A]">in minutes</span>
          </h2>
          <p className="text-sm text-[#D4DDEB] mb-6 max-w-sm mx-auto">
            Join thousands of independent authors selling direct to readers on AuthorLoft.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
