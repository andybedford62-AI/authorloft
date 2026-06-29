import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { MidnightPricingSection } from "@/components/marketing/midnight-pricing-section";
import { MidnightTestimonialsSection } from "@/components/marketing/midnight-testimonials-section";
import { MidnightFaqSection } from "@/components/marketing/midnight-faq-section";
import { AuthorShowcaseSection } from "@/components/marketing/author-showcase-section";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";
import { RebelHero } from "@/components/marketing/rebrand-hero";
import { AnimatedStatsBar, JourneySection, IntegrationStrip, AISpotlight, RebelCTA } from "@/components/marketing/animated-sections";
import { ReplacesStrip } from "@/components/marketing/replaces-strip";

export const revalidate = 60; // ISR interval (seconds)

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("home");
  return {
    title: "Your Books. Your Readers. Your Business. | AuthorLoft",
    description:
      "Website, email newsletter, direct book sales, reader analytics, media kits, and pre-orders — everything authors need to run their business, all in one place.",
    alternates: { canonical: "/" },
    openGraph: {
      type:        "website",
      title:       "Your Books. Your Readers. Your Business. | AuthorLoft",
      description: "Website, email newsletter, direct book sales, reader analytics, media kits, and pre-orders — everything authors need to run their business, all in one place.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft — your books, your readers, your business" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Your Books. Your Readers. Your Business. | AuthorLoft",
      description: "Website, email newsletter, direct book sales, reader analytics, media kits, and pre-orders — everything authors need to run their business, all in one place.",
      images:      [ogImage],
    },
  };
}

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

const GENRES = [
  { name: "Romance & Contemporary", accent: "for the heart",  description: "Sell your series direct, capture devoted reader emails, and build the fan base that comes back every launch.", bg: "#1B2B47" },
  { name: "Thriller & Mystery",     accent: "for the chase",  description: "Dark templates built for tension — from the moment a reader lands, they're already hooked.", bg: "#1B2B47" },
  { name: "Fantasy & Sci-Fi",       accent: "for the epic",   description: "Showcase your world with series pages, lore sections, and a catalog that grows with your universe.", bg: "#27406B" },
  { name: "Children's & YA",        accent: "for the young",  description: "Bright, welcoming designs with flip-book previews so young readers can explore before they buy.", bg: "#3A5577" },
  { name: "Literary Fiction",       accent: "for the craft",  description: "Understated elegance, rich typography, and space to share the ideas behind your work.", bg: "#2A3A55" },
  { name: "Non-Fiction & Memoir",   accent: "for the voice",  description: "Lead with credentials, build authority, and let your back catalog speak for your expertise.", bg: "#3A5577" },
  { name: "Dystopian",              accent: "for the rebel",  description: "Vivid world-building for dark futures — showcase the series, lore, and stakes that pull readers in.", bg: "#2A3A55" },
  { name: "Science & Technology",   accent: "for the curious", description: "Explain discoveries and complex ideas to general readers. Build authority with a catalog that grows.", bg: "#27406B" },
];

// ── Data fetching ─────────────────────────────────────────────────────────────

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

async function getLatestBlogPosts() {
  return prisma.platformPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: { id: true, title: true, slug: true, excerpt: true, category: true, readTimeMinutes: true, publishedAt: true },
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

async function getHomepageResources() {
  return prisma.platformResource.findMany({
    where: { isActive: true, showOnHomepage: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, category: true, websiteUrl: true, logoUrl: true, initials: true, avatarColor: true, isPartner: true },
  }).catch(() => []);
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
  description: "Four steps to owning your author business: go live with a professional site, sell books directly, grow your audience, and track what works.",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Go Live",
      text: "Launch your professional author site with an instant subdomain, genre-optimized templates, custom domain support, and branded hero banner.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Sell Direct",
      text: "Set up your book catalog with Stripe checkout to sell ebooks, audiobooks, and print books directly — keeping 100% of every sale.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Grow Your Audience",
      text: "Capture newsletter subscribers, offer reader magnets, generate media kit PDFs, and get discovered in the AuthorLoft Bookstore.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Track & Optimize",
      text: "Monitor sales and revenue, analyze traffic with PostHog analytics, use the AI content assistant, and run SEO audits to optimize your growth.",
    },
  ],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function HomepageRebrandPage() {
  await cookies();
  const [plans, testimonials, faqData, blogPosts, showcaseAuthors, homepageResources, session] = await Promise.all([
    getActivePlans(), getTestimonials(), getFaqs(), getLatestBlogPosts(), getShowcaseAuthors(), getHomepageResources(),
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
  const faqs      = faqData.items;
  const faqTotal  = faqData.total;

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
    <div style={{ minHeight: '100vh', background: ML.bone, fontFamily: 'inherit' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <RebelHero isAuthor={isAuthor} />

      {/* ── Animated stats bar ────────────────────────────────────────────── */}
      <AnimatedStatsBar />

      {/* ── Author showcase ───────────────────────────────────────────────── */}
      <AuthorShowcaseSection
        authors={showcaseAuthors}
        platformDomain={process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'authorloft.com'}
      />

      {/* ── 4-step Journey ────────────────────────────────────────────────── */}
      <JourneySection />

      {/* ── Replaces strip ──────────────────────────────────────────────── */}
      <ReplacesStrip />

      {/* ── Integration strip ─────────────────────────────────────────────── */}
      <IntegrationStrip />

      {/* ── Genre section ─────────────────────────────────────────────────── */}
      <section id="genres" style={{ background: ML.midnight, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Built for your genre, not a generic template ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: 0 }}>
              Your genre. <span style={{ fontStyle: 'italic', color: ML.brass2 }}>Your way.</span>
            </h2>
          </div>
          <style>{`.rb-genre-card { transition: transform 0.2s, box-shadow 0.2s; } .rb-genre-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.3); }`}</style>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 12 }}>
            {GENRES.map((g, i) => (
              <div key={i} className="rb-genre-card" style={{ background: g.bg, borderRadius: 16, padding: '32px 28px', color: ML.bone, border: '1px solid rgba(232,229,221,0.08)' }}>
                <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 22, fontWeight: 400, color: ML.bone, margin: '0 0 6px' }}>{g.name}</h3>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: ML.brass2, margin: '0 0 12px' }}>{g.accent}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.65, color: `${ML.bone}bb`, margin: 0 }}>{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Spotlight ──────────────────────────────────────────────────── */}
      <AISpotlight />

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <MidnightTestimonialsSection testimonials={testimonials} />

      {/* ── Blog preview ──────────────────────────────────────────────────── */}
      {blogPosts.length > 0 && (
        <section style={{ background: ML.bone, padding: '120px 60px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· From the blog ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: '0 0 16px' }}>
                Guides for <span style={{ fontStyle: 'italic', color: ML.copper }}>the serious author.</span>
              </h2>
              <Link href="/blog" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em' }}>
                Browse all posts →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="rb-blog-card" style={{ background: ML.pearl, borderRadius: 16, padding: '28px 24px', border: '1px solid #DCDBD3', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}>
                  <div>
                    {post.category && (
                      <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: ML.copper, margin: '0 0 12px' }}>{post.category}</p>
                    )}
                    <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 20, fontWeight: 400, color: ML.ink, margin: '0 0 12px', lineHeight: 1.3 }}>{post.title}</h3>
                    {post.excerpt && (
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.65, color: ML.slate, margin: '0 0 20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{post.excerpt}</p>
                    )}
                  </div>
                  <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.brass, margin: 0, letterSpacing: '0.06em' }}>Read more →</p>
                </Link>
              ))}
            </div>
          </div>
          <style>{`.rb-blog-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(27,43,71,0.12); border-color: ${ML.copper}55 !important; }`}</style>
        </section>
      )}

      {/* ── Pricing ───────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: ML.mist, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Pricing ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
              Start free. <span style={{ fontStyle: 'italic', color: ML.copper }}>Scale when you&apos;re ready.</span>
            </h2>
          </div>
          <MidnightPricingSection plans={plans} />
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/pricing" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em' }}>
              View full pricing comparison →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <MidnightFaqSection faqs={faqs} hasMore={faqTotal > faqs.length} />

      {/* ── Resources strip ───────────────────────────────────────────────── */}
      {homepageResources.length > 0 && (
        <section style={{ background: ML.ink, padding: '72px 60px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 12 }}>· Tools &amp; communities we recommend ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 400, lineHeight: 1, letterSpacing: '-0.02em', color: ML.bone, margin: '0 0 8px' }}>
                Trusted by the <span style={{ fontStyle: 'italic', color: ML.brass2 }}>indie author community</span>
              </h2>
              <Link href="/resources" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em' }}>
                See all resources →
              </Link>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              {homepageResources.map((r) => (
                <a key={r.id} href={r.websiteUrl} target="_blank" rel="noopener noreferrer"
                  className="resource-chip"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 22px 12px 14px', background: ML.pearl, border: '1px solid #DCDBD3', borderRadius: 999, textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: r.logoUrl ? ML.bone : r.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: r.logoUrl ? '1px solid #DCDBD3' : 'none' }}>
                    {r.logoUrl
                      ? <img src={r.logoUrl} alt={r.name} style={{ width: 36, height: 36, objectFit: 'contain', padding: 4 }} />
                      : <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: (r.initials?.length ?? 0) > 2 ? 10 : 13, fontWeight: 700, color: ML.bone }}>{r.initials || r.name[0]}</span>
                    }
                  </div>
                  <div>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: 15, color: ML.ink, whiteSpace: 'nowrap', display: 'block', lineHeight: 1.2 }}>{r.name}</span>
                    {r.category && <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ML.slate }}>{r.category}</span>}
                  </div>
                  {r.isPartner && (
                    <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: ML.brass, background: `${ML.brass}18`, border: `1px solid ${ML.brass}40`, borderRadius: 999, padding: '3px 8px' }}>Partner</span>
                  )}
                </a>
              ))}
            </div>
          </div>
          <style>{`.resource-chip:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }`}</style>
        </section>
      )}

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <RebelCTA />

      {/* ── News subscribe ────────────────────────────────────────────────── */}
      <section style={{ background: ML.bone, padding: '64px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <NewsSubscribeForm source="home" variant="box" />
        </div>
      </section>

    </div>
  );
}
