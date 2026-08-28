import Link from "next/link";
import { Check } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { getSolutionHeroArt } from "@/components/marketing/solution-hero-art";
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
    <div className="min-h-screen bg-vault-bg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow={data.eyebrow}
        title={data.heroTitle}
        subtitle={data.heroSubtitle}
        heroArt={getSolutionHeroArt(data.slug)}
      />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="text-sm text-vault-mute mb-8">
          <ol className="flex items-center gap-1.5">
            <li><Link href="/" className="hover:text-vault-gold transition-colors">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/features" className="hover:text-vault-gold transition-colors">Features</Link></li>
            <li aria-hidden>/</li>
            <li className="text-vault-ink font-medium">{data.eyebrow}</li>
          </ol>
        </nav>

        {/* Intro */}
        <section className="mb-14">
          <p className="text-lg text-vault-ink leading-relaxed">{data.intro}</p>
        </section>

        {/* Feature sections */}
        {data.sections.map((section) => (
          <section key={section.title} className="mb-14">
            <h2 className="font-vault-display italic text-2xl text-vault-ink mb-3">{section.title}</h2>
            <p className="text-[#c7cede] leading-relaxed mb-5">{section.description}</p>
            <ul className="space-y-3">
              {section.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-vault-ink">
                  <Check className="h-5 w-5 text-vault-gold flex-shrink-0 mt-0.5" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Related guide link */}
        {data.relatedGuideSlug && (
          <section className="mb-14 bg-vault-surf rounded-2xl border border-vault-ink/12 p-6">
            <p className="text-sm text-vault-mute mb-1">Want to learn more?</p>
            <Link
              href={`/guides/${data.relatedGuideSlug}`}
              className="text-vault-gold font-medium hover:underline"
            >
              Read our in-depth guide &rarr;
            </Link>
          </section>
        )}

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="font-vault-display italic text-2xl text-vault-ink mb-5">Frequently asked questions</h2>
          <div className="space-y-4">
            {data.faqs.map((f) => (
              <div key={f.q} className="bg-vault-surf rounded-2xl border border-vault-ink/12 p-6">
                <h3 className="font-semibold text-vault-ink mb-2">{f.q}</h3>
                <p className="text-sm text-[#c7cede] leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-vault-surf-2 rounded-2xl px-6 py-10 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-vault-gold mb-3">· Start free ·</p>
          <h2 className="font-vault-display italic text-2xl text-vault-ink font-normal mb-4">
            Ready to take control of your author career?
          </h2>
          <p className="text-sm text-vault-mute max-w-md mx-auto mb-6">
            Join thousands of indie authors building their platform on AuthorLoft — free to start, upgrade when you&apos;re ready.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-vault-gold text-vault-bg font-semibold px-6 py-3 rounded-vault hover:bg-vault-gold-light transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-vault-gold font-medium px-6 py-3 rounded-vault border border-vault-ink/15 hover:border-vault-gold transition-colors"
            >
              See pricing
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
