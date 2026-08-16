import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import type { LandingPageData } from "@/lib/landing-page-data";

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

export function LandingPage({ data }: { data: LandingPageData }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: data.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.metaTitle,
    description: data.metaDescription,
    url: `${BASE}/${data.slug}`,
    isPartOf: { "@type": "WebSite", url: `${BASE}/`, name: "AuthorLoft" },
    speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", "h2"] },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
        { "@type": "ListItem", position: 2, name: "Features", item: `${BASE}/features` },
        { "@type": "ListItem", position: 3, name: data.eyebrow, item: `${BASE}/${data.slug}` },
      ],
    },
  };

  return (
    <div className="min-h-screen bg-[#16233d]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow={data.eyebrow}
        title={data.heroTitle}
        subtitle={data.heroSubtitle}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-sm text-[#93a0bc] mb-8">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-[#d6a94a] transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/features" className="hover:text-[#d6a94a] transition-colors">Features</Link></li>
            <li aria-hidden>/</li>
            <li className="text-[#f3ecdb] font-medium">{data.eyebrow}</li>
          </ol>
        </nav>

        {/* Intro */}
        <section className="mb-14">
          <p className="text-lg text-[#f3ecdb] leading-relaxed">{data.intro}</p>
        </section>

        {/* Feature sections */}
        {data.sections.map((section) => (
          <section key={section.title} className="mb-14">
            <h2 className="font-serif italic text-2xl text-[#f3ecdb] mb-3">{section.title}</h2>
            <p className="text-[#c7cede] leading-relaxed mb-5">{section.description}</p>
            <ul className="space-y-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[#f3ecdb]">
                  <Check className="h-5 w-5 text-[#d6a94a] flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Related guide link */}
        {data.relatedGuideSlug && (
          <section className="mb-14 bg-[#1e2f4d] rounded-2xl border border-[rgba(243,236,219,0.12)] p-6">
            <p className="text-sm text-[#93a0bc] mb-1">Want to learn more?</p>
            <Link
              href={`/guides/${data.relatedGuideSlug}`}
              className="text-[#d6a94a] font-medium hover:underline"
            >
              Read our in-depth guide &rarr;
            </Link>
          </section>
        )}

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
            Ready to take control of your author career?
          </h2>
          <p className="text-sm text-[#93a0bc] max-w-md mx-auto mb-6">
            Join thousands of indie authors building their platform on AuthorLoft — free to start, upgrade when you&apos;re ready.
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
