import type { Metadata } from "next";
import { getOgImage } from "@/lib/seo-config";
import Link from "next/link";
import { FileDown } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { DownloadButton } from "@/components/marketing/download-button";
import { ResourcesToolsSection } from "@/components/marketing/resources-tools-section";
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

const VAULT = {
  bg: "#16233d", surf: "#1e2f4d", surf2: "#243756",
  ink: "#f3ecdb", mute: "#93a0bc", gold: "#d6a94a",
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
    <div style={{ minHeight: '100vh', background: VAULT.bg }}>
      <MarketingNav />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <MarketingPageHeader
        eyebrow="Curated Resources"
        title={<>Tools &amp; communities <span className="italic text-[#d6a94a]">every author should know</span></>}
        subtitle="A hand-picked list of trusted organisations, tools, and educators that help independent authors build sustainable careers."
        backgroundImage="/resources-header.png"
      />
      <div style={{ background: VAULT.bg, padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ display: 'inline-flex', gap: 32, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, padding: '12px 32px' }}>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: VAULT.gold }}>{resources.length} resources</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: VAULT.gold }}>{categories.length} categories</span>
            {partnerCount > 0 && (
              <>
                <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
                <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 12, color: VAULT.gold }}>
                  {partnerCount} featured {partnerCount === 1 ? 'partner' : 'partners'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Free Downloads (email-gated) ──────────────────────────────── */}
      {downloadGroups.length > 0 && (
        <section style={{ background: VAULT.bg, padding: '64px 60px 0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 12 }}>· Free Downloads ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 400, lineHeight: 1.05, color: VAULT.ink, margin: 0 }}>
                Checklists, guides &amp; templates<br /><span style={{ fontStyle: 'italic', color: VAULT.gold }}>to grow your author business</span>
              </h2>
            </div>

            {downloadGroups.map((group) => (
              <div key={group.slug} style={{ marginBottom: 56 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VAULT.gold, margin: 0 }}>{group.name}</h3>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{group.items.length}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: 16 }}>
                  {group.items.map((d) => (
                    <div key={d.id} style={{ display: 'flex', flexDirection: 'column', background: VAULT.surf2, border: '1px solid rgba(243,236,219,0.12)', borderRadius: 18, overflow: 'hidden' }}>
                      <Link href={`/resources/${d.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                        {d.coverImageUrl ? (
                          <div style={{ width: '100%', height: 160, background: VAULT.surf }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={d.coverImageUrl} alt={d.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{ width: '100%', height: 84, background: `${VAULT.gold}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileDown style={{ width: 26, height: 26, color: VAULT.gold }} />
                          </div>
                        )}
                        <div style={{ padding: '18px 20px 12px' }}>
                          <p style={{ fontFamily: 'var(--font-heading, serif)', fontStyle: 'italic', fontSize: 17, fontWeight: 400, color: VAULT.ink, margin: '0 0 6px', lineHeight: 1.3 }}>{d.title}</p>
                          {d.description && (
                            <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, lineHeight: 1.6, color: VAULT.mute, margin: 0 }}>{d.description}</p>
                          )}
                        </div>
                      </Link>
                      <div style={{ padding: '0 20px 18px', marginTop: 'auto' }}>
                        <DownloadButton
                          id={d.id}
                          title={d.title}
                          requiresEmail={d.requiresEmail}
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#d6a94a] text-[#16233d] text-sm font-semibold px-4 py-2.5 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
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
      <section style={{ background: VAULT.bg, padding: '72px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {downloadGroups.length > 0 && (
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 12 }}>· Tools &amp; Communities ·</p>
              <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(28px, 3.4vw, 44px)', fontWeight: 400, lineHeight: 1.05, color: VAULT.ink, margin: 0 }}>
                Trusted partners &amp; <span style={{ fontStyle: 'italic', color: VAULT.gold }}>where to go next</span>
              </h2>
            </div>
          )}
          <ResourcesToolsSection resources={resources} categories={categories as string[]} />
        </div>
      </section>

      {/* ── Become a partner CTA ──────────────────────────────────────── */}
      <section style={{ margin: '0 60px 80px', borderRadius: 24, background: `linear-gradient(135deg, ${VAULT.surf} 0%, ${VAULT.surf2} 100%)`, border: '1px solid rgba(214,169,74,0.2)', padding: '72px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: 620, margin: '0 auto' }}>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: VAULT.gold, marginBottom: 16 }}>· Work with us ·</p>
          <h2 style={{ fontFamily: 'var(--font-heading, serif)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 400, lineHeight: 0.95, letterSpacing: '-0.025em', color: VAULT.ink, margin: '0 0 20px' }}>
            Serve independent authors?<br /><span style={{ fontStyle: 'italic', color: VAULT.gold }}>Let&apos;s work together.</span>
          </h2>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, lineHeight: 1.7, color: `${VAULT.ink}cc`, margin: '0 0 32px' }}>
            We are open to cross-promotional partnerships with organisations and tools that genuinely help indie authors. Featured partners are listed here with their logo, promoted to our growing author community, and highlighted across our platform.
          </p>
          <a href="mailto:hello@authorloft.com?subject=Partnership%20inquiry%20%E2%80%94%20AuthorLoft%20Resources"
            className="partner-cta"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '15px 36px', background: VAULT.gold, color: VAULT.bg, fontFamily: 'inherit', fontSize: 15, fontWeight: 700, borderRadius: 6, textDecoration: 'none', boxShadow: '0 10px 30px -8px rgba(214,169,74,0.7)' }}>
            Get in touch →
          </a>
          <p style={{ fontFamily: 'var(--font-geist-mono, monospace)', fontSize: 11, color: `${VAULT.ink}44`, marginTop: 16, letterSpacing: '0.06em' }}>hello@authorloft.com</p>
        </div>
      </section>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 60px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
          Resources listed here are editorially selected. AuthorLoft is not compensated for standard listings.
          &nbsp;·&nbsp;
          <Link href="/" style={{ color: VAULT.gold, textDecoration: 'none' }}>Back to AuthorLoft →</Link>
        </p>
      </div>

      <style>{`
        .resource-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.35); border-color: #d6a94a88 !important; }
        .partner-cta:hover   { transform: translateY(-2px); box-shadow: 0 14px 36px -8px rgba(214,169,74,0.8) !important; }
      `}</style>
    </div>
  );
}
