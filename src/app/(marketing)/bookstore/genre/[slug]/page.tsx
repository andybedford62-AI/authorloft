import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { BookstoreGrid } from "@/components/marketing/bookstore-grid";
import { getBookstoreData } from "@/lib/bookstore";
import { slugify } from "@/lib/utils";

export const revalidate = 1800;

const PLATFORM = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com";
const BASE = `https://www.${PLATFORM}`;

function titleCaseFromSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Use the real genre name (correct apostrophes/casing); fall back to the slug.
  const { genres } = await getBookstoreData().catch(() => ({ genres: [] as { slug: string; name: string }[] }));
  const name = genres.find((g) => g.slug === slug)?.name ?? titleCaseFromSlug(slug);
  // Avoid "Books Books" when the genre name already ends in "Book(s)".
  const lead = /books?$/i.test(name) ? name : `${name} Books`;
  // Brandless page title — the root layout template appends " | AuthorLoft".
  const pageTitle = `${lead} by Independent Authors`;
  const ogTitle = `${lead} — AuthorLoft Bookstore`;
  const description = `Discover ${lead.toLowerCase()} from independent authors on AuthorLoft. Browse, then buy directly from each author's own site.`;
  return {
    title: pageTitle,
    description,
    alternates: { canonical: `${BASE}/bookstore/genre/${slug}` },
    openGraph: {
      type: "website",
      title: ogTitle,
      description,
      url: `${BASE}/bookstore/genre/${slug}`,
      images: [{ url: `${BASE}/og-home.png`, width: 1200, height: 630, alt: `${lead} on AuthorLoft` }],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description, images: [`${BASE}/og-home.png`] },
  };
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { books, genres } = await getBookstoreData();

  const genre = genres.find((g) => g.slug === slug);
  const filtered = books.filter((b) => b.genres.some((n) => slugify(n) === slug));

  if (!genre || filtered.length === 0) notFound();

  const name = genre.name;
  const otherGenres = genres.filter((g) => g.slug !== slug).slice(0, 10);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${name} Books — AuthorLoft Bookstore`,
    url: `${BASE}/bookstore/genre/${slug}`,
    isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: BASE },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filtered.length,
      itemListElement: filtered.slice(0, 100).map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Book",
          name: b.title,
          url: b.bookUrl,
          author: { "@type": "Person", name: b.authorName },
          ...(b.coverImageUrl ? { image: b.coverImageUrl } : {}),
        },
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Bookstore", item: `${BASE}/bookstore` },
      { "@type": "ListItem", position: 3, name: name, item: `${BASE}/bookstore/genre/${slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-vault-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <MarketingNav />

      {/* Hero — unified brand band (matches the main Bookstore page) */}
      <MarketingPageHeader
        eyebrow="Bookstore Genre"
        title={name}
        subtitle={`${filtered.length} book${filtered.length !== 1 ? "s" : ""} from independent authors.`}
        backgroundImage="/bookstore-header.png"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <Link
          href="/bookstore"
          className="inline-flex items-center gap-1.5 text-sm text-vault-mute hover:text-vault-ink transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> All books
        </Link>

        <BookstoreGrid books={filtered} allGenres={[]} />

        {/* Interlink to other genres (SEO + discovery) */}
        {otherGenres.length > 0 && (
          <section className="mt-14 pt-10 border-t border-vault-ink/12">
            <h2 className="font-vault-display italic text-xl text-vault-ink mb-4">Explore other genres</h2>
            <div className="flex flex-wrap gap-2.5">
              {otherGenres.map((g) => (
                <Link
                  key={g.slug}
                  href={`/bookstore/genre/${g.slug}`}
                  className="group inline-flex items-center gap-2 bg-vault-surf border border-vault-ink/12 rounded-xl px-4 py-2.5 hover:border-vault-gold hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-vault-ink group-hover:text-vault-gold transition-colors">
                    {g.name}
                  </span>
                  <span className="text-xs text-vault-mute bg-vault-surf-2 rounded-full px-2 py-0.5">{g.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Author CTA */}
      <div className="bg-vault-surf-2 py-14 px-4 text-center">
        <h2 className="font-vault-display italic text-2xl text-vault-ink font-normal mb-4">
          Write {name.toLowerCase()}? <span className="italic text-vault-gold">List your book free.</span>
        </h2>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-vault-gold text-vault-bg font-semibold px-6 py-3 rounded-vault hover:bg-vault-gold-light transition-colors"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
