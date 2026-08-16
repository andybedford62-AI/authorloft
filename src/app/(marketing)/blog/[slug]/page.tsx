import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Clock, ArrowLeft, ArrowRight, FileDown } from "lucide-react";
import { PrintButton } from "./print-button";
import { sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.platformPost.findUnique({ where: { slug }, select: { title: true, slug: true, excerpt: true, coverImageUrl: true, publishedAt: true, isPublished: true, isNews: true, seoTitle: true, metaDescription: true, authorName: true, category: true } }).catch(() => null);
  if (!post || !post.isPublished || post.isNews) return {};

  const metaTitle = post.seoTitle || post.title;
  const metaDesc  = post.metaDescription || post.excerpt || undefined;

  return {
    title:       metaTitle,
    description: metaDesc,
    alternates:  { canonical: `${BASE}/blog/${post.slug}` },
    openGraph: {
      type:          "article",
      title:         metaTitle,
      description:   metaDesc,
      images:        post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
      publishedTime: post.publishedAt?.toISOString(),
      authors:       [post.authorName],
      ...(post.category && { section: post.category }),
      ...(post.category && { tags: [post.category] }),
    },
    twitter: {
      card:        "summary_large_image",
      title:       metaTitle,
      description: metaDesc,
      images:      post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.platformPost.findUnique({ where: { slug } }).catch(() => null);

  // News posts live at /news/[slug] — don't render them under /blog
  if (!post || !post.isPublished || post.isNews) notFound();

  const safeContent = sanitize(post.content);
  const plainText = post.content.replace(/<[^>]+>/g, "").trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const jsonLd = {
    "@context":         "https://schema.org",
    "@type":            "BlogPosting",
    headline:           post.seoTitle || post.title,
    name:               post.title,
    description:        post.metaDescription || post.excerpt || undefined,
    image:              post.coverImageUrl || undefined,
    datePublished:      post.publishedAt?.toISOString(),
    dateModified:       post.updatedAt.toISOString(),
    author:             { "@type": "Organization", name: post.authorName },
    publisher:          { "@type": "Organization", name: "AuthorLoft", url: BASE, logo: { "@type": "ImageObject", url: `${BASE}/authorloft-logo.png` } },
    mainEntityOfPage:   { "@type": "WebPage", "@id": `${BASE}/blog/${post.slug}` },
    speakable:          { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rich-content"] },
    inLanguage:         "en-US",
    isAccessibleForFree: true,
    wordCount,
    ...(post.focusKeyword && { keywords: post.focusKeyword }),
    ...(post.category && { articleSection: post.category }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${BASE}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${BASE}/blog/${post.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        {/* Breadcrumb */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-[#93a0bc] hover:text-[#d6a94a] transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {post.category && (
            <span className="text-xs font-mono uppercase tracking-wider text-[#d6a94a] bg-[#d6a94a]/10 px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-[#93a0bc]">
            <Clock className="h-3 w-3" /> {post.readTimeMinutes} min read
          </span>
          {post.publishedAt && (
            <span className="text-xs text-[#93a0bc]">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#f3ecdb] leading-tight mb-6">
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-[#c7cede] leading-relaxed mb-8 border-l-4 border-[#d6a94a]/30 pl-4 italic">
            {post.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="w-full rounded-2xl h-64 sm:h-80 mb-10 border border-[rgba(243,236,219,0.12)] bg-[#1e2f4d] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Author */}
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[rgba(243,236,219,0.12)]">
          <div className="w-8 h-8 rounded-full bg-[#d6a94a] flex items-center justify-center text-[#16233d] text-sm font-serif font-normal">
            {post.authorName[0]}
          </div>
          <span className="text-sm text-[#93a0bc]">by <strong className="text-[#f3ecdb] font-medium">{post.authorName}</strong></span>
        </div>

        {/* Content */}
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* ── Download + Print ─────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-[rgba(243,236,219,0.12)] space-y-4 no-print">

          {/* Downloadable resource — only shown if a URL was set */}
          {post.attachmentUrl && (
            <a
              href={post.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border-2 border-[#d6a94a]/20 hover:border-[#d6a94a]/60 bg-[#1e2f4d] hover:bg-[#243756] transition-colors group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#d6a94a]/10 flex items-center justify-center">
                <FileDown className="h-5 w-5 text-[#d6a94a]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#f3ecdb] group-hover:text-[#d6a94a] transition-colors">
                  {post.attachmentLabel || "Download Resource"}
                </p>
                <p className="text-xs text-[#93a0bc] mt-0.5">Free download — opens in a new tab</p>
              </div>
              <ArrowRight className="h-4 w-4 text-[#93a0bc] group-hover:text-[#d6a94a] transition-colors flex-shrink-0" />
            </a>
          )}

          {/* Print button row */}
          <div className="flex justify-end">
            <PrintButton />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-[#243756] rounded-2xl p-8 text-center">
          <p className="text-sm font-mono uppercase tracking-widest text-[#d6a94a] mb-3">· Ready to start your business? ·</p>
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">
            Own your author business <span className="italic text-[#d6a94a]">starting today</span>
          </h2>
          <p className="text-sm text-[#93a0bc] mb-6 max-w-sm mx-auto">
            Keep 100% of every sale and own every reader relationship — no middleman.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#d6a94a] text-[#16233d] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </div>
  );
}
