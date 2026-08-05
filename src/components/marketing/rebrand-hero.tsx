'use client';

import Link from 'next/link';
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

const PAIN_CARDS = [
  { pain: "Retail publishers take most of your profit", solution: "You keep 100%", image: "/hero-card-1.png", title: "Your Profit" },
  { pain: "Their email list, their rules",        solution: "Your list, nobody can take it", image: "/hero-card-2.png", title: "Your Readers" },
  { pain: "No idea who your readers are",         solution: "Full reader analytics, always", image: "/hero-card-3.png", title: "Your Analytics" },
  { pain: "Paying for 5 tools that don't connect", solution: "One platform, everything built in", image: "/hero-card-4.png", title: "Your Platform" },
  { pain: "Their storefront, their brand",        solution: "Your domain, your design", image: "/hero-card-5.png", title: "Your Brand" },
];

function PainSolutionCards() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % PAIN_CARDS.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:block relative" style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: '10% -10%', background: `radial-gradient(50% 50% at 50% 50%, ${ML.brass2}22, transparent 70%)`, filter: 'blur(40px)' }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: 540 }}>
        {PAIN_CARDS.map((card, i) => (
          <div key={i} style={{
            position: i === idx ? 'relative' : 'absolute',
            top: 0, left: 0, right: 0,
            opacity: i === idx ? 1 : 0,
            transform: i === idx ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            pointerEvents: i === idx ? 'auto' : 'none',
          }}>
            <div style={{
              borderRadius: 20,
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid rgba(232,229,221,0.12)',
              boxShadow: '0 24px 60px -16px rgba(0,0,0,0.5)',
            }}>
              {/* Background image */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${card.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }} />
              {/* Dark scrim for text readability */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,26,45,0.55) 0%, rgba(15,26,45,0.85) 100%)' }} />

              {/* Content */}
              <div style={{ position: 'relative', padding: '44px 36px' }}>
                {/* Title label */}
                <div style={{ marginBottom: 24 }}>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: ML.brass2, fontWeight: 600,
                    padding: '4px 12px', background: 'rgba(15,26,45,0.5)', border: `1px solid ${ML.brass}44`,
                    borderRadius: 999, backdropFilter: 'blur(6px)',
                  }}>{card.title}</span>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: ML.copper, marginBottom: 10 }}>The old way</p>
                  <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 400, lineHeight: 1.25, color: `${ML.bone}77`, margin: 0, fontStyle: 'italic' }}>{card.pain}</p>
                </div>
                <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${ML.brass}00, ${ML.brass}, ${ML.brass}00)`, marginBottom: 28 }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 10 }}>With AuthorLoft</p>
                  <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(24px, 2.8vw, 32px)', fontWeight: 400, lineHeight: 1.2, color: ML.bone, margin: 0 }}>{card.solution}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dots + title */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          {PAIN_CARDS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', padding: 0,
              background: i === idx ? ML.brass2 : 'rgba(232,229,221,0.25)',
              transition: 'background 0.3s',
            }} aria-label={`Card ${i + 1}`} />
          ))}
          <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.brass2, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 6 }}>{PAIN_CARDS[idx].title}</span>
        </div>
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

export function RebelHero({
  isAuthor = false,
  headlineLine1,
  headlineLine2,
  subheadline,
}: {
  isAuthor?: boolean;
  headlineLine1?: string | null;
  headlineLine2?: string | null;
  subheadline?: string | null;
}) {
  const line1 = headlineLine1 || "They sell your book. They keep your reader.";
  const line2 = headlineLine2 || "Take both back.";
  const sub    = subheadline || "Every sale through a retailer is a reader you’ll never know, never email, never sell to again. AuthorLoft gives you your own storefront, your own list, and 100% of every dollar.";

  return (
    <section style={{ position: 'relative', background: ML.midnight, overflow: 'hidden', minHeight: '72vh' }}>
      <style>{`
        @keyframes rbFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
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
          <svg viewBox="0 0 260 38" width={220} height={36} aria-label="AuthorLoft" role="img">
            <text x="0" y="30" style={{ fontFamily: 'Georgia, serif', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
              <tspan fill={ML.brass2}>Author</tspan><tspan fill={ML.bone}>Loft</tspan>
            </text>
          </svg>
        </Link>
        <div style={{ alignItems: 'center', gap: 4, padding: 4, background: 'rgba(232,229,221,0.08)', borderRadius: 999, border: '1px solid rgba(232,229,221,0.15)', backdropFilter: 'blur(8px)' }} className="hidden md:flex">
          <Link href="/bookstore" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: '#E8B04B', fontWeight: 600, borderRadius: 999, textDecoration: 'none' }}>Bookstore</Link>
          <Link href="/features" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>Features</Link>
          <HeroNavDropdown label="Solutions" items={[
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
          <Link href="/faq" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>FAQ</Link>
          <HeroNavDropdown label="Resources" items={[
            ['/guides',    'Learn'],
            ['/blog',      'Blog'],
            ['/news',      'News'],
            ['/resources', 'Tools & Communities'],
          ]} />
          <Link href="/pricing" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: ML.bone, opacity: 0.85, borderRadius: 999, textDecoration: 'none' }}>Pricing</Link>
        </div>
        <div style={{ alignItems: 'center', gap: 16 }} className="hidden md:flex">
          {isAuthor ? (
            <Link href="/admin/dashboard" style={{ padding: '10px 22px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: '#E8B04B', color: ML.midnight, borderRadius: 999, textDecoration: 'none', boxShadow: '0 4px 18px -4px rgba(232,176,75,0.7)', letterSpacing: '0.01em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ padding: '10px 20px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: ML.bone, background: 'transparent', border: '1px solid rgba(232,229,221,0.35)', borderRadius: 999, textDecoration: 'none' }}>Sign in</Link>
              <Link href="/register" style={{ padding: '10px 22px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: '#E8B04B', color: ML.midnight, borderRadius: 999, textDecoration: 'none', boxShadow: '0 4px 18px -4px rgba(232,176,75,0.7)', letterSpacing: '0.01em' }}>
                Start free →
              </Link>
            </>
          )}
        </div>
        <HeroMobileMenu isAuthor={isAuthor} />
      </nav>

      {/* Content grid */}
      <div className="rb-grid" style={{ position: 'relative', zIndex: 2, padding: '40px 60px 64px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1280, margin: '0 auto' }}>

        {/* Left: copy */}
        <div style={{ color: ML.bone }}>
          {/* Headline */}
          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontWeight: 400, fontSize: 'clamp(32px, 4.5vw, 68px)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 24px', animation: 'rbFadeUp 0.7s 0.1s ease both', opacity: 0 }}>
            <span style={{ display: 'block' }}>{line1}</span>
            <span style={{ display: 'block', color: ML.brass2, fontStyle: 'italic' }}>{line2}</span>
          </h1>

          {/* Mantra strip */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, animation: 'rbFadeUp 0.7s 0.2s ease both', opacity: 0 }}>
            {['your storefront', 'your readers', 'your revenue', 'your rules'].map((word, i) => (
              <span key={word} style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: i % 2 === 0 ? ML.bone : ML.brass2, opacity: i % 2 === 0 ? 0.55 : 0.9, marginRight: 16 }}>
                {word}{i < 3 ? ' ·' : ''}
              </span>
            ))}
          </div>

          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.6, color: ML.bone, opacity: 0.85, margin: '0 0 32px', maxWidth: 460, animation: 'rbFadeUp 0.7s 0.25s ease both' }}>
            {sub}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28, animation: 'rbFadeUp 0.7s 0.35s ease both', opacity: 0 }}>
            <Link href="/register" className="rb-cta-primary" style={{ padding: '15px 28px', fontSize: 15, fontWeight: 500, background: ML.brass, color: ML.midnight, border: 'none', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 12px 24px -10px ${ML.brass}80`, transition: 'transform 0.2s, box-shadow 0.2s' }}>
              Start your business →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" className="rb-cta-secondary" style={{ padding: '15px 24px', fontSize: 15, fontWeight: 500, background: 'transparent', color: ML.bone, border: '1px solid rgba(232,229,221,0.35)', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s' }}>
              See a live author site →
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.bone, opacity: 0.55, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'rbFadeUp 0.7s 0.45s ease both' }}>
            <span>↳ your readers, always yours</span>
            <span>↳ zero platform fees</span>
            <span>↳ live in 15 minutes</span>
          </div>
        </div>

        {/* Right: book stack */}
        <div className="rb-book-stack">
          <PainSolutionCards />
        </div>
      </div>
    </section>
  );
}
