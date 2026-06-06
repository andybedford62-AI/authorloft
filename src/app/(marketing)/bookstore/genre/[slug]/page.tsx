import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
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
  const name = titleCaseFromSlug(slug);
  const title = `${name} Books by Independent Authors | AuthorLoft Bookstore`;
  const description = `Discover ${name.toLowerCase()} books from independent authors on AuthorLoft. Browse, then buy directly from each author's own site.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/bookstore/genre/${slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE}/bookstore/genre/${slug}`,
      images: [{ url: `${BASE}/og-home.png`, width: 1200, height: 630, alt: `${name} books on AuthorLoft` }],
    },
    twitter: { card: "summary_large_image", title, description, images: [`${BASE}/og-home.png`] },
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

  return (
    <div className="min-h-screen bg-[#F0EDE4]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[#DCDBD3]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #3a2417 0%, #5c3a22 40%, #7a4f2e 100%)" }}
        />
        <div aria-hidden className="absolute inset-0 bg-[#1B2B47]/30" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-14">
          <Link
            href="/bookstore"
            className="inline-flex items-center gap-1.5 text-sm text-[#F0D9B5] hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All books
          </Link>
          <p className="text-xs font-mono uppercase tracking-widest text-[#F0D9B5] mb-2 flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" /> Genre
          </p>
          <h1 className="text-3xl sm:text-5xl font-serif text-white font-normal leading-tight drop-shadow-sm">
            {name}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#F5ECDD]">
            {filtered.length} book{filtered.length !== 1 ? "s" : ""} from independent authors
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <BookstoreGrid books={filtered} allGenres={[]} />

        {/* Interlink to other genres (SEO + discovery) */}
        {otherGenres.length > 0 && (
          <section className="mt-14 pt-10 border-t border-[#DCDBD3]">
            <h2 className="font-serif text-xl text-[#1B2B47] mb-4">Explore other genres</h2>
            <div className="flex flex-wrap gap-2.5">
              {otherGenres.map((g) => (
                <Link
                  key={g.slug}
                  href={`/bookstore/genre/${g.slug}`}
                  className="group inline-flex items-center gap-2 bg-white border border-[#DCDBD3] rounded-xl px-4 py-2.5 hover:border-[#C26A4A] hover:shadow-sm transition-all"
                >
                  <span className="text-sm font-medium text-[#1B2B47] group-hover:text-[#C26A4A] transition-colors">
                    {g.name}
                  </span>
                  <span className="text-xs text-[#9b8e7e] bg-[#F0EDE4] rounded-full px-2 py-0.5">{g.count}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Author CTA */}
      <div className="bg-[#1B2B47] py-14 px-4 text-center">
        <h2 className="font-serif text-2xl text-[#E8E5DD] font-normal mb-4">
          Write {name.toLowerCase()}? <span className="italic text-[#D4AE6A]">List your book free.</span>
        </h2>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-[#B8893D] text-[#1B2B47] font-semibold px-6 py-3 rounded-full hover:bg-[#D4AE6A] transition-colors"
        >
          Get Started Free
        </Link>
      </div>
    </div>
  );
}
