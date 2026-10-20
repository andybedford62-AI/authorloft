import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { PLATFORM_AUTHOR, PLATFORM_AUTHOR_URL, PLATFORM_BASE } from "@/lib/platform-author";

export const dynamic = "force-dynamic";

const TITLE = `${PLATFORM_AUTHOR.name}, Founder of AuthorLoft`;
const DESCRIPTION =
  "Anthony Bedford spent over thirty years building software platforms, then published thrillers and built AuthorLoft for indie authors. Read his articles and guides.";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== PLATFORM_AUTHOR.slug) return {};
  return {
    title: { absolute: TITLE },
    description: DESCRIPTION,
    alternates: { canonical: PLATFORM_AUTHOR_URL },
    openGraph: { type: "profile", title: TITLE, description: DESCRIPTION, url: PLATFORM_AUTHOR_URL },
    twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
  };
}

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== PLATFORM_AUTHOR.slug) notFound();

  const [posts, guides] = await Promise.all([
    prisma.platformPost.findMany({
      where: { isPublished: true, authorName: PLATFORM_AUTHOR.name },
      select: { title: true, slug: true, isNews: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
    }).catch(() => []),
    prisma.guide.findMany({
      where: { isPublished: true },
      select: { title: true, slug: true },
      orderBy: [{ sortOrder: "asc" }, { publishedAt: "desc" }],
    }).catch(() => []),
  ]);

  const blogPosts = posts.filter((p) => !p.isNews);
  const newsPosts = posts.filter((p) => p.isNews);

  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: PLATFORM_AUTHOR_URL,
    mainEntity: {
      "@type": "Person",
      name: PLATFORM_AUTHOR.name,
      url: PLATFORM_AUTHOR_URL,
      jobTitle: PLATFORM_AUTHOR.jobTitle,
      description: DESCRIPTION,
      worksFor: { "@type": "Organization", name: "AuthorLoft", url: PLATFORM_BASE },
      ...(PLATFORM_AUTHOR.sameAs.length > 0 && { sameAs: PLATFORM_AUTHOR.sameAs }),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${PLATFORM_BASE}/` },
      { "@type": "ListItem", position: 2, name: PLATFORM_AUTHOR.name, item: PLATFORM_AUTHOR_URL },
    ],
  };

  const listClass = "space-y-2";
  const linkClass = "text-[#c7cede] hover:text-[#d6a94a] transition-colors";

  return (
    <div className="min-h-screen bg-[#16233d]">
      <MarketingNav />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#d6a94a] mb-3">Author</p>
        <h1 className="font-serif italic text-4xl sm:text-5xl font-normal text-[#f3ecdb] leading-tight mb-2">
          {PLATFORM_AUTHOR.name}
        </h1>
        <p className="text-base text-[#93a0bc] mb-8">{PLATFORM_AUTHOR.jobTitle}</p>

        <div className="space-y-4 text-[#c7cede] leading-relaxed mb-12">
          <p>
            Anthony Bedford spent over thirty years building software platforms before he published his first book.
          </p>
          <p>
            As an indie author, he found that nobody builds a full platform with tools for authors. So he built the one
            he wanted: AuthorLoft hosts books, courses, and music from one dashboard and one login.
          </p>
          <p>
            He writes thrillers, and he writes the AuthorLoft articles and guides on selling direct, owning your reader
            list, and running your own author business.
          </p>
        </div>

        {blogPosts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">Articles</h2>
            <ul className={listClass}>
              {blogPosts.map((p) => (
                <li key={p.slug}><Link href={`/blog/${p.slug}`} className={linkClass}>{p.title}</Link></li>
              ))}
            </ul>
          </section>
        )}

        {guides.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">Guides</h2>
            <ul className={listClass}>
              {guides.map((g) => (
                <li key={g.slug}><Link href={`/guides/${g.slug}`} className={linkClass}>{g.title}</Link></li>
              ))}
            </ul>
          </section>
        )}

        {newsPosts.length > 0 && (
          <section className="mb-10">
            <h2 className="font-serif italic text-2xl text-[#f3ecdb] font-normal mb-4">AuthorLoft news</h2>
            <ul className={listClass}>
              {newsPosts.map((p) => (
                <li key={p.slug}><Link href={`/news/${p.slug}`} className={linkClass}>{p.title}</Link></li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </div>
  );
}
