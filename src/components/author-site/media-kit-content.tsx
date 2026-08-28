import { SocialLinks } from "@/components/author-site/social-links";
import { sanitize } from "@/lib/sanitize";

interface MediaKitBook {
  id: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
}

interface MediaKitContentProps {
  domain: string;
  authorName: string;
  accentColor: string;
  profileImageUrl: string | null;
  bio: string;
  pressTitle: string | null;
  pressContact: string | null;
  credentials: string[];
  socialLinks: { href: string; icon: string; label: string }[];
  books: MediaKitBook[];
}

// Body of the former standalone /media-kit page, now rendered as a tab on
// /about (see about-media-kit-tabs.tsx) instead of its own page + nav link.
// Deliberately has no PageBanner of its own -- the About page's banner
// stays constant across both tabs, same as the Books/Bundles precedent.
export function MediaKitContent({
  domain, authorName, accentColor, profileImageUrl, bio,
  pressTitle, pressContact, credentials, socialLinks, books,
}: MediaKitContentProps) {
  const downloadProxy = (url: string, filename: string) =>
    `/api/author-site/media-kit/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 flex justify-center">
        <a
          href={`/api/author-site/media-kit/pdf?domain=${encodeURIComponent(domain)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download Full Media Kit (PDF)
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-14">

        {/* Author Photo + Biography */}
        <section className="grid md:grid-cols-2 gap-6 items-start">

          {/* Photo card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profileImageUrl}
                alt={authorName}
                className="w-full h-auto block"
                style={{ maxHeight: "520px", objectFit: "contain" }}
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                No photo available
              </div>
            )}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3.75 3.75h16.5A.75.75 0 0121 4.5v12a.75.75 0 01-.75.75H3.75A.75.75 0 013 16.5v-12a.75.75 0 01.75-.75z" />
                  </svg>
                </span>
                <span className="text-sm font-semibold text-gray-800">Author Photo</span>
              </div>
              <p className="text-xs text-gray-500">High-resolution author portrait for press and publications.</p>
              {profileImageUrl && (
                <a
                  href={downloadProxy(profileImageUrl, `${authorName.replace(/\s+/g, "-")}-photo.jpg`)}
                  className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                  style={{ color: accentColor, borderColor: "#d1d5db" }}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Photo
                </a>
              )}
            </div>
          </div>

          {/* Biography card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <span className="text-sm font-semibold text-gray-800">Press Biography</span>
            </div>

            {bio ? (
              <div className="bg-gray-50 rounded-xl p-4">
                <div
                  className="text-sm text-gray-700 leading-relaxed
                    [&_p]:mb-3 [&_p:last-child]:mb-0
                    [&_strong]:font-semibold [&_strong]:text-gray-900
                    [&_em]:italic
                    [&_u]:underline
                    [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2
                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-2
                    [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mb-1
                    [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-3
                    [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-3
                    [&_li]:mb-1
                    [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: sanitize(bio) }}
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-400 italic text-sm">Biography coming soon.</p>
              </div>
            )}

            <p className="text-xs text-gray-400 italic">
              Feel free to use this biography in print or digital publications.
            </p>

            {bio && (
              <a
                href={`/api/author-site/media-kit/bio?domain=${encodeURIComponent(domain)}`}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors hover:bg-gray-50"
                style={{ color: accentColor, borderColor: "#d1d5db" }}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download Biography (.txt)
              </a>
            )}
          </div>
        </section>

        {/* Quick Reference */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 author-font-heading border-b pb-2" style={{ borderColor: accentColor }}>
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
            <h2 className="text-xl font-bold text-gray-900 author-font-heading border-b pb-2" style={{ borderColor: accentColor }}>
              Books for Press
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {books.map((book) => (
                <div key={book.id} className="flex flex-col gap-1.5">
                  <div className="h-28 flex items-center justify-center">
                    {book.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverImageUrl}
                        alt={book.title}
                        className="h-28 w-auto rounded-md shadow-sm object-contain"
                      />
                    ) : (
                      <div className="h-28 w-full rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                        No cover
                      </div>
                    )}
                  </div>
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
            <h2 className="text-xl font-bold text-gray-900 author-font-heading border-b pb-2" style={{ borderColor: accentColor }}>
              Connect
            </h2>
            <SocialLinks links={socialLinks} accentColor={accentColor} />
          </section>
        )}
      </div>
    </div>
  );
}
