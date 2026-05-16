import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { FeatureMatrix } from "@/components/marketing/feature-matrix";
import type { Metadata } from "next";

export const revalidate = 3600; // refresh at most every hour

export const metadata: Metadata = {
  title: "Author Website Features — Books, Sales & Newsletter | AuthorLoft",
  description:
    "Everything indie authors need: book catalog, direct sales, newsletter capture, custom domain, flip books, and AI writing tools. Compare FREE, STANDARD, and PREMIUM.",
  openGraph: {
    type: "website",
    title: "Author Website Features — Books, Sales & Newsletter | AuthorLoft",
    description: "Everything indie authors need: book catalog, direct sales, newsletter capture, custom domain, flip books, and AI writing tools. Compare FREE, STANDARD, and PREMIUM.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Author Website Features — Books, Sales & Newsletter | AuthorLoft",
    description: "Everything indie authors need: book catalog, direct sales, newsletter capture, custom domain, flip books, and AI writing tools. Compare FREE, STANDARD, and PREMIUM.",
  },
};

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
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/AL_site_Logo-Blue.png"
              alt="AuthorLoft"
              width={160}
              height={48}
              className="h-10 w-auto"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
          </nav>
          <Link
            href="/register"
            className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to pricing
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-4">
            Complete Feature Comparison
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            See all the features available on each plan. Everything updates automatically as we add new features.
          </p>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="px-4 py-16 max-w-5xl mx-auto">
        {plans.length > 0 ? (
          <FeatureMatrix plans={plans} defaultAiUsageCap={defaultAiUsageCap} />
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p>Feature data is being loaded. Check back soon.</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-blue-50 py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Ready to get started?</h2>
          <p className="text-gray-600">
            All plans start with a free account. Upgrade anytime from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <Link
              href="/register"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="border border-gray-300 text-gray-900 font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image
              src="/AL_site_Logo-Dark_footer.png"
              alt="AuthorLoft"
              width={140}
              height={40}
              className="h-8 w-auto"
            />
          </div>
          <p className="text-sm">© {new Date().getFullYear()} AuthorLoft. Built for authors.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
