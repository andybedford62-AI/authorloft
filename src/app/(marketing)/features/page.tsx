import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { FeatureMatrix } from "@/components/marketing/feature-matrix";
import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("features");
  return {
    title: "Author Website Features — Books, Sales & Newsletter | AuthorLoft",
    description:
      "Everything indie authors need: book catalog, direct sales, newsletter capture, custom domain, flip books, and AI writing tools. Compare FREE, STANDARD, and PREMIUM.",
    alternates: { canonical: "/features" },
    openGraph: {
      type:   "website",
      title:  "Author Website Features — Books, Sales & Newsletter | AuthorLoft",
      description: "Everything indie authors need: book catalog, direct sales, newsletter capture, custom domain, flip books, and AI writing tools. Compare FREE, STANDARD, and PREMIUM.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft features" }],
    },
    twitter: {
      card:  "summary_large_image",
      title: "Author Website Features — Books, Sales & Newsletter | AuthorLoft",
      description: "Everything indie authors need: book catalog, direct sales, newsletter capture, custom domain, flip books, and AI writing tools. Compare FREE, STANDARD, and PREMIUM.",
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
      mediaKitEnabled: true,
      isDefault: true,
    },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.systemConfig.findUnique({ where: { id: "main" }, select: { defaultAiUsageCap: true } }),
  ]);
  return { plans, defaultAiUsageCap: config?.defaultAiUsageCap ?? 20 };
}

export default async function FeaturesPage() {
  const { plans, defaultAiUsageCap } = await getActivePlans().catch(() => ({ plans: [], defaultAiUsageCap: 20 }));

  return (
    <div className="min-h-screen bg-[#E8E5DD]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#E8E5DD] border-b border-[#DCDBD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/authorloft-logo-new.png"
              alt="AuthorLoft"
              width={200}
              height={57}
              className="h-14 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-[#5C6E89] hover:text-[#1B2B47] transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-[#5C6E89] hover:text-[#1B2B47] transition-colors">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-[#5C6E89] hover:text-[#1B2B47] transition-colors">
              Sign In
            </Link>
          </nav>
          <Link
            href="/register"
            className="bg-[#B8893D] text-[#0F1A2D] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#D4AE6A] transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-blue-50 to-white px-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-sm text-[#C26A4A] hover:text-[#1B2B47] font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1B2B47] mt-4">
            Complete Feature Comparison
          </h1>
          <p className="text-lg text-[#5C6E89] max-w-2xl">
            See all the features available on each plan. Everything updates automatically as we add new features.
          </p>
        </div>
      </section>

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

      {/* CTA Section */}
      <section className="bg-[#1B2B47] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#1B2B47]">Ready to get started?</h2>
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
