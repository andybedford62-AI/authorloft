import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { PricingSection } from "@/components/marketing/pricing-section";
import type { Metadata } from "next";

export const revalidate = 3600; // fallback: refresh at most every hour

export const metadata: Metadata = {
  title: "AuthorLoft Pricing — Free Author Website Builder",
  description:
    "Start free forever. Upgrade to Standard ($39.99/mo) for direct sales and custom domains, or Premium ($79.99/mo) for full analytics. No credit card required.",
  openGraph: {
    type:        "website",
    title:       "AuthorLoft Pricing — Free Author Website Builder",
    description: "Start free forever. Upgrade to Standard ($39.99/mo) for direct sales and custom domains, or Premium ($79.99/mo) for full analytics. No credit card required.",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "AuthorLoft Pricing — Free Author Website Builder",
    description: "Start free forever. Upgrade to Standard ($39.99/mo) for direct sales and custom domains, or Premium ($79.99/mo) for full analytics. No credit card required.",
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
  storyorigin: CompCell;
  bookfunnel: CompCell;
}> = [
  { label: "Website Builder",         authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Unlimited Books & Series", authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "Limited", type: "limited" } },
  { label: "Blog",                    authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Events",                  authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Reviews & Ratings",       authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Mailing List Builder",    authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "Custom Pages",            authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Analytics",               authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "Custom Domain",           authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✓", type: "yes" },       storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "eBook Sales",             authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "Audiobook Sales",         authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        storyorigin: { val: "✗", type: "no" },   bookfunnel: { val: "Limited", type: "limited" } },
  { label: "Print Book Sales",        authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        storyorigin: { val: "✗", type: "no" },   bookfunnel: { val: "Limited", type: "limited" } },
  { label: "Email Campaigns",         authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✗", type: "no" }       },
  { label: "Reader Magnets",          authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
  { label: "3rd-Party Integrations",  authorloft: { val: "✓", type: "yes" },      tertulia: { val: "✗", type: "no" },        storyorigin: { val: "✓", type: "yes" },  bookfunnel: { val: "✓", type: "yes" }      },
];

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
    <div className="min-h-screen bg-[#E8E5DD]">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#E8E5DD] border-b border-[#DCDBD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={200} height={57} className="h-14 w-auto" />
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-[#5C6E89] hover:text-[#1B2B47] transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-[#C26A4A]">Pricing</Link>
            <a href="/#faq" className="text-sm text-[#5C6E89] hover:text-[#1B2B47] transition-colors">FAQ</a>
            <Link href="/login" className="text-sm text-[#5C6E89] hover:text-[#1B2B47] transition-colors">Sign In</Link>
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
      <section className="py-16 sm:py-20 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#1B2B47]">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-[#5C6E89] leading-relaxed">
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
      <section className="py-16 bg-[#F0EDE4] px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1B2B47] text-center mb-10">
            Quick feature comparison
          </h2>
          <div className="bg-[#E8E5DD] rounded-2xl border border-[#DCDBD3] overflow-hidden">
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
          <p className="text-center text-sm text-[#5C6E89] mt-6">
            All plans begin with a free account. Verify your email, then upgrade to Standard or Premium anytime from your dashboard — takes under 2 minutes.
          </p>
        </div>
      </section>

      {/* Competitor comparison table */}
      <section className="py-20 bg-[#E8E5DD] px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#C26A4A] mb-2">How we compare</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2B47] mb-3">
              AuthorLoft vs. the competition
            </h2>
            <p className="text-[#5C6E89] text-sm max-w-xl mx-auto">
              Our free plan includes more features than competitors&apos; paid tiers — so you can grow without paying extra.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#DCDBD3]">
            <table className="w-full text-sm min-w-[640px]">
              <thead>
                <tr className="border-b border-[#DCDBD3] bg-[#F0EDE4]">
                  <th className="text-left px-6 py-4 font-medium text-[#8993A4] w-[34%]">Feature</th>
                  <th className="text-center px-4 py-4 font-bold text-[#C26A4A] bg-[#F0EDE4] border-x border-[#DCDBD3]">
                    AuthorLoft
                    <span className="block text-xs font-semibold text-[#B8893D] mt-0.5">FREE</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    Tertulia
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">$7.99/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    StoryOrigin
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">~$20/mo</span>
                  </th>
                  <th className="text-center px-4 py-4 font-semibold text-[#1B2B47]">
                    BookFunnel
                    <span className="block text-xs font-normal text-[#8993A4] mt-0.5">~$49/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDBD3]">
                {COMPETITOR_ROWS.map(({ label, authorloft, tertulia, storyorigin, bookfunnel }) => (
                  <tr key={label} className="hover:bg-[#F0EDE4] transition-colors">
                    <td className="px-6 py-3.5 text-[#1B2B47] font-medium">{label}</td>
                    <td className={`px-4 py-3.5 text-center bg-[#F0EDE4] border-x border-[#DCDBD3] ${cellCls(authorloft.type)}`}>{authorloft.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(tertulia.type)}`}>{tertulia.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(storyorigin.type)}`}>{storyorigin.val}</td>
                    <td className={`px-4 py-3.5 text-center ${cellCls(bookfunnel.type)}`}>{bookfunnel.val}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#DCDBD3] bg-[#F0EDE4]">
                  <td className="px-6 py-4 text-xs text-[#8993A4] italic">Basic / entry plan compared</td>
                  <td className="px-4 py-4 text-center bg-[#F0EDE4] border-x border-[#DCDBD3]">
                    <Link href="/register" className="inline-block bg-[#B8893D] text-[#0F1A2D] text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#D4AE6A] transition-colors">
                      Start Free →
                    </Link>
                  </td>
                  <td colSpan={3} className="px-4 py-4 text-center text-xs text-[#8993A4]">
                    Requires a paid plan to access most features
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-center text-xs text-[#8993A4] mt-4">
            Competitor features based on publicly listed plans as of May 2026. Features subject to change.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E8E5DD] border-t border-[#DCDBD3] text-[#5C6E89] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <Image src="/AL_site_Logo-Dark_footer.png" alt="AuthorLoft" width={140} height={40} className="h-8 w-auto" />
          </div>
          <p className="text-sm">© {new Date().getFullYear()} AuthorLoft. Built for authors.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/privacy" className="hover:text-[#1B2B47] transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-[#1B2B47] transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-[#1B2B47] transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
