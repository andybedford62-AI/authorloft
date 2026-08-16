import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { MidnightPricingSection } from "@/components/marketing/midnight-pricing-section";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";
import { RebelHero } from "@/components/marketing/rebrand-hero";
import { getFoundingOfferCopy } from "@/lib/founding-offer";
import { sanitize } from "@/lib/sanitize";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("home");
  return {
    title: "Your Books. Your Readers. Your Business. | AuthorLoft",
    description:
      "AuthorLoft gives authors their own storefront, their own email list, and 100% of every sale. Website, direct book sales, newsletter, reader analytics, media kits, and pre-orders — everything authors need to run their business, all in one place. Free to start.",
    alternates: { canonical: "/" },
    openGraph: {
      type:        "website",
      title:       "Your Books. Your Readers. Your Business. | AuthorLoft",
      description: "Own your author business with AuthorLoft. Your own storefront, your own reader list, 100% of every sale. Direct book sales, newsletter campaigns, reader analytics, media kits, and pre-orders — all in one platform, free to start.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft — your books, your readers, your business" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Your Books. Your Readers. Your Business. | AuthorLoft",
      description: "Own your author business with AuthorLoft. Your own storefront, your own reader list, 100% of every sale. Direct book sales, newsletter campaigns, reader analytics, media kits, and pre-orders — all in one platform, free to start.",
      images:      [ogImage],
    },
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

async function getFaqs() {
  const [items, total] = await Promise.all([
    prisma.homepageFaq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 10,
      select: { id: true, question: true, answer: true },
    }).catch(() => []),
    prisma.homepageFaq.count({ where: { isActive: true } }).catch(() => 0),
  ]);
  return { items, total };
}

// ── Structured data ──────────────────────────────────────────────────────────

const PLATFORM_URL = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "AuthorLoft — Your Books. Your Readers. Your Business.",
  url: PLATFORM_URL,
  description:
    "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow — all on one platform, free to start.",
  isPartOf: { "@type": "WebSite", name: "AuthorLoft", url: PLATFORM_URL },
  speakable: {
    "@type": "SpeakableSpecification",
    cssSelector: ["h1", "h2", ".hero-description"],
  },
  about: {
    "@type": "SoftwareApplication",
    name: "AuthorLoft",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to start — no credit card required",
    },
    featureList: [
      "Author Website Builder",
      "Direct Book Sales (ebooks, print, audiobooks)",
      "Newsletter & Email Marketing",
      "Reader Analytics",
      "ARC Management",
      "Author Media Kit",
      "AI Writing & Marketing Tools",
      "Indie Author Bookstore",
      "Book Pre-Orders",
      "Affiliate Program",
      "Custom Domain Support",
      "Flip Book Previews",
      "SEO Auditor",
    ].join(", "),
  },
};

const howToLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to launch and grow your independent author business with AuthorLoft",
  description: "Three pillars to owning your author business: launch your storefront, sell direct, and own your reader list.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Your Storefront",
      text: "Launch a beautiful author website with a built-in bookstore, live in 15 minutes. Your domain, your design, your brand.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Your Sales",
      text: "Sell eBooks, audiobooks, and print direct to readers via Stripe. Zero platform fees — every dollar from every sale goes straight to you.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Your List",
      text: "Capture reader emails with newsletter campaigns and reader magnets. Own the list. Nobody can take it away, restrict it, or charge you to reach it.",
    },
  ],
};

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  await cookies();
  const [plans, testimonials, showcaseAuthors, faqData, session, heroSettings, foundingOffer] = await Promise.all([
    getActivePlans(), getTestimonials(), getShowcaseAuthors(), getFaqs(),
    getServerSession(authOptions),
    prisma.platformSettings.findUnique({
      where: { id: "singleton" },
      select: { heroHeadlineLine1: true, heroHeadlineLine2: true, heroSubheadline: true },
    }).catch(() => null),
    getFoundingOfferCopy().catch(() => null),
  ]);

  let isAuthor = false;
  if (session?.user) {
    const userId = (session.user as any).id as string;
    if (userId) {
      const author = await prisma.author.findUnique({ where: { id: userId }, select: { id: true } }).catch(() => null);
      isAuthor = !!author;
    }
  }

  const faqs = faqData.items;
  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer.replace(/<[^>]+>/g, "").trim() },
    })),
  } : null;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", fontSize: '1rem', lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

      {/* ── Structured Data (JSON-LD) ────────────────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* ── Hero (with nav) ───────────────────────────────────────────── */}
      <RebelHero
        isAuthor={isAuthor}
        headlineLine1={heroSettings?.heroHeadlineLine1}
        headlineLine2={heroSettings?.heroHeadlineLine2}
        subheadline={heroSettings?.heroSubheadline}
      />

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <hr style={{ border: 'none', borderTop: `1px solid ${C.border}` }} />

      {/* ── What actually changes (consolidated problem/solution) ─────── */}
      <WhatChangesSection />

      {/* ── Product preview (real screenshots, not mockups) ───────────── */}
      <ProductPreviewSection />

      {/* ── Founder note (dynamic from DB — swap back to
          AuthorShowcaseSection + MidnightTestimonialsSection once
          there are 2+ real, independent customer testimonials) ────── */}
      <FounderNoteSection
        testimonial={testimonials[0]}
        author={showcaseAuthors[0]}
        platformDomain={process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'authorloft.com'}
      />

      {/* ── Newsletter mid-page ───────────────────────────────────────── */}
      <NewsletterMidSection />

      {/* ── Pricing (dynamic from DB) ─────────────────────────────────── */}
      <section style={{ background: C.surface, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: '88px 28px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: C.text, marginBottom: 12, letterSpacing: '-0.01em' }}>
            Start free. Scale when you&apos;re ready.
          </h2>
          <p style={{ color: C.muted, fontSize: '1.0625rem', marginBottom: 48 }}>No credit card. Upgrade when you want direct sales or a custom domain.</p>
          {foundingOffer && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
              maxWidth: 620, margin: '0 auto 40px', padding: '20px 24px',
              borderRadius: 16, border: `1.5px solid ${C.accent}`, background: C.surface,
              boxShadow: `0 8px 28px ${C.bg}99`,
            }}>
              <div style={{
                flexShrink: 0, width: 72, height: 72, borderRadius: '50%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${C.accentLight}, ${C.accent})`, color: C.bg,
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{foundingOffer.percentOff}%</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>off</span>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accent, margin: '0 0 4px' }}>🎉 Founding Member Offer</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: C.text, margin: 0 }}>{foundingOffer.headline}</p>
                <p style={{ fontSize: '0.8rem', color: C.muted, margin: '4px 0 0' }}>{foundingOffer.subtext}</p>
              </div>
            </div>
          )}
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

function WhatChangesSection() {
  const SERIF = "var(--font-heading, 'Playfair Display', Georgia, serif)";
  const rows = [
    {
      label: 'Who gets paid',
      old: 'Retailers keep 30–70% of every sale. You get a payout and a mystery — no idea who bought, or why.',
      newVal: 'You keep 100% of what you earn.',
      newSuffix: " Stripe's standard card fee is the only other cost — same as everywhere else online.",
    },
    {
      label: 'Who owns your readers',
      old: "Their platform, their rules. Followers can vanish overnight — an algorithm change, a banned account, a dead app.",
      newVal: 'Your email list, always yours.',
      newSuffix: ' Export it anytime, take it anywhere. Nobody can rent it back to you.',
    },
    {
      label: 'How many tabs you need open',
      old: "A website here, an email tool there, checkout somewhere else — five logins that don't talk to each other.",
      newVal: 'One dashboard.',
      newSuffix: ' Your site, your store, your list, your numbers — in one place, for one price.',
    },
  ];
  return (
    <section style={{ background: '#0d1520', borderTop: '1px solid #2a4268', borderBottom: '1px solid #2a4268', padding: '88px 0' }}>
      <style>{`
        .rdh-cmp-table { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 2px solid #3a5580; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.35); }
        @media (max-width: 820px) {
          .rdh-cmp-table { grid-template-columns: 1fr; }
          .rdh-cmp-old-head, .rdh-cmp-old-cell { display: none; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a84c', margin: '0 0 14px' }}>What actually changes</p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#e8e8e0', letterSpacing: '-0.01em', margin: '0 0 16px' }}>
            Here&apos;s exactly what you get back.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#9a9080', maxWidth: 560, margin: '0 auto', lineHeight: 1.72 }}>
            Not vague promises — three concrete things that are different the moment you switch.
          </p>
        </div>
        <div className="rdh-cmp-table">
          {/* Column headers */}
          <div className="rdh-cmp-old-head" style={{ padding: '18px 32px', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#15233a', textAlign: 'center', color: '#6b7a90', borderBottom: '2px solid #3a5580' }}>Right now</div>
          <div style={{ padding: '18px 32px', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: '#1a3050', textAlign: 'center', color: '#c9a84c', borderBottom: '2px solid #3a5580', borderLeft: '2px solid #3a5580' }}>With AuthorLoft</div>

          {rows.map((row, i) => (
            <div key={row.label} style={{ display: 'contents' }}>
              {/* Old way cell */}
              <div className="rdh-cmp-old-cell" style={{ background: '#0f1a2d', padding: '32px 36px', borderBottom: i < rows.length - 1 ? '1px solid #2a4268' : 'none' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5c6e89', marginBottom: 10, fontWeight: 700 }}>{row.label}</div>
                <div style={{ fontFamily: SERIF, fontSize: '1.2rem', lineHeight: 1.45, color: '#3d4f66', textDecoration: 'line-through', textDecorationColor: 'rgba(255,80,80,0.5)', fontStyle: 'italic' }}>{row.old}</div>
              </div>
              {/* New way cell */}
              <div style={{ background: '#1c3358', padding: '32px 36px', borderLeft: '2px solid #3a5580', borderBottom: i < rows.length - 1 ? '1px solid #2a4268' : 'none' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8a9bb5', marginBottom: 10, fontWeight: 700 }}>{row.label}</div>
                <div style={{ fontFamily: SERIF, fontSize: '1.25rem', lineHeight: 1.45, color: '#f0ede4' }}>
                  <strong style={{ color: '#d4ae6a', fontWeight: 700 }}>{row.newVal}</strong>{row.newSuffix}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductPreviewSection() {
  const SERIF = "var(--font-heading, 'Playfair Display', Georgia, serif)";
  const GOLD = '#c9a84c';

  function BrowserFrame({
    src, alt, aspectRatio, chrome = true,
  }: { src: string; alt: string; aspectRatio: string; chrome?: boolean }) {
    return (
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #2a4268', boxShadow: '0 20px 50px -20px rgba(0,0,0,0.55)', background: '#111c2c' }}>
        {chrome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: '#0f1a2d', borderBottom: '1px solid #2a4268' }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e0605a' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#e0b45a' }} />
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#5ac97a' }} />
          </div>
        )}
        <div style={{ position: 'relative', width: '100%', aspectRatio, background: '#fff' }}>
          <Image src={src} alt={alt} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: 'cover', objectPosition: 'top' }} />
        </div>
      </div>
    );
  }

  return (
    <section style={{ background: '#111c2c', borderTop: '1px solid #2a4268', borderBottom: '1px solid #2a4268', padding: '88px 0' }}>
      <style>{`
        .rdh-preview-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 28px; align-items: start; }
        .rdh-preview-stack { display: grid; gap: 24px; }
        @media (max-width: 900px) {
          .rdh-preview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD, margin: '0 0 14px' }}>See it for yourself</p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#e8e8e0', letterSpacing: '-0.01em', margin: '0 0 16px' }}>
            Not a mockup. This is the actual product.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: '#9a9080', maxWidth: 540, margin: '0 auto', lineHeight: 1.72 }}>
            Real screenshots from a real AuthorLoft site — no stock photos, no Photoshop.
          </p>
        </div>
        <div className="rdh-preview-grid">
          <div>
            <BrowserFrame
              src="https://fweccazwdlrdbcrdbbev.supabase.co/storage/v1/object/public/book-covers/blog/cover-1786845641135.png"
              alt="A live AuthorLoft author site"
              aspectRatio="823 / 942"
              chrome={false}
            />
            <p style={{ marginTop: 14, fontSize: '0.9rem', color: '#9a9080', lineHeight: 1.6 }}>
              <strong style={{ color: '#e8e8e0' }}>Live right now.</strong> This is an actual author&apos;s AuthorLoft site — not a template preview, the real thing.
            </p>
          </div>
          <div className="rdh-preview-stack">
            <div>
              <BrowserFrame
                src="https://fweccazwdlrdbcrdbbev.supabase.co/storage/v1/object/public/book-covers/blog/cover-1786845582294.png"
                alt="The AuthorLoft dashboard"
                aspectRatio="4 / 3.4"
              />
              <p style={{ marginTop: 14, fontSize: '0.9rem', color: '#9a9080', lineHeight: 1.6 }}>
                <strong style={{ color: '#e8e8e0' }}>Your dashboard.</strong> Books, subscribers, sales — one screen, not five tabs.
              </p>
            </div>
            <div>
              <BrowserFrame
                src="https://fweccazwdlrdbcrdbbev.supabase.co/storage/v1/object/public/book-covers/blog/cover-1786845608667.png"
                alt="AuthorLoft theme picker with genre palettes"
                aspectRatio="16 / 10.5"
              />
              <p style={{ marginTop: 14, fontSize: '0.9rem', color: '#9a9080', lineHeight: 1.6 }}>
                <strong style={{ color: '#e8e8e0' }}>Pick a theme built for your genre.</strong> Change it anytime — no developer required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FounderNoteSection({
  testimonial,
  author,
  platformDomain,
}: {
  testimonial?: { authorName: string; authorRole: string | null; quote: string };
  author?: { slug: string; customDomain: string | null };
  platformDomain: string;
}) {
  if (!testimonial) return null;
  const siteUrl = author
    ? (author.customDomain ? `https://${author.customDomain}` : `https://${author.slug}.${platformDomain}`)
    : null;
  return (
    <section style={{ background: '#27406B', padding: '96px 28px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#D4AE6A', marginBottom: 24 }}>
          From the founder
        </p>
        <div
          style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 'clamp(21px, 2.4vw, 28px)', lineHeight: 1.5, color: '#F0EDE4', margin: '0 0 32px' }}
          dangerouslySetInnerHTML={{ __html: `“${sanitize(testimonial.quote)}”` }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#D4AE6A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0F1A2D', fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
            {testimonial.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontWeight: 600, fontSize: 15, margin: 0, color: '#F0EDE4' }}>{testimonial.authorName}</p>
            {testimonial.authorRole && <p style={{ fontSize: 13, margin: 0, color: '#B8C2D9' }}>{testimonial.authorRole}</p>}
          </div>
        </div>
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 28, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D4AE6A', textDecoration: 'none' }}>
            See my site →
          </a>
        )}
      </div>
    </section>
  );
}

function NewsletterMidSection() {
  return (
    <section style={{ textAlign: 'center', background: '#f5f0e8', borderTop: '1px solid #d8ceb8', borderBottom: '1px solid #d8ceb8', padding: '88px 0' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#9a7030', marginBottom: 14 }}>The Indie Author Playbook</p>
        <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#1a1008', marginBottom: 14, letterSpacing: '-0.01em' }}>
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
        <h2 style={{ fontFamily: "var(--font-heading, 'Playfair Display', Georgia, serif)", fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', fontWeight: 600, lineHeight: 1.08, fontStyle: 'italic', color: '#e8e8e0', marginBottom: 18, letterSpacing: '-0.01em' }}>
          Your audience<br />is waiting.
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#9a9080', marginBottom: 44, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>
          Every sale through a middleman is someone you&apos;ll never reach again. Start free today and own every book, every reader, every dollar.
        </p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link href="/register" className="rdh-btn-primary" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, background: '#c9a84c', color: '#000', padding: '15px 32px' }}>
            Start your business — free →
          </Link>
          <Link href="/bookstore" className="rdh-btn-ghost" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, color: '#e8e8e0', border: '1px solid #2a4268', padding: '14px 28px', background: 'transparent' }}>
            Browse the bookstore
          </Link>
        </div>
        <p style={{ fontSize: '0.8125rem', color: '#9a9080' }}>No credit card. No lock-in. No middleman.</p>
      </div>
    </section>
  );
}
