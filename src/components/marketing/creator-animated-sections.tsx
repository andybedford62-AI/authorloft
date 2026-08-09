'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Zap, BarChart3, Search, MessageSquare, Share2, CreditCard, Mail, Send } from 'lucide-react';

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

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

// ── Stats bar — creator-generic ─────────────────────────────────────────────

export function CreatorStatsBar() {
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
    { value: '0%',            label: 'platform fees on any plan' },
    { value: `${minutes} min`, label: 'from sign-up to live site' },
    { value: '100%',          label: 'your audience — always yours' },
  ];

  return (
    <div ref={ref} style={{ background: ML.ink, borderTop: '1px solid rgba(232,229,221,0.07)', borderBottom: '1px solid rgba(232,229,221,0.07)' }}>
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

// ── Journey section — creator-generic ───────────────────────────────────────

const STEPS = [
  {
    num: '01', label: 'Go Live',
    headline: 'Your pro site, minutes from now.',
    tools: ['Instant subdomain — go live today', 'Beautiful, customizable templates', 'Custom domain support (Standard+)', 'Logo, hero banner & branding tools'],
    bg: ML.ink,
  },
  {
    num: '02', label: 'Sell Direct',
    headline: 'Keep every dollar. Own every sale.',
    tools: ['Product catalog with Stripe checkout', 'Digital downloads — any file format', 'Pre-orders + countdown pages', 'Discount codes & affiliate links'],
    bg: '#1e3355',
  },
  {
    num: '03', label: 'Grow Your Audience',
    headline: 'Visitors today. Fans for life.',
    tools: ['Newsletter capture & email campaigns', 'Free content magnets (email-gated)', 'Media kit & press page generator', 'Discovery through the marketplace'],
    bg: '#27406B',
  },
  {
    num: '04', label: 'Track & Optimize',
    headline: 'Know what works. Scale it fast.',
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
      background: step.bg, borderRadius: 20, padding: '40px 36px', color: ML.bone,
      border: '1px solid rgba(232,229,221,0.12)', position: 'relative', overflow: 'hidden',
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

export function CreatorJourneySection() {
  return (
    <section id="how-it-works" style={{ background: ML.midnight, padding: '120px 60px' }}>
      <style>{`@media (max-width: 768px) { .rb-journey-grid { grid-template-columns: 1fr !important; } }`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Your business, one platform ·</p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4.5vw, 72px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 16px' }}>
            From first upload to<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>full-time digital business.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, color: `${ML.bone}80`, maxWidth: 520, margin: '0 auto', lineHeight: 1.6 }}>
            Every tool you need, working together. No app-switching, no integrations to wrestle with.
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

// ── Integration strip — creator-generic ─────────────────────────────────────

const INTEGRATIONS = [
  { name: 'Stripe', desc: 'Payments', Icon: CreditCard },
  { name: 'Mailchimp', desc: 'Email', Icon: Mail },
  { name: 'ConvertKit', desc: 'Newsletter', Icon: Send },
  { name: 'PostHog', desc: 'Analytics', Icon: BarChart3 },
  { name: 'Gemini AI', desc: 'Content AI', Icon: Sparkles },
  { name: 'Resend', desc: 'Transactional', Icon: Zap },
];

export function CreatorIntegrationStrip() {
  return (
    <section style={{ background: ML.bone, padding: '80px 60px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Your entire digital toolkit ·</p>
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
              <tool.Icon size={18} strokeWidth={1.75} style={{ color: ML.brass, flexShrink: 0 }} aria-hidden="true" />
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

// ── AI Spotlight — creator-generic ──────────────────────────────────────────

export function CreatorAISpotlight() {
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
    { icon: Sparkles,      title: 'AI Product Descriptions', body: 'Generate compelling listings that sell — in seconds.' },
    { icon: Zap,           title: 'Content Ideas',           body: 'Never stare at a blank page. AI drafts, you refine.' },
    { icon: Search,        title: 'SEO Audit Tool',          body: 'Keywords, meta tags, internal links — all analysed.' },
    { icon: BarChart3,     title: 'Marketing Copy',          body: 'Social posts, email subject lines, ad copy — done.' },
    { icon: MessageSquare, title: 'Feedback Analysis',       body: 'AI surfaces what your audience loves — and what to improve.' },
    { icon: Share2,        title: 'Dynamic OG Images',       body: 'Auto-generated social sharing cards for every page.' },
  ];

  return (
    <section style={{ background: ML.mist, padding: '120px 60px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div ref={ref} style={{
          background: ML.midnight, borderRadius: 24, overflow: 'hidden', position: 'relative',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)',
          transition: 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: `radial-gradient(circle, ${ML.brass2}20, transparent 65%)`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: `radial-gradient(circle, ${ML.copper}15, transparent 65%)`, pointerEvents: 'none' }} />

          <div style={{ position: 'relative', padding: '64px 60px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 64, alignItems: 'start' }}>
            <div style={{ maxWidth: 340 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: `${ML.brass}22`, border: `1px solid ${ML.brass}44`, borderRadius: 999, marginBottom: 20 }}>
                <Sparkles style={{ width: 12, height: 12, color: ML.brass2 }} />
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: ML.brass2 }}>Premium · AI Tools</span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 3.5vw, 54px)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 16px' }}>
                Create less.<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>Sell more.</span>
              </h2>
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.65, color: `${ML.bone}aa`, margin: '0 0 28px' }}>
                Let AI handle the marketing work so you can focus on what you do best. Included in Premium — or bring your own Gemini API key for unlimited use.
              </p>
              <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: ML.brass, color: ML.midnight, borderRadius: 999, fontFamily: 'inherit', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                Explore Premium →
              </a>
            </div>
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
          <style>{`@media (max-width: 860px) { .rb-ai-grid { grid-template-columns: 1fr !important; } }`}</style>
        </div>
      </div>
    </section>
  );
}

// ── Final CTA — creator-generic ─────────────────────────────────────────────

export function CreatorCTA() {
  return (
    <section style={{ position: 'relative', overflow: 'hidden', background: ML.midnight, padding: '100px 60px', textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, background: `radial-gradient(circle, ${ML.brass2}20, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 400, height: 400, background: `radial-gradient(circle, ${ML.copper}12, transparent 65%)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 20 }}>· Ready to build? ·</p>
        <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(44px, 6vw, 84px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '-0.03em', color: ML.bone, margin: '0 0 20px' }}>
          Your digital stage<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>starts today.</span>
        </h2>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.6, color: `${ML.bone}cc`, margin: '0 0 36px', maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>
          Join thousands who chose to own their digital business — not rent space on someone else&apos;s platform.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/register" style={{ padding: '16px 36px', fontSize: 16, fontWeight: 500, background: ML.brass, color: ML.midnight, borderRadius: 999, textDecoration: 'none', boxShadow: `0 16px 32px -10px ${ML.brass}60`, display: 'inline-block' }}>
            Start building free →
          </a>
          <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" style={{ padding: '16px 28px', fontSize: 16, fontWeight: 500, background: 'transparent', color: ML.bone, border: '1px solid rgba(232,229,221,0.3)', borderRadius: 999, textDecoration: 'none' }}>
            Tour a live site
          </a>
        </div>
        <p style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 14, color: `${ML.bone}33`, marginTop: 36 }}>
          — No credit card. No lock-in. Just your name on the door. —
        </p>
      </div>
    </section>
  );
}
