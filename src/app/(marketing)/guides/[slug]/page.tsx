import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { sanitize } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

type FaqItem = { question: string; answer: string };

function parseFaqs(json: string | null): FaqItem[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

function parseSlugs(json: string | null): string[] {
  if (!json) return [];
  try { return JSON.parse(json); } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({
    where: { slug },
    select: { title: true, slug: true, excerpt: true, coverImageUrl: true, isPublished: true, seoTitle: true, metaDescription: true, focusKeyword: true },
  }).catch(() => null);
  if (!guide || !guide.isPublished) return {};

  const metaTitle = guide.seoTitle || guide.title;
  const metaDesc = guide.metaDescription || guide.excerpt || undefined;

  return {
    title: metaTitle,
    description: metaDesc,
    alternates: { canonical: `${BASE}/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: metaTitle,
      description: metaDesc,
      images: guide.coverImageUrl ? [{ url: guide.coverImageUrl }] : undefined,
      authors: ["AuthorLoft"],
      ...(guide.focusKeyword && { tags: [guide.focusKeyword] }),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDesc,
      images: guide.coverImageUrl ? [guide.coverImageUrl] : undefined,
    },
  };
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await prisma.guide.findUnique({ where: { slug } }).catch(() => null);
  if (!guide || !guide.isPublished) notFound();

  const faqs = parseFaqs(guide.faqsJson);
  const relatedSlugs = parseSlugs(guide.relatedSlugsJson);
  const safeContent = sanitize(guide.content);

  const plainText = guide.content.replace(/<[^>]+>/g, "").trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  const relatedPosts = relatedSlugs.length > 0
    ? await prisma.platformPost.findMany({
        where: { slug: { in: relatedSlugs }, isPublished: true, isNews: false },
        select: { title: true, slug: true, excerpt: true, coverImageUrl: true, category: true },
        orderBy: { publishedAt: "desc" },
      }).catch(() => [])
    : [];

  const articleLd = {
    "@context":         "https://schema.org",
    "@type":            "Article",
    headline:           guide.seoTitle || guide.title,
    name:               guide.title,
    description:        guide.metaDescription || guide.excerpt || undefined,
    image:              guide.coverImageUrl || undefined,
    datePublished:      guide.publishedAt?.toISOString(),
    dateModified:       guide.updatedAt.toISOString(),
    author:             { "@type": "Organization", name: "AuthorLoft" },
    publisher:          { "@type": "Organization", name: "AuthorLoft", url: BASE, logo: { "@type": "ImageObject", url: `${BASE}/authorloft-logo.png` } },
    mainEntityOfPage:   { "@type": "WebPage", "@id": `${BASE}/guides/${guide.slug}` },
    speakable:          { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rich-content"] },
    inLanguage:         "en-US",
    isAccessibleForFree: true,
    wordCount,
    ...(guide.focusKeyword && { keywords: guide.focusKeyword }),
    ...(guide.category && { articleSection: guide.category }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Learn", item: `${BASE}/guides` },
      { "@type": "ListItem", position: 3, name: guide.title, item: `${BASE}/guides/${guide.slug}` },
    ],
  };

  const faqLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]+>/g, "").trim() },
    })),
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2"] },
  } : null;

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <Link href="/guides" className="inline-flex items-center gap-1.5 text-sm text-[#93a0bc] hover:text-[#d6a94a] transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Learn
        </Link>

        {/* Category */}
        {guide.category && (
          <span className="text-xs font-mono uppercase tracking-wider text-[#d6a94a] bg-[#d6a94a]/10 px-2.5 py-1 rounded-full mb-5 inline-block">
            {guide.category}
          </span>
        )}

        {/* Title */}
        <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#f3ecdb] leading-tight mb-6">
          {guide.title}
        </h1>

        {/* Excerpt */}
        {guide.excerpt && (
          <p className="text-lg text-[#c7cede] leading-relaxed mb-8 border-l-4 border-[#d6a94a]/30 pl-4 italic">
            {guide.excerpt}
          </p>
        )}

        {/* Cover Image */}
        {guide.coverImageUrl && (
          <div className="w-full rounded-2xl h-64 sm:h-80 mb-10 border border-[rgba(243,236,219,0.12)] bg-[#1e2f4d] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guide.coverImageUrl}
              alt={guide.title}
              className="w-full h-full object-contain"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />

        {/* FAQs */}
        {faqs.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[rgba(243,236,219,0.12)]">
            <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-[#1e2f4d] rounded-xl border border-[rgba(243,236,219,0.12)] p-5">
                  <h3 className="font-semibold text-[#f3ecdb] mb-2">{faq.question}</h3>
                  <p className="text-sm text-[#93a0bc] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Blog Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[rgba(243,236,219,0.12)]">
            <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex gap-3 bg-[#1e2f4d] rounded-xl border border-[rgba(243,236,219,0.12)] p-4 hover:border-[#d6a94a]/40 hover:shadow-md transition-all"
                >
                  {post.coverImageUrl ? (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-[#16233d]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-[#16233d] flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-[#93a0bc]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#f3ecdb] group-hover:text-[#d6a94a] transition-colors line-clamp-2">{post.title}</h3>
                    {post.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#93a0bc] mt-1 block">{post.category}</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-[#243756] rounded-2xl p-8 text-center">
          <p className="text-sm font-mono uppercase tracking-widest text-[#d6a94a] mb-3">
            &middot; {guide.ctaTitle || "Ready to start your business?"} &middot;
          </p>
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">
            {guide.ctaDescription || <>Own your author business <span className="italic text-[#d6a94a]">starting today</span></>}
          </h2>
          <p className="text-sm text-[#93a0bc] mb-6 max-w-sm mx-auto">
            Keep 100 % of every sale and own every reader relationship — no middleman.
          </p>
          <Link
            href={guide.ctaButtonUrl || "/register"}
            className="inline-flex items-center gap-2 bg-[#d6a94a] text-[#16233d] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
          >
            {guide.ctaButtonText || "Get Started Free"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
    </div>
  );
}
