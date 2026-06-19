'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { HeroMobileMenu } from '@/components/marketing/hero-mobile-menu';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

const SLIDES = [
  { key: 'books', gradient: 'linear-gradient(135deg, #d4537e 0%, #1d9e75 100%)', label: 'Books' },
  { key: 'music', gradient: 'linear-gradient(135deg, #378add 0%, #ba7517 100%)', label: 'Music' },
  { key: 'art',   gradient: 'linear-gradient(135deg, #534ab7 0%, #d4537e 100%)', label: 'Art' },
];

// ── Book imagery — cinematic stacked covers ─────────────────────────────────

function BookImagery() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 900 }}>
      <div style={{ position: 'absolute', inset: '10%', background: 'radial-gradient(ellipse at center, rgba(212,174,106,0.25), transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'relative', width: 340, height: 420, transform: 'rotateY(-6deg) rotateX(2deg)', transformStyle: 'preserve-3d' }}>
        {[
          { bg: 'linear-gradient(160deg, #1a0e08 0%, #3d2415 30%, #6b4530 60%, #8b6340 100%)', spine: '#1a0e08', title: 'The Last\nChapter', author: 'A. Bedford', accent: '#d4ae6a', bottom: 0, left: 0, z: 3, w: 200, h: 290 },
          { bg: 'linear-gradient(160deg, #0d2636 0%, #1a4a5a 30%, #2a6a7a 60%, #3a8a9a 100%)', spine: '#0d2636', title: 'Ocean\nTides', author: 'M. Harper', accent: '#8acae0', bottom: 30, left: 80, z: 2, w: 185, h: 270, rot: 4 },
          { bg: 'linear-gradient(160deg, #2d0e24 0%, #5a1a44 30%, #7a2a5a 60%, #9a4070 100%)', spine: '#2d0e24', title: 'Midnight\nRose', author: 'L. Chen', accent: '#e8a0c0', bottom: 55, left: 145, z: 1, w: 175, h: 255, rot: -3 },
        ].map((b) => (
          <div key={b.title} style={{
            position: 'absolute', bottom: b.bottom, left: b.left, zIndex: b.z,
            width: b.w, height: b.h, borderRadius: 3,
            transform: b.rot ? `rotateZ(${b.rot}deg)` : undefined,
            boxShadow: '8px 12px 40px rgba(0,0,0,0.5), 2px 2px 8px rgba(0,0,0,0.3)',
          }}>
            <div style={{ width: '100%', height: '100%', background: b.bg, borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(0,0,0,0.15) 100%)' }} />
              <div style={{ position: 'absolute', inset: 14, border: `1px solid ${b.accent}44`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', inset: 20, border: `1px solid ${b.accent}22`, borderRadius: 1 }} />
              <div style={{ position: 'absolute', top: 28, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: b.accent, opacity: 0.8 }}>{b.author}</div>
              <div style={{ position: 'absolute', top: '35%', left: 24, right: 24, textAlign: 'center', fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 22, lineHeight: 1.15, color: b.accent, whiteSpace: 'pre-line' }}>{b.title}</div>
              <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', color: b.accent, fontFamily: 'serif', fontSize: 22, opacity: 0.5, lineHeight: 1 }}>❦</div>
              <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 7, letterSpacing: '0.2em', textTransform: 'uppercase', color: b.accent, opacity: 0.5 }}>A Novel</div>
            </div>
            <div style={{ position: 'absolute', left: -10, top: 0, width: 10, height: '100%', background: b.spine, borderRadius: '3px 0 0 3px', boxShadow: 'inset -2px 0 4px rgba(255,255,255,0.08)' }} />
            <div style={{ position: 'absolute', right: -4, top: 5, width: 4, height: 'calc(100% - 10px)', background: 'linear-gradient(90deg, #e8dcc8, #f5efe4, #e8dcc8)', borderRadius: '0 1px 1px 0' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Music imagery — studio waveform + vinyl ─────────────────────────────────

function MusicImagery() {
  const heights = [25,42,65,85,105,120,95,110,80,55,90,115,100,70,88,108,75,50,68,92,110,85,60,45,30,55,78,95,70,40];
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: '10%', background: 'radial-gradient(ellipse at center, rgba(55,138,221,0.2), transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Vinyl record */}
        <div style={{ width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, #1a1a1a 18%, #2a2a2a 20%, #1a1a1a 22%, #2a2a2a 35%, #1a1a1a 37%, #2a2a2a 50%, #1a1a1a 52%, #2a2a2a 65%, #1a1a1a 67%, #222 100%)', boxShadow: '8px 12px 40px rgba(0,0,0,0.5)', animation: 'vinylSpin 4s linear infinite', flexShrink: 0, position: 'relative' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 50, height: 50, borderRadius: '50%', background: 'linear-gradient(135deg, #ba7517, #d4ae6a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1a1a1a' }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />
        </div>
        {/* Waveform */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2.5, height: 220 }}>
          {heights.map((h, i) => (
            <div key={i} style={{
              width: 4, height: h, borderRadius: 2,
              background: `linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(186,117,23,0.7) 100%)`,
              animation: `waveAnim ${0.7 + (i % 7) * 0.12}s ease-in-out ${i * 0.06}s infinite alternate`,
              boxShadow: '0 0 6px rgba(186,117,23,0.3)',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Art imagery — gallery canvases with brush textures ──────────────────────

function ArtImagery() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: '10%', background: 'radial-gradient(ellipse at center, rgba(83,74,183,0.2), transparent 70%)', filter: 'blur(30px)' }} />
      <div style={{ position: 'relative', width: 380, height: 380 }}>
        {[
          { bg: 'linear-gradient(135deg, #e84393 0%, #fd79a8 30%, #ffeaa7 60%, #55efc4 100%)', bottom: 0, left: 0, z: 3, rot: -4, w: 220, h: 280, shadow: '0 16px 48px rgba(0,0,0,0.4)' },
          { bg: 'linear-gradient(160deg, #0984e3 0%, #74b9ff 30%, #81ecec 60%, #ffeaa7 100%)', bottom: 30, left: 90, z: 2, rot: 3, w: 200, h: 260, shadow: '0 12px 36px rgba(0,0,0,0.35)' },
          { bg: 'linear-gradient(45deg, #a29bfe 0%, #fd79a8 35%, #fdcb6e 65%, #e17055 100%)', bottom: 55, left: 170, z: 1, rot: -2, w: 185, h: 245, shadow: '0 10px 30px rgba(0,0,0,0.3)' },
        ].map((f, i) => (
          <div key={i} style={{
            position: 'absolute', bottom: f.bottom, left: f.left, zIndex: f.z,
            width: f.w, height: f.h, transform: `rotate(${f.rot}deg)`,
            boxShadow: f.shadow, borderRadius: 2,
          }}>
            {/* Frame border */}
            <div style={{ position: 'absolute', inset: -6, background: 'linear-gradient(135deg, #2a2420, #4a3c30, #2a2420)', borderRadius: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }} />
            {/* Canvas */}
            <div style={{ position: 'absolute', inset: 0, background: f.bg, borderRadius: 1, overflow: 'hidden' }}>
              {/* Texture overlay for painterly feel */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 30%, rgba(0,0,0,0.08) 70%, transparent 100%)' }} />
              {/* Brush strokes */}
              <div style={{ position: 'absolute', top: '20%', left: '10%', width: '80%', height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 2, transform: 'rotate(-8deg)' }} />
              <div style={{ position: 'absolute', top: '50%', left: '5%', width: '60%', height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, transform: 'rotate(3deg)' }} />
              <div style={{ position: 'absolute', top: '70%', left: '20%', width: '70%', height: 2, background: 'rgba(0,0,0,0.1)', borderRadius: 2, transform: 'rotate(-4deg)' }} />
            </div>
          </div>
        ))}
        {/* Paint splatter accents */}
        <div style={{ position: 'absolute', top: 10, right: 20, width: 18, height: 18, borderRadius: '50%', background: 'rgba(253,121,168,0.6)', filter: 'blur(2px)', zIndex: 4 }} />
        <div style={{ position: 'absolute', bottom: 20, left: 40, width: 12, height: 12, borderRadius: '50%', background: 'rgba(85,239,196,0.5)', filter: 'blur(2px)', zIndex: 4 }} />
        <div style={{ position: 'absolute', top: 60, left: 10, width: 10, height: 10, borderRadius: '50%', background: 'rgba(162,155,254,0.5)', filter: 'blur(1px)', zIndex: 4 }} />
      </div>
    </div>
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
    <section style={{ position: 'relative', overflow: 'hidden', height: '72vh', minHeight: 520, maxHeight: 700 }}>
      <style>{`
        @keyframes rbFadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes waveAnim { from{transform:scaleY(0.5);opacity:0.4} to{transform:scaleY(1);opacity:0.9} }
        @keyframes vinylSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .rb-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 32px -10px rgba(184,137,61,0.65) !important; }
        .rb-cta-secondary:hover { background: rgba(232,229,221,0.08) !important; }
        .ch-slide { position: absolute; inset: 0; opacity: 0; transition: opacity 0.6s ease-in-out; }
        .ch-slide.active { opacity: 1; }
        .ch-dot { width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid rgba(232,229,221,0.5); background: transparent; cursor: pointer; padding: 0; transition: all 0.3s ease; }
        .ch-dot.active { background: #D4AE6A; border-color: #D4AE6A; }
        @media (max-width: 860px) {
          .rb-nav { padding: 16px 20px !important; }
          .ch-hero-grid { grid-template-columns: 1fr !important; padding: 24px 22px 40px !important; gap: 16px !important; }
          .ch-imagery-col { display: none !important; }
        }
      `}</style>

      {/* Gradient backgrounds */}
      {SLIDES.map((slide, i) => (
        <div key={slide.key} className={`ch-slide ${i === active ? 'active' : ''}`} style={{ background: slide.gradient }} />
      ))}

      {/* Nav */}
      <nav className="rb-nav" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 60px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={160} height={46} style={{ height: 40, width: 'auto' }} priority />
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
      <div className="ch-hero-grid" style={{ position: 'relative', zIndex: 2, padding: '32px 60px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'center', maxWidth: 1280, margin: '0 auto', height: 'calc(100% - 76px)' }}>

        {/* Left: copy */}
        <div style={{ color: ML.bone }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '5px 12px 5px 5px', background: 'rgba(15,26,45,0.6)', border: '1px solid rgba(232,229,221,0.18)', borderRadius: 999, marginBottom: 20, backdropFilter: 'blur(8px)', animation: 'rbFadeUp 0.6s ease both' }}>
            <span style={{ padding: '3px 10px', background: ML.brass, color: ML.midnight, borderRadius: 999, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600 }}>Creator Platform</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.bone, opacity: 0.85 }}>Free forever · no card needed</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontWeight: 400, fontSize: 'clamp(40px, 5.5vw, 80px)', lineHeight: 0.92, letterSpacing: '-0.03em', margin: '0 0 20px', animation: 'rbFadeUp 0.7s 0.1s ease both', opacity: 0 }}>
            <span style={{ display: 'block' }}>Build your</span>
            <span style={{ display: 'block', color: ML.brass2, fontStyle: 'italic' }}>creator business.</span>
          </h1>

          <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.55, color: ML.bone, opacity: 0.85, margin: '0 0 24px', maxWidth: 440, animation: 'rbFadeUp 0.7s 0.25s ease both' }}>
            Host, promote, and sell direct, grow your listing and own every built relationship.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20, animation: 'rbFadeUp 0.7s 0.35s ease both', opacity: 0 }}>
            <Link href="/register" className="rb-cta-primary" style={{ padding: '13px 24px', fontSize: 14, fontWeight: 500, background: ML.brass, color: ML.midnight, border: 'none', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: `0 12px 24px -10px ${ML.brass}80`, transition: 'transform 0.2s, box-shadow 0.2s' }}>
              Start building free →
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" className="rb-cta-secondary" style={{ padding: '13px 20px', fontSize: 14, fontWeight: 500, background: 'transparent', color: ML.bone, border: '1px solid rgba(232,229,221,0.35)', borderRadius: 999, cursor: 'pointer', textDecoration: 'none', transition: 'background 0.2s' }}>
              Tour a live site →
            </a>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.bone, opacity: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase', animation: 'rbFadeUp 0.7s 0.45s ease both' }}>
            <span>↳ 5-minute setup</span>
            <span>↳ zero platform fees</span>
            <span>↳ your audience, always</span>
          </div>
        </div>

        {/* Right: cycling imagery — fills available space */}
        <div className="ch-imagery-col" style={{ position: 'relative', height: '100%', minHeight: 360 }}>
          <div style={{ position: 'absolute', inset: 0, opacity: active === 0 ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}>
            <BookImagery />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: active === 1 ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}>
            <MusicImagery />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: active === 2 ? 1 : 0, transition: 'opacity 0.6s ease-in-out' }}>
            <ArtImagery />
          </div>

          {/* Slide dots */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, zIndex: 5 }}>
            {SLIDES.map((s, i) => (
              <button key={s.key} className={`ch-dot ${i === active ? 'active' : ''}`} onClick={() => setActive(i)} aria-label={s.label} />
            ))}
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: ML.bone, opacity: 0.6, letterSpacing: '0.08em', marginLeft: 4 }}>{SLIDES[active].label}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
