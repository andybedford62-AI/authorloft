"use client";

import Image from "next/image";

type ShowcaseAuthor = {
  id:              string;
  slug:            string;
  displayName:     string | null;
  name:            string;
  tagline:         string | null;
  profileImageUrl: string | null;
  customDomain:    string | null;
  showcaseStyle:   string;
  books: { coverImageUrl: string | null; title: string }[];
};

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  slate: '#5C6E89', mist: '#D4DDEB',
};

function ShowcaseCard({ author, platformDomain }: { author: ShowcaseAuthor; platformDomain: string }) {
  const siteUrl = author.customDomain
    ? `https://${author.customDomain}`
    : `https://${author.slug}.${platformDomain}`;
  const displayName  = author.displayName || author.name;
  const style        = author.showcaseStyle ?? "photo";
  const showImage    = style !== "text";
  const imageUrl     = style === "book"
    ? (author.books[0]?.coverImageUrl ?? author.profileImageUrl)
    : (author.profileImageUrl ?? author.books[0]?.coverImageUrl);

  return (
    <a
      href={siteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="showcase-card"
      style={{
        display: 'block',
        background: ML.midnight,
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Image area — only for photo and book styles */}
      {showImage && (
        <div style={{ height: 160, background: '#0a1220', position: 'relative', overflow: 'hidden' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName}
              fill
              className={`opacity-85 ${style === "book" ? "object-contain p-3" : "object-cover"}`}
              sizes="240px"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 48, color: ML.brass2, opacity: 0.5 }}>
                {displayName[0]}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: showImage ? '16px 18px' : '24px 18px' }}>
        <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 16, fontWeight: 600, color: ML.bone, margin: '0 0 4px', lineHeight: 1.3 }}>
          {displayName}
        </p>
        {author.tagline && (
          <p style={{ fontSize: 12, color: ML.slate, margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' } as React.CSSProperties}>
            {author.tagline}
          </p>
        )}
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.brass2, marginTop: 10, letterSpacing: '0.05em' }}>
          View site →
        </p>
      </div>
    </a>
  );
}

export function AuthorShowcaseSection({
  authors,
  platformDomain,
}: {
  authors: ShowcaseAuthor[];
  platformDomain: string;
}) {
  if (authors.length === 0) return null;

  return (
    <>
      <style>{`
        .showcase-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.4);
        }
      `}</style>
      <section style={{ background: ML.ink, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 16 }}>
              · Real author sites ·
            </p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4.5vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 16px' }}>
              Built by <span style={{ fontStyle: 'italic', color: ML.brass2 }}>real authors</span>
            </h2>
            <p style={{ color: ML.mist, fontSize: 16, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
              These sites were created by AuthorLoft authors. Click any to see a live example of what you can build.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {authors.map((author) => (
              <ShowcaseCard key={author.id} author={author} platformDomain={platformDomain} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
