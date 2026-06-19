'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useId } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

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

const COVERS = [
  { t: "The Cartographer's Daughter", a: 'Bedford',  bg: '#0F1A2D', fg: '#E8E5DD', ac: '#D4AE6A' },
  { t: 'House of Salt and Tides',     a: 'Chase',    bg: '#27406B', fg: '#E8E5DD', ac: '#D4AE6A' },
  { t: 'Where the Marsh Sings',       a: 'Okafor',   bg: '#2A3A55', fg: '#E8E5DD', ac: '#D4AE6A' },
  { t: 'Northern Tides',              a: 'Bedford',  bg: '#1B2B47', fg: '#D4AE6A', ac: '#B8893D' },
];

function BookCover({ title, author, bg, fg, ac, typed, isFront }: {
  title: string; author: string; bg: string; fg: string; ac: string;
  typed?: string; isFront?: boolean;
}) {
  return (
    <div style={{ width: 240, height: 352, background: bg, color: fg, position: 'relative', overflow: 'hidden', boxShadow: 'inset 10px 0 0 0 rgba(0,0,0,0.22), inset 12px 0 1px 0 rgba(255,255,255,0.06)' }}>
      <div style={{ position: 'absolute', inset: 18, border: `1px solid ${ac}`, opacity: 0.6 }} />
      <div style={{ position: 'absolute', inset: 26, border: `1px solid ${ac}`, opacity: 0.25 }} />
      <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: ac, fontWeight: 500 }}>{author}</div>
      <div style={{ position: 'absolute', top: 100, left: 28, right: 28, textAlign: 'center', fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 26, lineHeight: 1.1, color: fg, minHeight: 90 }}>
        {isFront ? (
          <>
            {typed}
            <span style={{ display: 'inline-block', width: 7, height: 24, background: ac, marginLeft: 2, transform: 'translateY(4px)', animation: 'rbBlink 1s steps(2) infinite' }} />
          </>
        ) : title}
      </div>
      <div style={{ position: 'absolute', bottom: 58, left: '50%', transform: 'translateX(-50%)', color: ac, fontFamily: 'serif', fontSize: 28, lineHeight: 1 }}>❦</div>
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase', color: ac, opacity: 0.85 }}>A Novel</div>
    </div>
  );
}

function BookStack() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    const target = COVERS[idx].t;
    if (typed.length < target.length) {
      const t = setTimeout(() => setTyped(target.slice(0, typed.length + 1)), 60);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => { setTyped(''); setIdx((idx + 1) % COVERS.length); }, 2200);
    return () => clearTimeout(t);
  }, [typed, idx]);

  return (
    <div className="hidden lg:block relative" style={{ height: 460 }}>
      <div style={{ position: 'absolute', inset: '10% -10%', background: `radial-gradient(50% 50% at 50% 50%, ${ML.brass2}33, transparent 70%)`, filter: 'blur(40px)', animation: 'rbFloat 8s ease-in-out infinite' }} />
      {COVERS.map((b, i) => {
        const offset = (i - idx + COVERS.length) % COVERS.length;
        const isFront = offset === 0;
        return (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: `translate(-50%, -50%) translate(${offset * 14 - 20}px, ${offset * 10 - 12}px) rotate(${offset * 3 - 4}deg) scale(${isFront ? 1 : 0.96 - offset * 0.02})`,
            zIndex: COVERS.length - offset,
            opacity: isFront ? 1 : (0.95 - offset * 0.18),
            transition: 'all 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: isFront ? 'drop-shadow(0 30px 50px rgba(0,0,0,0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.5))' : 'drop-shadow(0 12px 20px rgba(0,0,0,0.5))',
          }}>
            <BookCover title={b.t} author={b.a} bg={b.bg} fg={b.fg} ac={b.ac} typed={typed} isFront={isFront} />
          </div>
        );
      })}
      <div style={{ position: 'absolute', top: 16, right: -10, zIndex: 20, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px 6px 8px', background: 'rgba(15,26,45,0.75)', border: '1px solid rgba(232,229,221,0.2)', borderRadius: 999, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: ML.copper, animation: 'rbPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.bone, letterSpacing: '0.08em' }}>Live · your site, your cover</span>
      </div>
      {/* Platform badge */}
      <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'rgba(15,26,45,0.7)', border: `1px solid ${ML.brass}40`, borderRadius: 999, backdropFilter: 'blur(8px)' }}>
        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, color: ML.brass2, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Author Growth Platform</span>
      </div>
    </div>
  );
}

// ── Nav dropdown ─────────────────────────────────────────────────────────────
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

export function RebelHero() {
  return (
    <section style={{ position: 'relative', background: ML.midnight, overflow: 'hidden', minHeight: '92vh' }}>
      <style>{`
        @keyframes rbBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes rbFloat { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,-10px)} 66%{transform:translate(-10px,8px)} }
        @keyframes rbPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        @keyframes rbFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rbShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        .rb-nav-link:hover { background: rgba(232,229,221,0.1) !important; }
        .rb-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(184,137,61,0.65) !important; }
        .rb-cta-secondary:hover { background: rgba(232,229,221,0.08) !important; }
        @media (max-width: 860px) {
          .rb-nav { padding: 16px 20px !important; }
          .rb-grid { grid-template-columns: 1fr !important; padding: 32px 22px 56px !important; gap: 24px !important; }
          .rb-book-stack { display: none !important; }
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
      <div className="rb-grid" style={{ position: 'relative', zIndex: 2, padding: '60px 60px 100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>

        {/* Left: copy */}
        <div style={{ color: ML.bone }}>
          {/* Platform badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', background: 'rgba(15,26,45,0.6)', border: '1px solid rgba(232,229,221,0.18)', borderRadius: 999, marginBottom: 28, backdropFilter: 'blur(8px)', animation: 'rbFadeUp 0.6s ease both' }}>
            <span style={{ padding: '3px 10px', background: ML.brass, color: ML.midnight, borderRadius: 999, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Author Growth Platform</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.bone, opacity: 0.85 }}>Free forever · no card needed</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontWeight: 400, fontSize: 'clamp(48px, 6.5vw, 104px)', lineHeight: 0.92, letterSpacing: '-0.03em', margin: '0 0 28px', animation: 'rbFadeUp 0.7s 0.1s ease both', opacity: 0 }}>
            <span style={{ display: 'block' }}>Build your</span>
            <span style={{ display: 'block', color: ML.brass2, fontStyle: 'italic' }}>author business.</span>
          </h1>

          {/* Mantra strip */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, animation: 'rbFadeUp 0.7s 0.2s ease both', opacity: 0 }}>
            {['publish', 'sell', 'grow', 'scale'].map((word, i) => (
              <span key={word} style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: i % 2 === 0 ? ML.bone : ML.brass2, opacity: i % 2 === 0 ? 0.55 : 0.9, marginRight: 16 }}>
                {word}{i < 3 ? ' ·' : ''}
              </span>
            ))}
          </div>

          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.6, color: ML.bone, opacity: 0.85, margin: '0 0 32px', maxWidth: 460, animation: 'rbFadeUp 0.7s 0.25s ease both' }}>
            A full service platform for all authors who mean business — host, promote and sell direct, grow your list, and own every reader relationship.
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
            <span>↳ your readers, always</span>
          </div>
        </div>

        {/* Right: book stack */}
        <div className="rb-book-stack">
          <BookStack />
        </div>
      </div>
    </section>
  );
}
