"use client";

import Image from "next/image";
import Link from "next/link";
import { VAULT } from "@/components/marketing/vault-theme";

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
        background:     VAULT.bg,
        border:         `1px solid ${VAULT.hair}`,
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
          background:      VAULT.bg,
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
              <span style={{ fontFamily: VAULT.fontDisplay, fontStyle: 'italic', fontSize: 52, color: VAULT.gold, opacity: 0.4 }}>
                {displayName[0]}
              </span>
            </div>
          )}
          {/* subtle right-edge fade into card body */}
          {!isBook && (
            <div style={{
              position: 'absolute', top: 0, right: 0, width: 32, height: '100%',
              background: `linear-gradient(to right, transparent, ${VAULT.bg})`,
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
            fontFamily: VAULT.fontDisplay,
            fontStyle:  'italic',
            fontSize:   19,
            fontWeight: 400,
            color:      VAULT.ink,
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
              fontFamily:      VAULT.fontBody,
              fontSize:        13,
              color:           VAULT.mute,
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
            color:          VAULT.gold,
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
          border-color: rgba(214,169,74,0.4) !important;
        }
        .showcase-card:hover .showcase-arrow {
          transform: translateX(3px);
        }
      `}</style>

      <section style={{ background: VAULT.surf, padding: '100px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* ── Header ─────────────────────────────────────── */}
          <div style={{ marginBottom: 56, maxWidth: 640 }}>
            <p style={{
              fontFamily:    'var(--font-geist-mono, monospace)',
              fontSize:      11,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color:         VAULT.gold,
              marginBottom:  16,
            }}>
              · {authors.length} live author {authors.length === 1 ? 'site' : 'sites'} ·
            </p>
            <h2 style={{
              fontFamily:    VAULT.fontDisplay,
              fontSize:      'clamp(38px, 5vw, 72px)',
              fontWeight:    400,
              lineHeight:    0.95,
              letterSpacing: '-0.025em',
              color:         VAULT.ink,
              margin:        '0 0 20px',
            }}>
              Real sites.<br />
              <span style={{ fontStyle: 'italic', color: VAULT.gold }}>Real authors.</span>
            </h2>
            <p style={{
              fontFamily: VAULT.fontBody,
              fontSize:   17,
              lineHeight: 1.65,
              color:      `${VAULT.ink}bb`,
              maxWidth:   500,
              margin:     0,
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
          <div style={{ marginTop: 52 }}>
            <p style={{
              fontFamily:    VAULT.fontDisplay,
              fontStyle:     'italic',
              fontSize:      16,
              color:         `${VAULT.ink}77`,
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
                background:     VAULT.gold,
                color:          VAULT.bg,
                fontFamily:     'inherit',
                fontSize:       15,
                fontWeight:     600,
                borderRadius:   VAULT.radius,
                textDecoration: 'none',
                boxShadow:      '0 8px 24px -8px rgba(214,169,74,0.6)',
              }}
            >
              Start your business — free
              <span style={{ fontSize: 16 }}>→</span>
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
