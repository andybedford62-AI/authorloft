import type { Metadata } from "next";
import Link from "next/link";
import { getOgImage } from "@/lib/seo-config";
import { prisma } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { FaqPageList, type FaqGroup } from "@/components/marketing/faq-page-list";
import { getCategories } from "@/lib/categories";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("home");
  return {
    title: "Frequently Asked Questions",
    description: "Answers to common questions about AuthorLoft — plans, publishing, selling direct, and getting started as an independent author.",
    alternates: { canonical: "/faq" },
    openGraph: {
      type: "website",
      title: "FAQ | AuthorLoft",
      description: "Answers to common questions about AuthorLoft.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft FAQ" }],
    },
    twitter: { card: "summary_large_image", title: "FAQ | AuthorLoft", images: [ogImage] },
  };
}

export default async function FaqPage() {
  const [faqs, faqCategories] = await Promise.all([
    prisma.homepageFaq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, question: true, answer: true, category: true },
    }).catch(() => []),
    getCategories("faq"),
  ]);

  // Build category-ordered groups; anything uncategorised/unknown → "General".
  const GENERAL = "general";
  const nameBySlug = new Map(faqCategories.map((c) => [c.slug, c.name]));
  const order = faqCategories.map((c) => c.slug);

  const bucket = new Map<string, FaqGroup>();
  function groupFor(slug: string): FaqGroup {
    const key = slug || GENERAL;
    if (!bucket.has(key)) {
      bucket.set(key, { slug: key, name: nameBySlug.get(key) ?? (key === GENERAL ? "General" : key), items: [] });
    }
    return bucket.get(key)!;
  }

  for (const f of faqs) {
    const slug = f.category && nameBySlug.has(f.category) ? f.category : GENERAL;
    groupFor(slug).items.push({ id: f.id, question: f.question, answer: sanitize(f.answer) });
  }

  // Order groups by the category sort order, with General last.
  const groups: FaqGroup[] = [
    ...order.filter((s) => s !== GENERAL && bucket.has(s)).map((s) => bucket.get(s)!),
    ...(bucket.has(GENERAL) ? [bucket.get(GENERAL)!] : []),
  ].filter((g) => g.items.length > 0);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.authorloft.com/" },
      { "@type": "ListItem", position: 2, name: "FAQ", item: "https://www.authorloft.com/faq" },
    ],
  };

  // FAQ structured data for SEO.
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]+>/g, "").trim() },
    })),
  } : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F0EDE4" }}>
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="FAQ"
        title={<>Frequently asked, <span className="italic text-[#D4AE6A]">plainly answered</span></>}
        subtitle="Everything you need to know about AuthorLoft — plans, publishing, selling direct, and getting set up."
        backgroundImage="/faq-header.png"
      />

      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 20px 96px" }}>
        <FaqPageList groups={groups} />

        {/* Still need help */}
        <div style={{ marginTop: 64, background: "#1B2B47", borderRadius: 20, padding: "40px 32px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#D4AE6A", margin: "0 0 12px" }}>· Still have a question? ·</p>
          <h2 style={{ fontFamily: "var(--font-heading, serif)", fontSize: 26, fontWeight: 400, color: "#E8E5DD", margin: "0 0 16px" }}>We&apos;re happy to help</h2>
          <a href="mailto:hello@authorloft.com" style={{ display: "inline-block", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 14, color: "#1B2B47", background: "#B8893D", padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontWeight: 700 }}>
            hello@authorloft.com
          </a>
          <p style={{ marginTop: 20, fontFamily: "Georgia, serif", fontSize: 13, color: "rgba(232,229,221,0.5)" }}>
            <Link href="/" style={{ color: "#D4AE6A", textDecoration: "none" }}>← Back to AuthorLoft</Link>
          </p>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
    </div>
  );
}
