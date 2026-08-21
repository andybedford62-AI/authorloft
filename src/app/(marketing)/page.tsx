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
import { getDemoSiteUrl } from "@/lib/demo-site";
import { sanitize } from "@/lib/sanitize";
import { VAULT } from "@/components/marketing/vault-theme";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("home");
  return {
    title: "Your Books. Your Readers. Your Business. | AuthorLoft",
    description:
      "AuthorLoft gives authors their own storefront, their own email list, and 100% of every sale. Website, direct book sales, newsletter, reader analytics, media kits, and pre-orders: everything authors need to run their business, all in one place. Free to start.",
    alternates: { canonical: "/" },
    openGraph: {
      type:        "website",
      title:       "Your Books. Your Readers. Your Business. | AuthorLoft",
      description: "Own your author business with AuthorLoft. Your own storefront, your own reader list, 100% of every sale. Direct book sales, newsletter campaigns, reader analytics, media kits, and pre-orders, all in one platform, free to start.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft: your books, your readers, your business" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Your Books. Your Readers. Your Business. | AuthorLoft",
      description: "Own your author business with AuthorLoft. Your own storefront, your own reader list, 100% of every sale. Direct book sales, newsletter campaigns, reader analytics, media kits, and pre-orders, all in one platform, free to start.",
      images:      [ogImage],
    },
  };
}

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
  name: "AuthorLoft: Your Books. Your Readers. Your Business.",
  url: PLATFORM_URL,
  description:
    "Own your author business with AuthorLoft. Direct sales, reader analytics, newsletter capture, and every tool to grow, all on one platform, free to start.",
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
      description: "Free to start, no credit card required",
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
      text: "Sell eBooks, audiobooks, and print direct to readers via Stripe. There's no platform fee, so every dollar from every sale goes straight to you.",
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
  const [plans, testimonials, showcaseAuthors, faqData, session, heroSettings, foundingOffer, demoSiteUrl] = await Promise.all([
    getActivePlans(), getTestimonials(), getShowcaseAuthors(), getFaqs(),
    getServerSession(authOptions),
    prisma.platformSettings.findUnique({
      where: { id: "singleton" },
      select: { heroHeadlineLine1: true, heroHeadlineLine2: true, heroSubheadline: true },
    }).catch(() => null),
    getFoundingOfferCopy().catch(() => null),
    getDemoSiteUrl(),
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
    <div style={{ minHeight: '100vh', background: VAULT.bg, color: VAULT.ink, fontFamily: VAULT.fontBody, fontSize: '1rem', lineHeight: 1.6, WebkitFontSmoothing: 'antialiased' }}>

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
        demoUrl={demoSiteUrl}
      />

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <hr style={{ border: 'none', borderTop: `1px solid ${VAULT.line}` }} />

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
      <section style={{ background: VAULT.surf, borderTop: `1px solid ${VAULT.line}`, borderBottom: `1px solid ${VAULT.line}`, padding: '64px 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 14 }}>Pricing</p>
          <h2 style={{ fontFamily: VAULT.fontDisplay, fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: VAULT.ink, marginBottom: 12, letterSpacing: '-0.01em' }}>
            Start for free, and scale up when you&apos;re ready.
          </h2>
          <p style={{ color: VAULT.mute, fontSize: '1.0625rem', marginBottom: 32 }}>No credit card required. Upgrade when you&apos;re ready for direct sales or a custom domain.</p>
          {foundingOffer && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20, textAlign: 'left',
              maxWidth: 620, margin: '0 0 40px', padding: '20px 24px',
              borderRadius: 16, border: `1.5px solid ${VAULT.gold}`, background: VAULT.surf2,
              boxShadow: `0 8px 28px ${VAULT.bg}99`,
            }}>
              <div style={{
                flexShrink: 0, width: 72, height: 72, borderRadius: '50%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: `linear-gradient(135deg, ${VAULT.goldLight}, ${VAULT.gold})`, color: VAULT.bg,
              }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{foundingOffer.percentOff}%</span>
                <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>off</span>
              </div>
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: VAULT.gold, margin: '0 0 4px' }}>🎉 Founding Member Offer</p>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: VAULT.ink, margin: 0 }}>{foundingOffer.headline}</p>
                <p style={{ fontSize: '0.8rem', color: VAULT.mute, margin: '4px 0 0' }}>{foundingOffer.subtext}</p>
              </div>
            </div>
          )}
          <MidnightPricingSection plans={plans} />
          <p style={{ fontSize: '0.8125rem', color: VAULT.mute, marginTop: 24 }}>
            Stripe fees apply to direct sales &nbsp;&middot;&nbsp; 30-day money-back guarantee &nbsp;&middot;&nbsp; cancel anytime &nbsp;&middot;&nbsp;
            <Link href="/pricing" style={{ color: VAULT.mute, textDecoration: 'underline' }}>Full plan comparison →</Link>
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
  const SERIF = VAULT.fontDisplay;
  const rows = [
    {
      label: 'Who gets paid',
      old: 'Retailers keep 30 to 70% of every sale. You get a payout and a mystery: no idea who bought, or why.',
      newVal: 'You keep 100% of what you earn.',
      newSuffix: " The only other cost is Stripe's standard card fee, the same one every online business pays.",
    },
    {
      label: 'Who owns your readers',
      old: "Their platform, their rules. Followers can vanish overnight if an algorithm changes, an account gets banned, or the app just dies.",
      newVal: 'Your email list belongs to you, not a platform.',
      newSuffix: ' Export it anytime and take it anywhere; no one can rent it back to you.',
    },
    {
      label: 'How many tabs you need open',
      old: "A website here, an email tool there, checkout somewhere else: five logins that don't talk to each other.",
      newVal: 'One dashboard',
      newSuffix: ' runs your site, your store, your list, and your numbers, all for one price.',
    },
  ];
  return (
    <section style={{ background: VAULT.bg, borderTop: `1px solid ${VAULT.line}`, borderBottom: `1px solid ${VAULT.line}`, padding: '64px 0' }}>
      <style>{`
        .rdh-cmp-table { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 2px solid ${VAULT.line}; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.35); }
        @media (max-width: 820px) {
          .rdh-cmp-table { grid-template-columns: 1fr; }
          .rdh-cmp-old-head, .rdh-cmp-old-cell { display: none; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ marginBottom: 32, maxWidth: 640 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: VAULT.gold, margin: '0 0 14px' }}>What actually changes</p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: VAULT.ink, letterSpacing: '-0.01em', margin: '0 0 16px' }}>
            Here&apos;s exactly what you get back.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: VAULT.mute, maxWidth: 560, margin: 0, lineHeight: 1.72 }}>
            Here's what's actually different from the moment you switch, without the vague promises.
          </p>
        </div>
        <div className="rdh-cmp-table">
          {/* Column headers */}
          <div className="rdh-cmp-old-head" style={{ padding: '18px 32px', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: VAULT.bg, textAlign: 'left', color: VAULT.mute, borderBottom: `2px solid ${VAULT.line}` }}>Right now</div>
          <div style={{ padding: '18px 32px', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', background: VAULT.surf, textAlign: 'left', color: VAULT.gold, borderBottom: `2px solid ${VAULT.line}`, borderLeft: `2px solid ${VAULT.line}` }}>With AuthorLoft</div>

          {rows.map((row, i) => (
            <div key={row.label} style={{ display: 'contents' }}>
              {/* Old way cell */}
              <div className="rdh-cmp-old-cell" style={{ background: VAULT.bg, padding: '32px 36px', borderBottom: i < rows.length - 1 ? `1px solid ${VAULT.line}` : 'none' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: VAULT.mute, marginBottom: 10, fontWeight: 700 }}>{row.label}</div>
                <div style={{ fontFamily: SERIF, fontSize: '1.2rem', lineHeight: 1.45, color: VAULT.mute, textDecoration: 'line-through', textDecorationColor: 'rgba(255,80,80,0.5)', fontStyle: 'italic' }}>{row.old}</div>
              </div>
              {/* New way cell */}
              <div style={{ background: VAULT.surf2, padding: '32px 36px', borderLeft: `2px solid ${VAULT.line}`, borderBottom: i < rows.length - 1 ? `1px solid ${VAULT.line}` : 'none' }}>
                <div style={{ fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: VAULT.mute, marginBottom: 10, fontWeight: 700 }}>{row.label}</div>
                <div style={{ fontFamily: SERIF, fontSize: '1.25rem', lineHeight: 1.45, color: VAULT.ink }}>
                  <strong style={{ color: VAULT.gold, fontWeight: 700 }}>{row.newVal}</strong>{row.newSuffix}
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
  const SERIF = VAULT.fontDisplay;

  function BrowserFrame({
    src, alt, aspectRatio, chrome = true,
  }: { src: string; alt: string; aspectRatio: string; chrome?: boolean }) {
    return (
      <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${VAULT.line}`, boxShadow: '0 20px 50px -20px rgba(0,0,0,0.55)', background: VAULT.bgDeep }}>
        {chrome && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: VAULT.bg, borderBottom: `1px solid ${VAULT.line}` }}>
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
    <section style={{ background: VAULT.bgDeep, borderTop: `1px solid ${VAULT.line}`, borderBottom: `1px solid ${VAULT.line}`, padding: '64px 0' }}>
      <style>{`
        .rdh-preview-grid { display: grid; grid-template-columns: 1.15fr 1fr; gap: 28px; align-items: start; }
        .rdh-preview-stack { display: grid; gap: 24px; }
        @media (max-width: 900px) {
          .rdh-preview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ marginBottom: 32, maxWidth: 640 }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: VAULT.gold, margin: '0 0 14px' }}>See it for yourself</p>
          <h2 style={{ fontFamily: SERIF, fontSize: 'clamp(2.1rem, 4vw, 3.4rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: VAULT.ink, letterSpacing: '-0.01em', margin: '0 0 16px' }}>
            See the actual product.
          </h2>
          <p style={{ fontSize: '1.0625rem', color: VAULT.mute, maxWidth: 540, margin: 0, lineHeight: 1.72 }}>
            These are real screenshots from a live AuthorLoft site. Nothing here is a mockup or a stock photo.
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
            <p style={{ marginTop: 14, fontSize: '0.9rem', color: VAULT.mute, lineHeight: 1.6 }}>
              This is an author&apos;s actual AuthorLoft site, <strong style={{ color: VAULT.ink }}>live right now</strong>, not a template preview.
            </p>
          </div>
          <div className="rdh-preview-stack">
            <div>
              <BrowserFrame
                src="https://fweccazwdlrdbcrdbbev.supabase.co/storage/v1/object/public/book-covers/blog/cover-1786845582294.png"
                alt="The AuthorLoft dashboard"
                aspectRatio="4 / 3.4"
              />
              <p style={{ marginTop: 14, fontSize: '0.9rem', color: VAULT.mute, lineHeight: 1.6 }}>
                <strong style={{ color: VAULT.ink }}>Your dashboard</strong> shows books, subscribers, and sales on one screen instead of five different tabs.
              </p>
            </div>
            <div>
              <BrowserFrame
                src="https://fweccazwdlrdbcrdbbev.supabase.co/storage/v1/object/public/book-covers/blog/cover-1786845608667.png"
                alt="AuthorLoft theme picker with genre palettes"
                aspectRatio="16 / 10.5"
              />
              <p style={{ marginTop: 14, fontSize: '0.9rem', color: VAULT.mute, lineHeight: 1.6 }}>
                <strong style={{ color: VAULT.ink }}>Pick a theme built for your genre</strong>, and change it anytime without a developer.
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
    <section style={{ background: VAULT.surf, padding: '72px 28px' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 24 }}>
          From the founder
        </p>
        <div
          style={{ fontFamily: VAULT.fontDisplay, fontStyle: 'italic', fontSize: 'clamp(21px, 2.4vw, 28px)', lineHeight: 1.5, color: VAULT.ink, margin: '0 0 32px' }}
          dangerouslySetInnerHTML={{ __html: `“${sanitize(testimonial.quote)}”` }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: VAULT.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', color: VAULT.bg, fontWeight: 700, fontSize: 17, flexShrink: 0 }}>
            {testimonial.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, margin: 0, color: VAULT.ink }}>{testimonial.authorName}</p>
            {testimonial.authorRole && <p style={{ fontSize: 13, margin: 0, color: VAULT.mute }}>{testimonial.authorRole}</p>}
          </div>
        </div>
        {siteUrl && (
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 28, fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase', color: VAULT.gold, textDecoration: 'none' }}>
            See my site →
          </a>
        )}
      </div>
    </section>
  );
}

function NewsletterMidSection() {
  return (
    <section style={{ background: '#f5f0e8', borderTop: '1px solid #d8ceb8', borderBottom: '1px solid #d8ceb8', padding: '64px 0' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: VAULT.goldMuted, marginBottom: 14 }}>The Indie Author Playbook</p>
        <h2 style={{ fontFamily: VAULT.fontDisplay, fontSize: 'clamp(1.85rem, 3vw, 2.8rem)', fontWeight: 600, lineHeight: 1.12, fontStyle: 'italic', color: '#1a1008', marginBottom: 14, letterSpacing: '-0.01em' }}>
          Grow your readership without losing the readers you already have.
        </h2>
        <p style={{ color: '#5a4a38', fontSize: '1.0625rem', marginBottom: 36, maxWidth: 480, lineHeight: 1.68 }}>
          One practical tactic a week on direct sales, email, and reader growth for independent authors. Unsubscribe anytime.
        </p>
        <div style={{ maxWidth: 460 }}>
          <NewsSubscribeForm source="home" variant="box" />
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section style={{ padding: '80px 0', position: 'relative', overflow: 'hidden', background: VAULT.bg }}>
      {/* Glow */}
      <div style={{ position: 'absolute', top: -80, left: '6%', width: 640, height: 380, background: 'radial-gradient(ellipse at center, rgba(214,169,74,0.1) 0%, transparent 68%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 28px', position: 'relative' }}>
        <h2 style={{ fontFamily: VAULT.fontDisplay, fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)', fontWeight: 600, lineHeight: 1.08, fontStyle: 'italic', color: VAULT.ink, marginBottom: 18, letterSpacing: '-0.01em' }}>
          Your audience<br />is waiting.
        </h2>
        <p style={{ fontSize: '1.125rem', color: VAULT.mute, marginBottom: 32, maxWidth: 460, lineHeight: 1.7 }}>
          Every sale through a middleman is a reader you&apos;ll never reach again. Start free today and keep what you build.
        </p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
          <Link href="/register" className="rdh-btn-primary" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: VAULT.radius, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, background: VAULT.gold, color: VAULT.bg, padding: '15px 32px' }}>
            Start your business, free →
          </Link>
          <Link href="/bookstore" className="rdh-btn-ghost" style={{ display: 'inline-block', textDecoration: 'none', borderRadius: VAULT.radius, fontWeight: 600, fontSize: '0.9375rem', lineHeight: 1, color: VAULT.ink, border: `1px solid ${VAULT.line}`, padding: '14px 28px', background: 'transparent' }}>
            Browse the bookstore
          </Link>
        </div>
        <p style={{ fontSize: '0.8125rem', color: VAULT.mute }}>No credit card. No lock-in. No middleman.</p>
      </div>
    </section>
  );
}
