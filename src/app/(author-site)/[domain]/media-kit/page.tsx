import { notFound } from "next/navigation";
import { PageBanner } from "@/components/author-site/page-banner";
import { SocialLinks } from "@/components/author-site/social-links";
import { getAuthorByDomain, getAuthorBooks } from "@/lib/author-queries";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);
  if (!author.plan?.mediaKitEnabled) return { title: "Not Found" };
  const authorName = author.displayName || author.name;
  return {
    title: "Media Kit",
    description: `Press resources and downloadable materials for ${authorName}.`,
  };
}

export default async function MediaKitPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorByDomain(domain);

  if (!author.plan?.mediaKitEnabled) notFound();

  const books = await getAuthorBooks(author.id);
  const authorName  = author.displayName || author.name;
  const accentColor = author.accentColor || "#1a2236";
  const bio = (author as any).pressBio || (author as any).bio || (author as any).shortBio || "";
  const pressTitle   = (author as any).pressTitle || null;
  const pressContact = (author as any).pressContact || author.contactEmail || null;

  const credentials: string[] = Array.isArray((author as any).credentials)
    ? ((author as any).credentials as string[]).filter((c: string) => c?.trim())
    : [];

  const socialLinks = [
    { href: author.linkedinUrl,   icon: "linkedin",   label: "LinkedIn"    },
    { href: author.twitterUrl,    icon: "twitter",    label: "Twitter / X" },
    { href: author.instagramUrl,  icon: "instagram",  label: "Instagram"   },
    { href: author.facebookUrl,   icon: "facebook",   label: "Facebook"    },
    { href: author.youtubeUrl,    icon: "youtube",    label: "YouTube"     },
  ].filter((s): s is { href: string; icon: string; label: string } => !!s.href);

  const downloadProxy = (url: string, filename: string) =>
    `/api/author-site/media-kit/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

  return (
    <div className="min-h-screen bg-[var(--page-bg,#f9f7f4)]">
      <PageBanner
        label="For Press & Media"
        title="Media Kit"
        subtitle="Download press-ready materials and learn more about the author."
        accentColor={accentColor}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* Author Photo + Biography */}
        <section className="grid md:grid-cols-[180px,1fr] gap-8 items-start">
          <div className="space-y-3">
            {author.profileImageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={author.profileImageUrl}
                  alt={authorName}
                  className="w-full rounded-xl shadow-md object-cover aspect-[3/4] max-h-[240px]"
                />
                <a
                  href={downloadProxy(author.profileImageUrl, `${authorName.replace(/\s+/g, "-")}-photo.jpg`)}
                  className="block w-full text-center px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ color: accentColor, borderColor: accentColor }}
                >
                  Download Author Photo
                </a>
              </>
            ) : (
              <div className="w-full aspect-[3/4] rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                No photo available
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 font-heading">{authorName}</h2>
              {pressTitle && (
                <p className="text-base text-gray-500 mt-0.5">{pressTitle}</p>
              )}
            </div>
            {bio ? (
              <div
                className="prose prose-sm text-gray-700 max-w-none"
                dangerouslySetInnerHTML={{ __html: bio }}
              />
            ) : (
              <p className="text-gray-400 italic text-sm">Biography coming soon.</p>
            )}
            <p className="text-xs text-gray-400 italic">
              Feel free to use this biography in print or digital publications.
            </p>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 font-heading border-b pb-2" style={{ borderColor: accentColor }}>
            Quick Reference
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Full Name</p>
              <p className="text-sm font-medium text-gray-900">{authorName}</p>
            </div>
            {pressTitle && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Title</p>
                <p className="text-sm font-medium text-gray-900">{pressTitle}</p>
              </div>
            )}
            {pressContact && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Press Contact</p>
                <a href={`mailto:${pressContact}`} className="text-sm font-medium" style={{ color: accentColor }}>
                  {pressContact}
                </a>
              </div>
            )}
            {credentials.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Credentials</p>
                <p className="text-sm font-medium text-gray-900">{credentials.join(" | ")}</p>
              </div>
            )}
          </div>
        </section>

        {/* Books for Press */}
        {books.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 font-heading border-b pb-2" style={{ borderColor: accentColor }}>
              Books for Press
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {books.map((book) => (
                <div key={book.id} className="space-y-1.5">
                  {book.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full rounded-md shadow-sm object-cover aspect-[2/3] max-h-[160px]"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] max-h-[160px] rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                      No cover
                    </div>
                  )}
                  <p className="text-xs font-medium text-gray-900 leading-snug line-clamp-2">{book.title}</p>
                  {book.coverImageUrl && (
                    <a
                      href={downloadProxy(book.coverImageUrl, `${book.slug}-cover.jpg`)}
                      className="block text-center text-xs font-medium px-2 py-1 border rounded transition-colors hover:bg-gray-50"
                      style={{ color: accentColor, borderColor: accentColor }}
                    >
                      Download
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Connect */}
        {socialLinks.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 font-heading border-b pb-2" style={{ borderColor: accentColor }}>
              Connect
            </h2>
            <SocialLinks links={socialLinks} accentColor={accentColor} />
          </section>
        )}
      </div>
    </div>
  );
}
