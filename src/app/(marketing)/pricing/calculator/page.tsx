import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { SavingsCalculator } from "@/components/marketing/savings-calculator";
import { FALLBACK_PLANS, PRICES_CHECKED, type CalcPlan, type TierKey } from "@/lib/savings-calculator-data";
import { getOgImage } from "@/lib/seo-config";

export const revalidate = 60;

// Absolute title: the root layout's template would append "| AuthorLoft", pushing this past
// the ~60 characters Google shows.
const TITLE = "Cost Savings Calculator: DIY Website vs. AuthorLoft";
const DESCRIPTION =
  "See what building your own website for books, courses or music really costs in dollars and hours, and how much you could save with AuthorLoft.";

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("pricing-calculator");
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: "/pricing/calculator" },
    openGraph: {
      type: "website",
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft Cost Savings Calculator" }],
    },
    twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [ogImage] },
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

// Visible on the page AND emitted as FAQPage JSON-LD — keep the two in sync by rendering both from this list.
const FAQ: { q: string; a: string }[] = [
  {
    q: "How does the Cost Savings Calculator work?",
    a: "You tell us how many books, courses and music lists you have, pick the website features you want, and set what an hour of your time is worth. We add up the tools and hours it takes to build and run the site yourself, then compare that with the AuthorLoft plan that covers your choices.",
  },
  {
    q: "Where do the prices come from?",
    a: `The do-it-yourself prices are what popular tools charge, checked on ${PRICES_CHECKED}. When a company offers a yearly discount we use it, so the cost is not overstated. The hours are our own estimates. Every source is listed on the page.`,
  },
  {
    q: "Why does the calculator count my time?",
    a: "Building and maintaining a website takes hours you could spend writing, teaching or making music. Putting a value on that time shows the full cost of doing it yourself, not just the monthly bills.",
  },
  {
    q: "Are these numbers guaranteed?",
    a: "No. They are estimates. Your real cost depends on the tools you choose and how fast you work. Card-payment fees are the same either way, so they are not counted.",
  },
  {
    q: "Can I try AuthorLoft before paying?",
    a: "Yes. Every plan begins with a free account and no credit card. You can upgrade to Standard or Premium any time from your dashboard.",
  },
];

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

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "AuthorLoft Cost Savings Calculator",
  url: `${BASE}/pricing/calculator`,
  description: DESCRIPTION,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  publisher: { "@type": "Organization", name: "AuthorLoft", url: BASE },
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default async function CalculatorPage() {
  const plans = await getCalcPlans();

  return (
    <div className="min-h-screen bg-vault-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
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

        <section className="mt-16 max-w-3xl mx-auto" aria-labelledby="calc-faq">
          <h2 id="calc-faq" className="text-2xl font-bold text-vault-ink mb-6">Questions about the calculator</h2>
          <dl className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <dt className="font-semibold text-vault-ink">{q}</dt>
                <dd className="mt-1 text-vault-mute leading-relaxed">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

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
