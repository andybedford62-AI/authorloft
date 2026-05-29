'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useMemo, useId } from 'react';

// ── Nebula background ────────────────────────────────────────────────────────
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

// ── Starfield ────────────────────────────────────────────────────────────────
function StarField() {
  const [stars, setStars] = useState<Array<{ cx: number; cy: number; r: number; dur: number; delay: number; op: number }>>([]);

  useEffect(() => {
    setStars(Array.from({ length: 70 }).map(() => ({
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

// ── Animated book covers ─────────────────────────────────────────────────────
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
            <span style={{ display: 'inline-block', width: 7, height: 24, background: ac, marginLeft: 2, transform: 'translateY(4px)', animation: 'mlBlink 1s steps(2) infinite' }} />
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
      {/* Glow */}
      <div style={{ position: 'absolute', inset: '10% -10%', background: 'radial-gradient(50% 50% at 50% 50%, rgba(184,137,61,0.3), transparent 70%)', filter: 'blur(40px)', animation: 'mlFloat 8s ease-in-out infinite' }} />

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

      {/* Pill */}
      <div style={{ position: 'absolute', top: 16, right: -10, zIndex: 20, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px 6px 8px', background: 'rgba(15,26,45,0.75)', border: '1px solid rgba(232,229,221,0.2)', borderRadius: 999, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#C26A4A', animation: 'mlPulse 1.6s ease-in-out infinite', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: '#E8E5DD', letterSpacing: '0.08em' }}>Live · your site, your cover</span>
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, color: '#8993A4', letterSpacing: '0.06em' }}>
        ↑ Every cover, every title — live on your site as you type.
      </div>
    </div>
  );
}

// ── Main hero export ─────────────────────────────────────────────────────────
export function MidnightHero() {
  return (
    <section style={{ position: 'relative', background: '#0F1A2D', overflow: 'hidden', minHeight: '100vh' }}>
      <style>{`
        @keyframes mlBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes mlFloat { 0%,100%{transform:translate(0,0)} 33%{transform:translate(20px,-10px)} 66%{transform:translate(-10px,8px)} }
        @keyframes mlPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
      `}</style>

      <NebulaBG />
      <StarField />

      {/* Deckled bottom edge */}
      <svg viewBox="0 0 1280 30" preserveAspectRatio="none" style={{ position: 'absolute', bottom: -1, left: 0, width: '100%', height: 30, zIndex: 3 }} aria-hidden="true">
        <path d="M0 28 Q 80 18, 160 24 T 320 22 T 480 26 T 640 18 T 800 24 T 960 20 T 1120 22 T 1280 24 L 1280 30 L 0 30 Z" fill="#E8E5DD" />
      </svg>

      {/* Nav */}
      <nav style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 60px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={160} height={46} style={{ height: 44, width: 'auto' }} priority />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: 4, background: 'rgba(232,229,221,0.08)', borderRadius: 999, border: '1px solid rgba(232,229,221,0.15)', backdropFilter: 'blur(8px)' }} className="hidden md:flex">
          {([
            ['/features',    'Features'],
            ['/blog',        'Blog'],
            ['#how-it-works','How it works'],
            ['/pricing',     'Pricing'],
            ['#genres',      'For authors'],
          ] as [string, string][]).map(([href, label]) => (
            <Link key={href} href={href} style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: '#E8E5DD', opacity: 0.85, cursor: 'pointer', borderRadius: 999, textDecoration: 'none' }}>{label}</Link>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/login" style={{ fontFamily: 'inherit', fontSize: 14, color: '#E8E5DD', opacity: 0.85, textDecoration: 'none' }}>Sign in</Link>
          <Link href="/register" style={{ padding: '10px 20px', fontFamily: 'inherit', fontSize: 14, fontWeight: 500, background: '#B8893D', color: '#0F1A2D', borderRadius: 999, textDecoration: 'none', boxShadow: '0 4px 14px -4px rgba(184,137,61,0.55)' }}>
            Start free →
          </Link>
        </div>
      </nav>

      {/* Content grid */}
      <div style={{ position: 'relative', zIndex: 2, padding: '60px 60px 140px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>
        {/* Left: copy */}
        <div style={{ color: '#E8E5DD' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 14px 6px 6px', background: 'rgba(15,26,45,0.6)', border: '1px solid rgba(232,229,221,0.18)', borderRadius: 999, marginBottom: 28, backdropFilter: 'blur(8px)' }}>
            <span style={{ padding: '3px 10px', background: '#B8893D', color: '#0F1A2D', borderRadius: 999, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Now open</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: '#E8E5DD', opacity: 0.85 }}>Free plan, free forever · no card</span>
          </div>

          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontWeight: 400, fontSize: 'clamp(52px, 7vw, 112px)', lineHeight: 0.9, letterSpacing: '-0.03em', margin: '0 0 32px' }}>
            <span style={{ display: 'block' }}>Sell books.</span>
            <span style={{ display: 'block', color: '#D4AE6A', fontStyle: 'italic' }}>Keep readers.</span>
            <span style={{ display: 'block', fontSize: 'clamp(32px, 4vw, 60px)', letterSpacing: '-0.02em' }}>
              <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 'clamp(16px, 2vw, 22px)', color: '#8993A4', marginRight: 12 }}>—</span>
              Own it all.
            </span>
          </h1>

          <p style={{ fontFamily: 'Georgia, serif', fontSize: 19, lineHeight: 1.55, color: '#E8E5DD', opacity: 0.85, margin: '0 0 32px', maxWidth: 480 }}>
            The author website platform built for indie writers who refuse to pay rent on someone else&apos;s marketplace. Catalog, newsletter, direct sales — your name on the door.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
            <Link href="/register" style={{ padding: '15px 28px', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, background: '#B8893D', color: '#0F1A2D', border: 'none', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 12px 24px -10px rgba(184,137,61,0.5)' }}>
              Open my shop free →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" style={{ padding: '15px 24px', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, background: 'transparent', color: '#E8E5DD', border: '1px solid rgba(232,229,221,0.4)', borderRadius: 999, cursor: 'pointer', textDecoration: 'none' }}>
              Tour a live site →
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: '#E8E5DD', opacity: 0.6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <span>↳ 5-minute setup</span>
            <span>↳ go live immediately</span>
            <span>↳ keeps your list</span>
          </div>
        </div>

        {/* Right: book stack */}
        <BookStack />
      </div>
    </section>
  );
}
