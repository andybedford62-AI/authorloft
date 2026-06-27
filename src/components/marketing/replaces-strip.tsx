'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89',
};

const REPLACES = [
  { instead: 'WordPress or Squarespace', label: 'Author website', icon: '🌐' },
  { instead: 'Shopify or Gumroad',       label: 'Direct book sales', icon: '🛒' },
  { instead: 'Mailchimp or ConvertKit',   label: 'Newsletter & campaigns', icon: '✉️' },
  { instead: 'Google Analytics',          label: 'Reader analytics', icon: '📊' },
  { instead: 'A separate landing page',   label: 'Pre-orders & countdowns', icon: '⏰' },
];

export function ReplacesStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ background: ML.midnight, padding: '120px 60px', borderTop: `1px solid rgba(232,229,221,0.06)` }}>
      <style>{`
        @media (max-width: 768px) { .rb-replaces-grid { grid-template-columns: 1fr !important; } }
        .rb-replace-card { transition: transform 0.2s, box-shadow 0.2s; }
        .rb-replace-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          textAlign: 'center', marginBottom: 64,
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>
            · One platform replaces all of this ·
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: 0 }}>
            Stop juggling tools. <span style={{ fontStyle: 'italic', color: ML.brass2 }}>Start owning everything.</span>
          </h2>
        </div>

        <div className="rb-replaces-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 12 }}>
          {REPLACES.map((item, i) => (
            <div key={item.label} className="rb-replace-card" style={{
              background: ML.ink,
              borderRadius: 16,
              padding: '28px 24px',
              border: '1px solid rgba(232,229,221,0.08)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(24px)',
              transition: `opacity 0.6s ${0.1 + i * 0.08}s cubic-bezier(0.16,1,0.3,1), transform 0.6s ${0.1 + i * 0.08}s cubic-bezier(0.16,1,0.3,1)`,
            }}>
              <span style={{ fontSize: 20, display: 'block', marginBottom: 14 }}>{item.icon}</span>
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: 13, color: `${ML.bone}88`,
                textDecoration: 'line-through', margin: '0 0 8px', lineHeight: 1.4,
              }}>
                Instead of {item.instead}
              </p>
              <p style={{
                fontFamily: 'Georgia, serif', fontSize: 16, color: ML.brass2,
                margin: 0, fontWeight: 400, lineHeight: 1.3,
              }}>
                → {item.label}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          textAlign: 'center', marginTop: 56,
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(16px)',
          transition: 'opacity 0.7s 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.7s 0.5s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <p style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 'clamp(18px, 2.5vw, 22px)', color: ML.brass2, margin: '0 0 16px' }}>
            One login. One subscription. One platform.
          </p>
          <Link href="/features" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em' }}>
            See all features →
          </Link>
        </div>
      </div>
    </section>
  );
}
