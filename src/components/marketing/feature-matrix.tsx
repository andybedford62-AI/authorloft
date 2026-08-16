"use client";

import type { PlanData } from "./pricing-section";

export type FeatureMatrixPlanData = PlanData & {
  bookstoreListingEnabled: boolean;
  preOrdersEnabled: boolean;
  audioEnabled: boolean;
  bundlesEnabled: boolean;
  coursesEnabled: boolean;
  maxCourses: number | null;
};

type FeatureRow = {
  category: string;
  description?: string;
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
      description: "Stop juggling files, retailer dashboards, and format headaches. Publish once, sell everywhere — from one catalog you control.",
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
          name: "Auto-Formatter (DOCX → ePub)",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
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
          name: "ARC (Advance Reader Copy) Management",
          tiers: { FREE: "—", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Custom Book Pricing & Discount Codes",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Direct Digital Sales",
          tiers: {
            FREE: free?.salesEnabled ? "✓ eBook (Stripe)" : "—",
            STANDARD: standard?.salesEnabled ? "✓ (Stripe)" : "—",
            PREMIUM: premium?.salesEnabled ? "✓ (Stripe)" : "—",
          },
        },
        {
          name: "Sales Formats",
          tiers: {
            FREE: free?.salesEnabled ? "eBook" : "—",
            STANDARD: standard?.salesEnabled ? "eBook, Print" : "—",
            PREMIUM: premium?.salesEnabled ? "eBook, Audio, Flipbook, Print" : "—",
          },
        },
        {
          name: "Reader Magnets",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
        {
          name: "Discount Codes",
          tiers: {
            FREE: free?.salesEnabled ? "✓" : "—",
            STANDARD: standard?.salesEnabled ? "✓" : "—",
            PREMIUM: premium?.salesEnabled ? "✓" : "—",
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
          name: "Book Bundles",
          tiers: {
            FREE: "—",
            STANDARD: standard?.bundlesEnabled ? "✓" : "—",
            PREMIUM: premium?.bundlesEnabled ? "✓" : "—",
          },
        },
        {
          name: "Author Courses",
          tiers: {
            FREE: free?.coursesEnabled ? formatLimit(free?.maxCourses, 5) : "—",
            STANDARD: standard?.coursesEnabled ? formatLimit(standard?.maxCourses, 25) : "—",
            PREMIUM: premium?.coursesEnabled ? formatLimit(premium?.maxCourses, 0) : "—",
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
      description: "Your name on the domain, your colors on the page, no shared templates. Standard and Premium also drop the 'powered by AuthorLoft' footer badge — a site that looks entirely like yours.",
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
          name: "\"Powered by AuthorLoft\" Footer Badge",
          tiers: { FREE: "Shown", STANDARD: "Removed", PREMIUM: "Removed" },
        },
      ],
    },
    {
      category: "AI & Automation",
      description: "Writer's block doesn't stop at the manuscript. Let AI handle blurbs, blog ideas, SEO audits, and social posts so you stay in the story.",
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
        {
          name: "Social Promote (AI post generator)",
          tiers: {
            FREE: "—",
            STANDARD: "✓ Facebook, Instagram, X, Reddit, Threads, Bluesky",
            PREMIUM: "✓ All platforms + LinkedIn, TikTok",
          },
        },
        {
          name: "  • 14 promo types (sale, launch, quote, BTS, etc.)",
          tiers: {
            FREE: "—",
            STANDARD: "✓",
            PREMIUM: "✓",
          },
        },
        {
          name: "  • Custom voice / brand tone control",
          tiers: {
            FREE: "—",
            STANDARD: "✓",
            PREMIUM: "✓",
          },
        },
      ],
    },
    {
      category: "Marketing & Communications",
      description: "Every reader who buys through a retailer is a reader you'll never email again. Own the relationship from day one.",
      features: [
        {
          name: "Per-Book QR Code (download as SVG)",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
        },
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
          name: "Achievement Badges",
          tiers: { FREE: "✓", STANDARD: "✓", PREMIUM: "✓" },
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
          name: "Reader Analytics (page views, trends, referrers)",
          tiers: {
            FREE: free?.analyticsEnabled ? "✓" : "—",
            STANDARD: standard?.analyticsEnabled ? "✓" : "—",
            PREMIUM: premium?.analyticsEnabled ? "✓" : "—",
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
          <h2 className={`text-xl font-bold text-[#f3ecdb] ${section.description ? 'mb-1' : 'mb-4'}`}>{section.category}</h2>
          {section.description && (
            <p className="text-sm text-[#93a0bc] mb-4 max-w-2xl" style={{ fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>
              {section.description}
            </p>
          )}
          <div className="bg-[#1e2f4d] rounded-lg border border-[rgba(243,236,219,0.12)] overflow-hidden">
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-[rgba(243,236,219,0.12)] bg-[#16233d]">
                  <th className="text-left px-6 py-4 font-medium text-[#93a0bc] w-2/5">Feature</th>
                  {tiers.map((tier) => (
                    <th
                      key={tier}
                      className={`text-center px-6 py-4 font-semibold ${
                        tier === "FREE"
                          ? "text-[#93a0bc]"
                          : tier === "STANDARD"
                            ? "text-[#d6a94a] bg-[#243756]"
                            : "text-[#e2bc6e]"
                      }`}
                    >
                      {tier}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(243,236,219,0.08)]">
                {section.features.map((feature) => (
                  <tr key={feature.name} className="hover:bg-[rgba(243,236,219,0.04)] transition-colors">
                    <td className="px-6 py-3.5 text-[#f3ecdb] font-medium">{feature.name}</td>
                    {tiers.map((tier) => (
                      <td
                        key={`${feature.name}-${tier}`}
                        className={`px-6 py-3.5 text-center text-[#93a0bc] ${
                          tier === "STANDARD" ? "bg-[#243756]/50" : ""
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
        </div>
      ))}

      {/* Upcoming features — NOT built yet, verified against the codebase Aug 7 2026.
          Keep this in sync: per CLAUDE.md's "Finishing a task" checklist, when a
          feature listed here ships, remove it from this array (and add a real row
          to buildFeatureRows() above if it belongs in the comparison table). Don't
          let a shipped feature linger here — it directly contradicts the table
          above it, which pulls live from the Plan model. */}
      <div>
        <h2 className="text-xl font-bold text-[#f3ecdb] mb-4">On the Roadmap</h2>
        <div className="bg-[#243756] rounded-lg border border-[#d6a94a]/20 p-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { name: "Author Mobile App", desc: "Native iOS / Android app for managing your AuthorLoft from anywhere" },
              { name: "Author Social Scheduling", desc: "Connect your own accounts and auto-publish posts on a schedule (Social Promote today generates ready-to-paste post copy, but doesn't connect accounts or publish for you)" },
              { name: "Email List Builder", desc: "Drag-and-drop signup forms and automated email sequences" },
              { name: "Review Monitoring", desc: "Aggregate reviews from Amazon and Goodreads" },
              { name: "Native PDF Flipbook", desc: "A smoother, mobile-friendly flipbook reader, built into the page instead of an external embed link" },
              { name: "Two-Factor Authentication", desc: "Extra account security for every plan" },
              { name: "Dynamic OG Images", desc: "Auto-generated per-page social cards for every individual book and post, not just fixed marketing pages" },
            ].map((item) => (
              <div key={item.name}>
                <p className="font-semibold text-[#f3ecdb]">{item.name}</p>
                <p className="text-sm text-[#93a0bc]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
