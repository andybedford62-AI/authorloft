import type { Metadata } from "next";
import Link from "next/link";
import { getOgImage } from "@/lib/seo-config";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
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
  "Author Websites",
  "Direct Sales",
  "Email Marketing",
  "Book Marketing",
  "Author Platform",
  "Self-Publishing",
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

  const guidesByPillar = pillars.map((pillar) => ({
    pillar,
    items: guides.filter((g) => g.category === pillar),
  }));

  const uncategorized = guides.filter((g) => !g.category);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Guides", item: `${BASE}/guides` },
    ],
  };

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Author Guides",
    description: "In-depth guides on author websites, direct book sales, newsletters, ARCs, branding, and everything independent authors need to succeed.",
    url: `${BASE}/guides`,
    isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: BASE },
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDE4" }}>
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Author Guides"
        title={<>Learn to own <span className="italic text-[#D4AE6A]">your author business</span></>}
        subtitle="In-depth guides covering everything independent authors need — from building your website to selling direct and growing your audience."
      />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 20px 96px" }}>
        {/* Jump-to pillar nav */}
        {pillars.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-14">
            {pillars.map((pillar) => (
              <a
                key={pillar}
                href={`#${pillar.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-xs font-mono uppercase tracking-wider text-[#9b8e7e] bg-white/60 px-3 py-1.5 rounded-full border border-[#DCDBD3] hover:text-[#C26A4A] hover:border-[#C26A4A]/40 transition-colors"
              >
                {pillar}
              </a>
            ))}
          </div>
        )}

        {guides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-[#9b8e7e]">Guides coming soon. Check back shortly!</p>
          </div>
        ) : (
          <div className="space-y-16">
            {guidesByPillar.map(({ pillar, items }) => (
              <div key={pillar} id={pillar.toLowerCase().replace(/[^a-z0-9]+/g, "-")} className="scroll-mt-24">
                <h2 className="font-serif text-2xl text-[#1B2B47] font-normal mb-6 pb-3 border-b border-[#DCDBD3]">
                  {pillar}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              </div>
            ))}

            {uncategorized.length > 0 && (
              <div>
                <h2 className="font-serif text-2xl text-[#1B2B47] font-normal mb-6 pb-3 border-b border-[#DCDBD3]">
                  More Guides
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {uncategorized.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                </div>
              </div>
            )}
          </div>
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

type GuideCardData = { id: string; title: string; slug: string; excerpt: string; coverImageUrl: string | null; category: string };

function GuideCard({ guide }: { guide: GuideCardData }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden hover:shadow-lg hover:border-[#C26A4A]/40 transition-all"
    >
      {guide.coverImageUrl && (
        <div className="h-44 bg-[#F0EDE4] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={guide.coverImageUrl} alt={guide.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-5">
        {guide.category && (
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#C26A4A] mb-2 block">{guide.category}</span>
        )}
        <h3 className="font-serif text-xl text-[#1B2B47] font-normal mb-2 group-hover:text-[#C26A4A] transition-colors leading-snug">
          {guide.title}
        </h3>
        {guide.excerpt && (
          <p className="text-sm text-[#5C6E89] leading-relaxed line-clamp-3">{guide.excerpt}</p>
        )}
        <span className="inline-flex items-center gap-1 text-sm text-[#C26A4A] font-medium mt-3">
          Read guide <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </Link>
  );
}
