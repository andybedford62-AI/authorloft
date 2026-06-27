import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { FeatureMatrix } from "@/components/marketing/feature-matrix";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import { LANDING_PAGES, LANDING_PAGE_SLUGS } from "@/lib/landing-page-data";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("features");
  return {
    title: "Author Platform Features — Sales, Readers & Growth",
    description:
      "Everything indie authors need to own their business: direct sales, reader analytics, newsletter capture, custom domain, and AI tools. Compare FREE, STANDARD, and PREMIUM.",
    alternates: { canonical: "/features" },
    openGraph: {
      type:   "website",
      title:  "Author Platform Features — Sales, Readers & Growth | AuthorLoft",
      description: "Everything indie authors need to own their business: direct sales, reader analytics, newsletter capture, custom domain, and AI tools. Compare FREE, STANDARD, and PREMIUM.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft features" }],
    },
    twitter: {
      card:  "summary_large_image",
      title: "Author Platform Features — Sales, Readers & Growth | AuthorLoft",
      description: "Everything indie authors need to own their business: direct sales, reader analytics, newsletter capture, custom domain, and AI tools. Compare FREE, STANDARD, and PREMIUM.",
      images: [ogImage],
    },
  };
}

async function getActivePlans() {
  const [plans, config] = await Promise.all([
    prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      tier: true,
      description: true,
      featuresJson: true,
      monthlyPriceCents: true,
      annualPriceCents: true,
      featuredLabel: true,
      badgeColor: true,
      maxBooks: true,
      maxPosts: true,
      maxStorageMb: true,
      customDomain: true,
      salesEnabled: true,
      newsletter: true,
      analyticsEnabled: true,
      flipBooksLimit: true,
      audioEnabled: true,
      mediaKitEnabled: true,
      bookstoreListingEnabled: true,
      preOrdersEnabled: true,
      isDefault: true,
    },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.systemConfig.findUnique({ where: { id: "main" }, select: { defaultAiUsageCap: true } }),
  ]);
  return { plans, defaultAiUsageCap: config?.defaultAiUsageCap ?? 20 };
}

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const softwareAppLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AuthorLoft",
  url: BASE,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "The all-in-one platform for independent authors. Direct sales, reader analytics, newsletter capture, custom domains, AI writing tools, and bookstore discovery — all on one platform.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "Author website with book catalog, blog, and reader feedback — free forever.",
    },
    {
      "@type": "Offer",
      name: "Standard",
      price: "19.99",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description: "Direct sales, custom domain, newsletter, bookstore listing, AI tools, and more.",
    },
    {
      "@type": "Offer",
      name: "Premium",
      price: "79.99",
      priceCurrency: "USD",
      billingIncrement: "P1M",
      description: "Full analytics, media kit, audio previews, premium themes, and unlimited books.",
    },
  ],
  creator: { "@type": "Organization", name: "AuthorLoft" },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Features", item: `${BASE}/features` },
  ],
};

export default async function FeaturesPage() {
  const { plans, defaultAiUsageCap } = await getActivePlans().catch(() => ({ plans: [], defaultAiUsageCap: 20 }));

  return (
    <div className="min-h-screen bg-[#E8E5DD]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {/* Nav */}
      <MarketingNav activePage="features" />

      {/* Hero */}
      <MarketingPageHeader
        eyebrow="Features"
        title={<>Everything you need to <span className="italic text-[#D4AE6A]">own your business</span></>}
        subtitle="Every tool an independent author needs to publish, sell, and grow — compared across Free, Standard, and Premium."
        backgroundImage="/features-header.png"
      />
      <div className="bg-[#E8E5DD] border-b border-[#DCDBD3] px-4">
        <div className="max-w-5xl mx-auto py-3">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-[#C26A4A] hover:text-[#1B2B47] font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
        </div>
      </div>

      {/* Feature Matrix */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        {plans.length > 0 ? (
          <FeatureMatrix plans={plans} defaultAiUsageCap={defaultAiUsageCap} />
        ) : (
          <div className="text-center py-20 text-[#8993A4]">
            <p>Feature data is being loaded. Check back soon.</p>
          </div>
        )}
      </section>

      {/* Compare link */}
      <section className="px-4 pb-12 max-w-5xl mx-auto text-center">
        <Link
          href="/pricing#comparison"
          className="inline-flex items-center gap-2 text-sm text-[#C26A4A] hover:text-[#1B2B47] font-medium transition-colors"
        >
          See how AuthorLoft compares to the competition →
        </Link>
      </section>

      {/* Feature deep dives */}
      <section className="px-4 pb-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-[#1B2B47] mb-2 text-center" style={{ fontFamily: "Georgia, serif" }}>
          Explore each feature in depth
        </h2>
        <p className="text-sm text-[#5C6E89] text-center mb-8">
          Learn how each AuthorLoft capability helps you build your author business.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LANDING_PAGE_SLUGS.map((slug) => {
            const page = LANDING_PAGES[slug];
            return (
              <Link
                key={slug}
                href={`/${slug}`}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-[#B8893D] hover:shadow-md transition-all"
              >
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#B8893D] mb-1">
                  {page.eyebrow}
                </p>
                <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
                  {page.metaDescription}
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C26A4A] group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#1B2B47] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#E8E5DD]">Ready to get started?</h2>
          <p className="text-[#5C6E89]">
            All plans start with a free account. Upgrade anytime from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link
              href="/register"
              className="bg-[#B8893D] text-[#0F1A2D] font-semibold px-6 py-3 rounded-lg hover:bg-[#D4AE6A] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="border border-[#E8E5DD] text-[#E8E5DD] font-semibold px-6 py-3 rounded-lg hover:bg-[#E8E5DD] hover:text-[#1B2B47] transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Have questions CTA */}
      <section className="py-8 px-4 text-center bg-[#E8E5DD]">
        <p className="text-sm text-[#8993A4]">
          Have questions about AuthorLoft?{" "}
          <Link href="/contact" className="text-[#C26A4A] hover:text-[#1B2B47] font-medium transition-colors">
            Contact us →
          </Link>
        </p>
      </section>

      {/* Footer */}
      {/* Footer is rendered once by the marketing layout (MarketingFooter) */}
    </div>
  );
}
