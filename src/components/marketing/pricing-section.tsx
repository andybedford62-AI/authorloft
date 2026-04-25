"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";

export type PlanData = {
  id: string;
  name: string;
  tier: string;
  description: string | null;
  featuresJson: string | null;
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

function formatDollars(cents: number): string {
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
}

function formatMonthlyPrice(cents: number) {
  if (cents === 0) return "$0";
  return formatDollars(cents);
}

function formatAnnualMonthly(annualCents: number) {
  if (annualCents === 0) return null;
  const perMonth = annualCents / 12;
  return formatDollars(perMonth);
}

function formatAnnualTotal(annualCents: number) {
  return formatDollars(annualCents);
}

function buildAutoFeatures(plan: PlanData): string[] {
  const f: string[] = [];
  f.push(plan.maxBooks === null ? "Unlimited books" : `Up to ${plan.maxBooks} book${plan.maxBooks === 1 ? "" : "s"}`);
  if (plan.maxPosts === null && plan.tier !== "FREE") f.push("Unlimited blog posts");
  else if (plan.maxPosts !== null) f.push(`Up to ${plan.maxPosts} published posts`);
  f.push(plan.customDomain ? "Custom domain" : "AuthorLoft subdomain");
  f.push(plan.newsletter ? "Newsletter campaigns" : "Newsletter capture");
  if (plan.salesEnabled) f.push("Direct digital sales (Stripe)");
  if (plan.flipBooksLimit !== 0) {
    f.push(plan.flipBooksLimit === -1 ? "Unlimited flip books" : `Up to ${plan.flipBooksLimit} flip book${plan.flipBooksLimit === 1 ? "" : "s"}`);
  }
  if (plan.analyticsEnabled) f.push("Analytics dashboard");
  if (plan.maxStorageMb !== null) {
    f.push(`${plan.maxStorageMb >= 1024 ? `${plan.maxStorageMb / 1024} GB` : `${plan.maxStorageMb} MB`} storage`);
  }
  f.push("Contact form");
  return f;
}

function getFeatures(plan: PlanData): string[] {
  if (plan.featuresJson) {
    try {
      const parsed = JSON.parse(plan.featuresJson);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed as string[];
    } catch { /* fall through */ }
  }
  return buildAutoFeatures(plan);
}

const BADGE_COLORS: Record<string, string> = {
  blue:   "bg-blue-600 text-white",
  purple: "bg-purple-600 text-white",
  green:  "bg-green-600 text-white",
  orange: "bg-orange-500 text-white",
  gray:   "bg-gray-600 text-white",
  gold:   "bg-yellow-500 text-white",
};

const RING_COLORS: Record<string, string> = {
  blue:   "ring-blue-500",
  purple: "ring-purple-500",
  green:  "ring-green-500",
  orange: "ring-orange-400",
  gray:   "ring-gray-400",
  gold:   "ring-yellow-400",
};

interface PricingSectionProps {
  plans: PlanData[];
  fullPage?: boolean;
}

export function PricingSection({ plans, fullPage = false }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);
  const hasAnnual = plans.some((p) => p.annualPriceCents > 0);

  return (
    <div className="space-y-10">

      {/* Annual / Monthly toggle */}
      {hasAnnual && (
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-gray-900" : "text-gray-400"}`}>Monthly</span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            onClick={() => setAnnual((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${annual ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${annual ? "translate-x-6" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-gray-900" : "text-gray-400"}`}>Annual</span>
          {annual && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
              <Zap className="h-3 w-3" /> Save up to 20%
            </span>
          )}
        </div>
      )}

      {/* Plan cards — all white, equal styling */}
      <div className={`grid gap-6 ${plans.length === 3 ? "md:grid-cols-3" : plans.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : "max-w-sm mx-auto"}`}>
        {plans.map((plan) => {
          const hasFeatured = !!plan.featuredLabel;
          const badgeClass  = BADGE_COLORS[plan.badgeColor] ?? BADGE_COLORS.gray;
          const ringClass   = RING_COLORS[plan.badgeColor]  ?? RING_COLORS.gray;
          const features    = getFeatures(plan);

          const annualMonthly = annual && plan.annualPriceCents > 0
            ? formatAnnualMonthly(plan.annualPriceCents)
            : null;
          const displayPrice = annualMonthly ?? formatMonthlyPrice(plan.monthlyPriceCents);
          const isFree = plan.monthlyPriceCents === 0;

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-white flex flex-col gap-6 p-8 transition-all hover:shadow-lg ${
                hasFeatured ? `ring-2 ${ringClass} shadow-lg` : "border-gray-200"
              }`}
            >
              {/* Featured badge */}
              {hasFeatured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap ${badgeClass}`}>
                    {plan.featuredLabel}
                  </span>
                </div>
              )}

              {/* Name + price */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-gray-900">{displayPrice}</span>
                  <span className="text-sm text-gray-400">{isFree ? "/forever" : "/mo"}</span>
                </div>
                {annual && plan.annualPriceCents > 0 && (
                  <p className="text-xs text-gray-400 mt-1">
                    Billed {formatAnnualTotal(plan.annualPriceCents)}/year
                  </p>
                )}
                {plan.description && (
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{plan.description}</p>
                )}
              </div>

              {/* Feature list */}
              <ul className="space-y-2.5 flex-1">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-500" />
                    <span className="text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <Link
                href={isFree
                  ? "/register"
                  : `/register?plan=${plan.tier.toLowerCase()}${annual ? "&billing=annual" : ""}`
                }
                className={`block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-colors ${
                  hasFeatured
                    ? `${badgeClass.split(" ")[0]} text-white hover:opacity-90`
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isFree ? "Get Started Free" : `Start ${plan.name}`}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-sm text-gray-400">
        No credit card required for Free plan · Cancel anytime · 30-day money-back guarantee
      </p>

      {/* Full-page FAQ */}
      {fullPage && (
        <div className="max-w-2xl mx-auto pt-8 border-t border-gray-100 space-y-6">
          <h3 className="text-lg font-bold text-gray-900 text-center">Common questions</h3>
          {[
            { q: "Can I switch plans later?", a: "Yes — upgrade or downgrade at any time. Changes take effect immediately. If you upgrade mid-cycle you're charged a prorated amount." },
            { q: "What happens if I exceed my book limit?", a: "You can still view and edit existing books, but you won't be able to add new ones until you upgrade or remove a book." },
            { q: "Do I need a payment processor for digital sales?", a: "Yes — direct sales use Stripe. You connect your own Stripe account so payments go directly to you. AuthorLoft does not take a transaction cut." },
            { q: "Can I use my own domain name?", a: "Custom domains are available on Standard and Premium plans. You point your domain's DNS to AuthorLoft and we handle the rest." },
            { q: "Is there a contract or lock-in?", a: "No contract, no lock-in. Monthly plans can be cancelled anytime. Annual plans are billed yearly and include a 30-day money-back window." },
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
