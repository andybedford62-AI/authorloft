'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useId, useCallback } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

// ── Slides ──────────────────────────────────────────────────────────────────

const SLIDES = [
  {
    key: 'books',
    gradient: 'linear-gradient(135deg, #d4537e 0%, #1d9e75 100%)',
    label: 'Books',
  },
  {
    key: 'music',
    gradient: 'linear-gradient(135deg, #378add 0%, #ba7517 100%)',
    label: 'Music',
  },
  {
    key: 'art',
    gradient: 'linear-gradient(135deg, #534ab7 0%, #d4537e 100%)',
    label: 'Art',
  },
];

// ── Book imagery ────────────────────────────────────────────────────────────

function BookImagery() {
  return (
    <div style={{ position: 'relative', width: 240, height: 320, perspective: 800, transform: 'rotateY(-8deg) rotateX(2deg)' }}>
      {[
        { bg: 'linear-gradient(160deg, #2c1810 0%, #5a3420 40%, #8b5e3c 100%)', spine: '#2c1810', title: 'The Last Chapter', author: 'A. Bedford', accent: 'rgba(255,215,140,0.9)', bottom: 0, left: 10, z: 3, w: 150, h: 210 },
        { bg: 'linear-gradient(160deg, #1a3a4a 0%, #2a5a6a 40%, #3a7a8a 100%)', spine: '#1a3a4a', title: 'Ocean Tides', author: 'M. Harper', accent: 'rgba(200,230,240,0.9)', bottom: 22, left: 55, z: 2, w: 140, h: 195, rot: 3 },
        { bg: 'linear-gradient(160deg, #4a1a3a 0%, #7a2a5a 40%, #9a3a6a 100%)', spine: '#4a1a3a', title: 'Midnight Rose', author: 'L. Chen', accent: 'rgba(240,200,220,0.9)', bottom: 48, left: 95, z: 1, w: 130, h: 185, rot: -4 },
      ].map((b) => (
        <div key={b.title} style={{
          position: 'absolute', bottom: b.bottom, left: b.left, zIndex: b.z,
          width: b.w, height: b.h,
          borderRadius: 4, overflow: 'hidden',
          transform: b.rot ? `rotateZ(${b.rot}deg)` : undefined,
          boxShadow: '4px 4px 24px rgba(0,0,0,0.35)',
        }}>
          <div style={{ width: '100%', height: '100%', background: b.bg, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 10, border: `1px solid ${b.accent}`, opacity: 0.3, borderRadius: 2 }} />
            <div style={{ position: 'absolute', top: 18, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 8, letterSpacing: '0.2em', textTransform: 'uppercase', color: b.accent, opacity: 0.7 }}>{b.author}</div>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: b.accent, lineHeight: 1.25, fontStyle: 'italic' }}>{b.title}</span>
          </div>
          <div style={{ position: 'absolute', left: -12, top: 0, width: 12, height: '100%', background: b.spine, borderRadius: '4px 0 0 4px' }} />
          <div style={{ position: 'absolute', right: -3, top: 4, width: 3, height: 'calc(100% - 8px)', background: '#f5f0e8', borderRadius: '0 2px 2px 0' }} />
        </div>
      ))}
    </div>
  );
}

// ── Waveform imagery ────────────────────────────────────────────────────────

function WaveformImagery() {
  const heights = [30,50,70,90,110,95,75,110,85,60,95,115,80,55,70,90,105,75,45,65,85,100,70,50,35];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3, height: 200 }}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: 5, height: h, background: 'rgba(255,255,255,0.7)', borderRadius: 3,
          animation: `waveAnim ${0.8 + (i % 5) * 0.15}s ease-in-out ${i * 0.08}s infinite alternate`,
        }} />
      ))}
    </div>
  );
}

// ── Art imagery ─────────────────────────────────────────────────────────────

function ArtImagery() {
  const frames = [
    { bg: 'linear-gradient(135deg, #ff6b6b 0%, #ffd93d 50%, #6bcb77 100%)', bottom: 0, left: 0, z: 3, rot: -3, w: 160, h: 200 },
    { bg: 'linear-gradient(160deg, #4a90d9 0%, #67b8a7 50%, #e8d174 100%)', bottom: 20, left: 30, z: 2, rot: 2, w: 150, h: 190 },
    { bg: 'linear-gradient(45deg, #c084fc 0%, #f472b6 50%, #fb923c 100%)', bottom: 40, left: 55, z: 1, rot: -1, w: 140, h: 180 },
  ];
  return (
    <div style={{ position: 'relative', width: 210, height: 280 }}>
      {frames.map((f, i) => (
        <div key={i} style={{
          position: 'absolute', bottom: f.bottom, left: f.left, zIndex: f.z,
          width: f.w, height: f.h,
          background: f.bg, border: '3px solid rgba(255,255,255,0.3)',
          borderRadius: 2, overflow: 'hidden',
          transform: `rotate(${f.rot}deg)`,
          boxShadow: '4px 4px 20px rgba(0,0,0,0.25)',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)' }} />
        </div>
      ))}
    </div>
  );
}

// ── Nav dropdown (reused from rebrand-hero) ─────────────────────────────────

function HeroNavDropdown({ label, items }: { label: string; items: [string, string][] }) {
  const [open, setOpen] = useState(false);
  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} style={{ position: 'relative' }}>
      <button type="button" onClick={() => setOpen((v) => !v)}
        style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, fontWeight: 400, opacity: 0.85, cursor: 'pointer', borderRadius: 999, background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        {label} <span style={{ fontSize: 9, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: 8, zIndex: 50 }}>
          <div style={{ minWidth: 210, background: ML.midnight, border: '1px solid rgba(232,229,221,0.18)', borderRadius: 14, padding: 8, boxShadow: '0 20px 44px -12px rgba(0,0,0,0.6)' }}>
            {items.map(([href, l]) => (
              <Link key={href} href={href} style={{ display: 'block', padding: '9px 12px', fontSize: 13, color: ML.bone, textDecoration: 'none', borderRadius: 8 }}>{l}</Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main cycling hero ───────────────────────────────────────────────────────

export function CyclingHero() {
  const [active, setActive] = useState(0);

  const nextSlide = useCallback(() => {
    setActive((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: '92vh' }}>
      <style>{`
        @keyframes rbFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes waveAnim { from{transform:scaleY(0.5);opacity:0.4} to{transform:scaleY(1);opacity:0.9} }
        .rb-nav-link:hover { background: rgba(232,229,221,0.1) !important; }
        .rb-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(184,137,61,0.65) !important; }
        .rb-cta-secondary:hover { background: rgba(232,229,221,0.08) !important; }
        .ch-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.6s ease-in-out; }
        .ch-slide.active { opacity: 1; }
        .ch-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(232,229,221,0.5); background: transparent; cursor: pointer; padding: 0; transition: all 0.3s ease; }
        .ch-dot.active { background: #D4AE6A; border-color: #D4AE6A; }
        @media (max-width: 860px) {
          .rb-nav { padding: 16px 20px !important; }
          .ch-hero-grid { grid-template-columns: 1fr !important; padding: 32px 22px 56px !important; gap: 24px !important; }
          .ch-imagery-col { display: none !important; }
        }
      `}</style>

      {/* Gradient backgrounds */}
      {SLIDES.map((slide, i) => (
        <div key={slide.key} className={`ch-slide ${i === active ? 'active' : ''}`} style={{ background: slide.gradient }} />
      ))}

      {/* Nav — always visible on top */}
      <nav className="rb-nav" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={160} height={46} style={{ height: 44, width: 'auto' }} priority />
        </Link>
        <div style={{ alignItems: 'center', gap: 4, padding: 4, background: 'rgba(232,229,221,0.08)', borderRadius: 999, border: '1px solid rgba(232,229,221,0.15)', backdropFilter: 'blur(8px)' }} className="hidden md:flex">
          <Link href="/bookstore" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: '#E8B04B', fontWeight: 600, borderRadius: 999, textDecoration: 'none' }}>Bookstore</Link>
          <Link href="/features" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>Features</Link>
          <HeroNavDropdown label="Resources" items={[
            ['/blog',      'Blog'],
            ['/news',      'News'],
            ['/faq',       'FAQ'],
            ['/resources', 'Tools & Communities'],
          ]} />
          <Link href="#how-it-works" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>How it works</Link>
          <Link href="/pricing" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>Pricing</Link>
          <Link href="#genres" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>For authors</Link>
        </div>
        <div style={{ alignItems: 'center', gap: 16 }} className="hidden md:flex">
          <Link href="/login" style={{ fontFamily: 'inherit', fontSize: 14, color: ML.bone, opacity: 0.85, textDecoration: 'none' }}>Sign in</Link>
          <Link href="/register" style={{ padding: '10px 20px', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, background: ML.brass, color: ML.midnight, borderRadius: 999, textDecoration: 'none', boxShadow: '0 4px 14px -4px rgba(184,137,61,0.55)' }}>
            Start free →
          </Link>
        </div>
        <HeroMobileMenu />
      </nav>

      {/* Content grid */}
      <div className="ch-hero-grid" style={{ position: 'relative', zIndex: 2, padding: '60px 60px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>

        {/* Left: copy */}
        <div style={{ color: ML.bone }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', background: 'rgba(15,26,45,0.6)', border: '1px solid rgba(232,229,221,0.18)', borderRadius: 999, marginBottom: 28, backdropFilter: 'blur(8px)', animation: 'rbFadeUp 0.6s ease both' }}>
            <span style={{ padding: '3px 10px', background: ML.brass, color: ML.midnight, borderRadius: 999, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Creator Platform</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.bone, opacity: 0.85 }}>Free forever · no card needed</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontWeight: 400, fontSize: 'clamp(48px, 6.5vw, 104px)', lineHeight: 0.92, letterSpacing: '-0.03em', margin: '0 0 28px', animation: 'rbFadeUp 0.7s 0.1s ease both', opacity: 0 }}>
            <span style={{ display: 'block' }}>Build your</span>
            <span style={{ display: 'block', color: ML.brass2, fontStyle: 'italic' }}>creator business.</span>
          </h1>

          <div style={{ display: 'flex', gap: 0, marginBottom: 24, animation: 'rbFadeUp 0.7s 0.2s ease both', opacity: 0 }}>
            {['publish', 'sell', 'grow', 'scale'].map((word, i) => (
              <span key={word} style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: i % 2 === 0 ? ML.bone : ML.brass2, opacity: i % 2 === 0 ? 0.55 : 0.9, marginRight: 16 }}>
                {word}{i < 3 ? ' ·' : ''}
              </span>
            ))}
          </div>

          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.6, color: ML.bone, opacity: 0.85, margin: '0 0 32px', maxWidth: 460, animation: 'rbFadeUp 0.7s 0.25s ease both' }}>
            Host, promote, and sell direct, grow your listing and own every built relationship.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28, animation: 'rbFadeUp 0.7s 0.35s ease both', opacity: 0 }}>
            <Link href="/register" className="rb-cta-primary" style={{ padding: '15px 28px', fontSize: 15, fontWeight: 500, background: ML.brass, color: ML.midnight, border: 'none', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 12px 24px -10px ${ML.brass}80`, transition: 'transform 0.2s, box-shadow 0.2s' }}>
              Start building free →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" className="rb-cta-secondary" style={{ padding: '15px 24px', fontSize: 15, fontWeight: 500, background: 'transparent', color: ML.bone, border: '1px solid rgba(232,229,221,0.35)', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s' }}>
              Tour a live site →
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.bone, opacity: 0.55, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'rbFadeUp 0.7s 0.45s ease both' }}>
            <span>↳ 5-minute setup</span>
            <span>↳ zero platform fees</span>
            <span>↳ your audience, always</span>
          </div>
        </div>

        {/* Right: cycling imagery */}
        <div className="ch-imagery-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 380 }}>
          <div style={{ position: 'relative', width: 260, height: 340 }}>
            {/* Book imagery */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === 0 ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}>
              <BookImagery />
            </div>
            {/* Music imagery */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === 1 ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}>
              <WaveformImagery />
            </div>
            {/* Art imagery */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active === 2 ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}>
              <ArtImagery />
            </div>
          </div>

          {/* Slide dots + label */}
          <div style={{ position: 'absolute', bottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            {SLIDES.map((s, i) => (
              <button key={s.key} className={`ch-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} aria-label={s.label} />
            ))}
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.bone, opacity: 0.7, letterSpacing: '0.08em', marginLeft: 4 }}>{SLIDES[active].label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
