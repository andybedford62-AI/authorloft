"use client";

import type { PlanData } from "./pricing-section";

type FeatureRow = {
  category: string;
  features: Array<{
    name: string;
    tiers: Record<string, string>;
  }>;
};

function buildFeatureRows(plans: PlanData[], aiCap: number): FeatureRow[] {
  // Group features by category
  const rows: FeatureRow[] = [
    {
      category: "Publishing & Content",
      features: [
        {
          name: "Books",
          tiers: {
            FREE: plans.find(p => p.tier === "FREE")?.maxBooks === null ? "Unlimited" : `Up to ${plans.find(p => p.tier === "FREE")?.maxBooks || 5}`,
            STANDARD: plans.find(p => p.tier === "STANDARD")?.maxBooks === null ? "Unlimited" : `Up to ${plans.find(p => p.tier === "STANDARD")?.maxBooks || 5}`,
            PREMIUM: plans.find(p => p.tier === "PREMIUM")?.maxBooks === null ? "Unlimited" : `Up to ${plans.find(p => p.tier === "PREMIUM")?.maxBooks || 5}`,
          },
        },
        {
          name: "Blog Posts",
          tiers: {
            FREE: plans.find(p => p.tier === "FREE")?.maxPosts === null ? "Unlimited" : `Up to ${plans.find(p => p.tier === "FREE")?.maxPosts || 5}`,
            STANDARD: plans.find(p => p.tier === "STANDARD")?.maxPosts === null ? "Unlimited" : `Up to ${plans.find(p => p.tier === "STANDARD")?.maxPosts || 5}`,
            PREMIUM: plans.find(p => p.tier === "PREMIUM")?.maxPosts === null ? "Unlimited" : `Up to ${plans.find(p => p.tier === "PREMIUM")?.maxPosts || 5}`,
          },
        },
        {
          name: "Direct Digital Sales",
          tiers: {
            FREE: "—",
            STANDARD: plans.find(p => p.tier === "STANDARD")?.salesEnabled ? "✓ (Stripe)" : "—",
            PREMIUM: plans.find(p => p.tier === "PREMIUM")?.salesEnabled ? "✓ (Stripe)" : "—",
          },
        },
        {
          name: "Flip Books",
          tiers: {
            FREE: "—",
            STANDARD: plans.find(p => p.tier === "STANDARD")?.flipBooksLimit !== 0 ? "✓" : "—",
            PREMIUM: plans.find(p => p.tier === "PREMIUM")?.flipBooksLimit !== 0 ? "✓ (Unlimited)" : "—",
          },
        },
        {
          name: "Audio Format",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
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
            FREE: "Subdomain",
            STANDARD: "Custom domain",
            PREMIUM: "Custom domain",
          },
        },
        {
          name: "Site Theme",
          tiers: {
            FREE: "10+ themes",
            STANDARD: "10+ themes",
            PREMIUM: "10+ themes",
          },
        },
        {
          name: "Logo Upload",
          tiers: {
            FREE: "✓",
            STANDARD: "✓",
            PREMIUM: "✓",
          },
        },
        {
          name: "Hero Banner",
          tiers: {
            FREE: "✓",
            STANDARD: "✓",
            PREMIUM: "✓",
          },
        },
        {
          name: "Social Links",
          tiers: {
            FREE: "✓",
            STANDARD: "✓",
            PREMIUM: "✓",
          },
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
          name: "  • Book Descriptions",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
          },
        },
        {
          name: "  • Blog Ideas",
          tiers: {
            FREE: "—",
            STANDARD: "—",
            PREMIUM: "✓",
          },
        },
        {
          name: "  • Marketing Copy",
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
      ],
    },
    {
      category: "Marketing & Admin",
      features: [
        {
          name: "Newsletter Campaigns",
          tiers: {
            FREE: "—",
            STANDARD: plans.find(p => p.tier === "STANDARD")?.newsletter ? "✓" : "—",
            PREMIUM: plans.find(p => p.tier === "PREMIUM")?.newsletter ? "✓" : "—",
          },
        },
        {
          name: "Sales Dashboard",
          tiers: {
            FREE: "—",
            STANDARD: "✓",
            PREMIUM: "✓",
          },
        },
        {
          name: "Media Kit Page",
          tiers: {
            FREE: "—",
            STANDARD: plans.find(p => p.tier === "STANDARD")?.mediaKitEnabled ? "✓" : "—",
            PREMIUM: plans.find(p => p.tier === "PREMIUM")?.mediaKitEnabled ? "✓" : "—",
          },
        },
      ],
    },
  ];

  return rows;
}

interface FeatureMatrixProps {
  plans: PlanData[];
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h2>
        <div className="bg-purple-50 rounded-lg border border-purple-200 p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-gray-900">Auto-Formatter</p>
              <p className="text-sm text-gray-600">Format books for ePub, PDF, Kindle, print</p>
              <p className="text-xs text-purple-600 mt-1">3-4 weeks</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Email List Builder</p>
              <p className="text-sm text-gray-600">Signup forms, sequences, campaigns</p>
              <p className="text-xs text-purple-600 mt-1">5-6 weeks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
