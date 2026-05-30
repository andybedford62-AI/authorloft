import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Newspaper, FileDown } from "lucide-react";
import { PrintButton } from "./print-button";
import { sanitize } from "@/lib/sanitize";
import { prisma } from "@/lib/db";
import { getAuthorByDomain } from "@/lib/author-queries";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}): Promise<Metadata> {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);

  const post = await prisma.post.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
    select: { title: true, excerpt: true, coverImageUrl: true, createdAt: true, updatedAt: true, seoTitle: true, metaDescription: true },
  });

  if (!post) return { title: "Post Not Found" };

  const authorName   = author.displayName || author.name;
  const base         = getAuthorBaseUrl(author);
  const canonicalUrl = `${base}/blog/${slug}`;
  const ogImages     = post.coverImageUrl ? [{ url: post.coverImageUrl, alt: post.title }] : [];
  const metaTitle    = post.seoTitle        || post.title;
  const metaDesc     = post.metaDescription || post.excerpt;

  return {
    title:       metaTitle,
    description: metaDesc ?? undefined,
    alternates:  { canonical: canonicalUrl },
    openGraph: {
      type:        "article",
      title:       metaTitle,
      description: metaDesc ?? undefined,
      publishedTime: post.createdAt.toISOString(),
      modifiedTime:  post.updatedAt.toISOString(),
      authors:       [authorName],
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card:        ogImages.length > 0 ? "summary_large_image" : "summary",
      title:       metaTitle,
      description: metaDesc ?? undefined,
      ...(ogImages.length > 0 && { images: [ogImages[0].url] }),
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string }>;
}) {
  const { domain, slug } = await params;
  const author = await getAuthorByDomain(domain);
  const accentColor = author.accentColor;

  const post = await prisma.post.findFirst({
    where: { authorId: author.id, slug, isPublished: true },
  });

  if (!post) notFound();

  const hasHtmlContent = (post.content ?? "").trimStart().startsWith("<");
  const paragraphs = hasHtmlContent ? [] : (post.content ?? "").split(/\n\n+/).filter(Boolean);

  const authorName = author.displayName || author.name;
  const base       = getAuthorBaseUrl(author);

  const jsonLd = {
    "@context":       "https://schema.org",
    "@type":          "BlogPosting",
    headline:         post.title,
    description:      post.excerpt ?? undefined,
    image:            post.coverImageUrl ?? undefined,
    datePublished:    post.createdAt.toISOString(),
    dateModified:     post.updatedAt.toISOString(),
    url:              `${base}/blog/${post.slug}`,
    author: { "@type": "Person", name: authorName, url: base },
    publisher: { "@type": "Person", name: authorName, url: base },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: `${base}/blog/${post.slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    <div
      className="min-h-screen bg-white"
      style={{ "--accent": accentColor } as React.CSSProperties}
    >
      {/* ── Banner ───────────────────────────────────────────────────────── */}
      <section className="w-full py-12 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Newspaper className="h-5 w-5 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              News
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
            {post.title}
          </h1>
          {post.publishedAt && (
            <div className="flex items-center gap-2 mt-3 text-white/65 text-sm">
              <CalendarDays className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[var(--accent)] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to News
        </Link>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden mb-8 shadow-sm bg-gray-100">
            <Image
              src={post.coverImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Excerpt (lead paragraph) */}
        {post.excerpt && (
          <p className="text-lg text-gray-600 leading-relaxed font-medium border-l-4 pl-4 mb-8"
            style={{ borderColor: accentColor }}>
            {post.excerpt}
          </p>
        )}

        {/* Body */}
        {hasHtmlContent ? (
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: sanitize(post.content) }}
          />
        ) : paragraphs.length > 0 ? (
          <div className="space-y-5">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 italic">No content yet.</p>
        )}

        {/* ── Download + Print ─────────────────────────────────────────── */}
        <div className="mt-12 pt-8 border-t border-gray-100 space-y-4 no-print">

          {/* Downloadable resource — only shown if author added a link */}
          {post.attachmentUrl && (
            <a
              href={post.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border-2 hover:border-[var(--accent)] transition-colors group"
              style={{ borderColor: `${accentColor}40` }}
            >
              <div
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <FileDown className="h-5 w-5" style={{ color: accentColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-[var(--accent)] transition-colors">
                  {post.attachmentLabel || "Download Resource"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Free download — opens in a new tab
                </p>
              </div>
              <ArrowLeft className="h-4 w-4 text-gray-300 group-hover:text-[var(--accent)] transition-colors rotate-180 flex-shrink-0" />
            </a>
          )}

          {/* Print + Back row */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link href="/blog">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back to News
              </Button>
            </Link>
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
