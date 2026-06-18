import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import Script from "next/script";
import Image from "next/image";
import { ArrowRight, BookOpen, Layers, Globe, CreditCard, Search, Mail, Users, Shield } from "lucide-react";
import { prisma } from "@/lib/db";
import { MidnightHero } from "@/components/marketing/midnight-hero";
import { MidnightPricingSection } from "@/components/marketing/midnight-pricing-section";
import { MidnightTestimonialsSection } from "@/components/marketing/midnight-testimonials-section";
import { MidnightFaqSection } from "@/components/marketing/midnight-faq-section";
import { AuthorShowcaseSection } from "@/components/marketing/author-showcase-section";
import { NewsSubscribeForm } from "@/components/marketing/news-subscribe-form";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("home");
  return {
    title: "Author Website Builder for Independent Authors",
    description:
      "The author website builder built for indie authors. Add your book catalog, sell direct to readers, and capture newsletter signups — live in minutes. Free forever.",
    alternates: { canonical: "/" },
    openGraph: {
      type:        "website",
      title:       "Author Website Builder for Independent Authors | AuthorLoft",
      description: "The author website builder built for indie authors. Add your book catalog, sell direct to readers, and capture newsletter signups — live in minutes. Free forever.",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft — author website builder for independent authors" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Author Website Builder for Independent Authors | AuthorLoft",
      description: "The author website builder built for indie authors. Add your book catalog, sell direct to readers, and capture newsletter signups — live in minutes. Free forever.",
      images:      [ogImage],
    },
  };
}

// ── Static content ────────────────────────────────────────────────────────────

const HOW_IT_WORKS = [
  { number: "I",   title: "Create your account",  body: "Sign up free in seconds. No technical knowledge needed — just your name and email." },
  { number: "II",  title: "Add your books",        body: "Upload covers, write descriptions, link to retailers, and organise by series or genre." },
  { number: "III", title: "Share with readers",    body: "Your site goes live instantly on your own subdomain. Add a custom domain whenever you're ready." },
];

const FEATURES = [
  { icon: BookOpen,   title: "Full Book Catalog",        description: "List every title with cover art, series grouping, genre hierarchy, pricing, and buy links." },
  { icon: Layers,     title: "Series & Genre Hierarchy", description: "Organize books with unlimited nesting — Fiction → Thriller → Underwater Thriller — as deep as you need." },
  { icon: Globe,      title: "Your Own Domain",          description: "Get a subdomain instantly. Bring your own custom domain on Standard and Premium plans." },
  { icon: CreditCard, title: "Direct Sales",             description: "Sell ebooks and PDFs directly through your site. Secure Stripe checkout, instant download links." },
  { icon: Search,     title: "Search & Filtering",       description: "Readers can filter your catalog by genre, series, format, and price. Discovery made easy." },
  { icon: Mail,       title: "Newsletter Capture",       description: "Collect subscribers with category preferences. Export to Mailchimp, ConvertKit, or any tool." },
  { icon: Users,      title: "Flip Book Previews",       description: "Upload a URL link to your flipbook and give readers an interactive page-turn preview before they buy." },
  { icon: Shield,     title: "Built for Authors",        description: "No coding required. A purpose-built admin panel makes managing your catalog effortless." },
];

const GENRES = [
  { name: "Romance & Contemporary", accent: "for the heart",  description: "Build a beautiful home for your series, capture subscriber emails, and sell direct to your most devoted readers.", bg: "#1B2B47" },
  { name: "Thriller & Mystery",     accent: "for the chase",  description: "Dark, dramatic themes with templates designed to create tension — from the moment a reader lands on your page.", bg: "#0F1A2D" },
  { name: "Fantasy & Sci-Fi",       accent: "for the epic",   description: "Showcase complex world-building with series pages, lore sections, and a catalog that grows with your universe.", bg: "#27406B" },
  { name: "Children's & YA",        accent: "for the young",  description: "Bright, welcoming designs with flip-book previews so young readers can explore before they commit.", bg: "#3A5577" },
  { name: "Literary Fiction",       accent: "for the craft",  description: "Understated elegance, rich typography, and a space to share the craft and ideas behind your work.", bg: "#2A3A55" },
  { name: "Non-Fiction & Memoir",   accent: "for the voice",  description: "Lead with your credentials, build authority, and let your back catalog speak for your expertise.", bg: "#3A5577" },
  { name: "Dystopian",              accent: "for the rebel",  description: "Vivid world-building for dark, oppressive futures — showcase the series, lore, and societal stakes that pull readers in.", bg: "#0F1A2D" },
  { name: "Science & Technology",   accent: "for the curious", description: "Explain discoveries, breakthroughs, and complex ideas for general readers. Build authority with a catalog that speaks for your expertise.", bg: "#27406B" },
];

// ── Server data ───────────────────────────────────────────────────────────────

async function getHomepageResources() {
  return prisma.platformResource.findMany({
    where:   { isActive: true, showOnHomepage: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select:  { id: true, name: true, category: true, websiteUrl: true, logoUrl: true, initials: true, avatarColor: true, isPartner: true },
  }).catch(() => []);
}

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

const HOMEPAGE_FAQ_LIMIT = 10;
async function getFaqs() {
  const [items, total] = await Promise.all([
    prisma.homepageFaq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: HOMEPAGE_FAQ_LIMIT,
      select: { id: true, question: true, answer: true },
    }).catch(() => []),
    prisma.homepageFaq.count({ where: { isActive: true } }).catch(() => 0),
  ]);
  return { items, total };
}

async function getLatestBlogPosts() {
  return prisma.platformPost.findMany({
    where:   { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take:    6,
    select:  { id: true, title: true, slug: true, excerpt: true, category: true, readTimeMinutes: true, publishedAt: true },
  }).catch(() => []);
}

async function getShowcaseAuthors() {
  return prisma.author.findMany({
    where: {
      showInShowcase: true,
      isActive:       true,
      books:          { some: { isPublished: true } },
    },
    select: {
      id:              true,
      slug:            true,
      displayName:     true,
      name:            true,
      tagline:         true,
      profileImageUrl: true,
      customDomain:    true,
      showcaseStyle:   true,
      books: {
        where:   { isPublished: true, coverImageUrl: { not: null } },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take:    1,
        select:  { coverImageUrl: true, title: true },
      },
    },
    orderBy: { createdAt: "asc" },
    take: 8,
  }).catch(() => []);
}

// ── Page ──────────────────────────────────────────────────────────────────────

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AuthorLoft",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan available — no credit card required",
  },
  description: "Author website builder with book catalog, direct sales, newsletter capture, flip books, and more.",
  url: "https://www.authorloft.com",
};

export default async function MarketingPage() {
  const [plans, testimonials, faqData, blogPosts, showcaseAuthors, homepageResources] = await Promise.all([getActivePlans(), getTestimonials(), getFaqs(), getLatestBlogPosts(), getShowcaseAuthors(), getHomepageResources()]);
  const faqs = faqData.items;
  const faqTotal = faqData.total;

  const faqJsonLd = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  } : null;

  const ML = { midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD', pearl: '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A', copper: '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB' };

  return (
    <div style={{ minHeight: '100vh', background: ML.bone, fontFamily: 'inherit' }}>

      {/* ── Hero (static animated design) ─────────────────────────────────── */}
      <MidnightHero />

      {/* ── Author Showcase (moved up — first thing after hero) ───────────── */}
      <AuthorShowcaseSection
        authors={showcaseAuthors}
        platformDomain={process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'authorloft.com'}
      />

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section style={{ background: ML.bone, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· The marketplace tax ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(40px, 5vw, 76px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
              You wrote the book.{' '}<span style={{ fontStyle: 'italic', color: ML.copper }}>They keep the readers.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
            {[
              { num: '30%', label: 'Lost to platform fees',        body: 'Most marketplaces take a cut. AuthorLoft takes nothing on any plan.' },
              { num: '0',   label: 'Relationships you own',         body: 'When platforms close, your readers vanish. Here, your list is yours forever.' },
              { num: 'wks', label: 'To get started elsewhere',      body: 'Squarespace, Kajabi, Shopify — all demand weeks of setup. AuthorLoft: minutes.' },
            ].map((s, i) => (
              <div key={i} style={{ borderRadius: 14, padding: '40px 36px', background: [ML.ink, ML.midnight, '#3A5577'][i], color: ML.bone }}>
                <div style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 'clamp(60px, 8vw, 100px)', lineHeight: 0.85, letterSpacing: '-0.04em', color: ML.brass2, marginBottom: 12 }}>{s.num}</div>
                <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${ML.bone}cc`, marginBottom: 10 }}>{s.label}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.6, color: `${ML.bone}cc` }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ──────────────────────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: ML.bone, padding: '0 60px 120px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Simple setup ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
              Three steps to a <span style={{ fontStyle: 'italic', color: ML.copper }}>real bookshop</span> with your name on it.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} style={{ background: ML.pearl, borderRadius: 14, padding: '40px 36px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', border: `2px solid ${[ML.ink, ML.midnight, ML.copper][i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading, serif)', fontSize: 22, fontWeight: 400, color: [ML.ink, ML.midnight, ML.copper][i], marginBottom: 20 }}>{step.number}</div>
                <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 26, fontWeight: 400, color: ML.ink, margin: '0 0 12px' }}>{step.title}</h3>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.6, color: ML.slate, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section id="features" style={{ background: ML.mist, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass, marginBottom: 16 }}>· Features ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: '0 0 12px' }}>
              Tools made <span style={{ fontStyle: 'italic', color: ML.copper }}>specifically</span> for the way authors publish.
            </h2>
            <Link href="/features" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em' }}>
              See full feature listing →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: 12 }}>
            {FEATURES.map(({ icon: Icon, title, description }, i) => (
              <div key={i} style={{ background: ML.pearl, borderRadius: 14, padding: '28px 24px', border: `1px solid #DCDBD3` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: ML.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Icon style={{ width: 20, height: 20, color: ML.brass2 }} />
                </div>
                <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 18, fontWeight: 400, color: ML.ink, margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: ML.slate, margin: 0 }}>{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Genres ─────────────────────────────────────────────────────────── */}
      <section id="genres" style={{ background: ML.bone, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Who it&apos;s for ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
              Romance to literary, <span style={{ fontStyle: 'italic', color: ML.copper }}>thriller to memoir</span> — a home for every shelf.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 12 }}>
            {GENRES.map((g, i) => (
              <div key={i} style={{ background: g.bg, borderRadius: 14, padding: '32px 28px', color: ML.bone, border: `1px solid rgba(232,229,221,0.1)` }}>
                <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 24, fontWeight: 400, color: ML.bone, margin: '0 0 6px' }}>{g.name}</h3>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: ML.brass2, margin: '0 0 12px' }}>{g.accent}</p>
                <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: `${ML.bone}cc`, margin: 0 }}>{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials (dynamic) ─────────────────────────────────────────── */}
      <MidnightTestimonialsSection testimonials={testimonials} />

      {/* ── Blog (dynamic — only shown when posts exist) ───────────────────── */}
      {blogPosts.length > 0 && (
        <section style={{ background: ML.mist, padding: '120px 60px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            {/* Centred heading — light mist background, dark ink text */}
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· From the blog ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: '0 0 20px' }}>
                Guides for <span style={{ fontStyle: 'italic', color: ML.copper }}>independent authors</span>
              </h2>
              <Link href="/blog" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em' }}>
                Browse all posts →
              </Link>
            </div>
            {/* Cream cards on mist background — clear contrast, clean and warm */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card" style={{ background: ML.bone, borderRadius: 16, padding: '28px 24px', border: '1px solid #DCDBD3', textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s' }}>
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
          <style>{`
            .blog-card:hover {
              transform: translateY(-4px);
              box-shadow: 0 12px 32px rgba(27,43,71,0.12);
              border-color: ${ML.copper}66 !important;
            }
          `}</style>
        </section>
      )}

      {/* ── Pricing (dynamic) ──────────────────────────────────────────────── */}
      <section id="pricing" style={{ background: ML.bone, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· Pricing ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(36px, 4vw, 68px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
              Start free. <span style={{ fontStyle: 'italic', color: ML.copper }}>Pay only when you sell.</span>
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

      {/* ── FAQ (dynamic) ──────────────────────────────────────────────────── */}
      <MidnightFaqSection faqs={faqs} hasMore={faqTotal > faqs.length} />

      {/* ── Trusted Resources strip ────────────────────────────────────────── */}
      {homepageResources.length > 0 && (
        <section style={{ background: ML.ink, padding: '72px 60px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 12 }}>
                · Tools &amp; communities we recommend ·
              </p>
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
                  {/* Avatar */}
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

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: ML.midnight, padding: '80px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: `radial-gradient(circle, ${ML.brass2}22, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 20 }}>· Ready? ·</p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 400, lineHeight: 0.92, letterSpacing: '-0.03em', color: ML.bone, margin: '0 0 20px' }}>
            Put your name <span style={{ fontStyle: 'italic', color: ML.brass2 }}>on the door.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 17, lineHeight: 1.55, color: `${ML.bone}cc`, margin: '0 0 28px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
            Join AuthorLoft free today. Your readers are looking for you — make it easy for them to find you.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '15px 32px', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, background: ML.brass, color: ML.midnight, borderRadius: 999, textDecoration: 'none', boxShadow: '0 12px 24px -10px rgba(184,137,61,0.5)' }}>
              Start for Free <ArrowRight style={{ display: 'inline', width: 16, height: 16, marginLeft: 8 }} />
            </Link>
            <a href="https://demo.authorloft.com" target="_blank" rel="noopener noreferrer" style={{ padding: '15px 28px', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, background: 'transparent', color: ML.bone, border: `1px solid rgba(232,229,221,0.35)`, borderRadius: 999, textDecoration: 'none' }}>
              Browse live examples
            </a>
          </div>
          <p style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 14, color: `${ML.bone}44`, marginTop: 32 }}>
            — Closing the marketplace tab. Opening yours. —
          </p>
        </div>
      </section>

      {/* ── News subscribe ─────────────────────────────────────────────────── */}
      <section style={{ background: ML.bone, padding: '64px 24px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <NewsSubscribeForm source="home" variant="box" />
        </div>
      </section>

      {/* Footer is rendered once by the marketing layout (MarketingFooter) */}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}

      <Script
        async
        src="https://cdn.onsetio.com/v1/u.js?key=PK_BB2BHNF4XWY0C5QM26J842JFJ6TWTFMA"
        strategy="afterInteractive"
      />
    </div>
  );
}
