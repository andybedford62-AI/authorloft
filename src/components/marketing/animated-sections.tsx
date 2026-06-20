'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Zap, BarChart3, Search, MessageSquare, Share2 } from 'lucide-react';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

// ── Animated counter hook ─────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1400, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const raf = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [started, target, duration]);
  return val;
}

// ── Animated stats bar ────────────────────────────────────────────────────────
export function AnimatedStatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const minutes = useCountUp(5, 900, started);

  const stats = [
    { value: '0%',            label: 'platform fees — keep every dollar' },
    { value: `${minutes} min`, label: 'to your own storefront' },
    { value: '100%',          label: 'of your readers — not Amazon’s' },
  ];

  return (
    <div ref={ref} style={{ background: ML.ink, borderTop: `1px solid rgba(232,229,221,0.07)`, borderBottom: `1px solid rgba(232,229,221,0.07)` }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 60px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ padding: '28px 24px', textAlign: 'center', borderRight: i < stats.length - 1 ? '1px solid rgba(232,229,221,0.07)' : 'none' }}>
            <div style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 'clamp(28px, 3.5vw, 42px)', color: ML.brass2, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: `${ML.bone}70` }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Journey section ───────────────────────────────────────────────────────────
const STEPS = [
  {
    num: '01', label: 'Go Live',
    headline: 'Your name on the door, not theirs.',
    tools: ['Instant author subdomain', 'Genre-optimized templates', 'Custom domain (Standard+)', 'Logo & hero banner'],
    bg: ML.ink,
  },
  {
    num: '02', label: 'Sell Direct',
    headline: 'Keep 100% of every sale.',
    tools: ['Book catalog with Stripe checkout', 'eBook, audio & flipbook formats', 'Pre-orders + countdown pages', 'Discount codes & affiliate links'],
    bg: '#1e3355',
  },
  {
    num: '03', label: 'Grow Your Audience',
    headline: 'Build a list nobody can take away.',
    tools: ['Newsletter capture & campaigns', 'Reader magnets (free email capture)', 'Media kit PDF generator', 'AuthorLoft Bookstore discovery'],
    bg: '#27406B',
  },
  {
    num: '04', label: 'Track & Optimize',
    headline: 'Know exactly what’s working.',
    tools: ['Sales dashboard & revenue charts', 'Traffic analytics (PostHog)', 'AI-powered content assistant', 'SEO audit tool (Premium)'],
    bg: '#162338',
  },
];

function JourneyCard({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setVisible(true); return; }
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fromLeft = index % 2 === 0;

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : `translateX(${fromLeft ? -40 : 40}px)`,
      transition: `opacity 0.7s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1), transform 0.7s ${index * 0.1}s cubic-bezier(0.16,1,0.3,1)`,
      background: step.bg,
      borderRadius: 20,
      padding: '40px 36px',
      color: ML.bone,
      border: '1px solid rgba(232,229,221,0.12)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: `radial-gradient(circle, ${ML.brass2}18, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 64, lineHeight: 1, color: `${ML.brass2}25`, marginBottom: 8, userSelect: 'none' }}>{step.num}</div>
        <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 8 }}>{step.label}</div>
        <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(20px, 2vw, 26px)', fontWeight: 400, lineHeight: 1.15, color: ML.bone, margin: 0 }}>{step.headline}</h3>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {step.tools.map((tool) => (
          <li key={tool} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Georgia, serif', fontSize: 14, color: `${ML.bone}cc`, lineHeight: 1.4 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: ML.brass2, flexShrink: 0 }} />
            {tool}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function JourneySection() {
  return (
    <section style={{ background: ML.midnight, padding: '120px 60px' }}>
      <style>{`
        @media (max-width: 768px) { .rb-journey-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Stop paying for five tools that don&apos;t talk to each other ·</p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4.5vw, 72px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 16px' }}>
            Everything you need.<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>Nothing you don&apos;t own.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: `${ML.bone}80`, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            One platform replaces your website builder, email service, payment processor, and analytics — and you keep 100% of every sale.
          </p>
        </div>

        <div className="rb-journey-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {STEPS.map((step, i) => (
            <JourneyCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Integration strip ─────────────────────────────────────────────────────────
const INTEGRATIONS = [
  { name: 'Stripe', desc: 'Payments', icon: '💳' },
  { name: 'Mailchimp', desc: 'Email', icon: '✉️' },
  { name: 'ConvertKit', desc: 'Newsletter', icon: '📬' },
  { name: 'PostHog', desc: 'Analytics', icon: '📊' },
  { name: 'Gemini AI', desc: 'Content AI', icon: '✨' },
  { name: 'Resend', desc: 'Transactional', icon: '⚡' },
];

export function IntegrationStrip() {
  return (
    <section style={{ background: ML.bone, padding: '80px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Your entire author stack ·</p>
        <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(30px, 3.5vw, 52px)', fontWeight: 400, color: ML.ink, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
          One platform. <span style={{ fontStyle: 'italic', color: ML.copper }}>No tab-switching.</span>
        </h2>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: ML.slate, marginBottom: 48 }}>
          Everything connected — payments, email, analytics, AI — all in one place.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
          {INTEGRATIONS.map((tool) => (
            <div key={tool.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', background: ML.pearl, border: '1px solid #DCDBD3', borderRadius: 999, transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 20px rgba(27,43,71,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
            >
              <span style={{ fontSize: 18 }}>{tool.icon}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Georgia, serif', fontSize: 14, color: ML.ink, lineHeight: 1.2 }}>{tool.name}</div>
                <div style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ML.slate }}>{tool.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI Spotlight ──────────────────────────────────────────────────────────────
export function AISpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const aiFeatures = [
    { icon: Sparkles,     title: 'AI Book Descriptions',    body: 'Generate compelling blurbs that sell — in seconds.' },
    { icon: Zap,          title: 'Blog & Content Ideas',    body: 'Never stare at a blank page. AI drafts, you refine.' },
    { icon: Search,       title: 'SEO Audit Tool',          body: 'Keywords, meta tags, internal links — all analysed.' },
    { icon: BarChart3,    title: 'Marketing Copy',          body: 'Social posts, email subject lines, ad copy — done.' },
    { icon: MessageSquare, title: 'Feedback Analysis',      body: 'AI surfaces what readers love — and what to improve.' },
    { icon: Share2,       title: 'Dynamic OG Images',       body: 'Auto-generated social sharing cards for every book page.' },
  ];

  return (
    <section style={{ background: ML.mist, padding: '120px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div ref={ref} style={{
          background: ML.midnight,
          borderRadius: 24,
          overflow: 'hidden',
          position: 'relative',
          opacity: visible ? 1 : 0,
          transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          {/* Glow */}
          <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: `radial-gradient(circle, ${ML.brass2}20, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: `radial-gradient(circle, ${ML.copper}15, transparent 65%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', padding: '64px 60px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, alignItems: 'start' }}>
            {/* Left */}
            <div style={{ maxWidth: 340 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: `${ML.brass}22`, border: `1px solid ${ML.brass}44`, borderRadius: 999, marginBottom: 20 }}>
                <Sparkles style={{ width: 12, height: 12, color: ML.brass2 }} />
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: ML.brass2 }}>Premium · AI Tools</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 3.5vw, 54px)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 16px' }}>
                Write less.<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>Sell more.</span>
              </h2>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.65, color: `${ML.bone}aa`, margin: '0 0 28px' }}>
                Let AI handle the marketing work so you can stay in the story. Included in Premium — or bring your own Gemini API key for unlimited use.
              </p>
              <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: ML.brass, color: ML.midnight, borderRadius: 999, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                Explore Premium →
              </a>
            </div>

            {/* Right: feature grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              {aiFeatures.map(({ icon: Icon, title, body }) => (
                <div key={title} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(232,229,221,0.15)', borderRadius: 16, padding: '24px 20px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${ML.brass}22`, border: `1px solid ${ML.brass}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon style={{ width: 18, height: 18, color: ML.brass2 }} />
                  </div>
                  <h4 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 16, fontWeight: 400, color: ML.bone, margin: '0 0 8px' }}>{title}</h4>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: `${ML.bone}80`, margin: 0 }}>{body}</p>
                </div>
              ))}
            </div>
          </div>

          <style>{`
            @media (max-width: 860px) {
              .rb-ai-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA section ─────────────────────────────────────────────────────────
export function RebelCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: ML.midnight, padding: '100px 60px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: `radial-gradient(circle, ${ML.brass2}20, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: `radial-gradient(circle, ${ML.copper}12, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 20 }}>· Ready to take back control? ·</p>
        <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(44px, 6vw, 84px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '-0.03em', color: ML.bone, margin: '0 0 20px' }}>
          Your readers are waiting.<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>Stop giving them away.</span>
        </h2>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.6, color: `${ML.bone}cc`, margin: '0 0 36px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
          Every sale through Amazon is money and reader data you&apos;ll never get back. Start free, go live today, and own everything you build.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" style={{ padding: '16px 36px', fontSize: 16, fontWeight: 500, background: ML.brass, color: ML.midnight, borderRadius: 999, textDecoration: 'none', boxShadow: `0 16px 32px -10px ${ML.brass}60`, display: 'inline-block' }}>
            Take back control →
          </a>
          <a href="/bookstore" style={{ padding: '16px 28px', fontSize: 16, fontWeight: 500, background: 'transparent', color: ML.bone, border: '1px solid rgba(232,229,221,0.3)', borderRadius: 999, textDecoration: 'none' }}>
            Browse the bookstore
          </a>
        </div>
        <p style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 14, color: `${ML.bone}33`, marginTop: 36 }}>
          — No credit card. No lock-in. No middleman. —
        </p>
      </div>
    </section>
  );
}
