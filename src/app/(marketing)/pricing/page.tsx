import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { PricingSection } from "@/components/marketing/pricing-section";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import { getFoundingOfferCopy } from "@/lib/founding-offer";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("pricing");
  return {
    title: "Pricing — Free Author Career Platform",
    description:
      "Start free forever. Upgrade to Standard ($19.99/mo) for direct sales and custom domains, or Premium ($59.99/mo) for full analytics. No credit card required.",
    alternates: { canonical: "/pricing" },
    openGraph: {
      type:        "website",
      title:       "AuthorLoft Pricing — Free Author Career Platform",
      description: "Start free forever. Upgrade to Standard ($19.99/mo) for direct sales and custom domains, or Premium ($59.99/mo) for full analytics. No credit card required.",
      images:      [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft pricing plans" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "AuthorLoft Pricing — Free Author Career Platform",
      description: "Start free forever. Upgrade to Standard ($19.99/mo) for direct sales and custom domains, or Premium ($59.99/mo) for full analytics. No credit card required.",
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
      coursesEnabled: true,
      maxCourses: true,
      musicEnabled: true,
      maxMusicLists: true,
      maxTracksPerList: true,
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

function planByTier<T extends { tier: string }>(plans: T[], tier: string) {
  return plans.find((p) => p.tier === tier);
}

function formatLimit(value: number | null | undefined, fallback: number): string {
  if (value === null || value === undefined) return "Unlimited";
  return `Up to ${value || fallback}`;
}

type CellType = "yes" | "no" | "limited" | "text";

function cellCls(type: CellType) {
  if (type === "yes") return "text-green-500 font-semibold";
  if (type === "no") return "text-red-400 font-semibold";
  if (type === "limited") return "text-amber-400 font-medium";
  return "text-[#93a0bc]";
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
  { label: "Book Bundles",            authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✗", type: "no" },   bookfunnel: { val: "✗", type: "no" }       },
  { label: "Author Courses",          authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        quilltips: { val: "✗", type: "no" },         storyorigin: { val: "✗", type: "no" },   bookfunnel: { val: "✗", type: "no" }       },
];

// Feature comparison table rows. "Books" / "News posts" / "Author Courses" are
// computed live from each plan's quantity limits (see buildComparisonRows) —
// everything else here is curated marketing copy, not a raw feature-flag mirror.
function buildComparisonRows(plans: Awaited<ReturnType<typeof getActivePlans>>) {
  const free = planByTier(plans, "FREE");
  const standard = planByTier(plans, "STANDARD");
  const premium = planByTier(plans, "PREMIUM");

  return [
    { label: "Books",              free: formatLimit(free?.maxBooks, 5), standard: formatLimit(standard?.maxBooks, 20), premium: formatLimit(premium?.maxBooks, 0) },
    { label: "News posts",         free: formatLimit(free?.maxPosts, 5), standard: formatLimit(standard?.maxPosts, 0),  premium: formatLimit(premium?.maxPosts, 0) },
    { label: "AuthorLoft subdomain",free: "✓",         standard: "✓",          premium: "✓"          },
    { label: "Custom domain",      free: "—",         standard: "✓",          premium: "✓"          },
    { label: "Newsletter capture", free: "✓",         standard: "✓",          premium: "✓"          },
    { label: "Newsletter campaigns",free: "✓",        standard: "✓",          premium: "✓"          },
    { label: "Direct digital sales",free: "✓ eBook",   standard: "✓",          premium: "✓"          },
    { label: "Shopping Cart",      free: "—",         standard: "✓",          premium: "✓"          },
    { label: "Discount Codes",     free: "✓",         standard: "✓",          premium: "✓"          },
    { label: "Book Bundles",       free: "—",         standard: "✓",          premium: "✓"          },
    { label: "Author Courses",     free: free?.coursesEnabled ? formatLimit(free?.maxCourses, 5) : "—", standard: standard?.coursesEnabled ? formatLimit(standard?.maxCourses, 25) : "—", premium: premium?.coursesEnabled ? formatLimit(premium?.maxCourses, 0) : "—" },
    { label: "Flip book previews", free: "—",         standard: "✓",          premium: "✓"          },
    { label: "Sales analytics",    free: "—",         standard: "—",          premium: "✓"          },
    { label: "Support Link (Patreon, Ko-fi)", free: "✓", standard: "✓",       premium: "✓"          },
    { label: "Achievement Badges", free: "✓",         standard: "✓",          premium: "✓"          },
    { label: "Contact form",       free: "✓",         standard: "✓",          premium: "✓"          },
    { label: "Support Community",  free: "Community", standard: "Priority",   premium: "Priority"   },
  ];
}

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
  const [plans, foundingOffer] = await Promise.all([
    getActivePlans().catch(() => []),
    getFoundingOfferCopy().catch(() => null),
  ]);
  const comparisonRows = buildComparisonRows(plans);

  return (
    <div className="min-h-screen bg-[#16233d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Nav */}
      <MarketingNav activePage="pricing" />

      {/* Hero */}
      <MarketingPageHeader
        eyebrow="Plans & pricing"
        title={<>Simple, <span className="italic text-[#d6a94a]">transparent</span> pricing</>}
        subtitle="Start free with no credit card. Upgrade when you're ready to grow your author platform."
        backgroundImage="/pricing-header.png"
      />

      {/* Pricing cards — live from DB */}
      <section className="px-4 pb-20 max-w-5xl mx-auto">
        {foundingOffer && (
          <div className="max-w-2xl mx-auto mb-10 flex items-center gap-5 rounded-2xl border border-[#d6a94a]/60 bg-[#243756] px-6 py-5 shadow-xl shadow-[#16233d]/25">
            <div className="flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#e2bc6e] to-[#d6a94a] text-[#16233d] shadow-md">
              <span className="text-2xl font-extrabold leading-none">{foundingOffer.percentOff}%</span>
              <span className="text-[10px] font-bold uppercase tracking-wide">off</span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#d6a94a] mb-1">🎉 Founding Member Offer</p>
              <p className="text-base sm:text-lg font-bold text-[#f3ecdb] leading-snug">{foundingOffer.headline}</p>
              <p className="text-sm text-[#93a0bc] mt-1">{foundingOffer.subtext}</p>
            </div>
          </div>
        )}
        {plans.length > 0 ? (
          <PricingSection plans={plans} fullPage />
        ) : (
          // Fallback if DB has no plans yet
          <div className="text-center py-20 text-[#93a0bc]">
            <p>Pricing plans are being set up. Check back soon.</p>
          </div>
        )}
      </section>

      {/* See All Features CTA */}
      <section className="py-12 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#93a0bc] mb-4">Want to see the complete feature breakdown?</p>
          <Link
            href="/features"
            target="_blank"
            className="inline-block bg-transparent text-[#d6a94a] font-semibold px-6 py-3 rounded-[6px] hover:bg-[rgba(214,169,74,0.1)] border border-[#d6a94a]/50 transition-colors"
          >
            See All Features →
          </Link>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-20 bg-[#1e2f4d] px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#d6a94a] text-center mb-2">
            Plan details
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f3ecdb] text-center mb-3">
            Quick feature comparison
          </h2>
          <p className="text-[#93a0bc] text-sm text-center max-w-xl mx-auto mb-10">
            See what&apos;s included at every level — from free to premium.
          </p>
          <div className="bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.2)] overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-[rgba(243,236,219,0.2)] bg-[#243756]">
                  <th className="text-left px-6 py-4 font-medium text-[#93a0bc] w-1/2">Feature</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#f3ecdb]">Free</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#d6a94a]">Standard</th>
                  <th className="text-center px-6 py-4 font-semibold text-[#e2bc6e]">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,236,219,0.15)]">
                {comparisonRows.map(({ label, free, standard, premium }) => (
                  <tr key={label} className="hover:bg-[rgba(243,236,219,0.06)] transition-colors">
                    <td className="px-6 py-3.5 text-[#f3ecdb] font-medium">{label}</td>
                    <td className="px-6 py-3.5 text-center text-[#93a0bc]">{free}</td>
                    <td className="px-6 py-3.5 text-center text-[#f3ecdb] bg-[#d6a94a]/[0.07]">{standard}</td>
                    <td className="px-6 py-3.5 text-center text-[#f3ecdb]">{premium}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-[rgba(243,236,219,0.12)] bg-[#243756]">
                  <td className="px-6 py-4" />
                  <td className="px-6 py-4 text-center">
                    <Link href="/register" className="text-sm font-semibold text-[#d6a94a] hover:underline">
                      Get started →
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center bg-[#243756]">
                    <Link href="/register?plan=standard" className="text-sm font-semibold text-[#d6a94a] hover:underline">
                      Start free → Standard
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link href="/register?plan=premium" className="text-sm font-semibold text-[#e2bc6e] hover:underline">
                      Start free → Premium
                    </Link>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-sm text-[#93a0bc] mt-6">
            All plans begin with a free account. Verify your email, then upgrade to Standard or Premium anytime from your dashboard — takes under 2 minutes.
          </p>
        </div>
      </section>

      {/* Competitor comparison table */}
      <section id="comparison" className="py-20 bg-[#16233d] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#d6a94a] mb-2">How we compare</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#f3ecdb] mb-3">
              AuthorLoft vs. the competition
            </h2>
            <p className="text-[#93a0bc] text-sm max-w-xl mx-auto">
              An apples-to-apples look at AuthorLoft <strong>Standard</strong> next to each competitor&apos;s entry paid tier.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[rgba(243,236,219,0.2)] bg-[#1e2f4d] shadow-lg">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b-2 border-[rgba(243,236,219,0.2)] bg-[#243756]">
                  <th className="text-left px-6 py-4 font-medium text-[#93a0bc] w-[30%]">Feature</th>
                  <th className="text-center px-4 py-4 font-bold text-[#d6a94a] bg-[#243756] border-x border-[rgba(243,236,219,0.12)]">
                    AuthorLoft
                    <span className="block text-xs font-semibold text-[#e2bc6e] mt-0.5">STANDARD · $19.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#f3ecdb]">
                    <Link href="/compare/tertulia" className="hover:text-[#d6a94a] hover:underline transition-colors">Tertulia</Link>
                    <span className="block text-xs font-normal text-[#93a0bc] mt-0.5">$7.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#f3ecdb]">
                    <Link href="/compare/quilltips" className="hover:text-[#d6a94a] hover:underline transition-colors">Quilltips</Link>
                    <span className="block text-xs font-normal text-[#93a0bc] mt-0.5">$4.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#f3ecdb]">
                    <Link href="/compare/storyorigin" className="hover:text-[#d6a94a] hover:underline transition-colors">StoryOrigin</Link>
                    <span className="block text-xs font-normal text-[#93a0bc] mt-0.5">~$20/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#f3ecdb]">
                    <Link href="/compare/bookfunnel" className="hover:text-[#d6a94a] hover:underline transition-colors">BookFunnel</Link>
                    <span className="block text-xs font-normal text-[#93a0bc] mt-0.5">~$49/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,236,219,0.15)]">
                {COMPETITOR_ROWS.map(({ label, authorloft, tertulia, quilltips, storyorigin, bookfunnel }) => (
                  <tr key={label} className="hover:bg-[rgba(243,236,219,0.06)] transition-colors">
                    <td className="px-6 py-3.5 text-[#f3ecdb] font-medium">{label}</td>
                    <td className={`px-4 py-3.5 text-center bg-[#243756] border-x border-[rgba(243,236,219,0.12)] ${cellCls(authorloft.type)}`}>{authorloft.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(tertulia.type)}`}>{tertulia.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(quilltips.type)}`}>{quilltips.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(storyorigin.type)}`}>{storyorigin.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(bookfunnel.type)}`}>{bookfunnel.val}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[rgba(243,236,219,0.12)] bg-[#243756]">
                  <td className="px-6 py-4 text-xs text-[#93a0bc] italic">Entry paid plan compared</td>
                  <td className="px-4 py-4 text-center bg-[#243756] border-x border-[rgba(243,236,219,0.12)]">
                    <Link href="/register" className="inline-block bg-[#d6a94a] text-[#16233d] text-xs font-semibold px-4 py-2 rounded-[6px] hover:bg-[#e2bc6e] transition-colors">
                      Get Started →
                    </Link>
                  </td>
                  <td colSpan={4} className="px-4 py-4 text-center text-xs text-[#93a0bc]">
                    Compared at each competitor&apos;s entry paid tier
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-xs text-[#93a0bc] mt-4">
            Competitor features based on publicly listed plans as of June 2026. Features subject to change.
          </p>
          <p className="text-center text-sm mt-3 text-[#93a0bc]">
            Full comparisons:{" "}
            <Link href="/compare/bookfunnel" className="text-[#d6a94a] hover:text-[#f3ecdb] font-medium transition-colors">vs BookFunnel</Link>
            {" · "}
            <Link href="/compare/storyorigin" className="text-[#d6a94a] hover:text-[#f3ecdb] font-medium transition-colors">vs StoryOrigin</Link>
            {" · "}
            <Link href="/compare/tertulia" className="text-[#d6a94a] hover:text-[#f3ecdb] font-medium transition-colors">vs Tertulia</Link>
            {" · "}
            <Link href="/compare/quilltips" className="text-[#d6a94a] hover:text-[#f3ecdb] font-medium transition-colors">vs Quilltips</Link>
          </p>
        </div>
      </section>

      {/* Have questions CTA */}
      <section className="bg-[#1e2f4d] py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#f3ecdb]">Not sure which plan is right for you?</h2>
          <p className="text-[#93a0bc]">
            We&apos;re happy to help you find the perfect fit for your author platform.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-block bg-[#d6a94a] text-[#16233d] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
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
