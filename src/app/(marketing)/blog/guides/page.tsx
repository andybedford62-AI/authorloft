import type { Metadata } from "next";
import Link from "next/link";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { listHeyCatchArticles, HEYCATCH_REVALIDATE } from "@/lib/heycatch";
import { Clock, BookOpen, ArrowLeft } from "lucide-react";

export const revalidate = HEYCATCH_REVALIDATE;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;
const PER_PAGE = 20;

export const metadata: Metadata = {
  title: "Guides for Independent Authors",
  description: "In-depth articles on selling books direct, building an audience, and running an author business.",
  alternates: { canonical: `${BASE}/blog/guides` },
  openGraph: {
    type: "website",
    title: "Guides for Independent Authors — AuthorLoft",
    description: "In-depth articles on selling books direct, building an audience, and running an author business.",
  },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "";

export default async function GuidesIndexPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const articles = await listHeyCatchArticles();
  const pages = Math.max(1, Math.ceil(articles.length / PER_PAGE));
  const page = Math.min(pages, Math.max(1, Number(pageParam) || 1));
  const visible = articles.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-vault-bg">
      <MarketingNav />

      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-vault-mute hover:text-vault-gold transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Blog
        </Link>

        <p className="text-sm font-mono uppercase tracking-widest text-vault-gold mb-3">· Guides ·</p>
        <h1 className="font-vault-display italic text-4xl sm:text-5xl text-vault-ink font-normal mb-10">
          Guides for <span className="italic text-vault-gold">independent authors</span>
        </h1>

        {visible.length === 0 ? (
          <div className="text-center py-24 bg-vault-surf rounded-2xl border border-vault-ink/12">
            <BookOpen className="h-10 w-10 text-vault-mute mx-auto mb-4" />
            <p className="text-vault-mute">No articles yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-vault-ink/12 border-y border-vault-ink/12">
            {visible.map((a) => (
              <li key={a.slug} className="py-5">
                <Link href={`/blog/guides/${encodeURIComponent(a.slug)}`} className="group block">
                  <h2 className="text-xl font-semibold text-vault-ink group-hover:text-vault-gold transition-colors">{a.title}</h2>
                  <p className="mt-1.5 flex items-center gap-3 text-xs text-vault-mute">
                    {a.published && <time dateTime={a.published}>{fmt(a.published)}</time>}
                    {a.read_time ? (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.read_time} min read</span>
                    ) : null}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={page === 2 ? "/blog/guides" : `/blog/guides?page=${page - 1}`} className="text-vault-gold hover:underline">← Newer</Link>
            ) : <span />}
            <span className="text-vault-mute">Page {page} of {pages}</span>
            {page < pages ? (
              <Link href={`/blog/guides?page=${page + 1}`} className="text-vault-gold hover:underline">Older →</Link>
            ) : <span />}
          </nav>
        )}
      </div>
    </div>
  );
}
