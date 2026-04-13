import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { FileText } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ domain: string; pageSlug: string }>;
}

async function resolveAuthorAndPage(domain: string, pageSlug: string) {
  try {
    // Layout already validates isActive — no need to recheck here
    const author = await prisma.author.findFirst({
      where: {
        OR: [{ slug: domain }, { customDomain: domain }],
      },
      select: { id: true, name: true, displayName: true, accentColor: true },
    });

    if (!author) return null;

    const page = await prisma.authorPage.findFirst({
      where: {
        authorId: author.id,
        slug: pageSlug,
      },
      select: {
        id: true,
        title: true,
        content: true,
        isVisible: true,
        slug: true,
      },
    });

    if (!page || !page.isVisible) return null;
    return { author, page };
  } catch (err) {
    console.error("[CustomPage] error:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain, pageSlug } = await params;
  const result = await resolveAuthorAndPage(domain, pageSlug);
  if (!result) return { title: "Page Not Found" };
  const { author, page } = result;
  return {
    title: page.title,
    description: `${page.title} — ${author.displayName || author.name}`,
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { domain, pageSlug } = await params;
  const result = await resolveAuthorAndPage(domain, pageSlug);
  if (!result) notFound();

  const { author, page } = result;

  return (
    <div className="min-h-screen bg-white" style={{ "--accent": author.accentColor } as React.CSSProperties}>

      {/* ── Page Banner ──────────────────────────────────────────────────── */}
      <section className="w-full py-12 px-4" style={{ backgroundColor: author.accentColor }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6 text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
              {author.displayName || author.name}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">{page.title}</h1>
        </div>
      </section>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        {page.content ? (
          <div
            className="rich-content"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <p className="text-gray-400 italic text-sm">This page has no content yet.</p>
        )}
      </div>
    </div>
  );
}
