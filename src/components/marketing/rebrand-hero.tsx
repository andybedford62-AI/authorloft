'use client';

import Link from 'next/link';
import { useState, useEffect, useId } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';
import { VAULT } from '@/components/marketing/vault-theme';

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
          <stop offset="0%" stopColor={VAULT.surf2} stopOpacity="0.9" />
          <stop offset="100%" stopColor={VAULT.surf2} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-g2`} cx="82%" cy="22%" r="55%">
          <stop offset="0%" stopColor={VAULT.gold} stopOpacity="0.55" />
          <stop offset="100%" stopColor={VAULT.gold} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${uid}-g3`} cx="62%" cy="85%" r="55%">
          <stop offset="0%" stopColor={VAULT.surf2} stopOpacity="0.7" />
          <stop offset="100%" stopColor={VAULT.surf2} stopOpacity="0" />
        </radialGradient>
        <filter id={`${uid}-grain`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
          <feColorMatrix values="0 0 0 0 0.85  0 0 0 0 0.88  0 0 0 0 0.93  0 0 0 0.15 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" fill={VAULT.bg} />
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
        <circle key={i} cx={s.cx} cy={s.cy} r={s.r} fill={VAULT.goldLight}>
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
  { pain: "No idea who your audience is",         solution: "Full audience analytics, always", image: "/hero-card-3.png", title: "Your Analytics" },
  { pain: "Paying for 5 tools that don't connect", solution: "One platform, everything built in", image: "/hero-card-4.png", title: "Your Platform" },
  { pain: "Their storefront, their brand",        solution: "Your domain, your design", image: "/hero-card-5.png", title: "Your Brand" },
  { pain: "Amazon owns your readers",              solution: "Sell direct, own your readers", image: "/hero-card-2.png", title: "For Authors" },
  { pain: "Udemy owns your students",               solution: "Sell direct, own your students", image: "/hero-card-4.png", title: "For Course Creators" },
];

function PainSolutionCards() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % PAIN_CARDS.length), 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:block relative" style={{ height: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: '10% -10%', background: `radial-gradient(50% 50% at 50% 50%, ${VAULT.gold}22, transparent 70%)`, filter: 'blur(40px)' }} />

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
              border: `1px solid ${VAULT.hair}`,
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
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(22,35,61,0.55) 0%, rgba(22,35,61,0.85) 100%)' }} />

              {/* Content */}
              <div style={{ position: 'relative', padding: '44px 36px' }}>
                {/* Title label */}
                <div style={{ marginBottom: 24 }}>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.16em',
                    textTransform: 'uppercase', color: VAULT.gold, fontWeight: 600,
                    padding: '4px 12px', background: 'rgba(22,35,61,0.5)', border: `1px solid ${VAULT.gold}44`,
                    borderRadius: 999, backdropFilter: 'blur(6px)',
                  }}>{card.title}</span>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: VAULT.goldMuted, marginBottom: 10 }}>The old way</p>
                  <p style={{ fontFamily: VAULT.fontDisplay, fontSize: 'clamp(20px, 2.2vw, 26px)', fontWeight: 400, lineHeight: 1.25, color: `${VAULT.ink}77`, margin: 0, fontStyle: 'italic' }}>{card.pain}</p>
                </div>
                <div style={{ width: 48, height: 1, background: `linear-gradient(90deg, ${VAULT.gold}00, ${VAULT.gold}, ${VAULT.gold}00)`, marginBottom: 28 }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 10 }}>With AuthorLoft</p>
                  <p style={{ fontFamily: VAULT.fontDisplay, fontSize: 'clamp(24px, 2.8vw, 32px)', fontWeight: 400, lineHeight: 1.2, color: VAULT.ink, margin: 0 }}>{card.solution}</p>
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
              background: i === idx ? VAULT.gold : `${VAULT.ink}25`,
              transition: 'background 0.3s',
            }} aria-label={`Card ${i + 1}`} />
          ))}
          <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: VAULT.gold, opacity: 0.7, letterSpacing: '0.1em', textTransform: 'uppercase', marginLeft: 6 }}>{PAIN_CARDS[idx].title}</span>
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
        style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: VAULT.ink, fontWeight: 400, opacity: 0.85, cursor: 'pointer', borderRadius: VAULT.radius, background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
        {label} <span style={{ fontSize: 9, opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: 8, zIndex: 50 }}>
          <div style={{ minWidth: 210, background: VAULT.surf, border: `1px solid ${VAULT.hair}`, borderRadius: 14, padding: 8, boxShadow: '0 20px 44px -12px rgba(0,0,0,0.6)' }}>
            {items.map(([href, l]) => (
              <Link key={href} href={href} style={{ display: 'block', padding: '9px 12px', fontSize: 13, color: VAULT.ink, textDecoration: 'none', borderRadius: VAULT.radius }}>{l}</Link>
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
  const line1 = headlineLine1 || "They sell your work. They keep your audience.";
  const line2 = headlineLine2 || "Take both back.";
  const sub    = subheadline || "Every sale through someone else's platform is a person you'll never know, never email, never reach again. AuthorLoft gives you your own storefront, your own list — and you own your career. For your books, your courses, or both.";

  return (
    <section style={{ position: 'relative', background: VAULT.bg, overflow: 'hidden', minHeight: '72vh' }}>
      <style>{`
        @keyframes rbFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .rb-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(214,169,74,0.65) !important; }
        .rb-cta-secondary:hover { background: rgba(243,236,219,0.08) !important; }
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
            <text x="0" y="30" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 400, letterSpacing: '-0.02em' }}>
              <tspan fill={VAULT.gold}>Author</tspan><tspan fill={VAULT.ink}>Loft</tspan>
            </text>
          </svg>
        </Link>
        <div style={{ alignItems: 'center', gap: 4, padding: 4, background: 'rgba(243,236,219,0.08)', borderRadius: VAULT.radius, border: `1px solid ${VAULT.hair}`, backdropFilter: 'blur(8px)' }} className="hidden md:flex">
          <Link href="/bookstore" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: VAULT.gold, fontWeight: 600, borderRadius: VAULT.radius, textDecoration: 'none' }}>Bookstore</Link>
          <Link href="/features" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: VAULT.ink, opacity: 0.85, borderRadius: VAULT.radius, textDecoration: 'none' }}>Features</Link>
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
          <Link href="/faq" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: VAULT.ink, opacity: 0.85, borderRadius: VAULT.radius, textDecoration: 'none' }}>FAQ</Link>
          <HeroNavDropdown label="Resources" items={[
            ['/guides',    'Learn'],
            ['/blog',      'Blog'],
            ['/news',      'News'],
            ['/resources', 'Tools & Communities'],
          ]} />
          <Link href="/pricing" style={{ padding: '8px 14px', fontFamily: 'inherit', fontSize: 13, color: VAULT.ink, opacity: 0.85, borderRadius: VAULT.radius, textDecoration: 'none' }}>Pricing</Link>
        </div>
        <div style={{ alignItems: 'center', gap: 16 }} className="hidden md:flex">
          {isAuthor ? (
            <Link href="/admin/dashboard" style={{ padding: '10px 22px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: VAULT.gold, color: VAULT.bg, borderRadius: VAULT.radius, textDecoration: 'none', boxShadow: '0 4px 18px -4px rgba(214,169,74,0.7)', letterSpacing: '0.01em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ padding: '10px 20px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: VAULT.ink, background: 'transparent', border: `1px solid ${VAULT.hair}`, borderRadius: VAULT.radius, textDecoration: 'none' }}>Sign in</Link>
              <Link href="/register" style={{ padding: '10px 22px', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, background: VAULT.gold, color: VAULT.bg, borderRadius: VAULT.radius, textDecoration: 'none', boxShadow: '0 4px 18px -4px rgba(214,169,74,0.7)', letterSpacing: '0.01em' }}>
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
        <div style={{ color: VAULT.ink }}>
          {/* Headline */}
          <h1 style={{ fontFamily: VAULT.fontDisplay, fontWeight: 400, fontSize: 'clamp(32px, 4.5vw, 68px)', lineHeight: 1.05, letterSpacing: '-0.02em', margin: '0 0 24px', animation: 'rbFadeUp 0.7s 0.1s ease both', opacity: 0 }}>
            <span style={{ display: 'block' }}>{line1}</span>
            <span style={{ display: 'block', color: VAULT.gold, fontStyle: 'italic' }}>{line2}</span>
          </h1>

          {/* Mantra strip */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 24, animation: 'rbFadeUp 0.7s 0.2s ease both', opacity: 0 }}>
            {['your storefront', 'your audience', 'your revenue', 'your rules'].map((word, i) => (
              <span key={word} style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: i % 2 === 0 ? VAULT.ink : VAULT.gold, opacity: i % 2 === 0 ? 0.55 : 0.9, marginRight: 16 }}>
                {word}{i < 3 ? ' ·' : ''}
              </span>
            ))}
          </div>

          <p style={{ fontFamily: VAULT.fontBody, fontSize: 18, lineHeight: 1.6, color: VAULT.ink, opacity: 0.85, margin: '0 0 32px', maxWidth: 460, animation: 'rbFadeUp 0.7s 0.25s ease both' }}>
            {sub}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28, animation: 'rbFadeUp 0.7s 0.35s ease both', opacity: 0 }}>
            <Link href="/register" className="rb-cta-primary" style={{ padding: '15px 28px', fontSize: 15, fontWeight: 500, background: VAULT.gold, color: VAULT.bg, border: 'none', borderRadius: VAULT.radius, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 12px 24px -10px ${VAULT.gold}80`, transition: 'transform 0.2s, box-shadow 0.2s' }}>
              Start your business →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" className="rb-cta-secondary" style={{ padding: '15px 24px', fontSize: 15, fontWeight: 500, background: 'transparent', color: VAULT.ink, border: `1px solid ${VAULT.hair}`, borderRadius: VAULT.radius, cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s' }}>
              See a live author site →
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: VAULT.ink, opacity: 0.55, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'rbFadeUp 0.7s 0.45s ease both' }}>
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
