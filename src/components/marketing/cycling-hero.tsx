'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useId } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

const SLIDES = [
  { key: 'books',       image: '/Hero-Books.png',       label: 'Books' },
  { key: 'music',       image: '/Hero-Music.png',       label: 'Music' },
  { key: 'art',         image: '/Hero-Art.png',         label: 'Art' },
  { key: 'courses',     image: '/Hero-Courses.png',     label: 'Courses' },
  { key: 'photography', image: '/Hero-Photography.png', label: 'Photography' },
  { key: 'podcasts',    image: '/Hero-Podcast.png',     label: 'Podcasts' },
];

// ── Nebula background (from original hero) ──────────────────────────────────

function NebulaBG() {
  const uid = useId();
  return (
    <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.92 }}
      aria-hidden="true">
      <defs>
        <filter id={`${uid}-bloom`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="80" />
        </filter>
        <radialGradient id={`${uid}-g1`} cx="22%" cy="32%" r="50%">
          <stop offset="0%" stopColor="#27406B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#27406B" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-g2`} cx="82%" cy="22%" r="55%">
          <stop offset="0%" stopColor="#B8893D" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#B8893D" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-g3`} cx="62%" cy="85%" r="55%">
          <stop offset="0%" stopColor="#27406B" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#27406B" stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.88  0 0 0 0 0.93  0 0 0 0.15 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="#0F1A2D" />
      <g filter={`url(#${uid}-bloom)`}>
        <rect width="100%" height="100%" fill={`url(#${uid}-g1)`}>
          <animateTransform attributeName="transform" type="translate" values="0 0; 40 -30; 0 0" dur="18s" repeatCount="indefinite" />
        </rect>
        <rect width="100%" height="100%" fill={`url(#${uid}-g2)`}>
          <animateTransform attributeName="transform" type="translate" values="0 0; -30 40; 0 0" dur="22s" repeatCount="indefinite" />
        </rect>
        <rect width="100%" height="100%" fill={`url(#${uid}-g3)`}>
          <animateTransform attributeName="transform" type="translate" values="0 0; 20 -20; 0 0" dur="26s" repeatCount="indefinite" />
        </rect>
      </g>
      <rect width="100%" height="100%" filter={`url(#${uid}-grain)`} opacity="0.5" />
    </svg>
  );
}

function StarField() {
  const [stars, setStars] = useState<Array<{ cx: number; cy: number; r: number; dur: number; delay: number; op: number }>>([]);
  useEffect(() => {
    setStars(Array.from({ length: 80 }).map(() => ({
      cx: Math.random() * 1280,
      cy: Math.random() * 700,
      r: Math.random() * 1.2 + 0.3,
      dur: 2 + Math.random() * 4,
      delay: Math.random() * 4,
      op: 0.3 + Math.random() * 0.6,
    })));
  }, []);
  return (
    <svg viewBox="0 0 1280 800" preserveAspectRatio="xMidYMid slice"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      aria-hidden="true">
      {stars.map((s, i) => (
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill="#D4AE6A">
          <animate attributeName="opacity"
            values={`${s.op * 0.2};${s.op};${s.op * 0.2}`}
            dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

// ── Nav dropdown ────────────────────────────────────────────────────────────

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
    <section style={{ position: 'relative', background: ML.midnight, overflow: 'hidden', minHeight: '92vh' }}>
      <style>{`
        @keyframes rbFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rbPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .rb-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(184,137,61,0.65) !important; }
        .rb-cta-secondary:hover { background: rgba(232,229,221,0.08) !important; }
        .ch-img { position: absolute; inset: 0; opacity: 0; transition: opacity 0.8s ease-in-out; }
        .ch-img.active { opacity: 1; }
        .ch-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(232,229,221,0.4); background: transparent; cursor: pointer; padding: 0; transition: all 0.3s ease; }
        .ch-dot.active { background: ${ML.brass2}; border-color: ${ML.brass2}; }
        .ch-dot:hover { border-color: ${ML.bone}; }
        @media (max-width: 860px) {
          .rb-nav { padding: 16px 20px !important; }
          .ch-hero-grid { grid-template-columns: 1fr !important; padding: 32px 22px 56px !important; gap: 24px !important; }
          .ch-imagery-col { display: none !important; }
        }
      `}</style>

      <NebulaBG />
      <StarField />

      {/* Nav */}
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

        {/* Right: cycling images */}
        <div className="ch-imagery-col hidden lg:block" style={{ position: 'relative', height: 460 }}>
          {/* Ambient glow behind images */}
          <div style={{ position: 'absolute', inset: '5% -5%', background: `radial-gradient(50% 50% at 50% 50%, ${ML.brass2}22, transparent 70%)`, filter: 'blur(40px)', animation: 'rbFadeUp 1s ease both' }} />

          {/* Image container */}
          <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 60px -16px rgba(0,0,0,0.6), 0 8px 20px -8px rgba(0,0,0,0.4)', border: '1px solid rgba(232,229,221,0.1)' }}>
            {SLIDES.map((slide, i) => (
              <div key={slide.key} className={`ch-img ${i === active ? 'active' : ''}`}>
                <Image
                  src={slide.image}
                  alt={slide.label}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 860px) 0px, 50vw"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>

          {/* Slide label + dots */}
          <div style={{ position: 'absolute', bottom: -36, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
            {SLIDES.map((s, i) => (
              <button key={s.key} className={`ch-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} aria-label={s.label} />
            ))}
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.brass2, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 6 }}>{SLIDES[active].label}</span>
          </div>

          {/* Live badge */}
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px 6px 8px', background: 'rgba(15,26,45,0.75)', border: '1px solid rgba(232,229,221,0.2)', borderRadius: 999, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: ML.copper, animation: 'rbPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.bone, letterSpacing: '0.08em' }}>Live · your site, your way</span>
          </div>
        </div>
      </div>
    </section>
  );
}
