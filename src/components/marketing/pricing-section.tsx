"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

export type PlanData = {
  id: string;
  name: string;
  tier: string;
  description: string | null;
  monthlyPriceCents: number;
  annualPriceCents: number;
  featuredLabel: string | null;
  badgeColor: string;
  maxBooks: number | null;
  maxPosts: number | null;
  maxStorageMb: number | null;
  customDomain: boolean;
  salesEnabled: boolean;
  newsletter: boolean;
  analyticsEnabled: boolean;
  flipBooksLimit: number;
  isDefault: boolean;
};

function formatPrice(cents: number) {
  if (cents === 0) return { amount: "$0", period: "forever" };
  const dollars = (cents / 100).toFixed(0);
  return { amount: `$${dollars}`, period: "per month" };
}

function formatAnnualPrice(cents: number) {
  if (cents === 0) return null;
  const monthly = (cents / 100 / 12).toFixed(0);
  const total = (cents / 100).toFixed(0);
  return { monthly: `$${monthly}`, annual: `$${total}` };
}

function buildFeatureList(plan: PlanData): string[] {
  const features: string[] = [];

  // Books
  if (plan.maxBooks === null) {
    features.push("Unlimited books");
  } else {
    features.push(`Up to ${plan.maxBooks} book${plan.maxBooks === 1 ? "" : "s"}`);
  }

  // Posts
  if (plan.maxPosts === null && plan.tier !== "FREE") {
    features.push("Unlimited blog posts");
  } else if (plan.maxPosts !== null) {
    features.push(`Up to ${plan.maxPosts} published posts`);
  }

  // Domain
  if (plan.customDomain) {
    features.push("Custom domain");
  } else {
    features.push("AuthorLoft subdomain");
  }

  // Newsletter
  if (plan.newsletter) {
    features.push("Newsletter campaigns");
  } else {
    features.push("Newsletter capture");
  }

  // Sales
  if (plan.salesEnabled) features.push("Direct digital sales (Stripe)");

  // Flip books
  if (plan.flipBooksLimit !== 0) {
    const flipLabel = plan.flipBooksLimit === -1
      ? "Unlimited flip books"
      : `Up to ${plan.flipBooksLimit} flip book${plan.flipBooksLimit === 1 ? "" : "s"}`;
    features.push(flipLabel);
  }

  // Analytics
  if (plan.analyticsEnabled) features.push("Sales analytics dashboard");

  // Storage
  if (plan.maxStorageMb !== null) {
    features.push(`${plan.maxStorageMb >= 1024 ? `${plan.maxStorageMb / 1024} GB` : `${plan.maxStorageMb} MB`} storage`);
  }

  // Contact form is always available
  features.push("Contact form");

  return features;
}

const BADGE_COLORS: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  purple: "bg-purple-600 text-white",
  green:  "bg-green-600 text-white",
  orange: "bg-orange-500 text-white",
  gray:   "bg-gray-600 text-white",
};

interface PricingSectionProps {
  plans: PlanData[];
  /** When true, renders the full-page variant with FAQ etc. */
  fullPage?: boolean;
}

export function PricingSection({ plans, fullPage = false }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);

  const hasAnnual = plans.some((p) => p.annualPriceCents > 0);

  // Determine which plan is "highlighted" — featuredLabel, or fallback to STANDARD
  const highlightedTier =
    plans.find((p) => p.featuredLabel)?.tier ??
    plans.find((p) => p.tier === "STANDARD")?.tier ??
    null;

  return (
    <div className="space-y-10">

      {/* Annual toggle */}
      {hasAnnual && (
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              annual ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                annual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>
            Annual
          </span>
          {annual && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
              <Zap className="h-3 w-3" /> Save up to 20%
            </span>
          )}
        </div>
      )}

      {/* Plan cards */}
      <div className={`grid gap-6 ${plans.length === 3 ? "md:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "max-w-sm mx-auto"}`}>
        {plans.map((plan) => {
          const isHighlighted = plan.tier === highlightedTier;
          const monthly = formatPrice(plan.monthlyPriceCents);
          const annualInfo = formatAnnualPrice(plan.annualPriceCents);
          const features = buildFeatureList(plan);
          const badgeClass = BADGE_COLORS[plan.badgeColor] ?? BADGE_COLORS.gray;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border flex flex-col gap-6 p-8 transition-shadow ${
                isHighlighted
                  ? "border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-200 scale-105"
                  : "border-gray-200 bg-white text-gray-900 hover:shadow-md"
              }`}
            >
              {/* Featured label badge */}
              {plan.featuredLabel && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full shadow-sm ${badgeClass}`}>
                    {plan.featuredLabel}
                  </span>
                </div>
              )}

              {/* Plan name + price */}
              <div>
                <h3 className={`text-lg font-bold mb-1 ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${isHighlighted ? "text-white" : "text-gray-900"}`}>
                    {annual && annualInfo ? annualInfo.monthly : monthly.amount}
                  </span>
                  <span className={`text-sm ${isHighlighted ? "text-blue-200" : "text-gray-400"}`}>
                    {plan.monthlyPriceCents === 0 ? "/forever" : "/mo"}
                  </span>
                </div>
                {annual && annualInfo && (
                  <p className={`text-xs mt-1 ${isHighlighted ? "text-blue-200" : "text-gray-400"}`}>
                    Billed {annualInfo.annual}/year
                  </p>
                )}
                {plan.description && (
                  <p className={`text-sm mt-2 ${isHighlighted ? "text-blue-100" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                )}
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                        isHighlighted ? "text-blue-200" : "text-green-500"
                      }`}
                    />
                    <span className={isHighlighted ? "text-blue-50" : "text-gray-700"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={plan.monthlyPriceCents === 0
                  ? "/register"
                  : `/register?plan=${plan.tier.toLowerCase()}${annual ? "&billing=annual" : ""}`
                }
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${
                  isHighlighted
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {plan.monthlyPriceCents === 0
                  ? "Get Started Free"
                  : `Start ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Guarantee note */}
      <p className={`text-center text-sm ${fullPage ? "text-gray-400" : "text-gray-400"}`}>
        No credit card required for Free plan · Cancel anytime · 30-day money-back guarantee
      </p>

      {/* Full-page FAQ */}
      {fullPage && (
        <div className="max-w-2xl mx-auto pt-8 border-t border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 text-center">Common questions</h3>
          {[
            {
              q: "Can I switch plans later?",
              a: "Yes — upgrade or downgrade at any time. Changes take effect immediately. If you upgrade mid-cycle you're charged a prorated amount.",
            },
            {
              q: "What happens if I exceed my book limit?",
              a: "You can still view and edit existing books, but you won't be able to add new ones until you upgrade or remove a book.",
            },
            {
              q: "Do I need a payment processor for digital sales?",
              a: "Yes — direct sales use Stripe. You connect your own Stripe account so payments go directly to you. AuthorLoft does not take a transaction cut.",
            },
            {
              q: "Can I use my own domain name?",
              a: "Custom domains are available on Standard and Premium plans. You point your domain's DNS to AuthorLoft and we handle the rest.",
            },
            {
              q: "Is there a contract or lock-in?",
              a: "No contract, no lock-in. Monthly plans can be cancelled anytime. Annual plans are billed yearly and include a 30-day money-back window.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="space-y-1">
              <p className="font-semibold text-gray-900">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
