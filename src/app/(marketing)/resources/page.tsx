import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star, FileDown } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { DownloadButton } from "@/components/marketing/download-button";
import { prisma } from "@/lib/db";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage("resources");
  return {
    title: "Resources for Independent Authors",
    description:
      "A curated list of trusted tools, communities, and organisations that every independent author should know about.",
    alternates: { canonical: "/resources" },
    openGraph: {
      type:        "website",
      title:       "Resources for Independent Authors | AuthorLoft",
      description: "A curated list of trusted tools, communities, and organisations that every independent author should know about.",
      images:      [{ url: ogImage, width: 1200, height: 630, alt: "AuthorLoft Resources" }],
    },
    twitter: {
      card:        "summary_large_image",
      title:       "Resources for Independent Authors | AuthorLoft",
      description: "A curated list of trusted tools, communities, and organisations that every independent author should know about.",
      images:      [ogImage],
    },
  };
}

const CATEGORY_META: Record<string, { accent: string; label: string }> = {
  "Community & Advocacy":  { accent: "#D4AE6A", label: "Community" },
  "Publishing Tools":      { accent: "#C26A4A", label: "Tools" },
  "Education & Advice":    { accent: "#7BAFD4", label: "Education" },
  "Marketing & Discovery": { accent: "#A8C5A0", label: "Marketing" },
};
function catMeta(category: string) {
  return CATEGORY_META[category] ?? { accent: "#D4AE6A", label: category };
}

const ML = {
  midnight: '#0F1A2D', ink: '#1B2B47', bone: '#E8E5DD',
  pearl:    '#F0EDE4', brass: '#B8893D', brass2: '#D4AE6A',
  copper:   '#C26A4A', slate: '#5C6E89',
};

export default async function ResourcesPage() {
  const [resources, downloads, downloadCats] = await Promise.all([
    prisma.platformResource.findMany({
      where:   { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }).catch(() => []),
    prisma.resourceDownload.findMany({
      where:   { isPublished: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      select:  { id: true, title: true, slug: true, description: true, category: true, coverImageUrl: true, requiresEmail: true },
    }).catch(() => []),
    prisma.category.findMany({
      where:   { type: "resource", isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select:  { name: true, slug: true },
    }).catch(() => []),
  ]);

  const categories = [...new Set(resources.map((r) => r.category).filter(Boolean))];
  const partnerCount = resources.filter((r) => r.isPartner).length;

  // Group published downloads by resource category (ordered), unknown → end.
  const downloadCatName = new Map(downloadCats.map((c) => [c.slug, c.name]));
  const downloadGroups = [
    ...downloadCats.map((c) => c.slug),
    ...[...new Set(downloads.map((d) => d.category))].filter((s) => !downloadCatName.has(s)),
  ]
    .map((slug) => ({
      slug,
      name: downloadCatName.get(slug) ?? slug,
      items: downloads.filter((d) => d.category === slug),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div style={{ minHeight: '100vh', background: ML.midnight }}>
      <MarketingNav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <MarketingPageHeader
        eyebrow="Curated Resources"
        title={<>Tools &amp; communities <span className="italic text-[#D4AE6A]">every author should know</span></>}
        subtitle="A hand-picked list of trusted organisations, tools, and educators that help independent authors build sustainable careers."
        backgroundImage="/resources-header.png"
      />
      <div style={{ background: ML.midnight, padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', gap: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '12px 32px' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass2 }}>{resources.length} resources</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: ML.brass2 }}>{categories.length} categories</span>
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
      </div>

      {/* ── Free Downloads (email-gated) ──────────────────────────────── */}
      {downloadGroups.length > 0 && (
        <section style={{ background: ML.midnight, padding: '64px 60px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 12 }}>· Free Downloads ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 400, lineHeight: 1.05, color: ML.bone, margin: 0 }}>
                Checklists, guides &amp; templates<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>to grow your author business</span>
              </h2>
            </div>

            {downloadGroups.map((group) => (
              <div key={group.slug} style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, margin: 0 }}>{group.name}</h3>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{group.items.length}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
                  {group.items.map((d) => (
                    <div key={d.id} style={{ display: 'flex', flexDirection: 'column', background: ML.pearl, border: '1px solid #DCDBD3', borderRadius: 18, overflow: 'hidden' }}>
                      {d.coverImageUrl ? (
                        <div style={{ width: '100%', height: 160, background: '#E8E2D5' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.coverImageUrl} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 84, background: `${ML.copper}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileDown style={{ width: 26, height: 26, color: ML.copper }} />
                        </div>
                      )}
                      <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 17, fontWeight: 400, color: ML.ink, margin: '0 0 6px', lineHeight: 1.3 }}>{d.title}</p>
                        {d.description && (
                          <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: ML.slate, margin: '0 0 16px', flex: 1 }}>{d.description}</p>
                        )}
                        <DownloadButton
                          id={d.id}
                          title={d.title}
                          requiresEmail={d.requiresEmail}
                          className="mt-auto w-full inline-flex items-center justify-center gap-2 bg-[#1B2B47] text-[#E8E5DD] text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-[#27406B] transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
        </section>
      )}

      {/* ── Resources by category ─────────────────────────────────────── */}
      <section style={{ background: ML.midnight, padding: '72px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {downloadGroups.length > 0 && (
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 12 }}>· Tools &amp; Communities ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 400, lineHeight: 1.05, color: ML.bone, margin: 0 }}>
                Trusted partners &amp; <span style={{ fontStyle: 'italic', color: ML.brass2 }}>where to go next</span>
              </h2>
            </div>
          )}
          {categories.map((category) => {
            const items = resources.filter((r) => r.category === category);
            const cm    = catMeta(category);
            return (
              <div key={category} style={{ marginBottom: 72 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: cm.accent, flexShrink: 0 }} />
                  <h2 style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: cm.accent, margin: 0 }}>{category}</h2>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{items.length}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 16 }}>
                  {items.map((resource) => (
                    <a key={resource.id} href={resource.websiteUrl} target="_blank" rel="noopener noreferrer"
                      className="resource-card"
                      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: ML.pearl, border: '1px solid #DCDBD3', borderRadius: 18, padding: '24px', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s', position: 'relative', overflow: 'hidden', minHeight: 160 }}>

                      {resource.isPartner && (
                        <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 5, background: `${ML.brass}20`, border: `1px solid ${ML.brass}50`, borderRadius: 999, padding: '4px 10px' }}>
                          <Star style={{ width: 10, height: 10, color: ML.brass, fill: ML.brass }} />
                          <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: ML.brass, fontWeight: 700 }}>Partner</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, marginBottom: 18 }}>
                        {/* Logo — increased to 80×80 for readability */}
                        <div style={{ flexShrink: 0, width: 80, height: 80, borderRadius: 16, background: resource.logoUrl ? '#fff' : resource.avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #DCDBD3' }}>
                          {resource.logoUrl ? (
                            <Image src={resource.logoUrl} alt={resource.name} width={80} height={80} style={{ objectFit: 'contain', padding: 8 }} />
                          ) : (
                            <span style={{ fontFamily: 'var(--font-heading, serif)', fontSize: (resource.initials?.length ?? 0) > 2 ? 16 : 22, fontWeight: 600, color: ML.bone }}>
                              {resource.initials || resource.name[0]}
                            </span>
                          )}
                        </div>
                        <div style={{ flex: 1, paddingTop: 6 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <p style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 18, fontWeight: 400, color: ML.ink, margin: 0, lineHeight: 1.3 }}>{resource.name}</p>
                            <ArrowUpRight style={{ width: 15, height: 15, color: ML.copper, flexShrink: 0 }} />
                          </div>
                        </div>
                      </div>

                      <p style={{ fontFamily: 'Georgia, serif', fontSize: 13.5, lineHeight: 1.65, color: ML.slate, margin: '0 0 20px', flex: 1 }}>
                        {resource.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: cm.accent, background: `${cm.accent}15`, border: `1px solid ${cm.accent}35`, borderRadius: 999, padding: '3px 10px' }}>{cm.label}</span>
                        <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, letterSpacing: '0.08em', color: ML.brass }}>Visit →</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            );
          })}

          {resources.length === 0 && (
            <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia, serif', padding: '60px 0' }}>Resources coming soon.</p>
          )}
        </div>
      </section>

      {/* ── Become a partner CTA ──────────────────────────────────────── */}
      <section style={{ margin: '0 60px 80px', borderRadius: 24, background: `linear-gradient(135deg, #1B2B47 0%, #27406B 100%)`, border: '1px solid rgba(212,174,106,0.2)', padding: '72px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: ML.brass2, marginBottom: 16 }}>· Work with us ·</p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: ML.bone, margin: '0 0 20px' }}>
            Serve independent authors?<br /><span style={{ fontStyle: 'italic', color: ML.brass2 }}>Let&apos;s work together.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, lineHeight: 1.7, color: `${ML.bone}cc`, margin: '0 0 32px' }}>
            We are open to cross-promotional partnerships with organisations and tools that genuinely help indie authors. Featured partners are listed here with their logo, promoted to our growing author community, and highlighted across our platform.
          </p>
          <a href="mailto:hello@authorloft.com?subject=Partnership%20inquiry%20%E2%80%94%20AuthorLoft%20Resources"
            className="partner-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', background: ML.brass, color: ML.midnight, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, borderRadius: 999, textDecoration: 'none', boxShadow: '0 10px 30px -8px rgba(184,137,61,0.7)' }}>
            Get in touch →
          </a>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: `${ML.bone}44`, marginTop: 16, letterSpacing: '0.06em' }}>hello@authorloft.com</p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 60px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Resources listed here are editorially selected. AuthorLoft is not compensated for standard listings.
          &nbsp;·&nbsp;
          <Link href="/" style={{ color: ML.brass2, textDecoration: 'none' }}>Back to AuthorLoft →</Link>
        </p>
      </div>

      <style>{`
        .resource-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); border-color: #C26A4A88 !important; }
        .partner-cta:hover   { transform: translateY(-2px); box-shadow: 0 14px 36px -8px rgba(184,137,61,0.8) !important; }
      `}</style>
    </div>
  );
}
