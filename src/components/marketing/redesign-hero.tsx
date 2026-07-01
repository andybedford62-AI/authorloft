'use client';

import Link from 'next/link';
import { useState } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';

const C = {
  accent:      '#c9a84c',
  accentLight: '#d4b866',
  bg:          '#0d1520',
  surface:     '#1c2e48',
  border:      '#2a4268',
  text:        '#e8e8e0',
  muted:       '#9a9080',
};

function NavDropdown({ label, items }: { label: string; items: [string, string][] }) {
  const [open, setOpen] = useState(false);
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: '0.875rem', color: C.muted, fontWeight: 500, cursor: 'pointer', background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'color 0.2s' }}
        onMouseOver={(e) => (e.currentTarget.style.color = C.text)}
        onMouseOut={(e) => (e.currentTarget.style.color = C.muted)}>
        {label} <span style={{ fontSize: 9, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: 8, zIndex: 50 }}>
          <div style={{ minWidth: 220, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 14, padding: 8, boxShadow: '0 20px 44px -12px rgba(0,0,0,0.6)', backdropFilter: 'blur(14px)' }}>
            {items.map(([href, l]) => (
              <Link key={href} href={href} style={{ display: 'block', padding: '9px 14px', fontSize: '0.875rem', color: C.muted, textDecoration: 'none', borderRadius: 8, transition: 'color 0.15s, background 0.15s' }}
                onMouseOver={(e) => { e.currentTarget.style.color = C.text; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseOut={(e) => { e.currentTarget.style.color = C.muted; e.currentTarget.style.background = 'transparent'; }}
              >{l}</Link>
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
        .rdh-btn-primary { transition: all 0.18s ease; }
        .rdh-btn-primary:hover { background: ${C.accentLight} !important; transform: translateY(-1px); }
        .rdh-btn-ghost { transition: all 0.18s ease; }
        .rdh-btn-ghost:hover { border-color: ${C.muted} !important; background: rgba(255,255,255,0.04) !important; }
        .rdh-nav-cta { transition: background 0.2s !important; }
        .rdh-nav-cta:hover { background: ${C.accentLight} !important; }
        .rdh-proof-item::before { content: '✓'; color: ${C.accent}; font-weight: 700; font-size: 0.75rem; margin-right: 7px; }
        @media (max-width: 640px) {
          .rdh-desktop-nav { display: none !important; }
          .rdh-desktop-right { display: none !important; }
          .rdh-hero-inner { padding: 64px 20px 52px !important; }
          .rdh-hero-actions { flex-direction: column; align-items: stretch; }
          .rdh-hero-proof { gap: 16px !important; }
        }
        @media (min-width: 641px) {
          .rdh-mobile-menu-wrap { display: none !important; }
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,21,32,0.94)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62, maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
          <Link href="/" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '1.4rem', fontWeight: 700, color: C.text, textDecoration: 'none', letterSpacing: '0.02em' }}>
            AuthorLoft
          </Link>

          <div className="rdh-desktop-nav" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <Link href="/features" style={{ color: C.muted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '8px 14px', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = C.text)} onMouseOut={(e) => (e.currentTarget.style.color = C.muted)}>Features</Link>
            <Link href="/bookstore" style={{ color: C.muted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '8px 14px', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = C.text)} onMouseOut={(e) => (e.currentTarget.style.color = C.muted)}>Bookstore</Link>
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
            <Link href="/pricing" style={{ color: C.muted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '8px 14px', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = C.text)} onMouseOut={(e) => (e.currentTarget.style.color = C.muted)}>Pricing</Link>
            <Link href="/faq" style={{ color: C.muted, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, padding: '8px 14px', transition: 'color 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.color = C.text)} onMouseOut={(e) => (e.currentTarget.style.color = C.muted)}>FAQ</Link>
            <NavDropdown label="Resources" items={[
              ['/guides',    'Learn'],
              ['/blog',      'Blog'],
              ['/news',      'News'],
              ['/resources', 'Tools & Communities'],
            ]} />
          </div>

          <div className="rdh-desktop-right" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {isAuthor ? (
              <Link href="/admin" className="rdh-nav-cta" style={{ background: C.accent, color: '#000', padding: '8px 18px', borderRadius: 6, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" style={{ color: C.text, textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Sign in</Link>
                <Link href="/register" className="rdh-nav-cta" style={{ background: C.accent, color: '#000', padding: '8px 18px', borderRadius: 6, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
                  Start free →
                </Link>
              </>
            )}
          </div>

          <div className="rdh-mobile-menu-wrap">
            <HeroMobileMenu isAuthor={isAuthor} />
          </div>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────── */}
      <section style={{ padding: '108px 0 88px', textAlign: 'center', position: 'relative', overflow: 'hidden', background: C.bg }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: -160, left: '50%', transform: 'translateX(-50%)', width: 800, height: 520, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.11) 0%, transparent 68%)', pointerEvents: 'none' }} />

        <div className="rdh-hero-inner" style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px', position: 'relative' }}>
          {/* Kicker */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.22)', borderRadius: 100, padding: '6px 16px', fontSize: '0.8125rem', color: C.accent, fontWeight: 500, marginBottom: 36, letterSpacing: '0.03em' }}>
            Free to start&nbsp;&middot;&nbsp;No credit card required
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(2.8rem, 6vw, 5.25rem)', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.01em', marginBottom: 28, fontStyle: 'italic', color: C.text }}>
            You wrote the book.<br />
            <span style={{ fontStyle: 'normal', color: C.accent }}>Own everything else.</span>
          </h1>

          {/* Problem paragraph */}
          <p style={{ fontSize: 'clamp(1.0625rem, 1.4vw, 1.1875rem)', color: C.muted, maxWidth: 580, margin: '0 auto 44px', lineHeight: 1.75 }}>
            Every book you sell through a retailer, <strong style={{ color: C.text, fontWeight: 500 }}>you never learn who bought it.</strong>{' '}
            Every reader you send to Amazon is a reader you&apos;ll never reach again — their data, their email,
            their loyalty, all gone. AuthorLoft gives you your own storefront, your own list,
            and <strong style={{ color: C.text, fontWeight: 500 }}>100% of every sale.</strong>
          </p>

          {/* CTA buttons */}
          <div className="rdh-hero-actions" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
            <Link href="/register" className="rdh-btn-primary" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, background: C.accent, color: '#000', padding: '15px 32px' }}>
              Start your business — free →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" className="rdh-btn-ghost" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, color: C.text, border: `1px solid ${C.border}`, padding: '14px 28px', background: 'transparent' }}>
              See a live author site →
            </a>
          </div>

          {/* Proof items */}
          <div className="rdh-hero-proof" style={{ display: 'flex', gap: 36, justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="rdh-proof-item" style={{ fontSize: '0.8125rem', color: C.muted, display: 'flex', alignItems: 'center' }}>Zero platform fees</span>
            <span className="rdh-proof-item" style={{ fontSize: '0.8125rem', color: C.muted, display: 'flex', alignItems: 'center' }}>Live in 15 minutes</span>
            <span className="rdh-proof-item" style={{ fontSize: '0.8125rem', color: C.muted, display: 'flex', alignItems: 'center' }}>Your readers, always yours</span>
          </div>
        </div>
      </section>
    </>
  );
}
