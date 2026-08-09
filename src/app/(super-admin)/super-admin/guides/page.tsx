import { prisma } from "@/lib/db";
import { GuidesClient } from "@/components/super-admin/guides-client";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function SuperAdminGuidesPage() {
  const guides = await prisma.guide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true, title: true, slug: true, category: true, isPublished: true,
      publishedAt: true, sortOrder: true, createdAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guides</h1>
          <p className="text-sm text-gray-500 mt-1">
            Evergreen pillar pages for topical authority and AI search discoverability. Published guides appear at /guides/[slug].
          </p>
        </div>
        <Link
          href="/super-admin/guides/new"
          className="inline-flex items-center gap-2 rounded font-medium h-10 px-5 text-sm bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />New Guide
        </Link>
      </div>
      <GuidesClient initialGuides={guides as any} />
    </div>
  );
}
