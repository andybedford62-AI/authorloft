import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { SeoAuditShell } from "./seo-audit-shell";
import { getAdminAuthorId } from "@/lib/admin-auth";

export default async function SeoAuditPage() {
  const authorId = await getAdminAuthorId();

  const author = await prisma.author.findUnique({
    where:  { id: authorId },
    select: {
      plan:          { select: { tier: true } },
      aiApiKey:      true,
      aiUsageCount:  true,
      aiUsageCap:    true,
      books: {
        select: { id: true, title: true, slug: true, description: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const tier = author?.plan?.tier ?? "FREE";
  if (tier !== "PREMIUM") redirect("/admin/dashboard");

  const hasOwnKey  = !!author?.aiApiKey;
  const usageCount = author?.aiUsageCount ?? 0;
  const usageCap   = author?.aiUsageCap   ?? 20;
  const atLimit    = !hasOwnKey && usageCount >= usageCap;
  const books      = author?.books ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Audit</h1>
          <p className="text-sm text-gray-500 mt-1">
            AI-powered SEO tools to improve discoverability of your author pages and book listings.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
          Powered by Gemini
        </span>
      </div>

      <SeoAuditShell
        books={books}
        hasOwnKey={hasOwnKey}
        usageCount={usageCount}
        usageCap={usageCap}
        atLimit={atLimit}
      />
    </div>
  );
}
