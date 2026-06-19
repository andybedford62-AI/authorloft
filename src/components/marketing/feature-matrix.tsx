"use client";

import type { PlanData } from "./pricing-section";

export type FeatureMatrixPlanData = PlanData & {
  bookstoreListingEnabled: boolean;
  preOrdersEnabled: boolean;
  audioEnabled: boolean;
};

type FeatureRow = {
  category: string;
  features: Array<{
    name: string;
    tiers: Record<string, string>;
  }>;
};

function planByTier(plans: FeatureMatrixPlanData[], tier: string) {
  return plans.find((p) => p.tier === tier);
}

function formatLimit(value: number | null | undefined, fallback: number): string {
  if (value === null || value === undefined) return "Unlimited";
  return `Up to ${value || fallback}`;
}

function formatStorage(mb: number | null | undefined): string {
  if (mb === null || mb === undefined) return "—";
  return mb >= 1000 ? `${Math.round(mb / 1000)} GB` : `${mb} MB`;
}

function buildFeatureRows(plans: FeatureMatrixPlanData[], aiCap: number): FeatureRow[] {
  const free = planByTier(plans, "FREE");
  const standard = planByTier(plans, "STANDARD");
  const premium = planByTier(plans, "PREMIUM");

  // Group features by category
  const rows: FeatureRow[] = [
    {
      category: "Publishing & Content",
      features: [
        {
          name: "Books",
          tiers: {
            FREE: formatLimit(free?.maxBooks, 5),
            STANDARD: formatLimit(standard?.maxBooks, 20),
            PREMIUM: formatLimit(premium?.maxBooks, 0),
          },
        },
        {
          name: "Books CSV Import",
          tiers: { FREE: "✓ Goodreads or template", STANDARD: "✓ Goodreads or template", PREMIUM: "✓ Goodreads or template" },
        },
        {
          name: "Pre-orders / \"Coming Soon\"",
          tiers: {
            FREE: "—",
            STANDARD: standard?.preOrdersEnabled ? "✓" : "—",
            PREMIUM: premium?.preOrdersEnabled ? "✓" : "—",
          },
        },
        {
          name: "Blog Posts",
          tiers: {
            FREE: formatLimit(free?.maxPosts, 10),
            STANDARD: formatLimit(standard?.maxPosts, 100),
            PREMIUM: formatLimit(premium?.maxPosts, 0),
          },
        },
        {
          name: "Book Reviews & Reader Ratings",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Custom Book Pricing & Discount Codes",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Direct Digital Sales",
          tiers: {
            FREE: "—",
            STANDARD: standard?.salesEnabled ? "✓ (Stripe)" : "—",
            PREMIUM: premium?.salesEnabled ? "✓ (Stripe)" : "—",
          },
        },
        {
          name: "Sales Formats",
          tiers: {
            FREE: "—",
            STANDARD: standard?.salesEnabled ? "eBook, Print" : "—",
            PREMIUM: premium?.salesEnabled ? "eBook, Audio, Flipbook, Print" : "—",
          },
        },
        {
          name: "Affiliate / Referral Program",
          tiers: {
            FREE: "—",
            STANDARD: standard?.salesEnabled ? "✓ Custom links + commission" : "—",
            PREMIUM: premium?.salesEnabled ? "✓ Custom links + commission" : "—",
          },
        },
        {
          name: "Shopping Cart",
          tiers: {
            FREE: "—",
            STANDARD: standard?.salesEnabled ? "✓ Multi-item" : "—",
            PREMIUM: premium?.salesEnabled ? "✓ Multi-item" : "—",
          },
        },
        {
          name: "Coupon Manager",
          tiers: {
            FREE: "—",
            STANDARD: standard?.salesEnabled ? "✓" : "—",
            PREMIUM: premium?.salesEnabled ? "✓" : "—",
          },
        },
        {
          name: "Audio Format",
          tiers: {
            FREE: "—",
            STANDARD: standard?.audioEnabled ? "✓" : "—",
            PREMIUM: premium?.audioEnabled ? "✓" : "—",
          },
        },
        {
          name: "Flip Books",
          tiers: {
            FREE: "—",
            STANDARD: standard?.flipBooksLimit !== 0 ? "✓" : "—",
            PREMIUM: premium?.flipBooksLimit !== 0 ? "✓ Unlimited" : "—",
          },
        },
      ],
    },
    {
      category: "Site & Branding",
      features: [
        {
          name: "Site URL",
          tiers: {
            FREE: "AuthorLoft subdomain",
            STANDARD: "Subdomain + custom domain",
            PREMIUM: "Subdomain + custom domain",
          },
        },
        {
          name: "Storage",
          tiers: {
            FREE: formatStorage(free?.maxStorageMb),
            STANDARD: formatStorage(standard?.maxStorageMb),
            PREMIUM: formatStorage(premium?.maxStorageMb),
          },
        },
        {
          name: "Site Theme",
          tiers: {
            FREE: "3 colour themes",
            STANDARD: "15 themes (+ genre palettes)",
            PREMIUM: "15 themes + custom colours",
          },
        },
        {
          name: "Logo, Hero Banner & Social Links",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "About, Bio & Contact Pages",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Support Link (Patreon, Ko-fi, etc.)",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Legal / Disclaimer Page",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Dynamic OG Images",
          tiers: { FREE: "—", STANDARD: "—", PREMIUM: "✓ Per-page social cards" },
        },
      ],
    },
    {
      category: "AI & Automation",
      features: [
        {
          name: "AI Assistant",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: `✓ (${aiCap}/month)`,
          },
        },
        {
          name: "  • Book Descriptions, Blog Ideas & Marketing Copy",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
          },
        },
        {
          name: "  • Reader Feedback Analysis",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
          },
        },
        {
          name: "SEO Audit Tool",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
          },
        },
        {
          name: "  • Meta Tags, Keyword Density & Internal Links",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
          },
        },
      ],
    },
    {
      category: "Marketing & Communications",
      features: [
        {
          name: "Newsletter Signup Form",
          tiers: { FREE: "✓ Full campaigns", STANDARD: "✓ Full campaigns", PREMIUM: "✓ Full campaigns" },
        },
        {
          name: "Newsletter Campaigns",
          tiers: {
            FREE: free?.newsletter ? "✓" : "—",
            STANDARD: standard?.newsletter ? "✓" : "—",
            PREMIUM: premium?.newsletter ? "✓" : "—",
          },
        },
        {
          name: "AuthorLoft Bookstore Listing",
          tiers: {
            FREE: free?.bookstoreListingEnabled ? "✓" : "—",
            STANDARD: standard?.bookstoreListingEnabled ? "✓" : "—",
            PREMIUM: premium?.bookstoreListingEnabled ? "✓ Featured placement" : "—",
          },
        },
        {
          name: "Sales Dashboard",
          tiers: {
            FREE: "—",
            STANDARD: standard?.salesEnabled ? "✓" : "—",
            PREMIUM: premium?.salesEnabled ? "✓" : "—",
          },
        },
        {
          name: "Media Kit Page",
          tiers: {
            FREE: free?.mediaKitEnabled ? "✓" : "—",
            STANDARD: standard?.mediaKitEnabled ? "✓ + downloadable PDF" : "—",
            PREMIUM: premium?.mediaKitEnabled ? "✓ + downloadable PDF" : "—",
          },
        },
        {
          name: "Testimonials Display",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
      ],
    },
  ];

  return rows;
}

interface FeatureMatrixProps {
  plans: FeatureMatrixPlanData[];
  defaultAiUsageCap?: number;
}

export function FeatureMatrix({ plans, defaultAiUsageCap = 20 }: FeatureMatrixProps) {
  const featureRows = buildFeatureRows(plans, defaultAiUsageCap);
  const tiers = ["FREE", "STANDARD", "PREMIUM"];

  return (
    <div className="space-y-8">
      {featureRows.map((section) => (
        <div key={section.category}>
          <h2 className="text-xl font-bold text-gray-900 mb-4">{section.category}</h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-6 py-4 font-medium text-gray-700 w-2/5">Feature</th>
                  {tiers.map((tier) => (
                    <th
                      key={tier}
                      className={`text-center px-6 py-4 font-semibold ${
                        tier === "FREE"
                          ? "text-gray-700"
                          : tier === "STANDARD"
                            ? "text-blue-600 bg-blue-50"
                            : "text-purple-600"
                      }`}
                    >
                      {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {section.features.map((feature) => (
                  <tr key={feature.name} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3.5 text-gray-700 font-medium">{feature.name}</td>
                    {tiers.map((tier) => (
                      <td
                        key={`${feature.name}-${tier}`}
                        className={`px-6 py-3.5 text-center text-gray-600 ${
                          tier === "STANDARD" ? "bg-blue-50/50" : ""
                        }`}
                      >
                        {feature.tiers[tier]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Upcoming features */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">On the Roadmap</h2>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Auto-Formatter", desc: "Convert your book to ePub, PDF, Kindle, and print formats" },
              { name: "Affiliate Payouts", desc: "Send referral earnings directly via Stripe" },
              { name: "Reader Analytics", desc: "Track reads, engagement, and retention" },
              { name: "Email List Builder", desc: "Drag-and-drop forms and automated sequences" },
              { name: "Social Media Uploader", desc: "Schedule posts to Instagram, TikTok, and more" },
              { name: "Reader Tiers / Patreon", desc: "Membership tiers and exclusive content" },
              { name: "Review Monitoring", desc: "Aggregate reviews from Amazon and Goodreads" },
              { name: "Native PDF Flipbook", desc: "A smoother, mobile-friendly flipbook reader" },
              { name: "Two-Factor Authentication", desc: "Extra account security for every plan" },
            ].map((item) => (
              <div key={item.name}>
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
