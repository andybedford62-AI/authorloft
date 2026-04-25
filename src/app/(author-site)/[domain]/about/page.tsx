import Image from "next/image";
import { GraduationCap, Pin, BarChart2 } from "lucide-react";
import { SocialLinks } from "@/components/author-site/social-links";
import { sanitize } from "@/lib/sanitize";
import { PageBanner } from "@/components/author-site/page-banner";
import { getAuthorByDomain, getAuthorBooks } from "@/lib/author-queries";
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
  const books = await getAuthorBooks(author.id);

  const authorName = author.displayName || author.name;
  const accentColor = author.accentColor || "#7B2D2D";

  const bioHtml = (author as any).bio || (author as any).shortBio || "<p>Bio coming soon.</p>";

  // Social / connect links
  const socialLinks = [
    { href: author.linkedinUrl,  icon: "linkedin",  label: "LinkedIn"    },
    { href: author.twitterUrl,   icon: "twitter",   label: "Twitter / X" },
    { href: author.instagramUrl, icon: "instagram", label: "Instagram"   },
    { href: author.facebookUrl,  icon: "facebook",  label: "Facebook"    },
    { href: author.youtubeUrl,   icon: "youtube",   label: "YouTube"     },
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

  return (
    <div>

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
