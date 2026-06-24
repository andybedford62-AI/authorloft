import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("pricing");
  return {
    title: "Pricing — Free Author Career Platform",
    description:
      "Start free forever. Upgrade to Standard ($39.99/mo) for direct sales and custom domains, or Premium ($79.99/mo) for full analytics. No credit card required.",
    alternates: { canonical: "/pricing" },
    openGraph: {
      type:        "website",
      title:       "AuthorLoft Pricing — Free Author Career Platform",
      description: "Start free forever. Upgrade to Standard ($39.99/mo) for direct sales and custom domains, or Premium ($79.99/mo) for full analytics. No credit card required.",
      images:      [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft pricing plans" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "AuthorLoft Pricing — Free Author Career Platform",
      description: "Start free forever. Upgrade to Standard ($39.99/mo) for direct sales and custom domains, or Premium ($79.99/mo) for full analytics. No credit card required.",
      images:      [ogImage],
    },
  };
}

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

type CellType = "yes" | "no" | "limited" | "text";

function cellCls(type: CellType) {
  if (type === "yes") return "text-green-600 font-semibold";
  if (type === "no") return "text-red-500 font-semibold";
  if (type === "limited") return "text-amber-500 font-medium";
  return "text-gray-600";
}

type CompCell = { val: string; type: CellType };

const COMPETITOR_ROWS: Array<{
  label: string;
  authorloft: CompCell;
  tertulia: CompCell;
  quilltips: CompCell;
  storyorigin: CompCell;
  bookfunnel: CompCell;
}> = [
  { label: "Author Platform & Site",   authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✓", type: "yes" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Unlimited Books & Series", authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✓", type: "yes" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "Limited", type: "limited" } },
  { label: "News Posts",              authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Events",                  authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✓", type: "yes" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Reviews & Ratings",       authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Mailing List Builder",    authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "Limited", type: "limited" }, storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "Custom Pages",            authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Analytics",               authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✓", type: "yes" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "Custom Domain",           authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "eBook Sales",             authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "Audiobook Sales",         authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✗", type: "no" },   bookfunnel: { val: "Limited", type: "limited" } },
  { label: "Print Book Sales",        authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "Limited", type: "limited" }, storyorigin: { val: "✗", type: "no" },   bookfunnel: { val: "Limited", type: "limited" } },
  { label: "Email Campaigns",         authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Reader Magnets",          authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "Limited", type: "limited" }, storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "3rd-Party Integrations",  authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
];

// Feature comparison table rows
const COMPARISON_ROWS = [
  { label: "Books",              free: "Up to 5",   standard: "Unlimited",  premium: "Unlimited"  },
  { label: "News posts",         free: "Up to 5",   standard: "Unlimited",  premium: "Unlimited"  },
  { label: "AuthorLoft subdomain",free: "✓",         standard: "✓",          premium: "✓"          },
  { label: "Custom domain",      free: "—",         standard: "✓",          premium: "✓"          },
  { label: "Newsletter capture", free: "✓",         standard: "✓",          premium: "✓"          },
  { label: "Newsletter campaigns",free: "—",        standard: "✓",          premium: "✓"          },
  { label: "Direct digital sales",free: "—",        standard: "✓",          premium: "✓"          },
  { label: "Flip book previews", free: "—",         standard: "✓",          premium: "✓"          },
  { label: "Sales analytics",    free: "—",         standard: "—",          premium: "✓"          },
  { label: "Support Link (Patreon, Ko-fi)", free: "✓", standard: "✓",       premium: "✓"          },
  { label: "Contact form",       free: "✓",         standard: "✓",          premium: "✓"          },
  { label: "Support",            free: "Community", standard: "Priority",   premium: "Priority"   },
];

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Pricing", item: `${BASE}/pricing` },
  ],
};

export default async function PricingPage() {
  const plans = await getActivePlans().catch(() => []);

  return (
    <div className="min-h-screen bg-[#E8E5DD]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Nav */}
      <MarketingNav activePage="pricing" />

      {/* Hero */}
      <MarketingPageHeader
        eyebrow="Plans & pricing"
        title={<>Simple, <span className="italic text-[#D4AE6A]">transparent</span> pricing</>}
        subtitle="Start free with no credit card. Upgrade when you're ready to grow your author platform."
        backgroundImage="/pricing-header.png"
      />

      {/* Pricing cards — live from DB */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        {plans.length > 0 ? (
          <PricingSection plans={plans} fullPage />
        ) : (
          // Fallback if DB has no plans yet
          <div className="text-center py-20 text-[#8993A4]">
            <p>Pricing plans are being set up. Check back soon.</p>
          </div>
        )}
      </section>

      {/* See All Features CTA */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#5C6E89] mb-4">Want to see the complete feature breakdown?</p>
          <Link
            href="/features"
            target="_blank"
            className="inline-block bg-[#F0EDE4] text-[#C26A4A] font-semibold px-6 py-3 rounded-lg hover:bg-[#DCDBD3] border border-[#DCDBD3] transition-colors"
          >
            See All Features →
          </Link>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-20 bg-[#1B2B47] px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#D4AE6A] text-center mb-2">
            Plan details
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-3">
            Quick feature comparison
          </h2>
          <p className="text-[#8993A4] text-sm text-center max-w-xl mx-auto mb-10">
            See what&apos;s included at every level — from free to premium.
          </p>
          <div className="bg-white rounded-2xl border border-[#DCDBD3] overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#DCDBD3]">
                  <th className="text-left px-6 py-4 font-medium text-[#8993A4] w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#1B2B47]">Free</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#C26A4A] bg-[#F0EDE4]">Standard</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#B8893D]">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDBD3]">
                {COMPARISON_ROWS.map(({ label, free, standard, premium }) => (
                  <tr key={label} className="hover:bg-[#F0EDE4] transition-colors">
                    <td className="px-6 py-3.5 text-[#1B2B47] font-medium">{label}</td>
                    <td className="px-6 py-3.5 text-center text-[#5C6E89]">{free}</td>
                    <td className="px-6 py-3.5 text-center text-[#1B2B47] bg-[#F0EDE4]">{standard}</td>
                    <td className="px-6 py-3.5 text-center text-[#1B2B47]">{premium}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[#DCDBD3] bg-[#F0EDE4]">
                  <td className="px-6 py-4" />
                  <td className="px-6 py-4 text-center">
                    <Link href="/register" className="text-sm font-semibold text-[#C26A4A] hover:underline">
                      Get started →
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center bg-[#F0EDE4]">
                    <Link href="/register?plan=standard" className="text-sm font-semibold text-[#C26A4A] hover:underline">
                      Start free → Standard
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/register?plan=premium" className="text-sm font-semibold text-[#B8893D] hover:underline">
                      Start free → Premium
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-sm text-[#8993A4] mt-6">
            All plans begin with a free account. Verify your email, then upgrade to Standard or Premium anytime from your dashboard — takes under 2 minutes.
          </p>
        </div>
      </section>

      {/* Competitor comparison table */}
      <section id="comparison" className="py-20 bg-[#E8E5DD] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C26A4A] mb-2">How we compare</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B47] mb-3">
              AuthorLoft vs. the competition
            </h2>
            <p className="text-[#5C6E89] text-sm max-w-xl mx-auto">
              An apples-to-apples look at AuthorLoft <strong>Standard</strong> next to each competitor&apos;s entry paid tier.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DCDBD3]">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-[#DCDBD3] bg-[#F0EDE4]">
                  <th className="text-left px-6 py-4 font-medium text-[#8993A4] w-[30%]">Feature</th>
                  <th className="text-center px-4 py-4 font-bold text-[#C26A4A] bg-[#F0EDE4] border-x border-[#DCDBD3]">
                    AuthorLoft
                    <span className="block text-xs font-semibold text-[#B8893D] mt-0.5">STANDARD · $19.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    <Link href="/compare/tertulia" className="hover:text-[#C26A4A] hover:underline transition-colors">Tertulia</Link>
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">$7.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    <Link href="/compare/quilltips" className="hover:text-[#C26A4A] hover:underline transition-colors">Quilltips</Link>
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">$4.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    <Link href="/compare/storyorigin" className="hover:text-[#C26A4A] hover:underline transition-colors">StoryOrigin</Link>
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">~$20/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    <Link href="/compare/bookfunnel" className="hover:text-[#C26A4A] hover:underline transition-colors">BookFunnel</Link>
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">~$49/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDBD3]">
                {COMPETITOR_ROWS.map(({ label, authorloft, tertulia, quilltips, storyorigin, bookfunnel }) => (
                  <tr key={label} className="hover:bg-[#F0EDE4] transition-colors">
                    <td className="px-6 py-3.5 text-[#1B2B47] font-medium">{label}</td>
                    <td className={`px-4 py-3.5 text-center bg-[#F0EDE4] border-x border-[#DCDBD3] ${cellCls(authorloft.type)}`}>{authorloft.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(tertulia.type)}`}>{tertulia.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(quilltips.type)}`}>{quilltips.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(storyorigin.type)}`}>{storyorigin.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(bookfunnel.type)}`}>{bookfunnel.val}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#DCDBD3] bg-[#F0EDE4]">
                  <td className="px-6 py-4 text-xs text-[#8993A4] italic">Entry paid plan compared</td>
                  <td className="px-4 py-4 text-center bg-[#F0EDE4] border-x border-[#DCDBD3]">
                    <Link href="/register" className="inline-block bg-[#B8893D] text-[#0F1A2D] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#D4AE6A] transition-colors">
                      Get Started →
                    </Link>
                  </td>
                  <td colSpan={4} className="px-4 py-4 text-center text-xs text-[#8993A4]">
                    Compared at each competitor&apos;s entry paid tier
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-xs text-[#8993A4] mt-4">
            Competitor features based on publicly listed plans as of June 2026. Features subject to change.
          </p>
          <p className="text-center text-sm mt-3 text-[#8993A4]">
            Full comparisons:{" "}
            <Link href="/compare/bookfunnel" className="text-[#C26A4A] hover:text-[#1B2B47] font-medium transition-colors">vs BookFunnel</Link>
            {" · "}
            <Link href="/compare/storyorigin" className="text-[#C26A4A] hover:text-[#1B2B47] font-medium transition-colors">vs StoryOrigin</Link>
            {" · "}
            <Link href="/compare/tertulia" className="text-[#C26A4A] hover:text-[#1B2B47] font-medium transition-colors">vs Tertulia</Link>
            {" · "}
            <Link href="/compare/quilltips" className="text-[#C26A4A] hover:text-[#1B2B47] font-medium transition-colors">vs Quilltips</Link>
          </p>
        </div>
      </section>

      {/* Have questions CTA */}
      <section className="bg-[#1B2B47] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#E8E5DD]">Not sure which plan is right for you?</h2>
          <p className="text-[#8993A4]">
            We&apos;re happy to help you find the perfect fit for your author platform.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-block bg-[#B8893D] text-[#0F1A2D] font-semibold px-6 py-3 rounded-lg hover:bg-[#D4AE6A] transition-colors"
            >
              Contact Us →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* Footer is rendered once by the marketing layout (MarketingFooter) */}
    </div>
  );
}
