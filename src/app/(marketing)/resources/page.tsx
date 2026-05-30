import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata: Metadata = {
  title: "Resources for Independent Authors | AuthorLoft",
  description:
    "A curated list of trusted tools, communities, and organisations that every independent author should know about.",
  alternates: { canonical: "/resources" },
};

// ── Resource data ─────────────────────────────────────────────────────────────
// logoUrl: add a URL to show an organisation logo image.
//          Leave as "" to show the initials avatar instead.
// isPartner: set to true once cross-promotion is confirmed — shows gold badge.

type Resource = {
  name:        string;
  category:    string;
  description: string;
  url:         string;
  isPartner:   boolean;
  initials:    string;
  color:       string;
  logoUrl:     string;
};

const RESOURCES: Resource[] = [
  {
    name:        "Alliance of Independent Authors",
    category:    "Community & Advocacy",
    description: "The world's leading professional organisation for self-published authors — vetted service ratings, legal guidance, and a global indie author community.",
    url:         "https://www.allianceindependentauthors.org",
    isPartner:   false,
    initials:    "ALLi",
    color:       "#1B2B47",
    logoUrl:     "",
  },
  {
    name:        "Reedsy",
    category:    "Publishing Tools",
    description: "A marketplace connecting authors with professional editors, designers, and marketers. Also offers free courses, a manuscript formatter, and an active community.",
    url:         "https://reedsy.com",
    isPartner:   false,
    initials:    "Re",
    color:       "#C26A4A",
    logoUrl:     "",
  },
  {
    name:        "Jane Friedman",
    category:    "Education & Advice",
    description: "One of the most respected voices in publishing. Jane's blog covers every aspect of the author career — from querying agents to building a direct-to-reader business.",
    url:         "https://www.janefriedman.com",
    isPartner:   false,
    initials:    "JF",
    color:       "#27406B",
    logoUrl:     "",
  },
  {
    name:        "The Creative Penn",
    category:    "Education & Advice",
    description: "Joanna Penn's podcast and blog are essential for any indie author. Covers writing, publishing, marketing, and building a sustainable author business.",
    url:         "https://www.thecreativepenn.com",
    isPartner:   false,
    initials:    "CP",
    color:       "#3A5577",
    logoUrl:     "",
  },
  {
    name:        "Kindlepreneur",
    category:    "Marketing & Discovery",
    description: "The go-to resource for book marketing, Amazon optimisation, and self-publishing strategy. Practical, data-driven advice from Dave Chesson.",
    url:         "https://kindlepreneur.com",
    isPartner:   false,
    initials:    "Kp",
    color:       "#0F1A2D",
    logoUrl:     "",
  },
  {
    name:        "Written Word Media",
    category:    "Marketing & Discovery",
    description: "Connects authors with over 500,000 eager readers through book promotions including Freebooksy, Bargain Booksy, and RedFeather Romance.",
    url:         "https://www.writtenwordmedia.com",
    isPartner:   false,
    initials:    "WW",
    color:       "#2A3A55",
    logoUrl:     "",
  },
];

// ── Colours ───────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<string, { accent: string; label: string }> = {
  "Community & Advocacy":  { accent: "#D4AE6A", label: "Community" },
  "Publishing Tools":      { accent: "#C26A4A", label: "Tools" },
  "Education & Advice":    { accent: "#7BAFD4", label: "Education" },
  "Marketing & Discovery": { accent: "#A8C5A0", label: "Marketing" },
};

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl:    '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper:   '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const categories = [...new Set(RESOURCES.map((r) => r.category))];
  const partnerCount = RESOURCES.filter((r) => r.isPartner).length;

  return (
    <div style={{ minHeight: '100vh', background: ML.midnight }}>
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(160deg, #1B2B47 0%, #0F1A2D 100%)`, padding: '100px 60px 80px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 20 }}>
            · Curated Resources ·
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.03em', color: ML.bone, margin: '0 0 24px' }}>
            Tools &amp; communities<br />
            <span style={{ fontStyle: 'italic', color: ML.brass2 }}>every author should know.</span>
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.65, color: `${ML.bone}99`, maxWidth: 560, margin: '0 auto 32px' }}>
            A hand-picked list of trusted organisations, tools, and educators that help independent authors build sustainable careers.
          </p>
          {/* Stats strip */}
          <div style={{ display: 'inline-flex', gap: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '12px 32px' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass2 }}>
              {RESOURCES.length} resources
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass2 }}>
              {categories.length} categories
            </span>
            {partnerCount > 0 && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass2 }}>
                  {partnerCount} featured {partnerCount === 1 ? 'partner' : 'partners'}
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Resources by category ─────────────────────────────────────── */}
      <section style={{ padding: '72px 60px', maxWidth: 1200, margin: '0 auto' }}>
        {categories.map((category) => {
          const items   = RESOURCES.filter((r) => r.category === category);
          const catMeta = CATEGORY_META[category] ?? { accent: ML.brass2, label: category };

          return (
            <div key={category} style={{ marginBottom: 72 }}>
              {/* Category divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: catMeta.accent, flexShrink: 0 }} />
                <h2 style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: catMeta.accent, margin: 0 }}>
                  {category}
                </h2>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                {items.map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card"
                    style={{
                      display:        'flex',
                      flexDirection:  'column',
                      justifyContent: 'space-between',
                      background:     'rgba(255,255,255,0.04)',
                      border:         '1px solid rgba(255,255,255,0.09)',
                      borderRadius:   18,
                      padding:        '24px',
                      textDecoration: 'none',
                      transition:     'transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s',
                      position:       'relative',
                      overflow:       'hidden',
                      minHeight:      160,
                    }}
                  >
                    {/* Partner badge */}
                    {resource.isPartner && (
                      <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 5, background: `${ML.brass}25`, border: `1px solid ${ML.brass}50`, borderRadius: 999, padding: '4px 10px' }}>
                        <Star style={{ width: 10, height: 10, color: ML.brass2, fill: ML.brass2 }} />
                        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ML.brass2, fontWeight: 700 }}>
                          Featured Partner
                        </span>
                      </div>
                    )}

                    {/* Top: logo + name */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                      {/* Logo or initials */}
                      <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: 14, background: resource.logoUrl ? 'rgba(255,255,255,0.08)' : resource.color, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        {resource.logoUrl ? (
                          <Image
                            src={resource.logoUrl}
                            alt={resource.name}
                            width={52}
                            height={52}
                            style={{ objectFit: 'contain', padding: 6 }}
                          />
                        ) : (
                          <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: resource.initials.length > 2 ? 12 : 16, fontWeight: 600, color: ML.bone, letterSpacing: '-0.01em' }}>
                            {resource.initials}
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div style={{ flex: 1, paddingTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 17, fontWeight: 400, color: ML.bone, margin: 0, lineHeight: 1.3 }}>
                            {resource.name}
                          </p>
                          <ArrowUpRight style={{ width: 14, height: 14, color: catMeta.accent, flexShrink: 0 }} />
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: `${ML.bone}99`, margin: '0 0 20px', flex: 1 }}>
                      {resource.description}
                    </p>

                    {/* Footer: category chip + visit label */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: catMeta.accent, background: `${catMeta.accent}18`, border: `1px solid ${catMeta.accent}30`, borderRadius: 999, padding: '3px 10px' }}>
                        {catMeta.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.08em', color: `${ML.bone}55` }}>
                        Visit →
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Become a partner CTA ──────────────────────────────────────── */}
      <section style={{ margin: '0 60px 80px', borderRadius: 24, background: `linear-gradient(135deg, #1B2B47 0%, #27406B 100%)`, border: '1px solid rgba(212,174,106,0.2)', padding: '72px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 16 }}>
            · Work with us ·
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 20px' }}>
            Serve independent authors?<br />
            <span style={{ fontStyle: 'italic', color: ML.brass2 }}>Let&apos;s work together.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, lineHeight: 1.7, color: `${ML.bone}cc`, margin: '0 0 32px' }}>
            We are open to cross-promotional partnerships with organisations and tools that genuinely help indie authors. Featured partners are listed here with their logo, promoted to our growing author community, and highlighted across our platform.
          </p>
          <a
            href="mailto:hello@authorloft.com?subject=Partnership%20inquiry%20—%20AuthorLoft%20Resources"
            className="partner-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', background: ML.brass, color: ML.midnight, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, borderRadius: 999, textDecoration: 'none', boxShadow: '0 10px 30px -8px rgba(184,137,61,0.7)', transition: 'transform 0.2s, box-shadow 0.2s' }}
          >
            Get in touch →
          </a>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: `${ML.bone}44`, marginTop: 16, letterSpacing: '0.06em' }}>
            hello@authorloft.com
          </p>
        </div>
      </section>

      {/* ── Footer strip ─────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 60px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Resources listed here are editorially selected. AuthorLoft is not compensated for standard listings.
          &nbsp;·&nbsp;
          <Link href="/" style={{ color: ML.brass2, textDecoration: 'none' }}>Back to AuthorLoft →</Link>
        </p>
      </div>

      <style>{`
        .resource-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          border-color: rgba(212,174,106,0.3) !important;
          background: rgba(255,255,255,0.07) !important;
        }
        .partner-cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px -8px rgba(184,137,61,0.8) !important;
        }
      `}</style>
    </div>
  );
}
