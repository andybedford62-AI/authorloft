import Image from "next/image";
import Link from "next/link";
import { GraduationCap, Pin, BarChart2, Award, Mail } from "lucide-react";
import { SocialLinks } from "@/components/author-site/social-links";
import { sanitize } from "@/lib/sanitize";
import { PageBanner } from "@/components/author-site/page-banner";
import { getAuthorByDomain, getAuthorBooks } from "@/lib/author-queries";
import { getAuthorBaseUrl } from "@/lib/site-url";
import { getAuthorBadges } from "@/lib/badges";
import { AuthorBadges } from "@/components/marketing/author-badges";
import { FoundingMemberBadge } from "@/components/marketing/founding-member-badge";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  const authorName = author.displayName || author.name;
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").trim();
  const description = (author.bio ? stripHtml(author.bio).slice(0, 160) : null)
    || author.shortBio
    || `Learn more about ${authorName}.`;
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
  const books = await getAuthorBooks(author.id);
  const badges = author.showBadges ? await getAuthorBadges(author.id) : [];

  const authorName = author.displayName || author.name;
  const firstName = authorName.split(" ")[0];
  const accentColor = author.accentColor || "#7B2D2D";

  const bioHtml = (author as any).bio || (author as any).shortBio || "<p>Bio coming soon.</p>";

  // Social / connect links
  const socialLinks = [
    { href: author.linkedinUrl,  icon: "linkedin",  label: "LinkedIn"    },
    { href: author.twitterUrl,   icon: "twitter",   label: "Twitter / X" },
    { href: author.instagramUrl, icon: "instagram", label: "Instagram"   },
    { href: author.facebookUrl,  icon: "facebook",  label: "Facebook"    },
    { href: author.youtubeUrl,   icon: "youtube",   label: "YouTube"     },
    { href: (author as any).supportUrl, icon: "heart", label: "Support" },
    ...(author.contactEmail ? [{ href: "/contact", icon: "mail", label: "Contact" }] : []),
  ].filter((s): s is { href: string; icon: string; label: string } => !!s.href);

  // Credential items — use custom credentials from branding if set
  const customCredentials = Array.isArray((author as any).credentials)
    ? ((author as any).credentials as string[]).filter((c: string) => c?.trim())
    : [];
  const credentials = customCredentials.length > 0
    ? customCredentials
    : ["Author", ...(books.length > 0 ? [`${books.length} ${books.length === 1 ? "Book" : "Books"} Published`] : [])];

  // About page stats from branding
  const rawStats = Array.isArray((author as any).aboutStats)
    ? (author as any).aboutStats as { value: string; label: string }[]
    : [];
  const aboutStats = [
    { value: String(books.length), label: books.length === 1 ? "Book Published" : "Books Published" },
    ...rawStats.filter((s) => s.value?.trim() && s.label?.trim()),
  ];

  const base = getAuthorBaseUrl(author);
  const sameAs = [
    author.linkedinUrl, author.twitterUrl, author.instagramUrl,
    author.facebookUrl, author.youtubeUrl,
  ].filter((u): u is string => !!u);

  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, "").trim();

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: authorName,
    url: base,
    ...(author.profileImageUrl && { image: author.profileImageUrl }),
    ...(author.tagline && { jobTitle: author.tagline }),
    description: (author as any).bio
      ? stripHtml((author as any).bio).slice(0, 300)
      : author.shortBio || `Independent author on AuthorLoft.`,
    ...(sameAs.length > 0 && { sameAs }),
    ...(books.length > 0 && {
      knowsAbout: "Writing, Publishing, Independent Author",
      mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/about` },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
      { "@type": "ListItem", position: 2, name: "About", item: `${base}/about` },
    ],
  };

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <PageBanner label="Biography" title="About the Author" accentColor={accentColor} />

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-col md:flex-row gap-10 items-start">

          {/* ── Left: Photo ──────────────────────────────────────────────────── */}
          <div className="flex-shrink-0 w-full md:w-[380px]">
            <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-md relative">
              {author.profileImageUrl ? (
                <Image
                  src={author.profileImageUrl}
                  alt={authorName}
                  fill
                  className="object-cover object-top"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl font-bold text-gray-300">
                  {author.name[0]}
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="mt-4 flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: accentColor }}
            >
              <Mail className="h-4 w-4" />
              Email {firstName}
            </Link>
          </div>

          {/* ── Right: Bio content ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Name + tagline */}
            <h2 className="text-3xl font-bold text-gray-900 font-heading">{authorName}</h2>
            {author.tagline && (
              <p className="mt-1 text-base font-semibold" style={{ color: accentColor }}>
                {author.tagline}
              </p>
            )}
            {(author as any).isFoundingMember && (
              <div className="mt-3">
                <FoundingMemberBadge since={(author as any).foundingMemberSince} />
              </div>
            )}

            <hr className="my-5 border-gray-200" />

            {/* Credentials */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4" style={{ color: accentColor }} />
                <h3 className="text-sm font-semibold text-gray-800">Credentials</h3>
              </div>
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Pin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: accentColor }} />
                <span>{credentials.join(" | ")}</span>
              </div>
            </div>

            {/* About Page Stats */}
            {aboutStats.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart2 className="h-4 w-4" style={{ color: accentColor }} />
                  <h3 className="text-sm font-semibold text-gray-800">By the Numbers</h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {aboutStats.map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center px-4 py-3 rounded-lg border"
                      style={{ borderColor: accentColor + "40", backgroundColor: accentColor + "08" }}
                    >
                      <span className="text-xl font-bold" style={{ color: accentColor }}>{stat.value}</span>
                      <span className="text-xs text-gray-500 mt-0.5 text-center">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement Badges */}
            {badges.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4" style={{ color: accentColor }} />
                  <h3 className="text-sm font-semibold text-gray-800">Achievements</h3>
                </div>
                <AuthorBadges badges={badges} accentColor={accentColor} />
              </div>
            )}

            {/* About (bio) */}
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-800 mb-2">About</h3>
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{ __html: sanitize(bioHtml) }}
              />
            </div>

            {/* Connect */}
            {socialLinks.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-gray-800 mb-3">Connect</h3>
                <SocialLinks links={socialLinks} accentColor={accentColor} variant="pill" />
              </div>
            )}

          </div>
        </div>
      </section>

    </div>
  );
}
