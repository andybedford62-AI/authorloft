'use client';

import { useState } from 'react';
import type { FaqItem } from './faq-section';

export function MidnightFaqSection({ faqs, hasMore = false }: { faqs: FaqItem[]; hasMore?: boolean }) {
  const [openIdx, setOpenIdx] = useState(0);

  if (faqs.length === 0) return null;

  return (
    <section id="faq" style={{ background: '#F0EDE4', padding: '120px 60px' }} className="ml-faq-section">
      <style>{`
        @media (max-width: 860px) {
          .ml-faq-section { padding: 60px 24px !important; }
          .ml-faq-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .ml-faq-intro { position: static !important; }
        }
      `}</style>
      <div className="ml-faq-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 80, alignItems: 'start' }}>
        {/* Left — sticky intro */}
        <div className="ml-faq-intro" style={{ position: 'sticky', top: 100 }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C26A4A', marginBottom: 20 }}>
            · FAQ ·
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 58px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: '#1B2B47', margin: '0 0 20px' }}>
            Frequently asked,{' '}
            <span style={{ fontStyle: 'italic', color: '#C26A4A' }}>plainly answered.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.6, color: '#5C6E89', margin: '0 0 20px' }}>
            Still have a question? We&apos;d love to hear from you.
          </p>
          <a href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 13, fontWeight: 600, letterSpacing: '0.06em', color: '#0F1A2D', background: '#B8893D', borderRadius: 999, textDecoration: 'none', transition: 'background 0.2s, transform 0.2s', boxShadow: '0 4px 12px rgba(184,137,61,0.3)' }}>
            Contact us →
          </a>
          <a href="/faq" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1B2B47', fontWeight: 600, textDecoration: 'none', borderBottom: '2px solid #B8893D', paddingBottom: 2 }}>
            {hasMore ? 'See all FAQs' : 'Browse the full FAQ page'} →
          </a>
        </div>

        {/* Right — accordion */}
        <div style={{ borderTop: '2px solid #1B2B47', paddingTop: 8 }}>
          {faqs.map((item, i) => (
            <div key={item.id} style={{ borderBottom: '1px solid #DCDBD3' }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                aria-expanded={openIdx === i}
                style={{
                  width: '100%', display: 'flex', alignItems: 'flex-start', gap: 16,
                  padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: '#C26A4A', fontWeight: 600, flexShrink: 0, paddingTop: 3 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ flex: 1, fontFamily: 'var(--font-heading, serif)', fontSize: 20, fontWeight: 400, color: '#1B2B47', lineHeight: 1.2 }}>
                  {item.question}
                </span>
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 20, color: '#B8893D', flexShrink: 0, lineHeight: 1, transform: openIdx === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', display: 'inline-block' }}>
                  +
                </span>
              </button>
              {openIdx === i && (
                <div style={{ padding: '0 0 20px 36px' }}>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.7, color: '#5C6E89', margin: 0 }}>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
