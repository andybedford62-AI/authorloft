import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getOgImage } from "@/lib/seo-config";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { VaultSection, VaultCard, VaultButton } from "@/components/marketing/vault";
import { SOLUTION_CATEGORIES } from "@/lib/solution-categories";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("features");
  return {
    title: "Solutions — Every Way AuthorLoft Grows Your Author Business",
    description:
      "Twelve tools across four groups: your platform, selling and growth, marketing and tools, readers and analytics. Browse by category, or compare every feature side-by-side.",
    alternates: { canonical: "/solutions" },
    openGraph: {
      type: "website",
      title: "Solutions — Every Way AuthorLoft Grows Your Author Business",
      description: "Twelve tools across four groups, built for independent authors.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft Solutions" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Solutions — Every Way AuthorLoft Grows Your Author Business",
      images: [ogImage],
    },
  };
}

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Solutions", item: `${BASE}/solutions` },
  ],
};

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Solutions"
        title={<>Every way AuthorLoft <span className="italic text-vault-gold">grows your business</span></>}
        subtitle="Twelve tools, four groups. Pick a starting point below, or see the full side-by-side comparison."
      />

      {SOLUTION_CATEGORIES.map((cat, i) => (
        <VaultSection
          key={cat.id}
          id={cat.id}
          tone={i % 2 === 0 ? "bg" : "bg-deep"}
          eyebrow={cat.label}
          title={cat.description}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {cat.items.map((item) => (
              <Link key={item.slug} href={`/${item.slug}`} className="block group">
                <VaultCard className="p-5 h-full transition-colors group-hover:border-vault-gold">
                  <p className="text-base font-semibold text-vault-ink mb-1.5 group-hover:text-vault-gold transition-colors">
                    {item.label}
                  </p>
                  <p className="text-sm text-vault-mute leading-relaxed mb-3">{item.blurb}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-vault-gold">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </span>
                </VaultCard>
              </Link>
            ))}
          </div>
        </VaultSection>
      ))}

      <div className="max-w-[1100px] mx-auto px-7 py-16 text-left">
        <VaultButton href="/features" variant="primary">
          Compare every feature side-by-side <ArrowRight className="h-3.5 w-3.5" />
        </VaultButton>
      </div>
    </div>
  );
}
