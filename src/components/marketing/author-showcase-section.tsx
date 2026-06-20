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
  const siteUrl     = author.customDomain
    ? `https://${author.customDomain}`
    : `https://${author.slug}.${platformDomain}`;
  const displayName = author.displayName || author.name;
  const style       = author.showcaseStyle ?? "photo";
  const isBook      = style === "book";
  const isText      = style === "text";

  // Image source: book style uses cover, otherwise use profile photo
  const imageUrl = isBook
    ? (author.books[0]?.coverImageUrl ?? author.profileImageUrl)
    : (author.profileImageUrl ?? author.books[0]?.coverImageUrl);

  return (
    <a
      href={siteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="showcase-card"
      style={{
        display:        'flex',
        flexDirection:  'row',
        alignItems:     'stretch',
        background:     '#0d1829',
        border:         '1px solid rgba(255,255,255,0.09)',
        borderRadius:   18,
        overflow:       'hidden',
        textDecoration: 'none',
        transition:     'transform 0.25s, box-shadow 0.25s, border-color 0.25s',
        minHeight:      160,
      }}
    >
      {/* ── Left: image panel ─────────────────────────────── */}
      {!isText && (
        <div style={{
          flexShrink:      0,
          width:           isBook ? 110 : 148,
          background:      isBook ? '#080e1a' : '#0a1320',
          position:        'relative',
          overflow:        'hidden',
        }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={displayName}
              fill
              style={{
                objectFit:      isBook ? 'contain' : 'cover',
                objectPosition: isBook ? 'center'  : 'center 15%',
                padding:        isBook ? '10px'    : '0',
              }}
              sizes="160px"
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 52, color: ML.brass2, opacity: 0.4 }}>
                {displayName[0]}
              </span>
            </div>
          )}
          {/* subtle right-edge fade into card body */}
          {!isBook && (
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 32, height: '100%',
              background: 'linear-gradient(to right, transparent, #0d1829)',
              pointerEvents: 'none',
            }} />
          )}
        </div>
      )}

      {/* ── Right: content ────────────────────────────────── */}
      <div style={{
        flex:           1,
        padding:        isText ? '24px 24px' : '20px 22px',
        display:        'flex',
        flexDirection:  'column',
        justifyContent: 'space-between',
        minWidth:       0,
      }}>
        {/* Top: name + tagline */}
        <div>
          <p style={{
            fontFamily: 'var(--font-heading, serif)',
            fontSize:   19,
            fontWeight: 400,
            color:      ML.bone,
            margin:     '0 0 6px',
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow:   'hidden',
            textOverflow: 'ellipsis',
          }}>
            {displayName}
          </p>
          {author.tagline && (
            <p style={{
              fontFamily:      'Georgia, serif',
              fontStyle:       'italic',
              fontSize:        13,
              color:           ML.slate,
              margin:          0,
              lineHeight:      1.55,
              overflow:        'hidden',
              display:         '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            } as React.CSSProperties}>
              {author.tagline}
            </p>
          )}
        </div>

        {/* Bottom: link */}
        <div style={{ marginTop: 16 }}>
          <span style={{
            display:       'inline-flex',
            alignItems:    'center',
            gap:            6,
            fontFamily:    'var(--font-geist-mono, monospace)',
            fontSize:       11,
            letterSpacing:  '0.1em',
            textTransform:  'uppercase',
            color:          ML.brass2,
          }}>
            Visit site
            <span style={{ fontSize: 13, transition: 'transform 0.2s' }} className="showcase-arrow">→</span>
          </span>
        </div>
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
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5);
          border-color: rgba(212,174,106,0.4) !important;
        }
        .showcase-card:hover .showcase-arrow {
          transform: translateX(3px);
        }
      `}</style>

      <section style={{ background: '#27406B', padding: '100px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Header ─────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
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

          {/* ── Cards grid ─────────────────────────────────── */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
            gap:                 20,
          }}>
            {authors.map((author) => (
              <ShowcaseCard key={author.id} author={author} platformDomain={platformDomain} />
            ))}
          </div>

          {/* ── CTA ────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', marginTop: 52 }}>
            <p style={{
              fontFamily:    'Georgia, serif',
              fontStyle:     'italic',
              fontSize:      16,
              color:         `${ML.bone}77`,
              marginBottom:  24,
            }}>
              Yours could be next.
            </p>
            <Link
              href="/register"
              style={{
                display:        'inline-flex',
                alignItems:     'center',
                gap:            10,
                padding:        '14px 32px',
                background:     ML.brass,
                color:          ML.midnight,
                fontFamily:     'inherit',
                fontSize:       15,
                fontWeight:     600,
                borderRadius:   999,
                textDecoration: 'none',
                boxShadow:      '0 8px 24px -8px rgba(184,137,61,0.6)',
              }}
            >
              Take back control — free
              <span style={{ fontSize: 16 }}>→</span>
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
