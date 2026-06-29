'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';

const SERIF = "var(--font-heading, 'Playfair Display', Georgia, serif)";

function NavDropdown({ label, items }: { label: string; items: [string, string][] }) {
  const [open, setOpen] = useState(false);
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="rdh-nav-link"
        style={{ padding: '6px 10px', fontFamily: 'inherit', fontSize: 13, color: '#9a9080', fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        {label} <span style={{ fontSize: 9, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: 6, zIndex: 50 }}>
          <div style={{ minWidth: 210, background: '#0d1520', border: '1px solid #2a4268', borderRadius: 12, padding: 6, boxShadow: '0 16px 36px -10px rgba(0,0,0,0.6)', backdropFilter: 'blur(14px)' }}>
            {items.map(([href, l]) => (
              <Link key={href} href={href} className="rdh-dd-link" style={{ display: 'block', padding: '8px 12px', fontSize: 13, color: '#9a9080', textDecoration: 'none', borderRadius: 8 }}>{l}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function RedesignHero({ isAuthor = false }: { isAuthor?: boolean }) {
  return (
    <>
      <style>{`
        .rdh-nav-link { transition: color .2s; }
        .rdh-nav-link:hover { color: #e8e8e0 !important; }
        .rdh-dd-link:hover { color: #e8e8e0 !important; background: rgba(255,255,255,0.04); }
        .rdh-nav-cta { transition: background .2s; }
        .rdh-nav-cta:hover { background: #d4b866 !important; }
        .rdh-hero-bp:hover { background: #d4b866 !important; }
        .rdh-hero-bg:hover { border-color: #9a9080 !important; background: rgba(255,255,255,0.04) !important; }
        .rdh-proof::before { content: '✓'; color: #c9a84c; font-weight: 700; font-size: 11px; margin-right: 6px; }
        @media (max-width: 640px) {
          .rdh-desk-nav, .rdh-desk-right { display: none !important; }
          .rdh-hero-inner { padding: 48px 20px 40px !important; }
          .rdh-hero-proof { gap: 16px !important; }
          .rdh-hero-actions { flex-direction: column; align-items: stretch; }
        }
        @media (min-width: 641px) {
          .rdh-mobile-wrap { display: none !important; }
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────── */}
      <nav style={{ background: 'rgba(13,21,32,0.96)', borderBottom: '1px solid #2a4268', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 54, maxWidth: 960, margin: '0 auto' }}>
          <Link href="/" style={{ fontFamily: SERIF, fontSize: '1.3rem', fontWeight: 700, color: '#e8e8e0', textDecoration: 'none' }}>
            AuthorLoft
          </Link>

          <div className="rdh-desk-nav" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link href="/features" className="rdh-nav-link" style={{ padding: '6px 10px', fontSize: 13, color: '#9a9080', textDecoration: 'none', fontWeight: 500 }}>Features</Link>
            <Link href="/bookstore" className="rdh-nav-link" style={{ padding: '6px 10px', fontSize: 13, color: '#9a9080', textDecoration: 'none', fontWeight: 500 }}>Bookstore</Link>
            <NavDropdown label="Solutions" items={[
              ['/author-website-builder',       'Author Website Builder'],
              ['/sell-books-directly',           'Sell Books Directly'],
              ['/book-marketing-platform',       'Book Marketing'],
              ['/author-newsletter-platform',    'Newsletter Platform'],
              ['/arc-management',                'ARC Management'],
              ['/author-media-kit',              'Author Media Kit'],
              ['/ai-tools-for-authors',          'AI Tools for Authors'],
              ['/indie-author-bookstore',        'Indie Author Bookstore'],
              ['/book-pre-orders',               'Book Pre-Orders'],
              ['/author-affiliate-program',      'Affiliate Program'],
              ['/reader-analytics-for-authors',  'Reader Analytics'],
            ]} />
            <Link href="/pricing" className="rdh-nav-link" style={{ padding: '6px 10px', fontSize: 13, color: '#9a9080', textDecoration: 'none', fontWeight: 500 }}>Pricing</Link>
            <Link href="/faq" className="rdh-nav-link" style={{ padding: '6px 10px', fontSize: 13, color: '#9a9080', textDecoration: 'none', fontWeight: 500 }}>FAQ</Link>
            <NavDropdown label="Resources" items={[
              ['/guides',    'Author Guides'],
              ['/blog',      'Blog'],
              ['/news',      'News'],
              ['/resources', 'Tools & Communities'],
            ]} />
          </div>

          <div className="rdh-desk-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isAuthor ? (
              <Link href="/admin" className="rdh-nav-cta" style={{ background: '#c9a84c', color: '#000', padding: '6px 14px', borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: '#e8e8e0', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>Sign in</Link>
                <Link href="/register" className="rdh-nav-cta" style={{ background: '#c9a84c', color: '#000', padding: '6px 14px', borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                  Start free →
                </Link>
              </>
            )}
          </div>

          <div className="rdh-mobile-wrap">
            <HeroMobileMenu isAuthor={isAuthor} />
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────── */}
      <section style={{ padding: '72px 0 60px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: '#0d1520' }}>
        <div style={{ position: 'absolute', top: -120, left: '50%', transform: 'translateX(-50%)', width: 700, height: 420, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />

        <div className="rdh-hero-inner" style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#c9a84c', fontWeight: 500, marginBottom: 28, letterSpacing: '0.03em' }}>
            Free to start&nbsp;&middot;&nbsp;No credit card required
          </div>

          <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(2.4rem, 5vw, 4.2rem)', fontWeight: 700, lineHeight: 1.12, margin: '0 0 20px', fontStyle: 'italic', color: '#e8e8e0' }}>
            You wrote the book.<br />
            <em style={{ fontStyle: 'normal', color: '#c9a84c' }}>Own everything else.</em>
          </h1>

          <p style={{ fontSize: 'clamp(0.9375rem, 1.3vw, 1.0625rem)', color: '#9a9080', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.75 }}>
            Every book you sell through a retailer, <strong style={{ color: '#e8e8e0', fontWeight: 500 }}>you never learn who bought it.</strong>{' '}
            Every reader you send to Amazon is gone forever. AuthorLoft gives you your own storefront, your own list,
            and <strong style={{ color: '#e8e8e0', fontWeight: 500 }}>100% of every sale.</strong>
          </p>

          <div className="rdh-hero-actions" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 36 }}>
            <Link href="/register" className="rdh-hero-bp" style={{ display: 'inline-block', textDecoration: 'none', background: '#c9a84c', color: '#000', padding: '13px 28px', borderRadius: 8, fontWeight: 600, fontSize: 14, transition: 'background .18s' }}>
              Start your business — free →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" className="rdh-hero-bg" style={{ display: 'inline-block', textDecoration: 'none', color: '#e8e8e0', border: '1px solid #2a4268', padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, background: 'transparent', transition: 'border-color .18s, background .18s' }}>
              See a live author site →
            </a>
          </div>

          <div className="rdh-hero-proof" style={{ display: 'flex', gap: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="rdh-proof" style={{ fontSize: 12, color: '#9a9080', display: 'flex', alignItems: 'center' }}>Zero platform fees</span>
            <span className="rdh-proof" style={{ fontSize: 12, color: '#9a9080', display: 'flex', alignItems: 'center' }}>Live in 15 minutes</span>
            <span className="rdh-proof" style={{ fontSize: 12, color: '#9a9080', display: 'flex', alignItems: 'center' }}>Your readers, always yours</span>
          </div>
        </div>
      </section>
    </>
  );
}
