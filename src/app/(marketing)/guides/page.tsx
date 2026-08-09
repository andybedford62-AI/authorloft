import type { Metadata } from "next";
import Link from "next/link";
import { getOgImage } from "@/lib/seo-config";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { GuidesIndexClient } from "@/components/marketing/guides-index-client";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("guides");
  return {
    title: "Author Guides — Learn to Own Your Author Business",
    description: "In-depth guides on author websites, direct book sales, newsletters, ARCs, branding, and everything independent authors need to succeed.",
    alternates: {
      canonical: "/guides",
      types: { "application/rss+xml": [{ url: "/guides/rss.xml", title: "AuthorLoft Guides" }] },
    },
    openGraph: {
      type: "website",
      title: "Author Guides | AuthorLoft",
      description: "In-depth guides on author websites, direct book sales, newsletters, ARCs, branding, and more.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft Author Guides" }],
    },
    twitter: { card: "summary_large_image", title: "Author Guides | AuthorLoft", images: [ogImage] },
  };
}

// Pillars appear in this order; any category not listed here is appended after, alphabetically.
const PILLAR_ORDER = [
  "Getting Started",
  "Author Websites",
  "Book Marketing",
  "Direct Sales",
  "Email Marketing",
  "ARC Management",
  "SEO for Authors",
  "AI for Authors",
  "Author Platform",
  "Self-Publishing",
  "Comparisons",
];

export default async function GuidesIndexPage() {
  const guides = await prisma.guide.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, category: true },
  }).catch(() => []);

  const categories = [...new Set(guides.map((g) => g.category).filter(Boolean))];

  const pillars = [...categories].sort((a, b) => {
    const ai = PILLAR_ORDER.indexOf(a);
    const bi = PILLAR_ORDER.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Learn", item: `${BASE}/guides` },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Learn",
    description: "In-depth guides on author websites, direct book sales, newsletters, ARCs, branding, and everything independent authors need to succeed.",
    url: `${BASE}/guides`,
    isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: BASE },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDE4" }}>
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Learn"
        title={<>Learn to own <span className="italic text-[#D4AE6A]">your author business</span></>}
        subtitle="In-depth guides covering everything independent authors need — from building your website to selling direct and growing your audience."
      />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px 96px" }}>
        {guides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-[#9b8e7e]">Guides coming soon. Check back shortly!</p>
          </div>
        ) : (
          <GuidesIndexClient guides={guides} pillars={pillars} />
        )}

        {/* CTA */}
        <div className="mt-16 bg-[#1B2B47] rounded-2xl p-8 text-center">
          <p className="text-sm font-mono uppercase tracking-widest text-[#D4AE6A] mb-3">&middot; Ready to start your business? &middot;</p>
          <h2 className="font-serif text-2xl text-[#E8E5DD] font-normal mb-4">
            Own your author business <span className="italic text-[#D4AE6A]">starting today</span>
          </h2>
          <p className="text-sm text-[#D4DDEB] mb-6 max-w-sm mx-auto">
            Keep 100 % of every sale and own every reader relationship — no middleman.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }} />
    </div>
  );
}
