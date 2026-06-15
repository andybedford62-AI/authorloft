import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";
import { NewsList } from "@/components/marketing/news-list";

export const revalidate = 60;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export const metadata: Metadata = {
  title: "News — Updates, Features & Announcements",
  description:
    "The latest from AuthorLoft: product updates, new features, specials, and events. Read current and past announcements from the team.",
  alternates: {
    canonical: `${BASE}/news`,
    types: { "application/rss+xml": [{ url: `${BASE}/news/rss.xml`, title: "AuthorLoft News" }] },
  },
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
  const rows = await getNewsPosts();
  const posts = rows.map((p) => ({ ...p, publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null }));

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

      <MarketingPageHeader
        eyebrow="From the team"
        title={<>AuthorLoft <span className="italic text-[#D4AE6A]">News</span></>}
        subtitle="Product updates, new features, specials, and events — everything happening at AuthorLoft."
        backgroundImage="/news-header.png"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Subscribe box */}
        <div className="mb-12">
          <NewsSubscribeForm source="news" variant="box" />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-[#DCDBD3]">
            <p className="text-[#5C6E89]">No news yet — check back soon for updates.</p>
          </div>
        ) : (
          <NewsList posts={posts} />
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
    </div>
  );
}
