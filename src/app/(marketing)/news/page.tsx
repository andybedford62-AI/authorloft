import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";
import { Clock, ArrowRight, Megaphone } from "lucide-react";

export const revalidate = 60;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const metadata: Metadata = {
  title: "AuthorLoft News — Updates, Features & Announcements",
  description:
    "The latest from AuthorLoft: product updates, new features, specials, and events. Read current and past announcements from the team.",
  alternates: { canonical: `${BASE}/news` },
  openGraph: {
    type: "website",
    title: "AuthorLoft News — Updates, Features & Announcements",
    description: "Product updates, new features, specials, and events from the AuthorLoft team.",
    url: `${BASE}/news`,
  },
  twitter: {
    card: "summary_large_image",
    title: "AuthorLoft News — Updates, Features & Announcements",
    description: "Product updates, new features, specials, and events from the AuthorLoft team.",
  },
};

async function getNewsPosts() {
  return prisma.platformPost.findMany({
    where:   { isPublished: true, isNews: true },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true, title: true, slug: true, excerpt: true, coverImageUrl: true,
      category: true, readTimeMinutes: true, publishedAt: true,
    },
  }).catch(() => []);
}

export default async function NewsIndexPage() {
  const posts = await getNewsPosts();

  // Group by year for an archive feel
  type NewsItem = (typeof posts)[number];
  const groups = new Map<string, NewsItem[]>();
  for (const p of posts) {
    const year = p.publishedAt ? new Date(p.publishedAt).getFullYear().toString() : "Earlier";
    const bucket = groups.get(year) ?? [];
    bucket.push(p);
    groups.set(year, bucket);
  }
  const years = Array.from(groups.keys());

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "AuthorLoft News",
    description: "Product updates, new features, specials, and events from AuthorLoft.",
    url: `${BASE}/news`,
    isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: BASE },
  };

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <MarketingNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-mono uppercase tracking-widest text-[#C26A4A] mb-3">· From the team ·</p>
          <h1 className="text-4xl sm:text-5xl font-serif text-[#1B2B47] font-normal leading-tight">
            AuthorLoft <span className="italic text-[#C26A4A]">News</span>
          </h1>
          <p className="mt-4 text-base text-[#5C6E89] max-w-xl">
            Product updates, new features, specials, and events — everything happening at AuthorLoft.
          </p>
        </div>

        {/* Subscribe box */}
        <div className="mb-12">
          <NewsSubscribeForm source="news" variant="box" />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#DCDBD3]">
            <Megaphone className="h-10 w-10 text-[#D4DDEB] mx-auto mb-4" />
            <p className="text-[#5C6E89]">No news yet — check back soon for updates.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {years.map((year) => (
              <section key={year}>
                <h2 className="font-serif text-2xl text-[#1B2B47] mb-5 pb-2 border-b border-[#DCDBD3]">{year}</h2>
                <div className="space-y-4">
                  {groups.get(year)!.map((post) => (
                    <Link
                      key={post.id}
                      href={`/news/${post.slug}`}
                      className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-md transition-shadow p-5"
                    >
                      {post.coverImageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={post.coverImageUrl}
                          alt={post.title}
                          className="w-full sm:w-48 h-40 sm:h-32 object-cover rounded-xl flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          {post.category && (
                            <span className="text-xs font-mono uppercase tracking-wider text-[#C26A4A] bg-[#C26A4A]/10 px-2.5 py-1 rounded-full">
                              {post.category}
                            </span>
                          )}
                          <span className="text-xs text-[#9b8e7e]">
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                              : ""}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-[#9b8e7e]">
                            <Clock className="h-3 w-3" /> {post.readTimeMinutes} min
                          </span>
                        </div>
                        <h3 className="font-serif text-xl text-[#1B2B47] leading-snug mb-1 group-hover:text-[#C26A4A] transition-colors">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-sm text-[#5C6E89] leading-relaxed line-clamp-2">{post.excerpt}</p>
                        )}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#C26A4A] group-hover:gap-2 transition-all">
                          Read more <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
    </div>
  );
}
