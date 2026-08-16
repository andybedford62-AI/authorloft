import Link from "next/link";
import { Check, X, Minus, ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import type { Cell, ComparisonData } from "@/lib/comparison-data";

function CellIcon({ v }: { v: Cell }) {
  if (v === "yes") return <Check className="h-5 w-5 text-emerald-500" aria-label="Yes" />;
  if (v === "limited") return <Minus className="h-5 w-5 text-amber-400" aria-label="Limited" />;
  return <X className="h-5 w-5 text-[#93a0bc]" aria-label="No" />;
}

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export function ComparisonPage({ data }: { data: ComparisonData }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Pricing", item: `${BASE}/pricing` },
      { "@type": "ListItem", position: 3, name: `AuthorLoft vs ${data.name}`, item: `${BASE}/compare/${data.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#16233d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Comparison"
        title={<>AuthorLoft vs <span className="italic text-[#d6a94a]">{data.name}</span></>}
        subtitle={data.subtitle}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Back to pricing */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-1.5 text-sm text-[#93a0bc] hover:text-[#d6a94a] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" /> Back to pricing &amp; comparisons
        </Link>

        {/* TL;DR */}
        <section className="mb-12">
          <p className="text-lg text-[#f3ecdb] leading-relaxed">{data.tldr}</p>
        </section>

        {/* Choose which */}
        <section className="grid sm:grid-cols-2 gap-4 mb-14">
          <div className="bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)] p-6">
            <h2 className="font-serif italic text-xl text-[#f3ecdb] mb-3">Choose AuthorLoft if…</h2>
            <ul className="space-y-2 text-sm text-[#c7cede]">
              {data.chooseUs.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)] p-6">
            <h2 className="font-serif italic text-xl text-[#f3ecdb] mb-3">Choose {data.name} if…</h2>
            <ul className="space-y-2 text-sm text-[#c7cede]">
              {data.chooseThem.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-14">
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] mb-5">Feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-[rgba(243,236,219,0.12)] bg-[#1e2f4d]">
            <table className="w-full text-sm min-w-[460px]">
              <thead>
                <tr className="border-b border-[rgba(243,236,219,0.12)] bg-[#243756]">
                  <th className="text-left font-semibold text-[#f3ecdb] px-4 py-3">Feature</th>
                  <th className="font-semibold text-[#f3ecdb] px-4 py-3 text-center">AuthorLoft</th>
                  <th className="font-semibold text-[#f3ecdb] px-4 py-3 text-center">{data.name}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.label} className="border-b border-[rgba(243,236,219,0.08)] last:border-0 align-top">
                    <td className="px-4 py-3 text-[#f3ecdb]">
                      {r.label}
                      {r.note && <span className="block text-xs text-[#93a0bc] mt-0.5">{r.note}</span>}
                    </td>
                    <td className="px-4 py-3"><span className="flex justify-center"><CellIcon v={r.us} /></span></td>
                    <td className="px-4 py-3"><span className="flex justify-center"><CellIcon v={r.them} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#93a0bc] mt-3">
            <Check className="inline h-3.5 w-3.5 text-emerald-500" /> Included ·{" "}
            <Minus className="inline h-3.5 w-3.5 text-amber-400" /> Limited ·{" "}
            <X className="inline h-3.5 w-3.5 text-[#93a0bc]" /> Not offered. Based on publicly described features; check
            each provider for the latest.
          </p>
        </section>

        {/* The core difference */}
        <section className="mb-14">
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] mb-4">The core difference</h2>
          <p className="text-[#c7cede] leading-relaxed">{data.coreDifference}</p>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {data.faqs.map((f) => (
              <div key={f.q} className="bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)] p-6">
                <h3 className="font-semibold text-[#f3ecdb] mb-2">{f.q}</h3>
                <p className="text-sm text-[#c7cede] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#243756] rounded-2xl px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#d6a94a] mb-3">· Start free ·</p>
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">
            Own your author business on AuthorLoft
          </h2>
          <p className="text-sm text-[#93a0bc] max-w-md mx-auto mb-6">
            Keep 100% of every sale, own your reader list, and grow on one platform — free to start, upgrade
            when you&apos;re ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#d6a94a] text-[#16233d] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-[#d6a94a] font-medium px-6 py-3 rounded-[6px] border border-[rgba(243,236,219,0.15)] hover:border-[#d6a94a] transition-colors"
            >
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
