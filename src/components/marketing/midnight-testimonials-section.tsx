import { sanitize } from '@/lib/sanitize';
import { VAULT } from '@/components/marketing/vault-theme';

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  quote: string;
  rating: number | null;
  image: string | null;
}

function StarRow({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div style={{ display: 'flex', gap: 3, marginBottom: 12 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg key={n} viewBox="0 0 24 24" width={14} height={14} fill={n <= rating ? VAULT.gold : 'none'} stroke={VAULT.gold} strokeWidth={1.5}>
          <path d="M12 2.5l2.7 6.1 6.6.6-5 4.5 1.5 6.5L12 16.8 6.2 20.2l1.5-6.5-5-4.5 6.6-.6L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export function MidnightTestimonialsSection({ testimonials, eyebrow, heading }: {
  testimonials: Testimonial[];
  eyebrow?: React.ReactNode;
  heading?: React.ReactNode;
}) {
  if (testimonials.length === 0) return null;

  const [lead, ...rest] = testimonials;

  return (
    <section style={{ background: VAULT.surf, padding: '120px 60px' }} className="ml-testimonials-section">
      <style>{`
        @media (max-width: 860px) {
          .ml-testimonials-section { padding: 60px 24px !important; }
          .ml-testimonials-grid { grid-template-columns: 1fr !important; }
          .ml-testimonials-lead { padding: 28px 24px !important; }
        }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ marginBottom: 64, maxWidth: 640 }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 16 }}>
            {eyebrow ?? '· Real authors ·'}
          </p>
          <h2 style={{ fontFamily: VAULT.fontDisplay, fontSize: 'clamp(40px, 5vw, 72px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.02em', color: VAULT.ink, margin: 0 }}>
            {heading ?? <>Authors who{' '}<span style={{ fontStyle: 'italic', color: VAULT.gold }}>finally own</span>{' '}their shelf.</>}
          </h2>
        </div>

        {/* Lead testimonial */}
        <div className="ml-testimonials-lead" style={{ background: VAULT.surf2, borderRadius: 18, padding: '48px 56px', marginBottom: 24, color: VAULT.ink }}>
          <StarRow rating={lead.rating} />
          <div
            style={{ fontFamily: VAULT.fontDisplay, fontStyle: 'italic', fontSize: 'clamp(22px, 2.5vw, 32px)', lineHeight: 1.45, margin: '0 0 28px', color: VAULT.ink }}
            dangerouslySetInnerHTML={{ __html: `“${sanitize(lead.quote)}”` }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: VAULT.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: VAULT.bg, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
              {lead.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, margin: 0, color: VAULT.ink }}>{lead.authorName}</p>
              {lead.authorRole && <p style={{ fontSize: 13, margin: 0, color: VAULT.mute }}>{lead.authorRole}</p>}
            </div>
          </div>
        </div>

        {/* Secondary cards */}
        {rest.length > 0 && (
          <div className="ml-testimonials-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(rest.length, 3)}, 1fr)`, gap: 16 }}>
            {rest.map((t) => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', border: `1px solid ${VAULT.hair}`, borderRadius: 14, padding: '24px 28px', color: VAULT.ink }}>
                <StarRow rating={t.rating} />
                <div
                  style={{ fontFamily: VAULT.fontDisplay, fontStyle: 'italic', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px', opacity: 0.9 }}
                  dangerouslySetInnerHTML={{ __html: `"${sanitize(t.quote)}"` }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: VAULT.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: VAULT.bg, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                    {t.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{t.authorName}</p>
                    {t.authorRole && <p style={{ fontSize: 11, margin: 0, opacity: 0.65 }}>{t.authorRole}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
