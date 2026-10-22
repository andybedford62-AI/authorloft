import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { Clock, ArrowLeft, BookOpen } from "lucide-react";
import {
  getHeyCatchArticle, sanitizeHeyCatchHtml, splitForToc, RTL_LANGS,
} from "@/lib/heycatch";

export const revalidate = 120; // literal required by Next; matches HEYCATCH_REVALIDATE

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const article = await getHeyCatchArticle(slug);
  if (!article) return {};

  const description = article.meta_description ?? undefined;
  return {
    title: article.title,
    description,
    alternates: { canonical: `${BASE}/blog/guides/${encodeURIComponent(article.slug)}` },
    openGraph: { type: "article", title: article.title, description },
    twitter: { card: "summary", title: article.title, description },
  };
}

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

export default async function GuideArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = await getHeyCatchArticle(slug);

  if (article === null) notFound();

  if (article === undefined) {
    return (
      <div className="min-h-screen bg-[#16233d]">
        <MarketingNav />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <BookOpen className="h-10 w-10 text-[#93a0bc] mx-auto mb-4" />
          <p className="text-[#93a0bc] mb-6">This article is temporarily unavailable.</p>
          <Link href="/blog/guides" className="text-[#d6a94a] hover:underline">Back to guides</Link>
        </div>
      </div>
    );
  }

  const canonical = `${BASE}/blog/guides/${encodeURIComponent(article.slug)}`;
  const safe = sanitizeHeyCatchHtml(article.content_html ?? "");
  const { before, after, toc } = splitForToc(safe);

  const lang = article.language?.toLowerCase().split("-")[0];
  const langAttrs = lang && lang !== "en" ? { lang, dir: RTL_LANGS.has(lang) ? ("rtl" as const) : undefined } : {};

  const ld = article.jsonLd && typeof article.jsonLd === "object" && Object.keys(article.jsonLd).length > 0
    ? { ...article.jsonLd, ...(article.jsonLd.url ? {} : { url: canonical, mainEntityOfPage: canonical }) }
    : null;

  const tocBlock = toc.length > 0 && (
    <nav aria-label="Table of contents" className="my-8 rounded-xl border border-[rgba(243,236,219,0.12)] bg-[#1e2f4d] p-5">
      <h2 className="font-serif italic text-xl text-[#f3ecdb] font-normal mb-3">Table of contents</h2>
      <ul className="space-y-1.5 text-sm">
        {toc.map((t) => (
          <li key={t.id}><a href={`#${t.id}`} className="text-[#c7cede] hover:text-[#d6a94a] transition-colors">{t.text}</a></li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingNav />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12" {...langAttrs}>
        <Link href="/blog/guides" className="inline-flex items-center gap-1.5 text-sm text-[#93a0bc] hover:text-[#d6a94a] transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Guides
        </Link>

        <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#f3ecdb] leading-tight mb-5">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-10 pb-6 border-b border-[rgba(243,236,219,0.12)] text-xs text-[#93a0bc]">
          {article.published && <time dateTime={article.published}>{fmt(article.published)}</time>}
          {article.read_time ? (
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.read_time} min read</span>
          ) : null}
        </div>

        {before && (
          <div className="rich-content rich-content-invert text-[#c7cede]" dangerouslySetInnerHTML={{ __html: before }} />
        )}
        {tocBlock}
        {after && (
          <div className="rich-content rich-content-invert text-[#c7cede]" dangerouslySetInnerHTML={{ __html: after }} />
        )}
      </article>

      {ld && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }}
        />
      )}
    </div>
  );
}
