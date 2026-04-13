import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Newspaper } from "lucide-react";
import { prisma } from "@/lib/db";
import { getAuthorByDomain } from "@/lib/author-queries";
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
    select: { title: true, excerpt: true, coverImageUrl: true },
  });

  if (!post) return { title: "Post Not Found" };

  const ogImages = post.coverImageUrl
    ? [{ url: post.coverImageUrl, alt: post.title }]
    : [];

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      ...(ogImages.length > 0 && { images: ogImages }),
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

  return (
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
              Blog &amp; News
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
          Back to Blog
        </Link>

        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 shadow-sm bg-gray-100">
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
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
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

        {/* Back to blog */}
        <div className="mt-14 pt-8 border-t border-gray-100">
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
