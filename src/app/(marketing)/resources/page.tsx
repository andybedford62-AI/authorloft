import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";

export const metadata: Metadata = {
  title: "Resources for Independent Authors | AuthorLoft",
  description:
    "A curated list of trusted tools, communities, and organisations that every independent author should know about.",
  alternates: { canonical: "/resources" },
};

// ── Resource data ─────────────────────────────────────────────────────────────
// To add or update entries, edit the RESOURCES array below.
// Set isPartner: true to show the gold "Partner" badge.

type Resource = {
  name:        string;
  category:    string;
  description: string;
  url:         string;
  isPartner:   boolean;
  initials:    string;   // shown when no logo is available
  color:       string;   // avatar background colour
};

const RESOURCES: Resource[] = [
  {
    name:        "Alliance of Independent Authors",
    category:    "Community & Advocacy",
    description: "The world's leading professional organisation for self-published authors. Provides vetted service ratings, legal guidance, and a global community of indie authors.",
    url:         "https://www.allianceindependentauthors.org",
    isPartner:   false,
    initials:    "ALLi",
    color:       "#1B2B47",
  },
  {
    name:        "Reedsy",
    category:    "Publishing Tools",
    description: "A marketplace connecting authors with professional editors, designers, and marketers. Also offers free courses, a manuscript formatter, and an active author community.",
    url:         "https://reedsy.com",
    isPartner:   false,
    initials:    "Re",
    color:       "#C26A4A",
  },
  {
    name:        "Jane Friedman",
    category:    "Education & Advice",
    description: "One of the most respected voices in publishing. Jane's blog covers every aspect of the author career — from querying agents to building a direct-to-reader business.",
    url:         "https://www.janefriedman.com",
    isPartner:   false,
    initials:    "JF",
    color:       "#27406B",
  },
  {
    name:        "The Creative Penn",
    category:    "Education & Advice",
    description: "Joanna Penn's podcast and blog are essential listening for any indie author. Covers writing, publishing, marketing, and building a sustainable author business.",
    url:         "https://www.thecreativepenn.com",
    isPartner:   false,
    initials:    "CP",
    color:       "#3A5577",
  },
  {
    name:        "Kindlepreneur",
    category:    "Marketing & Discovery",
    description: "Dave Chesson's site is the go-to resource for book marketing, Amazon optimisation, and self-publishing strategy. Practical, data-driven advice for indie authors.",
    url:         "https://kindlepreneur.com",
    isPartner:   false,
    initials:    "Kp",
    color:       "#0F1A2D",
  },
  {
    name:        "Written Word Media",
    category:    "Marketing & Discovery",
    description: "Connects authors with over 500,000 eager readers through book promotion services including Freebooksy, Bargain Booksy, and RedFeather Romance.",
    url:         "https://www.writtenwordmedia.com",
    isPartner:   false,
    initials:    "WW",
    color:       "#2A3A55",
  },
];

// ── Category colours ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  "Community & Advocacy":  { bg: "#1B2B4715", text: "#1B2B47" },
  "Publishing Tools":      { bg: "#C26A4A15", text: "#C26A4A" },
  "Education & Advice":    { bg: "#27406B15", text: "#27406B" },
  "Marketing & Discovery": { bg: "#B8893D15", text: "#B8893D" },
};

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl:    '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper:   '#C26A4A', slate: '#5C6E89', mist: '#D4DDEB',
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ResourcesPage() {
  const categories = [...new Set(RESOURCES.map((r) => r.category))];

  return (
    <div style={{ minHeight: '100vh', background: ML.pearl }}>
      <MarketingNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section style={{ background: ML.ink, padding: '100px 60px 80px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 20 }}>
            · Resources ·
          </p>
          <h1 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(40px, 6vw, 80px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.03em', color: ML.bone, margin: '0 0 24px' }}>
            Tools &amp; communities<br />
            <span style={{ fontStyle: 'italic', color: ML.brass2 }}>every author should know.</span>
          </h1>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, lineHeight: 1.65, color: `${ML.bone}bb`, maxWidth: 560, margin: '0 auto' }}>
            A hand-picked list of trusted organisations, tools, and educators that help independent authors build sustainable careers.
          </p>
        </div>
      </section>

      {/* ── Resources by category ─────────────────────────────────────── */}
      <section style={{ padding: '80px 60px', maxWidth: 1100, margin: '0 auto' }}>
        {categories.map((category) => {
          const items = RESOURCES.filter((r) => r.category === category);
          const catStyle = CATEGORY_COLORS[category] ?? { bg: '#1B2B4715', text: '#1B2B47' };

          return (
            <div key={category} style={{ marginBottom: 64 }}>
              {/* Category heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 16, borderBottom: `1px solid #DCDBD3` }}>
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', background: catStyle.bg, color: catStyle.text, padding: '4px 12px', borderRadius: 999, fontWeight: 600 }}>
                  {category}
                </span>
                <span style={{ fontSize: 12, color: ML.slate }}>{items.length} {items.length === 1 ? 'resource' : 'resources'}</span>
              </div>

              {/* Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {items.map((resource) => (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="resource-card"
                    style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, background: ML.bone, border: '1px solid #DCDBD3', borderRadius: 16, padding: '22px 20px', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', position: 'relative' }}
                  >
                    {/* Partner badge */}
                    {resource.isPartner && (
                      <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', alignItems: 'center', gap: 4, background: `${ML.brass}18`, border: `1px solid ${ML.brass}40`, borderRadius: 999, padding: '3px 9px' }}>
                        <Star style={{ width: 10, height: 10, color: ML.brass, fill: ML.brass }} />
                        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ML.brass, fontWeight: 700 }}>Partner</span>
                      </div>
                    )}

                    {/* Avatar */}
                    <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 10, background: resource.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: resource.initials.length > 2 ? 11 : 15, fontWeight: 600, color: ML.bone, letterSpacing: '-0.01em' }}>
                        {resource.initials}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 16, fontWeight: 400, color: ML.ink, margin: 0, lineHeight: 1.25 }}>
                          {resource.name}
                        </p>
                        <ArrowUpRight style={{ width: 14, height: 14, color: ML.slate, flexShrink: 0 }} />
                      </div>
                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: ML.slate, margin: 0 }}>
                        {resource.description}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Become a partner CTA ──────────────────────────────────────── */}
      <section style={{ background: ML.ink, padding: '80px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 16 }}>
            · Work with us ·
          </p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 20px' }}>
            Serve independent authors?<br />
            <span style={{ fontStyle: 'italic', color: ML.brass2 }}>Let&apos;s work together.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, lineHeight: 1.65, color: `${ML.bone}bb`, margin: '0 0 32px' }}>
            We are always open to cross-promotional partnerships with organisations and tools that genuinely help indie authors. Featured partners are listed here and promoted to our growing author community.
          </p>
          <a
            href="mailto:hello@authorloft.com?subject=Partnership inquiry"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: ML.brass, color: ML.midnight, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, borderRadius: 999, textDecoration: 'none', boxShadow: '0 8px 24px -8px rgba(184,137,61,0.6)' }}
          >
            Get in touch →
          </a>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 13, color: `${ML.bone}55`, marginTop: 16 }}>
            hello@authorloft.com
          </p>
        </div>
      </section>

      {/* ── Footer note ───────────────────────────────────────────────── */}
      <div style={{ background: ML.pearl, padding: '24px 60px', textAlign: 'center', borderTop: '1px solid #DCDBD3' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: ML.slate, margin: 0 }}>
          Resources listed here are editorially selected. AuthorLoft is not compensated for standard listings. &nbsp;·&nbsp;{' '}
          <Link href="/" style={{ color: ML.brass, textDecoration: 'none' }}>Back to AuthorLoft →</Link>
        </p>
      </div>

      <style>{`
        .resource-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
          border-color: #C26A4A55 !important;
        }
      `}</style>
    </div>
  );
}
