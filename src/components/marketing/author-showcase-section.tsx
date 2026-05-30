"use client";

import Image from "next/image";
import Link from "next/link";

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
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

function ShowcaseCard({ author, platformDomain }: { author: ShowcaseAuthor; platformDomain: string }) {
  const siteUrl = author.customDomain
    ? `https://${author.customDomain}`
    : `https://${author.slug}.${platformDomain}`;
  const displayName = author.displayName || author.name;
  const style       = author.showcaseStyle ?? "photo";
  const showImage   = style !== "text";
  const imageUrl    = style === "book"
    ? (author.books[0]?.coverImageUrl ?? author.profileImageUrl)
    : (author.profileImageUrl ?? author.books[0]?.coverImageUrl);

  return (
    <a
      href={siteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="showcase-card"
      style={{
        display:        'block',
        background:     ML.midnight,
        border:         '1px solid rgba(255,255,255,0.10)',
        borderRadius:   20,
        overflow:       'hidden',
        textDecoration: 'none',
        transition:     'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
      }}
    >
      {/* Image area */}
      {showImage && (
        <div style={{ height: 220, background: '#080f1c', position: 'relative', overflow: 'hidden' }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName}
              fill
              className={`opacity-90 transition-opacity hover:opacity-100 ${style === "book" ? "object-contain p-6" : "object-cover"}`}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 64, color: ML.brass2, opacity: 0.4 }}>
                {displayName[0]}
              </span>
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to top, #0F1A2D, transparent)', pointerEvents: 'none' }} />
        </div>
      )}

      {/* Info */}
      <div style={{ padding: showImage ? '20px 22px 22px' : '28px 22px' }}>
        <p style={{
          fontFamily: 'var(--font-heading, serif)',
          fontSize:   18,
          fontWeight: 400,
          color:      ML.bone,
          margin:     '0 0 6px',
          lineHeight: 1.25,
        }}>
          {displayName}
        </p>
        {author.tagline && (
          <p style={{
            fontFamily:          'Georgia, serif',
            fontStyle:           'italic',
            fontSize:            13,
            color:               ML.slate,
            margin:              '0 0 14px',
            lineHeight:          1.55,
            overflow:            'hidden',
            display:             '-webkit-box',
            WebkitLineClamp:     2,
            WebkitBoxOrient:     'vertical',
          } as React.CSSProperties}>
            {author.tagline}
          </p>
        )}
        <span style={{
          display:        'inline-flex',
          alignItems:     'center',
          gap:            6,
          fontFamily:     'var(--font-geist-mono, monospace)',
          fontSize:       11,
          color:          ML.brass2,
          letterSpacing:  '0.06em',
          textTransform:  'uppercase',
        }}>
          Visit site
          <span style={{ fontSize: 14 }}>→</span>
        </span>
      </div>
    </a>
  );
}

export function AuthorShowcaseSection({
  authors,
  platformDomain,
}: {
  authors:        ShowcaseAuthor[];
  platformDomain: string;
}) {
  if (authors.length === 0) return null;

  return (
    <>
      <style>{`
        .showcase-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.5);
          border-color: rgba(212,174,106,0.35) !important;
        }
      `}</style>

      <section style={{ background: ML.ink, padding: '100px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{
              fontFamily:    'var(--font-geist-mono, monospace)',
              fontSize:      11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         ML.brass2,
              marginBottom:  16,
            }}>
              · {authors.length} live author {authors.length === 1 ? 'site' : 'sites'} ·
            </p>
            <h2 style={{
              fontFamily:    'var(--font-heading, serif)',
              fontSize:      'clamp(38px, 5vw, 72px)',
              fontWeight:    400,
              lineHeight:    0.95,
              letterSpacing: '-0.025em',
              color:         ML.bone,
              margin:        '0 0 20px',
            }}>
              Real sites.<br />
              <span style={{ fontStyle: 'italic', color: ML.brass2 }}>Real authors.</span>
            </h2>
            <p style={{
              fontFamily: 'Georgia, serif',
              fontSize:   17,
              lineHeight: 1.65,
              color:      `${ML.bone}bb`,
              maxWidth:   500,
              margin:     '0 auto',
            }}>
              Every site below was built by an independent author using AuthorLoft — no designers, no developers, no waiting.
            </p>
          </div>

          {/* Cards grid */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: authors.length === 1
              ? 'minmax(280px, 480px)'
              : authors.length === 2
              ? 'repeat(2, minmax(280px, 1fr))'
              : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap:                 24,
            justifyContent:      authors.length <= 2 ? 'center' : undefined,
          }}>
            {authors.map((author) => (
              <ShowcaseCard key={author.id} author={author} platformDomain={platformDomain} />
            ))}
          </div>

          {/* CTA */}
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <p style={{
              fontFamily:    'Georgia, serif',
              fontStyle:     'italic',
              fontSize:      16,
              color:         `${ML.bone}88`,
              marginBottom:  24,
            }}>
              Yours could be next.
            </p>
            <Link
              href="/register"
              style={{
                display:       'inline-flex',
                alignItems:    'center',
                gap:           10,
                padding:       '14px 32px',
                background:    ML.brass,
                color:         ML.midnight,
                fontFamily:    'inherit',
                fontSize:      15,
                fontWeight:    600,
                borderRadius:  999,
                textDecoration:'none',
                boxShadow:     '0 8px 24px -8px rgba(184,137,61,0.6)',
                transition:    'background 0.2s, transform 0.2s',
              }}
            >
              Build your site free
              <span style={{ fontSize: 16 }}>→</span>
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
