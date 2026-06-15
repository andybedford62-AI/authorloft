import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import type { Cell, ComparisonData } from "@/lib/comparison-data";

function CellIcon({ v }: { v: Cell }) {
  if (v === "yes") return <Check className="h-5 w-5 text-emerald-600" aria-label="Yes" />;
  if (v === "limited") return <Minus className="h-5 w-5 text-amber-500" aria-label="Limited" />;
  return <X className="h-5 w-5 text-gray-300" aria-label="No" />;
}

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

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Comparison"
        title={<>AuthorLoft vs <span className="italic text-[#D4AE6A]">{data.name}</span></>}
        subtitle={data.subtitle}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* TL;DR */}
        <section className="mb-12">
          <p className="text-lg text-[#3d3328] leading-relaxed">{data.tldr}</p>
        </section>

        {/* Choose which */}
        <section className="grid sm:grid-cols-2 gap-4 mb-14">
          <div className="bg-white rounded-2xl border border-[#DCDBD3] p-6">
            <h2 className="font-serif text-xl text-[#1B2B47] mb-3">Choose AuthorLoft if…</h2>
            <ul className="space-y-2 text-sm text-[#4d4337]">
              {data.chooseUs.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
          <div className="bg-white rounded-2xl border border-[#DCDBD3] p-6">
            <h2 className="font-serif text-xl text-[#1B2B47] mb-3">Choose {data.name} if…</h2>
            <ul className="space-y-2 text-sm text-[#4d4337]">
              {data.chooseThem.map((t) => <li key={t}>{t}</li>)}
            </ul>
          </div>
        </section>

        {/* Comparison table */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl text-[#1B2B47] mb-5">Feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-[#DCDBD3] bg-white">
            <table className="w-full text-sm min-w-[460px]">
              <thead>
                <tr className="border-b border-[#ECEAE2] bg-[#F7F5EF]">
                  <th className="text-left font-semibold text-[#1B2B47] px-4 py-3">Feature</th>
                  <th className="font-semibold text-[#1B2B47] px-4 py-3 text-center">AuthorLoft</th>
                  <th className="font-semibold text-[#1B2B47] px-4 py-3 text-center">{data.name}</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => (
                  <tr key={r.label} className="border-b border-[#F0EEE7] last:border-0 align-top">
                    <td className="px-4 py-3 text-[#3d3328]">
                      {r.label}
                      {r.note && <span className="block text-xs text-[#9b8e7e] mt-0.5">{r.note}</span>}
                    </td>
                    <td className="px-4 py-3"><span className="flex justify-center"><CellIcon v={r.us} /></span></td>
                    <td className="px-4 py-3"><span className="flex justify-center"><CellIcon v={r.them} /></span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#9b8e7e] mt-3">
            <Check className="inline h-3.5 w-3.5 text-emerald-600" /> Included ·{" "}
            <Minus className="inline h-3.5 w-3.5 text-amber-500" /> Limited ·{" "}
            <X className="inline h-3.5 w-3.5 text-gray-300" /> Not offered. Based on publicly described features; check
            each provider for the latest.
          </p>
        </section>

        {/* The core difference */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl text-[#1B2B47] mb-4">The core difference</h2>
          <p className="text-[#4d4337] leading-relaxed">{data.coreDifference}</p>
        </section>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="font-serif text-2xl text-[#1B2B47] mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {data.faqs.map((f) => (
              <div key={f.q} className="bg-white rounded-2xl border border-[#DCDBD3] p-6">
                <h3 className="font-semibold text-[#1B2B47] mb-2">{f.q}</h3>
                <p className="text-sm text-[#4d4337] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#1B2B47] rounded-2xl px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#D4AE6A] mb-3">· Start free ·</p>
          <h2 className="font-serif text-2xl text-[#E8E5DD] font-normal mb-4">
            Build your author home base on AuthorLoft
          </h2>
          <p className="text-sm text-[#D4DDEB] max-w-md mx-auto mb-6">
            A free hosted author site and newsletter capture to start — upgrade for a custom domain and direct sales
            when you&apos;re ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-[#D4AE6A] font-medium px-6 py-3 rounded-full border border-[#3a4a66] hover:border-[#D4AE6A] transition-colors"
            >
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
