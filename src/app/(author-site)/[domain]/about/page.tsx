import Link from "next/link";
import Image from "next/image";
import { BookOpen, ArrowRight } from "lucide-react";
import { NewsletterForm } from "@/components/author-site/newsletter-form";
import { SocialLinks } from "@/components/author-site/social-links";
import { getAuthorByDomain, getAuthorBooks, getAuthorGenres } from "@/lib/author-queries";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;
  const description = author.bio || author.shortBio || `Learn more about ${authorName}.`;
  const ogImages = author.profileImageUrl
    ? [{ url: author.profileImageUrl, alt: authorName }]
    : [];
  return {
    title: "About",
    description,
    openGraph: {
      title: `About ${authorName}`,
      description,
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card: ogImages.length > 0 ? "summary_large_image" : "summary",
      ...(ogImages.length > 0 && { images: [ogImages[0].url] }),
    },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const [books, genreTree] = await Promise.all([
    getAuthorBooks(author.id),
    getAuthorGenres(author.id),
  ]);
  const genres = genreTree.map((g) => ({ id: g.id, name: g.name }));
  const authorName = author.displayName || author.name;
  const accentColor = author.accentColor;

  const customStats = Array.isArray(author.aboutStats)
    ? (author.aboutStats as { value: string; label: string }[]).filter((s) => s.value && s.label)
    : [];
  const allStats = [
    { value: `${books.length}`, label: books.length === 1 ? "Book Published" : "Books Published" },
    ...customStats,
  ];

  const socialLinks = [
    { href: author.linkedinUrl,  icon: "linkedin",  label: "LinkedIn"    },
    { href: author.twitterUrl,   icon: "twitter",   label: "Twitter / X" },
    { href: author.instagramUrl, icon: "instagram", label: "Instagram"   },
    { href: author.facebookUrl,  icon: "facebook",  label: "Facebook"    },
    { href: author.youtubeUrl,   icon: "youtube",   label: "YouTube"     },
    ...(author.contactEmail ? [{ href: "/contact", icon: "mail", label: "Contact" }] : []),
  ].filter((s): s is { href: string; icon: string; label: string } => !!s.href);

  return (
    <div style={{ "--accent": accentColor } as React.CSSProperties}>

      {/* ── Hero banner ────────────────────────────────────────────────────── */}
      <section className="w-full py-16 px-4 relative overflow-hidden" style={{ backgroundColor: accentColor }}>
        {/* Subtle decorative ring */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10 bg-white pointer-events-none" />
        <div className="absolute -left-12 -bottom-20 w-64 h-64 rounded-full opacity-10 bg-white pointer-events-none" />

        <div className="max-w-5xl mx-auto relative flex flex-col sm:flex-row items-start sm:items-end gap-6">
          <div className="flex-1">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-2">
              About the Author
            </p>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
              {authorName}
            </h1>
            {author.tagline && (
              <p className="text-white/75 mt-3 text-lg max-w-xl leading-relaxed">
                {author.tagline}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Profile ────────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row gap-12 items-start">

          {/* Photo + social links */}
          <div className="flex-shrink-0 flex flex-col items-center gap-5">
            <div
              className="w-52 h-52 rounded-2xl overflow-hidden bg-gray-100 shadow-xl relative ring-4 ring-white"
              style={{ outline: `3px solid ${accentColor}20` }}
            >
              {author.profileImageUrl ? (
                <Image
                  src={author.profileImageUrl}
                  alt={authorName}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-gray-300">
                  {author.name[0]}
                </div>
              )}
            </div>

            {/* Social links */}
            <SocialLinks links={socialLinks} accentColor={accentColor} />
          </div>

          {/* Bio text */}
          <div className="flex-1 space-y-5">
            {author.tagline && (
              <p
                className="text-sm font-bold uppercase tracking-widest"
                style={{ color: accentColor }}
              >
                {author.tagline}
              </p>
            )}

            <div className="space-y-4">
              {(author.bio || author.shortBio || "Bio coming soon.")
                .split("\n\n")
                .map((para, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed text-base">
                    {para}
                  </p>
                ))}
            </div>

            {/* Credential pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white"
                style={{ backgroundColor: accentColor }}
              >
                <BookOpen className="h-3.5 w-3.5" />
                Author
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      {allStats.length > 0 && (
        <section className="border-t border-b border-gray-100 bg-gray-50 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className={`grid gap-8 ${allStats.length === 1 ? "grid-cols-1 max-w-xs" : allStats.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
              {allStats.map(({ value, label }) => (
                <div key={label} className="text-center space-y-1">
                  <div
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: accentColor }}
                  >
                    {value}
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Newsletter ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div
          className="rounded-2xl p-8 sm:p-10"
          style={{ backgroundColor: `${accentColor}12` }}
        >
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: accentColor }}>
              Newsletter
            </p>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Stay in the Loop</h2>
            <p className="text-gray-500 text-sm mb-6">
              Get notified about new releases, events, and exclusive updates — straight to your inbox. No spam, ever.
            </p>
            <NewsletterForm
              authorId={author.id}
              authorSlug={author.slug}
              accentColor={accentColor}
              genres={genres}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="w-full py-16 px-4" style={{ backgroundColor: accentColor }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to explore the books?</h2>
            <p className="text-white/70 mt-1">Browse the full catalog and find your next great read.</p>
          </div>
          <Link href="/books">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white font-semibold text-sm shadow hover:bg-gray-100 transition-colors"
              style={{ color: accentColor }}
            >
              Browse All Books
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}
