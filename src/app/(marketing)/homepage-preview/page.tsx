import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { RedesignHero } from "@/components/marketing/redesign-hero";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Homepage Preview | AuthorLoft",
    robots: { index: false, follow: false },
  };
}

// ── Data fetching ────────────────────────────────────────────────────────────

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
    take: 3,
  }).catch(() => []);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(cents: number) {
  if (cents === 0) return '$0';
  const d = cents / 100;
  return d % 1 === 0 ? `$${d.toFixed(0)}` : `$${d.toFixed(2)}`;
}

function buildFeatures(plan: any): string[] {
  if (plan.featuresJson) {
    try {
      const parsed = JSON.parse(plan.featuresJson);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch { /* fall through */ }
  }
  const f: string[] = [];
  f.push(plan.maxBooks === null ? 'Unlimited books' : `Up to ${plan.maxBooks} book${plan.maxBooks === 1 ? '' : 's'}`);
  if (plan.customDomain) f.push('Custom domain');
  if (plan.salesEnabled) f.push('Direct digital sales (Stripe)');
  if (plan.newsletter) f.push('Newsletter campaigns');
  if (plan.analyticsEnabled) f.push('Reader analytics');
  if ((plan.flipBooksLimit ?? 0) > 0) f.push('Flipbook & audio support');
  if (plan.mediaKitEnabled) f.push('Media kit');
  return f;
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

  const SERIF = "var(--font-heading, 'Playfair Display', Georgia, serif)";

  const demoAuthors = showcaseAuthors.map((a) => {
    const name = a.displayName || a.name;
    const domain = a.customDomain || `${a.slug}.authorloft.com`;
    const url = a.customDomain ? `https://${a.customDomain}` : `https://${a.slug}.authorloft.com`;
    return { name, genre: a.tagline || '', url };
  });

  return (
    <div className="rdh-page">
      <style>{`
        /* ── Base reset & tokens ────────────────────── */
        .rdh-page { background: #0d1520; color: #e8e8e0; font-family: 'Inter', var(--font-body, sans-serif); font-size: 15px; line-height: 1.6; -webkit-font-smoothing: antialiased; min-height: 100vh; }
        .rdh-page h1, .rdh-page h2, .rdh-page h3 { font-family: ${SERIF}; font-weight: 700; line-height: 1.12; margin: 0; }
        .rdh-page p { margin: 0; }
        .rdh-page ul { list-style: none; padding: 0; margin: 0; }
        .rdh-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: #c9a84c; margin-bottom: 12px; }
        .rdh-container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        .rdh-narrow { max-width: 620px; margin: 0 auto; padding: 0 24px; }
        .rdh-btn-p { display: inline-block; text-decoration: none; background: #c9a84c; color: #000; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; font-family: 'Inter', sans-serif; transition: background .18s; }
        .rdh-btn-p:hover { background: #d4b866; }
        .rdh-btn-g { display: inline-block; text-decoration: none; color: #e8e8e0; border: 1px solid #2a4268; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; background: transparent; font-family: 'Inter', sans-serif; transition: border-color .18s, background .18s; }
        .rdh-btn-g:hover { border-color: #9a9080; background: rgba(255,255,255,0.04); }

        /* ── Problem Strip ─────────────────────────── */
        .rdh-prob { background: #1c2e48; border-top: 1px solid #2a4268; border-bottom: 1px solid #2a4268; padding: 44px 0; }
        .rdh-prob-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }
        .rdh-prob-item { text-align: center; padding: 20px 24px; border-right: 1px solid #2a4268; }
        .rdh-prob-item:last-child { border-right: none; }
        .rdh-prob-icon { font-size: 1.5rem; margin-bottom: 10px; display: block; }
        .rdh-prob-item h3 { font-size: 1.1rem; margin-bottom: 6px; color: #e8e8e0; }
        .rdh-prob-item p { font-size: 13px; color: #9a9080; line-height: 1.6; }

        /* ── What Is ──────────────────────────────── */
        .rdh-what { padding: 72px 0; text-align: center; background: #0d1520; }
        .rdh-what h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-bottom: 12px; font-style: italic; }
        .rdh-what-sub { font-size: 15px; color: #9a9080; max-width: 500px; margin: 0 auto 44px; line-height: 1.7; }
        .rdh-pillars { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #2a4268; border-radius: 12px; overflow: hidden; text-align: left; }
        .rdh-pillar { background: #1c2e48; padding: 32px 26px; }
        .rdh-pnum { font-family: ${SERIF}; font-size: 3rem; font-weight: 700; color: rgba(201,168,76,.18); line-height: 1; margin-bottom: 14px; }
        .rdh-pillar h3 { font-size: 1.2rem; margin-bottom: 8px; }
        .rdh-pillar p { color: #9a9080; font-size: 13px; line-height: 1.6; }

        /* ── Comparison ───────────────────────────── */
        .rdh-cmp { background: linear-gradient(180deg, #0d1520 0%, #111c2e 50%, #0d1520 100%); border-top: 1px solid #2a4268; border-bottom: 1px solid #2a4268; padding: 72px 0; }
        .rdh-cmp-head { text-align: center; margin-bottom: 36px; }
        .rdh-cmp-head h2 { font-size: clamp(1.7rem, 2.8vw, 2.4rem); font-style: italic; }
        .rdh-ctable { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; background: #2a4268; border-radius: 12px; overflow: hidden; }
        .rdh-ch { padding: 16px 28px; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; background: rgba(0,10,25,.5); text-align: center; }
        .rdh-ch-old { color: #9a9080; }
        .rdh-ch-new { color: #c9a84c; }
        .rdh-cc { padding: 24px 28px; }
        .rdh-cc-old { background: #111d2e; }
        .rdh-cc-new { background: #162540; }
        .rdh-clabel { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: #9a9080; margin-bottom: 7px; font-weight: 600; }
        .rdh-cval { font-family: ${SERIF}; font-size: 1.25rem; line-height: 1.35; }
        .rdh-cc-old .rdh-cval { color: #4a5a6a; text-decoration: line-through; text-decoration-color: rgba(255,80,80,.4); }
        .rdh-cc-new .rdh-cval { color: #e8e8e0; }

        /* ── Demo ─────────────────────────────────── */
        .rdh-demo { padding: 72px 0; text-align: center; background: #0d1520; }
        .rdh-demo h2 { font-size: clamp(1.8rem, 3.5vw, 2.8rem); margin-bottom: 8px; font-style: italic; }
        .rdh-demo-sub { font-size: 15px; color: #9a9080; margin-bottom: 40px; }
        .rdh-demo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 36px; }
        .rdh-dcard { background: #1c2e48; border: 1px solid #2a4268; border-radius: 10px; overflow: hidden; text-align: left; text-decoration: none; display: block; transition: border-color .2s, transform .2s; }
        .rdh-dcard:hover { border-color: #c9a84c; transform: translateY(-3px); }
        .rdh-dimg { height: 120px; background: linear-gradient(135deg, #1a2a42 0%, #0f1c30 100%); display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; font-size: 1.4rem; font-style: italic; color: #c9a84c; border-bottom: 1px solid #2a4268; }
        .rdh-dbody { padding: 16px 18px; }
        .rdh-dname { font-family: ${SERIF}; font-size: 1.05rem; font-weight: 600; color: #e8e8e0; margin-bottom: 3px; }
        .rdh-dgenre { font-size: 12px; color: #9a9080; margin-bottom: 10px; }
        .rdh-dlink { font-size: 12px; color: #c9a84c; font-weight: 600; }

        /* ── Testimonials ─────────────────────────── */
        .rdh-testi { background: #130f0a; border-top: 1px solid #3a2a14; border-bottom: 1px solid #3a2a14; padding: 72px 0; text-align: center; }
        .rdh-testi h2 { font-size: clamp(1.7rem, 2.8vw, 2.4rem); font-style: italic; margin-bottom: 36px; color: #f0e8d8; }
        .rdh-tgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .rdh-tcard { background: #1e1408; border: 1px solid #3a2a14; border-radius: 10px; padding: 24px; text-align: left; }
        .rdh-tquote { font-family: ${SERIF}; font-size: .975rem; line-height: 1.65; color: #e8dcc8; margin-bottom: 18px; font-style: italic; }
        .rdh-tquote::before { content: '\\201C'; color: #c9a84c; margin-right: 2px; }
        .rdh-tquote::after { content: '\\201D'; color: #c9a84c; margin-left: 2px; }
        .rdh-tauthor { display: flex; align-items: center; gap: 10px; }
        .rdh-tavatar { width: 36px; height: 36px; border-radius: 50%; background: #2a1e0c; border: 1px solid #5a4020; display: flex; align-items: center; justify-content: center; font-family: ${SERIF}; font-weight: 700; font-size: 13px; color: #c9a84c; flex-shrink: 0; }
        .rdh-tname { font-weight: 600; font-size: 13px; color: #f0e8d8; }
        .rdh-trole { font-size: 12px; color: #9a8060; }

        /* ── Newsletter ───────────────────────────── */
        .rdh-nl { background: #f5f0e8; border-top: 1px solid #d8ceb8; border-bottom: 1px solid #d8ceb8; padding: 72px 0; text-align: center; }
        .rdh-nl .rdh-eyebrow { color: #9a7030; }
        .rdh-nl h2 { font-size: clamp(1.7rem, 2.8vw, 2.4rem); font-style: italic; margin-bottom: 12px; color: #1a1008; }
        .rdh-nl-sub { color: #5a4a38; font-size: 15px; margin-bottom: 30px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.68; }
        .rdh-nl-form { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; max-width: 420px; margin: 0 auto 12px; }
        .rdh-nl-input { flex: 1; min-width: 200px; padding: 12px 16px; background: #fff; border: 1px solid #c8b898; border-radius: 8px; color: #1a1008; font-size: 14px; outline: none; font-family: 'Inter', sans-serif; }
        .rdh-nl-input:focus { border-color: #c9a84c; }
        .rdh-nl-input::placeholder { color: #9a8868; }
        .rdh-nl-submit { background: #1a1008; color: #f5f0e8; border: none; padding: 12px 22px; border-radius: 8px; font-weight: 600; font-size: 14px; cursor: pointer; font-family: 'Inter', sans-serif; transition: background .18s; }
        .rdh-nl-submit:hover { background: #2e200e; }
        .rdh-nl-fine { font-size: 12px; color: #7a6848; }

        /* ── Pricing ──────────────────────────────── */
        .rdh-pricing { background: #1c2e48; border-top: 1px solid #2a4268; border-bottom: 1px solid #2a4268; padding: 72px 0; text-align: center; }
        .rdh-pricing h2 { font-size: clamp(1.7rem, 2.8vw, 2.4rem); font-style: italic; margin-bottom: 10px; }
        .rdh-pricing-sub { color: #9a9080; font-size: 15px; margin-bottom: 40px; }
        .rdh-pgrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; background: #2a4268; border-radius: 12px; overflow: hidden; margin-bottom: 20px; }
        .rdh-pc { background: #0d1520; padding: 30px 24px; text-align: left; position: relative; }
        .rdh-pc-feat { background: #1e3358; border-top: 2px solid #c9a84c; }
        .rdh-pbadge { position: absolute; top: 18px; right: 18px; background: #c9a84c; color: #000; font-size: 10px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 3px 9px; border-radius: 100px; }
        .rdh-ptier { font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: #9a9080; font-weight: 600; margin-bottom: 8px; }
        .rdh-pprice { font-family: ${SERIF}; font-size: 2.2rem; font-weight: 700; color: #e8e8e0; line-height: 1; margin-bottom: 5px; }
        .rdh-pprice span { font-size: .9rem; color: #9a9080; font-weight: 400; font-family: 'Inter', sans-serif; }
        .rdh-pdesc { font-size: 13px; color: #9a9080; margin-bottom: 18px; line-height: 1.5; }
        .rdh-pfeats li { font-size: 13px; color: #9a9080; padding: 3px 0; display: flex; align-items: flex-start; gap: 7px; }
        .rdh-pfeats li::before { content: '·'; color: #c9a84c; font-weight: 700; flex-shrink: 0; }
        .rdh-pfeats { margin-bottom: 22px; }
        .rdh-pbtn { display: block; text-align: center; text-decoration: none; padding: 10px; border-radius: 7px; font-weight: 600; font-size: 13px; font-family: 'Inter', sans-serif; transition: all .18s; }
        .rdh-pbtn-g { border: 1px solid #2a4268; color: #e8e8e0; background: transparent; }
        .rdh-pbtn-g:hover { border-color: #9a9080; background: rgba(255,255,255,0.04); }
        .rdh-pbtn-p { background: #c9a84c; color: #000; border: none; }
        .rdh-pbtn-p:hover { background: #d4b866; }
        .rdh-pricing-note { font-size: 12px; color: #9a9080; }
        .rdh-pricing-note a { color: #9a9080; text-decoration: underline; }

        /* ── Footer CTA ───────────────────────────── */
        .rdh-fcta { padding: 88px 0; text-align: center; background: #0d1520; }
        .rdh-fcta h2 { font-size: clamp(2rem, 4.5vw, 3.6rem); margin-bottom: 14px; font-style: italic; line-height: 1.1; }
        .rdh-fcta p { font-size: 15px; color: #9a9080; margin-bottom: 36px; max-width: 420px; margin-left: auto; margin-right: auto; line-height: 1.7; }
        .rdh-fcta-actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 18px; }
        .rdh-fcta-note { font-size: 12px; color: #9a9080; }

        /* ── Responsive ───────────────────────────── */
        @media (max-width: 820px) {
          .rdh-prob-grid, .rdh-pillars, .rdh-demo-grid, .rdh-tgrid, .rdh-pgrid { grid-template-columns: 1fr; }
          .rdh-prob-item { border-right: none; border-bottom: 1px solid #2a4268; }
          .rdh-prob-item:last-child { border-bottom: none; }
          .rdh-ctable { grid-template-columns: 1fr; }
          .rdh-ch-old, .rdh-cc-old { display: none; }
        }
        @media (max-width: 640px) {
          .rdh-page section, .rdh-prob, .rdh-what, .rdh-cmp, .rdh-demo, .rdh-testi, .rdh-nl, .rdh-pricing, .rdh-fcta { padding-left: 0; padding-right: 0; }
        }
      `}</style>

      {/* Preview banner */}
      <div style={{ background: '#b91c1c', color: '#fff', textAlign: 'center', padding: '8px 16px', fontSize: 13, fontWeight: 600, position: 'relative', zIndex: 200 }}>
        PREVIEW — This is a draft homepage redesign. <Link href="/" style={{ color: '#fca5a5', textDecoration: 'underline', marginLeft: 8 }}>View current homepage →</Link>
      </div>

      {/* ── Hero (with nav) ───────────────────────── */}
      <RedesignHero isAuthor={isAuthor} />

      {/* ── Problem Strip ─────────────────────────── */}
      <div className="rdh-prob">
        <div className="rdh-container">
          <div className="rdh-prob-grid">
            <div className="rdh-prob-item">
              <span className="rdh-prob-icon">📦</span>
              <h3>Retailers own your buyers</h3>
              <p>Amazon keeps the customer relationship. You ship books and wait for royalty statements.</p>
            </div>
            <div className="rdh-prob-item">
              <span className="rdh-prob-icon">✉️</span>
              <h3>Your list isn&apos;t yours</h3>
              <p>Build thousands of followers on a platform you don&apos;t control — they can be gone overnight.</p>
            </div>
            <div className="rdh-prob-item">
              <span className="rdh-prob-icon">🧩</span>
              <h3>Five tools that don&apos;t talk</h3>
              <p>Website. Email. Storefront. Analytics. Payments. You&apos;re paying for five things and gluing them yourself.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── What Is AuthorLoft ────────────────────── */}
      <section className="rdh-what">
        <div className="rdh-container">
          <p className="rdh-eyebrow">The solution</p>
          <h2>One platform. Everything you own.</h2>
          <p className="rdh-what-sub">AuthorLoft replaces your website, email service, payment processor, and analytics — and puts you in control of every reader relationship you earn.</p>
          <div className="rdh-pillars">
            <div className="rdh-pillar"><div className="rdh-pnum">01</div><h3>Your storefront</h3><p>A beautiful author website with a built-in bookstore, live in 15 minutes. Your domain, your design.</p></div>
            <div className="rdh-pillar"><div className="rdh-pnum">02</div><h3>Your sales</h3><p>Sell eBooks, audio, and print direct via Stripe. Zero platform fees — every dollar goes to you.</p></div>
            <div className="rdh-pillar"><div className="rdh-pnum">03</div><h3>Your list</h3><p>Capture reader emails with newsletters and reader magnets. Own the list. Nobody can take it away.</p></div>
          </div>
        </div>
      </section>

      {/* ── Comparison ────────────────────────────── */}
      <section className="rdh-cmp">
        <div className="rdh-container">
          <div className="rdh-cmp-head">
            <p className="rdh-eyebrow">The difference</p>
            <h2>What changes when you own it.</h2>
          </div>
          <div className="rdh-ctable">
            <div className="rdh-ch rdh-ch-old">The old way</div>
            <div className="rdh-ch rdh-ch-new">With AuthorLoft</div>
            <div className="rdh-cc rdh-cc-old"><div className="rdh-clabel">Your revenue</div><div className="rdh-cval">Retailers take their cut — you see 30–70%</div></div>
            <div className="rdh-cc rdh-cc-new"><div className="rdh-clabel">Your revenue</div><div className="rdh-cval"><strong style={{ color: '#c9a84c' }}>You keep 100%</strong> of every direct sale</div></div>
            <div className="rdh-cc rdh-cc-old"><div className="rdh-clabel">Your readers</div><div className="rdh-cval">Their platform, their email list, their rules</div></div>
            <div className="rdh-cc rdh-cc-new"><div className="rdh-clabel">Your readers</div><div className="rdh-cval"><strong style={{ color: '#c9a84c' }}>Your list, always.</strong> Nobody can take it.</div></div>
          </div>
        </div>
      </section>

      {/* ── Demo Sites (dynamic) ──────────────────── */}
      <section className="rdh-demo">
        <div className="rdh-container">
          <p className="rdh-eyebrow">Live author sites</p>
          <h2>Built by real authors.<br />No designers. No developers.</h2>
          <p className="rdh-demo-sub">Every site below went live using AuthorLoft — in under an hour.</p>
          <div className="rdh-demo-grid">
            {demoAuthors.map((a) => (
              <a key={a.name} href={a.url} className="rdh-dcard" target="_blank" rel="noopener noreferrer">
                <div className="rdh-dimg">{a.name}</div>
                <div className="rdh-dbody">
                  <div className="rdh-dname">{a.name}</div>
                  <div className="rdh-dgenre">{a.genre}</div>
                  <div className="rdh-dlink">Visit site →</div>
                </div>
              </a>
            ))}
          </div>
          <Link href="/register" className="rdh-btn-p">Yours could be next — start free →</Link>
        </div>
      </section>

      {/* ── Testimonials (dynamic) ────────────────── */}
      <section className="rdh-testi">
        <div className="rdh-container">
          <h2>Authors who finally own their shelf.</h2>
          <div className="rdh-tgrid">
            {testimonials.map((t) => {
              const initials = t.authorName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
              return (
                <div key={t.id} className="rdh-tcard">
                  <div className="rdh-tquote">{t.quote}</div>
                  <div className="rdh-tauthor">
                    <div className="rdh-tavatar">{initials}</div>
                    <div>
                      <div className="rdh-tname">{t.authorName}</div>
                      <div className="rdh-trole">{t.authorRole}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────── */}
      <section className="rdh-nl">
        <div className="rdh-narrow">
          <p className="rdh-eyebrow">The Indie Author Playbook</p>
          <h2>Grow your readership.<br />Keep every reader.</h2>
          <p className="rdh-nl-sub">One tactic a week — direct sales, email strategy, and reader growth for independent authors. No fluff. Unsubscribe anytime.</p>
          <form className="rdh-nl-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" className="rdh-nl-input" placeholder="Your email address" aria-label="Email address" />
            <button type="submit" className="rdh-nl-submit">Subscribe →</button>
          </form>
          <p className="rdh-nl-fine">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* ── Pricing (dynamic) ─────────────────────── */}
      <section className="rdh-pricing">
        <div className="rdh-container">
          <p className="rdh-eyebrow">Pricing</p>
          <h2>Start free. Scale when you&apos;re ready.</h2>
          <p className="rdh-pricing-sub">No credit card. Upgrade when you want direct sales or a custom domain.</p>
          <div className="rdh-pgrid">
            {plans.map((plan) => {
              const isFeatured = plan.featuredLabel !== null || plan.tier === 'STANDARD';
              const price = formatPrice(plan.monthlyPriceCents);
              const features = buildFeatures(plan);
              return (
                <div key={plan.id} className={`rdh-pc ${isFeatured ? 'rdh-pc-feat' : ''}`}>
                  {isFeatured && <div className="rdh-pbadge">{plan.featuredLabel || 'Most popular'}</div>}
                  <div className="rdh-ptier">{plan.name}</div>
                  <div className="rdh-pprice">{price}<span>/mo</span></div>
                  <div className="rdh-pdesc">{plan.description || ''}</div>
                  <ul className="rdh-pfeats">
                    {features.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                  <Link href="/register" className={`rdh-pbtn ${isFeatured ? 'rdh-pbtn-p' : 'rdh-pbtn-g'}`}>
                    {plan.tier === 'FREE' ? 'Start free →' : `Start free — ${plan.name} →`}
                  </Link>
                </div>
              );
            })}
          </div>
          <p className="rdh-pricing-note">
            Stripe fees apply to direct sales &middot; 30-day money-back &middot; <Link href="/pricing">Full plan comparison →</Link>
          </p>
        </div>
      </section>

      {/* ── Footer CTA ────────────────────────────── */}
      <section className="rdh-fcta">
        <div className="rdh-narrow">
          <h2>Your readers<br />are waiting.</h2>
          <p>Every sale through a middleman is a reader you&apos;ll never reach again. Start free today and own everything you build.</p>
          <div className="rdh-fcta-actions">
            <Link href="/register" className="rdh-btn-p">Start your business — free →</Link>
            <Link href="/bookstore" className="rdh-btn-g">Browse the bookstore</Link>
          </div>
          <p className="rdh-fcta-note">No credit card. No lock-in. No middleman.</p>
        </div>
      </section>

    </div>
  );
}
// redeploy trigger
