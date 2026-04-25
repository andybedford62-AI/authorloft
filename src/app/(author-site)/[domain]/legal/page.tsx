import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { sanitize } from "@/lib/sanitize";

async function getAuthorLegal(domain: string) {
  return prisma.author.findFirst({
    where: {
      OR: [{ slug: domain }, { customDomain: domain }],
      isActive: true,
    },
    select: {
      name: true,
      displayName: true,
      legalNotice: true,
      legalNoticeUpdatedAt: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const author = await getAuthorLegal(domain);
  if (!author) return { title: "Not Found" };
  const authorName = author.displayName || author.name;
  return {
    title: "Legal Notice",
    description: `Legal notice and disclaimer for ${authorName}'s author website.`,
  };
}

// Minimal Markdown → HTML renderer (bold, italic, headings, paragraphs)
function renderMarkdown(text: string): string {
  return text
    // Headings
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Blank lines → paragraph breaks
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("<h")) return trimmed;
      return `<p>${trimmed.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const author = await getAuthorLegal(domain);
  if (!author) notFound();

  const authorName = author.displayName || author.name;

  if (!author.legalNotice) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Legal Notice</h1>
        <p className="text-gray-500">
          No legal notice has been published yet for this site.
        </p>
      </div>
    );
  }

  const html = renderMarkdown(author.legalNotice);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Page header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">Legal Notice</h1>
        <p className="text-sm text-gray-500 mt-2">{authorName}</p>
        {author.legalNoticeUpdatedAt && (
          <p className="text-xs text-gray-400 mt-1">
            Last updated:{" "}
            {new Date(author.legalNoticeUpdatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      {/* Content */}
      <div
        className="prose prose-gray max-w-none text-sm leading-relaxed
          prose-headings:font-semibold prose-headings:text-gray-900
          prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-2
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-1
          prose-p:text-gray-700 prose-p:my-2"
        dangerouslySetInnerHTML={{ __html: sanitize(html) }}
      />
    </div>
  );
}
