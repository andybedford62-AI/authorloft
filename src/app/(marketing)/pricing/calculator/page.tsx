import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { SavingsCalculator } from "@/components/marketing/savings-calculator";
import { FALLBACK_PLANS, type CalcPlan, type TierKey } from "@/lib/savings-calculator-data";

export const revalidate = 60;

const TITLE = "Cost Savings Calculator — Build It Yourself vs. AuthorLoft";
const DESCRIPTION =
  "See what it would really cost, in dollars and hours, to build and run your own website for your books, courses or music — and how much you could save with AuthorLoft.";

export function generateMetadata(): Metadata {
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/pricing/calculator" },
    openGraph: { type: "website", title: TITLE, description: DESCRIPTION },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  };
}

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${BASE}/pricing` },
    { "@type": "ListItem", position: 3, name: "Cost Savings Calculator", item: `${BASE}/pricing/calculator` },
  ],
};

async function getCalcPlans(): Promise<CalcPlan[]> {
  try {
    const rows = await prisma.plan.findMany({
      where: { isActive: true },
      select: {
        tier: true,
        name: true,
        monthlyPriceCents: true,
        maxBooks: true,
        maxCourses: true,
        maxMusicLists: true,
        coursesEnabled: true,
        musicEnabled: true,
      },
    });
    return rows.map((r) => ({ ...r, tier: r.tier as TierKey }));
  } catch {
    return FALLBACK_PLANS;
  }
}

export default async function CalculatorPage() {
  const plans = await getCalcPlans();

  return (
    <div className="min-h-screen bg-vault-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingNav activePage="pricing" />

      <MarketingPageHeader
        eyebrow="Cost Savings Calculator"
        title={<>What would it cost to <span className="italic text-vault-gold">build it yourself?</span></>}
        subtitle="Answer three quick questions. We'll compare going it alone with using AuthorLoft — in dollars and in hours."
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm text-vault-mute hover:text-vault-gold transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pricing
        </Link>

        <SavingsCalculator plans={plans} />

        <p className="mt-12 text-center text-sm text-vault-mute">
          Have a question about the numbers?{" "}
          <Link href="/contact" className="text-vault-gold font-semibold hover:text-vault-gold-light transition-colors">Contact us</Link>
          {" · "}
          <Link href="/pricing" className="text-vault-gold font-semibold hover:text-vault-gold-light transition-colors">Back to pricing</Link>
        </p>
      </div>
    </div>
  );
}
