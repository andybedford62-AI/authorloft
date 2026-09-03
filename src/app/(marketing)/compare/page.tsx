import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { CompareHubTabs } from "@/components/marketing/compare-hub-tabs";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  return {
    title: "Compare AuthorLoft — Books, Courses & Music Platforms",
    description:
      "See how AuthorLoft compares to the platforms authors, course creators, and musicians already use — Tertulia, Quilltips, Teachable, Kajabi, Linktree, Bandzoogle, and more.",
    alternates: { canonical: "/compare" },
    openGraph: {
      type: "website",
      title: "Compare AuthorLoft — Books, Courses & Music Platforms",
      description: "How AuthorLoft stacks up against the platforms authors, course creators, and musicians already use, category by category.",
    },
  };
}

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${BASE}/pricing` },
    { "@type": "ListItem", position: 3, name: "Compare", item: `${BASE}/compare` },
  ],
};

export default function CompareHubPage() {
  return (
    <div className="min-h-screen bg-[#16233d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Comparison"
        title={<>See how AuthorLoft <span className="italic text-[#d6a94a]">stacks up</span></>}
        subtitle="One platform for books, courses, and music — compared against the specialists for each, category by category."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm text-[#93a0bc] hover:text-[#d6a94a] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </Link>

        <CompareHubTabs />

        <p className="text-xs text-[#6b7a9c] mt-8 max-w-2xl">
          Feature availability current as of publish date and subject to change on either side — verify specifics directly with each platform before switching.
        </p>
      </div>
    </div>
  );
}
