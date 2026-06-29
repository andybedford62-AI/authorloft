import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { MidnightPricingSection } from "@/components/marketing/midnight-pricing-section";
import { MidnightTestimonialsSection } from "@/components/marketing/midnight-testimonials-section";
import { AuthorShowcaseSection } from "@/components/marketing/author-showcase-section";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";
import { RedesignHero } from "@/components/marketing/redesign-hero";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Homepage Preview | AuthorLoft",
    robots: { index: false, follow: false },
  };
}

// ── Colors ───────────────────────────────────────────────────────────────────

const C = {
  accent:      '#c9a84c',
  accentLight: '#d4b866',
  bg:          '#0d1520',
  surface:     '#1c2e48',
  border:      '#2a4268',
  text:        '#e8e8e0',
  muted:       '#9a9080',
};

// ── Data fetching (same as main homepage) ────────────────────────────────────

async function getActivePlans() {
  return prisma.plan.findMany({
    where: { isActive: true },
    select: {
      id: true, name: true, tier: true, description: true, featuresJson: true,
      monthlyPriceCents: true, annualPriceCents: true,
      featuredLabel: true, badgeColor: true,
      maxBooks: true, maxPosts: true, maxStorageMb: true,
      customDomain: true, salesEnabled: true, newsletter: true,
      analyticsEnabled: true, flipBooksLimit: true, mediaKitEnabled: true, isDefault: true,
    },
    orderBy: { sortOrder: "asc" },
  }).catch(() => []);
}

async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    take: 3,
    select: { id: true, authorName: true, authorRole: true, quote: true, rating: true, image: true },
  }).catch(() => []);
}

async function getShowcaseAuthors() {
  return prisma.author.findMany({
    where: { showInShowcase: true, isActive: true, books: { some: { isPublished: true } } },
    select: {
      id: true, slug: true, displayName: true, name: true, tagline: true,
      profileImageUrl: true, customDomain: true, showcaseStyle: true,
      books: {
        where: { isPublished: true, coverImageUrl: { not: null } },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 1,
        select: { coverImageUrl: true, title: true },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 8,
  }).catch(() => []);
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomepagePreviewPage() {
  await cookies();
  const [plans, testimonials, showcaseAuthors, session] = await Promise.all([
    getActivePlans(), getTestimonials(), getShowcaseAuthors(),
    getServerSession(authOptions),
  ]);

  let isAuthor = false;
  if (session?.user) {
    const userId = (session.user as any).id as string;
    if (userId) {
      const author = await prisma.author.findUnique({ where: { id: userId }, select: { id: true } }).catch(() => null);
      isAuthor = !!author;
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", fontSize: '1rem', lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

      {/* Preview banner */}
      <div style={{ background: '#b91c1c', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: '0.8125rem', fontWeight: 600, position: 'relative', zIndex: 200 }}>
        PREVIEW — This is a draft homepage redesign. <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline', marginLeft: 8 }}>View current homepage →</Link>
      </div>

      {/* ── Hero (with nav) ───────────────────────────────────────────── */}
      <RedesignHero isAuthor={isAuthor} />

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <hr style={{ border: 'none', borderTop: `1px solid ${C.border}` }} />

      {/* ── Problem Strip ─────────────────────────────────────────────── */}
      <ProblemStrip />

      {/* ── What Is AuthorLoft — 3 Pillars ────────────────────────────── */}
      <PillarsSection />

      {/* ── Comparison Table ──────────────────────────────────────────── */}
      <ComparisonSection />

      {/* ── Author Showcase (dynamic from DB) ─────────────────────────── */}
      <AuthorShowcaseSection
        authors={showcaseAuthors}
        platformDomain={process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'authorloft.com'}
      />

      {/* ── Testimonials (dynamic from DB) ────────────────────────────── */}
      <MidnightTestimonialsSection testimonials={testimonials} />

      {/* ── Newsletter mid-page ───────────────────────────────────────── */}
      <NewsletterMidSection />

      {/* ── Pricing (dynamic from DB) ─────────────────────────────────── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '88px 28px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: C.text, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
            Start free. Scale when you&apos;re ready.
          </h2>
          <p style={{ color: C.muted, fontSize: '1.0625rem', margin: '0 0 48px' }}>No credit card. Upgrade when you want direct sales or a custom domain.</p>
          <MidnightPricingSection plans={plans} />
          <p style={{ fontSize: '0.8125rem', color: C.muted, marginTop: 24 }}>
            Stripe fees apply to direct sales &nbsp;&middot;&nbsp; 30-day money-back guarantee &nbsp;&middot;&nbsp; cancel anytime &nbsp;&middot;&nbsp;
            <Link href="/pricing" style={{ color: C.muted, textDecoration: 'underline' }}>Full plan comparison →</Link>
          </p>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────────────────────────── */}
      <FooterCTA />

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Inline section components (specific to this redesign)
// ═══════════════════════════════════════════════════════════════════════════════

function ProblemStrip() {
  const items = [
    { icon: '📦', title: 'Retailers own your buyers', desc: "Amazon keeps the customer relationship. You ship books and wait for royalty statements — with no idea who's reading." },
    { icon: '✉️', title: "Your list isn't yours", desc: "Build thousands of followers on a platform you don't control, and they can be gone overnight. Email lists built on their terms aren't yours." },
    { icon: '🧩', title: "Five tools that don't talk", desc: "Website. Email. Storefront. Analytics. Payments. You're paying for five things and still gluing them together by hand." },
  ];
  return (
    <div style={{ background: '#1c2e48', borderTop: '1px solid #2a4268', borderBottom: '1px solid #2a4268', padding: '52px 0' }}>
      <style>{`
        .rdh-problem-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .rdh-problem-item { text-align: center; padding: 24px 32px; border-right: 1px solid #2a4268; }
        .rdh-problem-item:last-child { border-right: none; }
        @media (max-width: 820px) {
          .rdh-problem-grid { grid-template-columns: 1fr; }
          .rdh-problem-item { border-right: none !important; border-bottom: 1px solid #2a4268; }
          .rdh-problem-item:last-child { border-bottom: none; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <div className="rdh-problem-grid">
          {items.map((item, i) => (
            <div key={i} className="rdh-problem-item">
              <span style={{ fontSize: '1.75rem', marginBottom: 14, display: 'block' }}>{item.icon}</span>
              <h3 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.25rem', fontWeight: 600, margin: '0 0 8px', color: '#e8e8e0', lineHeight: 1.12 }}>{item.title}</h3>
              <p style={{ fontSize: '0.9rem', color: '#9a9080', lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PillarsSection() {
  const pillars = [
    { num: '01', title: 'Your storefront', desc: 'A beautiful author website with a built-in bookstore, live in 15 minutes. Your domain, your design, your brand — not theirs.' },
    { num: '02', title: 'Your sales', desc: 'Sell eBooks, audiobooks, and print direct to readers via Stripe. Zero platform fees — every dollar from every sale goes straight to you.' },
    { num: '03', title: 'Your list', desc: 'Capture reader emails with newsletter campaigns and reader magnets. Own the list. Nobody can take it away, restrict it, or charge you to reach it.' },
  ];
  return (
    <section style={{ padding: '88px 0', textAlign: 'center', background: '#0d1520' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14, margin: '0 0 14px' }}>The solution</p>
        <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#e8e8e0', margin: '0 0 16px', letterSpacing: '-0.01em' }}>
          One platform.<br />Everything you own.
        </h2>
        <p style={{ fontSize: '1.0625rem', color: '#9a9080', maxWidth: 560, margin: '0 auto 52px', lineHeight: 1.72 }}>
          AuthorLoft replaces your website, email service, payment processor, and analytics —
          and puts you in control of every reader relationship you earn.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 2, background: '#2a4268', borderRadius: 14, overflow: 'hidden', textAlign: 'left' }}>
          {pillars.map((p) => (
            <div key={p.num} style={{ background: '#1c2e48', padding: '40px 32px' }}>
              <div style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '3.5rem', fontWeight: 700, color: 'rgba(201,168,76,0.18)', lineHeight: 1, marginBottom: 18 }}>{p.num}</div>
              <h3 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.35rem', fontWeight: 600, lineHeight: 1.12, color: '#e8e8e0', margin: '0 0 10px' }}>{p.title}</h3>
              <p style={{ color: '#9a9080', fontSize: '0.9375rem', lineHeight: 1.65, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const rows = [
    { label: 'Your revenue', old: 'Retailers take their cut — you see 30–70%', newVal: 'You keep 100%', newSuffix: ' of every direct sale' },
    { label: 'Your readers', old: 'Their platform, their email list, their rules', newVal: 'Your list, always.', newSuffix: ' Nobody can take it from you.' },
  ];
  return (
    <section style={{ background: 'linear-gradient(180deg, #0d1520 0%, #111c2e 50%, #0d1520 100%)', borderTop: `1px solid #2a4268`, borderBottom: `1px solid #2a4268`, padding: '88px 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 14 }}>The difference</p>
          <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(1.85rem, 3vw, 2.6rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#e8e8e0', letterSpacing: '-0.01em', margin: 0 }}>
            What changes when you own it.
          </h2>
        </div>
        <style>{`
          .rdh-ctable { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #2a4268; border-radius: 14px; overflow: hidden; }
          @media (max-width: 820px) {
            .rdh-ctable { grid-template-columns: 1fr; }
            .rdh-ctable-old-head { display: none; }
            .rdh-ctable-old-cell { display: none; }
            .rdh-ctable-new-head { font-size: 0.875rem; letter-spacing: 0.04em; text-align: left; padding: 16px 24px; }
            .rdh-ctable-new-cell { padding: 22px 24px; }
          }
        `}</style>
        <div className="rdh-ctable">
          <div className="rdh-ctable-old-head" style={{ padding: '20px 32px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(0,10,25,0.5)', textAlign: 'center', color: '#9a9080' }}>The old way</div>
          <div className="rdh-ctable-new-head" style={{ padding: '20px 32px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(0,10,25,0.5)', textAlign: 'center', color: '#c9a84c' }}>With AuthorLoft</div>

          {rows.map((row) => (
            <div key={row.label} style={{ display: 'contents' }}>
              <div className="rdh-ctable-old-cell" style={{ background: '#111d2e', padding: '28px 32px' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a9080', marginBottom: 8, fontWeight: 600 }}>{row.label}</div>
                <div style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.35rem', lineHeight: 1.35, color: '#5a5a56', textDecoration: 'line-through', textDecorationColor: 'rgba(255,80,80,0.4)' }}>{row.old}</div>
              </div>
              <div className="rdh-ctable-new-cell" style={{ background: '#162540', padding: '28px 32px' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9a9080', marginBottom: 8, fontWeight: 600 }}>{row.label}</div>
                <div style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: '1.35rem', lineHeight: 1.35, color: '#e8e8e0' }}>
                  <strong style={{ color: '#c9a84c' }}>{row.newVal}</strong>{row.newSuffix}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterMidSection() {
  return (
    <section style={{ textAlign: 'center', background: '#f5f0e8', borderTop: '1px solid #d8ceb8', borderBottom: '1px solid #d8ceb8', padding: '88px 0' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a7030', marginBottom: 14 }}>The Indie Author Playbook</p>
        <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#1a1008', margin: '0 0 14px', letterSpacing: '-0.01em' }}>
          Grow your readership.<br />Keep every reader.
        </h2>
        <p style={{ color: '#5a4a38', fontSize: '1.0625rem', marginBottom: 36, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.68 }}>
          One tactic a week — direct sales, email strategy, and reader growth for independent authors. No fluff. Unsubscribe anytime.
        </p>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          <NewsSubscribeForm source="home" variant="box" />
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section style={{ textAlign: 'center', padding: '112px 0', position: 'relative', overflow: 'hidden', background: '#0d1520' }}>
      {/* Glow */}
      <div style={{ position: 'absolute', bottom: -80, left: '50%', transform: 'translateX(-50%)', width: 640, height: 380, background: 'radial-gradient(ellipse at center, rgba(201,168,76,0.08) 0%, transparent 68%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px', position: 'relative' }}>
        <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', fontWeight: 600, lineHeight: 1.08, fontStyle: 'italic', color: '#e8e8e0', margin: '0 0 18px', letterSpacing: '-0.01em' }}>
          Your readers<br />are waiting.
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#9a9080', margin: '0 auto 44px', maxWidth: 460, lineHeight: 1.7 }}>
          Every sale through a middleman is a reader you&apos;ll never reach again. Start free today and own everything you build.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link href="/register" className="rdh-btn-primary" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, background: '#c9a84c', color: '#000', padding: '15px 32px' }}>
            Start your business — free →
          </Link>
          <Link href="/bookstore" className="rdh-btn-ghost" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, color: '#e8e8e0', border: '1px solid #2a4268', padding: '14px 28px', background: 'transparent' }}>
            Browse the bookstore
          </Link>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#9a9080', margin: 0 }}>No credit card. No lock-in. No middleman.</p>
      </div>
    </section>
  );
}
