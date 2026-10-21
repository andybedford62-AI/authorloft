import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { sanitize } from "@/lib/sanitize";
import { PLATFORM_AUTHOR, PLATFORM_AUTHOR_URL, PLATFORM_BASE } from "@/lib/platform-author";

export const revalidate = 300;

const TITLE = "About AuthorLoft and Its Founder";
const DESCRIPTION =
  "AuthorLoft was built by Anthony Bedford, a thriller author with thirty years in software, so indie authors can sell direct and keep their readers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { type: "website", title: `${TITLE} | AuthorLoft`, description: DESCRIPTION, images: ["/og-home.png"] },
  twitter: { card: "summary_large_image", title: `${TITLE} | AuthorLoft`, description: DESCRIPTION, images: ["/og-home.png"] },
};

// What is live today, taken from the shipped list in docs/CHANGELOG.md and the plan pages.
const LIVE_NOW = [
  "Your own site for books, courses, and music, on an AuthorLoft address or your own domain",
  "Direct sales through your own Stripe account, with no AuthorLoft transaction cut",
  "An email list you own, with newsletters and reader magnets",
  "Pre-orders, launch countdowns, and ARC management",
  "Reader analytics and a media kit",
  "A listing in the AuthorLoft bookstore",
  "AI-written social posts through Social Promote",
];

export default async function AboutPage() {
  const founder = await prisma.testimonial
    .findFirst({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      select: { authorName: true, authorRole: true, quote: true },
    })
    .catch(() => null);

  const aboutLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    url: `${PLATFORM_BASE}/about`,
    name: TITLE,
    description: DESCRIPTION,
    about: { "@type": "Organization", name: "AuthorLoft", url: PLATFORM_BASE },
    mainEntity: {
      "@type": "Person",
      name: PLATFORM_AUTHOR.name,
      url: PLATFORM_AUTHOR_URL,
      jobTitle: PLATFORM_AUTHOR.jobTitle,
      sameAs: PLATFORM_AUTHOR.sameAs,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${PLATFORM_BASE}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${PLATFORM_BASE}/about` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#d6a94a] mb-3">About</p>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#f3ecdb] leading-tight mb-8">
          Why I built AuthorLoft
        </h1>

        <div className="flex items-center gap-4 mb-8">
          <Image
            src="/AndyBedford-casual2.jpg"
            alt={`${PLATFORM_AUTHOR.name}, founder of AuthorLoft`}
            width={96}
            height={96}
            sizes="96px"
            className="rounded-full object-cover shrink-0"
            style={{ width: 96, height: 96, objectPosition: "50% 25%" }}
          />
          <div>
            <p className="text-lg font-semibold text-[#f3ecdb]">{PLATFORM_AUTHOR.name}</p>
            <p className="text-sm text-[#93a0bc]">{founder?.authorRole || PLATFORM_AUTHOR.jobTitle}</p>
            <a
              href={PLATFORM_AUTHOR.sameAs[0]}
              target="_blank"
              rel="noopener noreferrer me"
              className="text-sm text-[#d6a94a] hover:underline"
            >
              LinkedIn →
            </a>
          </div>
        </div>

        {founder?.quote && (
          <div
            className="rich-content rich-content-invert text-[#c7cede] mb-12"
            dangerouslySetInnerHTML={{ __html: sanitize(founder.quote) }}
          />
        )}

        <section className="mb-12">
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">What you can do with it today</h2>
          <ul className="space-y-2 text-[#c7cede] list-disc pl-5">
            {LIVE_NOW.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="text-[#93a0bc] mt-4">
            AuthorLoft is still growing. If something you need is missing,{" "}
            <Link href="/contact" className="text-[#d6a94a] hover:underline">tell me</Link>.
            What you ask for shapes what gets built next.
          </p>
        </section>

        <section id="how-we-write" className="mb-12 scroll-mt-24">
          <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">How we write and review articles</h2>
          <p className="text-[#c7cede]">
            I write and review every article, guide and news post on AuthorLoft. An AI assistant
            (Claude, from Anthropic) produces first drafts, and I read and approve each one before
            it is published. No article goes live without that review.
          </p>
        </section>

        <section className="flex flex-wrap gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#d6a94a] text-[#16233d] font-semibold px-6 py-3 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
          >
            Start free →
          </Link>
          <Link
            href={`/author/${PLATFORM_AUTHOR.slug}`}
            className="inline-flex items-center gap-2 border border-[#d6a94a]/40 text-[#f3ecdb] px-6 py-3 rounded-[6px] hover:border-[#d6a94a] transition-colors"
          >
            Read my articles and guides
          </Link>
        </section>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </div>
  );
}
