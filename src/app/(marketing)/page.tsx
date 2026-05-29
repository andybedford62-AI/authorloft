import type { Metadata } from "next";
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

export const revalidate = 300; // 5-minute cache — showcase/testimonials stay fresh without full SSR cost

export const metadata: Metadata = {
  title: "Author Website Builder for Independent Authors | AuthorLoft",
  description:
    "The author website builder built for indie authors. Add your book catalog, sell direct to readers, and capture newsletter signups — live in minutes. Free forever.",
  alternates: { canonical: "/" },
  openGraph: {
    type:        "website",
    title:       "Author Website Builder for Independent Authors | AuthorLoft",
    description: "The author website builder built for indie authors. Add your book catalog, sell direct to readers, and capture newsletter signups — live in minutes. Free forever.",
    images: [{ url: "/og-home.png", width: 1200, height: 630, alt: "AuthorLoft — author website builder for independent authors" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Author Website Builder for Independent Authors | AuthorLoft",
    description: "The author website builder built for indie authors. Add your book catalog, sell direct to readers, and capture newsletter signups — live in minutes. Free forever.",
    images:      ["/og-home.png"],
  },
};

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
  return prisma.homepageFaq.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, question: true, answer: true },
  }).catch(() => []);
}

async function getLatestBlogPosts() {
  return prisma.platformPost.findMany({
    where:   { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take:    3,
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
      id:             true,
      slug:           true,
      displayName:    true,
      name:           true,
      tagline:        true,
      profileImageUrl:true,
      customDomain:   true,
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
  const [plans, testimonials, faqs, blogPosts, showcaseAuthors] = await Promise.all([getActivePlans(), getTestimonials(), getFaqs(), getLatestBlogPosts(), getShowcaseAuthors()]);

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

      {/* ── Problem ────────────────────────────────────────────────────────── */}
      <section style={{ background: ML.bone, padding: '120px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 16 }}>· The marketplace tax ·</p>
            <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(40px, 5vw, 76px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
              You wrote the book.{' '}<span style={{ fontStyle: 'italic', color: ML.copper }}>They keep the readers.</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
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

      {/* ── Author Showcase (dynamic — only shown when authors have opted in) ─ */}
      <AuthorShowcaseSection
        authors={showcaseAuthors}
        platformDomain={process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'authorloft.com'}
      />

      {/* ── Blog (dynamic — only shown when posts exist) ───────────────────── */}
      {blogPosts.length > 0 && (
        <section style={{ background: ML.pearl, padding: '120px 60px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
              <div>
                <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.copper, marginBottom: 12 }}>· From the blog ·</p>
                <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 4vw, 60px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.ink, margin: 0 }}>
                  Guides for <span style={{ fontStyle: 'italic', color: ML.copper }}>independent authors</span>
                </h2>
              </div>
              <Link href="/blog" style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass, textDecoration: 'none', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
                All posts →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} style={{ background: ML.bone, borderRadius: 14, padding: '28px 24px', border: `1px solid #DCDBD3`, textDecoration: 'none', display: 'block' }}>
                  {post.category && (
                    <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: ML.copper, margin: '0 0 10px' }}>{post.category}</p>
                  )}
                  <h3 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 20, fontWeight: 400, color: ML.ink, margin: '0 0 10px', lineHeight: 1.25 }}>{post.title}</h3>
                  {post.excerpt && (
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: ML.slate, margin: '0 0 16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{post.excerpt}</p>
                  )}
                  <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: ML.brass, margin: 0, letterSpacing: '0.04em' }}>Read more →</p>
                </Link>
              ))}
            </div>
          </div>
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
      <MidnightFaqSection faqs={faqs} />

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: ML.midnight, padding: '160px 60px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, background: `radial-gradient(circle, ${ML.brass2}22, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 24 }}>· Ready? ·</p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(52px, 8vw, 120px)', fontWeight: 400, lineHeight: 0.88, letterSpacing: '-0.035em', color: ML.bone, margin: '0 0 24px' }}>
            Put your name <span style={{ fontStyle: 'italic', color: ML.brass2 }}>on the door.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 19, lineHeight: 1.55, color: `${ML.bone}cc`, margin: '0 0 36px', maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
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

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer style={{ background: ML.bone, borderTop: `1px solid #DCDBD3`, padding: '28px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Top row: logo + inline links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
            <Image src="/authorloft-logo-new.png" alt="AuthorLoft" width={120} height={34} style={{ height: 28, width: 'auto' }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 0' }}>
              {([
                ['Features', '/features'],
                ['Pricing',  '/pricing'],
                ['Blog',     '/blog'],
                ['Contact',  '/contact'],
                ['Privacy',  '/privacy'],
                ['Terms',    '/terms'],
                ['GDPR',     '/gdpr'],
                ['Demo',     'https://demo.authorloft.com'],
              ] as [string, string][]).map(([label, href], i, arr) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <Link
                    href={href}
                    style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: ML.slate, textDecoration: 'none', padding: '0 10px' }}
                    {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >{label}</Link>
                  {i < arr.length - 1 && <span style={{ color: '#DCDBD3' }}>·</span>}
                </span>
              ))}
            </div>
          </div>
          {/* Bottom row: copyright + tagline */}
          <div style={{ borderTop: `1px solid #DCDBD3`, paddingTop: 14, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 12, color: `${ML.slate}88`, margin: 0 }}>
              © {new Date().getFullYear()} AuthorLoft. Built for authors, by someone who actually loves books.
            </p>
            <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 12, color: `${ML.slate}55`, margin: 0 }}>
              —— your name, your shelf ——
            </p>
          </div>
        </div>
      </footer>

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
