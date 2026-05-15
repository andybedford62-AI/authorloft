import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PricingSection } from "@/components/marketing/pricing-section";
import type { Metadata } from "next";

export const revalidate = 3600; // fallback: refresh at most every hour

export const metadata: Metadata = {
  title: "Pricing | AuthorLoft",
  description:
    "Simple, transparent pricing for every author. Start free and upgrade when you're ready to grow.",
  openGraph: {
    type:        "website",
    title:       "AuthorLoft Pricing — Free Plan Available",
    description: "Simple, transparent pricing for every author. Start free and upgrade when you're ready to grow.",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AuthorLoft Pricing — Free Plan Available",
    description: "Simple, transparent pricing for every author. Start free and upgrade when you're ready to grow.",
  },
};

async function getActivePlans() {
  return prisma.plan.findMany({
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
  });
}

// Feature comparison table rows
const COMPARISON_ROWS = [
  { label: "Books",              free: "Up to 5",   standard: "Unlimited",  premium: "Unlimited"  },
  { label: "Blog posts",         free: "Up to 5",   standard: "Unlimited",  premium: "Unlimited"  },
  { label: "AuthorLoft subdomain",free: "✓",         standard: "✓",          premium: "✓"          },
  { label: "Custom domain",      free: "—",         standard: "✓",          premium: "✓"          },
  { label: "Newsletter capture", free: "✓",         standard: "✓",          premium: "✓"          },
  { label: "Newsletter campaigns",free: "—",        standard: "✓",          premium: "✓"          },
  { label: "Direct digital sales",free: "—",        standard: "✓",          premium: "✓"          },
  { label: "Flip book previews", free: "—",         standard: "✓",          premium: "✓"          },
  { label: "Sales analytics",    free: "—",         standard: "—",          premium: "✓"          },
  { label: "Contact form",       free: "✓",         standard: "✓",          premium: "✓"          },
  { label: "Support",            free: "Community", standard: "Priority",   premium: "Priority"   },
];

export default async function PricingPage() {
  const plans = await getActivePlans().catch(() => []);

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/AL_site_Logo-Blue.png" alt="AuthorLoft" width={160} height={48} className="h-10 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-blue-600">Pricing</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">Sign In</Link>
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
      <section className="py-16 sm:py-20 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Start free with no credit card. Upgrade when you're ready to grow your author platform.
          </p>
        </div>
      </section>

      {/* Pricing cards — live from DB */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        {plans.length > 0 ? (
          <PricingSection plans={plans} fullPage />
        ) : (
          // Fallback if DB has no plans yet
          <div className="text-center py-20 text-gray-400">
            <p>Pricing plans are being set up. Check back soon.</p>
          </div>
        )}
      </section>

      {/* See All Features CTA */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-gray-600 mb-4">Want to see the complete feature breakdown?</p>
          <Link
            href="/features"
            target="_blank"
            className="inline-block bg-blue-100 text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-200 transition-colors"
          >
            See All Features →
          </Link>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Quick feature comparison
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 font-medium text-gray-500 w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-gray-700">Free</th>
                  <th className="text-center px-6 py-4 font-semibold text-blue-600 bg-blue-50">Standard</th>
                  <th className="text-center px-6 py-4 font-semibold text-purple-600">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {COMPARISON_ROWS.map(({ label, free, standard, premium }) => (
                  <tr key={label} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{label}</td>
                    <td className="px-6 py-3.5 text-center text-gray-500">{free}</td>
                    <td className="px-6 py-3.5 text-center text-gray-700 bg-blue-50/50">{standard}</td>
                    <td className="px-6 py-3.5 text-center text-gray-700">{premium}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-gray-50">
                  <td className="px-6 py-4" />
                  <td className="px-6 py-4 text-center">
                    <Link href="/register" className="text-sm font-semibold text-blue-600 hover:underline">
                      Get started →
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center bg-blue-50/50">
                    <Link href="/register?plan=standard" className="text-sm font-semibold text-blue-600 hover:underline">
                      Start free → Standard
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/register?plan=premium" className="text-sm font-semibold text-purple-600 hover:underline">
                      Start free → Premium
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            All plans begin with a free account. Verify your email, then upgrade to Standard or Premium anytime from your dashboard — takes under 2 minutes.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image src="/AL_site_Logo-Dark_footer.png" alt="AuthorLoft" width={140} height={40} className="h-8 w-auto" />
          </div>
          <p className="text-sm">© {new Date().getFullYear()} AuthorLoft. Built for authors.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
