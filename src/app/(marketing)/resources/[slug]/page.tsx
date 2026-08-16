import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileDown, ArrowLeft } from "lucide-react";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingPageHeader } from "@/components/marketing/marketing-page-header";
import { DownloadButton } from "@/components/marketing/download-button";
import { prisma } from "@/lib/db";
import { sanitize } from "@/lib/sanitize";

export const revalidate = 60;

const BASE = `https://www.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? "authorloft.com"}`;

const VAULT = {
  bg: "#16233d", surf2: "#243756", ink: "#f3ecdb", mute: "#93a0bc", gold: "#d6a94a",
};

async function getDownload(slug: string) {
  return prisma.resourceDownload.findFirst({
    where: { slug, isPublished: true },
    select: {
      id: true, title: true, slug: true, description: true,
      body: true, category: true, coverImageUrl: true, requiresEmail: true,
      downloadCount: true, publishedAt: true,
    },
  }).catch(() => null);
}

export async function generateStaticParams() {
  const downloads = await prisma.resourceDownload.findMany({
    where: { isPublished: true },
    select: { slug: true },
  }).catch(() => []);
  return downloads.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDownload(slug);
  if (!d) return { title: "Resource Not Found" };
  return {
    title: `${d.title} — Free Download | AuthorLoft Resources`,
    description: d.description ?? `Download ${d.title} for free from AuthorLoft.`,
    alternates: { canonical: `/resources/${d.slug}` },
    openGraph: {
      type: "article",
      title: d.title,
      description: d.description ?? undefined,
      ...(d.coverImageUrl ? { images: [{ url: d.coverImageUrl, width: 1200, height: 630, alt: d.title }] } : {}),
    },
  };
}

export default async function ResourceDownloadPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const d = await getDownload(slug);
  if (!d) notFound();

  const bodyHtml = d.body ? sanitize(d.body) : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${BASE}/resources` },
      { "@type": "ListItem", position: 3, name: d.title, item: `${BASE}/resources/${d.slug}` },
    ],
  };

  return (
    <div style={{ minHeight: "100vh", background: VAULT.bg }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <MarketingNav />

      <MarketingPageHeader
        eyebrow="Free Download"
        title={<span style={{ color: VAULT.ink }}>{d.title}</span>}
        subtitle={d.description ?? ""}
        backgroundImage="/resources-header.png"
      />

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "56px 24px 96px" }}>
        {/* Back link */}
        <Link
          href="/resources"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, letterSpacing: "0.08em", color: VAULT.gold, textDecoration: "none", marginBottom: 40 }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to Resources
        </Link>

        {/* Card */}
        <div style={{ background: VAULT.surf2, borderRadius: 24, overflow: "hidden", border: "1px solid rgba(243,236,219,0.12)" }}>
          {/* Cover */}
          {d.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.coverImageUrl}
              alt={d.title}
              style={{ width: "100%", maxHeight: 340, objectFit: "contain", background: VAULT.bg, display: "block" }}
            />
          ) : (
            <div style={{ width: "100%", height: 120, background: `${VAULT.gold}14`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileDown style={{ width: 36, height: 36, color: VAULT.gold }} />
            </div>
          )}

          <div style={{ padding: "36px 40px 40px" }}>
            <p style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: VAULT.gold, marginBottom: 10 }}>
              · Free Download ·
            </p>
            <h1 style={{ fontFamily: "var(--font-heading, serif)", fontStyle: "italic", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: VAULT.ink, lineHeight: 1.15, margin: "0 0 16px" }}>
              {d.title}
            </h1>
            {d.description && (
              <p style={{ fontFamily: "Georgia, serif", fontSize: 16, lineHeight: 1.7, color: VAULT.mute, margin: "0 0 28px" }}>
                {d.description}
              </p>
            )}

            <DownloadButton
              id={d.id}
              title={d.title}
              requiresEmail={d.requiresEmail}
              className="inline-flex items-center justify-center gap-2 bg-[#d6a94a] text-[#16233d] text-sm font-semibold px-6 py-3 rounded-[6px] hover:bg-[#e2bc6e] transition-colors"
            />

            {/* Body content */}
            {bodyHtml && (
              <div
                className="rich-content"
                style={{ marginTop: 40, paddingTop: 36, borderTop: "1px solid rgba(243,236,219,0.12)", fontFamily: "Georgia, serif", fontSize: 15, lineHeight: 1.75, color: VAULT.mute }}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />
            )}
          </div>
        </div>

        {/* Back to resources */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <Link
            href="/resources"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, letterSpacing: "0.08em", color: VAULT.gold, textDecoration: "none" }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            View all resources
          </Link>
        </div>
      </div>
    </div>
  );
}
